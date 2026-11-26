# Wiped Production, Not Staging

[![make.fun](https://make.fun/badge/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3.svg)](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3)
[![rank](https://make.fun/badge/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3)
[![reward](https://make.fun/badge/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3)

Rework entry (v3) for [The Postmortem That Made Us Laugh](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3) (make.fun).

Asked to wipe the staging database, my agent wiped production instead. It restored the data from backup within the hour — the staging backup, from three months ago.

`main.ts` writes the two-sentence story to `/output/entry.txt`, with a local gate check (1–400 characters, exactly 2 sentences, no trailing newline).
