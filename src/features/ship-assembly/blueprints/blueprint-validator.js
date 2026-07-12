import { BLUEPRINT_VERSION } from "./blueprint-schema.js";
export function validateBlueprint(
  input,
  { knownDefinitionIds = new Set(), knownShipFrameIds = new Set() } = {},
) {
  const source = structuredClone(input ?? {}),
    issues = [],
    seen = new Set(),
    nodes = [];
  for (const node of Array.isArray(source.nodes) ? source.nodes : []) {
    if (!node?.blueprintNodeId || seen.has(node.blueprintNodeId)) {
      issues.push({
        type: "duplicate-or-missing-node",
        nodeId: node?.blueprintNodeId,
      });
      continue;
    }
    seen.add(node.blueprintNodeId);
    nodes.push(node);
  }
  const nodeIds = new Set(nodes.map((node) => node.blueprintNodeId)),
    nodeMap = new Map(nodes.map((node) => [node.blueprintNodeId, node])),
    root = nodes.find((node) => !node.parentBlueprintNodeId);
  const valid = [];
  // Ancestor verdicts are memoized across nodes so each parent pointer is walked
  // at most once overall, keeping validation O(N) even for deep chains. A walk
  // ends safe (reached the root or a known-safe node), in a cycle, or orphaned
  // (the chain dangles at a missing parent, so the node is disconnected).
  const safeNodes = new Set(),
    cycleNodes = new Set(),
    orphanNodes = new Set();
  for (const node of nodes) {
    if (node !== root && !nodeIds.has(node.parentBlueprintNodeId)) {
      issues.push({ type: "missing-parent", nodeId: node.blueprintNodeId });
      continue;
    }
    const ancestors = new Set([node.blueprintNodeId]);
    let parentId = node.parentBlueprintNodeId,
      verdict = "safe";
    while (parentId) {
      if (safeNodes.has(parentId)) break;
      if (cycleNodes.has(parentId) || ancestors.has(parentId)) {
        verdict = "cycle";
        break;
      }
      if (orphanNodes.has(parentId)) {
        verdict = "orphan";
        break;
      }
      ancestors.add(parentId);
      const parentNode = nodeMap.get(parentId);
      if (!parentNode) {
        verdict = "orphan";
        break;
      }
      parentId = parentNode.parentBlueprintNodeId;
    }
    if (verdict === "cycle") {
      for (const ancestor of ancestors) cycleNodes.add(ancestor);
      issues.push({ type: "cycle", nodeId: node.blueprintNodeId });
      continue;
    }
    if (verdict === "orphan") {
      for (const ancestor of ancestors) orphanNodes.add(ancestor);
      issues.push({ type: "missing-parent", nodeId: node.blueprintNodeId });
      continue;
    }
    for (const ancestor of ancestors) safeNodes.add(ancestor);
    if (
      node.preferredModuleDefinitionId &&
      !knownDefinitionIds.has(node.preferredModuleDefinitionId)
    ) {
      issues.push({
        type: "unknown-definition",
        definitionId: node.preferredModuleDefinitionId,
      });
      node.unresolvedDefinitionId = node.preferredModuleDefinitionId;
      node.preferredModuleDefinitionId = null;
      node.allowedRoles = Array.isArray(node.allowedRoles)
        ? node.allowedRoles
        : [];
      if (!node.allowedRoles.length) node.allowedRoles = ["unresolved-module"];
    }
    valid.push(node);
  }
  const validIds = new Set(valid.map((node) => node.blueprintNodeId)),
    connections = (
      Array.isArray(source.connections) ? source.connections : []
    ).filter((connection) => {
      const validConnection =
        validIds.has(connection.sourceNodeId) &&
        validIds.has(connection.targetNodeId);
      if (!validConnection)
        issues.push({
          type: "missing-connection-node",
          connectionId: connection.connectionId,
        });
      return validConnection;
    });
  if (!root) issues.push({ type: "missing-root" });
  // An unknown frame must fail validation: geometry lookup throws downstream,
  // so an imported blueprint with a bogus shipFrameId is unusable.
  const unknownFrame = Boolean(source.shipFrameId) && !knownShipFrameIds.has(source.shipFrameId);
  if (unknownFrame)
    issues.push({ type: "unknown-frame", shipFrameId: source.shipFrameId });
  return {
    valid: Boolean(root && source.shipFrameId && !unknownFrame),
    blueprint: {
      ...source,
      blueprintVersion: BLUEPRINT_VERSION,
      nodes: valid,
      connections,
    },
    issues,
    repaired: issues.length > 0,
  };
}
