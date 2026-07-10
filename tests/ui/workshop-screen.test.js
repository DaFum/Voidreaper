import test from "node:test";
import assert from "node:assert/strict";
import { workshopDisabledReason } from "../../src/ui/screens/workshop-screen.js";

test("workshop disabled reason distinguishes insufficient AP", () => {
  assert.equal(
    workshopDisabledReason({ actionPoints: 3, used: 2 }, { allowed: false, points: 2 }),
    "nicht genügend Aktionspunkte"
  );
});

test("workshop disabled reason distinguishes unavailable repair service", () => {
  assert.equal(
    workshopDisabledReason({ actionPoints: 3, used: 0 }, { allowed: false, points: 2 }),
    "benötigter Reparaturdienst nicht verfügbar"
  );
});

test("allowed workshop actions keep their ordinary accessible name", () => {
  assert.equal(workshopDisabledReason({ actionPoints: 3, used: 0 }, { allowed: true, points: 2 }), null);
});
