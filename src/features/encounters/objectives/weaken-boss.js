import { createProgressObjective } from "../objective-schema.js";
export const weakenBossObjective = createProgressObjective({ id: "weaken-boss", label: "Boss schwächen", target: 100, contribution: (context) => (context.metrics?.bossDamage ?? 0) + (context.metrics?.bossControl ?? 0) * .5 });
