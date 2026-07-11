import { validateBlueprint } from "../src/features/ship-assembly/blueprints/blueprint-validator.js";

// Generate a deep chain blueprint
const N = 5000;
const nodes = [];

for (let i = 0; i < N; i++) {
  nodes.push({
    blueprintNodeId: `node_${i}`,
    parentBlueprintNodeId: i > 0 ? `node_${i - 1}` : null,
  });
}

const blueprint = {
  shipFrameId: "frame_1",
  nodes: nodes,
};

console.time("validateBlueprint");
const result = validateBlueprint(blueprint, { knownShipFrameIds: new Set(["frame_1"]) });
console.timeEnd("validateBlueprint");
// console.log("Result:", result.issues.length, "issues");
