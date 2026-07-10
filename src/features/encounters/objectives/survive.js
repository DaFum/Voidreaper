import { createProgressObjective } from "../objective-schema.js";
export const surviveObjective = createProgressObjective({ id: "survive", label: "Überleben", target: 60, contribution: (_context, dt) => dt });
