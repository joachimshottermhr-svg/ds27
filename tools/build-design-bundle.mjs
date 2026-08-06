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

  /**
   * The card's LABEL comes from the file name, not from the @dsCard marker and not from
   * the name passed to register_assets. Naming every preview `preview.html` produced 45
   * cards all labelled "preview" - technically correct, completely useless.
   *
   * The doc basename is already a clean PascalCase name (Button.md, CircleIcon.md,
   * MultiAvatar.md), so the preview takes the same stem.
   */
  const file = path.join(dir, `${c.doc.replace(/\.md$/, '')}.html`);
  fs.writeFileSync(file, html, 'utf8');

  // PROJECT-relative, not repo-relative. The manifest and the upload both address files
  // from the bundle root, so a leading "ds-bundle/" here points at nothing once uploaded.
  const rel = path.relative(OUT, file).split(path.sep).join('/');
  cards.push({ name: c.name, group, path: rel, viewport: `900x${height}`, examples: ex.length });

  // The doc travels with the card, so the spec is one click away inside Claude Design.
  fs.copyFileSync(path.join('docs', c.doc), path.join(dir, c.doc));
}

/* ---- Foundations: the token layer itself --------------------------------
 * A design system whose cards are all components and no tokens is missing its own
 * foundation - the thing every component is built out of, and the only place the two-tier
 * structure is visible at all.
 *
 * Semantic swatches are shown in BOTH themes side by side, because 39 of them change and
 * the whole point of the tier is that they do. Primitives are shown once, because they
 * have a single mode - which is exactly why the components binding them (FINDINGS #17,
 * #22) do not follow dark mode.
 */
