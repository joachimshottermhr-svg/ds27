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

**Status:** SUPERSEDED by #25. A real chart palette does exist - it is simply not in the
V27 export. The conclusion below ("charts are unbuildable") was correct about the V27
export and wrong about the design system. Read #25 before acting on this entry.

~~Accepted, and a genuine blocker for charts specifically. Charts stay out of scope until
real chart tokens exist in Figma.~~

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

## 11. The metadata tool truncates on the two largest pages

**Figma:** `get_metadata` on the Notifications page (`1997:39471`) fails every time, and
fails *identically*: the response stream is cut at exactly character 186,865, mid-string,
and the JSON never closes. It is a hard ceiling in the transport, not a rate limit and not
a transient error - two runs produced byte-identical failures. The Style guide (`1:27`)
fails the same way at 91,143 characters.

**Code:** these two pages are read by screenshot and by drilling into child nodes instead.
The Components page (`1:28`) is just under the ceiling and persists to a file, which is why
it could be inventoried in one pass.

**Status:** open, and a live constraint on the build rather than a defect in the design.
Anything measured on `1:27` or `1997:39471` has to be read node by node.

## 12. Half the file is prototypes, not library

**Figma:** of the nine pages, four define components (`1:28`, `1978:35285`, `7620:90627`,
`7614:51453`), one is prose (`3567:58959`, accessibility criteria) and four are product UX
explorations - Notifications, Forms in the workspace, Natural Language AI Configuration.

**Code:** the prototype pages are **not** built from. They contain instances of library
components, sometimes detached or locally overridden, and treating an instance as a
specification is how a local override becomes a library value. Where a prototype and a
component set disagree, `1:28` wins.

**Status:** accepted, and it is what bounds the build: 39 component sets, plus icons,
plus the AG Grid table components, plus the page-template layout rules.

## 13. Figma binds a variable for some values and leaves others as bare numbers

**Figma:** on Tags (`232:4873`) the padding is bound to `Spacing and Padding/S` and
`Spacing and Padding/XS`, but the 4px gap, the 4px corner radius and the 16px icon box are
bare literals - even though `Radius/S` is 4px and `Size/XS` is 16px and both exist. The
same file binds `Size/L` for the circle icon's height (`7840:19941`) while leaving its
width a literal 32px.

**Code:** where Figma leaves a literal that is exactly on a published scale, the code uses
the token. The rendered value is identical today, and a literal is guaranteed to drift the
moment the scale moves - which is the failure the token layer exists to prevent. Where the
value is **off** the scale (the Button's 42px height and 207px radius, the circle icon's
35px radius) it stays a literal with its node id beside it.

**Status:** open. The binding gaps are worth closing in Figma; the rule above is stated at
the top of `src/styles.css` so the decision is visible rather than inferred.

## 14. The AI tag has no background token and does not follow dark mode

**Figma:** `Tags/property 1=AI` (`7961:123360`) is the only tag with no background
variable. It stacks two raw gradients: a 5%-opacity brand sweep
(blue -> purple -> pink -> red) over a **solid white** base. The label is bound to
`Foreground/Theme`.

**Code:** both gradients are reproduced as the literals they are. The white base means
this variant stays white in dark mode while every other tag flips - a light chip on a dark
surface. That is what Figma specifies, so it is reproduced rather than corrected.

**Status:** open, and worth raising with design: the label uses a theme token that *does*
flip (pink to blue), on a background that does not.

## 15. Figma's auto-generated variant names hide the real axis

**Figma:** the Link set (`27:543`) reports a `property 1` axis with six values - `No icon`,
`Icon left`, `Icon right`, and then `Variant4`, `Variant5`, `Variant6`. The last three are
not three more shapes: they are the same three shapes on the `state=Hover` row, left with
the names Figma generated automatically.

