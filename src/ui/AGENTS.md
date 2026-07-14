# UI Agent Instructions

## Purpose
- UI code owns screens, components, and interaction surfaces.

## Rules
- Keep UI focused on presentation and event handling.
- Put shared game rules in features or runtime code, not in UI components.
- When a screen changes, update its matching styles at the same time.

## Gotchas
- UI screens often depend on feature services created in bootstrap, so a prop or service rename may require wiring changes outside the UI folder.
- Ship-assembly UI is usually coupled to overlays and workbench flow, so do not treat it as a single-screen change without checking the related feature state.
- If a UI element changes size or behavior, verify the matching CSS and any input bindings that target it.

## Non-Obvious Pitfalls
- Several screens are rendered via tab switchers and transient containers; event listeners or timers can leak if teardown is skipped.
- Text labels are part of gameplay affordances and include localized wording; copy changes may require docs or validation updates.
- UI should not invent fallback game state. Missing data should be fixed at source services to avoid divergent behavior between screens.
- Hangar catalogs own query/status/type filtering, presentation sorting, and selection UI; unlock state and equipped-slot mapping come from the equipment feature layer.
- Key bindings are captured from `keydown` (`event.code`, Tab exempted) into readonly inputs — never store typed text as a binding; `"f"` is not the code `"KeyF"` and silently breaks the action.
- Dialogs that cache a validation result (e.g. the blueprint import dialog) must invalidate it when the underlying input changes, or a stale result gets acted on.
- Pointer-drag interactions must track the initiating `pointerId` and release on `pointercancel`/`lostpointercapture`, not just `pointerup` — otherwise a browser-cancelled touch drag leaves the interaction stuck and a second finger causes jumps.

## Ship-Assembly Note

- Ship-assembly UI changes should be checked together with the ship-assembly feature and styles.