function foundations() {
  const dir = path.join(OUT, 'components', 'foundations');
  fs.mkdirSync(dir, { recursive: true });

  const byTier = (tier) => model.tokens.filter((t) => t.tier === tier);
  const swatch = (t) => `<div class="tk">
        <span class="sw" style="background:var(${t.name})"></span>
        <code>${t.name.replace('--v27-', '')}</code>
        <span class="v">${t.value}</span>
      </div>`;
  const ramp = (prefix) => byTier('primitive').filter((t) => t.name.startsWith(`--v27-${prefix}-`));
  const RAMPS = ['neutral', 'blue', 'green', 'red', 'pink', 'purple', 'orange'];

  const typeStyles = [...new Set(model.tokens
    .filter((t) => /^--v27-text-.*-size$/.test(t.name))
    .map((t) => t.name.replace('--v27-text-', '').replace('-size', '')))];

  const pane = (theme) => `
  <div class="pane"${theme === 'dark' ? ' data-v27-theme="dark"' : ''}>
    <p class="h">Semantic - ${theme}</p>
    <div class="grid">${byTier('semantic').map(swatch).join('')}</div>
  </div>`;

  const html = `<!-- @dsCard group="Foundations" viewport="1100x2960" -->
<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Tokens - V27</title>
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../../styles.css">
<style>
  body { margin:0; font-family:var(--v27-font-family); }
  .pane { padding:20px; background:var(--v27-background-primary); color:var(--v27-foreground-primary); }
  .split { display:grid; grid-template-columns:1fr 1fr; }
  .h { font-size:11px; text-transform:uppercase; letter-spacing:.09em;
       color:var(--v27-foreground-secondary); margin:0 0 10px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:6px 14px; }
  .tk { display:flex; align-items:center; gap:8px; font-size:12px; min-width:0; }
  .sw { width:18px; height:18px; flex:none; border-radius:var(--v27-radius-s);
        border:1px solid var(--v27-border-default); }
  .tk code { font-size:11px; white-space:nowrap; }
  .tk .v { color:var(--v27-foreground-secondary); font-size:11px;
           overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ramp { display:flex; margin:0 0 6px; }
  .ramp span { flex:1; height:34px; display:flex; align-items:flex-end;
               justify-content:center; font-size:9px; padding-bottom:2px; }
  .rl { font-size:11px; color:var(--v27-foreground-secondary); margin:0 0 2px; }
  .bar { height:14px; background:var(--v27-foreground-theme); border-radius:2px; }
  .row { display:flex; align-items:center; gap:10px; margin:0 0 4px; font-size:11px; }
  .row code { width:150px; flex:none; }
  .rad { width:56px; height:34px; background:var(--v27-background-tertiary);
         border:1px solid var(--v27-border-bold); flex:none; }
  .lead { font-size:12px; line-height:18px; color:var(--v27-foreground-secondary);
          margin:0 0 12px; max-width:70ch; }
  .gaps { border-collapse:collapse; font-size:12px; width:100%; }
  .gaps th { text-align:left; font-weight:var(--v27-font-weight-semibold); padding:4px 10px 6px 0;
             border-bottom:1px solid var(--v27-border-default); color:var(--v27-foreground-secondary); }
  .gaps td { padding:7px 10px 7px 0; border-bottom:1px solid var(--v27-border-default);
             vertical-align:top; line-height:17px; }
  .gaps td:first-child { white-space:nowrap; font-weight:var(--v27-font-weight-semibold); }
  .gaps td:last-child { white-space:nowrap; color:var(--v27-foreground-secondary); }
  .gaps code { font-size:11px; }
</style>
</head>
<body>

<div class="split">${pane('light')}${pane('dark')}</div>

<div class="pane">
  <p class="h">Primitives - one mode only, so anything bound to these does not follow dark</p>
  ${RAMPS.map((r) => `<p class="rl">${r}</p>
  <div class="ramp">${ramp(r).map((t) => `<span style="background:var(${t.name});color:${/-(0|50|100|200|300)$/.test(t.name) ? '#3e3e3e' : '#fff'}">${t.name.split('-').pop()}</span>`).join('')}</div>`).join('')}
</div>

<div class="pane">
  <p class="h">Typography - Outfit, with a system fallback (not bundled, FINDINGS #9)</p>
  ${typeStyles.map((s) => `<div style="font-size:var(--v27-text-${s}-size);font-weight:var(--v27-text-${s}-weight);line-height:var(--v27-text-${s}-line-height);margin:0 0 8px">
    ${s} &mdash; The quick brown fox <span style="font-size:11px;font-weight:400;color:var(--v27-foreground-secondary)">--v27-text-${s}-*</span>
  </div>`).join('')}
</div>

<div class="pane">
  <p class="h">Spacing</p>
  ${byTier('dimension').filter((t) => t.name.includes('spacing')).map((t) => `<div class="row"><code>${t.name.replace('--v27-', '')}</code><span class="bar" style="width:var(${t.name})"></span>${t.value}</div>`).join('')}
  <p class="h" style="margin-top:16px">Size</p>
  ${byTier('dimension').filter((t) => t.name.includes('size')).map((t) => `<div class="row"><code>${t.name.replace('--v27-', '')}</code><span class="bar" style="width:var(${t.name})"></span>${t.value}</div>`).join('')}
  <p class="h" style="margin-top:16px">Radius</p>
  <div style="display:flex;gap:14px;align-items:center">
    ${byTier('dimension').filter((t) => t.name.includes('radius')).map((t) => `<div style="text-align:center;font-size:11px"><div class="rad" style="border-radius:var(${t.name})"></div>${t.name.replace('--v27-radius-', '')} ${t.value}</div>`).join('')}
  </div>
</div>

<div class="pane">
  <p class="h">Known gaps - what is deliberately NOT in this layer</p>
  <p class="lead">Every one of these is a value that could not be verified or does not exist
     in the V27 export. None has been invented. A stated gap is useful; a plausible
     invention is not.</p>
  <table class="gaps">
    <tr><th>Gap</th><th>What is missing</th><th></th></tr>
    <tr><td>Chart palette</td><td><code>chart-1</code> is the only chart token and it is <code>#ffffff</code> in both modes. A real three-colour palette (<code>#0075be</code>, <code>#fc8700</code>, <code>#00ad60</code>) exists but is <strong>not in the V27 export</strong>.</td><td>#3, #25</td></tr>
    <tr><td>Shadow tier</td><td>None. Toast and Step carry shadows whose colour is <code>Border/Border - Drop shadow</code>, not a V27 variable.</td><td>#19</td></tr>
    <tr><td>Orange 50</td><td>Every other ramp has ten steps; Orange has nine. No tenth was interpolated.</td><td>#5</td></tr>
    <tr><td>Three heading styles</td><td><code>XL Heading</code>, <code>Larger Heading</code> and <code>Sub heading</code> are named on the style guide but node <code>1:27</code> exceeds the metadata ceiling, so they could not be read off their nodes.</td><td>#1, #11</td></tr>
    <tr><td>AI gradient</td><td>The <code>AI gradient</code> style serialises empty - gradients do not come through this toolchain. Exposed as <code>--v27-ai-accent</code> with a neutral fallback rather than a guessed brand colour.</td><td>#32</td></tr>
    <tr><td>Outfit</td><td>Referenced with a system fallback. Not licensed, not bundled - the library renders in the fallback unless the app loads it.</td><td>#9</td></tr>
    <tr><td>Off-scale literals</td><td>The Button's 42px height and 207px radius, the circle icon's 35px radius, Toast's 11px gap and others sit on no scale. They stay literals with their node ids rather than being rounded onto one.</td><td>#10, #13</td></tr>
  </table>
  <p class="lead" style="margin-top:14px">Seven variables bound on V27 components come from the
     People First library and are absent from the V27 export entirely -
     <code>Text/Text - Primary</code>, <code>Icons/Icon - Required field</code>,
     <code>Border/Border - Drop shadow</code>, <code>Border/Secondary</code>,
     <code>Charts/Chart 1-3</code>, <code>2nd (light)/Grey steel</code> and a style named
     <code>DEPRECATED COLOURS/White</code>. The V27 export alone cannot rebuild the V27
     file. See FINDINGS.md #18 and #28.</p>
</div>

</body></html>
`;

  const file = path.join(dir, 'Tokens.html');
  fs.writeFileSync(file, html, 'utf8');
  const rel = path.relative(OUT, file).split(path.sep).join('/');
  cards.push({ name: 'Tokens', group: 'Foundations', path: rel, viewport: '1100x2960', examples: 0 });
}
foundations();

