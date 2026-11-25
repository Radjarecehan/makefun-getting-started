# Dapur Kilat — Indonesian Street-Food Kitchen Rush

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Dapur Kilat is a fast, complete 2D cooking game: run Kak Rina's Indonesian
street-food kitchen through a 150-second shift. Take ingredients from the
fridge, chop them on the board (hit the green zone for a PERFECT cut), cook in
the wok or on the grill before anything burns, plate the dish on the serving
counter, and deliver it through the serving window before the customer's
patience runs out. Orders get faster and more complex as the shift goes on;
serving streaks build a combo multiplier.

Three recipes — Nasi Goreng, Mie Goreng, Sate Ayam — each with its own
ingredients, prep steps and cook station. Wrong dishes and burnt pans cost
you time; a clean, fast kitchen is what pays.

## Run it

```sh
python3 -m http.server --directory game 8080
```

Then open http://localhost:8080 — no build step, no network requests, plain
static files plus a canvas game in vanilla JavaScript.

## Controls

- WASD / arrow keys — move Kak Rina around the kitchen (or click to walk)
- E / Space / click a station — interact: take, chop, cook, plate, serve
- X — throw away what you are carrying
- R — restart after the shift ends

---

<sub>Entered on [make.fun](https://make.fun/?ref=8mgq4we3&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
