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

## 7. The Figma file contains planned styling alongside current styling

**Figma:** the AG Grid page (`7620:90627`) has frames explicitly labelled **"Current
styling"** next to **"Future (planned) styling"** - the date picker, the multiple search
filter and the sort menu each appear twice, in two different designs.

**Code:** build **current** styling only. Anything under a "Future" or "planned" frame is
not shipped and must not be read as the specification.

**Status:** open. This pattern may exist on other pages; check the frame name before
measuring anything.

## 8. Icons are Font Awesome, not Tabler

**Figma:** the Icons page (`1978:35285`) holds 118 icon components named
`pen-to-square`, `thumbtack`, `microchip-ai`, `wave-pulse`, `sort-down-fill` and so on -
Font Awesome naming, including several Pro-only and brand icons (`twitch`, `tiktok`,
`pinterest`).

**Code:** not yet built. Note that this differs from People First, which uses Tabler, so
no icon can be carried across between the two systems.

**Status:** open. Licensing for any Pro or brand icons needs confirming before they are
embedded.

## 9. The type face is Outfit, and it is neither licensed nor bundled here

**Figma:** every Button variant reports `Font(family: "Outfit", style: SemiBold, size: 14,
weight: 600, lineHeight: 100, letterSpacing: 0)`.

**Code:** referenced as `var(--v27-font-family, "Outfit")` with a system fallback. No
webfont is bundled, so the library renders in the fallback unless the consuming app loads
Outfit itself.

**Status:** open. Needs a licensing decision and a hosting route before the type tier lands.

## 10. Button geometry does not use the dimension tokens

**Figma:** the button box is height `42px`, min-width `100px`, radius `207px`. The Size
scale is 16/20/24/32/40 and the Radius scale is 4/8/16, so none of the three is on a scale.
The padding does map exactly - `16px` is Spacing/M, `8px` is Spacing/S.

**Code:** the three are literals with the node id recorded beside them. Padding uses tokens.

**Status:** accepted. Worth asking whether 42 and 100 should join the scale.

---

## Page inventory

The file's page listing is broken - `get_metadata` with no node id returns only a "Cover"
page containing a title thumbnail. Pages must be read by node id instead.

| Node id | Page | Contents |
|---|---|---|
| `1:27` | Style guide | tokens, typography, dimensions, markdown rules. Exceeds the metadata size ceiling; use screenshots or read its children |
| `1:28` | **Components** | 286 symbols - 259 variants, 27 standalone - across ~40 component sets |
| `1978:35285` | Icons | 118 icons, Font Awesome naming |
| `7620:90627` | AG Grid | table elements, filter menus, table, table card. Contains current **and** planned styling |
| `7614:51453` | *not yet identified* | |
| `3567:58959` | *not yet identified* | |
| `7267:80667` | *not yet identified* | |
| `4809:205085` | *not yet identified* | |
| `1997:39471` | *not yet identified* | |

Identify the remaining five before claiming full coverage.

---

## Naming changes made in code

One Figma name is shortened for use in CSS. No value changes.

| Figma group | CSS | Why |
|---|---|---|
| `Spacing and Padding` | `--v27-spacing-*` | The literal slug is `--v27-spacing-and-padding-xxs`, which would appear in nearly every rule in the library. |
