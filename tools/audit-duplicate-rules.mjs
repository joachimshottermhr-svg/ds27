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

const raw = fs.readFileSync('src/styles.css', 'utf8');

/**
 * A declared exception: two rules that genuinely match but are not a defect.
 *
 * Data display and Document attachment are both cards - 1px Border/Default, 8px radius,
 * Background/Primary - and the audit called them duplicates of each other. They are not.
 * The defect this catches is a change that FAILS TO PROPAGATE, and both reference the same
 * tokens, so retokenising reaches both. Nor is there a Card component in V27 for either to
 * compose; inventing one would assert a relationship the design file does not make.
 *
 * The exemption is pairwise and needs a reason on the line:
 *
 *     /* duplicate-ok: .v27-attachment - both are token-driven card surfaces *(/
 *
 * Widening the GENERIC list instead would have been the easy fix and the wrong one: border,
 * radius and background ARE the identity of a card, and blinding the audit to them is how
 * a real hand-rolled copy gets through.
 */
/**
 * A marker may name a GROUP, not just a pair - four components share the card surface, and
 * listing six pairs to express that would be worse than listing the four members once.
 * Every selector on the marker line joins the set.
 */
const OK = new Set();
for (const m of raw.matchAll(/duplicate-ok:([^\n]*(?:\n\s+[^*\n]*)?)/g)) {
  for (const sel of m[1].matchAll(/\.v27-[a-z0-9_-]+/g)) OK.add(sel[0]);
}

const rules = parse(raw)
  .filter((r) => !r.selector.startsWith('@') && !r.selector.startsWith(':root') && r.decls.length);

// Declarations that carry no identity - every flex row has them, and matching on them
// would report every layout wrapper as a duplicate of every other.
//
// The typography properties are in this list for a sharper reason. Tag and Link both use
// the "Sm" text style, so they share five declarations and the first run of this audit
// called them duplicates of each other. They are not. The defect this audit exists to
// catch is a change that FAILS TO PROPAGATE - a private copy that a retokenisation does
// not reach. Tag and Link both reference --v27-text-sm-*, so a change to the type tier
// reaches both, and there is nothing to fix. Two components sharing a text style is the
// token layer working, not a hand-rolled copy.
//
// A true duplicate is identified by its box and its colour - padding, radius, border,
// background - which is what remains.
const GENERIC = new Set([
  'display', 'box-sizing', 'align-items', 'justify-content', 'flex', 'flex-direction',
  'margin', 'position', 'width', 'height', 'cursor', 'text-align', 'overflow', 'gap',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
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
    if (OK.has(r.selector) && OK.has(s.sel)) continue;   // both sides declared
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
