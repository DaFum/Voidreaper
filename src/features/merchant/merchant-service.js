import { createRunRng } from "../../core/rng.js";
import { MERCHANT_SERVICES, CORRUPT_OFFER } from "../../content/merchant/merchant-pools.js";
import { changeRunCorruption } from "../corruption/run-corruption.js";

const rarityFactor = { common: 1, uncommon: 1.3, rare: 1.8, prototype: 2.6 };
// Services carry a fixed basePrice in content (stabilize: 3 flux etc.); only
// equipment offers are priced by item power, rarity, and region.
export const merchantPrice = (item, regionIndex = 0, tier = 1) => item.basePrice != null ? item.basePrice : Math.ceil(((item.itemPower ?? item.energyCost ?? 10) * 2 + 12) * (rarityFactor[item.rarity] ?? 1) * (1 + regionIndex * .12) * (1 + (tier - 1) * .08));

export function createMerchantService({ modules = [], weapons = [], reactors = [], currencyService, eventBus } = {}) {
  const cache = new Map();
  function roll(seed, regionIndex = 0, tier = 1) {
    const key = `${seed}:${regionIndex}:${tier}`;
    if (cache.has(key)) return cache.get(key);
    const rng = createRunRng(seed);
    const moduleOffers = Array.from({ length: rng.integer(3, 5) }, () => modules[rng.integer(0, Math.max(0, modules.length - 1))]).filter(Boolean);
    const equipment = rng.next() < .5 ? weapons : reactors;
    const offers = [...new Map(moduleOffers.map(item => [item.id, item])).values(), equipment[rng.integer(0, Math.max(0, equipment.length - 1))], ...MERCHANT_SERVICES.slice(0, 2), CORRUPT_OFFER]
      .filter(Boolean)
      .map((item, index) => ({ ...item, offerId: `${key}:${index}`, price: merchantPrice(item, regionIndex, tier), reserved: false }));
    cache.set(key, offers);
    return offers;
  }
  function applyService(run, offer) {
    if (offer.id === "repair") { const player = run.player ?? {}; player.hull = player.maxHull ?? player.hull; }
    if (offer.id === "stabilize") changeRunCorruption(run, -10, "merchant-stabilize");
    if (offer.id === "reveal") reveal(run.campaign?.map?.nodes ?? []);
    eventBus?.emit("merchant-service-applied", { serviceId: offer.id, run });
  }
  function reveal(nodes) { for (const node of nodes) node.informationLevel = Math.max(1, node.informationLevel); }
  return {
    roll,
    buy(run, offer) {
      const cost = offer.currency === "flux" ? { flux: offer.price } : { scrap: offer.price };
      if (!offer.corrupted && !currencyService.spend(run, cost)) return false;
      if (offer.corrupted) {
        changeRunCorruption(run, 15, "merchant-corrupted-offer");
        for (const [currency, amount] of Object.entries(offer.grants ?? {})) run.resources[currency] = (run.resources[currency] ?? 0) + amount;
        eventBus?.emit("run-currency-changed", { source: "merchant-corrupted-offer", ...run.resources });
      }
      else if (offer.service) applyService(run, offer);
      else { const item={...offer,instanceId:offer.instanceId??run.ids?.create?.("merchant-item")??`merchant-${offer.offerId}`,definitionId:offer.definitionId??offer.id,ownership:"temporary"};run.inventory.push(item);eventBus?.emit("run-item-acquired",{item,source:"merchant",run}); }
      eventBus?.emit("merchant-purchase", { offerId: offer.offerId });
      return true;
    },
    sell(run, item) { run.inventory = run.inventory.filter(entry => entry !== item); currencyService.award(run, "sale", Math.max(1, Math.floor(merchantPrice(item) / 4))); },
    reserve(offer) { offer.reserved = true; return offer; },
    reroll(seed, regionIndex, tier) { return roll(seed + 1, regionIndex, tier); },
    reveal
  };
}
