import test from "node:test";
import assert from "node:assert/strict";
import { createBloomPass } from "../../../src/render/post/bloom-pass.js";

test("createBloomPass exits early if document is undefined", () => {
  const bloom = createBloomPass();

  const ctx = {
    canvas: { width: 100, height: 100 },
    save: test.mock.fn(),
    restore: test.mock.fn()
  };

  bloom.apply(ctx);

  assert.equal(ctx.save.mock.calls.length, 0, "Does not apply bloom if no DOM available");
});

test("createBloomPass exits early if canvas is missing or invalid", () => {
  const originalDocument = global.document;
  global.document = {
    createElement: () => ({ getContext: () => null })
  };

  try {
    const bloom = createBloomPass();

    const ctxNoCanvas = { save: test.mock.fn() };
    bloom.apply(ctxNoCanvas);
    assert.equal(ctxNoCanvas.save.mock.calls.length, 0, "Exits if no canvas on ctx");

    const ctxInvalidCanvas = { canvas: { width: 0, height: 100 }, save: test.mock.fn() };
    bloom.apply(ctxInvalidCanvas);
    assert.equal(ctxInvalidCanvas.save.mock.calls.length, 0, "Exits if canvas has 0 width");
  } finally {
    if (originalDocument === undefined) {
      delete global.document;
    } else {
      global.document = originalDocument;
    }
  }
});