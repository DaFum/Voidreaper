const NORMAL_BUILD_PHASES = Object.freeze([
  { id: "port-glow", duration: 0.12 },
  { id: "extend-braces", duration: 0.18 },
  { id: "lock-core", duration: 0.16 },
  { id: "connect-lines", duration: 0.14 },
  { id: "close-armor", duration: 0.22 },
  { id: "power-up", duration: 0.18 },
]);

const REDUCED_BUILD_PHASES = Object.freeze([
  { id: "port-glow", duration: 0.1 },
  { id: "lock-core", duration: 0.1 },
  { id: "power-up", duration: 0.1 },
]);

export function createBuildAnimationController({ reducedMotion = false } = {}) {
  const animations = [];

  const resolveIsReduced = () =>
    typeof reducedMotion === "function" ? Boolean(reducedMotion()) : Boolean(reducedMotion);

  return {
    start(nodeId, { mode = "mount", workbench = false } = {}) {
      const isReduced = resolveIsReduced();
      const activePhases = isReduced ? REDUCED_BUILD_PHASES : NORMAL_BUILD_PHASES;
      let totalPhasesDuration = 0;
      for (let i = 0; i < activePhases.length; i++) {
        totalPhasesDuration += activePhases[i].duration;
      }

      const baseDuration = workbench ? 1.6 : 0.8;
      const duration = isReduced ? 0.3 : baseDuration;
      const animation = {
        nodeId,
        mode,
        elapsed: 0,
        duration,
        complete: false,
        activePhases,
        totalPhasesDuration,
      };
      animations.push(animation);
      return Object.freeze({ ...animation });
    },
    update(dt) {
      let writeIndex = 0;
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        animation.elapsed = Math.min(
          animation.duration,
          animation.elapsed + dt,
        );
        animation.complete = animation.elapsed >= animation.duration;
        if (!animation.complete) animations[writeIndex++] = animation;
      }
      animations.length = writeIndex;
    },
    snapshot() {
      const snap = new Array(animations.length);
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        const activePhases = animation.activePhases;
        const total = animation.totalPhasesDuration;
        const lastPhase = activePhases[activePhases.length - 1];
        const normalized = animation.elapsed / animation.duration;
        let cursor = 0,
          phase = lastPhase,
          phaseProgress = 1;
        for (let j = 0; j < activePhases.length; j++) {
          const candidate = activePhases[j];
          const share = candidate.duration / total;
          if (normalized <= cursor + share) {
            phase = candidate;
            phaseProgress = (normalized - cursor) / share;
            break;
          }
          cursor += share;
        }
        snap[i] = Object.freeze({
          nodeId: animation.nodeId,
          mode: animation.mode,
          elapsed: animation.elapsed,
          duration: animation.duration,
          complete: animation.complete,
          phase: phase.id,
          phaseProgress: Math.max(0, Math.min(1, phaseProgress)),
        });
      }
      return snap;
    },
  };
}
