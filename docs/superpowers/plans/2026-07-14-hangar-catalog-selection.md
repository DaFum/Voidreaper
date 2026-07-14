# Hangar Catalog Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the „Schiffe“, „Waffen“ and „Module“ hangar tabs into filterable catalogs whose cards expose their lock state before selection and equip through an explicit compact slot chooser.

**Architecture:** Keep catalog state and rendering in `hangar-screen.js`, reuse `item-card.js` for the visible card states, and route every mutation through the existing loadout service and save path in `bootstrap.js`. The UI derives equipped, available and locked presentation from the current primary loadout, `isUnlocked` and `unlockSource`; it never reimplements unlock or equip rules.

**Tech Stack:** Vite, vanilla ES modules and DOM APIs, Vitest with jsdom, existing CSS in `src/styles/hangar.css`.

## Global Constraints

- Preserve the existing „Schiffe“, „Waffen“ and „Module“ hangar tabs.
- Do not change unlock conditions, content definitions, save shape or migrations.
- Do not equip on card selection; only a concrete slot action may mutate the loadout.
- Locked cards must show „GESPERRT“ and their unlock path before selection while remaining keyboard-accessible for details.
- Default order is equipped, available, locked; entries are alphabetical inside each state.
- Status filters are „Alle“, „Verfügbar“ and „Gesperrt“; module type filters are „Alle“, „Passiv“, „Aktiv“, „Utility“ and „Relikt“.
- Reuse `services.loadouts.equip`, `createLoadoutItem` and the existing save store.
- Keep edits local to the owning hangar UI, app wiring, styles and focused tests.

---

## File Map

- `src/ui/components/item-card.js`: render semantic card state, visible status, unlock path and action hint.
- `src/ui/screens/hangar-screen.js`: derive catalog entries, preserve per-tab filters, render the toolbar/results/selection bar and dispatch slot choices.
- `src/app/bootstrap.js`: provide the live primary loadout and a result-returning equip callback shared with the existing Loadout tab.
- `src/styles/hangar.css`: visual hierarchy, state differentiation, responsive toolbar and mobile bottom sheet.
- `tests/frontend/components.spec.js`: item-card state and accessibility contracts.
- `tests/frontend/screens.spec.js`: sorting, filtering, state persistence, locked details and slot selection behavior.

### Task 1: Visible card states and catalog derivation

**Files:**
- Modify: `tests/frontend/components.spec.js:46-62`
- Modify: `tests/frontend/screens.spec.js:1-10`
- Modify: `tests/frontend/screens.spec.js:157-196`
- Modify: `src/ui/components/item-card.js`
- Modify: `src/ui/screens/hangar-screen.js:1-11`

**Interfaces:**
- Produces: `catalogUnlockLabel(unlockSource: string): string`
- Produces: `catalogEntries(definitions, { isUnlocked, loadout, query, status, type }): CatalogEntry[]`
- Produces: `CatalogEntry = { definition, state: "equipped"|"available"|"locked", equippedSlots: Array<{slot,index}>, unlockLabel: string }`
- Produces: `createItemCard(definition, { selected, state, statusLabel, statusDetail, actionLabel, equippedSlots, onSelect })`

- [ ] **Step 1: Replace the old disabled-card assertion with failing visible-state tests**

Add these cases to `tests/frontend/components.spec.js`:

```js
test("shows locked state and unlock path before selection without disabling details", () => {
  const onSelect = vi.fn();
  const card = createItemCard(
    { id: "x", slot: "passive", name: "Locked Module", description: "Desc" },
    {
      state: "locked",
      statusLabel: "GESPERRT",
      statusDetail: "Über Forschung freischalten",
      actionLabel: "Freischaltweg ansehen",
      onSelect
    }
  );

  expect(card.tagName).toBe("BUTTON");
  expect(card.disabled).toBe(false);
  expect(card.dataset.state).toBe("locked");
  expect(card.textContent).toContain("GESPERRT");
  expect(card.textContent).toContain("Über Forschung freischalten");
  expect(card.getAttribute("aria-label")).toContain("gesperrt");
  card.click();
  expect(onSelect).toHaveBeenCalledOnce();
});

test("shows equipped slots on equipped cards", () => {
  const card = createItemCard(
    { id: "split", slot: "passive", name: "Split Matrix" },
    {
      state: "equipped",
      statusLabel: "AUSGERÜSTET",
      actionLabel: "Belegung ändern",
      equippedSlots: ["Passiv 1", "Passiv 3"],
      onSelect: vi.fn()
    }
  );

  expect(card.textContent).toContain("AUSGERÜSTET");
  expect(card.textContent).toContain("Passiv 1 · Passiv 3");
});
```