/* ---- _ds_manifest.json --------------------------------------------------
 * The card index the Design System pane actually reads.
 *
 * The `@dsCard` markers in each preview are the SOURCE of this file, not a substitute for
 * it: something has to compile them, and for a bundle uploaded through the API rather than
 * built by the design-sync CLI, that something is this script. Without the manifest the
 * project exists, every file uploads, every path lists - and the pane shows nothing. That
 * is exactly what happened on the first upload of this bundle.
 *
 * Schema taken from the People First project's own manifest rather than guessed.
 */
const KIND = (v) =>
  /^#|^rgb|^hsl|gradient\(/i.test(v) || /^var\(--v27-(neutral|blue|green|red|pink|purple|orange|foreground|background|border|chart)/.test(v) ? 'color'
    : /^\d+(\.\d+)?px$/.test(v) ? 'size'
    : 'text';

const manifest = {
  namespace: 'V27',
  components: cards.map((c) => ({ name: c.name, sourcePath: c.path })),
  startingPoints: [],
  cards: cards.map((c) => ({ path: c.path, group: c.group.toLowerCase(), viewport: c.viewport })),
  templates: [],
  hasThumbnailHtml: false,
  globalCssPaths: ['tokens.css', 'styles.css'],
  tokens: model.tokens.map((t) => ({
    name: t.name,
    value: t.value ?? t.dark ?? '',
    kind: KIND(t.value ?? ''),
    definedIn: 'tokens.css',
  })),
  themes: [{ selector: '[data-v27-theme="dark"]', label: 'V27 Dark' }],
  // Outfit is referenced with a system fallback but is not licensed or bundled - see
  // FINDINGS.md #9 - so there is no font to declare here.
  fonts: [],
  brandFonts: [],
  source: 'ds27/tools/build-design-bundle.mjs',
};
fs.writeFileSync(path.join(OUT, '_ds_manifest.json'), JSON.stringify(manifest), 'utf8');