**Code:** three modifiers and a real `:hover`, not six modifiers. Verified by measuring
`27:541` (No icon, Default) and `27:550` (Variant5, Hover) - identical but for the
underline, and both bound to `Foreground/Link`.

**Status:** open. A variant count taken from the axis alone overstates this component by
100%, so the same check is needed on any set with a `VariantN` name.

## 16. Variant counts understate components that use boolean properties

**Figma:** the Tags set reports 12 variants (`property 1[6] x with icon[2]`), but the
component also exposes a **boolean** component property, `removeable`, which is not a
variant axis. The real state count is 24.

**Code:** `.v27-tag__remove` is built as a real `<button>` so it is focusable and
keyboard-operable.

**Status:** open, and it changes how coverage is counted: `.figma/inventory.json` counts
variant axes only, so any set with boolean properties is undercounted there. Coverage must
be checked per component, not from the 259 total.

## 17. Coloured circle icons bind primitives, not semantic tokens

**Figma:** every other component binds a semantic role. `Coloured circle icons`
(`7840:19951`) binds the Primitives collection directly - `Green/100` behind a `Green/700`
glyph, and the same for all seven ramps. There is no semantic role for "the green circle",
so there is nothing to point at.

**Code:** reproduced as bound, referencing primitives. This is the one place in the library
where component CSS touches the primitive tier, and it is commented as such in
`src/styles.css`.

**Consequence:** primitives have a single mode, so **these circles do not change between
light and dark** while everything around them does. That is what the file specifies.

**Status:** open. Worth a decision: either add semantic roles for the seven accent
surfaces, or accept that this component is theme-invariant.

Note also that the dark step is not consistent across ramps - Green, Blue, Purple and Red
use the 700 step; Pink, Orange and Grey use 600. The set exposes no `Pink/700`,
`Orange/700` or `Neutral/700` at all, so this is deliberate rather than an oversight.

## 18. Components bind variables that are not in the V27 export

**Figma:** reading variables off component nodes returns names that do not exist in
`tokens/variables.json`:

| Variable | Value | Seen on |
|---|---|---|
| `Text/Text - Primary` | `#3e3e3e` | Header display `60:1151` |
| `Icons/Icon - Required field` | `#be2028` | Header display `60:1151` |
| `Border/Border - Drop shadow` | `#c1c1c1` | in page message `548:22140` |

The naming shape - `Text/Text - *`, `Icons/Icon - *` - is People First's, not V27's, and the
file subscribes to **both** libraries (see the page inventory note). So some component
values are bound to the *other* library's variables.

**Code:** these have no V27 token, so anything depending on them is a literal with its node
id, or is left unbuilt where the value could not be confirmed.

**Status:** open, and the most consequential finding so far: **the V27 variables export is
not sufficient to rebuild the V27 file.** `Text/Text - Primary` happens to equal
`Foreground/Primary` (`#3e3e3e`), so it is invisible until a rebrand moves one and not the
other. `Icons/Icon - Required field` `#be2028` has no V27 equivalent at all.

## 19. There is a shadow style but no shadow token

**Figma:** `in page message` (`548:22140`) carries an effect style
`Drop shadow = Effect(type: DROP_SHADOW, color: Border/Border - Drop shadow, offset: (0,0),
radius: 4, spread: 0)` - i.e. `box-shadow: 0 0 4px #c1c1c1`.

