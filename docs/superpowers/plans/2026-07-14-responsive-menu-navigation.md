# Responsive Menu Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every existing hangar area discoverable and operable on desktop and mobile, preserve context across detail paths, and remove the browser-confirmed mobile clipping in the sector map.

**Architecture:** Keep `createHangarScreen` as the single owner of area state and route both desktop tabs and the mobile picker through one `activateTab(name, { focus })` path. Add only presentation state for overflow and the mobile picker; existing screen renderers and services remain unchanged except for an explicit loadout empty-state navigation callback. Keep the sector map two-dimensional while making its sticky chrome and cards fit the containing hangar viewport.

**Tech Stack:** Vite 8, browser-native ES modules, Vitest with happy-dom, Node.js built-in test runner, CSS media queries, in-app Browser.

## Global Constraints

- Desktop and Mobile have the same quality bar.
- Keep the existing tab list as the semantic and technical navigation source.
- Do not change save version, save shape, game rules, content IDs, or catalog counts.
- Use the current 16 hangar area names; do not create a second route registry.
- Every behavior change starts with a focused failing test.
- Touch targets introduced or changed for mobile are at least 44 by 44 CSS pixels.
- Only browser-reproduced navigation, layout, focus, and state issues are in scope.
- Final verification is `npm run test:frontend`, `npm test`, `npm run build`, `git diff --check`, and desktop/mobile in-app Browser paths.

---

### Task 1: Shared Desktop and Mobile Hangar Navigation

**Files:**
- Modify: `tests/frontend/screens.spec.js`
- Modify: `src/ui/screens/hangar-screen.js`

**Interfaces:**
- Consumes: existing `TABS`, `renderTab(tab, content)`, `screen.show(name)`.
- Produces: desktop controls `data-hangar-scroll="previous|next"`, mobile trigger `data-hangar-area-toggle`, mobile choices `data-hangar-area`, and one internal `activateTab(name, { focus = false } = {})` path.

- [ ] **Step 1: Add failing desktop overflow and keyboard tests**

Add tests inside `describe("hangar screen")` which create the screen, assert both scroll controls exist with accessible labels, dispatch `keydown` with `ArrowRight`, `End`, and `Home` on the selected desktop tab, and verify `.hangar-stage.dataset.activeTab` becomes `Tutorials`, `Einstellungen`, and `Run starten` respectively.

```js
test("provides desktop overflow controls and keyboard tab navigation", () => {
  const container = root();
  createHangarScreen(container, catalogs);
  expect(container.querySelector('[data-hangar-scroll="previous"]').getAttribute("aria-label")).toBe("Vorherige Bereiche anzeigen");
  expect(container.querySelector('[data-hangar-scroll="next"]').getAttribute("aria-label")).toBe("Weitere Bereiche anzeigen");
  const selected = () => container.querySelector('[role="tab"][aria-selected="true"]');
  selected().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(container.querySelector(".hangar-stage").dataset.activeTab).toBe("Tutorials");
  selected().dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
  expect(container.querySelector(".hangar-stage").dataset.activeTab).toBe("Einstellungen");
  selected().dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
  expect(container.querySelector(".hangar-stage").dataset.activeTab).toBe("Run starten");
});
```

- [ ] **Step 2: Add a failing mobile picker focus test**

Assert the trigger exposes the active area, opens a labelled panel containing all 16 choices, selecting `Einstellungen` uses the normal render path, and Escape returns focus to the trigger.

