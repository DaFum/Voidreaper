export function createChallengeService(saveStore, challenges) {
  return {
    summarize(run, result = {}) {
      return Object.freeze({
        mode: run.mode,
        victory: Boolean(result.victory),
        shipId: run.loadout?.shipId,
        weaponId: run.loadout?.weaponId,
        bosses: Object.freeze([...(result.bosses ?? [])]),
        corruption: run.corruption?.value ?? 0,
        anomaliesAccepted: run.anomalies?.length ?? 0,
        extracted: run.inventory?.filter((item) => item.secured).length ?? 0,
        maximumLoad: result.maximumLoad ?? run.player?.energy?.ratio ?? 0,
        damageTaken: result.damageTaken ?? 0,
        abyssDepth: run.campaign?.abyssDepth ?? 0,
        faults: run.telemetry?.faults?.length ?? 0
      });
    },
    evaluate(summary, metaFlags = {}) {
      return challenges.filter((challenge) => {
        if (challenge.predicate) {
          return challenge.predicate(summary, metaFlags);
        }
        if (challenge.mastery) {
          return (
            (metaFlags.mastery?.[challenge.mastery.contentId] ?? 0) >=
            challenge.mastery.target
          );
        }
        return false;
      });
    },
    async claim(challenge) {
      return saveStore.update((save) => {
        save.challenges = save.challenges ?? {};
        save.currencies = save.currencies ?? {};
        if (save.challenges[challenge.id]?.claimed) {
          return save;
        }
        for (const [currency, amount] of Object.entries(challenge.reward ?? {})) {
          save.currencies[currency] =
            (save.currencies[currency] ?? 0) + amount;
        }
        save.challenges[challenge.id] = {
          claimed: true,
          claimedAt: new Date().toISOString()
        };
        return save;
      });
    }
  };
}
