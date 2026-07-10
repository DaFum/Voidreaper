# Forged Abyss Geometry and World Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Schiffe, Module, Gegner, Kampfarena und Sektorkarte in der freigegebenen Forged-Abyss-Sprache vollständig überarbeiten, ohne Gameplay-, Hitbox-, Blueprint- oder Save-Verträge zu verändern.

**Architecture:** Gemeinsame Canvas-Primitiven und registrierte visuelle Profile liefern deterministische Geometrie an spezialisierte Renderer. Ship Assembly, Legacy-Kampf und Sektorkarte teilen Paletten und Formregeln, bleiben aber in ihren bestehenden Owning Layers. Kleine lokale SVG-Masken ergänzen prozedurale Formen; Fallbacks bleiben rein prozedural.

**Tech Stack:** Vanilla JavaScript mit ES-Modulen, Canvas 2D, DOM/CSS, lokale SVG-Assets, Vite und bestehende Content-/Assembly-Validatoren.

## Global Constraints

- Keine neue Grafikbibliothek und kein Wechsel von Canvas 2D.
- Keine Änderungen an Gameplaywerten, Kollisionen, Trefferzonen, Montageports, Blueprints oder Save-Schema.
- Keine persistierte Zufallsgeometrie und keine Save-Migration.
- Keine neuen Testdateien, Testverzeichnisse, Testframeworks oder automatisierten UI-Tests.
- Visuelle Varianten verwenden stabile bestehende Seeds.
- Farbe ist nie das einzige Zustandssignal.
- Low LOD bewahrt Außenkontur, Kern, Waffenrichtung und Schaden.
- Fehlende Profile oder Assets warnen einmalig und verwenden einen sichtbaren prozeduralen Fallback.
- Finale Prüfung: `npm run validate-content`, `npm run validate:assembly`, `npm run build` und Browserkontrollen.

---

## Dateistruktur

### Neue Dateien

- `src/render/forged-abyss/primitives.js` — gemeinsame Pfad-, Panzerungs-, Kern-, Riss- und Energiebahn-Primitiven.
- `src/render/forged-abyss/palettes.js` — semantische Forged-Abyss- und Regionspaletten.
- `src/render/forged-abyss/seeded-visuals.js` — kleine deterministische Hash- und Variantenhelfer.
- `src/render/enemies/enemy-visual-profiles.js` — Profile für alle Legacy-Gegnerrollen.
- `src/render/enemies/enemy-renderer.js` — Canvas-Renderer für Gegner, Elites, Schilde und Bosse.
- `src/render/regions/region-visual-profiles.js` — regionale Boden-, Dekorations- und Atmosphärenprofile.
- `src/render/regions/region-world-renderer.js` — prozedurale Weltgeometrie für die fünf Regionen.
- `src/ui/components/sector-map-connections.js` — SVG-Verbindungslayer aus tatsächlichen `next`-IDs.
- `public/assets/forged-abyss/void-rift.svg` — kleine einfärbbare Detailmaske.
- `public/assets/forged-abyss/armor-scar.svg` — kleine einfärbbare Bruchmaske.

### Geänderte Dateien

- `src/render/ship-assembly/core-renderer.js`
- `src/render/ship-assembly/module-core-renderers.js`
- `src/render/ship-assembly/connector-renderer.js`
- `src/render/ship-assembly/adaptive-armor-renderer.js`
- `src/render/ship-assembly/assembly-renderer.js`
- `src/features/ship-assembly/geometry/core-geometry-builders.js`
- `src/features/ship-assembly/content/ship-frame-assembly-profiles.js`
- `src/legacy/legacy-runtime.js`
- `src/render/world-renderer.js`
- `src/ui/screens/sector-map-screen.js`
- `src/ui/components/sector-node.js`
- `src/styles/map.css`
- `scripts/validate-ship-assembly-content.mjs`

---

### Task 1: Gemeinsame Forged-Abyss-Renderbasis

**Files:**
- Create: `src/render/forged-abyss/primitives.js`
- Create: `src/render/forged-abyss/palettes.js`
- Create: `src/render/forged-abyss/seeded-visuals.js`
- Create: `public/assets/forged-abyss/void-rift.svg`
- Create: `public/assets/forged-abyss/armor-scar.svg`

**Interfaces:**
- Produces: `traceChamferedPlate(ctx, options)`, `traceRib(ctx, options)`, `drawVoidCore(ctx, options)`, `drawCracks(ctx, options)`, `drawEnergyRail(ctx, options)`.
- Produces: `FORGED_ABYSS_PALETTE`, `REGION_VISUAL_PALETTES`, `mergeVisualPalette(overrides)`.
- Produces: `visualHash(value)`, `seededUnit(seed, channel)`, `seededChoice(items, seed, channel)`.

