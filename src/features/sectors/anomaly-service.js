import { createRunRng } from "../../core/rng.js";
import { ANOMALY_EVENTS } from "../../content/sectors/anomaly-events.js";

export function createAnomalyService(eventBus) {
  return {
    select(seed, seenIds = []) {
      const pool = ANOMALY_EVENTS.filter(event => !seenIds.includes(event.id));
      const rng = createRunRng(seed);
      return (pool.length ? pool : ANOMALY_EVENTS)[rng.integer(0, (pool.length ? pool : ANOMALY_EVENTS).length - 1)];
    },
    resolve(run, anomalyEvent, choiceId) {
      const choice = anomalyEvent.choices.find(candidate => candidate.id === choiceId);
      if (!choice) throw new Error(`Unknown anomaly choice: ${choiceId}`);
      choice.apply(run);
      run.anomalies ??= [];
      run.anomalies.push({ eventId: anomalyEvent.id, choiceId });
      eventBus?.emit("anomaly-resolved", { eventId: anomalyEvent.id, choiceId });
      return choice;
    }
  };
}
