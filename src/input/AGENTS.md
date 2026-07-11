# Input Instructions

## Purpose
- Input handling: [action-bindings.js](action-bindings.js), [input-controller.js](input-controller.js), and [touch-stick.js](touch-stick.js).

## Rules
- Keep input mapping separate from gameplay rules; input emits actions, features decide what they mean.
- Maintain parity between keyboard/mouse and touch paths so one input method cannot bypass validation or reach states the other cannot.

## Gotchas
- The input controller is wired in `src/app/bootstrap.js` with bindings loaded from the meta save (`metaSave.settings.bindings`); changing binding shape is a persistence-compatibility change.
- Action names are part of the wiring contract between bootstrap, screens, and the legacy runtime; renaming one affects consumers outside this folder.
- Touch controls have matching mobile styles and layout assumptions; coordinate changes with `src/styles/`.
