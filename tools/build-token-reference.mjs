/**
 * Render every token to a page, in both themes, so the layer can be checked by eye and by
 * script before any component depends on it.
 *
 *   node tools/build-token-reference.mjs
 *
 * The two themes are shown side by side deliberately. A dark palette is easy to generate
 * and hard to eyeball: what catches an error is seeing the same swatch in both modes at
 * once, where a token that failed to override stands out immediately.
 */
import fs from 'node:fs';

const css = fs.readFileSync('src/tokens.css', 'utf8');

/**
 * Declarations in :root, and the ones the dark selector overrides.
 *
 * Anchored on the selector at the start of a line, not on the attribute name: the file's
 * header comment documents usage as <html data-v27-theme="dark">, and matching that
 * instead swept the entire file into the dark block and reported every token as themed.
 */
const decls = (s) => [...s.matchAll(/^\s*(--v27-[a-z0-9-]+)\s*:\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]);
const blockAt = (selectorRe) => {
  const m = css.match(selectorRe);
  if (!m) throw new Error(`selector not found: ${selectorRe}`);
  const start = m.index + m[0].length;
  const end = css.indexOf('\n}', start);
  return css.slice(start, end === -1 ? css.length : end);
};
const rootBlock = blockAt(/^:root \{$/m);
const darkBlock = blockAt(/^\[data-v27-theme="dark"\] \{$/m);

const all = decls(rootBlock);
const darkNames = new Set(decls(darkBlock).map(([n]) => n));

const isColour = (v) => /^#|^var\(--v27-(neutral|blue|green|red|pink|purple|orange)-/.test(v);
const groupOf = (n) => {
  const t = n.replace('--v27-', '');
  const known = ['size', 'spacing', 'radius', 'neutral', 'blue', 'green', 'red', 'pink', 'purple', 'orange',
    'foreground', 'background', 'border', 'chart'];
  return known.find((k) => t.startsWith(k + '-')) ?? t.split('-')[0];
};

const groups = new Map();
for (const [name, value] of all) {
  const g = groupOf(name);
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push([name, value]);
}

const swatch = (name, value) => `
      <div class="tok">
        <div class="chip" style="background:var(${name})"></div>
        <div class="meta">
          <code class="n">${name.replace('--v27-', '')}</code>
          <code class="v">${value.replace(/^var\(--v27-/, '').replace(/\)$/, '')}</code>
        </div>
        ${darkNames.has(name) ? '<span class="dm">dark</span>' : ''}
      </div>`;

const sizeRow = (name, value) => `
      <div class="tok">
        <div class="bar" style="width:var(${name})"></div>
        <div class="meta">
          <code class="n">${name.replace('--v27-', '')}</code>
          <code class="v">${value}</code>
        </div>
      </div>`;

const section = (g, rows) => `
    <section>
      <h2>${g} <span class="count">${rows.length}</span></h2>
      <div class="grid">${rows.map(([n, v]) => (isColour(v) ? swatch(n, v) : sizeRow(n, v))).join('')}</div>
    </section>`;

const panel = (theme) => `
  <div class="panel" data-v27-theme="${theme}">
    <div class="panelhead">${theme}</div>
    ${[...groups].map(([g, rows]) => section(g, rows)).join('')}
  </div>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>V27 tokens</title>
<link rel="stylesheet" href="../src/tokens.css" />
<style>
  body { margin:0; font-family: ui-sans-serif, system-ui, sans-serif; background:#8a8a8a; }
  .wrap { display:grid; grid-template-columns:1fr 1fr; }
  .panel { padding:24px 20px 60px; min-height:100vh;
           background:var(--v27-background-primary); color:var(--v27-foreground-primary); }
  .panelhead { font:600 11px ui-monospace,monospace; letter-spacing:.14em; text-transform:uppercase;
               color:var(--v27-foreground-secondary); margin-bottom:20px; }
  h2 { font-size:13px; margin:26px 0 10px; text-transform:capitalize;
       border-bottom:1px solid var(--v27-border-default); padding-bottom:6px; }
  .count { font:400 11px ui-monospace,monospace; color:var(--v27-foreground-secondary); }
  .grid { display:grid; gap:6px; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); }
  .tok { display:flex; align-items:center; gap:9px; position:relative; }
  .chip { width:26px; height:26px; border-radius:var(--v27-radius-s); flex:none;
          border:1px solid var(--v27-border-default); }
  .bar { height:10px; background:var(--v27-foreground-theme); border-radius:2px; flex:none; }
  .meta { display:flex; flex-direction:column; min-width:0; }
  code { font-family: ui-monospace, monospace; font-size:10.5px; }
  .n { color:var(--v27-foreground-primary); }
  .v { color:var(--v27-foreground-secondary); font-size:9.5px; }
  .dm { position:absolute; right:0; top:0; font:600 8px ui-monospace,monospace;
        letter-spacing:.06em; text-transform:uppercase; color:var(--v27-foreground-theme); }
</style>
</head>
<body>
  <div class="wrap">${panel('light')}${panel('dark')}</div>
</body>
</html>
`;

fs.mkdirSync('.figma', { recursive: true });
fs.writeFileSync('.figma/tokens.html', html, 'utf8');
console.log(`-> .figma/tokens.html`);
console.log(`   ${all.length} tokens across ${groups.size} groups; ${darkNames.size} have a dark override`);
