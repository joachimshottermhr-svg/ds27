# App header + top navigation

Figma: `App header + top navigation`, node `2317:69137` (page Components, `1:28`).
2 variants - `mobile[2]` - plus **three** boolean properties (`breadcrumbTitle`,
`tabLevel1`, `tabLevel2`), so the real state count is 16, not 2.

**Only `mobile=True` (`2317:69206`) is measured.** The desktop variant (`2317:68864`) is a
1860x209 frame that was not read.

## Markup

```html
<header class="v27-app-header">
  <div class="v27-app-header__bar">
    <div class="v27-app-header__identity">
      <svg class="v27-app-header__icon" viewBox="0 0 32 32" aria-hidden="true"></svg>
      <h1 class="v27-app-header__title">App name</h1>
      <button type="button" class="v27-btn v27-btn--outline v27-btn--icon-only" aria-label="Ask AI">
        <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
      </button>
    </div>

    <div class="v27-app-header__tabs">
      <div class="v27-tab-group" role="tablist" aria-label="Sections">
        <button type="button" role="tab" class="v27-tab" aria-selected="true">Tab 1</button>
        <button type="button" role="tab" class="v27-tab" aria-selected="false">Tab 2</button>
      </div>
      <div class="v27-tab-group v27-tab-group--sub" role="tablist" aria-label="Subsections">
        <button type="button" role="tab" class="v27-tab" aria-selected="true">Tab 1</button>
        <button type="button" role="tab" class="v27-tab" aria-selected="false">Tab 2</button>
      </div>
    </div>
  </div>

  <div class="v27-app-header__breadcrumb">
    <button type="button" class="v27-app-header__back" aria-label="Back">
      <svg viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>
    <span class="v27-app-header__page">Current page</span>
  </div>
</header>
```

All three optional blocks are Figma booleans - omit the element to turn one off.

## Classes

| Class | What it is |
|---|---|
| `.v27-app-header` | the whole header |
| `.v27-app-header__bar` | identity and tabs, with the rule beneath |
| `.v27-app-header__identity` | glyph, title, AI action |
| `.v27-app-header__icon` | 32px app glyph |
| `.v27-app-header__title` | app name |
| `.v27-app-header__tabs` | the tab-level stack |
| `.v27-app-header__breadcrumb` | optional back row |
| `.v27-app-header__back` | 24px back control |
| `.v27-app-header__page` | current page title, Lg, centred |

## Values

| Property | Value |
|---|---|
| bar padding | `--v27-spacing-sm` (12px), none at the bottom |
| bar gap | `--v27-spacing-s` (8px) |
| identity gap | `--v27-spacing-sm` (12px) |
| rule | 1px `Border/Default` |
| app title | **20px / 400 / 24** |
| page title | Lg - Outfit 18 / 400 / auto |
| breadcrumb gap | 10px |

The app title is 20px at **regular** weight - the same unnamed size-weight pair as
[workspace header](WorkspaceHeader.md)'s title. FINDINGS.md #24.

Figma centres the page title by absolutely positioning it against the full width with the
back arrow floating over it. A `flex: 1` centred label achieves the same result without the
absolute positioning, and survives a longer title.

The AI action is a Button `type=AI`, which is **not built** - the markup above substitutes
an outline button. See FINDINGS.md #32.

---

# Tab group

Figma: standalone symbol `Tab group`, node `2317:69213`. Measured as an instance inside this
header.

A wrapping row of [Tab single](Tab.md).

| Class | What it is |
|---|---|
| `.v27-tab-group` | the row |
| `.v27-tab-group--sub` | second-level tabs, dropped to Sm |

The gap is asymmetric on purpose - **0 down, 24px across** - so wrapped rows sit flush and
the tab underlines form a continuous rule.

Level 2 tabs are 14px where level 1 is 16px. Figma applies that as an instance override on
the nested group rather than as a variant of Tab single, so it is a modifier on the
**group**: the tab itself has no size axis.
