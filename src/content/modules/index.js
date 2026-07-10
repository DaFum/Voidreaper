import { OFFENSIVE_PASSIVE_MODULES } from "./offensive-passive.js";
import { DEFENSIVE_PASSIVE_MODULES } from "./defensive-passive.js";
import { UTILITY_MODULES } from "./utility.js";
import { ACTIVE_OFFENSIVE_MODULES } from "./active-offensive.js";
import { ACTIVE_DEFENSIVE_MODULES } from "./active-defensive.js";
import { ACTIVE_CONTROL_MODULES } from "./active-control.js";
import { CORRUPTED_MODULES } from "./corrupted.js";
import { UNIQUE_RELIC_MODULES } from "./unique-relics.js";

export const MODULES = Object.freeze([
  ...OFFENSIVE_PASSIVE_MODULES,
  ...DEFENSIVE_PASSIVE_MODULES,
  ...UTILITY_MODULES,
  ...ACTIVE_OFFENSIVE_MODULES,
  ...ACTIVE_DEFENSIVE_MODULES,
  ...ACTIVE_CONTROL_MODULES,
  ...CORRUPTED_MODULES,
  ...UNIQUE_RELIC_MODULES
]);

if (MODULES.length !== 120) throw new Error(`Expected 120 modules, got ${MODULES.length}`);

