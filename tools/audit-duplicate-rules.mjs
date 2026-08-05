/**
 * A rule that redeclares most of a shared component's base rule - a hand-rolled copy.
 *
 * This is the CircleIcon defect. In People First one shared circle-icon class was
 * imported by nothing, while five components each hand-rolled their own copy, and all
 * five had drifted from Figma. Retokenising the shared class touched none of them.
 *
 * A private copy is invisible to every tool that reasons about the system: the token
 * audit sees a literal in a selector it does not recognise, and a change that looks
 * global is not. Composition is the whole point of having a component.
 *
 * Reports the overlap percentage so a near-miss - a genuine variant that happens to
 * share a lot - can be told apart from a true duplicate.
 *
 *   node tools/audit-duplicate-rules.mjs
 */
import fs from 'node:fs';
import { parse } from './lib/css.mjs';

const rules = parse(fs.readFileSync('src/styles.css', 'utf8'))
  .filter((r) => !r.selector.startsWith('@') && !r.selector.startsWith(':root') && r.decls.length);

// Declarations that carry no identity - every flex row has them, and matching on them
// would report every layout wrapper as a duplicate of every other.
const GENERIC = new Set([
  'display', 'box-sizing', 'align-items', 'justify-content', 'flex', 'flex-direction',
  'margin', 'position', 'width', 'height', 'cursor', 'text-align', 'overflow',
]);

const identity = (r) => r.decls.filter((d) => !GENERIC.has(d.prop)).map((d) => [d.prop, d.value]);

// A shared component is a bare block class with enough identity to be worth composing.
const shared = [];
for (const r of rules) {
  if (!/^\.v27-[a-z0-9-]+$/.test(r.selector)) continue;
  const sig = identity(r);
  if (sig.length >= 3) shared.push({ sel: r.selector, sig, line: r.line });
}

const findings = [];
for (const s of shared) {
  for (const r of rules) {
    if (r.selector.includes(s.sel)) continue;          // the component and its own variants
    const overlap = s.sig.filter(([p, v]) => r.decls.some((d) => d.prop === p && d.value === v));
    const pct = overlap.length / s.sig.length;
    if (pct >= 0.7 && overlap.length >= 3) {
      findings.push({ dup: r.selector, line: r.line, of: s.sel, pct: Math.round(pct * 100), props: overlap.map(([p]) => p) });
    }
  }
}

findings.sort((a, b) => b.pct - a.pct);
if (!findings.length) {
  console.log(`duplicate-rules: clean - ${shared.length} shared rules compared`);
  process.exit(0);
}
console.error(`duplicate-rules: ${findings.length} hand-rolled duplicate(s)`);
for (const f of findings) {
  console.error(`  styles.css:${f.line}  ${f.dup}`);
  console.error(`    redeclares ${f.pct}% of ${f.of}  (${f.props.join(', ')})`);
}
process.exit(1);