Extend the hangar import in `tests/frontend/screens.spec.js`:

```js
import {
  catalogEntries,
  catalogUnlockLabel,
  createHangarScreen,
  resolveCheckpoint,
  resolveCurrencies
} from "../../src/ui/screens/hangar-screen.js";
```

Add focused helper tests inside `describe("hangar screen", ...)`:

```js
test("maps every catalog unlock source to player-facing copy", () => {
  expect(catalogUnlockLabel("starter")).toBe("Startausrüstung");
  expect(catalogUnlockLabel("research")).toBe("Über Forschung freischalten");
  expect(catalogUnlockLabel("blueprint")).toBe("Durch Blaupause freischalten");
  expect(catalogUnlockLabel("challenge")).toBe("Über Herausforderung freischalten");
  expect(catalogUnlockLabel("secret")).toBe("Geheime Bedingung erfüllen");
});

test("derives equipped, available and locked entries in the required order", () => {
  const definitions = [
    { id: "locked", name: "Alpha", slot: "passive", unlockSource: "research" },
    { id: "available", name: "Beta", slot: "passive", unlockSource: "blueprint" },
    { id: "equipped", name: "Gamma", slot: "passive", unlockSource: "starter" }
  ];
  const loadout = { slots: { passive: [{ definitionId: "equipped" }, null] } };
  const entries = catalogEntries(definitions, {
    isUnlocked: definition => definition.id !== "locked",
    loadout,
    query: "",
    status: "all",
    type: "all"
  });

  expect(entries.map(entry => entry.state)).toEqual(["equipped", "available", "locked"]);
  expect(entries[0].equippedSlots).toEqual([{ slot: "passive", index: 0 }]);
  expect(entries[2].unlockLabel).toBe("Über Forschung freischalten");
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```powershell
npm run test:frontend -- tests/frontend/components.spec.js tests/frontend/screens.spec.js
```

Expected: FAIL because the new card options and `catalogEntries` / `catalogUnlockLabel` exports do not exist.

- [ ] **Step 3: Implement minimal card state rendering**

Replace `createItemCard` with the same existing content fields plus explicit state markup:

```js
import { escapeHtml } from "../escape-html.js";

export function createItemCard(definition, {
  selected = false,
  state = "available",
  statusLabel = "VERFÜGBAR",
  statusDetail = "",
  actionLabel = "Slots wählen",
  equippedSlots = [],
  onSelect = null
} = {}) {
  const card = document.createElement(onSelect ? "button" : "article");
  card.className = "item-card";
  card.dataset.itemId = definition.id;
  card.dataset.state = state;
  card.toggleAttribute("data-selected", selected);
  if (onSelect) {
    card.type = "button";
    card.setAttribute("aria-pressed", String(selected));
    card.setAttribute("aria-label", `${definition.name ?? definition.id}, ${statusLabel.toLowerCase()}${statusDetail ? `, ${statusDetail}` : ""}`);
    card.addEventListener("click", () => onSelect(definition));
  }
  const slotText = equippedSlots.length ? `<span class="item-card__equipped">${equippedSlots.map(escapeHtml).join(" · ")}</span>` : "";
  card.innerHTML = `<span class="item-card__status">${state === "locked" ? "🔒 " : ""}${escapeHtml(statusLabel)}</span><span class="item-card__slot">${escapeHtml(definition.slot)}</span><strong>${escapeHtml(definition.name)}</strong><small>${escapeHtml(definition.description ?? definition.signature ?? definition.id)}</small><div>${(definition.tags ?? []).slice(0, 4).map(tag => `<i>${escapeHtml(tag.id ?? tag)}</i>`).join("")}</div>${slotText}${statusDetail ? `<span class="item-card__reason">${escapeHtml(statusDetail)}</span>` : ""}<span class="item-card__action">${escapeHtml(actionLabel)}</span><b>${definition.energyCost ?? 0} E</b>`;
  return card;
}
```

- [ ] **Step 4: Implement minimal catalog derivation helpers**

Add above `createHangarScreen` in `hangar-screen.js`:

```js
const UNLOCK_LABELS = Object.freeze({
  starter: "Startausrüstung",
  research: "Über Forschung freischalten",
  blueprint: "Durch Blaupause freischalten",
  challenge: "Über Herausforderung freischalten",
  secret: "Geheime Bedingung erfüllen"
});
const STATE_RANK = Object.freeze({ equipped: 0, available: 1, locked: 2 });

