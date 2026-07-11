import test from "node:test";
import assert from "node:assert/strict";
import {
  SPARK_SPEED_SQ,
  isSpark,
  parseTint,
  shockEase,
  sparkTransform
} from "../../src/render/pixi/combat-fx-scene.js";

test("parseTint converts the legacy hex particle colors", () => {
  assert.equal(parseTint("#ff2d78"), 0xff2d78);
  assert.equal(parseTint("#4cc9f0"), 0x4cc9f0);
  assert.equal(parseTint("#fff"), 0xffffff);
  assert.equal(parseTint("#abc"), 0xaabbcc);
});

test("parseTint falls back to white for non-hex input", () => {
  assert.equal(parseTint("rgb(20,30,40)"), 0xffffff);
  assert.equal(parseTint(""), 0xffffff);
  assert.equal(parseTint(null), 0xffffff);
  assert.equal(parseTint("#zzzzzz"), 0xffffff);
});

test("isSpark matches the legacy squared-speed threshold", () => {
  const speed = Math.sqrt(SPARK_SPEED_SQ);
  assert.equal(isSpark({ vx: speed + 1, vy: 0 }), true);
  assert.equal(isSpark({ vx: speed - 1, vy: 0 }), false);
  assert.equal(isSpark({ vx: 0, vy: 0 }), false);
});

test("sparkTransform mirrors the legacy velocity tail", () => {
  const { length, rotation } = sparkTransform({ vx: 100, vy: 0 });
  assert.ok(Math.abs(length - 3.5) < 1e-9);
  assert.equal(rotation, 0);
  assert.ok(Math.abs(sparkTransform({ vx: 0, vy: 100 }).rotation - Math.PI / 2) < 1e-9);
});

test("shockEase is a cubic ease-out over [0,1]", () => {
  assert.equal(shockEase(0), 0);
  assert.equal(shockEase(1), 1);
  assert.ok(shockEase(0.5) > 0.5);
  assert.ok(shockEase(0.25) < shockEase(0.75));
});
