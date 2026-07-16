import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeBuildCode, decodeBuildCode } from "../../../src/features/codex/build-code.js";

test("decodeBuildCode throws an error for unsupported build codes", () => {
  assert.throws(
    () => decodeBuildCode("invalid_code"),
    {
      name: "Error",
      message: "Unsupported build code"
    }
  );
});

test("encodeBuildCode and decodeBuildCode correctly encode and decode a basic build", () => {
  const build = {
    ship: "ship-a",
    weapon: "weapon-b",
    reactor: "reactor-c",
    modules: ["module-1"],
    evolutions: ["evo-1"]
  };

  const code = encodeBuildCode(build);
  assert.ok(code.startsWith("VR4."));

  const decoded = decodeBuildCode(code);
  assert.deepEqual(decoded.build, build);
  assert.deepEqual(decoded.missing, []);
});

test("decodeBuildCode correctly identifies missing ids based on validIds", () => {
  const build = {
    ship: "ship-a",
    weapon: "weapon-b",
    reactor: "reactor-c",
    modules: ["module-1"],
    evolutions: ["evo-1"]
  };

  const code = encodeBuildCode(build);

  const validIds = new Set(["ship-a", "weapon-b", "reactor-c", "module-1"]); // evo-1 is missing
  const decoded = decodeBuildCode(code, validIds);

  assert.deepEqual(decoded.build, build);
  assert.deepEqual(decoded.missing, ["evo-1"]);
});
