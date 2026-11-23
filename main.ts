// mend: one patch tool for every AI edit format (SPEC.md v1).
// Node 22, standard library only. Run as: node main.ts [--format=NAME] [--check] [--strict] [PATCH]
//
// Written fresh in this session from SPEC.md: the command line and exit codes
// (sections 1-2), files, lines and paths (3), format detection (4), three-tier
// line matching (5), unified diffs (6), SEARCH/REPLACE blocks (7), V4A patches
// (8), JSON edits (9), order and atomicity (10). In a trial (MAKEFUN_ENV_URL
// set) this hands over to runner.ts, kept as the kit has it.

import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync, writeSync } from 'node:fs';
import { dirname } from 'node:path';

const FORMATS = ['auto', 'unified', 'search-replace', 'v4a', 'json'];

/** Exit 2 with exactly one stdout line. */
class Exit2 {
  readonly line: string;
  constructor(line: string) {
    this.line = line;
  }
}

/** One failed edit: its code and the path the failure concerns. */
class Fail {
  readonly code: string;
  readonly path: string;
  constructor(code: string, path: string) {
    this.code = code;
    this.path = path;
  }
}

const blank = (s: string): boolean => s.trim() === '';

/** A patch's lines: split at \n, one trailing \r removed, no empty piece after a final \n. */
function patchLines(text: string): string[] {
  if (text === '') return [];
  const lines = text.split('\n');
  if (text.endsWith('\n')) lines.pop();
  return lines.map((l) => (l.endsWith('\r') ? l.slice(0, -1) : l));
}

function safe(p: string): boolean {
  return (
    p !== '' &&
    !p.startsWith('/') &&
    !p.includes('\\') &&
    p.split('/').every((s) => s !== '' && s !== '.' && s !== '..')
  );
}

/** A file's lines with its own break and whether it ends with one. */
interface FileLines {
  lines: string[];
  br: string;
  fin: boolean;
}

function splitFile(text: string): FileLines {
  if (text === '') return { lines: [], br: '\n', fin: false };
  const nl = text.indexOf('\n');
  const br = nl > 0 && text[nl - 1] === '\r' ? '\r\n' : '\n';
  const parts = text.split(br);
  const fin = text.endsWith(br);
  if (fin) parts.pop();
  return { lines: parts, br, fin };
}

function joinFile(lines: string[], br: string, fin: boolean): string {
  if (lines.length === 0) return '';
  return lines.join(br) + (fin ? br : '');
}

const stripTrail = (s: string): string => s.replace(/[ \t]+$/, '');
const stripBoth = (s: string): string => s.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
const leadWs = (s: string): string => {
  const m = /^[ \t]*/.exec(s);
  return m === null ? '' : m[0];
};

function lineEq(a: string, b: string, tier: number): boolean {
  if (tier === 0) return a === b;
  if (tier === 1) return stripTrail(a) === stripTrail(b);
  return stripBoth(a) === stripBoth(b);
}

