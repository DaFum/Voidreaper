import { beforeEach, describe, expect, test, vi } from "vitest";
import { renderAbyssTransition } from "../../src/ui/screens/abyss-transition-screen.js";
import { renderAnomalyScreen } from "../../src/ui/screens/anomaly-screen.js";
import { createBuildInspector, describeUpgradeImpact } from "../../src/ui/screens/build-inspector.js";
import { renderCampaignSelect } from "../../src/ui/screens/campaign-select-screen.js";
import { renderChallengesScreen } from "../../src/ui/screens/challenges-screen.js";
import { renderBuildHistory, renderCodexScreen } from "../../src/ui/screens/codex-screen.js";
import { renderExtractionScreen } from "../../src/ui/screens/extraction-screen.js";
import { createHangarScreen, resolveCheckpoint, resolveCurrencies } from "../../src/ui/screens/hangar-screen.js";
import { loadoutStatus, renderLoadoutScreen } from "../../src/ui/screens/loadout-screen.js";
import { canAffordOffer, renderMerchantScreen } from "../../src/ui/screens/merchant-screen.js";
import { renderPrototypeVault } from "../../src/ui/screens/prototype-vault-screen.js";
import { renderResearchScreen } from "../../src/ui/screens/research-screen.js";
import { renderRunSummary } from "../../src/ui/screens/run-summary-screen.js";
import { renderSalvageMission } from "../../src/ui/screens/salvage-mission-screen.js";
import { createSectorMapScreen } from "../../src/ui/screens/sector-map-screen.js";
import { renderSectorSummary } from "../../src/ui/screens/sector-summary-screen.js";
import { renderSettingsScreen } from "../../src/ui/screens/settings-screen.js";
import { renderSimulatorScreen } from "../../src/ui/screens/simulator-screen.js";
import { renderStatistics } from "../../src/ui/screens/statistics-screen.js";
import { renderWorkshopScreen, workshopDisabledReason } from "../../src/ui/screens/workshop-screen.js";

const root = () => document.createElement("div");
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

describe("abyss transition screen", () => {
  test("renders the profile and wires descend/extract", () => {
    const container = root(), onExtract = vi.fn(), onDescend = vi.fn();
    renderAbyssTransition(container, { profile: { depth: 3, enemyMultiplier: 1.25, eliteMultiplier: 1.5, corruptionGain: 8 }, onExtract, onDescend });
    expect(container.innerHTML).toContain("ABYSS 3");
    expect(container.innerHTML).toContain("×1.25");
    container.querySelector("[data-descend]").click();
    container.querySelector("[data-extract]").click();
    expect(onDescend).toHaveBeenCalledOnce();
    expect(onExtract).toHaveBeenCalledOnce();
  });

  test("tolerates a missing root", () => {
    expect(() => renderAbyssTransition(null, { profile: {} })).not.toThrow();
  });
});

describe("anomaly screen", () => {
  test("renders each choice and reports the chosen id", () => {
    const container = root(), onChoose = vi.fn();
    renderAnomalyScreen(container, { event: { name: "Riss", description: "Beschreibung", choices: [{ id: "risk", label: "Riskieren", cost: "5 Scrap", reward: "Modul", unknown: "?" }, { id: "leave", label: "Gehen", cost: "0", reward: "-", unknown: "-" }] }, onChoose });
    const buttons = [...container.querySelectorAll(".anomaly__choices button")];
    expect(buttons).toHaveLength(2);
    expect(container.innerHTML).toContain("Riss");
    buttons[1].click();
    expect(onChoose).toHaveBeenCalledWith("leave");
  });
});

