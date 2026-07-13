// Item instances carry numeric stability (item-factory initializes 100); the
// vault UI and filters work with the categorical labels below. Saves written
// before the unification may still hold string stability values — treat those
// as the label itself.
export function describeStability(item) {
  // corruption wins over a legacy string stability: an old snapshot may carry
  // "stable"/"damaged" while corruptionLevel was raised past the threshold
  if ((item?.corruptionLevel ?? item?.corruption ?? 0) >= 75) return "corrupted";
  if (typeof item?.stability === "string") return item.stability;
  if ((item?.stability ?? 100) < 75) return "damaged";
  return "stable";
}
