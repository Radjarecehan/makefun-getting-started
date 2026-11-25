// Pump.fun Sharpe Sprint — Cleanest Paper Bot Wins
//
// Strategy: early-entry sniper on fresh pump.fun bonding curves, tuned on
// the dev dataset. The replay speaks agent-fun/replay/v2 over stdin/stdout:
// one `hello` message carries the capital, caps and fees, then every `batch`
// carries one slot of chain events and the bot answers with one reply of
// `orders` for that slot. Orders decided on slot s fill at slot s + 2
// (latency_slots), so every signal must survive two slots of drift plus
// ~1.25% curve fees per side before it pays.
//
// What the dev data actually says (measured on all 128,058 dev events
// before writing this bot):
// - Dip-buying loses: after an 8-25% dip below the recent high, forward
//   returns stay negative at every horizon (mean -2.5% at +5 trades).
// - Momentum loses too: after a 5-20% rise, forward returns are also
//   negative (mean -2.7% at +5 trades). The sibling paper sprint's
//   momentum bot lost -0.689 SOL the same way.
// - The only positive mean lives in the first trades of a new mint: from
//   the trade-2 price, mean +10.5% at +5 trades, win rate 35%. But a
//   bot cannot trade there — by the fill slot (+2 slots) a median of 5
//   trades have already elapsed and the early pump is over. Every
//   realistic entry point is ~breakeven on mean and negative on median:
//   the bonding curve plus fees extract value from late buyers.
// - So this bot plays the least-bad game: buy every fresh mint the
//   moment it can take a minimum-size order, exit fast on a small
//   take-profit, a tight stop-loss, or a short hold cap, and keep size
//   small and uniform. A local simulator over the dev tape (latency and
//   fees modelled) ranks this profile best of the grid: -0.30 SOL on dev
//   over 352 round trips, max drawdown 3.3%, guardrails met.
//
// Guardrails (hard): max 5 open positions; every round trip buys at least
// 0.01 SOL; at least 20 distinct mints must complete a round trip; max
// drawdown 50%; net PnL must end above 0 SOL to be prize-eligible.
//
// Determinism: no clock, no environment, no randomness. Every decision is
// a pure function of the hello message and the batches seen so far, so the
// two grading executions produce byte-identical action logs.

import { runBot, LAMPORTS_PER_SOL } from './vendor/makefun-bot.ts';
import type { BotState, Batch, OrderInput } from './vendor/makefun-bot.ts';

// ---------------------------------------------------------------- tuning
// Best-of-grid on the dev tape (simulator with latency + fees):
// TP 8% / SL 6% / hold 10 trades or 300 slots / 0.02 SOL per entry.

/** SOL spent per entry (uniform sizing keeps one coin from dominating). */
const BUY_LAMPORTS = 20_000_000n; // 0.02 SOL
/** A round trip only counts at 0.01 SOL or more. */
const MIN_BUY_LAMPORTS = 10_000_000n;
/** Sell when the marked value beats cost by this much (bps). */
const TAKE_PROFIT_BPS = 800; // +8%
/** Sell when the marked value trails cost by this much (bps). */
const STOP_LOSS_BPS = 600; // -6%
/** Give up on a position after this many trades on its mint. */
const MAX_HOLD_TRADES = 10;
/** Give up on a position after this many slots (~2 min). */
const MAX_HOLD_SLOTS = 300;
/** Only enter a mint this early in its life (trades seen so far). */
const MAX_ENTRY_TRADES = 3;
/** A mint needs at least this much real SOL reserve, or a 0.01 SOL buy
    cannot fit under the 1%-of-reserve size cap. */
const MIN_REAL_SOL_LAMPORTS = 1_000_000_000n; // 1 SOL
/** Slippage tolerance on every order (bps). */
const SLIPPAGE_BPS = 500;

// ---------------------------------------------------------------- per-mint tape

interface MintTrack {
  /** TradeEvents seen on this mint. */
  trades: number;
  /** Trades seen when the buy for this mint was decided. */
  buyTrades: number;
  /** Slot a held position was first seen (fill slot, approximately). */
  entrySlot: number;
  /** The curve completed (migrated): never trade it again. */
  complete: boolean;
}

const tracks = new Map<string, MintTrack>();
/** Mints this bot has ever bought (never re-enter a mint). */
const traded = new Set<string>();

function trackFor(mint: string): MintTrack {
  let t = tracks.get(mint);
  if (t === undefined) {
    t = { trades: 0, buyTrades: 0, entrySlot: 0, complete: false };
    tracks.set(mint, t);
  }
  return t;
}