- [ ] **Step 1: Implement deterministic visual helpers**

```js
export function visualHash(value) {
  let hash = 2166136261;
  for (const char of String(value ?? 0)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
```

- [ ] **Step 2: Define semantic palettes**

```js
export const FORGED_ABYSS_PALETTE = Object.freeze({
  hull: "#0b131c", metal: "#182a36", structure: "#20323d",
  armor: "#557584", edge: "#b9f7ff", energy: "#48e5c2",
  void: "#4a155f", fault: "#dd63ff", damage: "#ff4d6d",
  cockpit: "#eefcff", thruster: "#ffad42"
});
```

- [ ] **Step 3: Implement focused Canvas primitives**

Each primitive begins its own path, restores alpha/dash state, and accepts explicit dimensions rather than reading gameplay state.

- [ ] **Step 4: Add two monochrome SVG detail masks**

Use `currentColor`, a fixed `viewBox="0 0 64 64"`, no scripts, no embedded raster data and no external references.

- [ ] **Step 5: Verify module imports**

Run: `node -e "import('./src/render/forged-abyss/primitives.js').then(()=>console.log('forged primitives ok'))"`
Expected: `forged primitives ok`

- [ ] **Step 6: Commit**

```powershell
git add src/render/forged-abyss public/assets/forged-abyss
git commit -m "feat: add forged abyss render primitives"
```

### Task 2: Schiffskerne und Materialtiefe

**Files:**
- Modify: `src/features/ship-assembly/geometry/core-geometry-builders.js`
- Modify: `src/features/ship-assembly/content/ship-frame-assembly-profiles.js`
- Modify: `src/render/ship-assembly/core-renderer.js`
- Modify: `src/render/ship-assembly/assembly-renderer.js`

**Interfaces:**
- Consumes: Task-1-Primitiven und `mergeVisualPalette`.
- Produces: optionale `structurePaths`, `detailPaths` und `voidPaths` auf `coreGeometry`.
- Preserves: alle vorhandenen `portAnchors`, `bounds` und `coreHitZone`-Werte.

- [ ] **Step 1: Extend the core geometry factory**

```js
const core = ({
  hullPaths, armorPaths, lightPaths, cockpitPath, reactorPath,
  thrusterAnchors, portAnchors, bounds: coreBounds,
  structurePaths = [], detailPaths = [], voidPaths = []
}) => ({ hullPaths, armorPaths, lightPaths, cockpitPath, reactorPath,
  thrusterAnchors, portAnchors, bounds: coreBounds,
  structurePaths, detailPaths, voidPaths });
```

- [ ] **Step 2: Add frame-specific secondary geometry**

Add at least two structural/detail paths per frame and a Void motif only where it supports the frame identity. Do not change anchors or bounds.

- [ ] **Step 3: Render ordered material layers**

Render structure below hull, armor above hull, details without glow, then energy/Void paths with bounded shadow blur.

- [ ] **Step 4: Merge shared and frame palettes**

Replace the private renderer default with `mergeVisualPalette(geometrySnapshot.shipStyle?.palette)`.

- [ ] **Step 5: Validate all ten frames**

Run: `npm run validate:assembly`
Expected: `[assembly] validated ... 10 ship frames, 14 visual families`

- [ ] **Step 6: Commit**

```powershell
git add src/features/ship-assembly/geometry/core-geometry-builders.js src/features/ship-assembly/content/ship-frame-assembly-profiles.js src/render/ship-assembly/core-renderer.js src/render/ship-assembly/assembly-renderer.js
git commit -m "feat: deepen forged abyss ship geometry"
```

### Task 3: Modulkerne, Verbinder und adaptive Panzerung

**Files:**
- Modify: `src/render/ship-assembly/module-core-renderers.js`
- Modify: `src/render/ship-assembly/connector-renderer.js`
- Modify: `src/render/ship-assembly/adaptive-armor-renderer.js`

**Interfaces:**
- Consumes: Task-1-Primitiven.
- Preserves: die 14 bestehenden Renderer-IDs und alle Modul-Hit-Shapes.
- Produces: formbasierte Aktivitäts-, Hitze-, Schaden- und Korruptionssignale.

- [ ] **Step 1: Replace the neutral fallback**

Use a chamfered housing, central cross-rail and striped warning mark so missing profiles are visible without looking like a valid family.

- [ ] **Step 2: Strengthen all 14 functional silhouettes**

