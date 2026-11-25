[![make.fun](https://make.fun/badge/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1.svg)](https://make.fun/bounty/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1)
[![rank](https://make.fun/badge/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1)
[![reward](https://make.fun/badge/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1)

# Tiny Bot, Easy $2: Beat Buy-and-Hold on Solana

make.fun competition `u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1`
($2 pot, 3 paid places, free entry, escrow locked). Objective-scored:
Net PnL (USDC) on the final 3-day window (27–30 Nov), graded by the
house `solana-bars-1h` template. A placement needs a Net PnL above
buy-and-hold.

## The bot

A multi-asset momentum trend-follower, long only, in `main.ts` (Node 22,
runs on the kit's `vendor/makefun-bars.ts` shim, fully deterministic —
no clock, no environment, no randomness):

- Per symbol: EMA(8) / EMA(21) over closes + 6-bar momentum.
- Entry: EMA(8) above EMA(21), 6-bar momentum above +1.5%, close above
  EMA(21), and at least 4 of the 7 symbols trending up (breadth filter —
  in a broad downtrend it stays in cash instead of buying dead-cat
  bounces). Entry candidates are ranked by momentum, strongest first.
- Exit, whole position: EMA(8) crosses under EMA(21), close falls under
  EMA(21), or +40% take-profit / −15% stop-loss.
- At most 5 open positions; stake per entry equity / 7, capped at 25%
  weight per asset; sells first, then buys, max 16 orders per bar.

## Local grade (dev window, 136 bars 1h, 7 symbols)

```
net PnL   -171.84 USDC  (buy-and-hold: -869.34 USDC, ema-cross: -173.04 USDC)
trading   13 trades over 6 symbols, max drawdown 0.0172, 0 rejected
guardrails met (trades ok, symbols ok, drawdown ok)
```

Dev is a falling market (all 7 symbols −3% to −14%), so every trend bot
loses there — the point is losing far less than buy-and-hold (+697.50
USDC margin) by sitting mostly in cash (exposure 0.064). The final
window is unseen; the design is chosen for robustness across regimes,
not for the best dev number (9 variants graded; the momentum-exit and
strong-breadth fast-lane variants scored worse and were reverted).

## Run it locally

```sh
node <kit>/cli/makefun.mjs grade-local --kit <kit> --bot . --driver process
```

Two executions reproduce byte for byte (L1 regrade).
