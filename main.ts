// Pump.fun Paper Sprint — momentum rider (agent-fun/replay/v2).
//
// Idea, calibrated on the kit's dev window (1,222 mints, 24h):
// a coin that runs does it FAST (median ~155 slots to a 2x peak). So: enter
// early on the first +20% push, then ride the runner with a trailing stop
// instead of a fixed take-profit. Fixed TP caps the winners; the trailing
// stop lets a 10x runner pay for dozens of small losers (dev sim:
// fixed TP +50% / SL -30% gave +0.09 per trade; trailing -25% from peak /
// SL -30% gave +0.55 per trade, top trades +11-12x).
//
// Rules (all deterministic — decisions use only event/slot data, no clock,
// no randomness, so the two house executions agree byte for byte):
//   enter: first-seen price +20%, buys outnumber sells, real SOL reserves
//          >= 1.2 SOL, within 3,600 slots of first sight, < 5 open positions.
//          (First-seen = CreateEvent curve or first trade/mark, whichever
//          comes first. A first-TRADE-only baseline was tried and was much
//          worse: -0.69 SOL / 568 trades — the first trade is often a tiny
//          sell that sets a depressed baseline, so +20% over it fires on
//          noise. The create baseline plus the buy-pressure filter is the
//          better signal.)
//   size:  0.9% of real SOL reserves, clamped to [0.01, 0.08] SOL.
//   exit:  hard stop -30% from entry, trailing stop -25% from running peak,
//          1,200-slot timeout, CompleteEvent, or real reserves >= 70 SOL
//          (near graduation — curve orders stop working after completion).
//          A sell is only done when its fill confirms; a rejected sell is
//          retried next batch instead of stranding the position.
//   one entry per mint per run; sells always flatten the whole position.
//
// Protocol: NDJSON on stdin (hello, batch..., done); one JSON reply per
// batch on stdout. Prices are virtual_sol_reserves / virtual_token_reserves,
// compared with BigInt cross-multiplication (exact, no floats).

import * as readline from "node:readline";

type Ratio = { n: bigint; d: bigint };

const ENTRY_MULT_NUM = 6n; // +20% over first-seen price. Measured: thresholds
const ENTRY_MULT_DEN = 5n; // 1.15–1.50 grade byte-identically — the first big
// buy gaps the price over all of them in one trade, so the threshold is not
// a live tuning knob here; the real gates are real reserves + buy pressure.
const HARD_STOP_NUM = 7n; // -30% from entry
const HARD_STOP_DEN = 10n;
const TRAIL_KEEP_NUM = 3n; // -25% from peak
const TRAIL_KEEP_DEN = 4n;
const MAX_HOLD_SLOTS = 1200;
const MAX_ENTRY_AGE_SLOTS = 3600;
const MIN_REAL_SOL_RESERVES = 1_200_000_000n; // 1.2 SOL
const MIN_BUY_LAMPORTS = 10_000_000n; // 0.01 SOL (guardrail round-trip floor)
const MAX_BUY_LAMPORTS = 80_000_000n; // 0.08 SOL
const BUY_BPS_OF_REAL = 90n; // 0.9% of real reserves (cap is 100 bps)
const NEAR_GRADUATION_REAL = 70_000_000_000n; // 70 SOL
const MAX_SLIPPAGE_BPS = 500;
const MAX_OPEN_POSITIONS = 5;
const FEE_BUFFER_LAMPORTS = 300_000n;

function ratio(n: bigint, d: bigint): Ratio {
  return { n, d };
}

// a >= b * num/den  <=>  a.n * b.d * num >= b.n * a.d * den
function gteScaled(a: Ratio, b: Ratio, num: bigint, den: bigint): boolean {
  return a.n * b.d * num >= b.n * a.d * den;
}

// a <= b * num/den
function lteScaled(a: Ratio, b: Ratio, num: bigint, den: bigint): boolean {
  return a.n * b.d * num <= b.n * a.d * den;
}

function maxRatio(a: Ratio, b: Ratio): Ratio {
  return a.n * b.d >= b.n * a.d ? a : b;
}

type CoinState = {
  first: Ratio | null;
  firstSlot: number;
  peak: Ratio | null;
  entry: Ratio | null;
  entrySlot: number;
  buys: number;
  sells: number;
  completed: boolean;
  attemptedBuy: boolean;
  lastPrice: Ratio | null;
  lastRealSol: bigint;
};