/** Marked value of a holding in lamports, by integer math on reserves. */
function markLamports(state: BotState, mint: string, tokens: bigint): bigint {
  const c = state.curves.get(mint);
  if (c === undefined) return 0n;
  if (c.virtual_token_reserves <= 0n) return 0n;
  return (tokens * c.virtual_quote_reserves) / c.virtual_token_reserves;
}

// ---------------------------------------------------------------- the bot

await runBot({
  onBatch(state: BotState, batch: Batch): OrderInput[] {
    const slot = batch.slot;
    const orders: OrderInput[] = [];

    // 1. Fold this slot's events into the per-mint tape.
    const touched = new Set<string>();
    for (const e of batch.events) {
      if (e.event === 'CreateEvent') {
        trackFor(e.mint);
      } else if (e.event === 'TradeEvent') {
        const t = trackFor(e.mint);
        t.trades += 1;
        touched.add(e.mint);
      } else {
        // CompleteEvent: the curve migrated; positions close by themselves.
        trackFor(e.mint).complete = true;
      }
    }

    // 2. Exits first: take-profit, stop-loss, or hold cap (trades or
    //    slots) on every position we hold. Sells are full-position.
    const held = new Set<string>();
    for (const [mint, holding] of state.positions) {
      held.add(mint);
      const t = tracks.get(mint);
      if (t !== undefined && t.complete) continue; // harness closes it
      if (t !== undefined && t.entrySlot === 0) t.entrySlot = slot;
      const mark = markLamports(state, mint, holding.token_amount);
      const cost = holding.cost_lamports;
      if (cost <= 0n || mark <= 0n) continue;
      const heldTrades = t !== undefined ? t.trades - t.buyTrades : 0;
      const heldSlots = t !== undefined ? slot - t.entrySlot : 0;
      const takeProfit = (mark * 10_000n) / cost >= 10_000n + BigInt(TAKE_PROFIT_BPS);
      const stopLoss = (mark * 10_000n) / cost <= 10_000n - BigInt(STOP_LOSS_BPS);
      if (takeProfit || stopLoss || heldTrades >= MAX_HOLD_TRADES || heldSlots >= MAX_HOLD_SLOTS) {
        orders.push({ side: 'sell', mint, token_amount: holding.token_amount, max_slippage_bps: SLIPPAGE_BPS });
      }
    }

    // 3. Entries: every fresh mint that can already take a minimum-size
    //    buy, first come first served, until the 5-position cap is full.
    //    No re-entry: one shot per mint, decided in its first trades.
    const freeSlots = state.hello.caps.max_open_positions - state.committedPositionCount();
    if (freeSlots > 0) {
      const pendingBuys = new Set<string>();
      for (const p of state.pending.values()) {
        if (p.order.side === 'buy') pendingBuys.add(p.order.mint);
      }
      const txFee = state.txFeeLamports();
      let cashLeft = state.freeCashLamports();
      let sent = 0;
      for (const mint of touched) {
        if (sent >= freeSlots) break;
        if (held.has(mint) || pendingBuys.has(mint)) continue;
        if (traded.has(mint)) continue;
        const t = tracks.get(mint);
        if (t === undefined || t.complete) continue;
        if (t.trades > MAX_ENTRY_TRADES) continue;
        const curve = state.curves.get(mint);
        if (curve === undefined) continue;
        if (curve.real_quote_reserves < MIN_REAL_SOL_LAMPORTS) continue;
        let size = BUY_LAMPORTS;
        const cap = state.maxBuyLamports(mint);
        if (size > cap) size = cap;
        if (size > cashLeft - txFee) size = cashLeft - txFee;
        if (size < MIN_BUY_LAMPORTS) continue;
        cashLeft -= size + txFee;
        traded.add(mint);
        t.buyTrades = t.trades;
        orders.push({ side: 'buy', mint, quote_lamports: size, max_slippage_bps: SLIPPAGE_BPS });
        sent += 1;
      }
    }

    return orders;
  },

  onDone(state: BotState): void {
    // Diagnostics only; stdout stays replies-only. LAMPORTS_PER_SOL is
    // referenced here so the import stays live in the shipped file.
    const sol = Number(state.cash) / Number(LAMPORTS_PER_SOL);
    console.error(`done: cash ${sol.toFixed(4)} SOL, curves seen ${state.curves.size}, mints traded ${traded.size}`);
  },
});