export const catalogUnlockLabel = source => UNLOCK_LABELS[source] ?? "Freischaltbedingung noch unbekannt";

export function catalogEntries(definitions, { isUnlocked, loadout, query = "", status = "all", type = "all" }) {
  const equippedById = new Map();
  for (const [slot, items] of Object.entries(loadout?.slots ?? {})) {
    items.forEach((item, index) => {
      if (!item?.definitionId) return;
      const slots = equippedById.get(item.definitionId) ?? [];
      slots.push({ slot, index });
      equippedById.set(item.definitionId, slots);
    });
  }
  const normalizedQuery = query.trim().toLocaleLowerCase("de");
  return definitions.map(definition => {
    const equippedSlots = equippedById.get(definition.id) ?? [];
    const state = equippedSlots.length ? "equipped" : isUnlocked(definition) ? "available" : "locked";
    return { definition, state, equippedSlots, unlockLabel: catalogUnlockLabel(definition.unlockSource) };
  }).filter(entry => {
    if (status === "available" && entry.state === "locked") return false;
    if (status === "locked" && entry.state !== "locked") return false;
    if (type !== "all" && entry.definition.slot !== type) return false;
    if (!normalizedQuery) return true;
    const searchable = [entry.definition.name, entry.definition.description, entry.definition.signature, ...(entry.definition.tags ?? []).map(tag => tag.id ?? tag)].join(" ").toLocaleLowerCase("de");
    return searchable.includes(normalizedQuery);
  }).sort((left, right) => STATE_RANK[left.state] - STATE_RANK[right.state] || left.definition.name.localeCompare(right.definition.name, "de"));
}
```

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run:

```powershell
npm run test:frontend -- tests/frontend/components.spec.js tests/frontend/screens.spec.js
```

Expected: both files PASS with no new warnings.

- [ ] **Step 6: Commit Task 1**

```powershell
git add src/ui/components/item-card.js src/ui/screens/hangar-screen.js tests/frontend/components.spec.js tests/frontend/screens.spec.js
git commit -m "feat: expose hangar catalog item states"
```

### Task 2: Filterable catalogs and compact slot chooser

**Files:**
- Modify: `tests/frontend/screens.spec.js:157-250`
- Modify: `src/ui/screens/hangar-screen.js:11-157`
- Modify: `src/styles/hangar.css:119-165`

**Interfaces:**
- Consumes: `catalogEntries(...)` and explicit-state `createItemCard(...)` from Task 1.
- Consumes: `LOADOUT_SLOT_LAYOUT` from `src/features/equipment/loadout-service.js`.
- Extends: `createHangarScreen(container, { ..., loadout, onEquip })`.
- `loadout` accepts a loadout value or `() => loadout`, matching existing currency/checkpoint resolution.
- `onEquip(slot, index, definitionId)` returns `Promise<{ok:boolean,message?:string}>`.

- [ ] **Step 1: Add failing toolbar, ordering and filter tests**

Use a richer catalog fixture in the hangar describe block:

```js
const catalogLoadout = {
  slots: {
    ship: [{ definitionId: "ship-equipped" }],
    "primary-weapon": [{ definitionId: "weapon-equipped" }],
    passive: [{ definitionId: "mod-equipped" }, { definitionId: "mod-old" }, null, null],
    active: [null, null],
    utility: [null, null],
    relic: [null]
  }
};

