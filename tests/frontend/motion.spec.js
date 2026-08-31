import { afterEach, describe, expect, test, vi } from "vitest";
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

    // Fire cancel event (Escape)
    const cancelEv = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancelEv);
    expect(cancelEv.defaultPrevented).toBe(true);

    const result = await promise;
    expect(result).toBe(false);
    delete document.documentElement.dataset.reducedMotion;
  });

  test("merchant screen prevents duplicate rerolls during transition", async () => {
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
    rerollBtn.click();
    rerollBtn.click(); // Duplicate click

    expect(onReroll).toHaveBeenCalledOnce();
    delete document.documentElement.dataset.reducedMotion;
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

  test("sector map renders nodes and updates selection state", async () => {
    const { createSectorMapScreen } = await import("../../src/ui/screens/sector-map-screen.js");
    const container = root();
    document.body.appendChild(container);
    const screen = createSectorMapScreen(container, {});

    const mapModel = {
      map: {
        regions: [
          {
            layers: [
              [{ id: "n1", type: "combat", layer: 0, index: 0, regionIndex: 0, informationLevel: 1, danger: 1, reward: "S", corruptionDelta: 0 }],
            ],
          },
        ],
      },
      regionIndex: 0,
      visitedNodeIds: [],
      reachableNodeIds: ["n1"],
    };

    screen.render(mapModel);
    const reachableNode = container.querySelector('[data-node-id="n1"]');
    expect(reachableNode).not.toBeNull();

    // Trigger selection
    reachableNode.click();

    const selectedNode = container.querySelector('[aria-selected="true"]');
    expect(selectedNode).not.toBeNull();
    container.remove();
  });
});