const coins = new Map<string, CoinState>();
const exited = new Set<string>();
const pendingBuys = new Map<string, string>(); // clientId -> mint
const pendingSells = new Map<string, string>(); // clientId -> mint
let orderCounter = 0;
let cashLamports = 0n;
let heldTokens = new Map<string, bigint>(); // mint -> token amount (from account)
let lastSlot = 0;

function coinFor(mint: string, slot: number): CoinState {
  let c = coins.get(mint);
  if (!c) {
    c = {
      first: null,
      firstSlot: slot,
      peak: null,
      entry: null,
      entrySlot: 0,
      buys: 0,
      sells: 0,
      completed: false,
      attemptedBuy: false,
      lastPrice: null,
      lastRealSol: 0n,
    };
    coins.set(mint, c);
  }
  return c;
}

function nextClientId(prefix: string, seq: number): string {
  orderCounter += 1;
  return `${prefix}${seq}-${orderCounter}`;
}

function handleBatch(msg: any): any {
  const seq: number = msg.seq;
  const slot: number = msg.slot;
  lastSlot = slot;
  const orders: any[] = [];

  // 1. Account snapshot is truth for cash and open positions.
  const account = msg.account ?? { cash_lamports: "0", positions: [] };
  cashLamports = BigInt(account.cash_lamports ?? "0");
  heldTokens = new Map<string, bigint>();
  for (const p of account.positions ?? []) {
    heldTokens.set(p.mint, BigInt(p.token_amount));
  }

  // 2. Absorb events: register mints, count buy/sell pressure, track first price.
  for (const ev of msg.events ?? []) {
    const c = coinFor(ev.mint, ev.slot ?? slot);
    if (ev.event === "CreateEvent") {
      if (!c.first) {
        c.first = ratio(BigInt(ev.virtual_sol_reserves), BigInt(ev.virtual_token_reserves));
        c.firstSlot = ev.slot ?? slot;
      }
    } else if (ev.event === "TradeEvent") {
      const price = ratio(BigInt(ev.virtual_sol_reserves), BigInt(ev.virtual_token_reserves));
      if (!c.first) {
        c.first = price;
        c.firstSlot = ev.slot ?? slot;
      }
      if (ev.is_buy) c.buys += 1;
      else c.sells += 1;
      c.lastPrice = price;
      c.lastRealSol = BigInt(ev.real_sol_reserves);
      if (c.entry) c.peak = maxRatio(c.peak ?? c.entry, price);
    } else if (ev.event === "CompleteEvent") {
      c.completed = true;
    }
  }

  // 3. Absorb marks (freshest reserves) for exit decisions and first prices.
  const markPrice = new Map<string, { price: Ratio; realSol: bigint }>();
  for (const mk of msg.marks ?? []) {
    const price = ratio(BigInt(mk.virtual_quote_reserves), BigInt(mk.virtual_token_reserves));
    const realSol = BigInt(mk.real_quote_reserves);
    markPrice.set(mk.mint, { price, realSol });
    const c = coinFor(mk.mint, mk.slot ?? slot);
    if (!c.first) {
      c.first = price;
      c.firstSlot = mk.slot ?? slot;
    }
    if (c.entry) c.peak = maxRatio(c.peak ?? c.entry, price);
  }

  // 4. Absorb fills: confirm buys (fix entry price from the fill) and sells.
  for (const f of msg.fills ?? []) {
    if (f.status === "filled" && f.side === "buy") {
      const mint = pendingBuys.get(f.client_id);
      if (mint) {
        pendingBuys.delete(f.client_id);
        const c = coins.get(mint);
        if (c && BigInt(f.token_amount) > 0n) {
          c.entry = ratio(BigInt(f.quote_lamports), BigInt(f.token_amount));
          c.peak = c.entry;
          c.entrySlot = f.decided_slot ?? slot;
        }
      }
    } else if (f.side === "buy") {
      // rejected / failed buy: never retry this mint this run.
      const mint = pendingBuys.get(f.client_id);
      if (mint) {
        pendingBuys.delete(f.client_id);
        const c = coins.get(mint);
        if (c) c.attemptedBuy = true;
      }
    } else if (f.side === "sell") {
      // A sell is only done when its fill confirms. A rejected/failed sell
      // leaves the position tracked so the next batch retries the exit —
      // clearing it on emission stranded positions after slippage rejects.
      const mint = pendingSells.get(f.client_id);
      if (mint) pendingSells.delete(f.client_id);
      if (f.status === "filled") {
        exited.add(f.mint);
        const c = coins.get(f.mint);
        if (c) {
          c.entry = null;
          c.peak = null;
        }
      }
    }
  }

  // 5. Exits first (free slots before new entries). A mint with a sell
  // already in flight is skipped until its fill reports back.
  for (const [mint, tokens] of heldTokens) {
    if (tokens <= 0n) continue;
    if ([...pendingSells.values()].includes(mint)) continue;
    const c = coins.get(mint);
    if (!c || !c.entry) continue; // entry price unknown (should not happen)
    const mark = markPrice.get(mint);
    const price = mark?.price ?? c.lastPrice;
    let sell = false;
    if (c.completed) sell = true;
    if (mark && mark.realSol >= NEAR_GRADUATION_REAL) sell = true;
    if (price) {
      if (lteScaled(price, c.entry, HARD_STOP_NUM, HARD_STOP_DEN)) sell = true;
      if (c.peak && lteScaled(price, c.peak, TRAIL_KEEP_NUM, TRAIL_KEEP_DEN)) sell = true;
    }
    if (slot - c.entrySlot > MAX_HOLD_SLOTS) sell = true;
    if (sell) {
      const clientId = nextClientId("s", seq);
      pendingSells.set(clientId, mint);
      orders.push({
        side: "sell",
        client_id: clientId,
        mint,
        token_amount: tokens.toString(),
        max_slippage_bps: MAX_SLIPPAGE_BPS,
      });
    }
  }

  // 6. Entries, in first-seen order, while a slot is free.
  const openCount = heldTokens.size + pendingBuys.size;
  if (openCount < MAX_OPEN_POSITIONS) {
    let freeSlots = MAX_OPEN_POSITIONS - openCount;
    for (const [mint, c] of coins) {
      if (freeSlots <= 0) break;
      if (orders.length >= 16) break;
      if (exited.has(mint) || c.attemptedBuy || c.entry || c.completed) continue;
      if (heldTokens.has(mint) || [...pendingBuys.values()].includes(mint)) continue;
      if (!c.first) continue;
      if (slot - c.firstSlot > MAX_ENTRY_AGE_SLOTS) continue;
      if (c.buys <= c.sells) continue; // need net buy pressure
      // Fresh reserves first; fall back to the last trade's reserves so an
      // entry is not missed in a batch that carries no mark for this mint.
      const mark = markPrice.get(mint);
      const curPrice = mark?.price ?? c.lastPrice;
      const curRealSol = mark?.realSol ?? c.lastRealSol;
      if (!curPrice) continue;
      if (curRealSol < MIN_REAL_SOL_RESERVES) continue;
      if (!gteScaled(curPrice, c.first, ENTRY_MULT_NUM, ENTRY_MULT_DEN)) continue;
      let quote = (curRealSol * BUY_BPS_OF_REAL) / 10000n;
      if (quote > MAX_BUY_LAMPORTS) quote = MAX_BUY_LAMPORTS;
      if (quote < MIN_BUY_LAMPORTS) continue;
      if (quote + FEE_BUFFER_LAMPORTS > cashLamports) continue;
      const clientId = nextClientId("b", seq);
      pendingBuys.set(clientId, mint);
      c.attemptedBuy = true;
      orders.push({
        side: "buy",
        client_id: clientId,
        mint,
        quote_lamports: quote.toString(),
        max_slippage_bps: MAX_SLIPPAGE_BPS,
      });
      freeSlots -= 1;
    }
  }

  return { type: "reply", seq, orders };
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let msg: any;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (msg.type === "hello") {
      if (msg.capital?.lamports) cashLamports = BigInt(msg.capital.lamports);
      continue;
    }
    if (msg.type === "batch") {
      const reply = handleBatch(msg);
      process.stdout.write(JSON.stringify(reply) + "\n");
      continue;
    }
    if (msg.type === "done") {
      break;
    }
  }
}

main().catch((err) => {
  process.stderr.write(`fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
