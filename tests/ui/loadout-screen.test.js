import test from "node:test";
import assert from "node:assert/strict";
import { loadoutStatus } from "../../src/ui/screens/loadout-screen.js";

test("an empty loadout is shown as unconfigured instead of collapsed", () => {
  assert.deepEqual(loadoutStatus({ sources: [], load: { ratio: 9.99, tier: "collapse" } }), { percent: 0, tier: "unconfigured" });
});

test("configured loadouts retain their calculated load status", () => {
  assert.deepEqual(loadoutStatus({ sources: [{}], load: { ratio: .92, tier: "stable" } }), { percent: 92, tier: "stable" });
});
