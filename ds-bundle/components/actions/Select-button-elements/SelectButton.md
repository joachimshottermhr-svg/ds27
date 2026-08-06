# Select button elements

Figma: `Select button elements`, node `2290:83279` (page Components, `1:28`).
2 variants - `selected[2]`.

One segment of a segmented control. The control itself is the standalone `Select button`
symbol, which is not yet built.

## Markup

```html
<div role="group" aria-label="View">
  <button type="button" class="v27-select-button" aria-pressed="true">
    <svg class="v27-select-button__icon" viewBox="0 0 20 20" aria-hidden="true"><!-- glyph --></svg>
    Selected
  </button>
  <button type="button" class="v27-select-button" aria-pressed="false">
    Unselected
  </button>
</div>
```

State lives on `aria-pressed`, so the accessible state and the visual state cannot drift
apart.

## Classes

| Class | What it is |
|---|---|
| `.v27-select-button` | one segment |
| `.v27-select-button__icon` | 20px leading glyph |

## Values

| Property | Unselected (`2290:83277`) | Selected (`2290:83278`) |
|---|---|---|
| background | none | `Foreground/Theme` |
| label | `Foreground/Theme`, Base | inverted, Base **bold** |
| padding | 9px / 25px | same |
| gap | `--v27-spacing-s` (8px) | same |
| icon | 20px (`--v27-size-s`) | same |

There is **no corner radius at all** - the segments are square, and the containing control
presumably rounds the ends. Both padding values are off the Spacing scale and are literals.

The selected fill is `Foreground/Theme` - a text role used as a surface. That is now the
fourth component doing this, after Toggle, Checkbox and Step connector.

## One binding is deliberately not reproduced

Figma sets the selected label's colour from a style named **`DEPRECATED COLOURS/White`**.
This build uses `Foreground/Inverted` instead.

It is the only place in the library that does not reproduce a binding exactly. The reasoning
is that the binding is marked as wrong by its own name, and reproducing it would carry a
deprecation into new code and freeze the label white in dark mode. See FINDINGS.md #28 - if
white was deliberate rather than inverted, that decision reverses.
