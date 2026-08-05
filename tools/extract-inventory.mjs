/**
 * Turn the raw Figma page metadata into .figma/inventory.json - every component set, its
 * variant axes, and the measured box of each variant.
 *
 *   node tools/extract-inventory.mjs <metadata.txt> [...]
 *
 * The metadata dumps are large and awkward to work from directly. This reduces them to the
 * facts a build needs - names, axes, sizes, node ids - so component work reads from a
 * stable file instead of re-requesting Figma and re-deriving the same structure each time.
 *
 * Node ids are kept on every entry. A value without the node it came from cannot be
 * checked later, and unverifiable values are how a design system drifts.
 */
import fs from 'node:fs';
import path from 'node:path';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node tools/extract-inventory.mjs <metadata.txt> [...]');
  process.exit(1);
}

const NODE = /<(\w[\w-]*) id="([^"]+)" name="([^"]*)"[^>]*?x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"/;

/** Parse the XML-ish dump into a tree using indentation, which the dump is consistent about. */
function parse(text) {
  const root = { children: [], indent: -1 };
  const stack = [root];
  for (const line of text.split('\n')) {
    const m = line.match(NODE);
    if (!m) continue;
    const indent = line.match(/^\s*/)[0].length;
    const node = {
      tag: m[1], id: m[2], name: m[3],
      x: +m[4], y: +m[5], w: +m[6], h: +m[7],
      hidden: /hidden="true"/.test(line),
      indent, children: [],
    };
    while (stack.length && stack.at(-1).indent >= indent) stack.pop();
    (stack.at(-1) ?? root).children.push(node);
    stack.push(node);
  }
  return root;
}

/** "Type=Positive, Icon=Left, size=Default" -> {type:'Positive', icon:'Left', size:'Default'} */
function axesOf(name) {
  if (!name.includes('=')) return null;
  const out = {};
  for (const part of name.split(',')) {
    const [k, ...v] = part.split('=');
    if (v.length) out[k.trim().toLowerCase()] = v.join('=').trim();
  }
  return out;
}

const sets = [];
const standalone = [];

function visit(node, page) {
  const variants = node.children.filter((c) => c.tag === 'symbol' && axesOf(c.name));
  if (variants.length) {
    const axes = {};
    for (const v of variants) {
      for (const [k, val] of Object.entries(axesOf(v.name))) (axes[k] ??= new Set()).add(val);
    }
    sets.push({
      name: node.name,
      id: node.id,
      page,
      variantCount: variants.length,
      axes: Object.fromEntries(Object.entries(axes).map(([k, v]) => [k, [...v]])),
      variants: variants.map((v) => ({ id: v.id, name: v.name, axes: axesOf(v.name), w: v.w, h: v.h })),
    });
  }
  for (const c of node.children) {
    if (c.tag === 'symbol' && !axesOf(c.name)) standalone.push({ name: c.name, id: c.id, page, w: c.w, h: c.h });
    visit(c, page);
  }
}

for (const f of files) {
  const text = JSON.parse(fs.readFileSync(f, 'utf8'))[0].text;
  const tree = parse(text);
  const canvas = tree.children[0];
  const page = canvas?.name?.trim() || path.basename(f);
  visit(canvas ?? tree, page);
}

// A frame can nest inside another and produce the same set twice; keep the deepest.
const byId = new Map();
for (const s of sets) if (!byId.has(s.id)) byId.set(s.id, s);
const unique = [...byId.values()].sort((a, b) => b.variantCount - a.variantCount);

const inventory = {
  generated: 'tools/extract-inventory.mjs',
  sets: unique,
  standalone: [...new Map(standalone.map((s) => [s.id, s])).values()],
  counts: {
    sets: unique.length,
    variants: unique.reduce((n, s) => n + s.variantCount, 0),
    standalone: new Set(standalone.map((s) => s.id)).size,
  },
};

fs.mkdirSync('.figma', { recursive: true });
fs.writeFileSync('.figma/inventory.json', JSON.stringify(inventory, null, 2));

console.log(`-> .figma/inventory.json`);
console.log(`   ${inventory.counts.sets} component sets, ${inventory.counts.variants} variants, ${inventory.counts.standalone} standalone`);
console.log('');
for (const s of unique) {
  const axes = Object.entries(s.axes).map(([k, v]) => `${k}[${v.length}]`).join(' ');
  console.log(`   ${String(s.variantCount).padStart(3)}  ${s.name.padEnd(30)} ${axes}`);
}
