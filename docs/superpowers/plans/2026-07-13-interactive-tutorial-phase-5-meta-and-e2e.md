# Interactive Tutorial Phase 5: Meta Systems and E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete tutorial coverage for Hangar/meta systems, advanced runs, accessibility, and exhaustive end-to-end verification.

**Architecture:** Screen renderers expose stable targets and success callbacks; existing feature services remain authoritative. A coverage validator cross-checks every approved function against a chapter step and prevents silent omissions as screens evolve.

**Tech Stack:** Existing Hangar/meta/advanced-run screens, Node tests, Vitest, content validator, Vite build, Playwright web-game client.

## Global Constraints

- Cover every currently reachable Hangar tab and advanced-run screen listed in the approved design.
- Catalog views may use explanation steps; mutating actions require semantic success events.
- Settings guidance must use `event.code`, preserve binding swaps, and respect touch parity.
- Do not fabricate screens for unavailable features; locked chapters show their real discovery condition.
- Final screenshots and text state are acceptance evidence, not optional artifacts.

---

### Task 1: Add complete Hangar and equipment guidance

**Files:**
- Create: `src/content/tutorial/meta-progression-tutorial.js`
- Create: `src/content/tutorial/controls-accessibility-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/ui/screens/hangar-screen.js`
- Modify: `src/ui/screens/loadout-screen.js`
- Modify: `src/ui/components/item-card.js`
- Modify: `src/ui/screens/prototype-vault-screen.js`
- Modify: `src/ui/screens/challenges-screen.js`
- Modify: `src/ui/screens/campaign-select-screen.js`
- Modify: `src/ui/screens/salvage-mission-screen.js`
- Modify: `src/ui/screens/statistics-screen.js`
- Create: `tests/features/tutorial/meta-progression-tutorial.test.js`
- Modify: `tests/ui/loadout-screen.test.js`
- Modify: `tests/frontend/screens.spec.js`

**Interfaces:**
- Produces: `META_PROGRESSION_STEPS`, `CONTROLS_ACCESSIBILITY_STEPS`
- Reuses: `HANGAR_TAB_OPENED`

- [ ] **Step 1: Write failing coverage-order tests**

Require these meta IDs:

```js
[
  "hangar-overview", "start-run", "loadout-overview", "loadout-slots",
  "ship-catalog", "weapon-catalog", "module-catalog", "reactor-role",
  "load-energy-heat", "tag-synergies", "prototype-vault",
  "prototype-stability", "challenges", "campaign-paths", "salvage",
  "statistics", "tutorial-library"
]
```

The `reactor-role` step targets the reactor slot in the real Loadout screen; do not add a speculative Reaktoren tab.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/meta-progression-tutorial.test.js`

Expected: FAIL because content/targets are missing.

- [ ] **Step 3: Add stable targets to existing screens**

Use `hangar-launch`, `loadout-slots`, `loadout-ship`, `loadout-weapon`, `loadout-reactor`, `loadout-modules`, `loadout-energy`, `loadout-synergies`, `catalog-grid`, `prototype-filters`, `prototype-grid`, `challenge-list`, `campaign-path-list`, `salvage-signals`, and `statistics-summary`.

Add per-item `data-tutorial-id="catalog-item-<definition-id>"` only where a specific item step needs it; otherwise target the owning grid.

- [ ] **Step 4: Implement explanation-driven catalog progression**

Hangar tab-open events move between catalog overview steps. These steps remain explanations with `Weiter`; they do not claim an item was equipped. Existing loadout mutation paths, if available, must emit a success event before any future action step is added.

- [ ] **Step 5: Verify focused screens**

Run: `node --test tests/features/tutorial/meta-progression-tutorial.test.js tests/ui/loadout-screen.test.js`

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/content/tutorial/meta-progression-tutorial.js src/content/tutorial/controls-accessibility-tutorial.js src/content/tutorial/tutorial-chapters.js src/ui/screens/hangar-screen.js src/ui/screens/loadout-screen.js src/ui/components/item-card.js src/ui/screens/prototype-vault-screen.js src/ui/screens/challenges-screen.js src/ui/screens/campaign-select-screen.js src/ui/screens/salvage-mission-screen.js src/ui/screens/statistics-screen.js tests/features/tutorial/meta-progression-tutorial.test.js tests/ui/loadout-screen.test.js tests/frontend/screens.spec.js
git commit -m "feat: cover hangar and equipment tutorials"
```

---

### Task 2: Teach research, Codex, simulator, and settings through successful callbacks

**Files:**
- Modify: `src/ui/screens/research-screen.js`
- Modify: `src/ui/screens/codex-screen.js`
- Modify: `src/ui/screens/simulator-screen.js`
- Modify: `src/ui/screens/settings-screen.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/content/tutorial/meta-progression-tutorial.js`
- Modify: `src/content/tutorial/controls-accessibility-tutorial.js`
- Create: `tests/features/tutorial/meta-interactions-tutorial.test.js`
- Modify: `tests/ui/codex-accessibility.test.js`
- Modify: `tests/frontend/screens.spec.js`