test("shows catalog orientation, visible lock state and stable default order", () => {
  const container = root();
  createHangarScreen(container, {
    ships: [
      { id: "ship-locked", slot: "ship", name: "Alpha", unlockSource: "research" },
      { id: "ship-equipped", slot: "ship", name: "Gamma", unlockSource: "starter" },
      { id: "ship-open", slot: "ship", name: "Beta", unlockSource: "challenge" }
    ],
    weapons: [], modules: [], reactors: [], loadout: catalogLoadout,
    isUnlocked: definition => definition.id !== "ship-locked"
  }).show("Schiffe");

  expect(container.querySelector("[data-catalog-title]").textContent).toContain("Schiffe");
  expect(container.querySelector("[data-catalog-progress]").textContent).toContain("2 von 3 freigeschaltet");
  expect([...container.querySelectorAll(".item-card")].map(card => card.dataset.itemId)).toEqual(["ship-equipped", "ship-open", "ship-locked"]);
  expect(container.querySelector('[data-item-id="ship-locked"]').textContent).toContain("GESPERRT");
  expect(container.querySelector('[data-item-id="ship-locked"]').textContent).toContain("Über Forschung freischalten");
});

test("combines search, availability and module type filters and resets an empty result", () => {
  const container = root();
  const screen = createHangarScreen(container, {
    ships: [], weapons: [], reactors: [], loadout: catalogLoadout,
    modules: [
      { id: "passive-open", slot: "passive", name: "Open Matrix", unlockSource: "starter" },
      { id: "active-locked", slot: "active", name: "Locked Burst", unlockSource: "challenge" }
    ],
    isUnlocked: definition => definition.id === "passive-open"
  });
  screen.show("Module");

  container.querySelector('[data-catalog-status="locked"]').click();
  container.querySelector('[data-catalog-type="active"]').click();
  expect([...container.querySelectorAll(".item-card")].map(card => card.dataset.itemId)).toEqual(["active-locked"]);

  const search = container.querySelector("[data-catalog-search]");
  search.value = "missing";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  expect(container.querySelector("[data-catalog-empty]").textContent).toContain("Keine Treffer");
  container.querySelector("[data-catalog-reset]").click();
  expect(container.querySelectorAll(".item-card")).toHaveLength(2);
});
```

- [ ] **Step 2: Add failing selection and persistence-of-filter tests**

```js
test("opens current matching slots and equips only the explicitly chosen slot", async () => {
  const container = root(), onEquip = vi.fn().mockResolvedValue({ ok: true });
  const screen = createHangarScreen(container, {
    ships: [], weapons: [], reactors: [], loadout: catalogLoadout,
    modules: [{ id: "mod-new", slot: "passive", name: "New Module", unlockSource: "starter" }],
    isUnlocked: () => true,
    onEquip
  });
  screen.show("Module");
  container.querySelector('[data-item-id="mod-new"]').click();

  const slots = [...container.querySelectorAll("[data-catalog-equip]")];
  expect(slots).toHaveLength(4);
  expect(slots[1].textContent).toContain("mod-old");
  container.querySelector("[data-catalog-selection-close]").click();
  expect(container.querySelector("[data-catalog-selection]").hidden).toBe(true);
  container.querySelector('[data-item-id="mod-new"]').click();
  const reopenedSlots = [...container.querySelectorAll("[data-catalog-equip]")];
  reopenedSlots[1].click();
  await vi.waitFor(() => expect(onEquip).toHaveBeenCalledWith("passive", 1, "mod-new"));
});

