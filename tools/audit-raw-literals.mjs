/**
 * Raw literals in component CSS that should be tokens.
 *
 * A literal does not move when the token is retokenised. Change the Figma variable,
 * re-run the token build, and every `var()` follows - but a hex that happens to equal
 * that token today stays where it is, and the library silently desynchronises from the
 * design file. The desync is invisible: the CSS still looks right, and it is only wrong
 * once someone edits Figma.
 *
 * The output is bucketed, because only one bucket is actionable:
 *   A - a token with this exact value exists. Swap it. No Figma decision needed.
 *   B - nothing matches. This needs a Figma variable or an explicit decision, and until
 *       it has one the literal is correct and must carry its node id in a comment.
 *
 * Mixing the two makes the report unreadable and it stops being run.
 *
 * Deliberately NOT checked: width, height, min-width and the rest of the box geometry.
 * V27's Size scale is 16/20/24/32/40 - icon-shaped values - so a button height of 32px
 * would "match" a Size token by coincidence rather than by design, and swapping it would
 * assert a relationship the design file does not make. A coincidental match promoted to
 * bucket A is worse than no audit: it looks authoritative and it is wrong. Off-scale
 * geometry belongs in FINDINGS.md with its node id, which is where it is.
 *
 *   node tools/audit-raw-literals.mjs
 */
import fs from 'node:fs';
import { parse, normHex } from './lib/css.mjs';

const tokensCss = fs.readFileSync('src/tokens.css', 'utf8');
const stylesCss = fs.readFileSync('src/styles.css', 'utf8');

/* ---- value -> token, from the generated token layer ---- */
const byColor = new Map();
const byPx = new Map();
for (const rule of parse(tokensCss)) {
  for (const { prop, value } of rule.decls) {
    if (!prop.startsWith('--v27-')) continue;
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
      const k = normHex(value);
      if (!byColor.has(k)) byColor.set(k, []);
      if (!byColor.get(k).includes(prop)) byColor.get(k).push(prop);
    } else if (/^\d+px$/.test(value)) {
      if (!byPx.has(value)) byPx.set(value, []);
      if (!byPx.get(value).includes(prop)) byPx.get(value).push(prop);
    }
  }
}

/* ---- properties where a literal is a tokenisation question ---- */
const SPACING = new Set([
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-inline', 'margin', 'margin-top', 'margin-right',
  'margin-bottom', 'margin-left', 'gap', 'row-gap', 'column-gap',
]);
const RADIUS = new Set(['border-radius']);
const COLOR_PROP = /(^|-)(color|background|background-color|border(-\w+)?-color|fill|stroke|outline-color)$/;

/**
 * Values that are structural rather than design decisions. `border: 1px solid` is a
 * hairline, not a spacing choice; 0 and 100% are not tokenisable. Flagging these is
 * noise, and a noisy audit is one that gets ignored.
 */
const IGNORE_PX = new Set(['0px', '1px', '2px']);
const bucketA = [];
const bucketB = [];

for (const rule of parse(stylesCss)) {
  if (rule.selector.startsWith(':root') || rule.selector.startsWith('@')) continue;
  for (const d of rule.decls) {
    const where = `${rule.selector}  ${d.prop}`;

    // colours
    for (const m of d.value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      const tok = byColor.get(normHex(m[0]));
      const row = { selector: rule.selector, prop: d.prop, value: m[0], line: d.line, kind: 'colour', token: tok?.[0] ?? null };
      (tok ? bucketA : bucketB).push(row);
    }
    for (const m of d.value.matchAll(/rgba?\([^)]*\)/g)) {
      bucketB.push({ selector: rule.selector, prop: d.prop, value: m[0], line: d.line, kind: 'colour', token: null, note: 'rgba literal' });
    }

    // spacing / radius
    const group = SPACING.has(d.prop) ? 'spacing' : RADIUS.has(d.prop) ? 'radius' : null;
    if (group) {
      for (const m of d.value.matchAll(/\b(\d+)px\b/g)) {
        if (IGNORE_PX.has(m[0])) continue;
        const tok = byPx.get(m[0])?.filter((t) => (group === 'radius' ? t.includes('radius') : t.includes('spacing')));
        const hit = tok && tok.length ? tok[0] : null;
        const row = { selector: rule.selector, prop: d.prop, value: m[0], line: d.line, kind: group, token: hit };
        (hit ? bucketA : bucketB).push(row);
      }
    }
  }
}

const uniq = (rows) => {
  const seen = new Set();
  return rows.filter((r) => {
    const k = `${r.selector}|${r.prop}|${r.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
const A = uniq(bucketA);
const B = uniq(bucketB);

console.log(`raw-literals: ${A.length} swappable (A), ${B.length} no token (B)`);
if (A.length) {
  console.log('\nA - a token with this exact value exists, swap it:');
  for (const r of A) console.log(`  styles.css:${r.line}  ${r.selector} { ${r.prop}: ${r.value} }  ->  var(${r.token})`);
}
if (B.length) {
  console.log('\nB - no token matches; needs a Figma variable or a decision (node id must be recorded):');
  for (const r of B) console.log(`  styles.css:${r.line}  ${r.selector} { ${r.prop}: ${r.value} }  ${r.note ?? ''}`);
}

// Only bucket A is a defect. Bucket B is a documented gap and must not fail the build,
// or the build stays red for values that are correct and deliberately untokenised.
process.exit(A.length ? 1 : 0);
