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
const EXT = new Set(['.css', '.mjs', '.js', '.md', '.json', '.html']);

/**
 * Root-level docs are DISCOVERED, not listed.
 *
 * This used to be a hand-written list of README.md and FINDINGS.md. STATUS.md was added
 * later, was not added to the list, and immediately picked up a UTF-8 BOM from PowerShell's
 * `-Encoding utf8` - the exact failure this audit exists to catch, sitting in the repo
 * unreported because the audit was not looking at that file.
 *
 * An allowlist of things to check is only ever as current as the last person to remember
 * it. Scan the directory instead.
 */
const targets = fs.readdirSync('.', { withFileTypes: true })
  .filter((e) => e.isFile() && EXT.has(path.extname(e.name)))
  .map((e) => e.name);
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
