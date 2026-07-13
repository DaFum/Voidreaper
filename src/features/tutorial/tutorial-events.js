export const TUTORIAL_EVENTS = Object.freeze({
  HANGAR_TAB_OPENED: "tutorial:hangar-tab-opened", SETTING_CHANGED: "tutorial:setting-changed", BINDING_CHANGED: "tutorial:binding-changed",
  MOVEMENT_USED: "tutorial:movement-used", SHOT_FIRED: "shot-fired", DODGE_USED: "dodge-used", ACTIVE_MODULE_USED: "active-module-used",
  PAUSE_OPENED: "tutorial:pause-opened", RUN_RESUMED: "tutorial:run-resumed", ENEMY_DEFEATED: "tutorial:enemy-defeated", REWARD_COLLECTED: "pickup-collected", EVOLUTION_SELECTED: "tutorial:evolution-selected",
  SECTOR_SELECTED: "tutorial:sector-selected", SECTOR_ENTERED: "tutorial:sector-entered", MERCHANT_PURCHASED: "tutorial:merchant-purchased",
  WORKSHOP_APPLIED: "tutorial:workshop-applied", CHECKPOINT_RESUMED: "tutorial:checkpoint-resumed", ANOMALY_RESOLVED: "tutorial:anomaly-resolved",
  QUICK_MOUNT_ACTION: "tutorial:quick-mount-action", WORKBENCH_ACTION: "tutorial:workbench-action", BLUEPRINT_ACTION: "tutorial:blueprint-action",
  RESEARCH_PURCHASED: "tutorial:research-purchased", CODEX_FILTERED: "tutorial:codex-filtered", SIMULATION_COMPLETED: "tutorial:simulation-completed",
  EXTRACTION_COMPLETED: "extraction-completed", RUN_SUMMARY_OPENED: "tutorial:run-summary-opened"
});
const KNOWN = new Set(Object.values(TUTORIAL_EVENTS));
export const isTutorialEvent = value => KNOWN.has(value);
