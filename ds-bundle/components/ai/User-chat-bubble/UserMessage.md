# User chat bubble

Figma: `User chat bubble`, node `2879:59398` (page Components, `1:28`).
2 variants - `property 1[2]`: Default and with file.

A message the user sent, aligned right. The AI's counterpart (`AI chat bubble`) is a
separate set and is not yet built.

## Markup

```html
<div class="v27-user-message">
  <div class="v27-user-message__header">
    <span class="v27-user-message__time">8:28AM</span>
    <span class="v27-user-message__avatar"><img src="/me.jpg" alt="" /></span>
  </div>
  <div class="v27-user-message__bubble">
    User chat bubble
  </div>
</div>
```

The `with file` variant is the same bubble with a [Document attachment](#document-attachment)
inside it, so it is composition rather than a modifier - there is no `--with-file` class:

```html
<div class="v27-user-message__bubble">
  User chat bubble with file
  <div class="v27-attachment"> ... </div>
</div>
```

## Classes

| Class | What it is |
|---|---|
| `.v27-user-message` | the right-aligned column |
| `.v27-user-message__header` | timestamp and avatar |
| `.v27-user-message__time` | 12px, `Foreground/Secondary` |
| `.v27-user-message__avatar` | 32px face |
| `.v27-user-message__bubble` | the message body |

## Values

| Property | Value |
|---|---|
| column gap | `--v27-spacing-s` (8px) |
| bubble padding | `--v27-spacing-sm` `--v27-spacing-m` (12px 16px) |
| bubble gap | `--v27-spacing-sm` (12px) |
| bubble radius | `--v27-radius-m` (8px) |
| bubble background | `Background/Highlight` |
| bubble text | Base, `Foreground/Primary` |
| max width | 985px |
| avatar | 32px, 46px radius |

The timestamp is a raw **12px** belonging to no named text style - the same gap as Avatar's
small size, FINDINGS.md #24.

Figma binds the bubble's border to `2nd (light)/Grey steel`, a legacy palette style holding
`#e5e5e5`. `Border/Default` holds the identical value and is bound on the attachment card
inside the same component, so `Border/Default` is used for both. FINDINGS.md #29.

---

# Document attachment

Figma: standalone symbol `Document attachment`, node `58:1073`. Not a variant set; measured
as an instance inside User chat bubble (`2879:59434`).

```html
<div class="v27-attachment">
  <svg class="v27-attachment__icon" viewBox="0 0 32 32" aria-hidden="true"><!-- file glyph --></svg>
  <div class="v27-attachment__body">
    <span class="v27-attachment__name">Document name</span>
    <span class="v27-attachment__meta">Document sub info</span>
  </div>
  <button type="button" class="v27-attachment__menu" aria-label="Document actions">
    <svg viewBox="0 0 24 24" aria-hidden="true"><!-- context menu --></svg>
  </button>
</div>
```

| Class | What it is |
|---|---|
| `.v27-attachment` | the card |
| `.v27-attachment__icon` | 32px file glyph |
| `.v27-attachment__body` | name and metadata |
| `.v27-attachment__name` | Base, `Foreground/Primary` |
| `.v27-attachment__meta` | Sm, `Foreground/Secondary` |
| `.v27-attachment__menu` | 24px context-menu button |

`Background/Primary`, 1px `Border/Default`, 8px radius, 12px padding, 8px gap.

The file-type glyph is not bundled - supply your own, as with every icon in this library
(FINDINGS.md #8).
