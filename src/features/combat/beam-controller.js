export function createBeamController({ maximumIntensity = 3, buildRate = 0.8 } = {}) {
  return {
    createState: () => ({ targetId: null, intensity: 0, active: false }),
    update(context, state, dt) {
      const target = context.findTarget({ priority: "nearest" });
      state.active = Boolean(target);
      state.targetId = target?.id ?? null;
      state.intensity = Math.max(0, Math.min(maximumIntensity, state.intensity + (target ? buildRate : -buildRate * 2) * dt));
      if (target) context.emitEffect({ id: "deal-damage", target, amount: state.intensity * dt * 12, sourceId: "void-beam" });
    },
    telemetry: state => ({ targetId: state.targetId, intensity: state.intensity })
  };
}
