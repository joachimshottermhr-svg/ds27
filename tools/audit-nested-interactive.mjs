/**
 * An interactive element nested inside another one.
 *
 * `<button>` inside `<button>`, or anything focusable inside an `<a>`, is invalid HTML.
 * The parser closes the outer element at the inner start tag and ejects everything after
 * it, so the trailing half of a card lands outside the component. It looks fine in a
 * template string and only breaks once a browser parses it - which is exactly why it
 * survives review.
 *
 * This library ships HTML examples, so the examples are what get checked: every markup
 * block in docs/*.md, plus the snapshot pages in .figma/.
 *
 *   node tools/audit-nested-interactive.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const INTERACTIVE = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary']);
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** Collect the HTML to check: fenced html blocks in docs, and the snapshot pages. */
function targets() {
  const out = [];
  if (fs.existsSync('docs')) {
    for (const f of fs.readdirSync('docs').filter((n) => n.endsWith('.md'))) {
      const text = fs.readFileSync(path.join('docs', f), 'utf8');
      const lines = text.split('\n');
      let open = null;
      let buf = [];
      lines.forEach((ln, i) => {
        if (open === null && /^```html\s*$/.test(ln.trim())) { open = i + 2; buf = []; return; }
        if (open !== null && /^```\s*$/.test(ln.trim())) {
          out.push({ file: path.join('docs', f), offset: open, html: buf.join('\n') });
          open = null;
          return;
        }
        if (open !== null) buf.push(ln);
      });
    }
  }
  if (fs.existsSync('.figma')) {
    for (const f of fs.readdirSync('.figma').filter((n) => n.endsWith('.html'))) {
      out.push({ file: path.join('.figma', f), offset: 1, html: fs.readFileSync(path.join('.figma', f), 'utf8') });
    }
  }
  return out;
}

/**
 * Walk tags with a stack. Not a regex over the whole document: a regex cannot tell an
 * `<a>` that closed from one that is still open, which is the entire question here.
 */
function scan(html) {
  const hits = [];
  const stack = [];
  const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  while ((m = TAG.exec(html))) {
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    const attrs = m[3] || '';
    const selfClosing = /\/\s*$/.test(attrs) || VOID.has(name);
    const line = html.slice(0, m.index).split('\n').length;

    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) { stack.length = i; break; }
      }
      continue;
    }

    const focusable = INTERACTIVE.has(name) || /\btabindex\s*=\s*["']?0/.test(attrs);
    if (focusable) {
      const host = stack.find((s) => INTERACTIVE.has(s.name));
      if (host) hits.push({ line, inner: name, host: host.name, hostLine: host.line });
    }
    if (!selfClosing) stack.push({ name, line });
  }
  return hits;
}

const found = [];
for (const t of targets()) {
  for (const h of scan(t.html)) {
    found.push({ file: t.file, line: t.offset + h.line - 1, ...h });
  }
}

const checked = targets().length;
if (!found.length) {
  console.log(`nested-interactive: clean - ${checked} markup block(s)`);
  process.exit(0);
}
console.error(`nested-interactive: ${found.length} invalid nesting(s)`);
for (const f of found) console.error(`  ${f.file}:${f.line}  <${f.inner}> inside <${f.host}>`);
process.exit(1);
