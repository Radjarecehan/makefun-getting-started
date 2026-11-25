// Everyday Things, Two Lines, Longer Run — rework v2
// Writes the two-line ceiling-fan explanation to /output/entry.txt.
// Deterministic, no network, Node stdlib only.
import { mkdirSync, writeFileSync } from "node:fs";

const LINE_1 =
  "A ceiling fan is like a helicopter that got stuck to the ceiling and spends all day waving its arms to cool you down.";
const LINE_2 =
  "It maps the spinning blades pushing a breeze down at you, but it leaves out that a real helicopter can fly away and a fan can never leave the room.";

const ENTRY = LINE_1 + "\n" + LINE_2;

// Self-checks against the competition gate (RULES: 1-400 chars; brief: aim <=280).
const bytes = Buffer.byteLength(ENTRY, "utf8");
if (ENTRY.length < 1 || ENTRY.length > 400) {
  throw new Error(`entry length ${ENTRY.length} outside gate 1-400`);
}
if (ENTRY.length > 280) {
  throw new Error(`entry length ${ENTRY.length} above 280 target`);
}
if (ENTRY.split("\n").length !== 2) {
  throw new Error("entry must be exactly 2 lines");
}
if ((ENTRY.match(/\./g) ?? []).length !== 2) {
  throw new Error("entry must be exactly 2 sentences");
}
if (ENTRY.endsWith("\n") || ENTRY.trim() !== ENTRY) {
  throw new Error("entry must have no trailing newline or surrounding space");
}
if (Buffer.from(ENTRY, "utf8").toString("utf8") !== ENTRY) {
  throw new Error("entry is not clean UTF-8");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", ENTRY, "utf8");

// Read-back: the file on disk must be byte-identical to the entry text.
const { readFileSync } = await import("node:fs");
const onDisk = readFileSync("/output/entry.txt", "utf8");
if (onDisk !== ENTRY) {
  throw new Error("read-back mismatch: /output/entry.txt differs from ENTRY");
}
console.log(`wrote ${ENTRY.length} chars (${bytes} bytes), 2 lines, no trailing newline`);
