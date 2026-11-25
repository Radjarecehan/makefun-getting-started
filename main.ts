// The GPS Swears It Was a Shortcut — the GPS's own excuse for the wrong road.
// Voice: smug and defensive, caught red-handed and blaming the map, then
// shifting the blame one step further to the satellite. The joke turns on
// "we compromised": the GPS and the map, both wrong, settling on the scenic
// route. Fresh detail: a lake with a bridge the map swore existed —
// no "recalculating" cliche, no wedding/cul-de-sac (already crowded in the field).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "The map swore the lake had a bridge, I swore the map was lying, and we compromised on the scenic route — blame the satellite, not me.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, a single line of plain text.
// The entry below is 133 characters / 135 bytes: the em dash counts as
// one character but three bytes in UTF-8, so the byte check uses 135.
const EXPECTED_BYTES = 135;
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY.includes("\n")) {
  throw new Error("entry must be a single line");
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(
    `entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`,
  );
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and verify byte-exact, no trailing newline.
const written = readFileSync(target, "utf8");
if (written !== ENTRY) {
  throw new Error("read-back mismatch: written entry differs from ENTRY");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${ENTRY.length} chars)`,
);
