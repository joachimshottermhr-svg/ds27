# AI chat bubble

Figma: `AI chat bubble`, node `1997:40463` (page Components, `1:28`).
3 variants - `type[3]`: Text, Entity selector, Form.

The assistant's reply, aligned left. The user's counterpart is
[User chat bubble](UserMessage.md).

All three variants are the same frame with different content in the slot, so this is a slot
rather than three variants. Only `Text` (`1997:40461`) was measured; the other two put an
entity picker or a form inside the same box.

## Markup

```html
<div class="v27-ai-message">
  <div class="v27-ai-message__header">
    <svg class="v27-ai-message__logo" viewBox="0 0 32 32" aria-hidden="true"><!-- V27 AI mark --></svg>
    <span class="v27-ai-message__time">8:28AM</span>
  </div>

  <div class="v27-ai-message__bubble">
    <p>Text and buttons</p>
    <div class="v27-ai-message__actions">
      <button type="button" class="v27-btn v27-btn--positive">Primary positive</button>
      <button type="button" class="v27-btn v27-btn--outline">Outline button</button>
    </div>
  </div>

  <div class="v27-ai-toolbar">
    <button type="button" class="v27-ai-toolbar__action" aria-label="Copy"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></button>
    <button type="button" class="v27-ai-toolbar__action" aria-label="Unhelpful"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></button>
    <button type="button" class="v27-ai-toolbar__action" aria-label="Save"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></button>
    <button type="button" class="v27-ai-toolbar__action" aria-label="Show sources"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></button>
  </div>
</div>
```

Every toolbar control is icon-only and needs an `aria-label`.

## Classes

| Class | What it is |
|---|---|
| `.v27-ai-message` | the column |
| `.v27-ai-message__header` | logo and timestamp |
| `.v27-ai-message__logo` | the 32px V27 AI mark |
| `.v27-ai-message__time` | XS, `Foreground/Secondary` |
| `.v27-ai-message__bubble` | the reply |
| `.v27-ai-message__actions` | buttons inside the reply |
| `.v27-ai-toolbar` | the feedback bar |
| `.v27-ai-toolbar__action` | one 24px action |

## Values

| Property | Value |
|---|---|
| column gap | `--v27-spacing-s` (8px) |
| bubble padding / gap | `--v27-spacing-m` (16px) |
| bubble radius | `--v27-radius-m` (8px) |
| bubble background | `Background/Primary` |
| body | Base, `Foreground/Primary` |
| action gap | `--v27-spacing-sm` (12px) |
| toolbar gap / size | 8px, 24px actions |

Unlike the user's bubble, this one fills with `Background/Primary`, so it **does** follow
dark mode.

## The accent colour is not a measured value

Figma applies a style named `AI gradient` to this component. **Gradients do not serialise
through this toolchain** - the style comes back empty, and the `#007ff3` that appears in
Figma's generated reference is the flattened result, not the specification.

So the border colour here is `--v27-ai-accent`, a hook with a neutral `Border/Default`
fallback:

```css
:root { --v27-ai-accent: /* the real gradient, once it is known */; }
```

Everything else about this component is measured. This is the only gap in the library that
cannot be closed by reading harder - see FINDINGS.md #32. It is the same reason Button's
`AI` and `AI bold` types are unbuilt.