**Code:** reproduced as a literal, because the colour it references is not a V27 variable
(#18) and the Dimensions collection has no shadow tier.

**Status:** open. Effect styles are not variables, so like typography they will never appear
in a variables export - they have to be read off the node.

## 20. In page message is a fixed 56px high

**Figma:** every one of the ten variants (`548:22135` and siblings) is `h-[56px]` - a fixed
height, not a minimum - while the body text is a paragraph of placeholder copy long enough
to wrap.

**Code:** built as `min-height: 56px`. A fixed height would clip the second line of any
real message, and the component's own placeholder text demonstrates the case.

**Status:** open. This is the one place the code deliberately does **not** reproduce Figma
exactly, because reproducing it would ship a component that cannot hold its own content.
Flagged rather than silently changed.

## 21. Toggle uses a foreground role as a background

**Figma:** `Toggle/state=on` (`4634:77832`) fills the track with `Foreground/Positive`
(`#017e26`). Every other component in the library uses a `Background/*` role for a surface;
this is the only place a foreground role is used as one. There is no `Background/Positive
bold` to point at - `Background/Positive` is the pale `#e5f4e7` used behind tags.

**Code:** reproduced as bound.

**Status:** open. The rendered result is correct; the role name is misleading, and a future
retokenisation of `Foreground/Positive` (a text colour) would silently restyle a switch.

The knob is a raw white rather than `Background/Primary`, so it does not follow dark mode.
It is marked `figma-literal` in `src/styles.css` so the raw-literals audit accepts it with
its node id rather than proposing a token that would change the behaviour.

## 22. Primitives are used where a semantic role with the same value exists

**Figma:** this is a recurring pattern, not a one-off:

| Node | Binds | A semantic role with the same value |
|---|---|---|
| Single Checkbox, selected+disabled `66:1630` | `Neutral/400` `#c1c1c1` | `Border/Bold` |
| Single Checkbox, selected+disabled `66:1630` | `Neutral/0` `#ffffff` | `Background/Primary` |
| Checkbox, Disabled `66:1688` | `Neutral/600` `#656565` | `Foreground/Secondary` |
| Coloured circle icons `7840:19951` | all seven ramps | none exists (#17) |

Only the last has an excuse. The other three had a semantic role available and did not use
it.

**Code:** reproduced as bound, so the CSS references primitives in these three places.

**Status:** open. The values are identical today, so nothing looks wrong - which is exactly
the problem. Retokenising `Foreground/Secondary` will move every disabled label in the
library **except** the checkbox's, and the divergence will appear as a one-off visual bug
long after the change that caused it.

## 23. A component and its own instance disagree about a fill

**Figma:** `Single radio button` leaves its background an unbound raw white on its own
variants (`66:1540`, `66:1539` - neither reports a `Background/*` variable). The **instance
of that same component** inside `Radio button` (`66:1592`) binds `Background/Primary`.

So the component definition and its only in-library usage specify different things. In
light mode both are `#ffffff` and the disagreement is invisible; in dark mode one flips and
the other does not.

**Code:** `Background/Primary` is used, matching the instance - it is how the component
actually appears in the library, it matches Single Checkbox, which binds `Background/Primary`
on its own node, and a raw white dial would be the only control in the library that ignores
dark mode without a reason.

**Status:** open, and it needs a designer's answer rather than a developer's guess. If the
raw white is deliberate, Single Checkbox is wrong; if not, the radio is.

## 24. Avatar's small size uses a type size that is in no text style

**Figma:** the three Avatar sizes carry three different type sizes, and only two of them
are named styles:

| Size | Box | Type | Named style |
|---|---|---|---|
| Small | 24px | Outfit SemiBold **12** / auto | **none** - `4326:67571` reports no style |
| Medium | 32px | Outfit SemiBold 14 / auto | `Sm bold` |
| Large | 40px | Outfit SemiBold 16 / 20 | `Base bold` |

**Code:** the 12px is a literal carrying its node id, marked `figma-literal` so the audit
accepts it. It is not added to the type tier, because a size used once and named nowhere is
not a scale step.

**Status:** open. Either the scale is missing an `Xs bold` step, or the small avatar should
use `Sm bold` like the medium one. A one-off type size is how a scale erodes.

## 25. A real chart palette exists - it is just not in the V27 export

**This supersedes #3, which was based on the export alone and is wrong about the wider
design system.**

**Figma:** the Progress bar set (`405:17846`) binds three chart variables with genuinely
distinct, usable colours:

| Variable | Value |
|---|---|
| `Charts/Chart 1` | `#0075be` blue |
| `Charts/Chart 2` | `#fc8700` orange |
| `Charts/Chart 3` | `#00ad60` green |

None of them is in `tokens/variables.json`. The V27 export contains a *different* thing - a
single `Chart/1` that is `#ffffff` in both modes - and the two are not the same group.
`Charts/*` is another instance of #18: a variable bound on a V27 component that lives in
the People First library.

**Code:** the multi-category Progress bar, which is where these are used, is **not built** -
see below. No V27 token points at these values, so building against them would either
hard-code three hexes or invent three tokens.

**Status:** open, and it changes a decision. Charts are **not** blocked for want of a
palette; they are blocked for want of that palette being published as V27 variables. That
is a much smaller problem than #3 described, and it is worth raising - three usable chart
colours already exist and are already in use on a shipped component.

Note also that `Chart/1` `#ffffff` in the V27 export now looks less like an oversight and
more like a placeholder nobody replaced, given a real palette existed elsewhere all along.

## 26. A third font weight is in use that belongs to no text style

**Figma:** the selected tab (`347:15174`) is `Outfit Medium, weight 500`. Every named text
style in the file is either Regular (400) or SemiBold (600) - `Sm`, `Base`, `Sm bold`,
`Base bold`, `Lg bold`. There is no Medium style, and 500 appears nowhere else so far.

**Code:** a literal carrying its node id, marked `figma-literal`. It is not added to the
token layer, because a weight used once and named nowhere is not a scale step - the same
reasoning as Avatar's 12px in #24.

**Status:** open. Together with #24 this is a pattern rather than two accidents: the type
scale is five named styles, and components reach outside it whenever they want a size or
weight it does not offer. Each one that is not brought back into the scale is a value no
retokenisation will ever reach.

## 27. Content display's second axis does nothing

**Figma:** the set (`368:13923`) reports `property 1[2]` x `property 2[2]` = 4 variants,
and the inventory lists the axis values as duplicates:

```
Property 1=Avatar, Property 2=Default          368:13922
Property 1=Avatar, Property 2=Default          368:13921
Property 1=Icon,   Property 2=Default with text 368:13920
Property 1=Icon,   Property 2=Default with text 368:13919
```

The same combination appears twice, and `Default` versus `Default with text` does not
describe a difference that exists: both measured nodes render a title **and** a subtitle.

**Code:** built as two shapes with one slot, not four variants.

**Status:** open. Either two variants are redundant and should be deleted, or `property 2`
was meant to toggle the subtitle and no longer does. Both are worth a minute of a
designer's time; neither is safe for a developer to resolve by guessing which.

This is the fourth counting problem in the file, after #15 (auto-named `VariantN`
duplicates), #16 (boolean properties outside the axes) and the duplicated names here. The
259-variant total should not be used as a measure of anything.

## 28. A style named "DEPRECATED COLOURS" is still bound on a shipped component

**Figma:** `Select button elements/Selected=true` (`2290:83278`) sets its label colour from
a style called **`DEPRECATED COLOURS/White`** (`#FFFFFF`). The name says the group should
not be used; the component uses it anyway.

`Foreground/Inverted` exists in the V27 semantic tier and is white in light mode, which is
almost certainly what this was meant to be - the Button's positive type already uses it.

**Code:** `--v27-foreground-inverted` is used, **not** a literal white. This is the one
place the build does not reproduce a binding exactly, and the reasoning is that the binding
is explicitly marked as wrong by its own name. Reproducing it would carry a deprecation
into new code and freeze the label white in dark mode.

**Status:** open, and the clearest single action in this file: rebind that layer to
`Foreground/Inverted` and delete the deprecated group. If white was deliberate rather than
inverted, say so and this decision reverses.

Worth searching the rest of the file for other `DEPRECATED COLOURS/*` bindings before the
group is deleted - only the components built so far have been checked.

## 29. A legacy palette style sits next to the semantic token holding the same value

**Figma:** the User chat bubble's border (`1997:40457`) is bound to a style called
**`2nd (light)/Grey steel`** = `#E5E5E5`. Two levels down inside the *same component*, the
Document attachment card's border is bound to `Border/Default` - which is also `#e5e5e5`.

One component, one visual treatment, two different sources for it.

**Code:** `Border/Default` is used for both.

**Status:** open. With #28's `DEPRECATED COLOURS/White`, there are now at least two legacy
style groups still bound on live components - `2nd (light)/*` and `DEPRECATED COLOURS/*` -
alongside `Text/*`, `Icons/*` and `Charts/*` from the People First library (#18, #25).

That is five distinct colour sources in a system whose token layer is a clean two tiers.
The tokens are not the problem; what components bind to is. A single audit pass over the
Figma file for any fill or stroke NOT bound to a V27 variable would be worth more than any
further work in this repo.

## 30. Four components hand-roll the same card, and V27 has no Card component

**Figma:** Document attachment, Data display, config tile and Tasks all draw the identical
surface - a 1px `Border/Default`, an 8px radius and a white fill - and each defines it
independently. There is no Card component in the file for any of them to compose. The
standalone `Card header` symbol exists, but a header is not the surface.

Two of the four fill with `Background/Primary` and two with a **raw white**, so they already
disagree: in dark mode two would flip and two would not.

**Code:** the four are declared as an accepted group in `src/styles.css` so the
duplicate-rules audit does not report them against each other. An undeclared fifth card
still fails the build - verified.

No `.v27-card` was invented. Extracting one would assert a component the design file does
not have, and the point of this library is that it does not invent structure.

**Status:** open, and the highest-value structural fix available in the Figma file. One Card
component would remove four independent definitions, settle the white-versus-`Background/
Primary` disagreement, and give dark mode a single place to be correct.

---

## Page inventory

The file's page listing is broken - `get_metadata` with no node id returns only a "Cover"
page containing a title thumbnail. Pages must be read by node id instead.

| Node id | Page | Contents | Source of components? |
|---|---|---|---|
| `1:27` | Style guide | tokens, typography, dimensions, markdown rules. Exceeds the metadata size ceiling; use screenshots or read its children | yes - typography |
| `1:28` | **Components** | 286 symbols - 259 variants, 27 standalone - across 39 component sets | **yes - the library** |
| `1978:35285` | Icons | 118 icons, Font Awesome naming | yes - icons |
| `7620:90627` | AG Grid | table elements, filter menus, table, table card. Contains current **and** planned styling | yes - table components |
| `7614:51453` | Page templates | desktop + mobile page templates, right panels, AI assistant, adaptive card and workspace panel layout specs | yes - layout rules |
| `3567:58959` | Accessibility | WCAG success criteria written up as user stories - page titles (2.4.2 A), page zoom 400%, bypass blocks (2.4.1 A), language, focus, landmarks | no - prose spec |
| `7267:80667` | Natural Language AI Configuration | prototype flows for configuring AI in natural language | no - prototype |
| `4809:205085` | Forms in the workspace | PF27 UX exploration: form rules, large / small / partial forms in the workspace | no - prototype |
| `1997:39471` | Notifications | PF27 UX exploration: notification prototype, desktop and mobile | no - prototype |

All nine identified. Four pages carry component definitions; four are product/UX prototype
pages built **from** the library, and one is prose. A prototype page is not a specification
- where a prototype screen and a component set disagree, the component set on `1:28` wins,
because the prototype is an instance that may be stale or locally overridden.

---

## Naming changes made in code

One Figma name is shortened for use in CSS. No value changes.

| Figma group | CSS | Why |
|---|---|---|
| `Spacing and Padding` | `--v27-spacing-*` | The literal slug is `--v27-spacing-and-padding-xxs`, which would appear in nearly every rule in the library. |
