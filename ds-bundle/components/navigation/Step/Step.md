# Step

Figma: `Step`, node `347:15717` (page Components, `1:28`) - 4 variants, `property 1[4]`.
Figma: `Step connector`, node `347:15723` - 2 variants, `property 1[2]`.

A numbered step and the rule that joins one to the next.

Only two states exist for each. `Variant3`, `Variant4` and `Variant2` are Figma's
auto-generated names, the same pattern as Link's - FINDINGS.md #15.

## Markup

```html
<ol class="v27-stepper" style="display:flex; align-items:center; gap:8px; list-style:none; margin:0; padding:0">
  <li class="v27-step v27-step--selected" aria-current="step">
    <span class="v27-step__badge">1</span>
    Step 1
  </li>
  <span class="v27-step-connector"></span>
  <li class="v27-step">
    <span class="v27-step__badge">2</span>
    Step 2
  </li>
  <span class="v27-step-connector v27-step-connector--incomplete"></span>
</ol>
```

There is no Stepper component in the set - the row above is the consumer's own layout.
`Stepper` exists as a standalone symbol on the Components page and is not yet built.

Mark the current step with `aria-current="step"`. The connectors are decorative; if the
list is an `<ol>` the order is already conveyed.

## Classes

| Class | What it is |
|---|---|
| `.v27-step` | one step, default state |
| `.v27-step--selected` | the current step |
| `.v27-step__badge` | the 24px numbered badge |
| `.v27-step-connector` | a completed 2px rule |
| `.v27-step-connector--incomplete` | a not-yet-reached rule |

## Values

| Property | Default (`347:15715`) | Selected (`347:15716`) |
|---|---|---|
| label | Sm, `Foreground/Secondary` | Sm **bold**, `Foreground/Primary` |
| badge padding | 4px / 9px | 3px / 9px |
| badge width | 24px (`--v27-size-m`) | same |
| badge radius | `--v27-radius-l` (16px) | same |

Both badge paddings are off the Spacing scale and are literals. The vertical one differs
between states because the bold glyph is taller - the badge ends up the same height either
way.

The connector is 2px, `Foreground/Primary` when complete and `Border/Default` when not.
Figma's 89px width is that instance's layout, not a property of the component, so the class
stretches to fill instead.

## Three values come from outside the token layer

The badge's fill is a **raw white**, not `Background/Primary`, so it does not follow dark
mode. Its shadow is the file's `Drop shadow` effect style, whose colour is
`Border/Border - Drop shadow` - **not a V27 variable** (FINDINGS.md #18 and #19). All three
are declared literals carrying their node ids.
