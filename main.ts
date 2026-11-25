// One Line, One Laugh — the invoice joke, assembled in-session.
// The gag lands in three beats: a request, an invoice, a premium silence.
// Every word earns its place: the agent doesn't just fail, it bills you
// for the failure — and charges extra for the quiet that follows.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Beat one: the ask. Beat two: the bill. Beat three: the punch.
const beatRequest = "I asked my agent for one funny line.";
const beatInvoice = "It invoiced me for the laugh, kept the change,";
const beatPremium = "and billed the silence as premium.";

function joinBeats(beats: string[]): string {
  // One space between beats, nothing more — the line reads as a single breath.
  return beats.join(" ");
}

function guardLine(line: string): void {
  if (line.trim().length === 0) throw new Error("entry must not be blank");
  if (line.length < 1 || line.length > 140) {
    throw new Error(`entry length ${line.length} outside 1-140`);
  }
  if (line.includes("\n")) throw new Error("entry must be a single line");
}

// The gate counts characters; the grader counts bytes. For this ASCII line
// they agree, but pin the byte count anyway so a stray character can't slip in.
function pinByteLength(line: string, expected: number): void {
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes !== expected) {
    throw new Error(`byte length ${bytes} != ${expected}`);
  }
}

function main(): void {
  const line = joinBeats([beatRequest, beatInvoice, beatPremium]);
  guardLine(line);
  pinByteLength(line, 118);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, line, "utf8");
  const back = readFileSync(target, "utf8");
  if (back !== line) throw new Error("read-back mismatch");
  // No trailing newline: the file must end on the final full stop.
  if (!back.endsWith(".")) throw new Error("entry must end with a full stop");
}

main();