**Interfaces:**
- Publishes: `RESEARCH_PURCHASED`, `CODEX_FILTERED`, `SIMULATION_COMPLETED`, `SETTING_CHANGED`, `BINDING_CHANGED`

- [ ] **Step 1: Write failing success and failure tests**

Assert:

- unaffordable/locked research does not emit;
- purchased research emits after save reload;
- Codex filter emits the actual filter object after render callback;
- simulator emits only after `simulate` returns a summary;
- setting change emits persisted key/value;
- binding change emits `{ action, code }` after collision swap and save.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/meta-interactions-tutorial.test.js tests/ui/codex-accessibility.test.js`

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: FAIL because result callbacks and targets are missing.

- [ ] **Step 3: Add targets and result callbacks**

Targets: `research-grid`, `research-node-<id>`, `codex-filters`, `codex-results`, `simulator-config`, `simulator-results`, `simulator-start`, `settings-toggles`, `settings-ui-scale`, `settings-binding-dodge`, `settings-binding-active-1`, `settings-binding-active-2`.

Change callbacks to return/await success where needed. Keep rendering code presentation-only; bootstrap emits after awaited service/save completion.

- [ ] **Step 4: Complete control/accessibility chapter text**

Sequence: `controls-overview`, `keyboard-movement`, `keyboard-dodge`, `keyboard-active-modules`, `rebind-control`, `ui-scale`, `reduced-motion`, `state-patterns`, `screen-shake-flashes`, `touch-stick`, `touch-actions`. Touch-only steps have `device: "touch"`; desktop availability omits them rather than showing locked cards.

- [ ] **Step 5: Verify focused tests**

Run: `node --test tests/features/tutorial/meta-interactions-tutorial.test.js tests/ui/codex-accessibility.test.js`

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/ui/screens/research-screen.js src/ui/screens/codex-screen.js src/ui/screens/simulator-screen.js src/ui/screens/settings-screen.js src/app/bootstrap.js src/content/tutorial/meta-progression-tutorial.js src/content/tutorial/controls-accessibility-tutorial.js tests/features/tutorial/meta-interactions-tutorial.test.js tests/ui/codex-accessibility.test.js tests/frontend/screens.spec.js
git commit -m "feat: add interactive meta and settings tutorials"
```

---

### Task 3: Add advanced-run, boss, extraction, and summary guidance

**Files:**
- Create: `src/content/tutorial/advanced-run-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/features/energy/energy-system.js`
- Modify: `src/features/heat/heat-system.js`
- Modify: `src/features/corruption/corruption-system.js`
- Modify: `src/features/faults/fault-scheduler.js`
- Modify: `src/features/encounters/boss-controller.js`
- Modify: `src/features/encounters/architect-controller.js`
- Modify: `src/features/extraction/extraction-service.js`
- Modify: `src/ui/screens/anomaly-screen.js`
- Modify: `src/ui/screens/extraction-screen.js`
- Modify: `src/ui/screens/run-summary-screen.js`
- Modify: `src/ui/screens/sector-summary-screen.js`
- Modify: `src/ui/screens/abyss-transition-screen.js`
- Modify: `src/app/bootstrap.js`
- Create: `tests/features/tutorial/advanced-run-tutorial.test.js`
- Modify: `tests/frontend/screens.spec.js`

**Interfaces:**
- Produces: `ADVANCED_RUN_STEPS`
- Publishes existing domain events plus `EXTRACTION_COMPLETED` and `RUN_SUMMARY_OPENED`

- [ ] **Step 1: Write failing chapter and domain-event tests**

Require sequence:

```js
[
  "load-tiers", "overload-consequence", "heat-tiers", "fault-pressure",
  "corruption-tiers", "anomaly-tradeoff", "mid-boss-window",
  "architect-window", "extraction-choice", "extraction-result",
  "sector-summary", "run-summary", "abyss-transition"
]
```

