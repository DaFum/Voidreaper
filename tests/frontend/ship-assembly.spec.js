import { afterEach, describe, expect, test, vi } from "vitest";
import { createAssemblyCanvasController } from "../../src/ui/ship-assembly/assembly-canvas-controller.js";
import { renderAssemblyInspector } from "../../src/ui/ship-assembly/assembly-inspector-panel.js";
import { attachAssemblyTouchControls } from "../../src/ui/ship-assembly/assembly-touch-controls.js";
import { ASSEMBLY_VIEW_MODES, ASSEMBLY_VIEW_MODE_LABELS, getViewModeOverlay, renderAssemblyToolbar, renderViewModeOverlay } from "../../src/ui/ship-assembly/assembly-view-modes.js";
import { createAssemblyWorkbenchScreen } from "../../src/ui/ship-assembly/assembly-workbench-screen.js";
import { createBlueprintCard } from "../../src/ui/ship-assembly/blueprint-card.js";
import { isBlueprintDetailAction, renderBlueprintDetail } from "../../src/ui/ship-assembly/blueprint-detail-screen.js";
import { renderBlueprintGhostOverlay } from "../../src/ui/ship-assembly/blueprint-ghost-overlay.js";
import { blueprintImportErrorMessage, createBlueprintImportDialog } from "../../src/ui/ship-assembly/blueprint-import-dialog.js";
import { renderBlueprintLibrary } from "../../src/ui/ship-assembly/blueprint-library-screen.js";
import { renderPlacementPreview } from "../../src/ui/ship-assembly/placement-preview-overlay.js";
import { portAccessibilityLabel, renderPortOverlay } from "../../src/ui/ship-assembly/port-overlay.js";
import { createQuickMountOverlay } from "../../src/ui/ship-assembly/quick-mount-overlay.js";
import { encodeBlueprint } from "../../src/features/ship-assembly/blueprints/blueprint-codec.js";

const root = () => document.createElement("div");

// Canvas-Overlays bekommen einen aufzeichnenden 2D-Kontext, weil happy-dom kein echtes Canvas rendert.
function fakeContext() {
  const calls = [];
  const record = name => (...args) => { calls.push([name, ...args]); };
  return {
    calls,
    canvas: { width: 480, height: 240 },
    globalAlpha: 1, lineWidth: 1, strokeStyle: "", fillStyle: "", font: "", lineDashOffset: 0,
    save: record("save"), restore: record("restore"), beginPath: record("beginPath"), stroke: record("stroke"),
    fill: record("fill"), moveTo: record("moveTo"), lineTo: record("lineTo"), arc: record("arc"),
    closePath: record("closePath"), translate: record("translate"), rotate: record("rotate"),
    setLineDash: record("setLineDash"), fillText: record("fillText"), clearRect: record("clearRect"),
    setTransform: record("setTransform"), rect: record("rect"), clip: record("clip"),
    count: name => calls.filter(([call]) => call === name).length
  };
}

describe("assembly canvas controller", () => {
  const makeCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.setPointerCapture = () => {};
    return canvas;
  };

  test("zoom is clamped, pan accumulates and resetView restores the camera", () => {
    const controller = createAssemblyCanvasController({ canvas: makeCanvas() });
    controller.zoomBy(5);
    expect(controller.camera.zoom).toBe(1.8);
    controller.zoomBy(-5);
    expect(controller.camera.zoom).toBe(.55);
    controller.panBy(10, -4);
    controller.rotateBy(.5);
    expect(controller.camera.offset).toEqual({ x: 10, y: -4 });
    expect(controller.camera.rotation).toBe(.5);
    controller.resetView();
    expect(controller.camera).toMatchObject({ rotation: 0, zoom: 1, offset: { x: 0, y: 0 } });
  });

  test("screenToWorld converts through zoom and offset", () => {
    const canvas = makeCanvas();
    canvas.getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 100 });
    const controller = createAssemblyCanvasController({ canvas, camera: { rotation: 0, zoom: 2, offset: { x: 5, y: -5 } } });
    expect(controller.screenToWorld(300, 150)).toEqual({ x: 45, y: 30 });
  });

  test("wheel events zoom against the scroll direction and destroy detaches listeners", () => {
    const canvas = makeCanvas();
    const controller = createAssemblyCanvasController({ canvas });
    canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: -120, cancelable: true }));
    expect(controller.camera.zoom).toBeCloseTo(1.08);
    controller.destroy();
    canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: -120, cancelable: true }));
    expect(controller.camera.zoom).toBeCloseTo(1.08);
  });

  test("pan tracks a single pointer and releases on pointercancel", () => {
    const canvas = makeCanvas();
    const controller = createAssemblyCanvasController({ canvas });
    canvas.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, clientX: 0, clientY: 0 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 10, clientY: 0 }));
    expect(controller.camera.offset.x).toBeCloseTo(10);
    // a second finger must not hijack the drag or cause pan jumps
    canvas.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 2, clientX: 100, clientY: 100 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { pointerId: 2, clientX: 130, clientY: 100 }));
    expect(controller.camera.offset.x).toBeCloseTo(10);
    // a browser-cancelled touch drag ends the pan instead of leaving it stuck
    canvas.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1 }));
    canvas.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 50, clientY: 50 }));
    expect(controller.camera.offset).toEqual({ x: 10, y: 0 });
  });
});

