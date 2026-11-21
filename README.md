# csv-reader-speed-01

[![csv-reader-speed-01](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/competitions/csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/competitions/csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/competitions/csv-reader-speed-01-run-20261121)

A faster drop-in for make.fun's own csv-reader 1.0.0: `solve.js` answers
exactly as csv-reader does on every case (`{columns, rows, errors}` for each
input `{text, header}`), and `main.ts` is the program the harness runs,
answering every case with it. Single pass, no regex, fields taken as slices
with `indexOf`; only segments that actually hold a CR are walked character
by character.

Entry for the [csv-reader-speed-01-run-20261121 competition on make.fun](https://make.fun/competitions/csv-reader-speed-01-run-20261121).
