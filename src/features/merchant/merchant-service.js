import { createRunRng } from "../../core/rng.js";
import { MERCHANT_SERVICES, CORRUPT_OFFER } from "../../content/merchant/merchant-pools.js";

const rarityFactor = { common: 1, uncommon: 1.3, rare: 1.8, prototype: 2.6 };
export const merchantPrice = (item, regionIndex = 0, tier = 1) => Math.ceil(((item.itemPower ?? item.energyCost ?? 10) * 2 + 12) * (rarityFactor[item.rarity] ?? 1) * (1 + regionIndex * .12) * (1 + (tier - 1) * .08));

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
  return {
    roll,
    buy(run, offer) {
      const cost = offer.currency === "flux" ? { flux: offer.price } : { scrap: offer.price };
      if (!offer.corrupted && !currencyService.spend(run, cost)) return false;
      if (offer.corrupted) run.corruption.value += 15;
      else run.inventory.push({ ...offer, ownership: "temporary" });
      eventBus?.emit("merchant-purchase", { offerId: offer.offerId });
      return true;
    },
    sell(run, item) { run.inventory = run.inventory.filter(entry => entry !== item); currencyService.award(run, "sale", Math.max(1, Math.floor(merchantPrice(item) / 4))); },
    reserve(offer) { offer.reserved = true; return offer; },
    reroll(seed, regionIndex, tier) { return roll(seed + 1, regionIndex, tier); },
    reveal(nodes) { for (const node of nodes) node.informationLevel = Math.max(1, node.informationLevel); }
  };
}
