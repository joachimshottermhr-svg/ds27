/**
 * A base class sets a themeable property that only SOME of its modifiers override.
 *
 * The remaining variants then inherit a value nobody chose for them, and cannot be
 * restyled independently. The canonical case: `.btn { color: #fff }` with only the
 * filled types overriding it - the outline and plain types are white-on-white and it
 * takes a screenshot to notice. It is not a visual bug at the time it is written; it is
 * a bug the first time a new variant is added.
 *
 * Two exclusions, without which this is all false positives:
 *   DIMENSIONAL - a modifier naming a size, breakpoint or layout is not expected to
 *                 carry colours, so a colour it does not override is not evidence.
 *   RESTING     - a modifier naming the default/resting state has nothing to override,
 *                 because the base already carries that state's value.
 *
 *   node tools/audit-shared-state.mjs
 */
import fs from 'node:fs';
import { parse } from './lib/css.mjs';

// Grouped into families so a base using the `border` shorthand counts as overridden by
// a modifier that sets `border-color`. Shared `padding` is not a theming constraint, so
// the list is deliberately narrow.
const FAMILIES = {
  color: ['color'],
  background: ['background', 'background-color', 'background-image'],
  border: ['border', 'border-color', 'border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color'],
  fill: ['fill'],
  stroke: ['stroke'],
};
const familyOf = (prop) => Object.keys(FAMILIES).find((f) => FAMILIES[f].includes(prop)) ?? null;

const DIMENSIONAL = /--(mobile|tablet|desktop|small|large|medium|compact|wide|narrow|inline|full|icon|icon-only|sub|open|closed|expanded|collapsed|circle|square|xs|sm|md|lg|xl|\d+)$/i;
const RESTING = /--(un|unselected|deselected|default|inactive|off|normal|rest|resting|empty|none)$/i;

/**
 * A base only constrains its variants when it pins an actual colour. `border: 0` and
 * `background: transparent` are the ABSENCE of a value - a variant that does not
 * override them has not inherited a decision nobody made, it has inherited "nothing",
 * which is what it wanted. Flagging those made the first run of this audit report the
 * Button's `border: 0` as a defect when it is exactly right for the filled and plain
 * types. A themeable value is one that names a colour.
 */
const NAMES_A_COLOUR = /var\(--|#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\bcurrentcolor\b|\blinear-gradient\(/i;

const rules = parse(fs.readFileSync('src/styles.css', 'utf8'))
  .filter((r) => !r.selector.startsWith('@') && !r.selector.startsWith(':root'));

/** `.v27-btn` from `.v27-btn--positive:hover:not(:disabled)`. */
const blockOf = (sel) => sel.match(/\.v27-[a-z0-9-]+?(?=--|__|[:\s,.[]|$)/)?.[0] ?? null;

// Base rules: a bare block selector with no modifier, pseudo-class or descendant.
const bases = new Map();
for (const r of rules) {
  if (!/^\.v27-[a-z0-9-]+$/.test(r.selector)) continue;
  if (!bases.has(r.selector)) bases.set(r.selector, r);
}

const findings = [];
for (const [base, baseRule] of bases) {
  // Which families does the base pin?
  const pinned = new Map();
  for (const d of baseRule.decls) {
    const fam = familyOf(d.prop);
    if (fam && NAMES_A_COLOUR.test(d.value)) pinned.set(fam, d);
  }
  if (!pinned.size) continue;

  // Which modifiers exist for this block, and what does each override?
  const mods = new Map();
  for (const r of rules) {
    if (blockOf(r.selector) !== base) continue;
    const m = r.selector.match(new RegExp(`${base.replace('.', '\\.')}(--[a-z0-9-]+)`));
    if (!m) continue;
    const name = base + m[1];
    if (DIMENSIONAL.test(name) || RESTING.test(name)) continue;
    if (!mods.has(name)) mods.set(name, new Set());
    for (const d of r.decls) {
      const fam = familyOf(d.prop);
      if (fam) mods.get(name).add(fam);
    }
  }
  if (mods.size < 2) continue;

  for (const [fam, decl] of pinned) {
    const overriding = [...mods].filter(([, fams]) => fams.has(fam)).map(([n]) => n);
    const stranded = [...mods].filter(([, fams]) => !fams.has(fam)).map(([n]) => n);
    // Only a defect when SOME override it. All or none is a deliberate shared value.
    if (overriding.length && stranded.length) {
      findings.push({ base, fam, decl, overriding, stranded });
    }
  }
}

if (!findings.length) {
  console.log(`shared-state: clean - ${bases.size} base rules checked`);
  process.exit(0);
}
console.error(`shared-state: ${findings.length} shared themeable value(s) that some variants cannot vary`);
for (const f of findings) {
  console.error(`\n  styles.css:${f.decl.line}  ${f.base} { ${f.decl.prop}: ${f.decl.value} }`);
  console.error(`    overridden by: ${f.overriding.join(', ')}`);
  console.error(`    stranded on the base value: ${f.stranded.join(', ')}`);
}
process.exit(1);
