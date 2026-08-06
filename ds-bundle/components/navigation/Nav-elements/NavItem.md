# Nav elements

Figma: `nav elements`, node `1997:40997` (page Components, `1:28`).
**39 variants** - `property 1[12]` x `status[3]`. The largest set in the file.

One item in the [side nav](SideNav.md) rail: a 24px glyph in a 64x48 target.

## The 39 variants are one shape

`property 1`'s twelve values are twelve different **glyphs** - Payroll, inbox, bookmark,
Calendar, id-card, chart-line, book, receipt, clipboard, building-columns, finance
insights, home. Not twelve styles: the box, the glyph size and the colours are identical
across all of them.

So this is one class with a glyph slot and a status modifier. It is the largest set in the
file by variant count and among the smallest by actual surface area - worth knowing before
anyone budgets work from the 259-variant total. See FINDINGS.md #15, #16 and #27 for the
other three ways variant counts mislead in this file.

## Markup

```html
<button type="button" class="v27-nav-item" aria-current="page" aria-label="Home">
  <svg viewBox="0 0 24 24" aria-hidden="true"><!-- glyph --></svg>
</button>

<button type="button" class="v27-nav-item" aria-label="Payroll">
  <svg viewBox="0 0 24 24" aria-hidden="true"><!-- glyph --></svg>
</button>
```

Selection is `aria-current`, not a modifier class, so the accessible state and the visual
state cannot drift apart. Every item is icon-only, so every item needs an `aria-label`.

## Classes

| Class | What it is |
|---|---|
| `.v27-nav-item` | one rail item |

## Values

| Property | Value | Figma node |
|---|---|---|
| box | 64 x 48 | `1997:41006` |
| glyph | `--v27-size-m` (24px) | |
| selected bar | 3px `Border/Theme`, leading edge | `1997:41698` |

The box is off every scale - 64x48 is a navigation rail dimension, not an icon one.

The 3px bar is carried as a **transparent** border on the base rule, so the glyph does not
shift by 3px when the item becomes selected.

## Only two of the three statuses are measured

`Default` and `Selected` were read off their nodes. The third status was not, so no hover
or disabled treatment is asserted here - a nav rail with no hover feedback is a real gap,
but inventing one would be worse than recording it.
