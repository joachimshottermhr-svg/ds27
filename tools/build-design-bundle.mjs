/**
 * Build ds-bundle/ - the Claude Design project payload.
 *
 * Generated from export/model.json and docs/, like every other export, so the design
 * bundle cannot drift from the library. Nothing here is hand-authored.
 *
 * The preview markup is NOT written for this bundle either: it is lifted from the ```html
 * fences already in docs/. Those fences are the examples a consumer is told to copy, and
 * the nested-interactive audit already parses them - so the cards show exactly what the
 * documentation promises, and a broken example fails the audit before it reaches a card.
 *
 * Card index: the Design System pane reads the first-line `@dsCard` marker from each
 * preview HTML. Group names come from the map below rather than from Figma's page
 * structure, because Figma has one page of 39 sets and a flat list of 39 cards is not
 * navigable.
 *
 *   node tools/build-design-bundle.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const model = JSON.parse(fs.readFileSync('export/model.json', 'utf8'));
const OUT = 'ds-bundle';

/** Section labels for the Design System pane, by component name. */
const GROUPS = {
  Button: 'Actions', Link: 'Actions', 'Select button elements': 'Actions', Toggle: 'Actions',

  'Form field': 'Forms', Checkbox: 'Forms', 'Single Checkbox': 'Forms',
  'Radio button': 'Forms', 'Single radio button': 'Forms', Attachments: 'Forms', Label: 'Forms',

  'In page message': 'Feedback', Toast: 'Feedback', 'Progress bar': 'Feedback',
  Tags: 'Feedback', 'Confirmation modal': 'Feedback',

  'Tab single': 'Navigation', 'Tab group': 'Navigation', Breadcrumb: 'Navigation',
  Step: 'Navigation', 'Step connector': 'Navigation', 'Side nav': 'Navigation',
  'Nav elements': 'Navigation', 'App header + top navigation': 'Navigation',
  'Workspace header': 'Navigation',

  Avatar: 'Content', 'Multi avatar': 'Content', 'Avatar compact': 'Content',
  Icon: 'Content', Image: 'Content', 'Coloured circle icons': 'Content',
  'Header display': 'Content', 'Content display': 'Content', 'Data display': 'Content',
  'Entity card': 'Content', 'Document attachment': 'Content',
  'Icon compact with text': 'Content', 'Config tile': 'Content', Tasks: 'Content',

  'AI chat bubble': 'AI', 'AI chat tool bar': 'AI', 'AI assistant overlay': 'AI',
  'AI assistant overlay (mobile)': 'AI',
  'User chat bubble': 'AI', 'Chat input': 'AI', 'Message box': 'AI',
};

/**
 * Every component must land in a named group.
 *
 * The default was silently absorbing anything whose name did not match the map exactly -
 * "AI assistant overlay (mobile)" fell into a group called "Components" and would have
 * shipped as a lone card in a section of one. A default that hides a typo is the same
 * failure mode as an audit that never fires, so it fails the build instead.
 */
function groupFor(name) {
  const g = GROUPS[name];
  if (!g) {
    console.error(`FAIL: no group for "${name}" - add it to GROUPS in tools/build-design-bundle.mjs`);
    process.exitCode = 1;
    return 'Components';
  }
  return g;
}

/** Pull the ```html fences out of a doc. These are the documented examples, verbatim. */
function examples(docFile) {
  if (!docFile) return [];
  const text = fs.readFileSync(path.join('docs', docFile), 'utf8');
  return [...text.matchAll(/```html\n([\s\S]*?)```/g)].map((m) => m[1].trimEnd());
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'components'), { recursive: true });

// The library itself, at the bundle root so every preview can reach it.
fs.copyFileSync('src/tokens.css', path.join(OUT, 'tokens.css'));
fs.copyFileSync('src/styles.css', path.join(OUT, 'styles.css'));

const cards = [];
let skipped = [];