describe("assembly inspector panel", () => {
  test("shows an empty state without selection and disables all actions", () => {
    const panel = root();
    renderAssemblyInspector(panel, {});
    expect(panel.innerHTML).toContain("KEINE AUSWAHL");
    expect(panel.innerHTML).toContain("Wähle ein Modul");
    for (const button of panel.querySelectorAll("[data-action]")) expect(button.disabled).toBe(true);
  });

  test("renders node details, deltas, warnings and enabled actions", () => {
    const panel = root();
    renderAssemblyInspector(panel, { node: { definitionId: "core-x" }, deltas: [["MASSE", 12]], warnings: ["Überlast"], actions: { rotate: true, dismantle: true } });
    expect(panel.innerHTML).toContain("VERBAUTES MODUL");
    expect(panel.innerHTML).toContain("core-x");
    expect(panel.innerHTML).toContain("MASSE");
    expect(panel.innerHTML).toContain("Überlast");
    expect(panel.querySelector('[data-action="rotate"]').disabled).toBe(false);
    expect(panel.querySelector('[data-action="move-branch"]').disabled).toBe(true);
    expect(panel.querySelector('[data-action="dismantle"]').disabled).toBe(false);
  });

  test("escapes untrusted headings", () => {
    const panel = root();
    renderAssemblyInspector(panel, { title: "<img src=x>" });
    expect(panel.innerHTML).not.toContain("<img");
    expect(panel.innerHTML).toContain("&lt;img");
  });
});

