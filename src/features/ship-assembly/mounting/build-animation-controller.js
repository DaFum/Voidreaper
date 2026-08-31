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
  const activePhases = reducedMotion ? REDUCED_BUILD_PHASES : NORMAL_BUILD_PHASES;
  let total = 0;
  for (let i = 0; i < activePhases.length; i++)
    total += activePhases[i].duration;

  return {
    start(nodeId, { mode = "mount", workbench = false } = {}) {
      const baseDuration = (workbench ? 1.6 : 0.8);
      const duration = reducedMotion ? 0.3 : baseDuration;
      const animation = { nodeId, mode, elapsed: 0, duration, complete: false };
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
      const lastPhase = activePhases[activePhases.length - 1];
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
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
          ...animation,
          phase: phase.id,
          phaseProgress: Math.max(0, Math.min(1, phaseProgress)),
        });
      }
      return snap;
    },
  };
}
