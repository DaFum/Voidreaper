import { createProgressObjective } from "../objective-schema.js";
export const protectConvoyObjective = createProgressObjective({ id: "protect-convoy", label: "Konvoi schützen", target: 90, contribution: (context, dt) => dt * (context.metrics?.convoyAlive === false ? 0 : 1) + (context.metrics?.controlledEnemies ?? 0) * .05 });
