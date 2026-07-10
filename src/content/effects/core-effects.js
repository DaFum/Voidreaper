const pushEntity = (collection, effect, context) => context.run[collection]?.push({
  id: context.run.ids.create(collection),
  ...effect.payload,
  sourceId: effect.sourceId
});

function dealDamage(effect, context) {
  const target = effect.target ?? context.target;
  const amount = Math.max(0, effect.amount ?? 0);
  if (!target) return 0;
  if (context.combat?.damage) return context.combat.damage(target, amount, effect.sourceId);
  const healthKey = Number.isFinite(target.health) ? "health" : Number.isFinite(target.hp) ? "hp" : null;
  if (!healthKey) return 0;
  target[healthKey] = Math.max(0, target[healthKey] - amount);
  context.events?.emit("enemy-hit", { context, target, amount, sourceId: effect.sourceId });
  return amount;
}

export const CORE_EFFECT_HANDLERS = Object.freeze({
  "deal-damage": dealDamage,
  "heal-player": (effect, context) => { context.run.player.hull = Math.min(context.run.player.maxHull, context.run.player.hull + (effect.amount ?? 0)); },
  "grant-shield": (effect, context) => { context.run.player.shield += effect.amount ?? 0; },
  "spawn-projectile": (effect, context) => pushEntity("projectiles", effect, context),
  "spawn-zone": (effect, context) => pushEntity("zones", effect, context),
  "summon-unit": (effect, context) => pushEntity("summons", effect, context),
  "change-resource": (effect, context) => {
    const resources = context.run.player.resources;
    resources[effect.resource] = (resources[effect.resource] ?? 0) + (effect.amount ?? 0);
  },
  teleport: (effect, context) => Object.assign(context.run.player, { x: effect.x ?? 0, y: effect.y ?? 0 }),
  "apply-status": (effect, context) => context.target?.statuses?.set(effect.statusId, { duration: effect.duration, sourceId: effect.sourceId }),
  "move-enemy": (effect, context) => { if (context.target) { context.target.x += effect.x ?? 0; context.target.y += effect.y ?? 0; } },
  "change-cooldown": (effect, context) => context.modules?.changeCooldown(effect.targetId, effect.amount),
  "disable-module": (effect, context) => context.modules?.disable(effect.targetId, effect.duration),
  "copy-affix": (effect, context) => context.equipment?.copyAffix(effect.sourceItemId, effect.targetItemId, effect.affixId),
  "modify-loot": (effect, context) => context.lootModifiers?.push(effect),
  "mark-evolution": (effect, context) => context.run.build.evolutions.push(effect.evolutionId),
  "trigger-fault": (effect, context) => context.faults?.trigger(effect.profileId, effect.tier)
});

export function registerCoreEffects(registry) {
  for (const [id, handler] of Object.entries(CORE_EFFECT_HANDLERS)) registry.register(id, handler);
  return registry;
}
