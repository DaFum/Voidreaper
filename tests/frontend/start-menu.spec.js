import { describe, expect, test, vi } from "vitest";
import { attachStartMenuToggle } from "../../src/ui/screens/start-menu-toggle.js";

const setup = () => {
  const startScreen = document.createElement("div");
  const openButton = document.createElement("button");
  const closeButton = document.createElement("button");
  return { startScreen, openButton, closeButton, toggle: attachStartMenuToggle(startScreen, { openButton, closeButton }) };
};

describe("start menu toggle", () => {
  test("initializes the start screen in home view", () => {
    const { startScreen } = setup();
    expect(startScreen.dataset.view).toBe("home");
  });

  test("keeps a preset view instead of overwriting it", () => {
    const startScreen = document.createElement("div");
    startScreen.dataset.view = "menu";
    attachStartMenuToggle(startScreen, {});
    expect(startScreen.dataset.view).toBe("menu");
  });

  test("menu button opens the menu view, back button returns home", () => {
    const { startScreen, openButton, closeButton } = setup();
    openButton.click();
    expect(startScreen.dataset.view).toBe("menu");
    closeButton.click();
    expect(startScreen.dataset.view).toBe("home");
  });

  test("open/close can be driven programmatically and destroy detaches the buttons", () => {
    const { startScreen, openButton, toggle } = setup();
    toggle.open();
    expect(startScreen.dataset.view).toBe("menu");
    toggle.close();
    expect(startScreen.dataset.view).toBe("home");

    toggle.destroy();
    openButton.click();
    expect(startScreen.dataset.view).toBe("home");
  });

  test("tolerates a missing start screen and missing buttons", () => {
    expect(() => attachStartMenuToggle(null, {}).open()).not.toThrow();
    const startScreen = document.createElement("div");
    expect(() => attachStartMenuToggle(startScreen, {}).open()).not.toThrow();
    expect(startScreen.dataset.view).toBe("menu");
  });
});
