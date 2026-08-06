# Icon

Figma: `Icon`, node `289:4504` (page Components, `1:28`).
3 variants - `property 1[3]`. Figma's axis is named `Property 1`; its values name sizes.

A sizing box for a glyph. It carries no colour of its own: every icon in the file inherits
its colour from the component around it, because Figma binds the fill on the parent (the
tag, the button, the link) and never on the Icon component itself.

## Markup

```html
<span class="v27-icon v27-icon--medium">
  <svg viewBox="0 0 24 24" aria-hidden="true"><!-- glyph --></svg>
</span>
```

`aria-hidden` when the icon is decorative and the label is adjacent. When the icon is the
only content, label the interactive parent instead - never the `<span>`.

## Classes

| Class | Box | Figma node |
|---|---|---|
| `.v27-icon` | required base | `289:4504` |
| `.v27-icon--small` | 20px (`--v27-size-s`) | `289:4501` |
| `.v27-icon--medium` | 24px (`--v27-size-m`) | `289:4503` |
| `.v27-icon--large` | 32px (`--v27-size-l`) | `289:4502` |

All three boxes were measured on their nodes and all three sit on the Size scale, so they
are tokens rather than repeated literals.

## Glyphs are not included

The Icons page (`1978:35285`) holds 118 glyphs using Font Awesome naming, including
Pro-only and brand marks. None is bundled here: licensing needs confirming first, and this
differs from People First, which uses Tabler - so no glyph can be carried between the two
systems. See FINDINGS.md #8.

Supply your own `<svg>` inside the box. `fill: currentColor` is applied to it, so the glyph
takes the surrounding text colour automatically.
