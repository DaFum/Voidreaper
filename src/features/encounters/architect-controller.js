import { changeRunCorruption } from "../corruption/run-corruption.js";
import { addRunHeat } from "../heat/run-heat.js";

export function createArchitectController(eventBus) {
  return {
    start(definition, buildTags = new Map()) { return { definition, health: definition.health, maxHealth: definition.health, phase: 1, copiedTags: [...buildTags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3), finalChoice: null }; },
    update(state, run) { const ratio = state.health / state.maxHealth; state.phase = ratio > .75 ? 1 : ratio > .5 ? 2 : ratio > .25 ? 3 : 4; return { phase: state.phase, copiedTags: state.copiedTags, loadAttack: run.player.energy?.ratio ?? 0, corruptionAttack: run.corruption?.value ?? 0 }; },
    chooseFinal(state, choice, run) { if (!["stabilize", "overload"].includes(choice)) return false; state.finalChoice = choice; if (choice === "stabilize") changeRunCorruption(run, -25, "architect-stabilize"); else { if (run.player.energy) run.player.energy.ratio = Math.max(1.5, run.player.energy.ratio); addRunHeat(run, 100 - run.heat.value, "architect-overload"); } return true; },
    damage(state, amount, family) { if (!state.definition.damageWindows.includes(family)) amount *= .75; state.health = Math.max(0, state.health - amount); if (!state.health) eventBus?.emit("eternal-architect-defeated", { finalChoice: state.finalChoice }); return state.health; }
  };
}
