# Interactive Tutorial Phase 2: Overlay and Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the coordinator through an accessible focus overlay, a complete chapter catalog, and a repeatable Tutorial library in the Hangar.

**Architecture:** Content modules define chapter metadata and explanation steps; the feature coordinator remains DOM-free. UI modules render the library and overlay, while bootstrap wires target lookup and semantic screen-open events.

**Tech Stack:** JavaScript ES modules, Vitest/happy-dom, existing Hangar screen, global CSS loaded by `src/main.js`.

## Global Constraints

- Consume Phase 1 interfaces without renaming them.
- Every focus target uses a stable `data-tutorial-id`; never match visible German text.
- The overlay must not intercept clicks outside its own card.
- Missing targets pause guidance and expose a deterministic return action.
- Respect `data-reduced-motion`, `--ui-scale`, keyboard focus, and 390×844 viewport width.
- Remove the static onboarding path only after the new library and overlay are wired.

---

### Task 1: Add the production chapter registry and validator

**Files:**
- Create: `src/content/tutorial/tutorial-chapters.js`
- Create: `src/content/tutorial/tutorial-content-validator.js`
- Create: `tests/features/tutorial/tutorial-content.test.js`

**Interfaces:**
- Consumes: `TUTORIAL_EVENTS`
- Produces: frozen `TUTORIAL_CHAPTERS`
- Produces: `validateTutorialChapters(chapters) -> { valid, issues }`

- [ ] **Step 1: Write the failing catalog test**

```js
test("the tutorial catalog exposes every approved chapter exactly once", () => {
  assert.deepEqual(TUTORIAL_CHAPTERS.map(chapter => chapter.id), [
    "foundations",
    "run-navigation",
    "ship-and-equipment",
    "meta-progression",
    "advanced-run",
    "controls-accessibility"
  ]);
  assert.deepEqual(validateTutorialChapters(TUTORIAL_CHAPTERS), { valid: true, issues: [] });
});
```

Add invalid fixtures for duplicate chapter IDs, duplicate step IDs within a chapter, action steps without known events, and target IDs containing whitespace.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/tutorial-content.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the initial complete registry**

Create six chapters in approved order. Each chapter begins with a real explanation step and carries `availabilityId` rather than importing unlock services. Use these exact metadata values:

```js
const CHAPTERS = [
  ["foundations", "Grundlagen-Training", "Steuerung, Kampf und Ressourcen", null],
  ["run-navigation", "Run-Navigation", "Sektorkarte, Händler, Werkstatt und Checkpoints", "campaign-map"],
  ["ship-and-equipment", "Schiff und Ausrüstung", "Loadout, Montage, Werkbank und Baupläne", "loadout"],
  ["meta-progression", "Metafortschritt", "Forschung, Codex, Bergung und Simulator", "research"],
  ["advanced-run", "Fortgeschrittener Run", "Überlastung, Anomalien, Bosse und Extraktion", "corruption"],
  ["controls-accessibility", "Bedienung und Barrierefreiheit", "Tasten, Touch und Anzeigeoptionen", null]
];
```

The initial step ID for each chapter is `overview`, kind `explanation`, with a full German sentence describing why the systems matter. Later phases replace that generic step with the owning module's complete exported step array; they do not append a second overview and do not create duplicate chapters.

Validator rules: non-empty unique chapter IDs, non-empty unique step IDs per chapter, `kind` in `explanation|action`, known event for action steps, and target matching `/^[a-z0-9-]+$/`.

- [ ] **Step 4: Re-run and verify GREEN**