describe("assembly touch controls", () => {
  afterEach(() => vi.useRealTimers());
  const touch = (type, x, y) => Object.assign(new Event(type), { clientX: x, clientY: y });

  test("horizontal swipes page between positions", () => {
    const element = root(), onNext = vi.fn(), onPrevious = vi.fn(), onSelect = vi.fn();
    attachAssemblyTouchControls(element, { onNext, onPrevious, onSelect });
    element.dispatchEvent(touch("touchstart", 200, 100));
    element.dispatchEvent(touch("touchend", 100, 100));
    expect(onNext).toHaveBeenCalledOnce();
    element.dispatchEvent(touch("touchstart", 100, 100));
    element.dispatchEvent(touch("touchend", 200, 108));
    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("a short tap selects, a long press opens details", () => {
    vi.useFakeTimers();
    const element = root(), onSelect = vi.fn(), onDetails = vi.fn();
    attachAssemblyTouchControls(element, { onSelect, onDetails });
    element.dispatchEvent(touch("touchstart", 50, 50));
    element.dispatchEvent(touch("touchend", 52, 51));
    expect(onSelect).toHaveBeenCalledOnce();

    element.dispatchEvent(touch("touchstart", 50, 50));
    vi.advanceTimersByTime(520);
    expect(onDetails).toHaveBeenCalledOnce();
  });

  test("movement cancels the long press and detach removes all handlers", () => {
    vi.useFakeTimers();
    const element = root(), onDetails = vi.fn(), onSelect = vi.fn();
    const detach = attachAssemblyTouchControls(element, { onDetails, onSelect });
    element.dispatchEvent(touch("touchstart", 50, 50));
    element.dispatchEvent(touch("touchmove", 80, 50));
    vi.advanceTimersByTime(600);
    expect(onDetails).not.toHaveBeenCalled();

    detach();
    element.dispatchEvent(touch("touchstart", 50, 50));
    element.dispatchEvent(touch("touchend", 50, 50));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("assembly view modes", () => {
  test("toolbar renders every mode with pressed state and reports clicks", () => {
    const container = root(), onChange = vi.fn();
    renderAssemblyToolbar(container, ASSEMBLY_VIEW_MODES.ENERGY, onChange);
    const buttons = [...container.querySelectorAll("[data-mode]")];
    expect(buttons.map(button => button.dataset.mode)).toEqual(Object.values(ASSEMBLY_VIEW_MODES));
    expect(buttons.find(button => button.dataset.mode === "energy").getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0].textContent).toBe(ASSEMBLY_VIEW_MODE_LABELS.normal);
    buttons.find(button => button.dataset.mode === "damage").click();
    expect(onChange).toHaveBeenCalledWith("damage");
  });

  test("getViewModeOverlay derives per-mode overlays from the geometry snapshot", () => {
    const geometry = {
      connections: [{ cable: { energyClass: "high", from: { x: 0, y: 0 }, to: { x: 4, y: 0 } } }],
      nodes: [
        { isRoot: true, worldPosition: { x: 0, y: 0 } },
        { isRoot: false, worldPosition: { x: 5, y: 5 }, parentPortId: "p1", armorIntegrity: 7.4, coreIntegrity: 2.6 }
      ]
    };
    const assembly = { portsById: { p1: { branchDepth: 2 } } };

    const structure = getViewModeOverlay(ASSEMBLY_VIEW_MODES.STRUCTURE, { assembly, geometry });
    expect(structure.labels.map(label => label.text)).toEqual(["KERN", "T2"]);

    const energy = getViewModeOverlay(ASSEMBLY_VIEW_MODES.ENERGY, { geometry });
    expect(energy.connections[0].label).toBe("high");

    const damage = getViewModeOverlay(ASSEMBLY_VIEW_MODES.DAMAGE, { geometry });
    expect(damage.labels[1].text).toBe("7A / 3C");

    const flight = getViewModeOverlay(ASSEMBLY_VIEW_MODES.FLIGHT, { flightProfile: { centerOfMass: { x: 1, y: 2 }, thrustVectors: [], totalMass: 88 } });
    expect(flight.centerOfMass).toEqual({ x: 1, y: 2 });
    expect(flight.labels[0].text).toBe("MASSE 88");

    expect(getViewModeOverlay(ASSEMBLY_VIEW_MODES.NORMAL, {})).toEqual({});
  });

  test("renderViewModeOverlay draws connections, labels, center of mass and thrust vectors", () => {
    const ctx = fakeContext();
    renderViewModeOverlay(ctx, {
      connections: [{ cable: { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } }, label: "high" }, { spine: {} }],
      labels: [{ position: { x: 1, y: 1 }, text: "KERN" }],
      centerOfMass: { x: 3, y: 3 },
      thrustVectors: [{ position: { x: 0, y: 0 }, direction: { x: 0, y: 1 }, strength: 1 }]
    });
    expect(ctx.count("stroke")).toBe(3);
    expect(ctx.calls.filter(([name]) => name === "fillText").map(call => call[1])).toEqual(["high", "KERN", "COM"]);
    expect(ctx.count("save")).toBe(ctx.count("restore"));
  });
});

describe("assembly workbench screen", () => {
  test("builds the workbench layout and forwards data-action clicks until destroyed", () => {
    const container = root(), onAction = vi.fn();
    const screen = createAssemblyWorkbenchScreen(container, { onAction });
    expect(screen.canvas.tagName.toLowerCase()).toBe("canvas");
    expect(container.querySelector('[aria-label="Schiffswerkbank"]')).not.toBeNull();

    container.querySelector('[data-action="zoom-in"]').click();
    expect(onAction).toHaveBeenCalledWith("zoom-in", expect.anything());

    screen.destroy();
    container.querySelector('[data-action="zoom-out"]').click();
    expect(onAction).toHaveBeenCalledOnce();
  });

  test("renderInventory lists items with selection state and an empty fallback", () => {
    const screen = createAssemblyWorkbenchScreen(root(), {});
    screen.renderInventory([
      { instanceId: "i1", label: "Coil", sizeClass: "M", stored: true },
      { instanceId: "i2", definitionId: "def-2" }
    ], "i1");
    const buttons = [...screen.root.querySelectorAll('[data-action="select-item"]')];
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0].innerHTML).toContain("EINGELAGERT");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1].innerHTML).toContain("def-2");

    screen.renderInventory([]);
    expect(screen.root.innerHTML).toContain("Keine losen Module.");
  });

  test("renderPorts distinguishes free and occupied ports and marks the selection", () => {
    const screen = createAssemblyWorkbenchScreen(root(), {});
    screen.renderPorts([
      { portId: "p1", label: "Backbord", sizeClass: "M", position: { x: 10, y: -6 }, reasonText: "belegt durch Kern" },
      { portId: "p2", label: "Steuerbord", sizeClass: "S", occupiedByNodeId: "n1", position: { x: NaN } }
    ], { selectedNodeId: "n1" });
    const [free, occupied] = [...screen.portsLayer.querySelectorAll("button")];
    expect(free.dataset.action).toBe("select-port");
    expect(free.getAttribute("title")).toBe("belegt durch Kern");
    expect(free.style.left).toContain("10px");
    expect(occupied.dataset.action).toBe("select-node");
    expect(occupied.dataset.id).toBe("n1");
    expect(occupied.className).toContain("assembly-port--selected");
    expect(occupied.getAttribute("aria-label")).toContain("Modul auswählen");
    expect(occupied.style.left).toContain("0px");
  });

  test("setHint updates the live region and setInspector swaps panel content", () => {
    const screen = createAssemblyWorkbenchScreen(root(), {});
    screen.setHint("Port wählen");
    expect(screen.root.querySelector('[data-role="hint"]').textContent).toBe("Port wählen");
    screen.setHint(null);
    expect(screen.root.querySelector('[data-role="hint"]').textContent).toBe("");

    const content = document.createElement("p");
    content.textContent = "Inspector";
    screen.setInspector(content);
    expect(screen.root.querySelector('[data-role="inspector"]').textContent).toBe("Inspector");
  });
});

