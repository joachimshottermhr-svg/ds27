# Link

Figma: `Link`, node `27:543` (page Components, `1:28`).
6 variants - `property 1[6]` x `state[2]`.

The axis reports six values, but only three are real shapes: `No icon`, `Icon left` and
`Icon right`. `Variant4`, `Variant5` and `Variant6` are Figma's auto-generated names for
those same three on the Hover row. The CSS therefore has three modifiers and a real
`:hover`. See FINDINGS.md #15.

## Markup

```html
<a class="v27-link" href="/somewhere">Link here</a>
```

With an icon:

```html
<a class="v27-link v27-link--icon-left" href="/somewhere">
  <svg class="v27-link__icon" viewBox="0 0 16 16" aria-hidden="true"><!-- glyph --></svg>
  Link here
</a>
```

## Classes

| Class | What it is |
|---|---|
| `.v27-link` | required base |
| `.v27-link--icon-left` | glyph before the label |
| `.v27-link--icon-right` | glyph after the label |
| `.v27-link__icon` | 16px glyph |

## Values

Verified on `27:541` (No icon, Default) and `27:550` (Variant5 = No icon, Hover).

| Property | Value | Source |
|---|---|---|
| colour | `Foreground/link` | bound in Figma, **both** states |
| type | Sm - Outfit 14 / 400 / 16px | text style `Sm` |
| gap | `--v27-spacing-xs` (4px) | on scale |
| icon box | `--v27-size-xs` (16px) | on scale |

Only the underline changes between Default and Hover; the colour does not. Figma draws the
underline from the font metrics, so the CSS uses `text-underline-position: from-font`.

`:focus-visible` gets the same underline as `:hover`. Figma defines no focus state, so this
is the hover state reused rather than a value invented - a keyboard user would otherwise
get no affordance at all.
