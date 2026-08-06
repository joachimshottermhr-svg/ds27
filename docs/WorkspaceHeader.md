# Workspace header

Figma: `workspace header`, node `7694:89257` (page Components, `1:28`).
2 variants - `mobile[2]` - plus a boolean `icon` property outside the axes.

A titled bar with a rule beneath it and a row of plain icon buttons on the right.

**Only `mobile=false` is built.** The 375px variant (`7694:89258`) was not measured.

## Markup

```html
<header class="v27-workspace-header">
  <svg class="v27-workspace-header__icon" viewBox="0 0 32 32" aria-hidden="true"><!-- glyph --></svg>
  <h2 class="v27-workspace-header__title">Workspace header</h2>
  <div class="v27-workspace-header__actions">
    <button type="button" class="v27-btn v27-btn--plain v27-btn--icon-only" aria-label="Share">
      <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>
    <button type="button" class="v27-btn v27-btn--plain v27-btn--icon-only" aria-label="Download">
      <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>
    <button type="button" class="v27-btn v27-btn--plain v27-btn--icon-only" aria-label="Favourite">
      <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>
    <button type="button" class="v27-btn v27-btn--plain v27-btn--icon-only" aria-label="Close">
      <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>
  </div>
</header>
```

The leading glyph is optional - that is Figma's boolean `icon` property. The actions are
[Button](Button.md) instances with no fill and no border, not restyled copies.

## Classes

| Class | What it is |
|---|---|
| `.v27-workspace-header` | the bar |
| `.v27-workspace-header__icon` | the optional 32px glyph |
| `.v27-workspace-header__title` | the title |
| `.v27-workspace-header__actions` | the trailing button row |

## Values

| Property | Value |
|---|---|
| padding | `--v27-spacing-sm` `--v27-spacing-ml` (12px 24px) |
| gap | `--v27-spacing-sm` (12px) |
| rule | 1px `Border/Default`, bottom only |
| icon | `--v27-size-l` (32px) |
| title | **20px / 400 / 24** |
| actions | 42px icon-only buttons |

## The title matches no named text style

It is 20px at **regular** weight. The `XL` style is 20px at **600**. So the size comes from
the scale and the weight does not, and the pair exists nowhere as a named style.

That is the same gap as Avatar's 12px semibold and the selected tab's Medium 500 -
FINDINGS.md #24 and #26. Reproduced with its node id rather than promoted to a token,
because a size-weight pair used once and named nowhere is not a scale step.
