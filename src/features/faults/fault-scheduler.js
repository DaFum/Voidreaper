const LOAD_PRESSURE = { stable: 0, strained: 0.2, overloaded: 0.5, critical: 1, collapse: 1.8 };

export function calculateFaultPressure({ loadTier, heat, corruption, stability = 100, resistance = 0, cooldown = 0 }) {
  const raw = (LOAD_PRESSURE[loadTier] ?? 0)
    + Math.max(0, heat - 60) / 70
    + corruption / 140
    + Math.max(0, 100 - stability) / 80
    - resistance
    - Math.min(0.5, cooldown / 30);
  return Math.max(0, raw);
}

export function createFaultScheduler({ rng, profiles, faults, eventBus }) {
  const profileMap = new Map(profiles.map(profile => [profile.id, profile]));
  const faultMap = new Map(faults.map(fault => [fault.id, fault]));
  const state = { nextAt: Infinity, lastAt: -Infinity, pressure: 0, nextTier: "none" };

  function tierFor(pressure) {
    return pressure >= 1.5 ? "heavy" : pressure >= 0.75 ? "medium" : pressure > 0 ? "light" : "none";
  }

  function schedule(now, pressure) {
    if (pressure <= 0) {
      state.nextAt = Infinity;
      state.nextTier = "none";
      return;
    }
    const minimum = Math.max(3, 22 / (1 + pressure));
    state.nextAt = now + rng.range(minimum, minimum * 1.8);
    state.nextTier = tierFor(pressure);
  }

  return {
    state,
    update(now, inputs, components = []) {
      state.pressure = calculateFaultPressure({ ...inputs, cooldown: now - state.lastAt });
      if (!Number.isFinite(state.nextAt)) schedule(now, state.pressure);
      if (now < state.nextAt) return null;
      const candidates = components.filter(component => component.faultProfileId && component.disabledUntil <= now);
      const component = candidates.length ? rng.pick(candidates) : { id: "system", faultProfileId: "standard" };
      const profile = profileMap.get(component.faultProfileId) ?? profileMap.get("standard");
      const tier = tierFor(state.pressure);
      const faultId = rng.pick(profile[tier]?.length ? profile[tier] : profile.light);
      const fault = faultMap.get(faultId);
      state.lastAt = now;
      schedule(now, state.pressure);
      const occurrence = { fault, componentId: component.id, tier, at: now, pressure: state.pressure, source: "overload" };
      eventBus?.emit("fault-triggered", occurrence);
      return occurrence;
    },
    force(profileId = "standard", tier = "light", componentId = "system") {
      const profile = profileMap.get(profileId) ?? profileMap.get("standard");
      const fault = faultMap.get(rng.pick(profile[tier] ?? profile.light));
      const occurrence = { fault, componentId, tier, at: state.lastAt, pressure: state.pressure, source: "overload" };
      eventBus?.emit("fault-triggered", occurrence);
      return occurrence;
    },
    reschedule(now) { schedule(now, state.pressure); }
  };
}
