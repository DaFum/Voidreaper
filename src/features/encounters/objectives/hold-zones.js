import { createProgressObjective } from "../objective-schema.js";
export const holdZonesObjective = createProgressObjective({ id: "hold-zones", label: "Zonen halten", target: 45, contribution: (context, dt) => dt * (context.metrics?.insideZone ? 1 : 0) + (context.metrics?.controlledEnemies ?? 0) * .03 });
