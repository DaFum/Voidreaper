import { createProgressObjective } from "../objective-schema.js";
export const salvageRushObjective = createProgressObjective({ id: "salvage-rush", label: "Wrackteile bergen", target: 12, contribution: (context) => context.metrics?.salvageCollected ?? 0 });
