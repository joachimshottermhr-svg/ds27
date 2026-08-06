# Chat input

Figma: `Chat component`, node `1997:43042` (page Components, `1:28`).
Not a variant set. Measured as the body of [message box](MessageBox.md) (`2060:43412`).

The AI prompt composer on its own: a text area, two tool buttons and a send button.

## Markup

```html
<div class="v27-chat-input">
  <textarea class="v27-chat-input__field" rows="1" placeholder="Ask People First..."></textarea>
  <div class="v27-chat-input__toolbar">
    <div class="v27-chat-input__tools">
      <button type="button" class="v27-chat-input__tool" aria-label="Attach a file">
        <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
      </button>
      <button type="button" class="v27-chat-input__tool" aria-label="Dictate">
        <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
      </button>
    </div>
    <button type="button" class="v27-btn v27-btn--positive v27-btn--icon-only" aria-label="Send">
      <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>
  </div>
</div>
```

Every icon-only control needs an `aria-label` - the glyphs are not bundled and carry no
text. The send control is a [Button](Button.md) instance, not a restyled copy.

## Classes

| Class | What it is |
|---|---|
| `.v27-chat-input` | the composer |
| `.v27-chat-input__field` | the text area |
| `.v27-chat-input__toolbar` | tools and send |
| `.v27-chat-input__tools` | the left tool group |
| `.v27-chat-input__tool` | one 24px tool button |

## Values

| Property | Value |
|---|---|
| padding | `--v27-spacing-m` (16px) |
| gap | `--v27-spacing-m` (16px) |
| radius | **`--v27-radius-l` (16px)** |
| border | 1px `Border/Default` |
| background | `Background/Primary` |
| placeholder | Base, `Foreground/Secondary` |
| tools | 24px (`--v27-size-m`), 12px apart |

This is the **only** component in the library that uses `Radius/L`. Every other card in
V27 is 8px, so a 16px radius here is either deliberate emphasis for the AI surface or an
inconsistency - worth confirming, and reproduced as measured either way.

Unlike the five components in FINDINGS.md #30, this one fills with `Background/Primary`
rather than a raw white, so it **does** follow dark mode.
