import { createRunRng } from "../../core/rng.js";
import { createItemInstance } from "../equipment/item-factory.js";

const REWARD_SLOTS = new Set(["passive", "active", "utility", "relic"]);

export function createCampaignRewardService({ equipment, eventBus, saveStore }) {
  return {
    apply(run, node) {
      run.rewardedNodeIds ??= [];
      if (!node || run.rewardedNodeIds.includes(node.id) || !["combat", "elite"].includes(node.type)) return { applied: false };

      const rng = createRunRng(node.seed);
      const definition = rng.pick(equipment.values().filter(item => REWARD_SLOTS.has(item.slot)));
      const rarity = node.type === "elite" ? "rare" : "common";
      const item = createItemInstance(definition, { ids: run.ids, rarity, itemPower: 100 + node.danger * 10, affixes: [], sockets: [], runId: run.id });
      item.ownership = "temporary";
      run.inventory.push(item);
      if (node.type === "combat") run.resources.scrap += 10 + node.danger * 5;
      else run.resources.flux += 1 + node.danger;
      run.rewardedNodeIds.push(node.id);
      eventBus.emit("run-item-acquired", { item, source: `sector-${node.type}`, run });
      return { applied: true, item };
    },
    async extractBlueprints(run) {
      const definitionIds = [...new Set((run?.inventory ?? [])
        .map(item => equipment.get(item.definitionId))
        .filter(definition => definition && REWARD_SLOTS.has(definition.slot))
        .map(definition => definition.id))];
      if (!definitionIds.length) return { applied: false, definitionIds };
      await saveStore.update(save => {
        save.blueprints ??= {};
        for (const definitionId of definitionIds) {
          save.blueprints[definitionId] ??= { source: "campaign-extraction" };
        }
      });
      eventBus.emit("campaign-blueprints-extracted", { definitionIds, run });
      return { applied: true, definitionIds };
    }
  };
}
