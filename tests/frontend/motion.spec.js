import { afterEach, describe, expect, test, vi } from "vitest";
import { renderSettingsScreen } from "../../src/ui/screens/settings-screen.js";
import {
  animate,
  animatePanelEnter,
  animateDialogEnter,
  animateDialogExit,
  animateListStagger,
} from "../../src/ui/motion/motion.js";
import * as motionModule from "../../src/ui/motion/motion.js";
import { isReducedMotion } from "../../src/ui/motion/reduced-motion.js";

const root = () => document.createElement("div");

describe("Motion System & Reduced Motion Integration", () => {
  afterEach(() => {
    delete document.documentElement.dataset.reducedMotion;
  });

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

    const { createBuildAnimationController } = await import(
      "../../src/features/ship-assembly/mounting/build-animation-controller.js"
    );

    const controller = createBuildAnimationController({
      reducedMotion: isReducedMotionResolver,
    });

    const anim1 = controller.start("node-1", { workbench: false });
    expect(anim1.duration).toBe(0.8);
    controller.update(0.8);

    reducedMotionSetting = true;

    const anim2 = controller.start("node-2", { workbench: false });
    expect(anim2.duration).toBe(0.3);
  });

  test("isReducedMotion respects documentElement dataset and fallback", () => {
    document.documentElement.dataset.reducedMotion = "true";
    expect(isReducedMotion()).toBe(true);

    document.documentElement.dataset.reducedMotion = "false";
    expect(isReducedMotion()).toBe(false);
    delete document.documentElement.dataset.reducedMotion;
  });

  test("animatePanelEnter handles null and disconnected elements gracefully", () => {
    expect(animatePanelEnter(null)).toBeNull();
    const div = document.createElement("div");
    document.body.appendChild(div);
    const anim = animatePanelEnter(div);
    expect(anim).toBeDefined();
    div.remove();
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
    document.body.appendChild(el1);
    document.body.appendChild(el2);
    const anim = animateListStagger([el1, null, el2]);
    expect(anim).toBeDefined();
    el1.remove();
    el2.remove();
  });

  test("modal dialog intercepts native cancel event to run controlled exit", async () => {
    document.documentElement.dataset.reducedMotion = "true";
    const { uiConfirm } = await import("../../src/ui/components/modal-dialog.js");
    const promise = uiConfirm("Test question");
    const dialog = document.body.querySelector("dialog.vr-modal");
    expect(dialog).not.toBeNull();

    const cancelEv = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancelEv);
    expect(cancelEv.defaultPrevented).toBe(true);

    const result = await promise;
    expect(result).toBe(false);
    delete document.documentElement.dataset.reducedMotion;
  });

  describe("Merchant Screen Lifecycle Tests", () => {
    test("duplicate reroll is prevented", async () => {
      document.documentElement.dataset.reducedMotion = "true";
      const { renderMerchantScreen } = await import("../../src/ui/screens/merchant-screen.js");
      const container = root();
      const onReroll = vi.fn();

      renderMerchantScreen(container, {
        offers: [{ name: "Offer 1", price: 10, currency: "scrap" }],
        resources: { scrap: 100, flux: 100 },
        canReroll: true,
        onReroll,
      });

      const rerollBtn = container.querySelector("[data-reroll]");
      const promise1 = rerollBtn.click();
      const promise2 = rerollBtn.click();

      await Promise.all([promise1, promise2]);

      expect(onReroll).toHaveBeenCalledOnce();
      delete document.documentElement.dataset.reducedMotion;
    });

    test("old offers exit finishes before onReroll callback is invoked", async () => {
      document.documentElement.dataset.reducedMotion = "false";
      const { renderMerchantScreen } = await import("../../src/ui/screens/merchant-screen.js");
      const container = root();
      document.body.appendChild(container);
      const onReroll = vi.fn();

      let resolveExit;
      const controlledExitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });

      const origAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        return {
          finished: controlledExitPromise,
          cancel: () => {},
          pause: () => {},
          play: () => {},
        };
      };

      try {
        renderMerchantScreen(container, {
          offers: [{ name: "Offer 1", price: 10, currency: "scrap" }],
          resources: { scrap: 100, flux: 100 },
          canReroll: true,
          onReroll,
        });

        const rerollBtn = container.querySelector("[data-reroll]");
        const rerollPromise = rerollBtn.click();

        // Assert onReroll has NOT been called while exit animation is pending
        expect(onReroll).not.toHaveBeenCalled();

        // Explicitly complete old-card exit
        resolveExit();
        await controlledExitPromise;
        await vi.waitFor(() => expect(onReroll).toHaveBeenCalledOnce());
      } finally {
        Element.prototype.animate = origAnimate;
        delete document.documentElement.dataset.reducedMotion;
        container.remove();
      }
    });

    test("rejected exit animation restores disabled and pointerEvents if card is not re-added", async () => {
      document.documentElement.dataset.reducedMotion = "false";
      const { createHangarScreen } = await import("../../src/ui/screens/hangar-screen.js");
      const container = root();
      document.body.appendChild(container);

      let exitPromise;
      let rejectExit;

      const origAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        return {
          finished: Promise.resolve(),
          cancel: vi.fn(),
          pause: () => {},
          play: () => {},
        };
      };

      const spy = vi.spyOn(motionModule, "animate").mockImplementation((el) => {
        if (!Array.isArray(el) && el?.dataset?.itemId === "s2") {
          exitPromise = new Promise((_, reject) => {
            rejectExit = reject;
          });
          exitPromise.catch(() => {});
          return { finished: exitPromise, cancel: vi.fn() };
        }
        return { finished: Promise.resolve(), cancel: vi.fn() };
      });

      try {
        const screen = createHangarScreen(container, {
          ships: [
            { id: "s1", slot: "ship", name: "Ship Alpha", unlockSource: "starter" },
            { id: "s2", slot: "ship", name: "Ship Beta", unlockSource: "starter" },
          ],
          weapons: [],
          modules: [],
          reactors: [],
          loadout: { slots: { ship: [null] } },
          isUnlocked: () => true,
        });

        screen.show("Schiffe");
        const cardB = container.querySelector('[data-item-id="s2"]');
        expect(cardB).not.toBeNull();

        // Search for "Alpha" -> s2 begins exit animation
        const searchInput = container.querySelector("[data-catalog-search]");
        searchInput.value = "Alpha";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        expect(cardB.disabled).toBe(true);
        expect(cardB.style.pointerEvents).toBe("none");

        // Reject exit animation without re-adding card
        rejectExit(new Error("Animation aborted"));
        await exitPromise.catch(() => {});
        await vi.waitFor(() => expect(cardB.disabled).toBe(false));

        // Card should no longer be disabled or block pointer events
        expect(cardB.disabled).toBe(false);
        expect(cardB.style.pointerEvents).toBe("");
      } finally {
        spy.mockRestore();
        Element.prototype.animate = origAnimate;
        delete document.documentElement.dataset.reducedMotion;
        container.remove();
      }
    });

    test("leaving during reroll cancels pending onReroll", async () => {
      document.documentElement.dataset.reducedMotion = "false";
      const { renderMerchantScreen } = await import("../../src/ui/screens/merchant-screen.js");
      const container = root();
      document.body.appendChild(container);
      const onReroll = vi.fn();
      const onLeave = vi.fn();

      let resolveExit;
      const controlledExitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });

      const origAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        return {
          finished: controlledExitPromise,
          cancel: () => {},
          pause: () => {},
          play: () => {},
        };
      };

      try {
        renderMerchantScreen(container, {
          offers: [{ name: "Offer 1", price: 10, currency: "scrap" }],
          resources: { scrap: 100, flux: 100 },
          canReroll: true,
          onReroll,
          onLeave,
        });

        const rerollBtn = container.querySelector("[data-reroll]");
        const leaveBtn = container.querySelector("[data-leave]");

        rerollBtn.click();
        expect(onReroll).not.toHaveBeenCalled();

        // Click leave while reroll exit is still pending
        leaveBtn.click();
        expect(onLeave).toHaveBeenCalledOnce();

        // Now complete exit
        resolveExit();
        await controlledExitPromise;
        // Drain microtask queue completely so the async click handler continuation completes
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }

        // Assert onReroll was never called
        expect(onReroll).not.toHaveBeenCalled();
      } finally {
        Element.prototype.animate = origAnimate;
        delete document.documentElement.dataset.reducedMotion;
        container.remove();
      }
    });

    test("reduced motion executes reroll without spatial transition wait", async () => {
      document.documentElement.dataset.reducedMotion = "true";
      const { renderMerchantScreen } = await import("../../src/ui/screens/merchant-screen.js");
      const container = root();
      const onReroll = vi.fn();

      renderMerchantScreen(container, {
        offers: [{ name: "Offer 1", price: 10, currency: "scrap" }],
        resources: { scrap: 100, flux: 100 },
        canReroll: true,
        onReroll,
      });

      const rerollBtn = container.querySelector("[data-reroll]");
      await rerollBtn.click();

      expect(onReroll).toHaveBeenCalledOnce();
      delete document.documentElement.dataset.reducedMotion;
    });
  });

  describe("Hangar Catalog Exit & Race Tests", () => {
    test("rapid remove -> re-add preserves card DOM identity and cancels exit", async () => {
      document.documentElement.dataset.reducedMotion = "false";
      const { createHangarScreen } = await import("../../src/ui/screens/hangar-screen.js");
      const container = root();
      document.body.appendChild(container);

      let resolveExit;
      const controlledExitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });

      const origAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        return {
          finished: controlledExitPromise,
          cancel: vi.fn(),
          pause: () => {},
          play: () => {},
        };
      };

      try {
        const screen = createHangarScreen(container, {
          ships: [
            { id: "s1", slot: "ship", name: "Ship Alpha", unlockSource: "starter" },
            { id: "s2", slot: "ship", name: "Ship Beta", unlockSource: "starter" },
          ],
          weapons: [],
          modules: [],
          reactors: [],
          loadout: { slots: { ship: [null] } },
          isUnlocked: () => true,
        });

        screen.show("Schiffe");
        const cardBBefore = container.querySelector('[data-item-id="s2"]');
        expect(cardBBefore).not.toBeNull();

        // Search for "Alpha" -> s2 (Ship Beta) begins exit
        const searchInput = container.querySelector("[data-catalog-search]");
        searchInput.value = "Alpha";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        // Card B is currently exiting
        expect(cardBBefore.style.pointerEvents).toBe("none");
        expect(cardBBefore.disabled).toBe(true);

        // Before exit completes, filter changes back to match "Ship" -> s2 is required again
        searchInput.value = "Ship";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        const cardBAfter = container.querySelector('[data-item-id="s2"]');

        // Assertions
        expect(cardBAfter).toBe(cardBBefore); // Strict DOM object identity
        expect(cardBAfter.disabled).toBe(false);
        expect(cardBAfter.style.pointerEvents).toBe("");
        expect(cardBAfter.style.opacity).toBe("1");
        expect(cardBAfter.style.transform).toBe("none");

        // Complete stale exit callback
        resolveExit();
        await controlledExitPromise.catch(() => {});

        // Stale completion must not delete card B
        expect(container.querySelector('[data-item-id="s2"]')).toBe(cardBBefore);
      } finally {
        Element.prototype.animate = origAnimate;
        delete document.documentElement.dataset.reducedMotion;
        container.remove();
      }
    });

    test("items -> empty exit lifecycle defers empty state insertion until exit completes", async () => {
      document.documentElement.dataset.reducedMotion = "false";
      const { createHangarScreen } = await import("../../src/ui/screens/hangar-screen.js");
      const container = root();
      document.body.appendChild(container);

      let resolveExit;
      const controlledExitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });

      const origAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        return {
          finished: controlledExitPromise,
          cancel: () => {},
          pause: () => {},
          play: () => {},
        };
      };

      try {
        const screen = createHangarScreen(container, {
          ships: [
            { id: "s1", slot: "ship", name: "Ship Alpha", unlockSource: "starter" },
          ],
          weapons: [],
          modules: [],
          reactors: [],
          loadout: { slots: { ship: [null] } },
          isUnlocked: () => true,
        });

        screen.show("Schiffe");
        const card = container.querySelector('[data-item-id="s1"]');
        expect(card).not.toBeNull();

        // Search for non-matching string -> items -> 0 results
        const searchInput = container.querySelector("[data-catalog-search]");
        searchInput.value = "NonExistent";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        // Card is in exit transition, empty state is not yet present
        expect(container.querySelector("[data-catalog-empty]")).toBeNull();
        expect(card.style.pointerEvents).toBe("none");
        expect(card.disabled).toBe(true);

        // Complete exit
        resolveExit();
        await controlledExitPromise;
        await vi.waitFor(() => expect(container.querySelector("[data-catalog-empty]")).not.toBeNull());

        // Card is removed
        expect(container.querySelector('[data-item-id="s1"]')).toBeNull();
      } finally {
        Element.prototype.animate = origAnimate;
        delete document.documentElement.dataset.reducedMotion;
        container.remove();
      }
    });

    test("empty transition superseded by valid filter does not insert obsolete empty state", async () => {
      document.documentElement.dataset.reducedMotion = "false";
      const { createHangarScreen } = await import("../../src/ui/screens/hangar-screen.js");
      const container = root();
      document.body.appendChild(container);

      let resolveExit;
      const controlledExitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });

      const origAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        return {
          finished: controlledExitPromise,
          cancel: vi.fn(),
          pause: () => {},
          play: () => {},
        };
      };

      try {
        const screen = createHangarScreen(container, {
          ships: [
            { id: "s1", slot: "ship", name: "Ship Alpha", unlockSource: "starter" },
          ],
          weapons: [],
          modules: [],
          reactors: [],
          loadout: { slots: { ship: [null] } },
          isUnlocked: () => true,
        });

        screen.show("Schiffe");

        // Filter -> 0 results
        const searchInput = container.querySelector("[data-catalog-search]");
        searchInput.value = "NonExistent";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        // Immediately change search back to valid results
        searchInput.value = "Alpha";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));

        // Resolve stale empty transition exit
        resolveExit();
        await controlledExitPromise.catch(() => {});
        await Promise.resolve();

        // Valid cards remain and no empty state exists
        expect(container.querySelector('[data-item-id="s1"]')).not.toBeNull();
        expect(container.querySelector("[data-catalog-empty]")).toBeNull();
      } finally {
        Element.prototype.animate = origAnimate;
        delete document.documentElement.dataset.reducedMotion;
        container.remove();
      }
    });
  });

  test("research screen reflects node state transitions", async () => {
    const { renderResearchScreen } = await import("../../src/ui/screens/research-screen.js");
    const container = root();
    const nodes = [
      { id: "r1", branch: "offense", name: "Laser", description: "Dmg", cost: { shards: 10 }, unlocks: [] },
    ];

    renderResearchScreen(container, nodes, {
      purchased: {},
      canPurchase: () => true,
    });
    expect(container.querySelector('[data-state="available"]')).not.toBeNull();

    renderResearchScreen(container, nodes, {
      purchased: { r1: true },
      canPurchase: () => false,
    });
    expect(container.querySelector('[data-state="owned"]')).not.toBeNull();
  });

  test("sector map retains exact DOM node object identity across selection changes", async () => {
    const { createSectorMapScreen } = await import("../../src/ui/screens/sector-map-screen.js");
    const container = root();
    document.body.appendChild(container);
    const screen = createSectorMapScreen(container, {});

    const mapModel = {
      map: {
        regions: [
          {
            layers: [
              [
                { id: "n1", type: "combat", layer: 0, index: 0, regionIndex: 0, informationLevel: 1, danger: 1, reward: "S", corruptionDelta: 0 },
                { id: "n2", type: "combat", layer: 0, index: 1, regionIndex: 0, informationLevel: 1, danger: 1, reward: "S", corruptionDelta: 0 },
              ],
            ],
          },
        ],
      },
      regionIndex: 0,
      visitedNodeIds: [],
      reachableNodeIds: ["n1", "n2"],
    };

    screen.render(mapModel);
    const node1Before = container.querySelector('[data-node-id="n1"]');
    expect(node1Before).not.toBeNull();

    node1Before.click();

    const node1After = container.querySelector('[data-node-id="n1"]');
    expect(node1After).toBe(node1Before);
    expect(node1After.getAttribute("aria-selected")).toBe("true");

    container.remove();
  });

  test("hangar catalog retains exact DOM card object identity and preserves focus", async () => {
    document.documentElement.dataset.reducedMotion = "true";
    const { createHangarScreen } = await import("../../src/ui/screens/hangar-screen.js");
    const container = root();
    document.body.appendChild(container);

    const screen = createHangarScreen(container, {
      ships: [
        { id: "s1", slot: "ship", name: "Ship 1", unlockSource: "starter" },
        { id: "s2", slot: "ship", name: "Ship 2", unlockSource: "starter" },
      ],
      weapons: [],
      modules: [],
      reactors: [],
      loadout: { slots: { ship: [null] } },
      isUnlocked: () => true,
    });

    screen.show("Schiffe");
    const card1Before = container.querySelector('[data-item-id="s1"]');
    expect(card1Before).not.toBeNull();

    card1Before.focus();
    expect(document.activeElement).toBe(card1Before);

    const search = container.querySelector("[data-catalog-search]");
    search.value = "Ship";
    search.dispatchEvent(new Event("input", { bubbles: true }));

    const card1After = container.querySelector('[data-item-id="s1"]');
    expect(card1After).toBe(card1Before);

    container.remove();
  });

  test("research screen state bookkeeping updates under Reduced Motion without replaying stale transitions", async () => {
    const { renderResearchScreen } = await import("../../src/ui/screens/research-screen.js");
    const container = root();
    document.body.appendChild(container);

    const nodes = [
      { id: "r1", branch: "offense", name: "Laser", description: "Dmg", cost: { shards: 10 }, unlocks: [] },
    ];

    document.documentElement.dataset.reducedMotion = "true";
    renderResearchScreen(container, nodes, { purchased: {}, canPurchase: () => false });

    renderResearchScreen(container, nodes, { purchased: {}, canPurchase: () => true });

    delete document.documentElement.dataset.reducedMotion;

    const spy = vi.spyOn(motionModule, "animate");
    renderResearchScreen(container, nodes, { purchased: {}, canPurchase: () => true });

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    container.remove();
  });

  test("two research screen containers maintain isolated transition histories", async () => {
    const { renderResearchScreen } = await import("../../src/ui/screens/research-screen.js");
    const containerA = root();
    const containerB = root();
    const nodes = [{ id: "r1", branch: "offense", name: "Laser", description: "Dmg", cost: {}, unlocks: [] }];

    renderResearchScreen(containerA, nodes, { purchased: { r1: true } });
    renderResearchScreen(containerB, nodes, { purchased: {}, canPurchase: () => true });

    expect(containerA._researchNodeStates.get("r1")).toBe("owned");
    expect(containerB._researchNodeStates.get("r1")).toBe("available");
  });

  test("sector node passes updated node object V2 to selection callback after re-render", async () => {
    const { createSectorMapScreen } = await import("../../src/ui/screens/sector-map-screen.js");
    const container = root();
    document.body.appendChild(container);

    const onSelect = vi.fn();
    const screen = createSectorMapScreen(container, { onSelect });

    const nodeV1 = { id: "n1", type: "combat", layer: 0, index: 0, regionIndex: 0, informationLevel: 1, danger: 1, reward: "Old", corruptionDelta: 0 };
    const nodeV2 = { id: "n1", type: "combat", layer: 0, index: 0, regionIndex: 0, informationLevel: 1, danger: 5, reward: "Updated", corruptionDelta: 0 };

    screen.render({
      map: { regions: [{ layers: [[nodeV1]] }] },
      regionIndex: 0,
      visitedNodeIds: [],
      reachableNodeIds: ["n1"],
    });

    screen.render({
      map: { regions: [{ layers: [[nodeV2]] }] },
      regionIndex: 0,
      visitedNodeIds: [],
      reachableNodeIds: ["n1"],
    });

    const nodeBtn = container.querySelector('[data-node-id="n1"]');
    nodeBtn.click();

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ danger: 5, reward: "Updated" }));
    container.remove();
  });

  test("hangar catalog selection panel cancels stale exit replacing children if new item is selected during exit", async () => {
    document.documentElement.dataset.reducedMotion = "false";
    const { createHangarScreen } = await import("../../src/ui/screens/hangar-screen.js");
    const container = root();
    document.body.appendChild(container);

    let resolveExit;
    const controlledExitPromise = new Promise((resolve) => {
      resolveExit = resolve;
    });

    const origAnimate = Element.prototype.animate;
    Element.prototype.animate = function() {
      return {
        finished: controlledExitPromise,
        cancel: vi.fn(),
        pause: () => {},
        play: () => {},
      };
    };

    try {
      const screen = createHangarScreen(container, {
        ships: [
          { id: "s1", slot: "ship", name: "Ship 1", unlockSource: "starter" },
          { id: "s2", slot: "ship", name: "Ship 2", unlockSource: "starter" },
        ],
        weapons: [],
        modules: [],
        reactors: [],
        loadout: { slots: { ship: [null] } },
        isUnlocked: () => true,
      });

      screen.show("Schiffe");
      const card1 = container.querySelector('[data-item-id="s1"]');
      const card2 = container.querySelector('[data-item-id="s2"]');
      const selection = container.querySelector("[data-catalog-selection]");

      // Select Item 1 -> panel opens
      card1.click();
      expect(selection.hidden).toBe(false);
      expect(selection.textContent).toContain("Ship 1");

      // Close selection -> exit animation starts
      const closeBtn = selection.querySelector("[data-catalog-selection-close]");
      closeBtn.click();
      expect(selection.hidden).toBe(true);

      // Immediately select Item 2 while exit animation for Item 1 is pending
      card2.click();
      expect(selection.hidden).toBe(false);
      expect(selection.textContent).toContain("Ship 2");

      // Complete stale A exit
      resolveExit();
      await controlledExitPromise.catch(() => {});
      await Promise.resolve();

      // Panel must still show Ship 2 content, not hidden and not cleared
      expect(selection.hidden).toBe(false);
      expect(selection.textContent).toContain("Ship 2");
    } finally {
      Element.prototype.animate = origAnimate;
      delete document.documentElement.dataset.reducedMotion;
      container.remove();
    }
  });
});