/**
 * Every path the manifest names must exist in the bundle, and none may carry the bundle
 * directory as a prefix. Both mistakes were made on the first attempt and neither showed
 * up as an error - the upload succeeded and the pane was simply empty.
 */
for (const c of manifest.cards) {
  if (c.path.startsWith(`${OUT}/`)) {
    console.error(`FAIL: card path is repo-relative, not project-relative: ${c.path}`);
    process.exitCode = 1;
  }
  if (!fs.existsSync(path.join(OUT, c.path))) {
    console.error(`FAIL: manifest names a file that is not in the bundle: ${c.path}`);
    process.exitCode = 1;
  }
  if (!/^\d+x\d+$/.test(c.viewport ?? '')) {
    console.error(`FAIL: card has no viewport: ${c.path}`);
    process.exitCode = 1;
  }
}


/* ---- index.html ---------------------------------------------------------
 * A gallery that does not depend on any host application.
 *
 * The bundle's whole value is being able to SEE the system, and that should not be
 * contingent on a pane rendering it. Open this file and every component is there, in both
 * themes, with its doc a click away.
 */
const nav = Object.entries(
  cards.reduce((acc, c) => ((acc[c.group] ??= []).push(c), acc), {}),
).sort(([a], [b]) => a.localeCompare(b));

const section = ([group, list]) => `
  <section class="g" id="${group.toLowerCase()}">
    <h2>${group} <span class="n">${list.length}</span></h2>
    <div class="cards">
${list.sort((a, b) => a.name.localeCompare(b.name)).map((c) => `      <a class="card" href="${c.path}">
        <span class="nm">${c.name}</span>
        <span class="mt">${c.examples} example${c.examples === 1 ? '' : 's'}</span>
      </a>`).join('\n')}
    </div>
  </section>`;

const index = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>V27 Design System</title>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="styles.css">
<style>
  body { margin:0; padding:32px; font-family:var(--v27-font-family);
         background:var(--v27-background-secondary); color:var(--v27-foreground-primary); }
  header { max-width:1100px; margin:0 auto 28px; }
  h1 { font-size:var(--v27-text-2xl-size); font-weight:var(--v27-text-2xl-weight);
       line-height:var(--v27-text-2xl-line-height); margin:0 0 6px; }
  .sub { color:var(--v27-foreground-secondary); font-size:var(--v27-text-sm-size);
         line-height:var(--v27-text-sm-line-height); margin:0; }
  .g { max-width:1100px; margin:0 auto 30px; }
  h2 { font-size:var(--v27-text-base-bold-size); font-weight:var(--v27-text-base-bold-weight);
       line-height:var(--v27-text-base-bold-line-height); margin:0 0 12px; }
  .n { color:var(--v27-foreground-secondary); font-weight:var(--v27-font-weight-regular); }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; }
  .card { display:flex; flex-direction:column; gap:var(--v27-spacing-xs);
          padding:var(--v27-spacing-m); border:1px solid var(--v27-border-default);
          border-radius:var(--v27-radius-m); background:var(--v27-background-primary);
          text-decoration:none; color:inherit; }
  .card:hover { border-color:var(--v27-border-theme); }
  .nm { font-size:var(--v27-text-base-size); line-height:var(--v27-text-base-line-height); }
  .mt { font-size:var(--v27-text-xs-size); color:var(--v27-foreground-secondary); }
</style>
</head>
<body>
<header>
  <h1>V27 Design System</h1>
  <p class="sub">${model.counts.components} components &middot; ${model.counts.classes} classes &middot;
     ${model.counts.tokens} tokens, ${model.counts.themed} themed &middot;
     ${model.coverage.setsBuilt} of ${model.coverage.sets} Figma component sets.
     Every card shows light and dark.</p>
</header>
${nav.map(section).join('\n')}
</body></html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), index, 'utf8');

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