Weapons expose muzzle direction; docks expose bays; cooling exposes ribs; reactors expose coils; shield/orbit profiles expose rings; anomalous profiles expose apertures.

- [ ] **Step 3: Add state overlays without changing geometry size**

Use broken contour for damage, hatch marks for faulting, directed rail motion for activity and thermal fins for heat.

- [ ] **Step 4: Upgrade connectors and armor**

Render structural spine, edge rails, energy cable, mounting collars and family-specific armor plates while retaining existing connector coordinates.

- [ ] **Step 5: Validate profile coverage**

Run: `npm run validate:assembly`
Expected: no missing renderer or damage behavior.

- [ ] **Step 6: Commit**

```powershell
git add src/render/ship-assembly/module-core-renderers.js src/render/ship-assembly/connector-renderer.js src/render/ship-assembly/adaptive-armor-renderer.js
git commit -m "feat: refine module and connector visuals"
```

### Task 4: Gegnerprofile und Forged-Abyss-Gegnerrenderer

**Files:**
- Create: `src/render/enemies/enemy-visual-profiles.js`
- Create: `src/render/enemies/enemy-renderer.js`
- Modify: `src/legacy/legacy-runtime.js`

**Interfaces:**
- Produces: `ENEMY_VISUAL_PROFILES`, `resolveEnemyVisualProfile(type)`.
- Produces: `renderForgedEnemy(ctx, enemy, options)`.
- Consumes: existing Legacy enemy fields `type, r, vx, vy, hp, maxHp, color, elite, boss, shielded, birth, hitT, wobble`.

- [ ] **Step 1: Register every existing Legacy enemy type**

Profiles cover `swarm`, `chaser`, `orbiter`, `spitter`, `tank`, `splitter`, `bomber`, `shield`, `warper`, `leech` and `boss`.

- [ ] **Step 2: Implement role-readable silhouettes**

Use profile families `drone`, `lancer`, `orbiter`, `artillery`, `bulwark`, `carrier`, `rammer`, `warden`, `rift`, `parasite` and `architect`.

- [ ] **Step 3: Render states**

Birth affects scale/alpha; velocity determines facing; hit flash changes fill briefly; elites add a segmented outer frame; shielded enemies add a frontal arc; bosses activate multiple rings and phase-like movement.

- [ ] **Step 4: Replace only the draw path**

```js
drawEnemy(e, frozen) {
  renderForgedEnemy(cx, e, {
    frozen,
    target: this.player,
    shade: color => this.shade(color),
    reducedMotion: REDUCED
  });
}
```

- [ ] **Step 5: Verify imports and build**

Run: `npm run build`
Expected: validators and Vite build complete without error.

- [ ] **Step 6: Commit**

```powershell
git add src/render/enemies src/legacy/legacy-runtime.js
git commit -m "feat: add forged abyss enemy silhouettes"
```

### Task 5: Regionale Arenageometrie

**Files:**
- Create: `src/render/regions/region-visual-profiles.js`
- Create: `src/render/regions/region-world-renderer.js`
- Modify: `src/render/world-renderer.js`
- Modify: `src/legacy/legacy-runtime.js`

**Interfaces:**
- Produces: `resolveRegionVisualProfile(regionId)`.
- Produces: `renderRegionWorld(ctx, { regionId, camera, viewport, arena, time, seed, reducedMotion })`.
- Preserves: kollisionsfreie Dekoration und vorhandene Regionsregeln.

- [ ] **Step 1: Define five regional shape dialects**

Each profile defines `grid`, `motifs`, `accent`, `density`, `parallax` and `motion`.

- [ ] **Step 2: Implement seeded decorative geometry**

Draw only a bounded set of visible tiles/motifs based on seed and camera tile coordinates; never allocate particles per frame.

- [ ] **Step 3: Keep hazards readable**

Decorations use low alpha, avoid solid fills near the player center and remain behind zones, projectiles, enemies and ships.

- [ ] **Step 4: Integrate the modular renderer**

Replace the single vertical-line loop in `src/render/world-renderer.js` and call the same region renderer from the active Legacy draw path using the current campaign region when available.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: successful production build.

- [ ] **Step 6: Commit**

```powershell
git add src/render/regions src/render/world-renderer.js src/legacy/legacy-runtime.js
git commit -m "feat: render distinct forged abyss regions"
```

### Task 6: Sektorkarte als echter Pfadgraph

**Files:**
- Create: `src/ui/components/sector-map-connections.js`
- Modify: `src/ui/screens/sector-map-screen.js`
- Modify: `src/ui/components/sector-node.js`
- Modify: `src/styles/map.css`

