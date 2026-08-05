# Tags

Figma: `Tags`, node `232:4878` (page Components, `1:28`).
12 variants - `property 1[6]` x `with icon[2]` - plus a boolean `removeable` property that
is not a variant axis, so the real state count is 24. See FINDINGS.md #16.

A small status chip. Six semantic types, an optional leading icon, and an optional remove
button.

## Markup

```html
<span class="v27-tag v27-tag--info">
  <svg class="v27-tag__icon" viewBox="0 0 16 16" aria-hidden="true"><!-- glyph --></svg>
  Info
</span>
```

Without an icon, drop the `svg`. With a remove control:

```html
<span class="v27-tag v27-tag--info">
  Removeable
  <button class="v27-tag__remove" aria-label="Remove tag">
    <svg viewBox="0 0 16 16" aria-hidden="true"><!-- close glyph --></svg>
  </button>
</span>
```

The remove control is a real `<button>` so it is focusable and keyboard-operable. The tag
root is a `<span>`, never a button - a button inside a button is invalid HTML and the
browser ejects the rest of the block.

## Classes

| Class | What it is | Figma |
|---|---|---|
| `.v27-tag` | required base: box, padding, radius, type | geometry identical on all six types |
| `.v27-tag--info` | blue informational | `232:4873` |
| `.v27-tag--negative` | red error | `232:4877` |
| `.v27-tag--warning` | amber caution | `232:4874` |
| `.v27-tag--positive` | green success | `232:4876` |
| `.v27-tag--expired` | neutral, greyed | `232:4875` |
| `.v27-tag--ai` | gradient, AI-flavoured | `7961:123360` |
| `.v27-tag__icon` | 16px leading glyph | |
| `.v27-tag__remove` | 16px trailing remove button | |

## Values

Measured box `61x24` on `232:4873`; the build renders `24px` high exactly. Width differs by
under a pixel because Outfit is not bundled and the fallback's metrics differ - see
FINDINGS.md #9.

| Property | Value | Source |
|---|---|---|
| padding | `--v27-spacing-xs` `--v27-spacing-s` (4px 8px) | bound in Figma |
| gap | `--v27-spacing-xs` (4px) | literal in Figma, on scale - FINDINGS.md #13 |
| border-radius | `--v27-radius-s` (4px) | literal in Figma, on scale - FINDINGS.md #13 |
| icon box | `--v27-size-xs` (16px) | literal in Figma, on scale |
| type | Sm - Outfit 14 / 400 / 16px | text style `Sm` |

Colours per type, all bound in Figma:

| Type | background | colour |
|---|---|---|
| info | `Background/info` | `Foreground/info` |
| negative | `Background/negative` | `Foreground/negative` |
| warning | `Background/warning` | `Foreground/warning` |
| positive | `Background/positive` | `Foreground/positive` |
| expired | `Background/tertiary` | `Foreground/secondary` |
| AI | two raw gradients over solid white | `Foreground/theme` |

`expired` deliberately reuses the neutral roles rather than having a pair of its own.

The AI variant has **no background token** and keeps a solid white base, so it does not
follow dark mode while every other tag does. That is what Figma specifies - FINDINGS.md #14.
