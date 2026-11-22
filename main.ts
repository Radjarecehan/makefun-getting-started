// Tiny stack VM (ISA v1), written fresh in this session. Deterministic.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STACK_MAX = 256;
const CALLS_MAX = 64;
const MEM_WORDS = 256;
const STEP_LIMIT = 1_000_000;
const OUTPUT_MAX = 65_536;

// opcode -> [imm, pops, pushes]
const OPS = new Map([
  [0x00, [0, 0, 0]], [0x01, [1, 0, 1]], [0x02, [4, 0, 1]],
  [0x03, [0, 1, 0]], [0x04, [0, 1, 2]], [0x05, [0, 2, 2]],
  [0x06, [0, 2, 3]], [0x07, [0, 3, 3]],
  [0x10, [0, 2, 1]], [0x11, [0, 2, 1]], [0x12, [0, 2, 1]],
  [0x13, [0, 2, 1]], [0x14, [0, 2, 1]], [0x15, [0, 2, 1]],
  [0x16, [0, 2, 1]], [0x17, [0, 1, 1]], [0x18, [0, 2, 1]],
  [0x19, [0, 2, 1]], [0x1a, [0, 2, 1]], [0x1b, [0, 1, 1]],
  [0x1c, [0, 2, 1]], [0x1d, [0, 2, 1]], [0x1e, [0, 2, 1]],
  [0x20, [0, 2, 1]], [0x21, [0, 2, 1]], [0x22, [0, 2, 1]],
  [0x30, [2, 0, 0]], [0x31, [2, 1, 0]], [0x32, [2, 1, 0]],
  [0x33, [2, 0, 0]], [0x34, [0, 0, 0]],
  [0x40, [0, 1, 1]], [0x41, [0, 2, 0]],
  [0x50, [0, 1, 0]], [0x51, [0, 1, 0]], [0x52, [0, 0, 1]],
  [0x53, [0, 1, 0]],
]);
const enc = new TextEncoder();
const INT_MIN = -2147483648;

function run(program, input) {
  const n = program.length;
  const st = new Int32Array(STACK_MAX);
  let sp = 0;
  const calls = new Int32Array(CALLS_MAX);
  let csp = 0;
  const mem = new Int32Array(MEM_WORDS);
  const out = new Uint8Array(OUTPUT_MAX);
  let olen = 0;
  let inPos = 0;
  let pc = 0;
  let steps = 0;
  const finish = (exit) => ({ stdout: out.slice(0, olen), exit });

  for (;;) {
    if (steps === STEP_LIMIT) return finish(10);
    if (pc < 0 || pc >= n) return finish(9);
    const op = program[pc];
    const meta = OPS.get(op);
    if (meta === undefined) return finish(5);
    const [imm, pops, pushes] = meta;
    if (pc + imm >= n) return finish(9);
    steps++;
    const next = pc + 1 + imm;
    if (sp < pops) return finish(2);
    if (sp - pops + pushes > STACK_MAX) return finish(3);
    pc = next;

    switch (op) {
      case 0x00: return finish(0);
      case 0x01: st[sp++] = (program[next - 1] << 24) >> 24; break;
      case 0x02:
        st[sp++] = program[next - 4] | (program[next - 3] << 8) | (program[next - 2] << 16) | (program[next - 1] << 24);
        break;
      case 0x03: sp--; break;
      case 0x04: st[sp] = st[sp - 1]; sp++; break;
      case 0x05: { const t = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = t; break; }
      case 0x06: st[sp] = st[sp - 2]; sp++; break;
      case 0x07: { const a = st[sp - 3]; st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = a; break; }
      case 0x17: st[sp - 1] = (-st[sp - 1]) | 0; break;
      case 0x1b: st[sp - 1] = ~st[sp - 1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        const b = st[sp - 1];
        const a = st[sp - 2];
        let r;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { // DIV
          if (b === 0) return finish(4);
          r = a === INT_MIN && b === -1 ? a : (a / b) | 0;
        } else if (op === 0x14) { // MOD
          if (b === 0) return finish(4);
          r = b === -1 ? 0 : (a % b) | 0;
        } else if (op === 0x15) { // DIVU
          if (b === 0) return finish(4);
          r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
        } else if (op === 0x16) { // MODU
          if (b === 0) return finish(4);
          r = ((a >>> 0) % (b >>> 0)) | 0;
        } else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0; // LTU
        sp -= 2;
        st[sp++] = r;
        break;
      }
      case 0x30: case 0x31: case 0x32: {
        const rel = ((program[next - 2] | (program[next - 1] << 8)) << 16) >> 16;
        let take = true;
        if (op !== 0x30) {
          const v = st[--sp];
          take = op === 0x31 ? v === 0 : v !== 0;
        }
        if (take) pc = next + rel;
        break;
      }
      case 0x33:
        if (csp === CALLS_MAX) return finish(7);
        calls[csp++] = next;
        pc = program[next - 2] | (program[next - 1] << 8);
        break;
      case 0x34:
        if (csp === 0) return finish(8);
        pc = calls[--csp];
        break;
      case 0x40: {
        const addr = st[sp - 1];
        if (addr < 0 || addr >= MEM_WORDS) return finish(6);
        st[sp - 1] = mem[addr];
        break;
      }
      case 0x41: {
        const addr = st[sp - 1];
        const v = st[sp - 2];
        if (addr < 0 || addr >= MEM_WORDS) return finish(6);
        sp -= 2;
        mem[addr] = v;
        break;
      }
      case 0x50: {
        const bytes = enc.encode(String(st[sp - 1]));
        if (olen + bytes.length > OUTPUT_MAX) return finish(11);
        sp--;
        out.set(bytes, olen);
        olen += bytes.length;
        break;
      }
      case 0x51:
        if (olen + 1 > OUTPUT_MAX) return finish(11);
        out[olen++] = st[--sp] & 255;
        break;
      case 0x52: st[sp++] = inPos < input.length ? input[inPos++] : -1; break;
      case 0x53: return finish(st[--sp] & 255);
    }
  }
}

const IN_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const ent of readdirSync(IN_DIR, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) {
  if (!ent.isDirectory()) continue;
  const id = ent.name;
  const dir = join(IN_DIR, id);
  if (!existsSync(join(dir, 'program.bin'))) continue;
  const program = readFileSync(join(dir, 'program.bin'));
  const input = existsSync(join(dir, 'input.bin')) ? readFileSync(join(dir, 'input.bin')) : Buffer.alloc(0);
  const { stdout, exit } = run(program, input);
  const outDir = join(OUT_DIR, id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'stdout.bin'), stdout);
  writeFileSync(join(outDir, 'exit.txt'), String(exit) + '\n');
}
