import test from "node:test";
import assert from "node:assert/strict";
import { generateSectorMap, flattenSectorMap } from "../../../src/features/sectors/sector-map-generator.js";

test("sector-map-generator", async (t) => {
  await t.test("generateSectorMap creates a valid sector map with default arguments", () => {
    const map = generateSectorMap();
    assert.ok(map);
    assert.strictEqual(map.sourceSeed, 0);
    assert.strictEqual(map.contentVersion, "3.0.0");
    assert.ok(Array.isArray(map.regions));
  });

  await t.test("generateSectorMap uses provided seed and options", () => {
    const map = generateSectorMap({ seed: 123, contentVersion: "2.0.0" });
    assert.ok(map);
    assert.strictEqual(map.sourceSeed, 123);
    assert.strictEqual(map.contentVersion, "2.0.0");
  });

  await t.test("generateSectorMap falls back to default regions when campaignPathId is invalid", () => {
    const map = generateSectorMap({ campaignPathId: "invalid-id" });
    assert.strictEqual(map.regions.length, 5);
    assert.strictEqual(map.regions[0].id, "shattered-approach");
  });

  await t.test("generateSectorMap avoids merchant-to-merchant connections", () => {
    // Generate many maps and verify no merchant points to another merchant
    for (let seed = 0; seed < 10; seed++) {
      const map = generateSectorMap({ seed });
      const flat = flattenSectorMap(map);

      const merchants = flat.filter(node => node.type === "merchant");
      for (const merchant of merchants) {
        if (!merchant.next || merchant.next.length === 0) continue;

        for (const nextId of merchant.next) {
          const nextNode = flat.find(n => n.id === nextId);
          assert.ok(nextNode, 'Connected node ' + nextId + ' should exist in the map');
          assert.notStrictEqual(nextNode.type, "merchant", "Merchant connected to merchant");
        }
      }
    }
  });

  await t.test("generateSectorMap creates expected node structure", () => {
    const map = generateSectorMap({ seed: 42 });
    const firstRegion = map.regions[0];
    const firstNode = firstRegion.layers[0][0];

    assert.ok(firstNode.id.startsWith("r0-l0-n0"));
    assert.strictEqual(firstNode.regionId, "shattered-approach");
    assert.strictEqual(firstNode.regionIndex, 0);
    assert.strictEqual(firstNode.layer, 0);
    assert.strictEqual(firstNode.index, 0);
    assert.ok(firstNode.type);
    assert.ok(typeof firstNode.danger === "number");
    assert.ok(typeof firstNode.seed === "number");
    assert.strictEqual(firstNode.contentVersion, "3.0.0");
    assert.ok(Array.isArray(firstNode.next));
  });

  await t.test("generateSectorMap forces mid-boss or extraction on layer 2", () => {
    const map = generateSectorMap({ seed: 99 });
    for (const region of map.regions) {
      const layer2 = region.layers[2];
      assert.strictEqual(layer2[0].type, "mid-boss");
      for (let i = 1; i < layer2.length; i++) {
        assert.strictEqual(layer2[i].type, "extraction");
      }
    }
  });

  await t.test("generateSectorMap assigns appropriate boss to region 4 vs others", () => {
    const map = generateSectorMap({ seed: 77 });

    // Region 0-3 (mid-boss)
    assert.strictEqual(map.regions[0].layers[3][0].type, "mid-boss");
    assert.strictEqual(map.regions[1].layers[3][0].type, "mid-boss");
    assert.strictEqual(map.regions[2].layers[3][0].type, "mid-boss");
    assert.strictEqual(map.regions[3].layers[3][0].type, "mid-boss");

    // Region 4 (final boss)
    assert.strictEqual(map.regions[4].layers[3][0].type, "boss");
  });

  await t.test("flattenSectorMap handles invalid inputs", () => {
    assert.deepEqual(flattenSectorMap(null), []);
    assert.deepEqual(flattenSectorMap(undefined), []);
    assert.deepEqual(flattenSectorMap("string"), []);
    assert.deepEqual(flattenSectorMap({}), []);
    assert.deepEqual(flattenSectorMap({ regions: "not-an-array" }), []);
  });

  await t.test("flattenSectorMap flattens regions and layers and caches result", () => {
    const map = generateSectorMap({ seed: 55 });

    const flat1 = flattenSectorMap(map);
    assert.ok(Array.isArray(flat1));
    assert.ok(flat1.length > 0);

    // Check that we're caching by requesting it again and getting exact same object
    const flat2 = flattenSectorMap(map);
    assert.strictEqual(flat1, flat2);

    // Verify contents
    assert.strictEqual(flat1[0].id, map.regions[0].layers[0][0].id);
  });
});
