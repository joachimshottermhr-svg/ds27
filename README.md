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
