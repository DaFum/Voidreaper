export function calculateVisualImbalance(nodes) {
  let sum = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    sum += node.worldPosition.x * Math.max(1, node.visualMass);
  }
  return sum;
}
function chooseDecoratorKind(id, style) {
  if (id?.includes("cooling") || style?.armorFamily === "thermal-open")
    return "cooling-ribs";
  if (
    style?.armorFamily === "industrial-truss" ||
    style?.armorFamily === "heavy-block"
  )
    return "counterweight";
  return "brace-plate";
}
export function buildBalanceDecorators({ nodes, shipStyle }) {
  const imbalance = calculateVisualImbalance(nodes);
  if (Math.abs(imbalance) < 40) return [];
  const heavySide = Math.sign(imbalance);
  // ⚡ Bolt: Replaced chained array methods (.filter.slice.map) with an imperative loop.
  // This avoids O(N) intermediate array allocations and short-circuits traversal early.
  const result = [];
  let count = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (Math.sign(node.worldPosition.x) === heavySide) {
      result.push(
        Object.freeze({
          decoratorId: `balance-${node.nodeId}-${count}`,
          kind: chooseDecoratorKind(node.visualProfileId, shipStyle),
          position: {
            x: -node.worldPosition.x * 0.72,
            y: node.worldPosition.y * 0.86,
          },
          rotation: -node.worldRotation,
          scale: Math.min(0.7, 0.35 + node.visualMass / 40),
          gameplayRelevant: false,
        }),
      );
      count++;
      if (count >= 3) break; // Maximum 3 balance decorators
    }
  }
  return result;
}