describe("blueprint card", () => {
  const blueprint = { blueprintId: "bp-1", name: "Reißzahn", shipFrameId: "frame-a", nodes: [{}, {}], favorite: false, usage: { highestAbyssDepth: 4 } };

  test("renders metadata, rejects unsafe thumbnails and wires open/favorite", () => {
    const onOpen = vi.fn(), onFavorite = vi.fn();
    const card = createBlueprintCard({ ...blueprint, thumbnailDataUrl: "javascript:alert(1)" }, { onOpen, onFavorite });
    expect(card.innerHTML).toContain("NO // THUMB");
    expect(card.innerHTML).toContain("2 KNOTEN");
    expect(card.innerHTML).toContain("ABYSS 4");
    card.querySelector(".blueprint-card__open").click();
    expect(onOpen).toHaveBeenCalledWith("bp-1");
    card.querySelector(".blueprint-card__favorite").click();
    expect(onFavorite).toHaveBeenCalledWith("bp-1", true);
  });

  test("accepts safe data-url thumbnails and reflects the favorite state", () => {
    const card = createBlueprintCard({ ...blueprint, favorite: true, thumbnailDataUrl: "data:image/png;base64,AAAA" });
    expect(card.querySelector("img").getAttribute("src")).toBe("data:image/png;base64,AAAA");
    expect(card.querySelector(".blueprint-card__favorite").getAttribute("aria-pressed")).toBe("true");
  });
});

describe("blueprint detail screen", () => {
  const blueprint = { blueprintId: "bp-1", name: "Detail", shipFrameId: "frame-a", nodes: [] };

  test("renders all actions, disables activate for the active template and reports actions", () => {
    const container = root(), onAction = vi.fn();
    renderBlueprintDetail(container, { blueprint, active: true, onAction });
    expect(container.innerHTML).toContain("AKTIVE VORLAGE");
    expect(container.querySelector('[data-action="activate"]').disabled).toBe(true);
    container.querySelector('[data-action="export"]').click();
    expect(onAction).toHaveBeenCalledWith("export", blueprint);
    container.querySelector('[data-action="back"]').click();
    expect(onAction).toHaveBeenCalledWith("back", blueprint);
  });

  test("isBlueprintDetailAction whitelists detail actions", () => {
    expect(isBlueprintDetailAction("delete")).toBe(true);
    expect(isBlueprintDetailAction("hack")).toBe(false);
  });
});

describe("blueprint ghost overlay", () => {
  test("draws one triangle per ghost with match-dependent alpha", () => {
    const ctx = fakeContext();
    renderBlueprintGhostOverlay(ctx, [
      { position: { x: 0, y: 0 }, rotation: .3, size: 10, match: "exact" },
      { position: { x: 5, y: 5 }, size: 8, match: "unknown-match" }
    ]);
    expect(ctx.count("stroke")).toBe(2);
    expect(ctx.count("closePath")).toBe(2);
    expect(ctx.count("save")).toBe(ctx.count("restore"));
  });
});

