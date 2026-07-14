import { describe, expect, test, vi } from "vitest";
import { placeTutorialCard } from "../../src/ui/components/tutorial-position.js";
import { applyTutorialTargets, createTutorialOverlay } from "../../src/ui/components/tutorial-overlay.js";
import { renderTutorialLibrary } from "../../src/ui/screens/tutorial-library-screen.js";

describe("tutorial overlay", () => {
  test("observes DOM mutations only while guidance is active", () => {
    const observe = vi.fn(), disconnect = vi.fn();
    const OriginalObserver = globalThis.MutationObserver;
    vi.stubGlobal("MutationObserver", class { observe = observe; disconnect = disconnect; });
    try {
      const root = document.createElement("div");
      const overlay = createTutorialOverlay({ root, resolveTarget: () => null });
      expect(observe).not.toHaveBeenCalled();

      overlay.render({ active: { chapter: { title: "Navigation" }, step: { kind: "action", title: "Karte", body: "Öffne sie." }, stepIndex: 0, stepCount: 1 } });
      expect(observe).toHaveBeenCalledOnce();

      overlay.render({ active: null });
      expect(disconnect).toHaveBeenCalledOnce();
      overlay.destroy();
    } finally {
      vi.stubGlobal("MutationObserver", OriginalObserver);
    }
  });

  test("maps every combat tutorial target to the real HUD containers", () => {
    document.body.innerHTML = `<canvas id="game"></canvas><div id="resource-meters"></div><button id="pausebtn"></button><button id="resumebtn"></button><button id="dodgebtn"></button><div id="combat-actions"></div><div id="cards"></div>`;
    applyTutorialTargets(document);
    expect(document.querySelector("#game").dataset.tutorialId).toBe("game-canvas");
    expect(document.querySelector("#combat-actions").dataset.tutorialId).toBe("hud-active-modules");
    expect(document.querySelector("#resumebtn").dataset.tutorialId).toBe("pause-resume");
    expect(document.querySelector("#cards").dataset.tutorialId).toBe("levelup-options");
  });

  test("full-bleed targets pin the card to the corner instead of centering it", () => {
    const viewport = { width: 800, height: 872 };
    const position = placeTutorialCard({ top: 0, bottom: 872, left: 0, right: 800, width: 800, height: 872 }, { width: 360, height: 240 }, viewport);
    expect(position.side).toBe("corner");
    expect(position.left).toBe(800 - 360 - 8);
    expect(position.top).toBe(872 - 240 - 8);
  });

  test("positions inside mobile viewport and exposes controls", () => {
    const position = placeTutorialCard({ top: 700, bottom: 744, left: 340, right: 384, width: 44, height: 44 }, { width: 320, height: 180 }, { width: 390, height: 844 });
    expect(position.side).toBe("top"); expect(position.left).toBeGreaterThanOrEqual(8);
    const root = document.createElement("div"), target = document.createElement("button"), onAction = vi.fn();
    target.getBoundingClientRect = () => ({ top: 50, bottom: 90, left: 50, right: 150, width: 100, height: 40 });
    const overlay = createTutorialOverlay({ root, resolveTarget: () => target, onAction });
    overlay.render({ active: { chapter: { title: "Grundlagen" }, step: { id: "intro", kind: "explanation", title: "Signal", body: "Bewege dich.", target: "move" }, stepIndex: 0, stepCount: 2 } });
    expect(root.querySelector('[role="dialog"]')).not.toBeNull();
    root.querySelector('[data-action="next"]').click(); expect(onAction).toHaveBeenCalledWith("next");
    overlay.destroy();
    expect(root.onclick).toBeNull();
  });

  test("paused guidance offers a real resume action", () => {
    const root = document.createElement("div"), onAction = vi.fn();
    const overlay = createTutorialOverlay({ root, resolveTarget: () => null, onAction });
    overlay.render({ active: { paused: true, chapter: { title: "Grundlagen" }, step: { id: "move", kind: "action", title: "Bewegen", body: "Bewege dich." }, stepIndex: 1, stepCount: 2 } });
    const button = root.querySelector('[data-action="resume"]');
    expect(button?.textContent).toBe("FORTSETZEN");
    button.click();
    expect(onAction).toHaveBeenCalledWith("resume");
    overlay.destroy();
  });

  test("optional action steps remain interactive but can continue without context", () => {
    const root = document.createElement("div"), onAction = vi.fn();
    const overlay = createTutorialOverlay({ root, resolveTarget: () => null, onAction });
    overlay.render({ active: { paused: false, chapter: { title: "Navigation" }, step: { id: "buy", kind: "action", optional: true, title: "Kaufen", body: "Kaufe etwas." }, stepIndex: 1, stepCount: 2 } });
    root.querySelector('[data-action="next"]').click();
    expect(onAction).toHaveBeenCalledWith("next");
    overlay.destroy();
  });

  test("re-resolves targets automatically when navigation replaces the screen", async () => {
    const root = document.createElement("div"), target = document.createElement("button");
    document.body.append(root);
    target.getBoundingClientRect = () => ({ top: 20, bottom: 60, left: 20, right: 120, width: 100, height: 40 });
    let visibleTarget = null;
    const overlay = createTutorialOverlay({ root, resolveTarget: () => visibleTarget });
    overlay.render({ active: { chapter: { title: "Navigation" }, step: { id: "map", kind: "action", title: "Karte", body: "Öffne sie.", target: "sector-map" }, stepIndex: 0, stepCount: 1 } });
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(root.querySelector('[data-role="status"]').textContent).toContain("nicht sichtbar");
    visibleTarget = target;
    document.body.append(target);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(root.querySelector('[data-role="status"]').textContent).toBe("");
    overlay.destroy();
    root.remove();
    target.remove();
  });

  test("library offers start, replay and locked explanations", () => {
    const root = document.createElement("div"), onStart = vi.fn();
    renderTutorialLibrary(root, { chapters: [
      { id: "a", title: "A", description: "A", available: true, completed: false },
      { id: "b", title: "B", description: "B", available: true, completed: true },
      { id: "c", title: "C", description: "C", available: false, lockedReason: "Erst entdecken" }
    ], onStart });
    expect(root.textContent).toContain("STARTEN"); expect(root.textContent).toContain("WIEDERHOLEN"); expect(root.textContent).toContain("Erst entdecken");
    root.querySelector('[data-chapter-id="a"]').click(); expect(onStart).toHaveBeenCalledWith("a", "guided");
  });
});
