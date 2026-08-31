import { describe, expect, test, vi } from "vitest";
import { renderSettingsScreen } from "../../src/ui/screens/settings-screen.js";
import {
  animatePanelEnter,
  animateDialogEnter,
  animateDialogExit,
  animateListStagger,
} from "../../src/ui/motion/motion.js";
import { isReducedMotion } from "../../src/ui/motion/reduced-motion.js";

const root = () => document.createElement("div");

describe("Motion System & Reduced Motion Integration", () => {
  test("settings screen toggles dataset.reducedMotion on documentElement", () => {
    const container = root();
    const onChange = vi.fn();
    const settings = {
      reducedMotion: false,
      screenShake: true,
      damageFlashes: true,
      crt: true,
      largeTouchControls: false,
      colorPatterns: false,
      uiScale: 1,
      bindings: {},
    };

    renderSettingsScreen(container, settings, onChange);

    const toggle = container.querySelector('[data-setting="reducedMotion"]');
    expect(toggle).not.toBeNull();
    expect(toggle.checked).toBe(false);

    toggle.checked = true;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));

    expect(settings.reducedMotion).toBe(true);
    expect(document.documentElement.dataset.reducedMotion).toBe("true");
    expect(onChange).toHaveBeenCalledWith(settings);

    toggle.checked = false;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));

    expect(settings.reducedMotion).toBe(false);
    expect(document.documentElement.dataset.reducedMotion).toBe("false");
  });

  test("build animation controller dynamically updates on preference change when passed a resolver", async () => {
    let reducedMotionSetting = false;
    const isReducedMotionResolver = () => reducedMotionSetting;

    // Import production controller dynamically
    const { createBuildAnimationController } = await import(
      "../../src/features/ship-assembly/mounting/build-animation-controller.js"
    );

    const controller = createBuildAnimationController({
      reducedMotion: isReducedMotionResolver,
    });

    // First sequence started under normal motion
    const anim1 = controller.start("node-1", { workbench: false });
    expect(anim1.duration).toBe(0.8);
    controller.update(0.8); // Complete anim1

    // Toggle setting dynamically
    reducedMotionSetting = true;

    // Subsequent sequence started after toggle should reflect reduced motion without recreating controller
    const anim2 = controller.start("node-2", { workbench: false });
    expect(anim2.duration).toBe(0.3);
  });

  test("isReducedMotion respects documentElement dataset and fallback", () => {
    document.documentElement.dataset.reducedMotion = "true";
    expect(isReducedMotion()).toBe(true);

    document.documentElement.dataset.reducedMotion = "false";
    expect(isReducedMotion()).toBe(false);
  });

  test("animatePanelEnter handles null and disconnected elements gracefully", () => {
    expect(animatePanelEnter(null)).toBeNull();
    const div = document.createElement("div");
    const anim = animatePanelEnter(div);
    expect(anim).not.toBeNull();
  });

  test("animateDialogExit returns a promise that resolves on completion", async () => {
    document.documentElement.dataset.reducedMotion = "true";
    const dialog = document.createElement("dialog");
    const res = await animateDialogExit(dialog);
    expect(res).toBeDefined();
  });

  test("animateListStagger filters invalid elements and runs stagger animation", () => {
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    const anim = animateListStagger([el1, null, el2]);
    expect(anim).not.toBeNull();
  });
});
