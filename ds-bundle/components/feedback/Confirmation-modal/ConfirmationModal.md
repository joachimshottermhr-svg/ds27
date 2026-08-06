# Confirmation modal

Figma: `Confirmation modal`, node `7664:11553` (page Components, `1:28`).
2 variants - `property 1[2]`: Risky action and Unsaved changes.

A 380px centred dialog: a large glyph, a title and body, and two stacked full-width
buttons.

**Only Risky action is built.** The two share this frame - the difference is the glyph and
the copy - but Unsaved changes was not measured, so nothing about it is asserted.

## Markup

```html
<div class="v27-modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
  <button type="button" class="v27-modal__close" aria-label="Close">
    <svg viewBox="0 0 24 24" aria-hidden="true"><!-- close --></svg>
  </button>
  <div class="v27-modal__content">
    <svg class="v27-modal__glyph" viewBox="0 0 120 120" aria-hidden="true"><!-- warning --></svg>
    <div class="v27-modal__text">
      <span class="v27-modal__title" id="m-title">Are you sure?</span>
      <span class="v27-modal__body">Items will be permanently deleted</span>
    </div>
  </div>
  <div class="v27-modal__actions">
    <button type="button" class="v27-btn v27-btn--positive v27-btn--block">Confirm</button>
    <button type="button" class="v27-btn v27-btn--outline v27-btn--block">Cancel</button>
  </div>
</div>
```

`role="dialog"` with `aria-modal="true"` and `aria-labelledby` are required - this library
ships no focus trap, so the consuming app must move focus into the dialog on open, keep it
there, and return it on close.

The buttons are [Button](Button.md) instances with `.v27-btn--block`, not restyled copies.

## Classes

| Class | What it is |
|---|---|
| `.v27-modal` | the 380px dialog |
| `.v27-modal__close` | the 24px close control |
| `.v27-modal__content` | glyph and text |
| `.v27-modal__glyph` | the 120px illustration |
| `.v27-modal__text` | the 237px text column |
| `.v27-modal__title` | XL |
| `.v27-modal__body` | Base |
| `.v27-modal__actions` | the stacked buttons |

`.v27-btn--block` was added to Button for this: it is how the modal's button instances are
set to fill their container. It carries no value of its own, so the modal does not reach in
and restyle a button from outside its scope.

## Values

| Property | Value |
|---|---|
| width | 380px |
| padding | `--v27-spacing-l` (32px) |
| gap | `--v27-spacing-ml` (24px) |
| content gap / actions gap | `--v27-spacing-sm` (12px) |
| radius | `--v27-radius-m` (8px) |
| border | 1px `Border/Default` |
| title | XL - Outfit 20 / 600 / 24 |
| body | Base - Outfit 16 / 400 / 20 |
| glyph | 120px |
| close offset | 11px top and right |

The glyph at 120px, the 237px text column and the 11px close offset are all off every
scale and carry their node ids.

The body text is **left**-aligned inside a centred column - Figma sets `text-center` on the
title only. Reproduced as measured; it looks like an oversight and is worth confirming.

The fill is a raw white rather than `Background/Primary`, so the dialog does not follow dark
mode - the fifth component in the library doing this (FINDINGS.md #30).
