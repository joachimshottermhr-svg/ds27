# Toast

Figma: `Toast`, node `347:15144` (page Components, `1:28`).
4 variants - `property 1[4]`: positive, negative, warning, info.

A transient notification. Unlike [in page message](Message.md), the **surface does not
change per type** - every toast sits on `Background/Primary`, and only the border and the
title colour carry the severity.

## Markup

```html
<div class="v27-toast v27-toast--positive" role="status" aria-live="polite">
  <svg class="v27-toast__icon" viewBox="0 0 24 24" aria-hidden="true"><!-- glyph --></svg>
  <div class="v27-toast__body">
    <div>Successfully saved</div>
    <div class="v27-toast__detail">Detail on why it was a success</div>
  </div>
  <button type="button" class="v27-toast__close" aria-label="Dismiss">
    <svg viewBox="0 0 20 20" aria-hidden="true"><!-- close --></svg>
  </button>
</div>
```

Use `role="alert"` with `aria-live="assertive"` for the negative variant and
`role="status"` with `aria-live="polite"` for the rest. A toast that appears without an
`aria-live` region is invisible to a screen reader.

## Classes

| Class | What it is |
|---|---|
| `.v27-toast` | required base |
| `.v27-toast--positive` / `--negative` / `--warning` / `--info` | severity |
| `.v27-toast__icon` | 24px leading glyph, takes the title colour |
| `.v27-toast__body` | the text column |
| `.v27-toast__detail` | the second line, always `Foreground/Secondary` |
| `.v27-toast__close` | 20px dismiss button |

## Values

Verified on `347:15143`; the set's variable list confirms the other three differ only in
border and title colour.

| Property | Value |
|---|---|
| padding | `--v27-spacing-m` (16px) |
| gap | **11px literal** - off the Spacing scale |
| radius | `--v27-radius-m` (8px) |
| background | `Background/Primary` on every variant |
| shadow | `1px 3px 9.3px 1px` `Neutral/200` |
| icon / close | 24px / 20px |
| type | Sm on both lines |

| Variant | Border | Title |
|---|---|---|
| positive | `Border/Positive` | `Foreground/Positive` |
| negative | `Border/Negative` | `Foreground/Negative` |
| warning | `Border/Warning` | `Foreground/Warning` |
| info | `Border/Info` | `Foreground/Info` |

Two values are off every scale and carry their node id: the 11px gap and the 9.3px shadow
blur. The shadow colour is the `Neutral/200` **primitive**, because V27 has no shadow tier
to point at - the same gap as FINDINGS.md #19.
