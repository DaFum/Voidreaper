# Interactive Tutorial Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved hybrid tutorial as five independently testable phases without coupling learning progress to game unlocks.

**Architecture:** A persistence-backed tutorial coordinator consumes declarative chapter definitions and semantic success events from existing game paths. A shared overlay and Hangar library render the guidance; a disposable training session reuses real input/combat paths while suppressing durable rewards and progression.

**Tech Stack:** Vite 8, JavaScript ES modules, Node test runner, Vitest with happy-dom, existing event bus, existing canvas runtime, Playwright web-game client.

## Global Constraints

- Source of truth: [interactive tutorial design](../specs/2026-07-13-interactive-tutorial-design.md).
- The tutorial is a hybrid of one isolated foundations run and contextual chapters on real screens.
- Coverage is complete but staggered; unavailable systems remain discoverability-gated, not tutorial-gated.
- Guidance uses targeted focus; unrelated controls stay enabled unless they would destroy the active training state.
- Tutorial, chapter, and replay flows are skippable, pausable, and repeatable.
- Tutorial progress never grants, removes, or rewrites unlocks.
- Action steps complete only after a semantic success event, never from a raw click alone.
- Existing version-5 saves migrate to version 6 without automatic tutorial offers or unlock changes.
- New profiles default to automatic tutorial offers.
- The foundations run never changes currencies, unlocks, challenges, statistics, checkpoints, builds, or blueprints.
- UI remains keyboard accessible, respects reduced motion and UI scale, and produces no horizontal overflow.
- Use the existing shared event bus; do not add DOM scraping as a second event system.
- Keep `src/app/bootstrap.js` to wiring and orchestration; tutorial behavior belongs under `src/features/tutorial/`.
- Every behavior change follows red-green-refactor and ends with focused verification.
- Final verification is `npm test`, `npm run test:frontend`, `npm run build`, browser chapter walkthroughs, screenshots, text state, and console review.

---

## Phase Map

### Phase 1: Coordinator and Persistence

Plan: [2026-07-13-interactive-tutorial-phase-1-core-and-persistence.md](./2026-07-13-interactive-tutorial-phase-1-core-and-persistence.md)

Produces:

- save version 6 and deterministic version-5 migration;
- migration of the last onboarding-gated item, Bastion, to existing research progression;
- dependency-injected tutorial coordinator;
- semantic event-name contract;
- unit tests for navigation, pause, skip, replay, success matching, and save failures.

Acceptance gate: coordinator and migration suites pass, existing unlock flags remain byte-for-byte equivalent, and `npm run build` succeeds.

### Phase 2: Overlay, Chapter Catalog, and Library

Plan: [2026-07-13-interactive-tutorial-phase-2-overlay-and-library.md](./2026-07-13-interactive-tutorial-phase-2-overlay-and-library.md)

Consumes:

- `createTutorialService({ saveStore, eventBus, chapters })`;
- `TUTORIAL_EVENTS`;
- save `tutorial` shape from Phase 1.

Produces:

- declarative production chapter registry;
- accessible focus overlay and target resolver;
- Hangar Tutorial tab and contextual offer wiring;
- removal of the static onboarding callout path.

Acceptance gate: library and overlay component tests pass at desktop and mobile viewport assumptions, and a browser can start, pause, skip, and replay a chapter.

### Phase 3: Isolated Foundations Training

Plan: [2026-07-13-interactive-tutorial-phase-3-foundations-training.md](./2026-07-13-interactive-tutorial-phase-3-foundations-training.md)

Consumes:

- coordinator start/resume/complete interfaces;
- shared overlay;
- foundations chapter metadata.

Produces:

- deterministic disposable tutorial run mode;
- movement, firing, dodge, active-module, resource, pause, enemy, reward, and evolution success events;
- persistence-effect guards for tutorial mode;
- keyboard/mouse and touch walkthrough coverage.

Acceptance gate: a complete foundations walkthrough advances only on real outcomes and leaves a before/after save deep-equal except for `tutorial`.

### Phase 4: Run Navigation and Ship Assembly

Plan: [2026-07-13-interactive-tutorial-phase-4-run-and-assembly.md](./2026-07-13-interactive-tutorial-phase-4-run-and-assembly.md)

Consumes:

- contextual chapter activation;
- semantic events and stable `data-tutorial-id` targets.

Produces:

- sector map, merchant, workshop, checkpoint, anomaly, Quick-Mount, workbench, repair, and blueprint steps;
- success-only events around existing click paths;
- desktop and touch assembly target coverage.

Acceptance gate: invalid purchases and placements stay on-step, valid actions progress, and `npm run validate:assembly` plus focused browser paths pass.

### Phase 5: Meta Systems and End-to-End Completion

Plan: [2026-07-13-interactive-tutorial-phase-5-meta-and-e2e.md](./2026-07-13-interactive-tutorial-phase-5-meta-and-e2e.md)

Consumes:

- all previous chapter infrastructure and runtime events.

Produces:

- Loadout, catalog, research, prototypes, Codex, challenges, campaigns, salvage, simulator, statistics, settings, advanced-run, boss, extraction, and summary guidance;
- exhaustive registry coverage validation;
- final accessibility, responsive, save-migration, and browser verification.

Acceptance gate: every cataloged chapter has a verified entry path, all automated commands pass, browser console is clean, and screenshots confirm the overlay never obscures its target.

---

## Dependency Rules

1. Execute phases in numeric order; later plans consume named interfaces from earlier plans.
2. Do not introduce production content for a later phase early merely to satisfy imports; the registry composes exported chapter arrays and can grow phase by phase.
3. Keep semantic events backward compatible. Publishers may add fields, but existing payload fields must not be renamed.
4. Keep tutorial target IDs stable once introduced; tests and saved active steps depend on them.
5. Each phase ends cleanly with its own commit and passing build before the next begins.

## Final Definition of Done

- [ ] All five phase acceptance gates are complete.
- [ ] The old `src/content/onboarding/onboarding-steps.js`, `src/features/onboarding/onboarding-service.js`, and `src/ui/components/tutorial-callout.js` paths are removed only after all imports and tests use the replacement.
- [ ] Save version 6 migration preserves all version-5 gameplay fields and disables automatic offers for migrated profiles.
- [ ] Every chapter in the approved design appears in the registry and Tutorial library.
- [ ] Every action step has at least one automated test proving a failed action does not advance and a successful semantic event does.
- [ ] Foundations replay leaves durable gameplay state unchanged.
- [ ] `npm test`, `npm run test:frontend`, and `npm run build` pass from a clean working tree.
- [ ] Browser walkthroughs cover desktop and 390×844 touch layout with screenshots and no new console warnings or errors.