for (const c of model.components) {
  const ex = examples(c.doc);
  if (!ex.length) { skipped.push(c.name); continue; }

  const group = groupFor(c.name);
  const slug = c.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dir = path.join(OUT, 'components', group.toLowerCase(), slug);
  fs.mkdirSync(dir, { recursive: true });

  // Height scales with how much there is to show, so a one-example card is not mostly
  // empty and a seven-example card is not cut off.
  const height = Math.min(1200, 260 + ex.length * 190);
  const stories = ex.map((code) => `      <div class="ds-story">\n${code.split('\n').map((l) => '        ' + l).join('\n')}\n      </div>`).join('\n');

  const html = `<!-- @dsCard group="${group}" viewport="900x${height}" -->
<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${c.name} - V27</title>
<link rel="stylesheet" href="../../../tokens.css">
<link rel="stylesheet" href="../../../styles.css">
<style>
  body { margin:0; font-family:system-ui,sans-serif; }
  .ds-pane { padding:24px; background:var(--v27-background-primary); color:var(--v27-foreground-primary); }
  .ds-head { font-size:11px; text-transform:uppercase; letter-spacing:.09em;
             color:var(--v27-foreground-secondary); margin:0 0 4px; }
  .ds-meta { font-size:12px; color:var(--v27-foreground-secondary); margin:0 0 18px; }
  .ds-story { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; margin:0 0 18px; }
  .ds-split { display:grid; grid-template-columns:1fr 1fr; }
</style>
</head>
<body>
<div class="ds-split">
  <div class="ds-pane">
    <p class="ds-head">${c.name} - light</p>
    <p class="ds-meta">Figma ${c.figmaNode}${c.variantCount ? ` &middot; ${c.variantCount} variants` : ''} &middot; ${c.classes.length} classes</p>
${stories}
  </div>
  <div class="ds-pane" data-v27-theme="dark">
    <p class="ds-head">dark</p>
    <p class="ds-meta">&nbsp;</p>
${stories}
  </div>
</div>
</body></html>
`;

  const file = path.join(dir, 'preview.html');
  fs.writeFileSync(file, html, 'utf8');
  cards.push({ name: c.name, group, path: file.replace(/\\/g, '/'), examples: ex.length });

  // The doc travels with the card, so the spec is one click away inside Claude Design.
  fs.copyFileSync(path.join('docs', c.doc), path.join(dir, c.doc));
}

const readme = `# V27 Design System

${model.counts.components} components, ${model.counts.classes} classes, ${model.counts.tokens} tokens
(${model.counts.themed} with a dark counterpart). No framework, no build step.

\`\`\`html
<link rel="stylesheet" href="tokens.css" />
<link rel="stylesheet" href="styles.css" />
\`\`\`

Dark mode is \`data-v27-theme="dark"\` on any element, so a dark region can be scoped inside
a light page. Components never branch on theme themselves.

Every value here was measured off a Figma node and carries that node id in the CSS. Where
Figma is inconsistent the code matches Figma and the inconsistency is written down, so a
deliberate oddity is never mistaken for a bug.

Each card shows the component in **both themes**, using the examples from its own
documentation - the doc sits beside the preview in the same folder.

Generated by \`tools/build-design-bundle.mjs\`. Do not hand-edit.
`;
fs.writeFileSync(path.join(OUT, 'README.md'), readme, 'utf8');

const byGroup = {};
for (const c of cards) (byGroup[c.group] ??= []).push(c.name);

console.log(`-> ${OUT}/  ${cards.length} cards`);
for (const [g, names] of Object.entries(byGroup).sort()) {
  console.log(`   ${g.padEnd(12)} ${names.length}`);
}
if (skipped.length) console.log(`   no example markup, no card: ${skipped.join(', ')}`);

// A card that renders nothing is worse than a missing card - it looks like a broken
// component rather than an undocumented one.
if (!cards.length) { console.error('FAIL: no cards generated'); process.exit(1); }
