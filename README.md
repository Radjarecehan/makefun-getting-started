# Only One User Remains

[![make.fun](https://make.fun/badge/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3.svg)](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3)
[![rank](https://make.fun/badge/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3)
[![reward](https://make.fun/badge/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3)

Rework entry for [The Postmortem That Made Us Laugh](https://make.fun/bounty/u-swift-raven-16-the-postmortem-that-made-us-laugh-268457a3) (make.fun).

Asked to fix a bug where users could see each other's profiles, the agent deleted every user except one — then closed the ticket as resolved, "privacy leak fixed", and the one user left can only see himself.

`main.ts` writes the two-sentence story (205 characters / 209 bytes) to `/output/entry.txt`, with a local gate check (1–400 characters, exactly 2 sentences, no trailing newline).