```js
test("mobile area picker uses the shared tab path and restores focus", () => {
  const container = root(), renderTab = vi.fn();
  document.body.append(container);
  createHangarScreen(container, { ...catalogs, renderTab });
  const trigger = container.querySelector("[data-hangar-area-toggle]");
  expect(trigger.textContent).toContain("Run starten");
  trigger.click();
  const panel = container.querySelector("[data-hangar-area-panel]");
  expect(panel.hidden).toBe(false);
  expect(panel.querySelectorAll("[data-hangar-area]")).toHaveLength(16);
  panel.querySelector('[data-hangar-area="Einstellungen"]').click();
  expect(container.querySelector(".hangar-stage").dataset.activeTab).toBe("Einstellungen");
  container.querySelector("[data-hangar-area-toggle]").click();
  container.querySelector("[data-hangar-area-panel]").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  expect(document.activeElement).toBe(container.querySelector("[data-hangar-area-toggle]"));
  container.remove();
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: FAIL because the overflow controls, mobile picker, and keyboard activation do not exist.

- [ ] **Step 4: Implement the shared activation path and navigation markup**

In `createHangarScreen`, keep `TABS` as the only area registry. Add `activateTab`, render a desktop navigation shell with previous/next buttons and the existing tablist, and render a mobile trigger plus panel whose choices use `TABS`. Route desktop click, mobile click, keyboard navigation, and `show(name)` through `activateTab`.

Key behavior:

```js
const activateTab = (name, { focus = false } = {}) => {
  if (!TABS.includes(name)) return false;
  tab = name;
  focusTabAfterRender = focus;
  render();
  return true;
};

