# Attachments

Figma: `Attachments`, node `7179:66634` (page Components, `1:28`).
2 variants - `attachments[2]`.

A file upload field: a label, a constraints line, a dashed dropzone and an upload button.

**Only `attachments=False` - the empty dropzone - is built.** `attachments=True`
(`7179:66633`) adds a list of uploaded files below it and was not measured.

## Markup

```html
<div class="v27-attachments">
  <div class="v27-attachments__field">
    <div class="v27-attachments__labels">
      <label class="v27-field__label v27-field__required" for="files">Attachment</label>
      <span class="v27-attachments__hint">Allowed types: svg, png. Max size: 5 MB. Max files: 3</span>
    </div>
    <div class="v27-attachments__dropzone">
      <div class="v27-attachments__actions">
        <button type="button" class="v27-btn v27-btn--outline">
          <svg class="v27-icon v27-icon--small" viewBox="0 0 20 20" aria-hidden="true"></svg>
          Browse files
        </button>
      </div>
      <span class="v27-attachments__prompt">Drag and drop files here to upload</span>
    </div>
  </div>
  <button type="button" class="v27-btn v27-btn--positive" disabled>Upload</button>
</div>
```

The dropzone is a visual affordance, not a control. Keep a real `<input type="file">`
reachable - drag and drop alone is not keyboard-operable.

The label reuses [Form field](FormField.md)'s `.v27-field__label`, which is the same
element doing the same job.

## Classes

| Class | What it is |
|---|---|
| `.v27-attachments` | the field stack |
| `.v27-attachments__field` | label and dropzone |
| `.v27-attachments__labels` | label and hint |
| `.v27-attachments__hint` | XS constraints line |
| `.v27-attachments__dropzone` | the dashed area |
| `.v27-attachments__actions` | the browse row |
| `.v27-attachments__prompt` | the drag-and-drop line |

## Values

| Property | Value |
|---|---|
| stack gap | `--v27-spacing-m` (16px) |
| field gap | `--v27-spacing-s` (8px) |
| label gap | `--v27-spacing-xxs` (2px) |
| dropzone padding / gap | `--v27-spacing-m` (16px) |
| dropzone radius | **`--v27-radius-l` (16px)** |
| dropzone border | **1px dashed** |
| hint | XS - Outfit 12 / 400 / auto |
| prompt | Sm |

Two firsts for the library: this is the **only dashed border**, and the only other user of
`Radius/L` besides [Chat input](ChatInput.md).

## Three values come from outside the V27 export

- The dropzone border binds **`Border/Secondary`**, which is not a V27 variable. It holds
  the same `#c1c1c1` as `Border/Bold`, which is used instead.
- The hint binds `Text/Secondary` and the prompt binds `Text/Primary` - both People First
  variables, both equal to their `Foreground/*` counterparts, which are used instead.

All three are FINDINGS.md #18.

The dropzone fills with a raw white rather than `Background/Primary`, so it does not follow
dark mode - FINDINGS.md #30.

## The Upload button reveals the disabled fill

Figma's Upload button instance fills with `Border/Input disabled` (`#c1c1c1`) and keeps an
inverted label. That is evidence for Button's **disabled** state, which the Button set's own
`state` axis defines but this library has not yet built - the markup above uses the plain
`disabled` attribute, which currently only changes the cursor.