/** Positions where old matches lines at one tier; occurrences may overlap. */
function occurrences(lines: string[], old: string[], tier: number): number[] {
  const out: number[] = [];
  for (let i = 0; i + old.length <= lines.length; i++) {
    let ok = true;
    for (let j = 0; j < old.length; j++) {
      if (!lineEq(lines[i + j] as string, old[j] as string, tier)) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(i);
  }
  return out;
}

/** First tier (0..2, or 0 with --strict) at which old occurs at least once. */
function findTier(lines: string[], old: string[], strict: boolean): { tier: number; pos: number[] } | null {
  const top = strict ? 0 : 2;
  for (let t = 0; t <= top; t++) {
    const pos = occurrences(lines, old, t);
    if (pos.length > 0) return { tier: t, pos };
  }
  return null;
}

/** First tier at which a single line occurs at or after `from`; the first such position. */
function findSingle(lines: string[], one: string, from: number, strict: boolean): { tier: number; pos: number } | null {
  const top = strict ? 0 : 2;
  for (let t = 0; t <= top; t++) {
    for (let i = from; i < lines.length; i++) {
      if (lineEq(lines[i] as string, one, t)) return { tier: t, pos: i };
    }
  }
  return null;
}

/** One line of an old/new pair: its text, and whether it is a context line. */
interface PairLine {
  text: string;
  ctx: boolean;
}

/**
 * Build the lines that replace the matched block: context lines come from the
 * file itself; at tier 2 every other new line is re-indented from the old
 * block's first line onto the file's first matched line.
 */
function buildReplacement(file: string[], at: number, old: PairLine[], nw: PairLine[], tier: number): string[] {
  const out: string[] = [];
  const oldCtxAt: number[] = [];
  old.forEach((l, idx) => {
    if (l.ctx) oldCtxAt.push(idx);
  });
  let seenCtx = 0;
  const f = old.length > 0 ? leadWs(file[at] as string) : '';
  const p = old.length > 0 ? leadWs(old[0]!.text) : '';
  for (const l of nw) {
    if (l.ctx) {
      const oi = oldCtxAt[seenCtx];
      seenCtx += 1;
      out.push(oi === undefined ? l.text : (file[at + oi] as string));
      continue;
    }
    if (tier === 2 && l.text !== '' && l.text.trim() !== '' && l.text.startsWith(p)) {
      out.push(f + l.text.slice(p.length));
    } else {
      out.push(l.text);
    }
  }
  return out;
}

/** The tree as the edits leave it: changed paths in `now` (null: deleted). */
class Tree {
  private readonly orig = new Map<string, string | null>();
  readonly now = new Map<string, string | null>();
  original(p: string): string | null {
    if (!this.orig.has(p)) {
      let v: string | null = null;
      try {
        if (statSync(p).isFile()) v = readFileSync(p, 'utf8');
      } catch {
        v = null;
      }
      this.orig.set(p, v);
    }
    return this.orig.get(p) as string | null;
  }
  get(p: string): string | null {
    return this.now.has(p) ? (this.now.get(p) as string | null) : this.original(p);
  }
}

type Edit = (tree: Tree) => void;

/** Moves that succeeded, in order, for the R lines of the report. */
const moves: Array<[string, string]> = [];

function detect(lines: string[]): string | null {
  const first = lines.findIndex((l) => !blank(l));
  if (first < 0) return null;
  if ((lines[first] as string).trim() === '*** Begin Patch') return 'v4a';
  const c = (lines[first] as string).trimStart()[0];
  if (c === '[' || c === '{') return 'json';
  if (lines.some((l) => l.trimEnd() === '<<<<<<< SEARCH')) return 'search-replace';
  if (lines.some((l, i) => l.startsWith('diff --git ') || (l.startsWith('--- ') && (lines[i + 1] ?? '').startsWith('+++ ')))) return 'unified';
  return null;
}

/** One JSON edit object (SPEC.md section 9), or null when it is not one. */
function jsonEdit(v: unknown): Edit | null {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const p = o.path;
  if (typeof p !== 'string') return null;
  const need = (tree: Tree): string => {
    if (!safe(p)) throw new Fail('unsafe', p);
    const t = tree.get(p);
    if (t === null) throw new Fail('missing', p);
    return t;
  };
  if (o.command === 'create') {
    if (typeof o.file_text !== 'string') return null;
    const text = o.file_text;
    return (tree) => {
      if (!safe(p)) throw new Fail('unsafe', p);
      if (tree.get(p) !== null) throw new Fail('exists', p);
      tree.now.set(p, text);
    };
  }
  if (o.command === 'str_replace') {
    if (typeof o.old_str !== 'string' || o.old_str === '') return null;
    if (o.new_str !== undefined && typeof o.new_str !== 'string') return null;
    const oldStr = o.old_str;
    const newStr = (o.new_str as string | undefined) ?? '';
    return (tree) => {
      const before = need(tree);
      const nl = before.indexOf('\n');
      const crlf = nl > 0 && before[nl - 1] === '\r';
      const toLf = (s: string): string => (crlf ? s.replaceAll('\r\n', '\n') : s);
      const text = toLf(before);
      const old = toLf(oldStr);
      let n = 0;
      let at = -1;
      for (let k = text.indexOf(old); k >= 0; k = text.indexOf(old, k + 1)) {
        if (at < 0) at = k;
        n += 1;
      }
      if (n === 0) throw new Fail('no-match', p);
      if (n > 1) throw new Fail('ambiguous', p);
      const out = text.slice(0, at) + toLf(newStr) + text.slice(at + old.length);
      tree.now.set(p, crlf ? out.replaceAll('\n', '\r\n') : out);
    };
  }
  if (o.command === 'insert') {
    if (typeof o.insert_line !== 'number' || !Number.isInteger(o.insert_line)) return null;
    if (typeof o.new_str !== 'string') return null;
    const atLine = o.insert_line;
    const add = patchLines(o.new_str);
    return (tree) => {
      const before = need(tree);
      const fl = splitFile(before);
      if (atLine < 0 || atLine > fl.lines.length) throw new Fail('no-match', p);
      const lines = [...fl.lines];
      lines.splice(atLine, 0, ...add);
      tree.now.set(p, joinFile(lines, fl.br, fl.fin));
    };
  }
  return null;
}

function parseJson(text: string, lines: string[]): Edit[] {
  const first = lines.findIndex((l) => !blank(l));
  if (first < 0) throw new Exit2('error: parse 1');
  const edits: Edit[] = [];
  if ((lines[first] as string).trimStart().startsWith('[')) {
    let v: unknown;
    try {
      v = JSON.parse(text);
    } catch {
      throw new Exit2(`error: parse ${first + 1}`);
    }
    if (!Array.isArray(v)) throw new Exit2(`error: parse ${first + 1}`);
    for (const x of v) {
      const e = jsonEdit(x);
      if (e === null) throw new Exit2(`error: parse ${first + 1}`);
      edits.push(e);
    }
    if (edits.length === 0) throw new Exit2('error: parse 1');
    return edits;
  }
  lines.forEach((l, i) => {
    if (blank(l)) return;
    let e: Edit | null = null;
    try {
      e = jsonEdit(JSON.parse(l));
    } catch {
      e = null;
    }
    if (e === null) throw new Exit2(`error: parse ${i + 1}`);
    edits.push(e);
  });
  if (edits.length === 0) throw new Exit2('error: parse 1');
  return edits;
}

/** One hunk body line. */
interface HunkItem {
  kind: 'ctx' | 'old' | 'new' | 'bs';
  text: string;
}

interface Hunk {
  a: number;
  items: HunkItem[];
}

interface UniSection {
  hunks: Hunk[];
  create: boolean;
  remove: boolean;
  headerOld: string | null;
  headerNew: string | null;
  renameOld: string | null;
  renameNew: string | null;
  diffOld: string | null;
  diffNew: string | null;
}

function stripAB(p: string): string {
  if (p.startsWith('a/') || p.startsWith('b/')) return p.slice(2);
  return p;
}

/** A ---/+++ path: text after the first four characters, up to the first tab, trimmed. */
function headerPath(line: string): string | null {
  const rest = line.slice(4);
  const cut = rest.indexOf('\t');
  const t = (cut >= 0 ? rest.slice(0, cut) : rest).trim();
  return t === '/dev/null' ? null : stripAB(t);
}

function hunkParts(h: Hunk): { o: PairLine[]; n: PairLine[] } {
  const o: PairLine[] = [];
  const n: PairLine[] = [];
  for (const it of h.items) {
    if (it.kind === 'ctx') {
      o.push({ text: it.text, ctx: true });
      n.push({ text: it.text, ctx: true });
    } else if (it.kind === 'old') o.push({ text: it.text, ctx: false });
    else if (it.kind === 'new') n.push({ text: it.text, ctx: false });
  }
  return { o, n };
}

/** True when a `\` line follows the hunk's last context or `+` line. */
function hunkNoEol(h: Hunk): boolean {
  let last = -1;
  h.items.forEach((it, idx) => {
    if (it.kind === 'ctx' || it.kind === 'new') last = idx;
  });
  if (last < 0) return false;
  return h.items[last + 1]?.kind === 'bs';
}

/** Apply a section's hunks in order to a file's lines, tracking the final break. */
function applyHunks(lines0: string[], fin0: boolean, hunks: Hunk[], strict: boolean, path: string): { lines: string[]; fin: boolean } {
  let lines = lines0;
  let fin = fin0;
  let d = 0;
  for (const h of hunks) {
    const { o, n } = hunkParts(h);
    if (o.length > 0) {
      const found = findTier(lines, o.map((x) => x.text), strict);
      if (found === null) throw new Fail('no-match', path);
      const target = h.a - 1 + d;
      let best = found.pos[0] as number;
      let bestDist = Math.abs(best - target);
      for (const p of found.pos) {
        const dist = Math.abs(p - target);
        if (dist < bestDist) {
          best = p;
          bestDist = dist;
        }
      }
      const rep = buildReplacement(lines, best, o, n, found.tier);
      const runsToEnd = best + o.length === lines.length;
      lines = [...lines.slice(0, best), ...rep, ...lines.slice(best + o.length)];
      if (runsToEnd) fin = !hunkNoEol(h);
    } else {
      const wasLen = lines.length;
      const at = Math.min(Math.max(h.a + d, 0), wasLen);
      lines = [...lines.slice(0, at), ...n.map((x) => x.text), ...lines.slice(at)];
      if (at === wasLen) fin = !hunkNoEol(h);
    }
    d += n.length - o.length;
  }
  return { lines, fin };
}

function unifiedEdit(s: UniSection, strict: boolean): Edit {
  const oldP = s.headerOld ?? s.renameOld ?? s.diffOld;
  const newP = s.headerNew ?? s.renameNew ?? s.diffNew;
  return (tree) => {
    if (oldP !== null && !safe(oldP)) throw new Fail('unsafe', oldP);
    if (newP !== null && !safe(newP)) throw new Fail('unsafe', newP);
    if (oldP === null && newP === null) return;
    if ((oldP === null || s.create) && newP !== null) {
      const np = newP;
      if (tree.get(np) !== null) throw new Fail('exists', np);
      const added: string[] = [];
      for (const h of s.hunks) for (const it of h.items) if (it.kind === 'new') added.push(it.text);
      let eol = true;
      outer: for (let hi = s.hunks.length - 1; hi >= 0; hi--) {
        const h = s.hunks[hi] as Hunk;
        for (let ii = h.items.length - 1; ii >= 0; ii--) {
          if ((h.items[ii] as HunkItem).kind === 'new') {
            eol = h.items[ii + 1]?.kind !== 'bs';
            break outer;
          }
        }
      }
      tree.now.set(np, added.length === 0 ? '' : added.join('\n') + (eol ? '\n' : ''));
      return;
    }
    if ((newP === null || s.remove) && oldP !== null) {
      const op = oldP;
      if (tree.get(op) === null) throw new Fail('missing', op);
      tree.now.set(op, null);
      return;
    }
    const op = oldP as string;
    const np = newP as string;
    const cur = tree.get(op);
    if (cur === null) throw new Fail('missing', op);
    if (op !== np && tree.get(np) !== null) throw new Fail('exists', np);
    const fl = splitFile(cur);
    const out = applyHunks(fl.lines, fl.fin, s.hunks, strict, op);
    const text = joinFile(out.lines, fl.br, out.fin);
    if (op !== np) {
      tree.now.set(np, text);
      tree.now.set(op, null);
      moves.push([op, np]);
    } else {
      tree.now.set(op, text);
    }
  };
}

function parseUnified(lines: string[], strict: boolean): Edit[] {
  const sections: UniSection[] = [];
  let i = 0;
  let cur: UniSection | null = null;
  let inHeader = false;
  const fresh = (): UniSection => ({
    hunks: [],
    create: false,
    remove: false,
    headerOld: null,
    headerNew: null,
    renameOld: null,
    renameNew: null,
    diffOld: null,
    diffNew: null,
  });
  const parseHunk = (): Hunk => {
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(lines[i] as string);
    if (m === null) throw new Exit2(`error: parse ${i + 1}`);
    const a = parseInt(m[1] as string, 10);
    i += 1;
    const items: HunkItem[] = [];
    while (i < lines.length) {
      const l = lines[i] as string;
      if (l.startsWith('diff --git ')) break;
      if (l.startsWith('--- ') && (lines[i + 1] ?? '').startsWith('+++ ')) break;
      if (l.startsWith(' ')) {
        items.push({ kind: 'ctx', text: l.slice(1) });
        i += 1;
        continue;
      }
      if (l.startsWith('-')) {
        items.push({ kind: 'old', text: l.slice(1) });
        i += 1;
        continue;
      }
      if (l.startsWith('+')) {
        items.push({ kind: 'new', text: l.slice(1) });
        i += 1;
        continue;
      }
      if (l.startsWith('\\')) {
        items.push({ kind: 'bs', text: l.slice(1) });
        i += 1;
        continue;
      }
      if (l === '') {
        items.push({ kind: 'ctx', text: '' });
        i += 1;
        continue;
      }
      break;
    }
    while (items.length > 0) {
      const last = items[items.length - 1] as HunkItem;
      if (last.kind === 'ctx' && last.text === '') items.pop();
      else break;
    }
    return { a, items };
  };
  while (i < lines.length) {
    const l = lines[i] as string;
    if (l.startsWith('diff --git ')) {
      const m = /^diff --git a\/(.*?) b\/(.*?)[ \t]*$/.exec(l);
      if (m === null || m[1] === '' || m[2] === '') throw new Exit2(`error: parse ${i + 1}`);
      const s = fresh();
      s.diffOld = m[1] as string;
      s.diffNew = m[2] as string;
      sections.push(s);
      cur = s;
      inHeader = true;
      i += 1;
      continue;
    }
    if (l.startsWith('--- ') && (lines[i + 1] ?? '').startsWith('+++ ')) {
      // A section holds one header pair: a further pair starts a new section.
      if (cur !== null && inHeader && cur.headerOld === null && cur.headerNew === null) {
        cur.headerOld = headerPath(l);
        cur.headerNew = headerPath(lines[i + 1] as string);
        i += 2;
        continue;
      }
      const s = fresh();
      s.headerOld = headerPath(l);
      s.headerNew = headerPath(lines[i + 1] as string);
      sections.push(s);
      cur = s;
      inHeader = true;
      i += 2;
      continue;
    }
    if (l.startsWith('@@')) {
      if (cur === null) throw new Exit2(`error: parse ${i + 1}`);
      cur.hunks.push(parseHunk());
      inHeader = false;
      continue;
    }
    if (cur !== null && inHeader) {
      if (l.startsWith('--- ')) throw new Exit2(`error: parse ${i + 2}`);
      if (l.startsWith('rename from ')) {
        cur.renameOld = l.slice(12).trim();
        i += 1;
        continue;
      }
      if (l.startsWith('rename to ')) {
        cur.renameNew = l.slice(10).trim();
        i += 1;
        continue;
      }
      if (l.startsWith('new file mode')) {
        cur.create = true;
        i += 1;
        continue;
      }
      if (l.startsWith('deleted file mode')) {
        cur.remove = true;
        i += 1;
        continue;
      }
      i += 1;
      continue;
    }
    i += 1;
  }
  if (sections.length === 0) throw new Exit2('error: parse 1');
  return sections.map((s) => unifiedEdit(s, strict));
}

function srEdit(path: string, oldLines: string[], newLines: string[], strict: boolean): Edit {
  return (tree) => {
    if (!safe(path)) throw new Fail('unsafe', path);
    if (oldLines.length === 0) {
      if (tree.get(path) !== null) throw new Fail('exists', path);
      tree.now.set(path, newLines.length === 0 ? '' : newLines.join('\n') + '\n');
      return;
    }
    const cur = tree.get(path);
    if (cur === null) throw new Fail('missing', path);
    const fl = splitFile(cur);
    const found = findTier(fl.lines, oldLines, strict);
    if (found === null) throw new Fail('no-match', path);
    if (found.pos.length > 1) throw new Fail('ambiguous', path);
    const at = found.pos[0] as number;
    const rep = buildReplacement(
      fl.lines,
      at,
      oldLines.map((t) => ({ text: t, ctx: false })),
      newLines.map((t) => ({ text: t, ctx: false })),
      found.tier,
    );
    const out = [...fl.lines.slice(0, at), ...rep, ...fl.lines.slice(at + oldLines.length)];
    tree.now.set(path, joinFile(out, fl.br, fl.fin));
  };
}

function parseSearchReplace(lines: string[], strict: boolean): Edit[] {
  const edits: Edit[] = [];
  let floor = 0;
  let prevPath: string | null = null;
  let i = 0;
  while (i < lines.length) {
    if ((lines[i] as string).trimEnd() !== '<<<<<<< SEARCH') {
      i += 1;
      continue;
    }
    const searchLine = i + 1;
    let path: string | null = null;
    for (let j = i - 1; j >= floor; j--) {
      const l = lines[j] as string;
      if (blank(l)) continue;
      if (l.trim().startsWith('```')) continue;
      path = l.trim();
      break;
    }
    if (path === null) {
      path = prevPath;
      if (path === null) throw new Exit2(`error: parse ${searchLine}`);
    }
    let sep = -1;
    let end = -1;
    for (let k = i + 1; k < lines.length; k++) {
      const t = (lines[k] as string).trimEnd();
      if (sep < 0 && t === '=======') {
        sep = k;
        continue;
      }
      if (t === '>>>>>>> REPLACE') {
        end = k;
        break;
      }
    }
    if (sep < 0 || end < 0) throw new Exit2(`error: parse ${searchLine}`);
    const oldLines = lines.slice(i + 1, sep);
    const newLines = lines.slice(sep + 1, end);
    edits.push(srEdit(path, oldLines, newLines, strict));
    prevPath = path;
    floor = end + 1;
    i = end + 1;
  }
  if (edits.length === 0) throw new Exit2('error: parse 1');
  return edits;
}

interface VChunk {
  anchor: string | null;
  items: HunkItem[];
  eof: boolean;
}

/** First occurrence of old at or after `cursor` at the first tier with one. */
function findChunk(lines: string[], old: string[], cursor: number, eof: boolean, strict: boolean): { tier: number; pos: number } | null {
  const top = strict ? 0 : 2;
  for (let t = 0; t <= top; t++) {
    if (eof) {
      const at = lines.length - old.length;
      if (at >= cursor && at >= 0) {
        let ok = true;
        for (let j = 0; j < old.length; j++) {
          if (!lineEq(lines[at + j] as string, old[j] as string, t)) {
            ok = false;
            break;
          }
        }
        if (ok) return { tier: t, pos: at };
      }
    } else {
      const pos = occurrences(lines, old, t).filter((p) => p >= cursor);
      if (pos.length > 0) return { tier: t, pos: pos[0] as number };
    }
  }
  return null;
}

function v4aAddEdit(path: string, fileLines: string[]): Edit {
  return (tree) => {
    if (!safe(path)) throw new Fail('unsafe', path);
    if (tree.get(path) !== null) throw new Fail('exists', path);
    tree.now.set(path, fileLines.length === 0 ? '' : fileLines.join('\n') + '\n');
  };
}

function v4aDeleteEdit(path: string): Edit {
  return (tree) => {
    if (!safe(path)) throw new Fail('unsafe', path);
    if (tree.get(path) === null) throw new Fail('missing', path);
    tree.now.set(path, null);
  };
}

function v4aUpdateEdit(path: string, moveTo: string | null, chunks: VChunk[], strict: boolean): Edit {
  return (tree) => {
    if (!safe(path)) throw new Fail('unsafe', path);
    if (moveTo !== null && !safe(moveTo)) throw new Fail('unsafe', moveTo);
    const cur = tree.get(path);
    if (cur === null) throw new Fail('missing', path);
    if (moveTo !== null && tree.get(moveTo) !== null) throw new Fail('exists', moveTo);
    const fl = splitFile(cur);
    let lines = fl.lines;
    let cursor = 0;
    for (const ch of chunks) {
      if (ch.anchor !== null && ch.anchor !== '') {
        const a = findSingle(lines, ch.anchor, cursor, strict);
        if (a === null) throw new Fail('no-match', path);
        cursor = a.pos + 1;
      }
      const o: PairLine[] = [];
      const n: PairLine[] = [];
      for (const it of ch.items) {
        if (it.kind === 'ctx') {
          o.push({ text: it.text, ctx: true });
          n.push({ text: it.text, ctx: true });
        } else if (it.kind === 'old') o.push({ text: it.text, ctx: false });
        else if (it.kind === 'new') n.push({ text: it.text, ctx: false });
      }
      if (o.length > 0) {
        const found = findChunk(lines, o.map((x) => x.text), cursor, ch.eof, strict);
        if (found === null) throw new Fail('no-match', path);
        const rep = buildReplacement(lines, found.pos, o, n, found.tier);
        lines = [...lines.slice(0, found.pos), ...rep, ...lines.slice(found.pos + o.length)];
        cursor = found.pos + rep.length;
      } else {
        const at = ch.eof ? lines.length : cursor;
        lines = [...lines.slice(0, at), ...n.map((x) => x.text), ...lines.slice(at)];
        cursor = at + n.length;
      }
    }
    const out = joinFile(lines, fl.br, fl.fin);
    if (moveTo !== null) {
      tree.now.set(moveTo, out);
      tree.now.set(path, null);
      moves.push([path, moveTo]);
    } else {
      tree.now.set(path, out);
    }
  };
}

function parseV4a(lines: string[], strict: boolean): Edit[] {
  const first = lines.findIndex((l) => !blank(l));
  if (first < 0) throw new Exit2('error: parse 1');
  if ((lines[first] as string).trim() !== '*** Begin Patch') throw new Exit2(`error: parse ${first + 1}`);
  let last = -1;
  for (let k = lines.length - 1; k >= 0; k--) {
    if (!blank(lines[k] as string)) {
      last = k;
      break;
    }
  }
  if ((lines[last] as string).trim() !== '*** End Patch') throw new Exit2(`error: parse ${lines.length + 1}`);
  const edits: Edit[] = [];
  const isSectionStart = (l: string): boolean =>
    l.startsWith('*** Add File: ') || l.startsWith('*** Delete File: ') || l.startsWith('*** Update File: ');
  let i = first + 1;
  while (i < last) {
    const l = lines[i] as string;
    if (blank(l)) {
      i += 1;
      continue;
    }
    if (l.startsWith('*** Add File: ')) {
      const path = l.slice(14).trim();
      i += 1;
      const fileLines: string[] = [];
      while (i < last) {
        const s = lines[i] as string;
        if (isSectionStart(s)) break;
        if (s.startsWith('+')) {
          fileLines.push(s.slice(1));
          i += 1;
          continue;
        }
        if (s === '') {
          fileLines.push('');
          i += 1;
          continue;
        }
        throw new Exit2(`error: parse ${i + 1}`);
      }
      while (fileLines.length > 0 && fileLines[fileLines.length - 1] === '') fileLines.pop();
      edits.push(v4aAddEdit(path, fileLines));
      continue;
    }
    if (l.startsWith('*** Delete File: ')) {
      const path = l.slice(17).trim();
      i += 1;
      edits.push(v4aDeleteEdit(path));
      continue;
    }
    if (l.startsWith('*** Update File: ')) {
      const path = l.slice(17).trim();
      const updateLine = i + 1;
      i += 1;
      let moveTo: string | null = null;
      const chunks: VChunk[] = [];
      let cur: VChunk | null = null;
      let seenContent = false;
      while (i < last) {
        const s = lines[i] as string;
        if (isSectionStart(s)) break;
        if (!seenContent && s.startsWith('*** Move to: ')) {
          moveTo = s.slice(13).trim();
          seenContent = true;
          i += 1;
          continue;
        }
        if (s.trim() === '*** End of File') {
          if (cur === null) throw new Exit2(`error: parse ${i + 1}`);
          cur.eof = true;
          chunks.push(cur);
          cur = null;
          seenContent = true;
          i += 1;
          continue;
        }
        if (s.startsWith('@@')) {
          if (cur !== null) chunks.push(cur);
          cur = { anchor: s.slice(2).trim(), items: [], eof: false };
          seenContent = true;
          i += 1;
          continue;
        }
        if (s.startsWith(' ') || s.startsWith('-') || s.startsWith('+')) {
          if (cur === null) {
            if (chunks.length > 0) throw new Exit2(`error: parse ${i + 1}`);
            cur = { anchor: null, items: [], eof: false };
          }
          seenContent = true;
          const kind = s.startsWith(' ') ? 'ctx' : s.startsWith('-') ? 'old' : 'new';
          cur.items.push({ kind, text: s.slice(1) });
          i += 1;
          continue;
        }
        if (s === '') {
          if (cur !== null) {
            cur.items.push({ kind: 'ctx', text: '' });
            seenContent = true;
            i += 1;
            continue;
          }
          i += 1;
          continue;
        }
        throw new Exit2(`error: parse ${i + 1}`);
      }
      if (cur !== null) chunks.push(cur);
      if (chunks.length > 0) {
        const lc = chunks[chunks.length - 1] as VChunk;
        while (lc.items.length > 0) {
          const li = lc.items[lc.items.length - 1] as HunkItem;
          if (li.kind === 'ctx' && li.text === '') lc.items.pop();
          else break;
        }
      }
      if (chunks.length === 0 && moveTo === null) throw new Exit2(`error: parse ${updateLine}`);
      edits.push(v4aUpdateEdit(path, moveTo, chunks, strict));
      continue;
    }
    throw new Exit2(`error: parse ${i + 1}`);
  }
  if (edits.length === 0) throw new Exit2('error: parse 1');
  return edits;
}

function run(args: string[]): { code: number; out: string[] } {
  moves.length = 0;
  let format: string | null = null;
  let check = false;
  let strict = false;
  const pos: string[] = [];
  let ended = false;
  for (const a of args) {
    if (!ended && a === '--') ended = true;
    else if (!ended && a.startsWith('-') && a !== '-') {
      if (a.startsWith('--format=') && format === null && FORMATS.includes(a.slice(9))) format = a.slice(9);
      else if (a === '--check' && !check) check = true;
      else if (a === '--strict' && !strict) strict = true;
      else return { code: 2, out: ['error: usage'] };
    } else pos.push(a);
  }
  if (pos.length > 1) return { code: 2, out: ['error: usage'] };
  const file = pos.length === 0 || pos[0] === '-' ? null : (pos[0] as string);
  let text = '';
  try {
    text = readFileSync(file ?? 0, 'utf8');
  } catch {
    if (file !== null) return { code: 2, out: ['error: no-patch'] };
  }
  const lines = patchLines(text);
  const kind = format === null || format === 'auto' ? detect(lines) : format;
  if (kind === null) return { code: 2, out: ['error: format'] };
  let edits: Edit[];
  try {
    if (kind === 'json') edits = parseJson(text, lines);
    else if (kind === 'unified') edits = parseUnified(lines, strict);
    else if (kind === 'search-replace') edits = parseSearchReplace(lines, strict);
    else edits = parseV4a(lines, strict);
  } catch (e) {
    if (e instanceof Exit2) return { code: 2, out: [e.line] };
    throw e;
  }
  const tree = new Tree();
  const fails: Fail[] = [];
  for (const edit of edits) {
    const before = new Map(tree.now);
    const movesBefore = moves.length;
    try {
      edit(tree);
    } catch (e) {
      if (!(e instanceof Fail)) throw e;
      tree.now.clear();
      for (const [k, v] of before) tree.now.set(k, v);
      moves.length = movesBefore;
      fails.push(e);
    }
  }
  if (fails.length > 0) {
    return { code: 1, out: [...fails.map((f) => `error: ${f.code} ${f.path}`), `failed: ${fails.length} of ${edits.length} edits`] };
  }
  const rows: Array<{ key: string; line: string }> = [];
  const rOld = new Set<string>();
  const rNew = new Set<string>();
  for (const [o, n] of moves) {
    if (tree.original(o) !== null && tree.get(o) === null && tree.original(n) === null && tree.get(n) !== null) {
      rOld.add(o);
      rNew.add(n);
      rows.push({ key: n, line: `R ${o} -> ${n}` });
    }
  }
  for (const p of [...tree.now.keys()]) {
    const was = tree.original(p);
    const now = tree.now.get(p) as string | null;
    if (was === now) continue;
    if (rOld.has(p) || rNew.has(p)) continue;
    rows.push({ key: p, line: `${was === null ? 'A' : now === null ? 'D' : 'M'} ${p}` });
  }
  rows.sort((a, b) => Buffer.compare(Buffer.from(a.key, 'utf8'), Buffer.from(b.key, 'utf8')));
  if (!check) {
    for (const p of [...tree.now.keys()]) {
      const was = tree.original(p);
      const now = tree.now.get(p) as string | null;
      if (was === now) continue;
      if (now === null) rmSync(p, { force: true });
      else {
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, now);
      }
    }
  }
  const out = rows.map((r) => r.line);
  out.push(`ok: ${rows.length} ${rows.length === 1 ? 'file' : 'files'}`);
  return { code: 0, out };
}

const trialEnv = process.env.MAKEFUN_ENV_URL;
if (trialEnv !== undefined && trialEnv !== '') {
  // A trial: the kit's runner reads the checks from the env and runs this file on each one, without this variable.
  const { runTrial } = await import('./runner.ts');
  await runTrial(trialEnv);
} else {
  const r = run(process.argv.slice(2));
  writeSync(1, r.out.map((l) => `${l}\n`).join(''));
  process.exitCode = r.code;
}
