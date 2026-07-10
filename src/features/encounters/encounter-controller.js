import { assertObjective } from "./objective-schema.js";

export function createEncounterController({ eventBus, enemyDirector } = {}) {
  let active = null;

  function cleanup(context) {
    enemyDirector?.stop?.();
    context?.temporaryEntities?.splice?.(0);
  }

  return {
    get active() { return active; },
    start(objective, context = {}, timeBudget = 180) {
      if (active) this.abort("replaced");
      assertObjective(objective);
      const state = objective.createState(context);
      active = { objective, context, state, remaining: timeBudget, emitted: false };
      enemyDirector?.start?.(context);
      objective.start(context, state);
      eventBus?.emit("encounter-started", { objectiveId: objective.id, timeBudget });
      return active;
    },
    update(dt) {
      if (!active) return null;
      active.remaining -= dt;
      active.objective.update(active.context, active.state, dt);
      if (active.objective.isComplete(active.context, active.state)) return this.complete();
      if (active.remaining <= 0) return this.abort("time-expired");
      return active.objective.getHud(active.context, active.state);
    },
    complete() {
      if (!active || active.emitted) return null;
      active.emitted = true;
      const result = { objectiveId: active.objective.id, state: active.state };
      active.objective.finish(active.context, active.state);
      cleanup(active.context);
      eventBus?.emit("encounter-completed", result);
      active = null;
      return result;
    },
    abort(reason = "aborted") {
      if (!active) return null;
      cleanup(active.context);
      eventBus?.emit("encounter-aborted", { objectiveId: active.objective.id, reason });
      active = null;
      return reason;
    }
  };
}
