# Single Checkbox

Figma: `Single Checkbox`, node `66:1391` (page Components, `1:28`).
4 variants - `selected[2]` x `state[3]`.

The 20px box on its own, with no label. Figma ships it as its own component set, and
[Checkbox](Checkbox.md) composes an instance of it - so it has its own class here and
Checkbox references that class rather than redeclaring the box.

Use this directly only where there is no label: a select-all in a table header, a row
selector in a data grid. Anywhere a label belongs, use `Checkbox`, which gives you the
clickable label row for free.

## Markup

The box takes its state from a sibling input, so it needs one:

```html
<input type="checkbox" class="v27-checkbox__input" id="row-7" />
<label for="row-7" class="v27-visually-hidden-label">Select row 7</label>
<span class="v27-checkbox-box">
  <svg viewBox="0 0 16 16" aria-hidden="true"><!-- tick --></svg>
</span>
```

The input must be the **immediately preceding sibling** of `.v27-checkbox-box` - the
checked and disabled styling is driven by `+`. An unlabelled box still needs an accessible
name; never ship one without.

## Classes

| Class | What it is |
|---|---|
| `.v27-checkbox-box` | the 20px box |
| `.v27-choice-input` | the real input, visually hidden but focusable |

## Values

| Variant | Fill | Border | Figma node |
|---|---|---|---|
| `Selected=False, State=Default` | `Background/Primary` | 1px `Border/Input bold` | `66:1390` |
| `Selected=True, State=Default` | `Foreground/Primary` | none | `66:1389` |
| `Selected=False, State=Disabled` | `Background/Tertiary` | 1px `Border/Bold` | `66:1628` |
| `Selected=True, State=Disable` | `Neutral/400` | none | `66:1630` |

Box 20px (`--v27-size-s`), radius 4px (`--v27-radius-s`), tick 16px (`--v27-size-xs`).

Note Figma's own axis values are inconsistently spelled - `State=Disabled` on one variant
and `State=Disable` on another. Both are normalised to the disabled state here.

The selected fill is `Foreground/Primary`, a text role used as a surface. The disabled
selected variant binds the `Neutral/400` and `Neutral/0` primitives rather than the
semantic roles holding the same values - FINDINGS.md #22.