describe("blueprint import dialog", () => {
  test("maps codec errors to an actionable message", () => {
    expect(blueprintImportErrorMessage(new Error("Ungültiges Bauplanformat"))).toBe("Ungültiges Bauplanformat");
    expect(blueprintImportErrorMessage(new Error("boom"))).toBe("Der Bauplan-Code ist beschädigt oder unvollständig.");
    expect(blueprintImportErrorMessage(null)).toBe("Der Bauplan-Code ist beschädigt oder unvollständig.");
  });

  test("rejects broken codes and keeps the import button disabled", () => {
    const container = root();
    createBlueprintImportDialog(container, { validate: () => ({ valid: true, issues: [] }) });
    container.querySelector("textarea").value = "kein base64url!!";
    container.querySelector('[data-action="inspect"]').click();
    expect(container.querySelector('[data-role="report"]').textContent).toContain("Bauplanformat");
    expect(container.querySelector('[data-action="import"]').disabled).toBe(true);
  });

  test("validates a real encoded blueprint, lists issues and imports the validated result", () => {
    const container = root();
    const decoded = { blueprintVersion: 3, shipFrameId: "frame-a", nodes: [], connections: [], visualVariants: [] };
    const validate = vi.fn(() => ({ valid: true, issues: [{ type: "unknown-definition", definitionId: "old-mod" }], blueprint: decoded }));
    const onImport = vi.fn();
    createBlueprintImportDialog(container, { validate, onImport });
    container.querySelector("textarea").value = encodeBlueprint({ blueprintVersion: 3, shipFrameId: "frame-a", nodes: [], connections: [], visualVariants: [] });
    container.querySelector('[data-action="inspect"]').click();
    expect(validate).toHaveBeenCalledWith(expect.objectContaining({ shipFrameId: "frame-a" }));
    expect(container.querySelector('[data-role="report"]').textContent).toContain("VALIDIERT");
    expect(container.querySelector('[data-role="report"]').textContent).toContain("unknown-definition: old-mod");

    const importButton = container.querySelector('[data-action="import"]');
    expect(importButton.disabled).toBe(false);
    importButton.click();
    expect(onImport).toHaveBeenCalledWith(decoded);
  });

  test("editing the code after validation invalidates the stale result", () => {
    const container = root();
    const decoded = { blueprintVersion: 3, shipFrameId: "frame-a", nodes: [], connections: [], visualVariants: [] };
    const onImport = vi.fn();
    createBlueprintImportDialog(container, { validate: () => ({ valid: true, issues: [], blueprint: decoded }), onImport });
    const textarea = container.querySelector("textarea");
    textarea.value = encodeBlueprint(decoded);
    container.querySelector('[data-action="inspect"]').click();
    const importButton = container.querySelector('[data-action="import"]');
    expect(importButton.disabled).toBe(false);

    textarea.value = "etwas anderes";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    expect(importButton.disabled).toBe(true);
    expect(container.querySelector('[data-role="report"]').textContent).toBe("");
    importButton.click();
    expect(onImport).not.toHaveBeenCalled();
  });

  test("keeps invalid results non-importable", () => {
    const container = root();
    createBlueprintImportDialog(container, { validate: () => ({ valid: false, issues: [{ type: "missing-root" }] }) });
    container.querySelector("textarea").value = encodeBlueprint({ blueprintVersion: 3, shipFrameId: null, nodes: [], connections: [], visualVariants: [] });
    container.querySelector('[data-action="inspect"]').click();
    expect(container.querySelector('[data-role="report"]').textContent).toContain("NICHT VERWENDBAR");
    expect(container.querySelector('[data-action="import"]').disabled).toBe(true);
  });
});

describe("blueprint library screen", () => {
  test("renders a card per blueprint and wires import/create", () => {
    const container = root(), onImport = vi.fn(), onCreate = vi.fn(), onOpen = vi.fn();
    renderBlueprintLibrary(container, { blueprints: [{ blueprintId: "bp-1", name: "Eins", shipFrameId: "f", nodes: [] }], onImport, onCreate, onOpen });
    expect(container.querySelectorAll(".blueprint-card")).toHaveLength(1);
    container.querySelector('[data-action="import"]').click();
    container.querySelector('[data-action="create"]').click();
    expect(onImport).toHaveBeenCalledOnce();
    expect(onCreate).toHaveBeenCalledOnce();
    container.querySelector(".blueprint-card__open").click();
    expect(onOpen).toHaveBeenCalledWith("bp-1");
  });

  test("shows the empty archive state without blueprints", () => {
    const container = root();
    renderBlueprintLibrary(container, { blueprints: [] });
    expect(container.innerHTML).toContain("KEINE SIGNALSTRUKTUREN");
  });
});

