import { describe, expect, test, vi } from "vitest";
import { escapeHtml, safeImageDataUrl } from "../../src/ui/escape-html.js";
import { createDifficultySelector } from "../../src/ui/components/difficulty-selector.js";
import { createItemCard } from "../../src/ui/components/item-card.js";
import { renderItemComparison } from "../../src/ui/components/item-comparison.js";
import { updateResourceMeters } from "../../src/ui/components/resource-meters.js";
import { createSectorMapConnections } from "../../src/ui/components/sector-map-connections.js";
import { createSectorNode, isSectorNodeInteractive } from "../../src/ui/components/sector-node.js";
import { renderStatBreakdown } from "../../src/ui/components/stat-breakdown.js";
import { renderSynergyList } from "../../src/ui/components/synergy-list.js";
import { createTutorialCallout } from "../../src/ui/components/tutorial-callout.js";

const root = () => document.createElement("div");

describe("escape-html", () => {
  test("escapeHtml escapes every dangerous character and tolerates nullish input", () => {
    expect(escapeHtml(`<b a="1" b='2'>&`)).toBe("&lt;b a=&quot;1&quot; b=&#39;2&#39;&gt;&amp;");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(42)).toBe("42");
  });

  test("safeImageDataUrl only accepts base64 image data urls", () => {
    expect(safeImageDataUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    expect(safeImageDataUrl("data:image/webp;base64,AAAA==")).toBe("data:image/webp;base64,AAAA==");
    expect(safeImageDataUrl("javascript:alert(1)")).toBeNull();
    expect(safeImageDataUrl("data:text/html;base64,AAAA")).toBeNull();
    expect(safeImageDataUrl(123)).toBeNull();
  });
});

describe("difficulty selector", () => {
  test("marks the initial value as pressed and moves the pressed state on click", () => {
    const onChange = vi.fn();
    const selector = createDifficultySelector({ value: "standard", onChange });
    const buttons = [...selector.children];
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    const pressed = buttons.filter(button => button.getAttribute("aria-pressed") === "true");
    expect(pressed.map(button => button.textContent)).toEqual(["Standard"]);

    const reaper = buttons.find(button => button.textContent === "Reaper");
    reaper.click();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: "reaper" }));
    expect(reaper.getAttribute("aria-pressed")).toBe("true");
    expect(buttons.filter(button => button.getAttribute("aria-pressed") === "true")).toHaveLength(1);
  });
});

describe("item card", () => {
  test("renders slot, name, tags and energy cost", () => {
    const card = createItemCard({ id: "mod-1", slot: "module", name: "Void Coil", description: "Desc", tags: [{ id: "Void" }, { id: "Heat" }], energyCost: 3 });
    expect(card.dataset.itemId).toBe("mod-1");
    expect(card.innerHTML).toContain("Void Coil");
    expect(card.innerHTML).toContain("<i>Void</i>");
    expect(card.innerHTML).toContain("3 E");
    expect(card.disabled).toBe(false);
    expect(card.hasAttribute("aria-pressed")).toBe(false);
  });

  test("locked cards are disabled and selected cards carry aria-pressed", () => {
    const card = createItemCard({ id: "x", slot: "s", name: "n" }, { selected: true, locked: true });
    expect(card.disabled).toBe(true);
    expect(card.hasAttribute("aria-pressed")).toBe(true);
  });
});

describe("item comparison", () => {
  const inspect = () => ({ capacity: 10, reserved: 4, load: { ratio: .5, tier: "stable" }, expectedHeat: 12, startingCorruption: 3, tags: new Map([["Void", 2]]) });

  test("compares against zeroed baseline when nothing is equipped", () => {
    const container = root();
    renderItemComparison(container, null, { name: "Neu", faultProfileId: "fp-1" }, inspect);
    expect(container.innerHTML).toContain("Neu");
    expect(container.innerHTML).toContain("0% → 50%");
    expect(container.innerHTML).toContain("fp-1");
  });

  test("uses the equipped item as baseline when present", () => {
    const container = root();
    renderItemComparison(container, { id: "old" }, { definition: { name: "Def", faultProfileId: "fp-2" } }, inspect);
    expect(container.innerHTML).toContain("50% → 50%");
    expect(container.innerHTML).toContain("Def");
    expect(container.innerHTML).toContain("fp-2");
  });
});

describe("resource meters", () => {
  const meterDom = () => {
    const container = root();
    container.innerHTML = ["energy", "heat", "corruption", "load"].map(name => `<div data-resource="${name}"><b></b></div>`).join("");
    return container;
  };

  test("fills meters and writes tier attributes", () => {
    const container = meterDom();
    updateResourceMeters(container, { energy: { value: 30, maximum: 60 }, heat: 90, corruption: 60, load: { ratio: .8, tier: "strained" }, scrap: 7, flux: 2 });
    expect(container.querySelector('[data-resource="energy"]').style.getPropertyValue("--fill")).toBe("50%");
    expect(container.querySelector('[data-resource="heat"] b').textContent).toBe("90°");
    expect(container.querySelector('[data-resource="load"] b').textContent).toBe("80% STRAINED");
    expect(container.getAttribute("data-scrap")).toBe("7");
    expect(container.getAttribute("data-flux")).toBe("2");
    expect(container.getAttribute("data-heat-tier")).toBe("unstable");
    expect(container.getAttribute("data-corruption-tier")).toBe("breach");
    expect(container.getAttribute("data-load-tier")).toBe("strained");
  });

  test("clamps overload and marks extreme tiers", () => {
    const container = meterDom();
    updateResourceMeters(container, { energy: { value: 0, maximum: 0 }, heat: 120, corruption: 120, load: { ratio: 2.4, tier: "collapse" } });
    expect(container.getAttribute("data-heat-tier")).toBe("overheated");
    expect(container.getAttribute("data-corruption-tier")).toBe("abyssal");
    expect(container.querySelector('[data-resource="load"]').style.getPropertyValue("--fill")).toBe("100%");
  });

  test("tolerates a missing root and missing meters", () => {
    expect(() => updateResourceMeters(null, { energy: { value: 1, maximum: 2 }, heat: 0, corruption: 0, load: null })).not.toThrow();
    expect(() => updateResourceMeters(root(), { energy: { value: 1, maximum: 2 }, heat: 0, corruption: 0 })).not.toThrow();
  });
});

