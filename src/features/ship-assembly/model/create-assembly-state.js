export function createAssemblyState({ shipFrameId, rootNode, rootPorts }) {
  return { version: 1, shipFrameId, rootNodeId: rootNode.nodeId, nodesById: { [rootNode.nodeId]: rootNode }, connectionsById: {}, portsById: Object.fromEntries(rootPorts.map(port => [port.portId, port])), secondaryConnectionsById: {}, detachedItems: [], visualRevision: 0, structuralRevision: 0, activeBlueprintId: null };
}
