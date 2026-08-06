# Header display

Figma: `Header display`, node `60:1151` (page Components, `1:28`).
5 variants - `type[5]`: Person, Image, Icon, Text only, Form header.

All five are the same thing: an optional leading slot beside a title/subtitle column. Only
the slot's contents change, so the slot is a container you fill with an existing component
rather than five separate blocks.

## Markup

Text only:

```html
<div class="v27-header-display">
  <div class="v27-header-display__text">
    <span class="v27-header-display__title">Text header</span>
    <span class="v27-header-display__subtitle">Sub text</span>
  </div>
</div>
```

Person - compose an [Avatar](Avatar.md) into the slot:

```html
<div class="v27-header-display">
  <span class="v27-header-display__media">
    <span class="v27-avatar v27-avatar--large"><img class="v27-avatar__image" src="/p.jpg" alt="" /></span>
  </span>
  <div class="v27-header-display__text">
    <span class="v27-header-display__title">Person header</span>
    <span class="v27-header-display__subtitle">Sub text</span>
  </div>
</div>
```

Icon and Image are the same shape with an [Icon](Icon.md) or an `<img>` in the slot.

Form header - the subtitle is replaced by a required-field key:

```html
<div class="v27-header-display">
  <div class="v27-header-display__text">
    <span class="v27-header-display__title">Text header</span>
    <span class="v27-header-display__required">Denotes a required field</span>
  </div>
</div>
```

## Classes

| Class | What it is |
|---|---|
| `.v27-header-display` | the row |
| `.v27-header-display__media` | the leading slot; carries no size of its own |
| `.v27-header-display__text` | title/subtitle column |
| `.v27-header-display__title` | Lg bold, `Foreground/Primary` |
| `.v27-header-display__subtitle` | Sm, `Foreground/Secondary` |
| `.v27-header-display__required` | the required-field key, with its 6px dot |

## Values

Verified on `138:3276` (Text only), `138:2859` (Person) and `1227:24260` (Form header).

| Property | Value |
|---|---|
| row gap | `--v27-spacing-s` (8px) |
| title/subtitle gap | `--v27-spacing-xxs` (2px) |
| title | Lg bold - Outfit 18 / 600 / auto |
| subtitle | Sm - Outfit 14 / 400 / 16 |
| required key gap | `--v27-spacing-s` (8px), 6px dot |

The slot deliberately carries no size. Compose `.v27-avatar` or `.v27-icon` inside it -
do not size it from the header, which would be styling a component from outside its scope.

**The Icon and Image slot sizes are unverified.** The set's variables include `Size/L`
(32px), which is very likely the icon box, but neither variant was measured directly, so no
size is asserted here. Both work today because the slot takes its size from what you put in
it.

## Two values come from outside V27

The Form header's required-field key binds `Text/Text - Primary` for its label and
`Icons/Icon - Required field` (`#be2028`) for its dot. **Neither is in the V27 variables
export** - both come from the People First library (FINDINGS.md #18).

The label resolves to the same value as `Foreground/Primary` today, so that token is used.
The dot has no V27 equivalent at all, so it is a literal carrying its node id.