describe("build inspector", () => {
  const model = {
    synergies: { active: [{ name: "Aktiv" }], near: [], blocked: [] },
    tags: Object.assign(new Map([["Void", 4]]), { provenance: new Map([["Void", [{ sourceId: "mod-a" }]]]) }),
    evolutions: [{ definition: { name: "Evo", kind: "weapon" }, eligible: true, requirements: [{ met: true }, { met: false }], blockedBy: null }],
    load: { ratio: .9, tier: "strained" }, heat: 42, corruption: 17, faultPressure: .5,
    statContext: {}
  };
  const services = { stats: { definitions: () => [{ id: "dps", displayName: "DPS", displayFormat: "integer" }], calculate: () => ({ value: 10, baseValue: 8, contributions: [] }) }, tags: { delta: vi.fn(() => "tag-delta") } };

  test("renders synergies by default and switches tabs on click", () => {
    const container = root();
    const inspector = createBuildInspector(container, services);
    inspector.update(model);
    expect(container.querySelector(".inspector-panel").innerHTML).toContain("Aktiv");

    container.querySelector('[data-tab="Stats"]').click();
    expect(container.querySelector(".inspector-panel").innerHTML).toContain("DPS");
    expect(container.querySelector('[data-tab="Stats"]').hasAttribute("aria-current")).toBe(true);

    inspector.showTab("Tags");
    expect(container.querySelector(".inspector-panel").innerHTML).toContain("mod-a");
    inspector.showTab("Evolutionen");
    expect(container.querySelector(".inspector-panel").innerHTML).toContain("1/2");
    inspector.showTab("Risiken");
    expect(container.querySelector(".inspector-panel").innerHTML).toContain("90% strained");
  });

  test("describeUpgradeImpact combines tag delta and before/after values", () => {
    const impact = describeUpgradeImpact({ sources: [1], load: "L1", heat: 1, corruption: 2 }, { sources: [2], load: "L2", heat: 3, corruption: 4 }, services);
    expect(impact).toEqual({ tags: "tag-delta", load: { before: "L1", after: "L2" }, heat: { before: 1, after: 3 }, corruption: { before: 2, after: 4 } });
  });
});

describe("campaign select screen", () => {
  test("lists paths and reports the clicked path id", () => {
    const container = root(), onSelect = vi.fn();
    renderCampaignSelect(container, [{ id: "p1", name: "Pfad", description: "D", rewardFocus: "Flux", regions: ["a", "b"] }], onSelect);
    expect(container.innerHTML).toContain("1 PATH");
    expect(container.innerHTML).toContain("a → b");
    container.querySelector('[data-path="p1"]').click();
    expect(onSelect).toHaveBeenCalledWith("p1");
  });
});

describe("challenges screen", () => {
  test("counts claimed challenges and marks mastery state", () => {
    const container = root();
    renderChallengesScreen(container, [
      { id: "c1", category: "Combat", name: "Eins", description: "D1", reward: { voidShards: 5 } },
      { id: "c2", category: "Meta", name: "Zwei", description: "D2", reward: { flux: 2 } }
    ], { c1: { claimed: true } });
    expect(container.innerHTML).toContain("1/2");
    const articles = [...container.querySelectorAll("article")];
    expect(articles.map(article => article.dataset.level)).toEqual(["mastered", "observed"]);
    expect(container.innerHTML).toContain("5 voidShards");
  });
});

describe("codex screen", () => {
  test("renders entries, discovery counter and accessible filters", () => {
    const container = root(), onFilter = vi.fn();
    renderCodexScreen(container, { entries: [{ category: "weapons", level: "analyzed", name: "Reißer", description: "D", tags: ["Void"] }, { category: "ships", level: "unknown", name: "?", description: "?", tags: [] }], onFilter });
    expect(container.innerHTML).toContain("1/2 SIGNALS");
    expect(container.querySelector('[aria-label="Kategorie"]')).not.toBeNull();
    container.querySelector("[data-tag]").value = "Void";
    container.querySelector("[data-tag]").dispatchEvent(new Event("change", { bubbles: true }));
    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({ tag: "Void" }));
  });

  test("shows the empty state without entries", () => {
    const container = root();
    renderCodexScreen(container, { entries: [] });
    expect(container.innerHTML).toContain("KEINE PASSENDEN SIGNALE");
  });

  test("build history toggles favorites per build id", () => {
    const container = root(), onToggleFavorite = vi.fn();
    renderBuildHistory(container, [{ id: "b1", result: "victory", seed: 7, ship: "S", weapon: "W", modules: ["m1"], favorite: false }], onToggleFavorite);
    expect(container.innerHTML).toContain("☆ Favorisieren");
    container.querySelector('[data-favorite="b1"]').click();
    expect(onToggleFavorite).toHaveBeenCalledWith("b1");
  });
});

