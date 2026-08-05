/**
 * Every source file must be ASCII.
 *
 * A single non-ASCII byte - a smart quote pasted from Figma, an en dash from a shell
 * that defaulted to the ANSI codepage - propagates into the generated docs and from
 * there into the consumer bundle, where it surfaces as mojibake to someone who has no
 * idea where it came from. It is trivial to prevent at the source and expensive to
 * chase downstream, so it fails the build.
 *
 *   node tools/audit-ascii.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src', 'tools', 'docs', 'export', 'tokens'];
const FILES = ['README.md', 'FINDINGS.md'];
const EXT = new Set(['.css', '.mjs', '.js', '.md', '.json', '.html']);

const targets = [...FILES.filter((f) => fs.existsSync(f))];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (EXT.has(path.extname(e.name))) targets.push(p);
    }
  };
  walk(root);
}

const hits = [];
for (const f of targets) {
  const buf = fs.readFileSync(f);
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] <= 127) continue;
    const upto = buf.slice(0, i).toString('latin1');
    const line = upto.split('\n').length;
    const col = i - upto.lastIndexOf('\n');
    hits.push({ file: f, line, col, byte: buf[i] });
    break; // one report per file is enough to act on
  }
}

if (!hits.length) {
  console.log(`ascii: clean - ${targets.length} files`);
  process.exit(0);
}
console.error(`ascii: ${hits.length} file(s) contain non-ASCII bytes`);
for (const h of hits) console.error(`  ${h.file}:${h.line}:${h.col}  byte 0x${h.byte.toString(16)}`);
process.exit(1);
