const TRIGGER_EVENTS = Object.freeze([
  "shot-fired", "enemy-hit", "critical-hit", "enemy-killed", "elite-killed", "boss-hit",
  "player-damaged", "dodge-used", "heat-threshold", "overheated", "corruption-changed",
  "active-module-used", "pickup-collected", "sector-entered", "extraction-completed", "tick"
]);

export function createTriggerEngine({ eventBus, effects, clock = () => performance.now() / 1000 }) {
  let triggers = [];
  const cooldowns = new Map();
  let stepDepth = 0;
  let stepEffects = 0;
  const subscriptions = TRIGGER_EVENTS.map(eventName => eventBus.on(eventName, payload => process(eventName, payload)));

  function process(eventName, payload = {}) {
    if (stepDepth >= 12 || stepEffects >= 100) {
      console.warn(`Trigger budget exceeded at ${eventName}; remaining chain discarded.`);
      return;
    }
    stepDepth += 1;
    try {
      for (const trigger of triggers) {
        if (stepEffects >= 100) break;
        if (trigger.event !== eventName) continue;
        const key = trigger.instanceId ?? trigger.id;
        if ((cooldowns.get(key) ?? 0) > clock()) continue;
        if (trigger.condition && !trigger.condition(payload.context ?? payload, payload)) continue;
        if (trigger.cooldown) cooldowns.set(key, clock() + trigger.cooldown);
        for (const effect of trigger.effects ?? []) {
          if (stepEffects >= 100) break;
          stepEffects += 1;
          effects.execute({ ...effect, sourceId: effect.sourceId ?? trigger.sourceId }, payload.context ?? payload);
        }
      }
    } finally {
      stepDepth -= 1;
    }
  }

  return {
    setSources(sources) {
      triggers = sources.flatMap(source => (source.triggers ?? []).map((trigger, index) => ({
        ...trigger,
        sourceId: source.id,
        instanceId: `${source.instanceId ?? source.id}:${trigger.id ?? index}`
      })));
      cooldowns.clear();
    },
    beginStep() { stepDepth = 0; stepEffects = 0; },
    process,
    destroy() { subscriptions.forEach(unsubscribe => unsubscribe()); }
  };
}
