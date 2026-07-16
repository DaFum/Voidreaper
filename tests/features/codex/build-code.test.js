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

import test from "node:test";
import assert from "node:assert/strict";
import { encodeBuildCode, decodeBuildCode } from "../../../src/features/codex/build-code.js";

test("Build Code Encoding & Decoding", async (t) => {
  await t.test("encodeBuildCode correctly serializes and encodes a full build", () => {
    const build = {
      ship: "interceptor",
      weapon: "laser",
      reactor: "fusion",
      modules: ["shield", "engine"],
      evolutions: ["evo1", "evo2"],
      tags: ["meta", "fast"],
      seed: 12345,
      ignoredField: "should not be included"
    };

    const code = encodeBuildCode(build);

    assert.ok(code.startsWith("VR4."), "Encoded code should start with VR4.");

    const decoded = decodeBuildCode(code);

    assert.deepEqual(decoded.build, {
      ship: "interceptor",
      weapon: "laser",
      reactor: "fusion",
      modules: ["shield", "engine"],
      evolutions: ["evo1", "evo2"],
      tags: ["meta", "fast"],
      seed: 12345
    }, "Decoded build should match original without ignored fields");
    assert.deepEqual(decoded.missing, [], "Missing should be empty when no validIds are provided");
  });

  await t.test("encodeBuildCode correctly serializes a partial build", () => {
    const build = {
      ship: "frigate",
      weapon: "missile"
    };

    const code = encodeBuildCode(build);
    const decoded = decodeBuildCode(code);

    assert.deepEqual(decoded.build, { ship: "frigate", weapon: "missile" });
  });

  await t.test("decodeBuildCode throws for unsupported prefix", () => {
    assert.throws(
      () => decodeBuildCode("VR3.someencodedstuff"),
      { message: "Unsupported build code" }
    );
    assert.throws(
      () => decodeBuildCode("someencodedstuff"),
      { message: "Unsupported build code" }
    );
  });

  await t.test("decodeBuildCode handles validIds to find missing items", () => {
    const build = {
      ship: "interceptor",
      weapon: "laser",
      reactor: "fusion",
      modules: ["shield", "engine", "unknown_module"],
      evolutions: ["evo1", "unknown_evo"]
    };

    const code = encodeBuildCode(build);

    const validIds = new Set([
      "interceptor",
      "laser",
      "fusion",
      "shield",
      "engine",
      "evo1"
    ]);

    const decoded = decodeBuildCode(code, validIds);

    assert.deepEqual(
      decoded.missing,
      ["unknown_module", "unknown_evo"],
      "Should identify IDs that are not in validIds set"
    );
  });

  await t.test("decodeBuildCode handles empty validIds set", () => {
    const build = {
      ship: "interceptor",
      modules: ["shield"]
    };

    const code = encodeBuildCode(build);
    const validIds = new Set();

    const decoded = decodeBuildCode(code, validIds);

    assert.deepEqual(
      decoded.missing,
      [],
      "Should return empty missing array if validIds set is empty"
    );
  });
});
