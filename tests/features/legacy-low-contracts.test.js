import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/legacy/legacy-runtime.js", import.meta.url), "utf8");

test("legacy pause suspends audio and resume restarts it", () => {
  assert.match(source, /suspend\(\) \{ if \(this\.ctx && this\.ctx\.state === "running"\) this\.ctx\.suspend\(\); \}/);
  assert.match(source, /pause\(\).*AudioSys\.suspend\(\)/s);
});

test("glitch refresh clears the previous timeout", () => {
  const glitchStart = source.indexOf("\n      glitch() {");
  const glitch = source.slice(glitchStart, source.indexOf("gameOver()", glitchStart));
  assert.match(glitch, /clearTimeout\(this\.glitchTimer\)/);
  assert.match(glitch, /this\.glitchTimer = setTimeout/);
});

test("combat broadphase is rebuilt after enemy movement and ignores dead entries", () => {
  const step = source.slice(source.indexOf("step(dt)"), source.indexOf("draw()", source.indexOf("step(dt)")));
  const movement = step.indexOf("e.x += e.vx * dt");
  const rebuild = step.indexOf("this.hash.clear()", movement);
  const bullets = step.indexOf("this.bullets.update", movement);
  assert.ok(movement >= 0 && rebuild > movement && bullets > rebuild);
  assert.match(step, /if \(o === e \|\| o\.dead\) continue/);
  assert.match(source, /killEnemyQuiet\(e\)\s*\{[^}]*if \(i >= 0\) \{[^}]*e\.dead = true;[^}]*this\.kills\+\+;/s);
});

test("immediate enemy spawns skip the birth delay", () => {
  assert.match(source, /birth: immediate \? 0 : 0\.35, fusing: false, dead: false/);
});
