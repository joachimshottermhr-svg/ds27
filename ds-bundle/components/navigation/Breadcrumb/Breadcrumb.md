# Breadcrumb

Figma: `Breadcrumb`, node `3401:59667` (page Components, `1:28`).
2 variants - `property 1[2]`: breadcrumb and back.

The two variants are **different components sharing a set**: `breadcrumb` is the full
trail, `back` is a single return link. They share no geometry, so they have separate
classes rather than a modifier.

## Markup

The trail. A `<nav>` with a label, and the current page marked with `aria-current`:

```html
<nav class="v27-breadcrumb" aria-label="Breadcrumb">
  <svg class="v27-breadcrumb__icon" viewBox="0 0 24 24" aria-hidden="true"><!-- glyph --></svg>
  <svg class="v27-breadcrumb__separator" viewBox="0 0 20 20" aria-hidden="true"><!-- chevron --></svg>
  <a class="v27-breadcrumb__link" href="/people">People</a>
  <svg class="v27-breadcrumb__separator" viewBox="0 0 20 20" aria-hidden="true"><!-- chevron --></svg>
  <a class="v27-breadcrumb__link" href="/people/teams">Teams</a>
  <svg class="v27-breadcrumb__separator" viewBox="0 0 20 20" aria-hidden="true"><!-- chevron --></svg>
  <span class="v27-breadcrumb__current" aria-current="page">Current page</span>
</nav>
```

The back link:

```html
<a class="v27-breadcrumb-back" href="/people">
  <svg class="v27-breadcrumb-back__icon" viewBox="0 0 20 20" aria-hidden="true"><!-- chevron --></svg>
  Back to people
</a>
```

Separator chevrons are `aria-hidden` - they are decoration, and a screen reader announcing
"greater-than" between every level is noise.

## Classes

| Class | What it is |
|---|---|
| `.v27-breadcrumb` | the trail |
| `.v27-breadcrumb__icon` | 24px leading glyph |
| `.v27-breadcrumb__separator` | 20px chevron |
| `.v27-breadcrumb__link` | an ancestor level |
| `.v27-breadcrumb__current` | the current page |
| `.v27-breadcrumb-back` | the single return link |
| `.v27-breadcrumb-back__icon` | its 20px chevron |

## Values

| Property | Trail (`2317:68830`) | Back (`3401:59668`) |
|---|---|---|
| gap | `--v27-spacing-xs` (4px) | `--v27-spacing-s` (8px) |
| leading glyph | 24px (`--v27-size-m`) | 20px (`--v27-size-s`) |
| separator | 20px (`--v27-size-s`) | n/a |
| link colour | `Foreground/Secondary` | `Foreground/Secondary` |
| current page | `Foreground/Theme` | n/a |
| type | Sm | Sm |

The two gaps genuinely differ - 4px on the trail, 8px on the back link - so they are not
consolidated.

Figma gives the ancestor links **no underline and no hover state**. None is invented here.
That is worth raising: an unstyled, unhovered text link is hard to identify as clickable,
and the current page is the only item in the trail with any colour emphasis.
