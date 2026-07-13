
- Branch `feature_fix` was clean at the start of this browser-QA pass.
- User explicitly approved changing or resetting the local game state during testing.
- Scope: broad end-to-end click-path inventory first; optimize only reproduced UX or functional problems after design approval.
- Browser QA completed across all 15 Hangar tabs, checkpoint resume, sector map, merchant, workshop, workbench, blueprints, research, simulator, Codex, Standard Run, Daily Seed, combat controls, level-up, pause/resume, and settings persistence.
- Confirmed critical click-path defects:
  - unaffordable merchant purchases still finish the node because the controller ignores `merchant.buy(...) === false`;
  - visited sector nodes remain enabled and enter a confirmation state that can only fail silently;
  - workshop has no leave/back action, forcing the player to spend AP or reload.
- Confirmed high-impact incomplete paths:
  - Hangar resource header is stale after research until reload;
  - Loadout tab renders the generic catalog although a dedicated loadout screen exists;
  - blueprint cards only toast despite an existing detail screen; invalid import exposes a raw JSON/base64 parser error;
  - simulator forgets submitted configuration and produces a one-sample zero-DPS summary;
  - resumed checkpoints cannot open the workbench until another combat initializes assembly state;
  - workbench view modes are cosmetic, and module actions stay enabled without a selected module;
  - Codex category/source selects lack accessible names.
- Verified working: all Hangar tabs render, research and settings persist, checkpoint resume, reachable sector two-step confirmation, live combat, level-up choice, pause/resume, dodge, workbench opening after combat, blueprint favorite toggle, Standard Run, and dated Daily Seed.
- Implemented the approved complete repair scope with Node regression tests and browser retesting.
- Browser verification after implementation:
  - Loadout uses the dedicated screen and represents an empty build as `0% unconfigured`;
  - both visible Void Shard counters stay aligned after research purchases;
  - blueprint detail/back/import paths work, stale detail handlers no longer capture library actions, and malformed codes show actionable copy;
  - simulator preserves enemy/density/duration/seed and reports deterministic non-zero DPS/triggers;
  - checkpoint resume initializes the workbench immediately;
  - visited sector nodes are disabled, workshop has a working map exit, and workbench actions are selection-aware;
  - assembly view modes render visible overlays;
  - Codex filters expose accessible names;
  - 390x844 viewport has no horizontal document overflow and the Loadout tab remains operable;
  - browser console returned no warnings or errors.
- The Region-2 merchant route could not be repeated end-to-end in the final fresh run because the test run died at the mid-boss. Purchase rejection, successful completion, affordability, corrupted-offer behavior, and finish gating are covered by focused automated tests; the original browser reproduction established the controller root cause.
- Final TODO: run fresh `npm test`, `npm run build`, and `git diff --check`; no known product-code TODO remains after those gates.

## Interactive tutorial implementation (2026-07-13)

- Implemented a declarative tutorial coordinator with persisted pause, resume, skip, replay, completion, migration, and event-driven action steps.
- Added six staggered German tutorial chapters covering 44 capabilities in 50 detailed steps.
- Replaced the legacy onboarding coupling; Bastion now unlocks through regular research.
- Added the focused overlay, responsive target positioning, Tutorial library, semantic targets, and isolated `tutorial` run mode.
- Connected combat, navigation, merchant, workshop, assembly, blueprint, research, Codex, simulator, settings, checkpoint, anomaly, and summary events.
- Added tutorial content validation to the production build and regression coverage for migration, coordination, content, overlay, resume, staggered availability, and late-appearing targets.
- Browser QA confirmed: library locking, repeat/start, restored active guidance, isolated training start after persistence load, pause/resume, responsive focus ring, movement-to-fire-to-dodge progression, and no console warnings/errors.
- Final TODO: run the complete Node tests, frontend tests, production build, and diff check after all browser-derived fixes.

## Interactive tutorial browser optimization (2026-07-13)

- Exercised all six chapters in the in-app browser, including real movement/fire/dodge, pause/resume, sector selection, merchant purchase, research purchase, Codex filtering, simulation, settings changes, skip persistence, replay, and checkpoint resume.
- Fixed browser-reproduced focus gaps for active modules, settings, loadout, extraction, and run-summary targets; late-rendered targets now re-resolve automatically.
- Fixed the loadout fallback for legacy profiles and the production tag-inspection shape that previously replaced the Loadout screen with a generic placeholder.
- Staggered research and run chapters by actual usable context, while keeping every completed chapter replayable even when current resources no longer satisfy the original unlock condition.
- Foundations now requires an explicit resume after teaching pause, and skipping Foundations disables its later automatic offer.
- Removed hard tutorial blockers caused by random route topology, missing loot, absent blueprints, and optional end screens; those contextual concepts remain focused guided explanations while deterministic interactions remain event-gated.
- Verified the complete Meta chapter through a live purchase, filter change, and simulator result; verified all data-dependent chapters can finish on the tested profile.
- Verified the 390x844 tutorial overlay visually: focus frame and all controls remain visible and usable without clipping.
- Final gates after review fixes: `npm test` 192/192, `npm run test:frontend` 108/108, all validators and production build successful, `git diff --check` clean.
