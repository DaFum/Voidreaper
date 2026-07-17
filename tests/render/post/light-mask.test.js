import test from "node:test";
import assert from "node:assert/strict";
import { createLightMask } from "../../../src/render/post/light-mask.js";

test("createLightMask exits early if document is undefined", () => {
  const mask = createLightMask();

  const ctx = {
    save: test.mock.fn(),
    restore: test.mock.fn()
  };

  mask.apply(ctx, { darkness: 1, viewport: { width: 100, height: 100 } });

  assert.equal(ctx.save.mock.calls.length, 0, "Does not apply mask if no DOM available");
});

test("createLightMask exits early if viewport or darkness is invalid", () => {
  const originalDocument = global.document;
  global.document = {
    createElement: () => ({ getContext: () => null })
  };

  try {
    const mask = createLightMask();
    const ctx = {
      save: test.mock.fn()
    };

    mask.apply(ctx, { darkness: 0, viewport: { width: 100, height: 100 } });
    assert.equal(ctx.save.mock.calls.length, 0, "Exits if darkness is 0");

    mask.apply(ctx, { darkness: 1, viewport: null });
    assert.equal(ctx.save.mock.calls.length, 0, "Exits if viewport is missing");
  } finally {
    if (originalDocument === undefined) {
      delete global.document;
    } else {
      global.document = originalDocument;
    }
  }
});