describe("extraction screen", () => {
  test("renders window progress and wires hold/cancel", () => {
    const container = root(), onHold = vi.fn(), onCancel = vi.fn();
    renderExtractionScreen(container, { window: { reason: "boss", marked: [1, 2], duration: 10, elapsed: 5 }, onHold, onCancel });
    expect(container.innerHTML).toContain("BOSS");
    expect(container.innerHTML).toContain("2 PROTOTYPEN");
    expect(container.querySelector(".bar i").style.transform).toBe("scaleX(0.5)");
    container.querySelector("[data-hold]").click();
    container.querySelector("[data-cancel]").click();
    expect(onHold).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe("hangar screen", () => {
  const catalogs = { ships: [{ id: "ship-1", slot: "ship", name: "Frame" }], weapons: [], modules: [], reactors: [] };

  test("resolves currencies and checkpoint from values or factories", () => {
    expect(resolveCurrencies({ scrap: 1 })).toEqual({ scrap: 1 });
    expect(resolveCurrencies(() => ({ scrap: 2 }))).toEqual({ scrap: 2 });
    expect(resolveCheckpoint(null)).toBeNull();
    expect(resolveCheckpoint(() => ({ nodeId: "n" }))).toEqual({ nodeId: "n" });
  });

  test("starts on the launch tab and fires onStart/onResume", () => {
    const container = root(), onStart = vi.fn(), onResume = vi.fn();
    createHangarScreen(container, { ...catalogs, currencies: { voidShards: 3 }, checkpoint: { nodeId: "cp-1" }, onStart, onResume });
    expect(container.querySelector('[role="tab"][aria-selected="true"]').dataset.hangarTab).toBe("Run starten");
    expect(container.innerHTML).toContain("◇3");
    container.querySelector("[data-launch]").click();
    expect(onStart).toHaveBeenCalledOnce();
    container.querySelector("[data-resume]").click();
    expect(onResume).toHaveBeenCalledWith({ nodeId: "cp-1" });
  });

  test("switches tabs by click, renders catalogs with lock state and delegates unknown tabs", () => {
    const container = root(), renderTab = vi.fn();
    const screen = createHangarScreen(container, { ...catalogs, isUnlocked: () => false, renderTab });
    container.querySelector('[data-hangar-tab="Schiffe"]').click();
    const card = container.querySelector(".item-catalog .item-card");
    expect(card.dataset.itemId).toBe("ship-1");
    expect(card.disabled).toBe(true);
    expect(renderTab).toHaveBeenLastCalledWith("Schiffe", expect.anything());

    screen.show("Codex");
    expect(container.querySelector(".hangar-stage").dataset.activeTab).toBe("Codex");
    expect(container.innerHTML).toContain("CODEX");
    screen.show("Nicht vorhanden");
    expect(container.querySelector(".hangar-stage").dataset.activeTab).toBe("Codex");
  });
});

describe("loadout screen", () => {
  const inspection = { sources: [{ slot: "ship", name: "Frame X" }], capacity: 12, reserved: 4, load: { ratio: .42, tier: "stable" }, expectedHeat: 9, startingCorruption: 1, tags: new Map([["Void", 1]]) };

  test("loadoutStatus reports unconfigured loadouts explicitly", () => {
    expect(loadoutStatus({ sources: [], load: { ratio: 9, tier: "collapse" } })).toEqual({ percent: 0, tier: "unconfigured" });
    expect(loadoutStatus(inspection)).toEqual({ percent: 42, tier: "stable" });
  });

  test("renders frame, slot grid, telemetry and blueprint selection", () => {
    const container = root(), onBlueprintChange = vi.fn();
    renderLoadoutScreen(container, inspection, { slots: { passive: [{ definitionId: "mod-1" }] } }, { blueprints: [{ blueprintId: "bp-1", name: "Vorlage" }], activeBlueprintId: "bp-1", onBlueprintChange });
    expect(container.innerHTML).toContain("Frame X");
    expect(container.innerHTML).toContain("mod-1");
    expect(container.querySelector('option[value="bp-1"]').selected).toBe(true);

    const select = container.querySelector("[data-blueprint]");
    select.value = "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onBlueprintChange).toHaveBeenCalledWith(null);
  });
});

describe("merchant screen", () => {
  test("affordability follows the offer currency and corruption bypasses it", () => {
    expect(canAffordOffer({ scrap: 5, flux: 0 }, { price: 5 })).toBe(true);
    expect(canAffordOffer({ scrap: 4, flux: 99 }, { price: 5 })).toBe(false);
    expect(canAffordOffer({ scrap: 0, flux: 6 }, { currency: "flux", price: 6 })).toBe(true);
    expect(canAffordOffer({ scrap: 0, flux: 0 }, { corrupted: true, price: 999 })).toBe(true);
  });

  test("disables unaffordable offers with an explanatory label and wires buy/reroll/leave", () => {
    const container = root(), onBuy = vi.fn(), onReroll = vi.fn(), onLeave = vi.fn();
    const offers = [{ name: "Teuer", price: 50, slot: "module" }, { name: "Billig", price: 1, slot: "module" }];
    renderMerchantScreen(container, { offers, resources: { scrap: 10, flux: 0 }, onBuy, onReroll, onLeave });
    const [expensive, cheap] = [...container.querySelectorAll(".item-catalog .item-card")];
    expect(expensive.disabled).toBe(true);
    expect(expensive.getAttribute("aria-label")).toContain("nicht genügend Scrap");
    cheap.click();
    expect(onBuy).toHaveBeenCalledWith(offers[1]);
    container.querySelector("[data-reroll]").click();
    container.querySelector("[data-leave]").click();
    expect(onReroll).toHaveBeenCalledOnce();
    expect(onLeave).toHaveBeenCalledOnce();
  });
});

describe("prototype vault screen", () => {
  const items = [{ instanceId: "i1", name: "Proto", rarity: "rare", tags: [{ id: "Void" }], favorite: true }, { instanceId: "i2", name: "Zwei", rarity: "common", favorite: false }];

  test("renders items with accessible favorite toggles and dismantle lock for favorites", () => {
    const container = root(), onFavorite = vi.fn(), onDismantle = vi.fn();
    renderPrototypeVault(container, { items, capacity: 20, overflowCount: 1, onFavorite, onDismantle });
    expect(container.innerHTML).toContain("2/20 · OVERFLOW 1");
    const favorite = container.querySelector('[data-favorite="i1"]');
    expect(favorite.getAttribute("aria-label")).toBe("Favorit");
    expect(favorite.getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector('[data-dismantle="i1"]').disabled).toBe(true);
    favorite.click();
    expect(onFavorite).toHaveBeenCalledWith("i1");
    container.querySelector('[data-dismantle="i2"]').click();
    expect(onDismantle).toHaveBeenCalledWith("i2");
  });

  test("distinguishes an empty vault from empty filter results and reports filter changes", () => {
    const container = root(), onFilter = vi.fn();
    renderPrototypeVault(container, { items: [], capacity: 20, onFilter });
    expect(container.innerHTML).toContain("VAULT LEER");

    renderPrototypeVault(container, { items: [], capacity: 20, filters: { family: "x" }, onFilter });
    expect(container.innerHTML).toContain("KEINE TREFFER");
    expect(container.querySelector("[data-family]").value).toBe("x");

    container.querySelector("[data-tag]").value = " Void ";
    container.querySelector("[data-tag]").dispatchEvent(new Event("change", { bubbles: true }));
    expect(onFilter).toHaveBeenCalledWith({ family: "x", tag: "Void", rarity: "", source: "" });
  });
});

describe("research screen", () => {
  const nodes = [
    { id: "r1", branch: "void-tech", name: "Owned", description: "D", cost: { flux: 3 }, unlocks: ["u1"] },
    { id: "r2", branch: "hull", name: "Available", description: "D", cost: {}, unlocks: [] },
    { id: "r3", branch: "hull", name: "Locked", description: "D", cost: { scrap: 9 }, unlocks: [] }
  ];

  test("classifies nodes as owned/available/locked and purchases only enabled nodes once", () => {
    const container = root(), onPurchase = vi.fn();
    renderResearchScreen(container, nodes, { purchased: { r1: true }, canPurchase: node => node.id === "r2", onPurchase });
    const states = [...container.querySelectorAll(".research-node")].map(node => node.dataset.state);
    expect(states).toEqual(["owned", "available", "locked"]);
    expect(container.innerHTML).toContain("VOID TECH");

    const locked = container.querySelector('[data-research-id="r3"]');
    locked.click();
    expect(onPurchase).not.toHaveBeenCalled();

    const available = container.querySelector('[data-research-id="r2"]');
    available.click();
    expect(onPurchase).toHaveBeenCalledWith("r2");
    expect(available.disabled).toBe(true);
  });
});

describe("run summary screen", () => {
  test("summarizes the assembly and reports the blueprint choice with replacement target", () => {
    const container = root(), onBlueprintChoice = vi.fn();
    renderRunSummary(container, {
      summary: { victory: true, flightProfile: { totalMass: 123.6 } },
      assemblySnapshot: { nodesById: { a: {}, b: {} }, detachedItems: [{}] },
      blueprints: [{ blueprintId: "bp-1", name: "Alt" }],
      onBlueprintChoice
    });
    expect(container.innerHTML).toContain("SIGNAL STABIL");
    expect(container.innerHTML).toContain("KNOTEN <b>2</b>");
    expect(container.innerHTML).toContain("MASSE <b>124</b>");

    container.querySelector("[data-replace]").value = "bp-1";
    container.querySelector('[data-choice="variant"]').click();
    expect(onBlueprintChoice).toHaveBeenCalledWith("variant", { replaceBlueprintId: "bp-1", veteran: true });

    container.querySelector("[data-replace]").value = "";
    container.querySelector('[data-choice="new"]').click();
    expect(onBlueprintChoice).toHaveBeenLastCalledWith("new", { replaceBlueprintId: null, veteran: false });
  });
});

describe("salvage mission screen", () => {
  test("renders the carried prototype, affixes, path and start action", () => {
    const container = root(), onStart = vi.fn();
    renderSalvageMission(container, { regionId: "grave-circuit", boss: { carriedItem: { name: "Original" } }, enemyAffixes: [{ id: "fast" }], path: [{ type: "combat", seed: 7 }] }, onStart);
    expect(container.innerHTML).toContain("Original");
    expect(container.innerHTML).toContain("fast");
    expect(container.innerHTML).toContain("SEED 7");
    container.querySelector("[data-start-salvage]").click();
    expect(onStart).toHaveBeenCalledOnce();
  });
});

describe("sector map screen", () => {
  const node = (id, layer, extra = {}) => ({ id, type: "combat", layer, index: 0, regionIndex: 0, informationLevel: 1, danger: 2, regionId: "shattered-approach", reward: "Scrap", corruptionDelta: 2, next: [], ...extra });
  const model = {
    map: { regions: [{ layers: [[node("start", 0, { next: ["mid"] })], [node("mid", 1)]] }] },
    regionIndex: 0, currentNodeId: null, visitedNodeIds: ["start"], reachableNodeIds: ["mid"]
  };

  test("first tap selects with details, second tap confirms the reachable node", () => {
    const container = root();
    document.body.append(container);
    const onConfirm = vi.fn();
    const screen = createSectorMapScreen(container, { onConfirm });
    screen.render(model);
    expect(container.innerHTML).toContain("REGION 1/5");
    expect(container.querySelector('[data-node-id="start"]').disabled).toBe(true);

    const reachable = () => container.querySelector('[data-node-id="mid"]');
    reachable().click();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(container.querySelector(".sector-map__detail").textContent).toContain("erneut tippen zum Bestätigen");
    reachable().click();
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: "mid" }));
    screen.destroy();
    expect(container.innerHTML).toBe("");
    container.remove();
  });

  test("shows the workbench shortcut only when a handler exists", () => {
    const container = root();
    document.body.append(container);
    const onWorkbench = vi.fn();
    createSectorMapScreen(container, { onWorkbench }).render(model);
    container.querySelector("[data-assembly-workbench]").click();
    expect(onWorkbench).toHaveBeenCalledOnce();

    createSectorMapScreen(container, {}).render(model);
    expect(container.querySelector("[data-assembly-workbench]")).toBeNull();
    container.remove();
  });
});

describe("sector summary screen", () => {
  test("sorts damage sources descending and counts telemetry", () => {
    const container = root();
    renderSectorSummary(container, { damageBySource: { laser: 10, rail: 90 }, heatPeaks: [1], faults: [], synergies: [1, 2], evolutionProgress: [], codexSignatures: [1], prototypes: [{ secured: true }, { secured: false }] });
    expect(container.innerHTML).toMatch(/rail<b>90<\/b>.*laser<b>10<\/b>/s);
    expect(container.innerHTML).toContain("Synergien <b>2</b>");
    expect(container.innerHTML).toContain("1/2");
  });
});

describe("settings screen", () => {
  const makeSettings = () => ({ reducedMotion: false, screenShake: true, damageFlashes: true, crt: false, largeTouchControls: false, colorPatterns: false, uiScale: 1, bindings: { Space: "dodge", KeyQ: "active-1", KeyE: "active-2" } });

  test("renders toggles from settings and persists checkbox changes", () => {
    const container = root(), onChange = vi.fn();
    const settings = makeSettings();
    renderSettingsScreen(container, settings, onChange);
    const reducedMotion = container.querySelector('[data-setting="reducedMotion"]');
    expect(reducedMotion.checked).toBe(false);
    expect(container.querySelector('[data-setting="screenShake"]').checked).toBe(true);

    reducedMotion.checked = true;
    reducedMotion.dispatchEvent(new Event("change", { bubbles: true }));
    expect(settings.reducedMotion).toBe(true);
    expect(onChange).toHaveBeenCalledWith(settings);
    expect(document.documentElement.dataset.reducedMotion).toBe("true");
  });

  test("rebinding captures the pressed key's code and removes the previous code for that action", () => {
    const container = root(), onChange = vi.fn();
    const settings = makeSettings();
    renderSettingsScreen(container, settings, onChange);
    const dodge = container.querySelector('[data-binding="dodge"]');
    expect(dodge.value).toBe("Space");
    expect(dodge.readOnly).toBe(true);
    const keydown = new KeyboardEvent("keydown", { code: "KeyF", key: "f", bubbles: true, cancelable: true });
    dodge.dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(true);
    expect(dodge.value).toBe("KeyF");
    expect(settings.bindings.KeyF).toBe("dodge");
    expect(settings.bindings.Space).toBeUndefined();
    expect(onChange).toHaveBeenCalledWith(settings);
  });

  test("rebinding to a key owned by another action swaps the two bindings", () => {
    const container = root();
    const settings = makeSettings();
    renderSettingsScreen(container, settings, () => {});
    const dodge = container.querySelector('[data-binding="dodge"]');
    dodge.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyE", key: "e", bubbles: true, cancelable: true }));
    expect(settings.bindings.KeyE).toBe("dodge");
    // active-2 is not silently unbound — it takes over dodge's freed code.
    expect(settings.bindings.Space).toBe("active-2");
    expect(container.querySelector('[data-binding="active-2"]').value).toBe("Space");
    expect(dodge.value).toBe("KeyE");
  });

  test("Tab keeps keyboard navigation instead of being captured as a binding", () => {
    const container = root();
    const settings = makeSettings();
    renderSettingsScreen(container, settings, () => {});
    const dodge = container.querySelector('[data-binding="dodge"]');
    dodge.dispatchEvent(new KeyboardEvent("keydown", { code: "Tab", key: "Tab", bubbles: true, cancelable: true }));
    expect(settings.bindings.Space).toBe("dodge");
    expect(settings.bindings.Tab).toBeUndefined();
  });
});

describe("simulator screen", () => {
  test("prefills the config and collects the form into onStart", () => {
    const container = root(), onStart = vi.fn();
    renderSimulatorScreen(container, { config: { enemyId: "armored", density: 2, duration: 90, seed: 5 }, summary: { dps: 12.34, triggers: 9, faults: [], seed: 5 }, onStart });
    expect(container.querySelector("[data-enemy]").value).toBe("armored");
    expect(container.innerHTML).toContain("DPS <b>12.3</b>");
    container.querySelector("[data-density]").value = "3";
    container.querySelector("[data-start]").click();
    expect(onStart).toHaveBeenCalledWith({ enemyId: "armored", density: 3, duration: 90, seed: 5 });
  });

  test("omits the summary block before the first simulation", () => {
    const container = root();
    renderSimulatorScreen(container, { onStart: () => {} });
    expect(container.innerHTML).not.toContain("DPS");
  });
});

describe("statistics screen", () => {
  test("renders lifetime statistics and records with fallbacks", () => {
    const container = root();
    renderStatistics(container, { runs: 4, victories: 1, kills: 320, playTime: 3600, extractedPrototypes: 2, lostPrototypes: 1 }, { highscore: { value: 999 } });
    expect(container.innerHTML).toContain("Runs<b>4</b>");
    expect(container.innerHTML).toContain("Spielzeit<b>60m</b>");
    expect(container.innerHTML).toContain("Highscore<b>999</b>");
    expect(container.innerHTML).toContain("Abyss<b>0</b>");
  });
});

describe("workshop screen", () => {
  const session = { actionPoints: 5, used: 2 };

  test("explains why an action is disabled", () => {
    expect(workshopDisabledReason(session, { allowed: true })).toBeNull();
    expect(workshopDisabledReason(session, { allowed: false, points: 4 })).toBe("nicht genügend Aktionspunkte");
    expect(workshopDisabledReason(session, { allowed: false, points: 1 })).toBe("benötigter Reparaturdienst nicht verfügbar");
  });

  test("previews an action and executes it only after confirmation", async () => {
    const container = root(), onAction = vi.fn(), onLeave = vi.fn();
    document.body.append(container);
    const service = { preview: (currentSession, id) => ({ allowed: id === "swap", points: 2, consequence: `Folge ${id}` }) };
    renderWorkshopScreen(container, { service, session, target: { name: "Reaktor" }, onAction, onLeave });
    expect(container.innerHTML).toContain("3 AP");
    expect(container.innerHTML).toContain("Reaktor");

    const buttons = [...container.querySelectorAll(".workshop-actions button")];
    const swap = buttons.find(button => button.textContent === "Modul wechseln");
    expect(swap.disabled).toBe(false);
    expect(buttons.filter(button => button.disabled).length).toBe(buttons.length - 1);

    swap.click();
    expect(container.querySelector("[data-preview]").textContent).toBe("2 AP · Folge swap");
    const modal = document.querySelector("dialog.vr-modal");
    expect(modal.textContent).toContain("Folge swap");
    modal.querySelector('[data-action="confirm"]').click();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onAction).toHaveBeenCalledWith("swap", { name: "Reaktor" });
    expect(document.querySelector("dialog.vr-modal")).toBeNull();

    swap.click();
    document.querySelector('dialog.vr-modal [data-action="cancel"]').click();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onAction).toHaveBeenCalledOnce();
    expect(document.querySelector("dialog.vr-modal")).toBeNull();

    container.querySelector("[data-leave]").click();
    expect(onLeave).toHaveBeenCalledOnce();
    container.remove();
  });
});
