# Avatar compact

Figma: standalone symbol `Avatar compact`, node `289:4416` (page Components, `1:28`).
Not a variant set. Measured as an instance inside [Label](Label.md) (`58:916`).

A 24px face beside a name.

## Markup

```html
<span class="v27-avatar-compact">
  <span class="v27-avatar-compact__face"><img src="/people/jane.jpg" alt="" /></span>
  Jane Smith
</span>
```

The face is decorative when the name is beside it, so `alt=""` is correct here.

## Classes

| Class | What it is |
|---|---|
| `.v27-avatar-compact` | the row |
| `.v27-avatar-compact__face` | the 24px face |

## Values

| Property | Value |
|---|---|
| gap | `--v27-spacing-s` (8px) |
| face | `--v27-size-m` (24px), 46px radius |
| label | Base - Outfit 16 / 400 / 20 |
| colour | `Foreground/Primary` |

## This is not the Avatar component

The face here is Figma's `People` symbol - a 46px radius with no ring and no background -
where [Avatar](Avatar.md) is a 29px radius with a themed background and a `Border/Default`
ring. `.v27-avatar` is deliberately **not** reused; composing it would have produced a
visibly different component.

That makes three circular-face treatments in the library, with [Multi avatar](MultiAvatar.md)'s
ringed variant being the third. Worth consolidating in Figma; reproduced as measured until
it is.
