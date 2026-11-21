// csv-reader-speed-01: a faster drop-in for make.fun's own csv-reader 1.0.0.
// run(input) returns exactly csv-reader 1.0.0's answer {columns, rows, errors}
// for every input {text, header}: same broken-row policy, same error records,
// same order. Single pass, left to right; no regex, no per-character loop on
// the hot path: unquoted fields are found with indexOf and taken as slices,
// quoted fields jump from quote to quote with indexOf. Only segments that
// actually hold a CR are walked character by character (stray CRs are rare).

/** csv-reader 1.0.0's answer for one case's input. */
export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;

  const n = text.length;
  let pos = 0; // the next character to read
  let line = 1; // the line that character is on
  if (n > 0 && text.charCodeAt(0) === 0xfeff) pos = 1;

  // The record being read: the line it starts on and the index in rows it takes (null: the header).
  let recordLine = 1;
  let recordRow = null;

  function error(code) {
    errors.push({ code, line: recordLine, row: recordRow });
  }

  // How a field ended: 1 at a comma (the record goes on), 2 at a line break or
  // 3 at the end of the text (the record ends).
  const COMMA = 1;
  const LINE_BREAK = 2;
  const END = 3;

  // Reads unquoted characters onto `value` up to the next comma or line break:
  // a CR not followed by LF is dropped (stray_cr). Returns the field, how it
  // ended and how many characters were kept (`added`).
  function readUnquoted(value) {
    let added = 0;
    let segStart = pos;
    const comma = text.indexOf(',', pos);
    const lf = text.indexOf('\n', pos);
    let end;
    let ended;
    if (lf !== -1 && (comma === -1 || lf < comma)) {
      end = lf;
      ended = LINE_BREAK;
    } else if (comma !== -1) {
      end = comma;
      ended = COMMA;
    } else {
      end = n;
      ended = END;
    }
    // A CR just before the LF is the CRLF terminator, not part of the field.
    let segEnd = end;
    if (ended === LINE_BREAK && end > segStart && text.charCodeAt(end - 1) === 13) segEnd = end - 1;
    if (segEnd > segStart) {
      const seg = text.slice(segStart, segEnd);
      if (seg.indexOf('\r') === -1) {
        value += seg;
        added += segEnd - segStart;
      } else {
        // Rare: stray CRs inside the field; drop each one (stray_cr) and keep the rest.
        let j = segStart;
        for (let i = segStart; i < segEnd; i++) {
          if (text.charCodeAt(i) === 13) {
            if (i > j) {
              value += text.slice(j, i);
              added += i - j;
            }
            error('stray_cr');
            j = i + 1;
          }
        }
        if (segEnd > j) {
          value += text.slice(j, segEnd);
          added += segEnd - j;
        }
      }
    }
    if (ended === COMMA) {
      pos = end + 1;
    } else if (ended === LINE_BREAK) {
      pos = end + 1;
      line += 1;
    } else {
      pos = n;
    }
    return { value, ended, added };
  }

  // Appends text[a..b) from inside a quoted field onto `value`: each CRLF or
  // lone CR inside it is read as one LF (and counts one line). Segments with
  // no CR or LF are taken as one slice; only a segment that holds a line
  // break is walked character by character.
  function appendQuotedSeg(value, a, b) {
    if (b <= a) return value;
    const seg = text.slice(a, b);
    if (seg.indexOf('\r') === -1 && seg.indexOf('\n') === -1) return value + seg;
    let out = value;
    let j = a;
    for (let i = a; i < b; i++) {
      const c = text.charCodeAt(i);
      if (c === 13) {
        out += text.slice(j, i) + '\n';
        line += 1;
        if (text.charCodeAt(i + 1) === 10) i += 1;
        j = i + 1;
      } else if (c === 10) {
        out += text.slice(j, i) + '\n';
        line += 1;
        j = i + 1;
      }
    }
    if (b > j) out += text.slice(j, b);
    return out;
  }

  // Reads a quoted field whose opening quote is at pos.
  function readQuoted() {
    const open = pos;
    const openLine = line;
    let value = '';
    let segStart = pos + 1;
    let q = pos + 1;
    for (;;) {
      q = text.indexOf('"', q);
      if (q === -1) {
        // The quote never closes: it is a literal character, and the text
        // after it is read again as unquoted.
        pos = open + 1;
        line = openLine;
        error('unterminated_quote');
        return readUnquoted('"');
      }
      if (text.charCodeAt(q + 1) === 34) {
        // A doubled quote is one quote inside the field.
        value = appendQuotedSeg(value, segStart, q);
        value += '"';
        q += 2;
        segStart = q;
        continue;
      }
      // The closing quote.
      value = appendQuotedSeg(value, segStart, q);
      pos = q + 1;
      break;
    }
    if (pos >= n) return { value, ended: END, added: 0 };
    const c = text.charCodeAt(pos);
    if (c === 44) {
      pos += 1;
      return { value, ended: COMMA, added: 0 };
    }
    if (c === 10) {
      pos += 1;
      line += 1;
      return { value, ended: LINE_BREAK, added: 0 };
    }
    if (c === 13 && text.charCodeAt(pos + 1) === 10) {
      pos += 2;
      line += 1;
      return { value, ended: LINE_BREAK, added: 0 };
    }
    // What follows the closing quote is appended as it stands, up to the next
    // comma or line break.
    const junk = readUnquoted(value);
    if (junk.added > 0) error('quote_junk');
    return junk;
  }

  // Files one record's fields away: a line that held only stray CRs is no
  // record; the first record sets the width (and becomes the columns when
  // header is true); later records are padded (short_row) or cut
  // (long_row) to that width.
  function finishRecord(fields, quoted) {
    // A line that held only stray CRs is left with no characters: no record (its stray_cr errors stay).
    if (fields.length === 1 && fields[0] === '' && !quoted) return;
    if (width < 0) width = fields.length;
    if (header && columns === null) {
      columns = fields;
      return;
    }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  for (;;) {
    // Lines with no characters are no records.
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === 10) {
        pos += 1;
        line += 1;
      } else if (c === 13 && text.charCodeAt(pos + 1) === 10) {
        pos += 2;
        line += 1;
      } else {
        break;
      }
    }
    if (pos >= n) break;

    recordLine = line;
    recordRow = header && columns === null ? null : rows.length;

    // Fast path: a record with no quote at all on its line holds no quoted
    // field, so no field spans a line and no quote needs reading; when it
    // also holds no CR except a trailing CRLF, its fields are just the line
    // split at commas (String.split runs in C++). Anything else falls
    // through to the field-by-field reader below.
    const lf = text.indexOf('\n', pos);
    const spanEnd = lf === -1 ? n : lf;
    const span = text.slice(pos, spanEnd);
    if (span.indexOf('"') === -1) {
      const cr = span.indexOf('\r');
      if (cr === -1 || (lf !== -1 && cr === span.length - 1)) {
        const fields = (cr === -1 ? span : span.slice(0, -1)).split(',');
        if (lf === -1) {
          pos = n;
        } else {
          pos = lf + 1;
          line += 1;
        }
        finishRecord(fields, false);
        continue;
      }
    }

    const fields = [];
    let field;
    let quoted = false;
    do {
      quoted = text.charCodeAt(pos) === 34;
      field = quoted ? readQuoted() : readUnquoted('');
      fields.push(field.value);
    } while (field.ended === COMMA);

    finishRecord(fields, quoted);
  }
  return { columns: header ? (columns ?? []) : null, rows, errors };
}
