import { MAX_BRANCH_DEPTH } from "./assembly-constants.js";
export const getChildren = (state, nodeId) => {
  // ⚡ Bolt: Avoid Object.values().filter() to eliminate intermediate array allocations
  const children = [];
  if (state.nodesById) {
    for (const key in state.nodesById) {
      if (Object.hasOwn(state.nodesById, key)) {
        const node = state.nodesById[key];
        if (node && node.parentNodeId === nodeId) {
          children.push(node);
        }
      }
    }
  }
  return children;
};
export function getBranchNodeIds(state, rootNodeId) {
  const result = [];
  const seen = new Set();
  const queue = [rootNodeId];

  // ⚡ Bolt: Build adjacency list for fast lookup to make this O(V) instead of O(N*V).
  // Also avoids array mapping and spread operator allocations on each iteration.
  const childrenByParent = Object.create(null);
  if (state.nodesById) {
    for (const key in state.nodesById) {
      if (Object.hasOwn(state.nodesById, key)) {
        const node = state.nodesById[key];
        if (node && node.parentNodeId != null) {
          if (!childrenByParent[node.parentNodeId]) {
            childrenByParent[node.parentNodeId] = [];
          }
          childrenByParent[node.parentNodeId].push(node.nodeId);
        }
      }
    }
  }

  while (queue.length) {
    const nodeId = queue.shift();
    if (!state.nodesById[nodeId] || seen.has(nodeId)) continue;
    seen.add(nodeId);
    result.push(nodeId);

    const children = childrenByParent[nodeId];
    if (children) {
      for (let i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }
  }
  return result;
}
function getDepth(state, nodeId) {
  let depth = 0;
  let current = state.nodesById[nodeId];
  const seen = new Set();
  while (current?.parentNodeId) {
    if (seen.has(current.nodeId)) return Infinity;
    seen.add(current.nodeId);
    depth += 1;
    current = state.nodesById[current.parentNodeId];
  }
  return depth;
}
export function wouldCreateCycle(state, nodeId, newParentNodeId) {
  return (
    nodeId === newParentNodeId ||
    getBranchNodeIds(state, nodeId).includes(newParentNodeId)
  );
}
export function assertAssemblyInvariants(state) {
  if (!state.nodesById[state.rootNodeId])
    throw new Error("Assembly root node is missing");
  const owners = new Set();
  for (const node of Object.values(state.nodesById)) {
    if (node.nodeId !== state.rootNodeId && !state.nodesById[node.parentNodeId])
      throw new Error(`Missing parent for node ${node.nodeId}`);
    if (node.moduleInstanceId) {
      if (owners.has(node.moduleInstanceId))
        throw new Error(`Duplicate module owner ${node.moduleInstanceId}`);
      owners.add(node.moduleInstanceId);
    }
    if (getDepth(state, node.nodeId) > MAX_BRANCH_DEPTH)
      throw new Error(`Branch depth exceeded at ${node.nodeId}`);
  }
  return true;
}
