import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// bootstrap.js wires together the entire application (services, screens, the
// legacy game loop, ...) and cannot be exercised as a plain unit without
// standing up the whole runtime. These source-level checks guard high-risk
// bootstrap wiring that otherwise has no small unit seam.
const bootstrapPath = fileURLToPath(
  new URL("../../src/app/bootstrap.js", import.meta.url),
);
const source = readFileSync(bootstrapPath, "utf8");
const lines = source.split(/\r?\n/);

test("bootstrap still exposes exactly one export: the async bootstrap function", () => {
  const exportLines = lines.filter((line) => line.startsWith("export"));
  assert.deepEqual(exportLines, ["export async function bootstrap() {"]);
});

test("foundations waits on the start screen for an explicit continue action", () => {
  const overlayActionStart = source.indexOf("onAction: async (action) => {");
  const overlayActionEnd = source.indexOf(
    "// During the foundations training",
    overlayActionStart,
  );
  const overlayActionSource = source.slice(overlayActionStart, overlayActionEnd);
  assert.match(
    overlayActionSource,
    /game\.start\("tutorial"\)/,
    "expected an explicit tutorial-overlay action to start the foundations run",
  );

  const startupSource = source.slice(source.lastIndexOf("await legacyRuntime.start();"));
  assert.match(
    startupSource,
    /services\.tutorial\s*\.start\("foundations"\)/,
    "expected fresh profiles to keep receiving the foundations offer",
  );
  assert.doesNotMatch(
    startupSource,
    /game\.start\("tutorial"\)/,
    "bootstrap must leave the start screen visible until the offer is continued",
  );
});

test("foundations resume does not restart an existing paused run", () => {
  const overlayActionStart = source.indexOf("onAction: async (action) => {");
  const overlayActionEnd = source.indexOf(
    "// During the foundations training",
    overlayActionStart,
  );
  assert.notEqual(
    overlayActionStart,
    -1,
    'expected bootstrap.js to contain the "onAction: async (action) => {" anchor',
  );
  assert.notEqual(
    overlayActionEnd,
    -1,
    'expected bootstrap.js to contain the "// During the foundations training" anchor',
  );
  const overlayActionSource = source.slice(overlayActionStart, overlayActionEnd);

  assert.match(
    overlayActionSource,
    /game\.state !== "pause"/,
    "expected tutorial auto-start to preserve an existing paused run",
  );
});

test("the modern pause action toggles the live runtime", () => {
  const actionStart = source.indexOf('events.on("action"');
  const actionHandler = source.slice(actionStart, source.indexOf("applyTutorialTargets", actionStart));
  assert.match(actionHandler, /action === "pause"/);
  assert.match(actionHandler, /game\.pause\(\)/);
  assert.match(actionHandler, /game\.resume\(\)/);
});

test("hangar catalogs receive the live loadout and shared equip persistence path", () => {
  const hangarStart = source.indexOf("const hangar = createHangarScreen");
  const hangarEnd = source.indexOf("renderTab: (tab, content) => {", hangarStart);
  const hangarOptions = source.slice(hangarStart, hangarEnd);
  const persistStart = source.indexOf("const persistLoadout = async");

  assert.notEqual(hangarStart, -1, "expected createHangarScreen wiring");
  assert.ok(persistStart >= 0 && persistStart < hangarStart, "expected shared persistence before hangar creation");
  assert.match(hangarOptions, /loadout:\s*\(\) => resolvePrimaryLoadout\(metaSave\)/);
  assert.match(hangarOptions, /onEquip:\s*\(slot, index, definitionId\) =>\s*persistLoadout/);
  assert.equal(source.match(/const persistLoadout = async/g)?.length, 1);
});

test("loadout persistence mutates the queued save and keeps successful writes successful", () => {
  const persistStart = source.indexOf("const persistLoadout = async");
  const persistEnd = source.indexOf("const hangar = createHangarScreen", persistStart);
  const persistSource = source.slice(persistStart, persistEnd);

  assert.match(persistSource, /services\.save\.update\(\(save\) => \{[\s\S]*resolvePrimaryLoadout\(save\)/);
  assert.doesNotMatch(persistSource, /resolvePrimaryLoadout\(metaSave\)/);
  assert.match(persistSource, /metaSave = saved;/);
  assert.match(persistSource, /try \{\s*metaSave = await services\.save\.load\(\);\s*\} catch/);
  assert.match(persistSource, /catch[\s\S]*hangar\.render\(\);\s*return \{ ok: true \};/);
});
