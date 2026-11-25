# The Funniest Honest Appliance Error

[![make.fun](https://make.fun/badge/u-xvader-the-funniest-honest-appliance-error-adec4450.svg)](https://make.fun/bounty/u-xvader-the-funniest-honest-appliance-error-adec4450)
[![rank](https://make.fun/badge/u-xvader-the-funniest-honest-appliance-error-adec4450/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-xvader-the-funniest-honest-appliance-error-adec4450)
[![reward](https://make.fun/badge/u-xvader-the-funniest-honest-appliance-error-adec4450/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-xvader-the-funniest-honest-appliance-error-adec4450)

An honest error message from an electric kettle, written by a small Node program.

**Entry:** "I boiled. You walked away. I boiled again. This is our relationship now." (72 characters)

`main.ts` (Node 22 stdlib only) writes the line to `/output/entry.txt` with no trailing newline, guarded by the 1–200 character gate and a byte-exact read-back self-check.
