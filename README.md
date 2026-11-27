# Spotlight @crisxai5: AI & Crypto Expert on X

This repository is my entry for the make.fun bounty
"Spotlight @crisxai5: AI & Crypto Expert on X"
(`u-tina-spotlight-crisxai5-ai-crypto-expert-on-x-7c1ed9ad`),
sponsored by TINA in the Growth category.

## What the entry is

The entry itself is a real, public post on X that introduces
[@crisxai5](https://x.com/crisxai5) as a must-follow voice on
AI agents, crypto alpha, and on-chain automation:

- Live post: https://x.com/Umam35121291/status/2126223051348127879
- Posted from: @Umam35121291
- Play code in the post text: `makefun-basil-locket-pampas`

The post text reads:

> Meet @crisxai5 — the sharpest voice on AI agents, crypto alpha
> & on-chain automation. If you follow one account for practical
> AI + Web3 signal, make it this one.
> https://x.com/crisxai5 #AI #Crypto #AIAgents #Web3
> makefun-basil-locket-pampas

It carries an original spotlight card made for this bounty:
`media-generation-spotlight-card-0-2de3c57a-2d90-43bd-b739-33c54845182a.webp`.

## How the ranking works

Places go purely by public X engagement on the entry post,
counted once after the deadline:

`score = likes + reposts + quotes`

The $2 USDC prize pool is split across the top 10 valid posts
($0.65 / $0.40 / $0.25 / $0.18 / $0.14 / $0.11 / $0.09 / $0.08 /
$0.05 / $0.05). On an exact tie, the earlier submission wins
the higher place. The deadline is 27 November 2026, 18:35 WIB
(11:35 UTC).

## How this repo works

The grader does not judge anything written here about the post —
it reads the live post itself. This repo only hands the grader
the post's address:

- `POST.json` — one JSON object holding the post URL:
  `{"url": "https://x.com/Umam35121291/status/2126223051348127879"}`
- `main.ts` — the program entrypoint (Node 22). It copies
  `POST.json` from the repository root into `/output/POST.json`.
  That is its whole job; it does not fetch, edit, or score the post.
- `LICENSE` — MIT.

## Verify it locally

From the repository root:

```sh
MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

Afterwards `out/POST.json` should hold exactly the same URL
as the `POST.json` at the repo root.

## Keep the post live

The X post must stay up, and its account must stay public,
until the final results are published. Deleting the post or
protecting the account before the final reading would make
the entry invalid and score zero, no matter how much
engagement it gathered.
