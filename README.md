# V27 Design System

The V27 design system as CSS, generated from Figma and kept an exact copy of it.

**125 design tokens** - light and dark - no framework, no dependencies.

---

## Use

```html
<link rel="stylesheet" href="src/tokens.css" />
<link rel="stylesheet" href="src/styles.css" />
```

Dark mode is an attribute, and it works on any element - so a dark region can be scoped
inside a light page rather than only at the document root:

```html
<html data-v27-theme="dark">
```

39 of the tokens have a dark counterpart. Components reference semantic tokens only, so
switching the attribute is the whole mechanism - no component branches on theme itself.

## Tokens

Two tiers, mirroring Figma.

**Primitives** hold raw values. Neutral has 11 steps, Blue / Green / Red / Pink / Purple
have 10 each, Orange has 9.

```css
--v27-neutral-700: #3e3e3e;
--v27-pink-600:    #c82269;
```

**Semantic** tokens name a role and point at a primitive. Component CSS uses **only**
these - never a primitive, never a literal.

```css
--v27-foreground-primary: var(--v27-neutral-700);
--v27-border-theme:       var(--v27-pink-600);
```

That indirection is the whole point: it is what makes dark mode a single attribute, and
what would make a rebrand a change to one file.

**Dimensions** cover size, spacing and radius on the same scale Figma defines.

### Tokens are generated, not written

```
Figma variables -> tokens/variables.json -> tools/build-tokens.mjs -> src/tokens.css
```

**Do not hand-edit `src/tokens.css`.** The next export overwrites it, and an edit
silently desynchronises the library from Figma. Change the variable in Figma, re-export,
re-run the build.

```bash
node tools/build-tokens.mjs
node tools/build-token-reference.mjs   # visual check, both themes side by side
```

Typography is the one hand-maintained input. V27 publishes no text styles to its library
and has no type collection in the variables export, because the styles are **local to the
Figma file** - so they are transcribed in `tokens/typography.json` with the node ids each
value was measured on, and the build emits them alongside the rest.

## Audits

Five checks, each catching a defect that reached production in an earlier build of this
kind. All five exit non-zero on a finding.

```bash
node tools/audit.mjs
```

| Audit | Catches |
|---|---|
| `ascii` | a non-ASCII byte that would propagate into every generated doc |
| `raw-literals` | a literal where a token with that value exists (bucket A fails; bucket B is a recorded gap) |
| `shared-state` | a themeable value pinned on a base that only some variants override |
| `duplicate-rules` | a rule that hand-rolls most of a shared component |
| `nested-interactive` | an interactive element inside a `<button>` or `<a>` |

A literal Figma genuinely leaves unbound is declared, not ignored:

```css
background: #fff; /* figma-literal: 4634:80745 - raw white, not Background/Primary */
```

An unexplained literal still fails the build.

## Export

Everything that leaves this repo is generated from one model, so nothing is maintained in
two places.

```bash
node tools/build-model.mjs     # -> export/model.json
node tools/build-copilot.mjs   # -> export/copilot/
node tools/check-docs.mjs      # validates the bundle
```

`export/copilot/` is self-contained: instructions, per-component detail, and the CSS
itself. The always-on instructions file is deliberately small (under 3 KB) because Copilot
loads it on every request; the per-component detail is read on demand, so the always-on
cost does not grow as the library does.

## Claude Design

```bash
node tools/build-design-bundle.mjs   # -> ds-bundle/
```

One card per component, grouped into Actions, Forms, Feedback, Navigation, Content and AI.
Each card renders the component in **both themes** side by side, and its doc sits in the
same folder so the spec is one click from the preview.

The preview markup is not written for the bundle - it is lifted from the ```html fences
already in `docs/`. Those are the examples a consumer is told to copy, and the
nested-interactive audit already parses them, so a card cannot show markup the
documentation does not endorse and a broken example fails the audit before it becomes a
card.

Every component must appear in the group map; an unmapped name fails the build rather than
falling into a default section, because a default that hides a typo is the same failure as
an audit that never fires.

The build fails rather than emitting a broken file if a reference does not resolve, if the
two theme modes fall out of sync, or if a non-ASCII character appears.

## Layout

| Path | What it is |
|---|---|
| `src/tokens.css` | Generated. The token layer. |
| `src/styles.css` | Component classes, `.v27-*`. |
| `tokens/variables.json` | The Figma export, committed as the source of truth. |
| `tools/` | Build and audit scripts. |
| `docs/` | One file per component. |
| `.figma/` | Snapshots and survey notes, with Figma node ids. |
| `FINDINGS.md` | Gaps in the Figma file that the code reproduces rather than corrects. |

## The rule that matters

Every value comes from Figma, read off the node and recorded with its node id. Not
approximated from a screenshot, not inferred from a sibling component, not adjusted to
taste.

Where a value could not be verified, that is stated rather than guessed at. Where Figma
itself is inconsistent, the code matches Figma and the inconsistency is written down in
[FINDINGS.md](FINDINGS.md) - so a deliberate oddity is never mistaken for a bug.
