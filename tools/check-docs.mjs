/**
 * Validate the generated bundle.
 *
 * A markdown table row with the wrong number of delimiters silently shifts every cell
 * after it under the wrong heading. That is worse than having no table: the reader, human
 * or model, is confidently misled rather than merely uninformed. A pipe inside a CSS value
 * or a prop description is all it takes.
 *
 * Also checks that every class the instructions advertise actually exists in the shipped
 * CSS - an export that documents a class the stylesheet does not define is how a consumer
 * ends up with unstyled markup and no error.
 *
 *   node tools/check-docs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'export/copilot';
const DOCS = path.join(OUT, 'docs');
const model = JSON.parse(fs.readFileSync('export/model.json', 'utf8'));
const css = fs.readFileSync('src/styles.css', 'utf8');

const problems = [];
let rows = 0;

/** Every table row must have a consistent delimiter count within its own table. */
for (const f of [...fs.readdirSync(DOCS).map((n) => path.join(DOCS, n)), path.join(OUT, 'v27.instructions.md')]) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let expected = null;
  let inFence = false;
  for (const [i, line] of lines.entries()) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const t = line.trim();
    if (!t.startsWith('|')) { expected = null; continue; }
    const pipes = (t.match(/(?<!\\)\|/g) || []).length;
    rows++;
    if (expected === null) expected = pipes;
    else if (pipes !== expected) {
      problems.push(`${f}:${i + 1}  ${pipes} delimiters, table uses ${expected}  ${t.slice(0, 70)}`);
    }
  }
}

/** Every advertised class must exist in the stylesheet. */
for (const c of model.components) {
  for (const cls of c.classes) {
    if (!new RegExp(`\\.${cls}\\b`).test(css)) problems.push(`${c.name}: .${cls} is documented but not defined in src/styles.css`);
  }
}

/** The always-on file has to stay small, or the split it exists to create is pointless. */
const size = fs.statSync(path.join(OUT, 'v27.instructions.md')).size;
const LIMIT = 8 * 1024;
if (size > LIMIT) problems.push(`instructions are ${(size / 1024).toFixed(1)} KB, over the ${LIMIT / 1024} KB always-on budget`);

/**
 * The bundle must be self-contained: every stylesheet the instructions link must exist
 * inside it. This is the check the first end-to-end run needed and did not have - the
 * instructions pointed at the producing repo's paths and nothing noticed.
 */
const instructions = fs.readFileSync(path.join(OUT, 'v27.instructions.md'), 'utf8');
for (const m of instructions.matchAll(/<link[^>]*href="([^"]+)"/g)) {
  const href = m[1];
  if (/^https?:/.test(href)) continue;
  if (!fs.existsSync(path.join(OUT, href))) problems.push(`instructions link to ${href}, which is not in the bundle`);
}

/** ASCII, same reason as everywhere else. */
for (const f of [...fs.readdirSync(DOCS).map((n) => path.join(DOCS, n)), path.join(OUT, 'v27.instructions.md')]) {
  const buf = fs.readFileSync(f);
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] > 127) { problems.push(`${f}: non-ASCII byte 0x${buf[i].toString(16)} at offset ${i}`); break; }
  }
}

console.log(`check-docs: ${rows} table rows, ${model.counts.classes} classes, instructions ${(size / 1024).toFixed(1)} KB`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 15)) console.error(`  ${p}`);
  process.exit(1);
}
console.log('every table well formed, every documented class defined, all ASCII');
