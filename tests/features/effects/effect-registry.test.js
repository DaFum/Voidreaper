import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createEffectRegistry } from "../../../src/features/effects/effect-registry.js";

describe("createEffectRegistry", () => {
  it("registers an effect and returns true for has()", () => {
    const registry = createEffectRegistry();
    const handler = () => {};
    registry.register("test-effect", handler);
    assert.equal(registry.has("test-effect"), true);
    assert.ok(registry.ids().includes("test-effect"));
  });

  it("throws an error when registering a duplicate id", () => {
    const registry = createEffectRegistry();
    const handler = () => {};
    registry.register("test-effect", handler);
    assert.throws(() => registry.register("test-effect", handler), /Duplicate effect id/);
  });

  it("executes a registered effect with correct context", () => {
    const registry = createEffectRegistry();
    const handler = mock.fn(() => "result");
    registry.register("test-effect", handler);

    const effect = { id: "test-effect", value: 10 };
    const context = { source: "player" };

    const result = registry.execute(effect, context);

    assert.equal(handler.mock.calls.length, 1);
    assert.deepEqual(handler.mock.calls[0].arguments, [effect, context]);
    assert.equal(result, "result");
  });

  it("returns null and warns when executing without an id", () => {
    const registry = createEffectRegistry();
    const consoleWarn = mock.method(console, "warn", () => {});

    const result = registry.execute({ value: 10 }, {});

    assert.equal(result, null);
    assert.equal(consoleWarn.mock.calls.length, 1);
    assert.equal(consoleWarn.mock.calls[0].arguments[0], "Attempted to execute an effect without an id");
    consoleWarn.mock.restore();
  });

  it("returns null and warns for unknown effect id", () => {
    const registry = createEffectRegistry();
    const consoleWarn = mock.method(console, "warn", () => {});

    const result = registry.execute({ id: "unknown-effect" }, {});

    assert.equal(result, null);
    assert.equal(consoleWarn.mock.calls.length, 1);
    assert.equal(consoleWarn.mock.calls[0].arguments[0], "Unknown effect id: unknown-effect");
    consoleWarn.mock.restore();
  });

  it("returns null and debug logs for latent effect id only once", () => {
    const registry = createEffectRegistry();
    registry.declareLatent(["latent-effect"]);

    const consoleDebug = mock.method(console, "debug", () => {});

    const result1 = registry.execute({ id: "latent-effect" }, {});
    assert.equal(result1, null);
    assert.equal(consoleDebug.mock.calls.length, 1);
    assert.equal(consoleDebug.mock.calls[0].arguments[0], "Latent effect without handler: latent-effect");

    const result2 = registry.execute({ id: "latent-effect" }, {});
    assert.equal(result2, null);
    assert.equal(consoleDebug.mock.calls.length, 1); // Should only log once

    consoleDebug.mock.restore();
  });

  it("safely catches errors thrown by effect handlers and returns null", () => {
    const registry = createEffectRegistry();
    const handler = mock.fn(() => {
      throw new Error("Handler failed");
    });
    registry.register("error-effect", handler);

    const consoleError = mock.method(console, "error", () => {});

    const effect = { id: "error-effect" };
    const result = registry.execute(effect, {});

    assert.equal(result, null);
    assert.equal(consoleError.mock.calls.length, 1);
    assert.equal(consoleError.mock.calls[0].arguments[0], "[effect:error-effect]");

    consoleError.mock.restore();
  });
});