**Interfaces:**
- Produces: `createSectorMapConnections(nodes, nodeElements)`.
- Consumes: vorhandene `node.next`-IDs und DOM-Positionen.
- Preserves: vorhandene Auswahl- und Bestätigungslogik.

- [ ] **Step 1: Render nodes by layer**

Set `data-layer`, `data-index`, `data-node-type` and arrange desktop columns from the existing layer values.

- [ ] **Step 2: Draw actual graph edges**

Create an `svg.sector-map__connections` with one path for each valid source/target pair. Use `ResizeObserver` to refresh geometry after layout changes.

- [ ] **Step 3: Add geometric node sigils**

Render node-type-specific CSS/SVG sigils, text labels and pattern-based state indicators. Unknown nodes keep a masked silhouette.

- [ ] **Step 4: Make mobile graph horizontally traceable**

Use a scrollable graph canvas with fixed layer spacing instead of collapsing connections into an unrelated two-column grid.

- [ ] **Step 5: Verify interaction manually**

Open a campaign map, select one reachable node, confirm that only actual `next` relations are drawn and the second click still confirms.

- [ ] **Step 6: Commit**

```powershell
git add src/ui/components/sector-map-connections.js src/ui/screens/sector-map-screen.js src/ui/components/sector-node.js src/styles/map.css
git commit -m "feat: render sector map as path graph"
```

### Task 7: Validatoren, Fallbacks und reduzierte Bewegung

**Files:**
- Modify: `scripts/validate-ship-assembly-content.mjs`
- Modify: `src/render/enemies/enemy-visual-profiles.js`
- Modify: `src/render/regions/region-visual-profiles.js`
- Modify: `src/styles/map.css`

**Interfaces:**
- Validates: zehn Kerngeometrien, 14 Modulrenderer, elf Legacy-Gegnerprofile, fünf Regionsprofile und zwei lokale SVG-Assets.

- [ ] **Step 1: Export profile ID helpers**

Expose immutable ID lists from enemy and region profile modules for static validation.

- [ ] **Step 2: Extend the assembly validator**

Import the profile ID lists and use `existsSync` for the two expected asset paths. Emit exact missing-ID errors.

- [ ] **Step 3: Apply reduced-motion rules**

Disable pulsing, rotating and dash-offset animation while preserving static core, damage and connection indicators.

- [ ] **Step 4: Run validators**

Run: `npm run validate-content`
Expected: content validation succeeds.

Run: `npm run validate:assembly`
Expected: assembly validation includes 11 enemy profiles, 5 region profiles and 2 detail assets.

- [ ] **Step 5: Commit**

```powershell
git add scripts/validate-ship-assembly-content.mjs src/render/enemies/enemy-visual-profiles.js src/render/regions/region-visual-profiles.js src/styles/map.css
git commit -m "chore: validate forged abyss visual profiles"
```

### Task 8: Browserabnahme und finale Korrekturen

**Files:**
- Modify only files from Tasks 1–7 when a concrete visual or runtime defect is reproduced.
- Update: `docs/manual-validation/adaptive-ship-assembly.md` with dated results.

**Interfaces:**
- Verifies: Kampf, fünf Regionen, zehn Schiffe, 14 Module, Sektorkarte, Werkbank, Bauplanminiatur, LOD, Mobilansicht und reduzierte Bewegung.

- [ ] **Step 1: Run the production gate**

Run: `npm run build`
Expected: content validator, assembly validator and Vite build succeed.

- [ ] **Step 2: Inspect the game in the in-app browser**

Check the initial ship, standard enemies, elite/shielded variants, projectiles and arena at desktop size. Read browser console errors after interaction.

- [ ] **Step 3: Inspect assembly galleries**

Use `globalThis.__VOIDREAPER_DEBUG__.assembly` scenarios `visual-gallery`, `maximum-construction`, `damage-single` and `lod-stress`.

- [ ] **Step 4: Inspect map and mobile layout**

Verify real connection paths, selection state and detail panel at desktop and a viewport below 700 px.

- [ ] **Step 5: Correct reproduced defects surgically**

For each defect, record the exact view/state, change only the owning renderer/style, rerun the relevant validator and repeat the browser observation.

- [ ] **Step 6: Record manual results**

Add the current date, build identifier and result to the existing manual validation table without changing unrelated rows.

- [ ] **Step 7: Final verification**

Run: `npm run build`
Expected: successful production build with no new browser-console errors.

- [ ] **Step 8: Commit**

```powershell
git add src scripts docs/manual-validation/adaptive-ship-assembly.md public/assets/forged-abyss
git commit -m "feat: complete forged abyss visual overhaul"
```