Assert overload/heat/corruption steps match threshold-crossing payloads, not repeated frame updates. Boss steps match real damage/defeat events. Extraction completion matches only a committed result.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/advanced-run-tutorial.test.js`

Expected: FAIL because content/events are incomplete.

- [ ] **Step 3: Reuse or add threshold-crossing events**

Do not emit every frame. Emit only when energy load tier, heat tier, corruption tier, or fault state changes. Preserve all existing payload keys and add `{ previousTier, tier }` where absent.

- [ ] **Step 4: Add targets to advanced screens and success emissions**

Targets: `hud-load`, `hud-heat`, `hud-corruption`, `fault-log`, `anomaly-choices`, `boss-health`, `extraction-options`, `extraction-result`, `sector-summary`, `run-summary`, `abyss-transition`.

Emit extraction completion after save/prototype operations resolve. Emit run-summary opened after the screen is actually rendered.

- [ ] **Step 5: Verify advanced-run tests and screen components**

Run: `node --test tests/features/tutorial/advanced-run-tutorial.test.js`

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/content/tutorial/advanced-run-tutorial.js src/content/tutorial/tutorial-chapters.js src/features/energy/energy-system.js src/features/heat/heat-system.js src/features/corruption/corruption-system.js src/features/faults/fault-scheduler.js src/features/encounters/boss-controller.js src/features/encounters/architect-controller.js src/features/extraction/extraction-service.js src/ui/screens/anomaly-screen.js src/ui/screens/extraction-screen.js src/ui/screens/run-summary-screen.js src/ui/screens/sector-summary-screen.js src/ui/screens/abyss-transition-screen.js src/app/bootstrap.js tests/features/tutorial/advanced-run-tutorial.test.js tests/frontend/screens.spec.js
git commit -m "feat: add advanced run tutorial chapter"
```

---

### Task 4: Enforce full coverage and complete browser acceptance

**Files:**
- Create: `scripts/validate-tutorial-content.mjs`
- Modify: `package.json`
- Create: `tests/features/tutorial/tutorial-coverage.test.js`
- Create: `tests/frontend/tutorial-e2e.spec.js`
- Create: `docs/manual-validation/interactive-tutorial.md`
- Modify: `progress.md`

**Interfaces:**
- Produces command: `npm run validate:tutorial`
- Adds `validate:tutorial` to `npm run build` before Vite compilation

- [ ] **Step 1: Write the failing coverage test**

Cross-check this exact required capability set against `chapter.capabilities` and fail with sorted missing IDs:

```js
const REQUIRED = [
  "movement", "aim-fire", "dodge", "active-modules", "hud-resources", "pause",
  "enemy", "reward", "evolution", "sector-map", "merchant", "workshop", "checkpoint",
  "loadout", "ships", "weapons", "reactors", "modules", "energy-load", "heat", "synergies",
  "quick-mount", "workbench-ports", "workbench-placement", "workbench-transform",
  "workbench-repair", "workbench-views", "blueprint-create", "blueprint-activate",
  "blueprint-duplicate", "blueprint-import", "blueprint-export", "research", "prototypes",
  "codex", "challenges", "campaign-paths", "salvage", "simulator", "statistics",
  "overload", "faults", "corruption", "anomalies", "bosses", "extraction", "summaries",
  "bindings", "ui-scale", "reduced-motion", "state-patterns", "touch"
];
```

- [ ] **Step 2: Run and verify RED, then complete missing metadata**

Run: `node --test tests/features/tutorial/tutorial-coverage.test.js`

Expected: FAIL listing any uncovered capabilities. Add capability IDs to the owning chapters until PASS; do not add dummy steps.

- [ ] **Step 3: Implement the validator and build integration**

The script imports the registry, calls `validateTutorialChapters`, checks required capabilities, prints chapter/step/capability counts, and exits non-zero on issues. Update build to:

```json
"build": "npm run validate-content && npm run validate:assembly && npm run validate:tutorial && vite build"
```

- [ ] **Step 4: Execute exhaustive browser scenarios**

Run the Playwright web-game client after each meaningful correction. Cover:

1. fresh-profile automatic offer and foundations completion;
2. global skip and chapter replay;
3. reload/resume at an active action step;
4. all Hangar tabs and meta mutations;
5. sector/service/assembly/blueprint chapter;
6. advanced-run/extraction/summary chapter;
7. keyboard-only navigation;
8. 390×844 touch controls and no horizontal overflow;
9. reduced motion and UI scale 1.4;
10. missing-target recovery and save-write failure warning.

For each scenario inspect screenshot, `render_game_to_text`, and console output. Reset game/save state between independent scenarios.

- [ ] **Step 5: Write the manual validation record**

Record exact setup, actions, expected semantic step transitions, screenshots produced, save before/after comparison, viewport, and console result in `docs/manual-validation/interactive-tutorial.md`. Link to the design and five phase plans instead of duplicating architecture.

- [ ] **Step 6: Run final automated verification**

Run: `npm test`

Run: `npm run test:frontend`

Run: `npm run build`

Run: `git diff --check`

Expected: all commands exit 0 with no new warnings or errors.

- [ ] **Step 7: Update progress and commit final phase**

Append completed commands, browser scenarios, screenshots, console result, and any genuine remaining limitation to `progress.md`.

```bash
git add scripts/validate-tutorial-content.mjs package.json tests/features/tutorial/tutorial-coverage.test.js tests/frontend/tutorial-e2e.spec.js docs/manual-validation/interactive-tutorial.md progress.md
git commit -m "feat: complete interactive tutorial coverage"
```
