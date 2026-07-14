import { clamp } from "../../core/math.js";
import { CORRUPTION_SIGNATURES, CORRUPTION_THRESHOLDS } from "../../content/corruption/corruption-rules.js";

const tierFor = value => [...CORRUPTION_THRESHOLDS].reverse().find(rule => value >= rule.value);

export function createCorruptionState(value = 0) {
  const tier = tierFor(value);
  return { value, tier: tier.id, bookings: [], discoveredSignatures: new Set(), committedTransformations: new Set() };
}

export function createCorruptionSystem({ eventBus } = {}) {
  return {
    change(state, amount, sourceId, runTime = 0, { allowAbyss = false } = {}) {
      const previous = state.value;
      state.value = clamp(state.value + amount, 0, allowAbyss ? Infinity : 100);
      const amountChanged = state.value - previous;
      const bookingIndex = state.bookings.findIndex(booking => booking.sourceId === sourceId);
      const previousBooking = state.bookings[bookingIndex];
      const booking = Object.freeze({ sourceId, amount: (previousBooking?.amount ?? 0) + amountChanged, at: runTime });
      if (bookingIndex >= 0) state.bookings[bookingIndex] = booking;
      else state.bookings.push(booking);
      const tier = tierFor(state.value);
      if (tier.id !== state.tier) {
        const previousTier = state.tier;
        state.tier = tier.id;
        if (CORRUPTION_SIGNATURES[tier.id]) state.discoveredSignatures.add(CORRUPTION_SIGNATURES[tier.id]);
        eventBus?.emit("corruption-threshold", { tier: tier.id, previousTier, value: state.value, rule: tier });
      }
      eventBus?.emit("corruption-changed", { previous, value: state.value, amount: amountChanged, sourceId });
      return state.value;
    },
    commitTransformation(state, evolutionId) {
      state.committedTransformations.add(evolutionId);
    },
    canClean(state, amount) {
      return Math.min(Math.max(0, amount), state.value);
    },
    clean(state, amount, sourceId, runTime = 0) {
      return this.change(state, -this.canClean(state, amount), sourceId, runTime);
    },
    summary(state) {
      const sources = new Map();
      for (const booking of state.bookings) sources.set(booking.sourceId, (sources.get(booking.sourceId) ?? 0) + booking.amount);
      return { value: state.value, tier: state.tier, sources: [...sources.entries()], signatures: [...state.discoveredSignatures] };
    }
  };
}
