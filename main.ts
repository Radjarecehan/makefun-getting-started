// Tiny Bot: multi-asset momentum trend-follower, long only.
//
// Idea: buy-and-hold loses whenever the market drifts down, because it never
// leaves. This bot only holds an asset while its short trend points up and its
// recent momentum is positive, and it ranks the assets each bar so the limited
// slots go to the strongest trends. In a falling market it sits mostly in cash;
// in a rising market it rides the strongest names; in chop the tight stop and
// the momentum filter keep whipsaw trades small.
//
//   - Indicators, per symbol over its own closes: EMA(5) and EMA(13), each
//     seeded as the mean of its first span of closes, then moving
//     2 / (span + 1) of the way to each new close. Closes are kept (last 8)
//     for the 6-bar momentum: (close - close 6 bars ago) / close 6 bars ago.
//     Indicators read every batch, a warm-up's included; while warming up it
//     sends no order, and from the first batch after it the rules run on
//     indicators already seeded.
//   - Entry, on a bar's close (filled at the next open): EMA(5) above
//     EMA(13), the 6-bar momentum positive, and the close above EMA(13), on a
//     symbol it does not hold. A bar whose volume is 0 signals no entry.
//   - Exit, the whole position: EMA(5) crosses under EMA(13), or the position
//     worth at least 25% over its cost at the close, or at least 8% under it.
//     An exit the market refuses is sent again on the symbol's next bar while
//     its reason still holds.
//   - Slots: at most 5 open positions. Each bar the entry candidates are
//     ranked by 6-bar momentum, strongest first, and the best ones take the
//     free slots. Stake per entry: equity / 5, capped by max_weight_bps of
//     equity and by the cash this reply has not spent yet; below
//     fees.min_notional_quote_units it buys nothing.
//   - A reply carries the sells first, then the buys in momentum order, at
//     most caps.max_orders_per_bar in all. Each order caps its slippage at
//     MAX_SLIPPAGE_BPS = 100, 1% past the close it was decided on.
//   - Fully deterministic: float64 EMA/momentum on + - * / alone, no clock,
//     no environment, no randomness, so the same bars give the same orders,
//     run after run.

import { BPS, runBars, type Bar, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const FAST_BARS = 5;
const SLOW_BARS = 13;
const MOMENTUM_BARS = 6;
/** take-profit +25%: worth 5/4 of its cost. */
const TAKE = [5n, 4n] as const;
/** stop-loss -8%: worth 23/25 of its cost. */
const STOP = [23n, 25n] as const;
const MAX_POSITIONS = 5;
const MAX_SLIPPAGE_BPS = 100;

/** One EMA: the closes it has seen until it starts, then its value. */
interface Ema {
  span: number;
  warm: number[];
  value: number | null;
}

interface Series {
  fast: Ema;
  slow: Ema;
  /** Last closes, oldest first, at most MOMENTUM_BARS + 1 entries. */
  closes: number[];
  /** 6-bar momentum after this bar, null until enough closes. */
  momentum: number | null;
  /** fast - slow after the symbol's bar before this one, once both are set. */
  gap: number | null;
  /** The same after this bar. */
  now: number | null;
}

const series = new Map<string, Series>();

function step(e: Ema, close: number): void {
  if (e.value !== null) {
    e.value += (2 / (e.span + 1)) * (close - e.value);
    return;
  }
  e.warm.push(close);
  if (e.warm.length === e.span) e.value = e.warm.reduce((a, x) => a + x, 0) / e.span;
}

function push(bar: Bar): Series {
  let s = series.get(bar.symbol);
  if (s === undefined) {
    s = {
      fast: { span: FAST_BARS, warm: [], value: null },
      slow: { span: SLOW_BARS, warm: [], value: null },
      closes: [],
      momentum: null,
      gap: null,
      now: null,
    };
    series.set(bar.symbol, s);
  }
  const c = Number(bar.c);
  step(s.fast, c);
  step(s.slow, c);
  s.closes.push(c);
  if (s.closes.length > MOMENTUM_BARS + 1) s.closes.shift();
  s.momentum =
    s.closes.length === MOMENTUM_BARS + 1
      ? (c - s.closes[0]!) / s.closes[0]!
      : null;
  s.gap = s.now;
  s.now = s.fast.value !== null && s.slow.value !== null ? s.fast.value - s.slow.value : null;
  return s;
}

/** Whether a held position exits on this close: trend turned down, or its value at the take-profit or the stop-loss. */
function exits(state: BarsState, symbol: string, held: { qty: bigint; cost: bigint }, trendDown: boolean): boolean {
  if (trendDown) return true;
  const value = state.value(symbol, held.qty);
  return value * TAKE[1] >= held.cost * TAKE[0] || value * STOP[1] <= held.cost * STOP[0];
}

await runBars({
  onBatch(state, batch) {
    const candidates: { symbol: string; momentum: number }[] = [];
    const down = new Set<string>();
    for (const bar of batch.bars) {
      const s = push(bar);
      if (s.now !== null && s.gap !== null && s.now < 0 && s.gap >= 0) down.add(bar.symbol);
      if (s.now === null || s.momentum === null || bar.v === '0') continue;
      if (s.fast.value === null || s.slow.value === null) continue;
      const close = Number(bar.c);
      if (s.now > 0 && s.momentum > 0 && close > s.slow.value) {
        candidates.push({ symbol: bar.symbol, momentum: s.momentum });
      }
    }
    if (state.warmingUp) return [];
    const { caps, fees } = state.hello;
    const sells: SellInput[] = [];
    const heldCount = state.positions.size;
    for (const { symbol } of state.hello.symbols) {
      const held = state.positions.get(symbol);
      if (held !== undefined && exits(state, symbol, held, down.has(symbol))) {
        sells.push({ side: 'sell', symbol, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS });
      }
    }

    const orders: (SellInput | BuyInput)[] = sells.slice(0, caps.max_orders_per_bar);
    const slots = Math.min(MAX_POSITIONS, caps.max_open_positions);
    const stake = state.equity / BigInt(slots);
    const byWeight = (BigInt(caps.max_weight_bps) * state.equity) / BPS;
    let room = slots - heldCount;
    let cash = state.cash;
    candidates.sort((a, b) => b.momentum - a.momentum);
    for (const { symbol } of candidates) {
      if (room <= 0 || orders.length >= caps.max_orders_per_bar) break;
      if (state.positions.has(symbol)) continue;
      let slice = stake < byWeight ? stake : byWeight;
      if (cash < slice) slice = cash;
      if (slice === 0n || slice < BigInt(fees.min_notional_quote_units)) break;
      orders.push({ side: 'buy', symbol, notional_quote_units: slice, max_slippage_bps: MAX_SLIPPAGE_BPS });
      cash -= slice;
      room--;
    }
    return orders;
  },
});
