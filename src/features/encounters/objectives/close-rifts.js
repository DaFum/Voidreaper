import { createProgressObjective } from "../objective-schema.js";
export const closeRiftsObjective = createProgressObjective({ id: "close-rifts", label: "Risse schließen", target: 5, contribution: (context) => context.metrics?.riftsClosed ?? 0 });
