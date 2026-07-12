const ACTIONS = Object.freeze({ swap: 1, reroll: 1, lock: 1, socket: 2, stabilize: 2, corrupt: 1, overclock: 2, "full-repair": 2, "replace-port": 2, "remount-detached": 2 });

export function createWorkshopService({ affixRoller, eventBus } = {}) {
  return {
    open(regionIndex = 0) { return { actionPoints: 3 + Math.floor(regionIndex / 2), used: 0 }; },
    preview(session, action, target, payload = {}) {
      const points = ACTIONS[action] ?? 1;
      const repairAction = ["full-repair","replace-port","remount-detached"].includes(action);
      const consequences = {
        swap: "Loadout-Slot wird sofort ersetzt.", reroll: "Ein ungesperrtes Affix wird neu gewürfelt.", lock: "Affix bleibt bei Rerolls erhalten.",
        socket: "Ein Sockel wird dauerhaft für diesen Run geöffnet.", stabilize: "Korruption -10, Item Power -5%.", corrupt: "Korruption +12, Item Power +15%.",
        overclock: "Reaktor: +15% Leistung, +12% Last, +10 Hitze, höhere Fehlerchance.", "full-repair": "Panzerung und Funktionskern werden vollständig repariert.", "replace-port": "Beschädigten Montageport ersetzen.", "remount-detached": "Abgetrenntes Modul wieder montierbar machen."
      };
      return { allowed: session.actionPoints - session.used >= points && (!repairAction || Boolean(payload.repairService?.apply)), points, target: target?.name ?? "System", consequence: consequences[action] ?? action };
    },
    apply(session, action, target, payload = {}) {
      const repairAction = ["full-repair","replace-port","remount-detached"].includes(action);
      const preview = this.preview(session, action, target, payload);
      if (!preview.allowed) return false;
      if(repairAction){const repaired=payload.repairService.apply(action,target.nodeId??target.formerNodeId,{inCombat:false});if(repaired===false)return false;session.used+=preview.points;eventBus?.emit("workshop-action",{action,targetId:target.instanceId??target.id});return true;}
      session.used += preview.points;
      if (action === "swap") Object.assign(target, payload.replacement ?? {});
      if (action === "reroll") {
        const affixKey = affix => affix?.affixId ?? affix?.id;
        const locked = (target.affixes ?? []).find(affix => affixKey(affix) === target.lockedAffixId) ?? null;
        const rolled = affixRoller?.roll?.({ definition: payload.definition ?? target, rarity: target.rarity ?? "rare", itemPower: target.itemPower ?? 100, sector: payload.sector ?? 0, corruption: target.corruptionLevel ?? target.corruption ?? 0, rng: payload.rng }) ?? target.affixes ?? [];
        target.affixes = locked ? [locked, ...rolled.filter(affix => affixKey(affix) !== target.lockedAffixId)] : rolled;
      }
      if (action === "lock") target.lockedAffixId = payload.affixId;
      if (action === "socket") target.sockets = [...(target.sockets ?? []), { chipId: null }];
      if (action === "stabilize") { target.corruptionLevel = Math.max(0, (target.corruptionLevel ?? target.corruption ?? 0) - 10); target.itemPower = Math.floor((target.itemPower ?? 100) * .95); }
      if (action === "corrupt") { target.corruptionLevel = (target.corruptionLevel ?? target.corruption ?? 0) + 12; target.itemPower = Math.ceil((target.itemPower ?? 100) * 1.15); }
      if (action === "overclock") Object.assign(target, { outputMultiplier: 1.15, loadMultiplier: 1.12, heatOffset: 10, faultMultiplier: 1.25 });
      eventBus?.emit("workshop-action", { action, targetId: target.instanceId ?? target.id });
      return true;
    }
  };
}
