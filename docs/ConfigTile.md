# Config tile

Figma: `config tile`, node `4338:67656` (page Components, `1:28`).
2 variants - `property 1[2]`: Default and Variant2.

A centred card: a coloured icon disc above a heading and sub text.

## Markup

```html
<button type="button" class="v27-config-tile">
  <span class="v27-config-tile__disc">
    <svg viewBox="0 0 40 40" aria-hidden="true"><!-- glyph --></svg>
  </span>
  <span class="v27-config-tile__text">
    <span class="v27-config-tile__heading">Heading of tile</span>
    <span class="v27-config-tile__sub">Sub text with more information goes here</span>
  </span>
</button>
```

Use a `<button>` or `<a>` if the tile is clickable - which is what a config tile usually
is. A clickable `<div>` is not reachable by keyboard.

## Classes

| Class | What it is |
|---|---|
| `.v27-config-tile` | the card |
| `.v27-config-tile__disc` | the tinted icon disc |
| `.v27-config-tile__text` | heading and sub text |
| `.v27-config-tile__heading` | Lg bold |
| `.v27-config-tile__sub` | Sm |

## Values

Verified on `4285:71238`.

| Property | Value |
|---|---|
| padding | `--v27-spacing-m` `--v27-spacing-ml` (16px 24px) |
| gap | `--v27-spacing-m` (16px) |
| border | 1px `Border/Default` |
| radius | `--v27-radius-m` (8px) |
| disc padding | `--v27-spacing-sm` (12px), 49px radius |
| glyph | 40px (`--v27-size-xl`) |
| heading | Lg bold - Outfit 18 / 600 / auto |
| sub | Sm - Outfit 14 / 400 / 16 |

Two things reproduced rather than corrected:

- The card fill is a **raw white**, not `Background/Primary`, so it does not follow dark
  mode - the same as Step's badge and the Toggle knob.
- The disc binds the **`Pink/100` primitive**, like Coloured circle icons, so it does not
  change between themes either. FINDINGS.md #17 and #22.

The sub text is `Foreground/Primary`, not `Foreground/Secondary` - unusual for a sub line,
and reproduced as bound.

## Variant2 is not built

`4338:67657` adds the file's `Drop shadow` effect and binds `Foreground/Theme`, but which
element takes the theme colour was not measured. Building it from the variable list alone
would be a guess about which layer changes.
