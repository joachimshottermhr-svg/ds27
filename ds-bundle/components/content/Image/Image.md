# Image

Figma: `Image`, node `378:18391` (page Components, `1:28`).
3 variants - `property 1[3]`: small, medium, large.

A picture in a rounded box. Figma's axis is named `Property 1`; its values name sizes.

## Markup

```html
<span class="v27-image v27-image--medium">
  <img src="/company-logo.png" alt="Acme Ltd" />
</span>
```

Give the `<img>` a real `alt`, or `alt=""` if the picture is decorative and the meaning is
already in adjacent text.

## Classes

| Class | Box | Figma node |
|---|---|---|
| `.v27-image` | required base, 4px radius | `378:18391` |
| `.v27-image--small` | 24px (`--v27-size-m`) | `378:18390` |
| `.v27-image--medium` | 32px (`--v27-size-l`) | `378:18389` |
| `.v27-image--large` | 40px (`--v27-size-xl`) | `378:18388` |

All three boxes were measured on their nodes and all three sit on the Size scale.

## Values

| Property | Value |
|---|---|
| radius | `--v27-radius-s` (4px) |
| fit | `object-fit: cover` |

Figma binds `Size/L` for the medium variant's height and leaves its width a bare 32px - the
same binding inconsistency as the circle icon's, FINDINGS.md #13.

## The white underlay is not reproduced

Figma places a solid white rectangle behind the picture. That is a transparency backstop in
the design tool, not a design decision - an `<img>` with `object-fit: cover` fills the box
and leaves nothing showing through. Reproducing it would put a white flash behind every
image in dark mode.
