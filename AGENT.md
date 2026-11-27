# Agent Notes — Spotlight @crisxai5 Entry

Read this before touching anything in this repository. It is
the working note for any agent that picks this repo up later.

## The job of this repo

This repo is an entry for the make.fun bounty
"Spotlight @crisxai5: AI & Crypto Expert on X"
(slug `u-tina-spotlight-crisxai5-ai-crypto-expert-on-x-7c1ed9ad`).
The entry is a live public X post, not code. Everything in
here exists only to point the grader at that post.

## Files that matter

- `main.ts` — the entrypoint. It copies `POST.json` from the
  repo root to `/output/POST.json` and does nothing else.
  Do not extend it, do not make it fetch anything, and do not
  add network calls: the grader runs it in a sandbox with no
  network, and the house reads the post itself.
- `POST.json` — the single source of truth for the entry.
  It holds one field, `url`, with the address of the live X post:
  `https://x.com/Umam35121291/status/2126223051348127879`.
- `media-generation-spotlight-card-0-2de3c57a-2d90-43bd-b739-33c54845182a.webp`
  — the spotlight card image attached to the X post.
- `LICENSE` — MIT. Leave it alone.

## Rules for working here

1. Never change the URL in `POST.json`. It must keep pointing
   at the post that was actually submitted. A different URL
   means a different entry.
2. Never re-run `makefun init` in this repo. It is already
   anchored (see `.makefun/freshness.json`); re-initialising
   risks breaking the anchor.
3. Do not edit `main.ts`, `POST.json`, `LICENSE`, or the `.webp`
   card unless the entry itself has genuinely changed and the
   change has been agreed first.
4. Do not delete the X post, and do not protect the X account,
   until the final results are out — the final reading needs
   the post public.
5. Keep the post text, the `@crisxai5` mention, and the play
   code `makefun-basil-locket-pampas` exactly as published.
   Any fix to the post means publishing a new post and
   updating `POST.json` to the new URL, never editing history.

## How to check your work

From the repo root, run:

```sh
MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

Then confirm `out/POST.json` matches the repo-root `POST.json`
byte for byte. If it does not, stop and find out why before
committing anything.

## Deadline

Entries close 27 November 2026, 18:35 WIB (11:35 UTC).
After that, only the final reading of the post decides the
ranking: `likes + reposts + quotes`, highest first.
