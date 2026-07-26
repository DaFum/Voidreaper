import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { assertObjective, createProgressObjective } from "../../../src/features/encounters/objective-schema.js";

describe("objective-schema", () => {
  describe("assertObjective", () => {
    it("returns the objective if it is fully valid", () => {
      const valid = {
        id: "test",
        createState: () => {},
        start: () => {},
        update: () => {},
        isComplete: () => {},
        getHud: () => {},
        finish: () => {}
      };
      assert.equal(assertObjective(valid), valid);
    });

    it("throws an error if id is missing or not a string", () => {
      const invalid1 = {
        createState: () => {}, start: () => {}, update: () => {},
        isComplete: () => {}, getHud: () => {}, finish: () => {}
      };
      const invalid2 = { ...invalid1, id: 123 };

      assert.throws(() => assertObjective(invalid1), /Invalid objective field: id/);
      assert.throws(() => assertObjective(invalid2), /Invalid objective field: id/);
    });

    it("throws an error if a function field is missing or not a function", () => {
      const invalid = {
        id: "test",
        createState: () => {},
        start: () => {},
        update: () => {},
        isComplete: () => {},
        getHud: () => {},
        finish: "not a function"
      };
      assert.throws(() => assertObjective(invalid), /Invalid objective field: finish/);
    });
  });

  describe("createProgressObjective", () => {
    it("initializes state correctly", () => {
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 100 });
      assert.equal(objective.id, "prog");

      const state = objective.createState();
      assert.deepEqual(state, { progress: 0, target: 100, started: false });
    });

    it("handles start correctly", () => {
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 100 });
      const state = objective.createState();

      objective.start({}, state);
      assert.equal(state.started, true);
    });

    it("updates progress based on contribution without exceeding target", () => {
      const contribution = mock.fn(() => 30);
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 50, contribution });
      const state = objective.createState();
      const context = {};

      objective.update(context, state, 1);
      assert.equal(contribution.mock.calls.length, 1);
      assert.deepEqual(contribution.mock.calls[0].arguments, [context, 1, state]);
      assert.equal(state.progress, 30);

      objective.update(context, state, 1);
      assert.equal(state.progress, 50); // capped at target
    });

    it("defaults contribution to 0", () => {
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 50 });
      const state = objective.createState();

      objective.update({}, state, 1);
      assert.equal(state.progress, 0);
    });

    it("checks completion status correctly", () => {
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 50 });
      const state = { progress: 30, target: 50 };

      assert.equal(objective.isComplete({}, state), false);

      state.progress = 50;
      assert.equal(objective.isComplete({}, state), true);

      state.progress = 60;
      assert.equal(objective.isComplete({}, state), true);
    });

    it("generates correct HUD info", () => {
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 50 });
      const state = { progress: 30, target: 50 };

      assert.deepEqual(objective.getHud({}, state), {
        label: "Progress",
        value: 30,
        maximum: 50
      });
    });

    it("handles finish correctly", () => {
      const objective = createProgressObjective({ id: "prog", label: "Progress", target: 50 });
      const state = { progress: 50, target: 50 };

      objective.finish({}, state);
      assert.equal(state.finished, true);
    });
  });
});
