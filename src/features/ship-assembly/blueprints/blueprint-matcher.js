export const BLUEPRINT_MATCH = Object.freeze({
  EXACT: "exact",
  COMPATIBLE: "compatible",
  STRUCTURAL: "structural",
  INCOMPATIBLE: "incompatible",
  BLOCKED: "blocked",
});
export function matchBlueprintNode(
  target,
  moduleProfile,
  { occupied = false } = {},
) {
  if (occupied) return BLUEPRINT_MATCH.BLOCKED;
  if (!target || !moduleProfile) return BLUEPRINT_MATCH.INCOMPATIBLE;
  if (
    target.preferredModuleDefinitionId &&
    target.preferredModuleDefinitionId === moduleProfile.definitionId
  )
    return BLUEPRINT_MATCH.EXACT;
  const roles = new Set([
      moduleProfile.visualProfileId,
      moduleProfile.rendererId,
      ...(moduleProfile.roles ?? []),
    ]),
    tags = new Set(moduleProfile.tags ?? []);
  if (
    (target.allowedRoles ?? []).some((role) => roles.has(role)) ||
    (target.allowedTags ?? []).some((tag) => tags.has(tag))
  )
    return BLUEPRINT_MATCH.COMPATIBLE;
  if (
    target.sizeClass &&
    target.sizeClass === moduleProfile.sizeClass &&
    (!target.mountType || moduleProfile.mountTypes?.includes(target.mountType))
  )
    return BLUEPRINT_MATCH.STRUCTURAL;
  return BLUEPRINT_MATCH.INCOMPATIBLE;
}

// ⚡ Bolt: Use a static priority map instead of creating arrays and using indexOf inside the sorting loop
// to prevent O(N log N) intermediate array allocations and reduce garbage collection overhead during matching.
const MATCH_PRIORITY = {
  exact: 0,
  compatible: 1,
  structural: 2,
  incompatible: 3,
  blocked: 4,
};

export function findBlueprintTarget(blueprint, port, moduleProfile) {
  const candidates = (blueprint?.nodes ?? []).filter(
    (node) =>
      node.parentBlueprintNodeId === port.parentNodeId ||
      node.parentPortKey === port.key,
  );
  return (
    candidates
      .map((node) => ({ node, match: matchBlueprintNode(node, moduleProfile) }))
      .sort(
        (a, b) =>
          (MATCH_PRIORITY[a.match] ?? 4) - (MATCH_PRIORITY[b.match] ?? 4),
      )[0] ?? null
  );
}
export const blueprintMatchBonus = (match) =>
  ({
    exact: 1,
    compatible: 0.72,
    structural: 0.38,
    incompatible: 0,
    blocked: -1,
  })[match] ?? 0;
