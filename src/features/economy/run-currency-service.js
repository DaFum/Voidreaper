const SOURCES = Object.freeze({ enemy: [2, 0], objective: [20, 2], salvage: [8, 1], sale: [1, 0] });

export function createRunCurrencyService(eventBus) {
  return {
    award(run, source, multiplier = 1) {
      const [scrap, flux] = SOURCES[source] ?? [0, 0];
      run.resources.scrap += Math.max(0, Math.floor(scrap * multiplier));
      run.resources.flux += Math.max(0, Math.floor(flux * multiplier));
      eventBus?.emit("run-currency-changed", { source, ...run.resources });
      return { ...run.resources };
    },
    spend(run, cost = {}) {
      if ((cost.voidShards ?? 0) > 0) throw new Error("Void Shards cannot be spent during a run");
      if (run.resources.scrap < (cost.scrap ?? 0) || run.resources.flux < (cost.flux ?? 0)) return false;
      run.resources.scrap -= cost.scrap ?? 0;
      run.resources.flux -= cost.flux ?? 0;
      eventBus?.emit("run-currency-changed", { source: "spend", ...run.resources });
      return true;
    }
  };
}