test("keeps locked details inspectable but never offers or dispatches equip", () => {
  const container = root(), onEquip = vi.fn();
  const screen = createHangarScreen(container, {
    ships: [{ id: "locked", slot: "ship", name: "Locked", unlockSource: "secret" }],
    weapons: [], modules: [], reactors: [], loadout: catalogLoadout,
    isUnlocked: () => false,
    onEquip
  });
  screen.show("Schiffe");
  container.querySelector('[data-item-id="locked"]').click();

  expect(container.querySelector("[data-catalog-selection]").textContent).toContain("Geheime Bedingung erfüllen");
  expect(container.querySelector("[data-catalog-equip]")).toBeNull();
  expect(onEquip).not.toHaveBeenCalled();
});

test("preserves each catalog query while switching tabs", () => {
  const container = root();
  const screen = createHangarScreen(container, {
    ships: [{ id: "vesper", slot: "ship", name: "Vesper" }],
    weapons: [{ id: "railgun", slot: "primary-weapon", name: "Railgun" }],
    modules: [], reactors: [], loadout: catalogLoadout,
    isUnlocked: () => true
  });
  screen.show("Schiffe");
  const search = container.querySelector("[data-catalog-search]");
  search.value = "ves";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  screen.show("Waffen");
  screen.show("Schiffe");
  expect(container.querySelector("[data-catalog-search]").value).toBe("ves");
  screen.render();
  expect(container.querySelector("[data-catalog-search]").value).toBe("ves");
});
```

- [ ] **Step 3: Run the screen tests and confirm RED**

Run:

```powershell
npm run test:frontend -- tests/frontend/screens.spec.js
```

Expected: FAIL because catalog controls, selection bar and `loadout` / `onEquip` options are not rendered.

- [ ] **Step 4: Add per-tab catalog state and rendering**

Import `LOADOUT_SLOT_LAYOUT`, add `resolveLoadout`, and initialize state:

```js
import { LOADOUT_SLOT_LAYOUT } from "../../features/equipment/loadout-service.js";

export const resolveLoadout = loadout => typeof loadout === "function" ? loadout() : loadout;

const CATALOG_CONFIG = Object.freeze({
  Schiffe: { title: "Schiffe", purpose: "Frames ansehen und ausrüsten", types: [] },
  Waffen: { title: "Waffen", purpose: "Primärwaffen ansehen und ausrüsten", types: [] },
  Module: { title: "Module", purpose: "Module nach Aufgabe filtern und ausrüsten", types: [
    ["passive", "Passiv"], ["active", "Aktiv"], ["utility", "Utility"], ["relic", "Relikt"]
  ] }
});

const catalogState = Object.fromEntries(Object.keys(CATALOG_CONFIG).map(name => [name, {
  query: "", status: "all", type: "all", selectedItemId: null
}]));
```

Extend `createHangarScreen` options with `loadout = null` and `onEquip = async () => ({ ok: false, message: "Ausrüsten ist nicht verfügbar." })`.

Add a `renderCatalog(content, definitions)` function inside `createHangarScreen`. It must:

1. render title, purpose, progress, labeled search, status filters, optional type filters, `aria-live` hit count, selection region and result region;
2. compute entries with `catalogEntries(definitions, { ...state, isUnlocked, loadout: resolveLoadout(loadout) })`;
3. render each result through `createItemCard` with `statusLabel`, unlock detail, action label and human-readable equipped slots;
4. render the selected locked explanation or all `LOADOUT_SLOT_LAYOUT[definition.slot]` slot actions with current occupant names;
5. render the resettable empty state when the filtered entry list is empty.

Use these stable DOM contracts from the tests:

```html
<section class="hangar-catalog" data-catalog="Module">
  <header class="catalog-intro">
    <div><span data-catalog-title>Module</span><p>Module nach Aufgabe filtern und ausrüsten</p></div>
    <strong data-catalog-progress>1 von 2 freigeschaltet</strong>
  </header>
  <div class="catalog-toolbar">
    <label>SUCHEN <input type="search" data-catalog-search></label>
    <div class="catalog-filter-group" role="group" aria-label="Verfügbarkeit">
      <button data-catalog-status="all" aria-pressed="true">Alle</button>
      <button data-catalog-status="available" aria-pressed="false">Verfügbar</button>
      <button data-catalog-status="locked" aria-pressed="false">Gesperrt</button>
    </div>
    <div class="catalog-filter-group" role="group" aria-label="Modultyp">
      <button data-catalog-type="all" aria-pressed="true">Alle</button>
      <button data-catalog-type="passive" aria-pressed="false">Passiv</button>
      <button data-catalog-type="active" aria-pressed="false">Aktiv</button>
      <button data-catalog-type="utility" aria-pressed="false">Utility</button>
      <button data-catalog-type="relic" aria-pressed="false">Relikt</button>
    </div>
    <span data-catalog-count aria-live="polite">2 Treffer</span>
  </div>
  <section data-catalog-selection hidden>
    <button type="button" data-catalog-selection-close aria-label="Auswahl schließen">×</button>
  </section>
  <div class="item-catalog" data-catalog-results></div>
