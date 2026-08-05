/**
 * Build export/model.json - one structured description of the whole library.
 *
 * Everything that leaves this repo is generated from this file: the Copilot instructions,
 * the per-component docs, anything added later. Nothing is hand-maintained in two places,
 * because regenerating one model is cheap and keeping four exports in step is not.
 *
 * Sources, all of them already the source of truth for something else:
 *   src/tokens.css   generated token layer  -> the token list, light and dark
 *   src/styles.css   component CSS          -> sections, classes, Figma node ids
 *   docs/*.md        per-component prose    -> matched to a section by its H1
 *
 * Parsed with the shared CSS tokeniser, not a regex - see tools/lib/css.mjs for why.
 *
 *   node tools/build-model.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse, stripComments } from './lib/css.mjs';

const OUT = 'export/model.json';
const stylesRaw = fs.readFileSync('src/styles.css', 'utf8');
const tokensRaw = fs.readFileSync('src/tokens.css', 'utf8');

/* ---- tokens, split by theme block ---------------------------------------- */
/**
 * The dark block is an attribute selector, so the parser hands it back as its own rule.
 * A token present in one block and not the other would silently fail to flip, which
 * build-tokens.mjs already fails on - this just records which tier each one is in.
 */
const tokens = new Map();
for (const rule of parse(tokensRaw)) {
  const dark = rule.selector.includes('data-v27-theme');
  for (const d of rule.decls) {
    if (!d.prop.startsWith('--v27-')) continue;
    const entry = tokens.get(d.prop) ?? { name: d.prop, value: null, dark: null };
    if (dark) entry.dark = d.value;
    else entry.value = d.value;
    const bare = d.prop.replace('--v27-', '');
    entry.tier = /^(neutral|blue|green|red|pink|purple|orange)-/.test(bare) ? 'primitive'
      : /^(size|spacing|radius)-/.test(bare) ? 'dimension'
      : /^(font|text)-/.test(bare) ? 'typography'
      : 'semantic';
    tokens.set(d.prop, entry);
  }
}

/* ---- component sections from styles.css ---------------------------------- */
/**
 * Each component is introduced by a banner comment:
 *
 *   ==========
 *   Name - Figma `Set name`, node 232:4878
 *   12 variants: property 1[6] x with icon[2]
 *   ==========
 *
 * Read from the RAW text because the banner is a comment; the class list for the section
 * is read from the stripped text so a selector mentioned inside prose is never counted.
 */
const BANNER = /={10,}\s*\n\s*\*?\s*(.+?)\s*-\s*Figma\s*`([^`]+)`,\s*node\s*([\d:]+)\s*\n(?:\s*\*?\s*(\d+)\s*variants?:\s*(.+?)\s*\n)?/g;
const sections = [];
let m;
while ((m = BANNER.exec(stylesRaw))) {
  sections.push({
    name: m[1].trim(),
    figmaName: m[2].trim(),
    node: m[3].trim(),
    variantCount: m[4] ? Number(m[4]) : null,
    axes: m[5]?.trim() ?? null,
    start: m.index,
  });
}
for (const [i, s] of sections.entries()) s.end = sections[i + 1]?.start ?? stylesRaw.length;

const stripped = stripComments(stylesRaw);
for (const s of sections) {
  const slice = stripped.slice(s.start, s.end);
  const classes = new Set();
  for (const rule of parse(slice)) {
    for (const cls of rule.selector.matchAll(/\.(v27-[a-z0-9_-]+)/g)) classes.add(cls[1]);
  }
  s.classes = [...classes].sort();
}

/* ---- docs, matched to a section by H1 ------------------------------------ */
const docs = new Map();
if (fs.existsSync('docs')) {
  for (const f of fs.readdirSync('docs').filter((n) => n.endsWith('.md'))) {
    const text = fs.readFileSync(path.join('docs', f), 'utf8');
    const h1 = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
    if (h1) docs.set(h1.toLowerCase(), { file: f, text });
  }
}

const components = sections.map((s) => {
  const doc = docs.get(s.figmaName.toLowerCase()) ?? docs.get(s.name.toLowerCase());
  return {
    name: s.name,
    figmaComponentSet: s.figmaName,
    figmaNode: s.node,
    variantCount: s.variantCount,
    variantAxes: s.axes,
    classes: s.classes,
    baseClass: s.classes.find((c) => !c.includes('--') && !c.includes('__')) ?? s.classes[0],
    doc: doc?.file ?? null,
  };
});

const model = {
  name: 'V27 Design System',
  prefix: 'v27',
  generatedBy: 'tools/build-model.mjs',
  stylesheets: ['src/tokens.css', 'src/styles.css'],
  themeAttribute: { attribute: 'data-v27-theme', values: ['light', 'dark'], default: 'light' },
  rules: [
    'Compose from these classes. Do not hand-write markup that duplicates a component.',
    'Never hard-code a colour, spacing, radius or font size. Every value is a --v27-* token.',
    'Component CSS references semantic tokens only - never a primitive, never a literal. The one exception is Coloured circle icons, which Figma itself binds to primitives.',
    'Dark mode is the data-v27-theme attribute on any element. Components never branch on theme.',
    'Values here were measured off Figma nodes. Do not adjust a size or colour to taste.',
    'Check this component list before building anything new.',
  ],
  counts: {
    components: components.length,
    classes: components.reduce((n, c) => n + c.classes.length, 0),
    tokens: tokens.size,
    themed: [...tokens.values()].filter((t) => t.dark).length,
  },
  coverage: JSON.parse(fs.readFileSync('.figma/inventory.json', 'utf8')).counts,
  tokens: [...tokens.values()],
  components,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(model, null, 2), 'utf8');

console.log(`-> ${OUT}  (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
console.log(`   ${model.counts.components} components, ${model.counts.classes} classes, ${model.counts.tokens} tokens (${model.counts.themed} themed)`);
console.log(`   coverage: ${model.counts.components} of ${model.coverage.sets} component sets built`);

/* ---- gates: a model that cannot be trusted must not ship ----------------- */
const problems = [];
const noDoc = components.filter((c) => !c.doc).map((c) => c.name);
if (noDoc.length) problems.push(`component with no doc: ${noDoc.join(', ')}`);
const noClasses = components.filter((c) => !c.classes.length).map((c) => c.name);
if (noClasses.length) problems.push(`component with no classes: ${noClasses.join(', ')}`);
const halfThemed = [...tokens.values()].filter((t) => t.dark && !t.value).map((t) => t.name);
if (halfThemed.length) problems.push(`dark-only token: ${halfThemed.join(', ')}`);
if (!components.length) problems.push('no components parsed - the banner format changed');

if (problems.length) {
  console.error('\nFAIL');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('   every component has classes and a doc; every themed token has both modes');
