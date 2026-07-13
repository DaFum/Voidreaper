import test from "node:test";
import assert from "node:assert/strict";
import { createPlacementSuggestionService } from "../../../../src/features/ship-assembly/placement/placement-suggestion-service.js";

test("world-space collision previews keep a local-space mount transform", () => {
  const service = createPlacementSuggestionService({
    compatibilityService: { evaluate: () => ({ compatible: true, candidate: { center: { x: 120, y: 0 } } }) },
    geometryService: { getSnapshot: () => ({}), measurePlacement: () => ({}) },
    flightProfileService: { previewPlacement: () => ({}) }
  });
  const port = { portId: "child", localPosition: { x: 20, y: 0 }, direction: { x: 1, y: 0 } };
  const [suggestion] = service.suggest({ state: { portsById: { child: port } }, moduleProfile: { tags: [] } });

  assert.deepEqual(suggestion.transform.position, { x: 20, y: 0 });
  assert.equal(suggestion.transform.rotation, -Math.PI / 2);
});
