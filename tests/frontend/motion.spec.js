import { describe, expect, test, vi } from "vitest";
import { renderSettingsScreen } from "../../src/ui/screens/settings-screen.js";

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

  test("isReducedMotion evaluates documentElement data attribute correctly", () => {
    const isReducedMotion = () =>
      document.documentElement.dataset.reducedMotion === "true" ||
      (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false);

    document.documentElement.dataset.reducedMotion = "false";
    expect(isReducedMotion()).toBe(false);

    document.documentElement.dataset.reducedMotion = "true";
    expect(isReducedMotion()).toBe(true);

    document.documentElement.dataset.reducedMotion = "false";
  });
});
