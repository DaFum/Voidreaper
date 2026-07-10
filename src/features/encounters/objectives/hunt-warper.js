import { createProgressObjective } from "../objective-schema.js";
export const huntWarperObjective = createProgressObjective({ id: "hunt-warper", label: "Warper jagen", target: 3, contribution: (context) => context.metrics?.warpersKilled ?? 0 });
