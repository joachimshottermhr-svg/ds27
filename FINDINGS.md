# Findings

Gaps and oddities in the V27 Figma file that the code reproduces **faithfully rather than
correcting**. This file exists so a deliberate value is not mistaken for a bug and "fixed"
by the next person to open the repo.

Each entry says what Figma specifies, what the code does, and whether it is settled.

---

## 1. Typography is not in the variables export

**Figma:** the style guide (node `1:27`) has a Typography frame - XL Heading, Larger
Heading, Sub heading and so on - but there is no type collection in the variables export.
Type is defined as Figma *text styles*, which the variables API does not return.

**Code:** font sizes, weights and line heights must be read from node `1:27` directly and
recorded with the node id beside each value. Until then the token layer has no type tier.

**Status:** accepted. Reviewed 2026-08-05.

## 2. Three semantic tokens hold a raw hex instead of a primitive reference

**Figma:** every token in the Semantic collection aliases a primitive, except three, which
are literal `#ffffff`:

| Token | Mode |
|---|---|
| `Chart/1` | Lightmode |
| `Chart/1` | Darkmode |
| `Background/Navigation` | Darkmode |

**Code:** emitted as the literal they are - `--v27-chart-1: #ffffff`. No primitive was
invented to point them at, because inventing one would fabricate a design decision.

**Status:** accepted. Reviewed 2026-08-05.

## 3. The chart palette is a single white swatch

**Figma:** `Chart/1` is the only chart token in either mode, and it is `#ffffff`.

**Code:** the token is carried across. **No charting component can be built** against a
one-colour palette that is the same as the light background, and no substitute palette has
been generated.

**Status:** accepted, and a genuine blocker for charts specifically. Charts stay out of
scope until real chart tokens exist in Figma.

## 4. The theme colour changes hue between modes

**Figma:** the theme role is pink in light and blue in dark.

| Token | Lightmode | Darkmode |
|---|---|---|
| `Foreground/Theme` | `Pink.600` `#c82269` | `Blue.300` `#80d0fd` |
| `Background/Theme` | `Pink.50` `#fef8fa` | `Blue.800` `#003877` |
| `Border/Theme` | `Pink.600` `#c82269` | `Blue.300` `#80d0fd` |

**Code:** implemented exactly. Verified in the browser: the theme colour resolves to
`#c82269` in light and `#80d0fd` in dark.

**Status:** accepted and intended. Do not "correct" dark mode toward pink.

## 5. Orange has no 50 step

**Figma:** Neutral has 11 steps (0-900); Blue, Green, Red, Pink and Purple have 10 (50-900);
Orange has 9, starting at 100.

**Code:** the nine steps that exist are emitted. No tenth was interpolated.

**Status:** accepted.

## 6. Variant axis names are inconsistently cased

**Figma:** both `size` and `Size` appear as variant axis names, and both `state` and
`State`. Counted across the Components page (node `1:28`): `size` 60, `Size` 35, `state`
60, `State` 22.

**Code:** normalised to lowercase in CSS class names. The original Figma casing is recorded
per component in its snapshot notes so the mapping stays traceable.

**Status:** accepted.

---

## Naming changes made in code

One Figma name is shortened for use in CSS. No value changes.

| Figma group | CSS | Why |
|---|---|---|
| `Spacing and Padding` | `--v27-spacing-*` | The literal slug is `--v27-spacing-and-padding-xxs`, which would appear in nearly every rule in the library. |