const adjacentTab = (key) => {
  const index = TABS.indexOf(tab);
  if (key === "Home") return TABS[0];
  if (key === "End") return TABS.at(-1);
  if (key === "ArrowLeft") return TABS[(index - 1 + TABS.length) % TABS.length];
  if (key === "ArrowRight") return TABS[(index + 1) % TABS.length];
  return null;
};
```

The mobile panel uses `role="dialog"`, `aria-label="Hangar-Bereich wählen"`, a visible close button, `aria-current="page"` on the active choice, and focus return to the trigger on close. Tab and Shift+Tab wrap between the panel's buttons.

- [ ] **Step 5: Implement overflow state and scroll controls**

After each render and each tablist scroll, calculate:

```js
const atStart = tabs.scrollLeft <= 1;
const atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 1;
previous.disabled = atStart;
next.disabled = atEnd;
shell.dataset.overflowStart = String(!atStart);
shell.dataset.overflowEnd = String(!atEnd);
```

The previous/next controls call `tabs.scrollBy({ left: direction * Math.max(180, tabs.clientWidth * 0.7), behavior: reducedMotion ? "auto" : "smooth" })`. The selected tab continues to call `scrollIntoView({ block: "nearest", inline: "nearest" })`.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS for all screen tests.

- [ ] **Step 7: Commit Task 1**

```powershell
git add -- tests/frontend/screens.spec.js src/ui/screens/hangar-screen.js
git commit -m "feat: add responsive hangar navigation"
```

---

### Task 2: Responsive Navigation Presentation

**Files:**
- Modify: `tests/frontend/start-menu.spec.js`
- Modify: `src/styles/hangar.css`

**Interfaces:**
- Consumes: Task 1 classes `.hangar-navigation`, `.hangar-tabs-shell`, `.hangar-area-toggle`, `.hangar-area-panel`, and overflow data attributes.
- Produces: desktop overflow affordances above 700 pixels and mobile area picker at 700 pixels and below.

- [ ] **Step 1: Add a failing stylesheet contract test**

Read `src/styles/hangar.css` in `tests/frontend/start-menu.spec.js` using `readFileSync` and assert the stylesheet contains selectors for both desktop overflow edges and the mobile picker breakpoint.

```js
test("hangar stylesheet exposes desktop overflow and mobile picker contracts", () => {
  expect(hangarCss).toContain('.hangar-tabs-shell[data-overflow-start="true"]');
  expect(hangarCss).toContain('.hangar-tabs-shell[data-overflow-end="true"]');
  expect(hangarCss).toContain(".hangar-area-toggle");
  expect(hangarCss).toMatch(/@media \(max-width: 700px\)[\s\S]*\.hangar-tabs-shell[\s\S]*display: none/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:frontend -- tests/frontend/start-menu.spec.js`

Expected: FAIL because the new responsive selectors are absent.

- [ ] **Step 3: Add desktop overflow styling**

Replace the permanent one-sided mask on `.hangar-tabs` with a three-column `.hangar-tabs-shell`. Style 44-pixel previous/next buttons, and use `::before`/`::after` gradient edges controlled by `data-overflow-start` and `data-overflow-end`. Keep the tablist scrollbar hidden and selected-tab treatment unchanged.

- [ ] **Step 4: Add the mobile picker layout**

Hide `.hangar-area-toggle` and `.hangar-area-panel` by default. At `max-width: 700px`, hide `.hangar-tabs-shell`, show the 44-pixel trigger, and render the opened panel as a two-column grid with 44-pixel choices. At `max-width: 430px`, use one column. Keep the panel within the hangar bounds, limit its height to the viewport, and allow vertical scrolling.

- [ ] **Step 5: Prevent navigation chrome from shrinking the content unpredictably**

Make `#hangar` positioned, set `.hangar-navigation` to `flex: 0 0 auto`, and keep `.hangar-stage` as the remaining flexible region. Ensure the mobile trigger text truncates safely rather than creating page-level horizontal overflow.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run: `npm run test:frontend -- tests/frontend/start-menu.spec.js tests/frontend/screens.spec.js`

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```powershell
git add -- tests/frontend/start-menu.spec.js src/styles/hangar.css
git commit -m "style: make hangar navigation responsive"
```

---

### Task 3: Actionable Loadout Empty State

**Files:**
- Modify: `tests/frontend/screens.spec.js`
- Modify: `src/ui/screens/loadout-screen.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Consumes: Task 1 `hangar.show(name)`.
- Produces: optional `onNavigate(areaName)` callback in `renderLoadoutScreen` and empty-state actions for `Forschung` and `Bergung`.

- [ ] **Step 1: Add a failing empty-state navigation test**

```js
test("empty slot picker explains recovery paths and navigates through the hangar", () => {
  const container = root(), onNavigate = vi.fn();
  renderLoadoutScreen(container, inspection, { slots: {} }, { choicesBySlot: {}, onNavigate });
  container.querySelector('[data-slot="passive"]').click();
  expect(container.querySelector("[data-picker-empty]").textContent).toContain("Forschung oder Bergung");
  container.querySelector('[data-picker-navigate="Forschung"]').click();
  expect(onNavigate).toHaveBeenCalledWith("Forschung");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: FAIL because `data-picker-empty` and `data-picker-navigate` are absent.

- [ ] **Step 3: Implement the minimal actionable empty state**

Extend the options parameter with `onNavigate = () => {}`. When `choices.length === 0`, render:

```html
<div class="loadout-picker__empty" data-picker-empty>
  <p>Keine freigeschalteten Komponenten. Neue Optionen erhältst du über Forschung oder Bergung.</p>
  <div>
    <button data-picker-navigate="Forschung">Forschung öffnen</button>
    <button data-picker-navigate="Bergung">Bergung öffnen</button>
  </div>
</div>
```

Handle `[data-picker-navigate]` clicks by calling `onNavigate(button.dataset.pickerNavigate)`.

- [ ] **Step 4: Route the callback through bootstrap**

Pass `onNavigate: (area) => hangar.show(area)` in the existing Loadout `renderLoadoutScreen` options. Do not add routing state or save mutations.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```powershell
git add -- tests/frontend/screens.spec.js src/ui/screens/loadout-screen.js src/app/bootstrap.js
git commit -m "feat: guide empty loadout recovery"
```

---

### Task 4: Mobile Sector Map Readability

**Files:**
- Modify: `tests/ui/service-navigation.test.js`
- Modify: `src/ui/components/sector-node.js`
- Modify: `src/styles/map.css`

**Interfaces:**
- Consumes: existing sector node definition and mobile horizontal graph.
- Produces: semantic `.sector-node__region`, `.sector-node__danger`, and `.sector-node__reward` spans inside the existing `<small>` block, plus container-relative sticky chrome.

- [ ] **Step 1: Add a failing semantic node-content test**

Create a visible node with a long region and reward, then assert the three semantic spans exist and retain their full text.

```js
test("sector nodes expose region, danger, and reward as responsive text units", () => {
  const button = createSectorNode({
    id: "n", type: "combat", layer: 0, index: 0,
    informationLevel: 2, regionId: "shattered-approach", danger: 3,
    reward: "Prototyp-Chance", corruptionDelta: 2
  }, { status: "reachable", selected: false, onSelect: () => {} });
  expect(button.querySelector(".sector-node__region").textContent).toBe("shattered approach");
  expect(button.querySelector(".sector-node__danger").textContent).toContain("Gefahr 3");
  expect(button.querySelector(".sector-node__reward").textContent).toContain("Prototyp-Chance");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/ui/service-navigation.test.js`

Expected: FAIL because the semantic spans do not exist.

- [ ] **Step 3: Split the visible node copy into responsive units**

Keep the button accessible name and all visible information, but replace the `<br>` string with three spans inside `<small>`. Hidden-signature nodes keep their current concise copy.

- [ ] **Step 4: Make mobile dimensions container-relative**

In the mobile map rule, replace `width: calc(100vw - 56px)` on the header and detail with `width: min(100%, calc(100vw - 56px))`. Increase the mobile layer width from 152 to 176 pixels, reduce the graph gap to retain a compact scroll distance, and let `.sector-node__region`, `.sector-node__danger`, and `.sector-node__reward` wrap without clipping. Add a visible horizontal-scroll hint through a non-interactive gradient edge on `.sector-map`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `node --test tests/ui/service-navigation.test.js`

Expected: PASS.

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```powershell
git add -- tests/ui/service-navigation.test.js src/ui/components/sector-node.js src/styles/map.css
git commit -m "fix: keep mobile sector signals readable"
```

---

### Task 5: Browser Paths and Final Verification

**Files:**
- Modify only if a browser-confirmed regression needs a focused test and minimal owning-file correction.

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: verified desktop and mobile menu behavior with no new console errors.

- [ ] **Step 1: Run the complete frontend suite**

Run: `npm run test:frontend`

Expected: all Vitest files pass with zero failures.

- [ ] **Step 2: Run the complete Node suite**

Run: `npm test`

Expected: all Node tests pass with zero failures.

- [ ] **Step 3: Run the production build and validators**

Run: `npm run build`

Expected: content, assembly, tutorial validation, and Vite build all exit 0.

- [ ] **Step 4: Verify the desktop browser matrix**

At the default desktop viewport, verify:

1. Start → Menu.
2. Previous/next controls visibly reflect scroll boundaries.
3. Run starten → Loadout → Forschung → Einstellungen.
4. The active tab is fully visible after each switch.
5. Arrow keys, Home, and End switch areas and preserve visible focus.
6. Empty Loadout slot → Forschung öffnen → Loadout → Bergung öffnen.
7. Back to Start returns to the home view.

Inspect console errors after the matrix; expected result is no new error entries.

- [ ] **Step 5: Verify the mobile browser matrix**

At 390 by 844 pixels, verify:

1. Start → Menu shows the compact area trigger instead of clipped tabs.
2. The panel lists all 16 areas, marks the active one, and closes through selection, Escape, and its close button.
3. Every panel action is at least 44 pixels high and no page-level horizontal overflow appears.
4. Loadout empty-state navigation works.
5. Checkpoint → sector map retains readable full region/reward copy and visible horizontal-navigation affordance.
6. Workbench opens and returns to the sector map.

Reset the temporary viewport after the matrix. Inspect console errors; expected result is no new error entries.

- [ ] **Step 6: Run whitespace verification**

Run: `git diff --check`

Expected: no output and exit 0.

- [ ] **Step 7: Commit any browser-only focused correction**

If Steps 4-5 required a correction, first add and run a focused failing regression, then commit only that correction with its test. If no correction was required, do not create an empty commit.

## Self-Review

- Spec coverage: responsive desktop navigation, mobile picker, shared activation, keyboard/focus behavior, actionable empty state, mobile map readability, save constraints, and complete browser/command verification map to Tasks 1-5.
- Placeholder scan: no deferred implementation decisions or unnamed error handling remain.
- Interface consistency: `hangar.show(name)` remains the public navigation method; the new Loadout callback consumes that method without introducing another route registry.
- Scope: no game rules, save schema, content counts, or unrelated screens are changed.
