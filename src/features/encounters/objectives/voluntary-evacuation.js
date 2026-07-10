import { createProgressObjective } from "../objective-schema.js";
export const voluntaryEvacuationObjective = createProgressObjective({ id: "voluntary-evacuation", label: "Evakuierung halten", target: 45, contribution: (context, dt) => context.metrics?.insideEvacuation ? dt : 0 });
