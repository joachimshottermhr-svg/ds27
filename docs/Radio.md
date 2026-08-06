# Radio button

Figma: `Radio button`, node `66:1697` (page Components, `1:28`) - 2 variants,
`property 1[2]`. Composes [Single radio button](SingleRadio.md), node `66:1541`.

Identical arrangement to [Checkbox](Checkbox.md), and it shares the hidden-input class
with it.

## Markup

```html
<label class="v27-radio">
  <input type="radio" name="choice" class="v27-choice-input" />
  <span class="v27-radio-box"></span>
  Radio choice
</label>
```

The dot is drawn in CSS, so the box needs no child element and no asset. Group radios with
a shared `name`; wrap a set in a `<fieldset>` with a `<legend>` so the group has a label,
not just each option.

## Classes

| Class | What it is |
|---|---|
| `.v27-radio` | the label row |
| `.v27-choice-input` | the real input, visually hidden but focusable - shared with Checkbox |
| `.v27-radio-box` | the 20px dial - the `Single radio button` component |

## Values

| State | Dial | Figma node |
|---|---|---|
| unselected | `Background/Primary`, 1px `Border/Input bold` | `66:1539` |
| selected | same, plus a 14px `Foreground/Primary` dot | `66:1540` |
| unselected, disabled | `Background/Tertiary`, 1px `Border/Bold` | `66:1670` |
| selected, disabled | same, plus a `Neutral/400` dot | `66:1668` |

Dial 20px (`--v27-size-s`), gap to label 12px (`--v27-spacing-sm`), label type Sm. The 15px
radius is off the Radius scale and is Figma's value for a circle, so it is a literal.

Unlike the checkbox, the border does **not** disappear when selected - only the dot
appears.

Two things to know:

- The disabled dot binds the `Neutral/400` primitive rather than a semantic role holding
  the same value. FINDINGS.md #22.
- Figma disagrees with itself about the dial's fill: the component's own variants leave it
  a raw white, its instance inside `Radio button` binds `Background/Primary`. The latter is
  used. FINDINGS.md #23.

`:focus-visible` draws an outline from `Border/Input active`. Figma defines no focus state;
without one a keyboard user gets no affordance, so the nearest existing token is used and
flagged rather than invented silently.
