import { createProgressObjective } from "../objective-schema.js";
export const eliminateTargetObjective = createProgressObjective({ id: "eliminate-target", label: "Ziel eliminieren", target: 100, contribution: (context) => context.metrics?.targetDamage ?? 0 });
