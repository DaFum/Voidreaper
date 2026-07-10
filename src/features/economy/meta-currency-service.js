export const META_CURRENCIES = Object.freeze(["voidShards", "bossCores", "anomalyData", "challengeSeals", "salvageFragments"]);

export function createMetaCurrencyService(saveStore) {
  async function transact(entries, source) {
    return saveStore.update(save => {
      for (const [currency, delta] of Object.entries(entries)) {
        if (!META_CURRENCIES.includes(currency)) throw new Error(`Unknown currency: ${currency}`);
        const next = (save.currencies[currency] ?? 0) + delta;
        if (next < 0) throw new Error(`Insufficient ${currency}`);
        save.currencies[currency] = next;
      }
      const id = `${Date.now()}-${Object.keys(save.currencyHistory).length}`;
      save.currencyHistory[id] = { id, at: new Date().toISOString(), source, entries: { ...entries } };
      return save;
    });
  }
  return { transact, credit(currency, amount, source) { if (amount < 0) throw new Error("Credit must be positive"); return transact({ [currency]: amount }, source); }, debit(currency, amount, source) { if (amount < 0) throw new Error("Debit must be positive"); return transact({ [currency]: -amount }, source); } };
}
