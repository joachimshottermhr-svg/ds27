# Status

Where the build has got to, and exactly what is left. Kept current so the next session
starts from fact rather than from a re-survey.

## Done

| Phase | State |
|---|---|
| 0 - reusable skill | `~/.claude/skills/figma-to-css-design-system/SKILL.md` |
| 1 - repo | done |
| 2 - token layer | done, including the type tier |
| 3 - components | **29 of 39 component sets** (Progress bar is Single category only) |
| 4 - audits | 5 audits, all wired and each proven against a fixture |
| 5 - export | Copilot bundle, generated from one model, verified in a scratch consumer |

## Components built

Button, Icon, Tags, Coloured circle icons, Avatar, Single Checkbox, Checkbox,
Single radio button, Radio button, in page message, Toggle, Link, Progress bar, Toast,
Breadcrumb, Tab single, Header display, Multi avatar, Content display, Form field, Data display, Step, Step connector, Image, Select button elements, User chat bubble, Label, config tile, Tasks.

Two variants are deliberately unbuilt, both because a value could not be verified rather
than for want of effort: Button's `AI` and `AI bold` types (gradients, no verified value)
and Progress bar's `Multi category` (binds a chart palette that is not in the V27 export -
FINDINGS.md #25).

Every one has a doc in `docs/`, node ids beside every value, and was verified in a browser
against the measured Figma node.

## Not built - 10 component sets

Ordered by variant count, which is roughly the work involved. Node ids are in
`.figma/inventory.json`; nothing needs re-surveying.

| Variants | Set | Node |
|---|---|---|
| 39 | nav elements | `1997:40997` |
| 12 | Entity card | `7661:13220` |
| 8 | Data display | `232:5313` |
| 6 | Label | `58:919` |
| 4 | Content display | `368:13923` |
| 4 | Step | see inventory |
| 3 | Form field | `63:1078` |
| 3 | AI chat bubble | see inventory |
| 2 | App header + top navigation, workspace header, message box, Attachments, AI assistant overlay (mobile), Confirmation modal | see inventory |
| 1 | side nav | see inventory |

Plus, outside the 39 sets:

- **~22 standalone components** on `1:28` - Text area, Tab group, Select button, Carousel,
  Pop up menu, Stepper, date picker, PDF Viewer, mobile bottom sheet, Switcher, Card
  header, Required field, Document attachment and others. These are listed as `standalone`
  in the inventory.
- **The AG Grid page** (`7620:90627`) - table, table card, filter menus. Build **current**
  styling only; the page also contains explicitly labelled future styling (FINDINGS.md #7).
- **The Page templates page** (`7614:51453`) - layout rules rather than components.
- **118 icons** (`1978:35285`) - blocked on licensing, not on effort (FINDINGS.md #8).

## What to do first next time

1. **Raise FINDINGS.md #18 with design.** Components bind variables that are not in the V27
   export (`Text/Text - Primary`, `Icons/Icon - Required field`, `Border/Border - Drop
   shadow`), so the export alone cannot rebuild the file. Everything built after this is
   answered will be more trustworthy.
2. Then work down the table above. The efficient loop is
   `get_variable_defs` on the **set** node - it returns every variable across every variant
   in one call - then one `get_design_context` per set for geometry, then per-variant
   `get_variable_defs` only where the mapping is ambiguous. Coloured circle icons' 21
   variants cost four calls this way instead of twenty-one.
3. Re-run `node tools/audit.mjs` and the export chain after each component. Both are gates,
   not reports.

## The three type styles still missing

`XL Heading`, `Larger Heading` and `Sub heading` are named on the style guide (`1:27`) but
are not emitted, because that node exceeds the metadata ceiling and they could not be read
off their nodes (FINDINGS.md #11). They need reading via screenshots or child nodes. Do not
guess them.
