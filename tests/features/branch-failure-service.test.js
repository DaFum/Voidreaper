import test from "node:test";
import assert from "node:assert/strict";
import { findSurvivingSecondaryConnection } from "../../src/features/ship-assembly/damage/branch-failure-service.js";

test("findSurvivingSecondaryConnection returns null when no secondary connections exist", () => {
  const snapshot = {
    secondaryConnectionsById: {},
    nodesById: {
      "node-1": {}
    }
  };
  const result = findSurvivingSecondaryConnection(snapshot, "node-1");
  assert.equal(result, null);
});

test("findSurvivingSecondaryConnection returns null when connections exist but none touch the given childNodeId", () => {
  const snapshot = {
    secondaryConnectionsById: {
      "conn-1": { sourceNodeId: "node-2", targetNodeId: "node-3" }
    },
    nodesById: {
      "node-1": {},
      "node-2": {},
      "node-3": {}
    }
  };
  const result = findSurvivingSecondaryConnection(snapshot, "node-1");
  assert.equal(result, null);
});

test("findSurvivingSecondaryConnection returns null when a connection touches childNodeId but the other node is missing from nodesById", () => {
  const snapshot = {
    secondaryConnectionsById: {
      "conn-1": { sourceNodeId: "node-1", targetNodeId: "node-2" }
    },
    nodesById: {
      "node-1": {} // node-2 is missing
    }
  };
  const result = findSurvivingSecondaryConnection(snapshot, "node-1");
  assert.equal(result, null);
});

test("findSurvivingSecondaryConnection returns the connection when childNodeId is the source and the target survives", () => {
  const snapshot = {
    secondaryConnectionsById: {
      "conn-1": { connectionId: "conn-1", sourceNodeId: "node-1", targetNodeId: "node-2" }
    },
    nodesById: {
      "node-1": {},
      "node-2": {} // target survives
    }
  };
  const result = findSurvivingSecondaryConnection(snapshot, "node-1");
  assert.deepEqual(result, { connectionId: "conn-1", sourceNodeId: "node-1", targetNodeId: "node-2" });
});

test("findSurvivingSecondaryConnection returns the connection when childNodeId is the target and the source survives", () => {
  const snapshot = {
    secondaryConnectionsById: {
      "conn-1": { connectionId: "conn-1", sourceNodeId: "node-2", targetNodeId: "node-1" }
    },
    nodesById: {
      "node-1": {},
      "node-2": {} // source survives
    }
  };
  const result = findSurvivingSecondaryConnection(snapshot, "node-1");
  assert.deepEqual(result, { connectionId: "conn-1", sourceNodeId: "node-2", targetNodeId: "node-1" });
});

test("findSurvivingSecondaryConnection returns the first valid connection when multiple connections touch the node, skipping invalid ones", () => {
  const snapshot = {
    secondaryConnectionsById: {
      "conn-1": { connectionId: "conn-1", sourceNodeId: "node-1", targetNodeId: "node-2" }, // Invalid: target missing
      "conn-2": { connectionId: "conn-2", sourceNodeId: "node-3", targetNodeId: "node-4" }, // Invalid: doesn't touch node-1
      "conn-3": { connectionId: "conn-3", sourceNodeId: "node-1", targetNodeId: "node-5" }, // Valid: target exists
      "conn-4": { connectionId: "conn-4", sourceNodeId: "node-6", targetNodeId: "node-1" }  // Valid, but should return conn-3
    },
    nodesById: {
      "node-1": {},
      // node-2 missing
      "node-3": {},
      "node-4": {},
      "node-5": {},
      "node-6": {}
    }
  };
  const result = findSurvivingSecondaryConnection(snapshot, "node-1");
  assert.deepEqual(result, { connectionId: "conn-3", sourceNodeId: "node-1", targetNodeId: "node-5" });
});
