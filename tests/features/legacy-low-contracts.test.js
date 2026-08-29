import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/legacy/legacy-runtime.js", import.meta.url),
  "utf8",
);

test("legacy pause suspends audio and resume restarts it", () => {
  assert.match(
    source,
    /suspend\(\)\s*\{\s*if\s*\(this\.ctx\s*&&\s*this\.ctx\.state\s*===\s*"running"\)\s*this\.ctx\.suspend\(\);\s*\}/,
  );
  assert.match(source, /pause\(\).*AudioSys\.suspend\(\)/s);
});

test("glitch refresh clears the previous timeout", () => {
  const glitchMatch = source.match(/glitch\(\)\s*\{/);
  assert.ok(glitchMatch, "glitch method found in source");
  const glitchStart = glitchMatch.index;
  const glitch = source.slice(
    glitchStart,
    source.indexOf("gameOver()", glitchStart),
  );
  assert.match(glitch, /clearTimeout\(this\.glitchTimer\)/);
  assert.match(glitch, /this\.glitchTimer = setTimeout/);
});

test("combat broadphase is rebuilt after enemy movement and ignores dead entries", () => {
  const step = source.slice(
    source.indexOf("step(dt)"),
    source.indexOf("draw()", source.indexOf("step(dt)")),
  );
  const movement = step.indexOf("e.x += e.vx * dt");
  const bullets = step.indexOf("this.bullets.update", movement);
  assert.ok(movement >= 0 && bullets > movement);
  assert.match(step, /if \(o === e \|\| o\.dead\) continue/);
  assert.match(
    source,
    /killEnemyQuiet\(e\)\s*\{[^}]*e\.dead = true;[^}]*this\.kills\+\+;/s,
  );
});

test("immediate enemy spawns skip the birth delay", () => {
  assert.match(
    source,
    /birth:\s*immediate\s*\?\s*0\s*:\s*0\.35,\s*fusing:\s*false,\s*dead:\s*false/,
  );
});