describe("placement preview overlay", () => {
  test("clears the canvas, renders the ship and highlights the suggested transform", () => {
    const ctx = fakeContext();
    const assemblyRenderer = { renderPlayerShip: vi.fn() };
    renderPlacementPreview(ctx, { snapshot: { id: "snap" }, suggestion: { transform: { position: { x: 10, y: 5 }, rotation: 1 } }, assemblyRenderer, time: 2 });
    expect(ctx.count("clearRect")).toBe(1);
    expect(assemblyRenderer.renderPlayerShip).toHaveBeenCalledWith(ctx, expect.objectContaining({ geometrySnapshot: { id: "snap" } }));
    expect(ctx.count("arc")).toBe(1);
    expect(ctx.count("save")).toBe(ctx.count("restore"));
  });

  test("skips the suggestion marker without a transform", () => {
    const ctx = fakeContext();
    renderPlacementPreview(ctx, { snapshot: {}, suggestion: null, assemblyRenderer: { renderPlayerShip: () => {} } });
    expect(ctx.count("arc")).toBe(0);
  });
});

describe("port overlay", () => {
  test("accessibility label describes size, mount, energy, load and state", () => {
    const port = { sizeClass: "M", mountType: "hardpoint", energyClass: "high", loadCapacity: 6 };
    expect(portAccessibilityLabel(port, null)).toBe("M-Port, hardpoint, Energie high, Traglast 6, verfügbar");
    expect(portAccessibilityLabel({ ...port, occupiedByNodeId: "n1" }, null)).toContain("belegt");
    expect(portAccessibilityLabel(port, { compatible: false, reasonLabels: ["zu groß"] })).toContain("inkompatibel: zu groß");
  });

  test("renders each port and dims incompatible ones", () => {
    const ctx = fakeContext();
    const alphas = [];
    Object.defineProperty(ctx, "globalAlpha", { set: value => alphas.push(value), get: () => 1 });
    renderPortOverlay(ctx, [
      { portId: "p1", sizeClass: "M", energyClass: "medium", loadCapacity: 4, worldPosition: { x: 1, y: 2 } },
      { portId: "p2", sizeClass: "S", energyClass: "low", loadCapacity: 4, localPosition: { x: 0, y: 0 } }
    ], { selectedPortId: "p1", compatibilityByPortId: { p2: { compatible: false } } });
    expect(ctx.count("save")).toBe(ctx.count("restore"));
    expect(alphas).toContain(.27);
    expect(alphas).toContain(1);
  });
});

describe("quick mount overlay", () => {
  test("renders the dialog scaffold and forwards footer actions", () => {
    const container = root(), onAction = vi.fn();
    const overlay = createQuickMountOverlay(container, { onAction });
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(overlay.canvas).not.toBeNull();
    container.querySelector('[data-action="confirm"]').click();
    container.querySelector('[data-action="defer"]').click();
    expect(onAction).toHaveBeenNthCalledWith(1, "confirm");
    expect(onAction).toHaveBeenNthCalledWith(2, "defer");
  });

  test("render fills name, reasons, capped deltas and details", () => {
    const overlay = createQuickMountOverlay(root(), {});
    overlay.render({ name: "Void Coil", reasons: ["Grund A", "Grund B", "Grund C"], deltas: Array.from({ length: 8 }, (_, index) => [`K${index}`, `V${index}`]), details: ["D1", "D2"] });
    expect(overlay.root.querySelector('[data-role="module-name"]').textContent).toBe("Void Coil");
    expect(overlay.root.querySelector('[data-role="reason"]').textContent).toBe("Grund A · Grund B");
    expect(overlay.root.querySelectorAll('[data-role="deltas"] div')).toHaveLength(6);
    expect(overlay.root.querySelector('[data-role="details"]').textContent).toBe("D1 · D2");
  });

  test("falls back to the structural-compatibility hint without reasons", () => {
    const overlay = createQuickMountOverlay(root(), {});
    overlay.render({ name: "X", reasons: [] });
    expect(overlay.root.querySelector('[data-role="reason"]').textContent).toBe("Strukturell kompatibel");
  });
});