describe("sector map connections", () => {
  test("draws one svg path per next-link and cleans up on destroy", () => {
    const container = root();
    document.body.append(container);
    const elements = ["a", "b", "c"].map(id => {
      const element = document.createElement("button");
      element.dataset.nodeId = id;
      container.append(element);
      return element;
    });
    const nodes = [{ id: "a", next: ["b", "c"] }, { id: "b", next: ["c"] }, { id: "c", next: ["missing"] }];
    const connections = createSectorMapConnections(nodes, elements);
    connections.refresh();
    const svg = container.querySelector("svg.sector-map__connections");
    expect(svg).not.toBeNull();
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    const paths = [...svg.querySelectorAll("path")];
    expect(paths).toHaveLength(3);
    expect(paths.map(path => `${path.dataset.sourceId}→${path.dataset.targetId}`)).toEqual(["a→b", "a→c", "b→c"]);
    connections.destroy();
    expect(container.querySelector("svg")).toBeNull();
    container.remove();
  });

  test("returns a no-op api when no node elements exist", () => {
    const connections = createSectorMapConnections([], []);
    expect(() => { connections.refresh(); connections.destroy(); }).not.toThrow();
  });
});

describe("sector node", () => {
  const node = { id: "n1", type: "elite", layer: 1, index: 2, informationLevel: 1, danger: 3, regionId: "furnace-expanse", reward: "Flux", corruptionDelta: 5 };

  test("only reachable nodes are interactive", () => {
    expect(isSectorNodeInteractive("reachable")).toBe(true);
    expect(isSectorNodeInteractive("visited")).toBe(false);
    expect(isSectorNodeInteractive("locked")).toBe(false);
  });

  test("renders a known node with type label, grid placement and click wiring", () => {
    const onSelect = vi.fn();
    const button = createSectorNode(node, { status: "reachable", selected: true, onSelect });
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.style.gridColumn).toBe("2");
    expect(button.style.gridRow).toBe("5");
    expect(button.innerHTML).toContain("Elite-Signal");
    expect(button.innerHTML).toContain("furnace expanse");
    expect(button.innerHTML).toContain("Korr. +5");
    button.click();
    expect(onSelect).toHaveBeenCalledWith(node, true);
  });

  test("hides details for unscouted nodes and disables locked nodes", () => {
    const button = createSectorNode({ ...node, informationLevel: 0 }, { status: "locked", selected: false, onSelect: () => {} });
    expect(button.disabled).toBe(true);
    expect(button.innerHTML).toContain("UNBEKANNTE SIGNATUR");
    const visited = createSectorNode({ ...node, informationLevel: 0 }, { status: "visited", selected: false, onSelect: () => {} });
    expect(visited.innerHTML).toContain("Elite-Signal");
  });
});

describe("stat breakdown", () => {
  test("formats percent, multiplier, integer and contribution operations", () => {
    const container = root();
    renderStatBreakdown(container, [
      { definition: { displayName: "Crit", displayFormat: "percent" }, result: { value: .25, baseValue: .1, contributions: [{ sourceId: "mod", operation: "add", value: 5 }, { sourceId: "aura", operation: "multiply", value: 1.5 }, { sourceId: "cap", operation: "clamp", value: [0, 10] }] } },
      { definition: { displayName: "Speed", displayFormat: "multiplier" }, result: { value: 1.5, baseValue: 1, contributions: [] } },
      { definition: { displayName: "Armor", displayFormat: "integer" }, result: { value: 12.6, baseValue: 12.6, contributions: [] } }
    ]);
    expect(container.innerHTML).toContain("25%");
    expect(container.innerHTML).toContain("×1.50");
    expect(container.innerHTML).toContain("13");
    expect(container.innerHTML).toContain("+5");
    expect(container.innerHTML).toContain("0…10");
  });
});

describe("synergy list", () => {
  test("orders active, near and blocked entries and lists missing requirements", () => {
    const container = root();
    renderSynergyList(container, {
      active: [{ name: "Aktiv" }],
      near: [{ name: "Nah", missing: [{ id: "Void", minimum: 3 }] }],
      blocked: [{ name: "Blockiert" }]
    });
    const entries = [...container.querySelectorAll(".synergy-entry")];
    expect(entries.map(entry => entry.dataset.state)).toEqual(["active", "near", "blocked"]);
    expect(entries[1].innerHTML).toContain("Fehlt: Void 3");
  });

  test("shows an empty state when no synergies are known", () => {
    const container = root();
    renderSynergyList(container, { active: [], near: [], blocked: [] });
    expect(container.innerHTML).toContain("Noch keine bekannte Synergie.");
  });
});

describe("tutorial callout", () => {
  test("renders step text and wires dismiss/skip", () => {
    const onDismiss = vi.fn(), onSkip = vi.fn();
    const callout = createTutorialCallout({ run: 2, title: "Titel", message: "Nachricht" }, { onDismiss, onSkip });
    expect(callout.innerHTML).toContain("RUN 2/5");
    expect(callout.innerHTML).toContain("Titel");
    callout.querySelector("[data-dismiss]").click();
    callout.querySelector("[data-skip]").click();
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
