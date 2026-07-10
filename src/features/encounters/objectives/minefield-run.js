import { createProgressObjective } from "../objective-schema.js";
export const minefieldRunObjective = createProgressObjective({ id: "minefield-run", label: "Minenfeld passieren", target: 100, contribution: (context, dt) => (context.metrics?.movement ?? dt) + (context.metrics?.minesDisabled ?? 0) * 5 });
