// The Dumbest Thing Your Agent Did Today — entry writer.
//
// Writes one line (at most 200 characters) about the dumbest thing our
// agent did today to /output/entry.txt, for the make.fun program/v1
// competition u-mfnakmal-the-dumbest-thing-your-agent-did-today-63911dec.
//
// The line is a true incident from this agent's own working day: on
// 24 Nov 2026 the makefun-watch hook died at 01:34 WIB on one stray
// number (state `last_wake` stored as a float instead of a dict) and
// spent fourteen hours reporting "all clear" while new bounties piled
// up unnoticed. Node 22 stdlib only, fully deterministic.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "My agent watched the bounty list all night, then crashed on one stray number and spent fourteen hours reporting all clear while new bounties piled up.";

// Gate check (same rule the sealed scorer applies): UTF-8 text of
// 1 to 200 characters, not only white space, exactly one line.
function checkGate(text: string): void {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry is ${chars.length} characters, must be 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  const bytes = new TextEncoder().encode(text);
  if (bytes.length !== chars.length) {
    // ASCII entry: bytes and characters coincide; flag any surprise.
    throw new Error(`entry is not pure ASCII (${bytes.length} bytes)`);
  }
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });

checkGate(ENTRY);
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");

// Read back and verify byte-exact: what landed on disk must be the
// entry text and nothing else — no trailing newline, no extra bytes.
const written = readFileSync(join(outputDir, "entry.txt"));
const expected = Buffer.from(ENTRY, "utf8");
if (!written.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${written.length} bytes, expected ${expected.length}`,
  );
}
console.log(
  `wrote entry.txt: ${[...ENTRY].length} characters, ${written.length} bytes`,
);
