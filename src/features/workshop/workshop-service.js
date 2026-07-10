const ACTIONS = Object.freeze({ swap: 1, reroll: 1, lock: 1, socket: 2, stabilize: 2, corrupt: 1, overclock: 2, "full-repair": 2, "replace-port": 2, "remount-detached": 2 });

export function createWorkshopService({ affixRoller, eventBus } = {}) {
  return {
    open(regionIndex = 0) { return { actionPoints: 3 + Math.floor(regionIndex / 2), used: 0 }; },
    preview(session, action, target) {
      const points = ACTIONS[action] ?? 1;
      const consequences = {
        swap: "Loadout-Slot wird sofort ersetzt.", reroll: "Ein ungesperrtes Affix wird neu gewürfelt.", lock: "Affix bleibt bei Rerolls erhalten.",
        socket: "Ein Sockel wird dauerhaft für diesen Run geöffnet.", stabilize: "Korruption -10, Item Power -5%.", corrupt: "Korruption +12, Item Power +15%.",
        overclock: "Reaktor: +15% Leistung, +12% Last, +10 Hitze, höhere Fehlerchance.", "full-repair": "Panzerung und Funktionskern werden vollständig repariert.", "replace-port": "Beschädigten Montageport ersetzen.", "remount-detached": "Abgetrenntes Modul wieder montierbar machen."
      };
      return { allowed: session.actionPoints - session.used >= points, points, target: target?.name ?? "System", consequence: consequences[action] ?? action };
    },
    apply(session, action, target, payload = {}) {
      if (["full-repair","replace-port","remount-detached"].includes(action) && !payload.repairService?.apply) return false;
      const preview = this.preview(session, action, target);
      if (!preview.allowed) return false;
      session.used += preview.points;
      if (action === "swap") Object.assign(target, payload.replacement ?? {});
      if (action === "reroll") target.affixes = affixRoller?.roll?.({ definition: payload.definition ?? target, rarity: target.rarity ?? "rare", itemPower: target.itemPower ?? 100, sector: payload.sector ?? 0, corruption: target.corruption ?? target.corruptionLevel ?? 0, rng: payload.rng }) ?? target.affixes ?? [];
      if (action === "lock") target.lockedAffixId = payload.affixId;
      if (action === "socket") target.sockets = [...(target.sockets ?? []), null];
      if (action === "stabilize") { target.corruption = Math.max(0, (target.corruption ?? 0) - 10); target.itemPower = Math.floor((target.itemPower ?? 100) * .95); }
      if (action === "corrupt") { target.corruption = (target.corruption ?? 0) + 12; target.itemPower = Math.ceil((target.itemPower ?? 100) * 1.15); }
      if (action === "overclock") Object.assign(target, { outputMultiplier: 1.15, loadMultiplier: 1.12, heatOffset: 10, faultMultiplier: 1.25 });
      if (["full-repair","replace-port","remount-detached"].includes(action)) payload.repairService.apply(action,target.nodeId??target.formerNodeId,{inCombat:false});
      eventBus?.emit("workshop-action", { action, targetId: target.instanceId ?? target.id });
      return true;
    }
  };
}