Run: `node --test tests/features/tutorial/tutorial-content.test.js`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/content/tutorial/tutorial-chapters.js src/content/tutorial/tutorial-content-validator.js tests/features/tutorial/tutorial-content.test.js
git commit -m "feat: add validated tutorial chapter catalog"
```

---

### Task 2: Build the focus overlay and positioning helper

**Files:**
- Create: `src/ui/components/tutorial-position.js`
- Create: `src/ui/components/tutorial-overlay.js`
- Create: `src/styles/tutorial.css`
- Modify: `src/main.js`
- Create: `tests/frontend/tutorial-overlay.spec.js`

**Interfaces:**
- Produces: `placeTutorialCard(targetRect, cardSize, viewport, gap = 16) -> { top, left, side }`
- Produces: `createTutorialOverlay({ root, resolveTarget, onAction })`
- Overlay methods: `render(model)`, `refresh()`, `destroy()`

- [ ] **Step 1: Write failing position and accessibility tests**

Test target-near-top chooses bottom, target-near-bottom chooses top, horizontal clamping, missing target state, action callback names, progress text, `role="dialog"`, `aria-live="polite"`, and no focus steal during an action step.

```js
test("positioning keeps the card inside a mobile viewport", () => {
  expect(placeTutorialCard(
    { top: 700, bottom: 744, left: 340, right: 384, width: 44, height: 44 },
    { width: 320, height: 180 },
    { width: 390, height: 844 }
  )).toEqual(expect.objectContaining({ side: "top", left: 54 }));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:frontend -- tests/frontend/tutorial-overlay.spec.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement minimal overlay markup and positioning**

Render one fixed host containing a pointer-events-none veil/focus ring and a pointer-events-auto card. The card includes:

```html
<section class="tutorial-card" role="dialog" aria-labelledby="tutorial-title">
  <span data-role="progress"></span>
  <h2 id="tutorial-title"></h2>
  <p data-role="body"></p>
  <p data-role="input-hint"></p>
  <p data-role="status" aria-live="polite"></p>
  <footer>
    <button data-action="back">ZURÜCK</button>
    <button data-action="hint">HINWEIS</button>
    <button data-action="pause">PAUSIEREN</button>
    <button data-action="skip">KAPITEL ÜBERSPRINGEN</button>
    <button data-action="stop">TUTORIAL BEENDEN</button>
    <button data-action="next">WEITER</button>
  </footer>
</section>
```

Only show `next` for explanation steps. Use `ResizeObserver`, scroll, and resize listeners to call `refresh`; remove every listener in `destroy`. Reduced motion removes connector/focus animation.

- [ ] **Step 4: Re-run overlay tests and inspect CSS ownership**

Run: `npm run test:frontend -- tests/frontend/tutorial-overlay.spec.js`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/ui/components/tutorial-position.js src/ui/components/tutorial-overlay.js src/styles/tutorial.css src/main.js tests/frontend/tutorial-overlay.spec.js
git commit -m "feat: add accessible tutorial focus overlay"
```

---

### Task 3: Add the Tutorial library to the Hangar

**Files:**
- Create: `src/ui/screens/tutorial-library-screen.js`
- Modify: `src/ui/screens/hangar-screen.js`
- Modify: `src/styles/hangar.css`
- Create: `tests/ui/tutorial-library-screen.test.js`
- Modify: `tests/ui/hangar-state.test.js`

**Interfaces:**
- Produces: `renderTutorialLibrary(root, { chapters, onStart, onResume })`
- Extends Hangar tab list with `Tutorials`
- Emits from Hangar callback: `renderTab("Tutorials", content)`

- [ ] **Step 1: Write failing library and Hangar tests**

Assert each card shows title, description, `available|completed|locked|active`, concrete locked reason, and the correct button label `STARTEN|FORTSETZEN|WIEDERHOLEN`. Assert the Hangar exposes a selectable `Tutorials` tab and preserves focus after re-render.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/ui/tutorial-library-screen.test.js tests/ui/hangar-state.test.js`

Expected: FAIL because the screen and tab do not exist.

- [ ] **Step 3: Implement the screen and stable targets**

Add `Tutorials` after `Run starten`. Every tab button gets `data-tutorial-id="hangar-tab-<normalized-id>"`; the new tab is `hangar-tab-tutorials`. Library cards use `data-tutorial-id="tutorial-chapter-<chapter-id>"`.

Use buttons only for available chapters. Locked cards show `chapter.lockedReason` as text, never a disabled button without explanation.

- [ ] **Step 4: Re-run and verify GREEN**

Run: `node --test tests/ui/tutorial-library-screen.test.js tests/ui/hangar-state.test.js`

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/ui/screens/tutorial-library-screen.js src/ui/screens/hangar-screen.js src/styles/hangar.css tests/ui/tutorial-library-screen.test.js tests/ui/hangar-state.test.js
git commit -m "feat: add repeatable tutorial library"
```

---

### Task 4: Wire the coordinator and replace static onboarding

**Files:**
- Modify: `src/app/bootstrap.js`
- Delete: `src/content/onboarding/onboarding-steps.js`
- Delete: `src/features/onboarding/onboarding-service.js`
- Delete: `src/ui/components/tutorial-callout.js`
- Modify: `tests/frontend/components.spec.js`
- Create: `tests/app/tutorial-wiring.test.js`

**Interfaces:**
- Consumes: `TUTORIAL_CHAPTERS`, `createTutorialService`, `createTutorialOverlay`, `renderTutorialLibrary`
- Produces service key: `services.tutorial`
- Produces semantic open event: `TUTORIAL_EVENTS.HANGAR_TAB_OPENED` with `{ tab }`

- [ ] **Step 1: Write failing wiring tests**

Extract and test a small app helper `tutorialAvailability(metaSave, services)` rather than importing full bootstrap. Assert discovered feature flags control locked reasons and do not call `services.unlocks.hydrate` when a chapter completes or skips.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/app/tutorial-wiring.test.js`

Expected: FAIL because the helper and wiring do not exist.

- [ ] **Step 3: Wire the service after save load and event bus creation**

Hydrate `services.tutorial` with `metaSave.tutorial`, render one overlay host under `document.body`, and subscribe overlay rendering to service snapshots. In Hangar `renderTab`:

```js
events.emit(TUTORIAL_EVENTS.HANGAR_TAB_OPENED, { tab });
if (tab === "Tutorials") {
  renderTutorialLibrary(content, {
    chapters: services.tutorial.available(tutorialAvailability(metaSave, services)),
    onStart: id => services.tutorial.start(id),
    onResume: () => services.tutorial.resume()
  });
}
```

Remove the `Run starten` static callout and all old imports. Completing or skipping a tutorial must reload only tutorial state; it must not hydrate unlocks.

- [ ] **Step 4: Run focused tests and full phase gate**

Run: `node --test tests/app/tutorial-wiring.test.js tests/ui/tutorial-library-screen.test.js tests/ui/hangar-state.test.js`

Run: `npm run test:frontend -- tests/frontend/tutorial-overlay.spec.js tests/frontend/components.spec.js`

Run: `npm run build`

Expected: all PASS; no old onboarding imports remain under `src/`.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/app/bootstrap.js tests/app/tutorial-wiring.test.js tests/frontend/components.spec.js
git rm src/content/onboarding/onboarding-steps.js src/features/onboarding/onboarding-service.js src/ui/components/tutorial-callout.js
git commit -m "feat: replace static onboarding with tutorial coordinator"
```
