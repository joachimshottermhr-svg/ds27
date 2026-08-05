/**
 * A real CSS tokeniser, shared by every audit.
 *
 * Not a regular expression. A regex over CSS gets the easy 95% and then silently
 * mis-parses the cases that matter: a brace inside a string, a `/*` inside a url(),
 * a comment containing a declaration that then gets audited as if it were live code.
 * Two silent corruptions in the People First export came from regex parsing, and both
 * produced plausible output that nothing downstream could detect. Structure gets a
 * parser.
 *
 * Exports:
 *   parse(css)        -> [{ selector, decls: [{prop, value, line}], line, at }]
 *   declarations(css) -> flat list of every declaration with its owning selector
 */

/** Strip comments, preserving line numbers and byte offsets so positions stay true. */
export function stripComments(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const stop = end < 0 ? css.length : end + 2;
      // Keep newlines so every later line number still matches the source file.
      for (let k = i; k < stop; k++) out += css[k] === '\n' ? '\n' : ' ';
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      out += c;
      i++;
      while (i < css.length) {
        out += css[i];
        if (css[i] === '\\') { if (i + 1 < css.length) out += css[++i]; i++; continue; }
        if (css[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Split a declaration block on top-level semicolons - `var(--a, b)` must survive. */
function splitDecls(body, startLine, src) {
  const out = [];
  let depth = 0;
  let buf = '';
  let line = startLine;
  const push = () => {
    const text = buf.trim();
    buf = '';
    if (!text) return;
    const i = text.indexOf(':');
    if (i < 0) return;
    const prop = text.slice(0, i).trim();
    const value = text.slice(i + 1).trim().replace(/\s+/g, ' ');
    if (!prop) return;
    out.push({ prop, value, line: line });
  };
  for (const ch of body) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ';' && depth === 0) { push(); continue; }
    if (ch === '\n') line++;
    buf += ch;
  }
  push();
  return out;
}

/**
 * Walk the stylesheet brace by brace. Handles nested at-rules (@media, @supports) by
 * carrying the at-rule context down onto the rules inside it, so a rule inside a media
 * query is still audited and still knows where it lives.
 */
export function parse(css) {
  const src = stripComments(css);
  const rules = [];
  const lineAt = (idx) => src.slice(0, idx).split('\n').length;

  let i = 0;
  const stack = [];
  let buf = '';
  let bufStart = 0;

  while (i < src.length) {
    const c = src[i];
    if (c === '{') {
      const prelude = buf.trim().replace(/\s+/g, ' ');
      buf = '';
      if (prelude.startsWith('@')) {
        stack.push({ at: prelude, body: true });
        i++;
        bufStart = i;
        continue;
      }
      // find matching close brace, allowing nesting
      let depth = 1;
      let j = i + 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
        j++;
      }
      const body = src.slice(i + 1, j - 1);
      // A nested rule inside this one would contain a brace; audits only need the
      // declarations that belong to this selector, so strip nested blocks.
      const own = body.replace(/[^{}]*\{[^{}]*\}/g, '');
      rules.push({
        selector: prelude,
        at: stack.filter((s) => s.at).map((s) => s.at).join(' '),
        line: lineAt(i),
        decls: splitDecls(own, lineAt(i), src),
      });
      i = j;
      bufStart = i;
      continue;
    }
    if (c === '}') {
      stack.pop();
      buf = '';
      i++;
      bufStart = i;
      continue;
    }
    buf += c;
    i++;
  }
  return rules.filter((r) => r.selector);
}

export function declarations(css) {
  return parse(css).flatMap((r) => r.decls.map((d) => ({ ...d, selector: r.selector, at: r.at })));
}

/** '#ABC' -> '#aabbcc'; drops alpha so a value matches a token that has none. */
export function normHex(h) {
  let x = h.toLowerCase().replace('#', '');
  if (x.length === 3) x = x.split('').map((c) => c + c).join('');
  if (x.length === 4) x = x.slice(0, 3).split('').map((c) => c + c).join('');
  if (x.length === 8) x = x.slice(0, 6);
  return '#' + x;
}