</section>
```

- [ ] **Step 5: Wire local search, filters, cards and slot actions**

Attach listeners once per rendered catalog content:

```js
content.querySelector("[data-catalog-search]").addEventListener("input", event => {
  state.query = event.target.value;
  refreshCatalog();
});
content.addEventListener("click", async event => {
  const status = event.target.closest("[data-catalog-status]")?.dataset.catalogStatus;
  if (status) { state.status = status; refreshCatalog(); return; }
  const type = event.target.closest("[data-catalog-type]")?.dataset.catalogType;
  if (type) { state.type = type; refreshCatalog(); return; }
  if (event.target.closest("[data-catalog-reset]")) {
    Object.assign(state, { query: "", status: "all", type: "all", selectedItemId: null });
    renderCatalog(content, definitions);
    return;
  }
  if (event.target.closest("[data-catalog-selection-close]")) {
    state.selectedItemId = null;
    refreshCatalog();
    return;
  }
  const equip = event.target.closest("[data-catalog-equip]");
  if (!equip) return;
  const selectedItemId = state.selectedItemId;
  state.selectedItemId = null;
  equip.disabled = true;
  const result = await onEquip(equip.dataset.slot, Number(equip.dataset.index), selectedItemId);
  if (result?.ok) return;
  state.selectedItemId = selectedItemId;
  equip.disabled = false;
  content.querySelector("[data-catalog-message]").textContent = result?.message ?? "Ausrüsten fehlgeschlagen.";
});
```

Card callbacks set `state.selectedItemId = definition.id` and call `refreshCatalog()`. `refreshCatalog()` updates result cards, pressed filter states, counts and selection content without replacing the search input, so typing does not lose focus.

Replace the existing generic catalog branch in `render()` with calls to `renderCatalog(content, ships|weapons|modules)` only for the three catalog tabs. Preserve `renderTab(tab, content)` afterward for tutorial events and unrelated tabs.

- [ ] **Step 6: Add catalog hierarchy and responsive styles**

Add focused selectors to `hangar.css` and narrow the old hover selector to buttons:

```css
.catalog-intro { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:12px; padding:12px 14px; border-left:3px solid var(--ice); background:rgba(76,201,240,.055); }
.catalog-intro span { color:var(--bone); font:700 18px var(--font-d); letter-spacing:.08em; }
.catalog-intro p { margin:4px 0 0; color:rgba(239,234,247,.62); font-size:10px; }
.catalog-intro strong { color:var(--phosphor); font:10px var(--font-m); white-space:nowrap; }
.catalog-toolbar { position:sticky; z-index:3; top:-15px; display:flex; flex-wrap:wrap; align-items:end; gap:8px; margin-bottom:10px; padding:10px; border:1px solid rgba(76,201,240,.18); background:rgba(4,1,10,.96); }
.catalog-toolbar label { display:grid; gap:4px; color:var(--ice); font:8px var(--font-m); letter-spacing:.12em; }
.catalog-toolbar input { min-height:36px; padding:7px 10px; border:1px solid rgba(76,201,240,.35); color:var(--bone); background:rgba(255,255,255,.035); }
.catalog-filter-group { display:flex; flex-wrap:wrap; gap:4px; }
.catalog-filter-group button { min-height:36px; padding:7px 10px; border:1px solid rgba(76,201,240,.2); color:rgba(239,234,247,.68); background:transparent; }
.catalog-filter-group button[aria-pressed="true"] { border-color:var(--phosphor); color:var(--phosphor); background:rgba(6,255,165,.08); }
.catalog-selection { margin-bottom:10px; padding:12px; border:1px solid var(--ice); background:linear-gradient(105deg,rgba(76,201,240,.11),rgba(4,1,10,.98)); }
.catalog-selection__slots { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.catalog-selection__slots button { min-height:44px; padding:8px 11px; text-align:left; }
.item-card[data-state="locked"] { border-color:rgba(255,143,31,.26); background:repeating-linear-gradient(135deg,rgba(255,143,31,.025) 0 8px,transparent 8px 16px); }
.item-card[data-state="equipped"] { border-color:rgba(6,255,165,.5); box-shadow:inset 3px 0 rgba(6,255,165,.7); }
.item-card__status,.item-card__reason,.item-card__action,.item-card__equipped { display:block; }
.item-card__status { color:var(--phosphor); font:8px var(--font-m); letter-spacing:.12em; }
.item-card[data-state="locked"] .item-card__status { color:var(--warn); }
.item-card__reason,.item-card__equipped { margin-top:7px; color:rgba(239,234,247,.62); font-size:8px; }
.item-card__action { margin-top:9px; color:var(--ice); font:8px var(--font-m); }
button.item-card:hover,button.item-card:focus-visible { border-color:var(--ice); background-color:rgba(76,201,240,.07); }
@media (max-width:700px) {
  .catalog-intro { align-items:flex-start; flex-direction:column; }
  .catalog-toolbar { top:-10px; }
  .catalog-toolbar label,.catalog-toolbar input { width:100%; }
  .catalog-selection { position:sticky; z-index:5; bottom:-10px; max-height:55vh; overflow:auto; box-shadow:0 -18px 42px rgba(0,0,0,.7); }
}
```

Set `.item-card` to `min-height: 184px` and `padding: 14px 14px 30px`; keep the energy value at `right: 10px; bottom: 8px` so the new status and action lines never overlap it.

- [ ] **Step 7: Run focused tests and confirm GREEN**

Run:

```powershell
npm run test:frontend -- tests/frontend/screens.spec.js tests/frontend/components.spec.js
```

Expected: PASS; slot chooser dispatches only the clicked index and locked cards remain inspectable.

- [ ] **Step 8: Commit Task 2**

```powershell
git add src/ui/screens/hangar-screen.js src/styles/hangar.css tests/frontend/screens.spec.js tests/frontend/components.spec.js
git commit -m "feat: add filterable hangar catalogs"
```

### Task 3: Reuse the live loadout persistence path

**Files:**
- Modify: `src/app/bootstrap.js:1411-1510`
- Modify: `tests/frontend/screens.spec.js:157-280`

**Interfaces:**
- Consumes: `createHangarScreen(..., { loadout, onEquip })` from Task 2.
- Produces in `bootstrap.js`: local `persistLoadout(mutate): Promise<{ok:boolean,message?:string}>` shared by catalog and Loadout tab.
- The callback must refresh `metaSave`, rerender the existing `hangar`, and return `{ok:true}` only after save and reload succeed.

- [ ] **Step 1: Add a failing screen test for a rejected equip result**

```js
test("keeps the slot chooser open and announces a rejected equip result", async () => {
  const container = root();
  const screen = createHangarScreen(container, {
    ships: [{ id: "vesper", slot: "ship", name: "Vesper", unlockSource: "starter" }],
    weapons: [], modules: [], reactors: [], loadout: catalogLoadout,
    isUnlocked: () => true,
    onEquip: vi.fn().mockResolvedValue({ ok: false, message: "Vesper kann nicht ausgerüstet werden" })
  });
  screen.show("Schiffe");
  container.querySelector('[data-item-id="vesper"]').click();
  container.querySelector("[data-catalog-equip]").click();

  await vi.waitFor(() => expect(container.querySelector("[data-catalog-message]").textContent).toContain("kann nicht ausgerüstet werden"));
  expect(container.querySelector("[data-catalog-selection]").hidden).toBe(false);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
npm run test:frontend -- tests/frontend/screens.spec.js
```

Expected: FAIL until the selection message and failed-result restoration are complete.

- [ ] **Step 3: Move `persistLoadout` to shared hangar scope**

Immediately before `const hangar = createHangarScreen(...)`, define:

```js
const persistLoadout = async mutate => {
  try {
    const next = structuredClone(resolvePrimaryLoadout(metaSave));
    if (mutate(next) === false) return { ok: false, message: "Ausrüsten wurde abgelehnt." };
    await services.save.update(save => { save.loadouts.primary = next; });
    metaSave = await services.save.load();
    hangar.render();
    return { ok: true };
  } catch (error) {
    legacyRuntime.ui.toast(error.message);
    return { ok: false, message: error.message };
  }
};
```

The closure may reference `hangar` declared on the next statement because it is invoked only after `createHangarScreen` has returned.

- [ ] **Step 4: Provide live loadout and catalog equip callback**

Add to the `createHangarScreen` options:

```js
loadout: () => resolvePrimaryLoadout(metaSave),
onEquip: (slot, index, definitionId) => persistLoadout(next => {
  services.loadouts.equip(next, slot, index, createLoadoutItem(slot, index, definitionId));
  return true;
}),
```

Remove the inner `persistLoadout` declaration from the `tab === "Loadout"` branch and keep its existing `onEquip` / `onUnequip` calls pointed at the shared function. Do not alter blueprint behavior or unrelated tab rendering.

- [ ] **Step 5: Complete failed-result restoration in the catalog**

Ensure the Task 2 slot handler restores `state.selectedItemId`, re-enables the clicked slot control and writes `result.message` into `<p data-catalog-message role="status" aria-live="polite"></p>` when `result.ok !== true`. No `render()` occurs on failure, so the current selection and filter UI stay visible.

- [ ] **Step 6: Run focused and complete frontend tests**

Run:

```powershell
npm run test:frontend -- tests/frontend/screens.spec.js
npm run test:frontend
```

Expected: both commands PASS with zero failed tests.

- [ ] **Step 7: Commit Task 3**

```powershell
git add src/app/bootstrap.js src/ui/screens/hangar-screen.js tests/frontend/screens.spec.js
git commit -m "feat: equip catalog items through loadout service"
```

### Task 4: Browser and release verification

**Files:**
- Modify only if verification reveals a regression directly caused by Tasks 1-3.

**Interfaces:**
- Consumes the completed catalog UI and existing Vite app.
- Produces fresh verification evidence; no new feature behavior.

- [ ] **Step 1: Run the full release gates**

```powershell
npm run test:frontend
npm run build
git diff --check
```

Expected: Vitest reports zero failures, all three validators and Vite build exit 0, and `git diff --check` prints nothing.

- [ ] **Step 2: Verify desktop behavior in the in-app browser**

At the running local Vite URL:

1. open Menü → Schiffe;
2. confirm title, purpose, unlock progress, search, status filters and card state labels are visible before selection;
3. select a locked card and confirm its unlock path appears without an equip action;
4. select an available ship and equip it into the shown current ship slot;
5. repeat for Waffen;
6. open Module, combine search, availability and type filters;
7. select an available module, confirm all matching slots and current occupants, then choose a specific slot;
8. confirm the chosen card changes to „AUSGERÜSTET“ and filters remain unchanged;
9. inspect browser console errors and require no new errors from these interactions.

- [ ] **Step 3: Verify the narrow mobile layout**

Use a viewport of exactly 390×844 and confirm:

1. catalog title, progress and controls wrap without horizontal page overflow;
2. cards are one column and retain visible state labels;
3. the selection area behaves as the bottom sheet, remains keyboard reachable and does not cover its slot actions;
4. long module names and unlock reasons remain readable;
5. reset filters restores all entries.

- [ ] **Step 4: Inspect the final scope**

```powershell
git status --short
git diff --stat HEAD~3..HEAD
git log -4 --oneline
```

Expected: only the files listed in this plan plus the approved spec/plan commits are present; no unrelated working-tree edits exist.
