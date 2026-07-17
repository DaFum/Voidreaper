import { clamp } from "../../core/math.js";
import { HEAT_THRESHOLDS } from "../../content/heat/heat-rules.js";

export function createHeatState() {
  return {
    value: 0,
    coolingDelay: 0,
    lastThreshold: "cold",
    overheatedAt: null,
    sourceHeat: new Map(),
    disableCounts: new Map(),
    warningIssued: false,
    crossedOverheat: false
  };
}

const thresholdFor = value => [...HEAT_THRESHOLDS].reverse().find(threshold => value >= threshold.value)?.id ?? "cold";

export function createHeatSystem({ eventBus, modules } = {}) {
  return {
    add(state, amount, sourceId = "unknown") {
      state.crossedOverheat = state.crossedOverheat || (state.value < 100 && state.value + amount >= 100);
      state.value += amount;
      state.coolingDelay = Math.max(state.coolingDelay, 0.65);
      state.sourceHeat.set(sourceId, (state.sourceHeat.get(sourceId) ?? 0) + amount);
    },
    update(state, dt, { coolingRate, generationMultiplier = 1, canExceed = false } = {}) {
      const previous = state.value;
      const activeDt = state.coolingDelay > 0 ? Math.max(0, dt - state.coolingDelay) : dt;
      state.coolingDelay = Math.max(0, state.coolingDelay - dt);
      if (activeDt > 0) state.value -= coolingRate * activeDt;
      state.value = clamp(state.value, 0, canExceed ? 150 : 100);
      const threshold = thresholdFor(state.value);
      if (threshold !== state.lastThreshold) {
        state.lastThreshold = threshold;
        eventBus?.emit("heat-threshold", { threshold, value: state.value, previous });
      }
      if (!state.warningIssued && state.value >= 85) {
        state.warningIssued = true;
        eventBus?.emit("heat-warning", { seconds: 1.0 });
      }
      if (state.crossedOverheat) {
        this.overheat(state);
        state.crossedOverheat = false;
      }
      if (state.value < 80) state.warningIssued = false;
      return state.value;
    },
    overheat(state) {
      state.overheatedAt = Date.now();
      const hottest = [...state.sourceHeat.entries()].sort((a, b) => b[1] - a[1])[0];
      if (hottest) {
        const count = state.disableCounts.get(hottest[0]) ?? 0;
        const duration = Math.max(0.75, 3 * Math.pow(0.7, count));
        state.disableCounts.set(hottest[0], count + 1);
        modules?.disable(hottest[0], duration);
        eventBus?.emit("overheated", { sourceId: hottest[0], duration, value: state.value });
      } else {
        eventBus?.emit("overheated", { sourceId: null, duration: 0, value: state.value });
      }
      state.sourceHeat.clear();
    }
  };
}
