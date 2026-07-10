# Styles Agent Instructions

## Purpose
- This folder holds the global styling system and screen-specific CSS.

## Rules
- Prefer updating the existing style sheet that owns the component or screen.
- Keep token changes in [tokens.css](tokens.css) and reuse those values elsewhere.
- Preserve the desktop/mobile pairing for ship-assembly styling.

## Gotchas
- Token changes can affect multiple screens at once, so check the broader UI after editing shared variables.
- Ship-assembly has both desktop and mobile styles; changing one without the other usually causes a layout regression.
- Many stylesheets are loaded globally from [src/main.js](../main.js), so a local CSS change can have a wider visual impact than it first appears.

## Non-Obvious Pitfalls
- Import order in `src/main.js` defines cascade priority; moving declarations between files can create hard-to-spot regressions.
- Some UI states depend on data attributes or class toggles from JS. CSS-only edits can fail if you do not verify those selectors still match runtime markup.
- Avoid over-specific selectors for quick fixes; they tend to break ship-assembly overlay stacking and responsive behavior later.

## Good Targets
- [base.css](base.css)
- [screens.css](screens.css)
- [ship-assembly.css](ship-assembly.css)
- [ship-assembly-mobile.css](ship-assembly-mobile.css)