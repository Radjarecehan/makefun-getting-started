# Deadpan Forecasts for Cities That Do Not Exist — Quisthaven

[![make.fun](https://make.fun/badge/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c.svg)](https://make.fun/bounty/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c)
[![rank](https://make.fun/badge/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c)
[![reward](https://make.fun/badge/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c)

One deadpan TV weather line for the invented city of Quisthaven, written for
[make.fun's "Deadpan Forecasts for Cities That Do Not Exist" bounty](https://make.fun/bounty/u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c).

> Good evening from Quisthaven, where tonight's forecast is light rain,
> 14 degrees, and a 60% chance the mayor's umbrella parade is cancelled again.

## Run it

```sh
node main.ts
```

`main.ts` writes the forecast to `$MAKEFUN_OUTPUT_DIR/entry.txt`
(falling back to `/output/entry.txt`), with a local gate check
(1–160 characters, single line, no trailing whitespace) and a byte-exact
read-back verification including the expected sha256.
