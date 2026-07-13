import test from "node:test";
import assert from "node:assert/strict";
import { TUTORIAL_CHAPTERS, validateTutorialChapters } from "../../../src/content/tutorial/tutorial-chapters.js";

test("tutorial catalog covers all six approved chapters and capabilities", () => {
  assert.deepEqual(TUTORIAL_CHAPTERS.map(chapter => chapter.id), ["foundations", "run-navigation", "ship-and-equipment", "meta-progression", "advanced-run", "controls-accessibility"]);
  assert.deepEqual(validateTutorialChapters(TUTORIAL_CHAPTERS), { valid: true, issues: [] });
  const capabilities = new Set(TUTORIAL_CHAPTERS.flatMap(chapter => chapter.capabilities));
  for (const required of ["movement", "merchant", "workbench", "blueprints", "research", "simulator", "bosses", "extraction", "touch"]) assert.equal(capabilities.has(required), true, required);
});

test("foundations requires resuming the paused run before combat continues", () => {
  const foundations = TUTORIAL_CHAPTERS.find(chapter => chapter.id === "foundations");
  const pauseIndex = foundations.steps.findIndex(step => step.id === "pause");
  assert.equal(foundations.steps[pauseIndex + 1]?.id, "resume");
  assert.equal(foundations.steps[pauseIndex + 1]?.event, "tutorial:run-resumed");
  assert.equal(foundations.steps[pauseIndex + 1]?.target, "pause-resume");
});

test("run navigation never blocks on randomly generated route content", () => {
  const navigation = TUTORIAL_CHAPTERS.find(chapter => chapter.id === "run-navigation");
  assert.deepEqual(
    navigation.steps.filter(step => step.kind === "action" && !step.optional).map(step => step.event),
    ["tutorial:sector-selected", "tutorial:sector-entered"]
  );
});

test("advanced run remains completable when optional end screens are unavailable", () => {
  const advanced = TUTORIAL_CHAPTERS.find(chapter => chapter.id === "advanced-run");
  assert.equal(advanced.steps.every(step => step.kind === "explanation" || step.optional), true);
});

test("ship and equipment remains completable without loot or saved blueprints", () => {
  const assembly = TUTORIAL_CHAPTERS.find(chapter => chapter.id === "ship-and-equipment");
  assert.equal(assembly.steps.every(step => step.kind === "explanation" || step.optional), true);
});
