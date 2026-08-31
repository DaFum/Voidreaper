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
    rerollBtn.click();

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
});
