# VOIDREAPER Adaptive Ship Assembly Phase 2: Geometry and Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Projektvorgabe:** Für dieses Feature werden keine Testdateien, kein Testverzeichnis und kein automatisiertes Testframework ergänzt. Kontrollschritte bestehen aus Produktions-Builds, statischer Content-Validierung, reproduzierbaren Entwicklungs-Szenarien und manueller Prüfung im integrierten Assembly-Debugmodus.

> **Verbindliche Gestaltungsregel:** „Handgestaltet“ bedeutet, dass der Coding Agent alle sichtbaren Modulkerne, Panzerungen, Ports, Streben, Leitungen, Animationen, Schadenszustände, Symbole und Oberflächen direkt im Code entwirft und implementiert. Externe Designer, nachzuliefernde Sprites und finale Platzhaltergeometrien sind ausgeschlossen.

**Goal:** Den hybriden Schiffs-Assembler als performantes Canvas-Render-System umsetzen: handgestaltete Funktionskerne, prozedurale Verbindungen, schiffsspezifische adaptive Panzerung, Ausgleichselemente, Aktivitätsanimationen und Schadensdarstellung.

**Architecture:** Der Geometry Service erzeugt nach Strukturänderungen einen unveränderlichen Geometrie-Snapshot. Renderer lesen ausschließlich diesen Snapshot und Laufzeitanimationen. Handgestaltete Funktionskern-Renderer arbeiten mit wiederverwendbaren Pfadprimitiven; adaptive Übergänge werden aus Ports, Stilprofilen und Verbindungsmetriken erzeugt.

**Tech Stack:** Canvas 2D, bestehender Canvas Renderer, Event Bus, Assembly Graph, bestehende Kamera- und Effektservices.

---

## Ziel-Dateistruktur

```text
src/features/ship-assembly/geometry/
  vector-math.js
  path-primitives.js
  core-geometry-builders.js
  module-geometry-builders.js
  connector-geometry-builder.js
  adaptive-armor-generator.js
  balance-decorator.js
  hit-shape-preview.js
  geometry-cache.js
  assembly-geometry-service.js
src/render/ship-assembly/
  assembly-renderer.js
  core-renderer.js
  module-core-renderers.js
  connector-renderer.js
  adaptive-armor-renderer.js
  activity-animation-renderer.js
  damage-overlay-renderer.js
  assembly-lod-policy.js
  assembly-thumbnail-renderer.js
```

### Task 1: Vektor-, Pfad- und Transformationsprimitive erstellen

**Files:**
- Create: `src/features/ship-assembly/geometry/vector-math.js`
- Create: `src/features/ship-assembly/geometry/path-primitives.js`

- [ ] **Step 1: Lokale Vektorhelfer definieren**

```js
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v, value) => ({ x: v.x * value, y: v.y * value });
export const length = v => Math.hypot(v.x, v.y);
export const normalize = v => {
  const size = length(v) || 1;
  return { x: v.x / size, y: v.y / size };
};
export const perpendicular = v => ({ x: -v.y, y: v.x });
export const rotate = (v, angle) => ({
  x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
  y: v.x * Math.sin(angle) + v.y * Math.cos(angle)
});
```

- [ ] **Step 2: Wiederverwendbare Canvas-Pfade codieren**

```js
export function traceTaperedPlate(ctx, { length, frontWidth, rearWidth, notch = 0 }) {
  ctx.beginPath();
  ctx.moveTo(0, -frontWidth / 2);
  ctx.lineTo(length - notch, -rearWidth / 2);
  ctx.lineTo(length, 0);
  ctx.lineTo(length - notch, rearWidth / 2);
  ctx.lineTo(0, frontWidth / 2);
  ctx.closePath();
}

export function traceCapsule(ctx, length, radius) {
  ctx.beginPath();
  ctx.arc(-length / 2, 0, radius, Math.PI / 2, Math.PI * 1.5);
  ctx.arc(length / 2, 0, radius, Math.PI * 1.5, Math.PI / 2);
  ctx.closePath();
}
```

- [ ] **Step 3: Weitere finale Primitive implementieren**

`traceBrace`, `traceJoint`, `tracePipe`, `traceLens`, `traceCoil`, `traceLauncherDoor`, `traceCoolingFin`, `traceThrusterNozzle`, `traceShieldRing`, `traceBrokenPlateEdge`.

- [ ] **Step 4: Primitive verwenden relative Koordinaten und keine festen Bildschirmpositionen**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/geometry
git commit -m "feat: add procedural ship geometry primitives"
```

### Task 2: Handgestaltete Kerngeometrien der zehn Schiffe implementieren

**Files:**
- Create: `src/features/ship-assembly/geometry/core-geometry-builders.js`
- Create: `src/render/ship-assembly/core-renderer.js`
- Modify: `src/features/ship-assembly/content/ship-frame-assembly-profiles.js`

- [ ] **Step 1: Builder-Registry definieren**

```js
const builders = new Map();
export function registerCoreGeometry(id, builder) { builders.set(id, builder); }
export function buildCoreGeometry(id, context) {
  const builder = builders.get(id);
  if (!builder) throw new Error(`Unknown core geometry: ${id}`);
  return builder(context);
}
```

- [ ] **Step 2: Zehn unterschiedliche Pfadkonstruktionen codieren**

Jeder Builder liefert mindestens:

```js
{
  hullPaths: [],
  armorPaths: [],
  lightPaths: [],
  cockpitPath: null,
  reactorPath: null,
  thrusterAnchors: [],
  portAnchors: {},
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
}
```

- [ ] **Step 3: Beispiel für Vesper als vollständige codierte Form**

```js
registerCoreGeometry('core-vesper-spear', () => ({
  hullPaths: [
    { kind: 'polygon', points: [{x:0,y:-34},{x:18,y:12},{x:10,y:38},{x:-10,y:38},{x:-18,y:12}] },
    { kind: 'polygon', points: [{x:-12,y:4},{x:-46,y:24},{x:-20,y:28},{x:0,y:16}] },
    { kind: 'polygon', points: [{x:12,y:4},{x:46,y:24},{x:20,y:28},{x:0,y:16}] }
  ],
  armorPaths: [
    { kind: 'line', from: {x:0,y:-28}, to: {x:0,y:30}, width: 3 },
    { kind: 'line', from: {x:-14,y:14}, to: {x:-38,y:24}, width: 2 },
    { kind: 'line', from: {x:14,y:14}, to: {x:38,y:24}, width: 2 }
  ],
  lightPaths: [{ kind: 'line', from: {x:0,y:-20}, to: {x:0,y:22}, width: 2 }],
  cockpitPath: { kind: 'lens', center: {x:0,y:-6}, radiusX: 7, radiusY: 12 },
  reactorPath: { kind: 'lens', center: {x:0,y:21}, radiusX: 5, radiusY: 8 },
  thrusterAnchors: [{x:-8,y:39},{x:8,y:39}],
  portAnchors: { 'left-wing': {x:-42,y:22,rotation:-1.3}, 'right-wing': {x:42,y:22,rotation:1.3}, dorsal: {x:0,y:-30,rotation:Math.PI}, rear: {x:0,y:40,rotation:0} },
  bounds: { minX:-48,minY:-36,maxX:48,maxY:44 }
}));
```

- [ ] **Step 4: Bastion, Specter, Furnace, Reliquary, Shepherd, Harrow, Vector, Gravewright und Null Choir erhalten eigene Formlogik, nicht nur Skalierungsvarianten**
- [ ] **Step 5: Core Renderer rendert Füllung, Kontur, Glühen, Cockpit, Reaktor und Thruster in getrennten Layern**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/geometry src/render/ship-assembly src/features/ship-assembly/content
git commit -m "feat: handcraft ten coded ship core geometries"
```

### Task 3: Handgestaltete Funktionskern-Renderer für Modulklassen erstellen

**Files:**
- Create: `src/features/ship-assembly/geometry/module-geometry-builders.js`
- Create: `src/render/ship-assembly/module-core-renderers.js`

- [ ] **Step 1: Renderer-Schnittstelle festlegen**

```js
export function createModuleCoreRendererRegistry() {
  const renderers = new Map();
  return {
    register: (id, renderer) => renderers.set(id, renderer),
    render(id, ctx, visualState) {
      const renderer = renderers.get(id);
      if (!renderer) throw new Error(`Unknown module core renderer: ${id}`);
      renderer(ctx, visualState);
    }
  };
}
```

- [ ] **Step 2: Vierzehn finale Klassenrenderings codieren**

`core-linear-weapon`, `core-missile-rack`, `core-beam-emitter`, `core-mine-bay`, `core-drone-dock`, `core-shield-ring`, `core-cooling-ribs`, `core-reactor-chamber`, `core-sensor-lens`, `core-utility-cluster`, `core-structural-spine`, `core-void-aperture`, `core-orbit-bearing`, `core-corrupted-organ`.

- [ ] **Step 3: Beispiel Rail-/Linearwaffe implementieren**

```js
registry.register('core-linear-weapon', (ctx, state) => {
  const size = state.size;
  ctx.save();
  ctx.rotate(state.rotation);
  ctx.fillStyle = state.palette.metal;
  ctx.strokeStyle = state.palette.edge;
  traceTaperedPlate(ctx, { length: size * 1.35, frontWidth: size * 0.42, rearWidth: size * 0.24, notch: size * 0.12 });
  ctx.fill();
  ctx.stroke();
  for (let index = 0; index < 3; index += 1) {
    const x = size * (0.18 + index * 0.28);
    ctx.globalAlpha = 0.35 + state.activity.charge * 0.65;
    ctx.strokeStyle = state.palette.energy;
    ctx.beginPath();
    ctx.ellipse(x, 0, size * 0.08, size * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
});
```

- [ ] **Step 4: Jeder Renderer nutzt `variantSeed`, um Formdetails deterministisch zu variieren**

Variation darf Plattenzahl, Rippenabstand, Linsenform, Klappenanordnung und Lichtmuster ändern, aber nicht die funktionale Lesbarkeit zerstören.

- [ ] **Step 5: Jeder Renderer unterstützt `intact`, `armor-broken`, `core-disrupted` und `detached-preview`**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/geometry/module-geometry-builders.js src/render/ship-assembly/module-core-renderers.js
git commit -m "feat: handcraft coded module function cores"
```

### Task 4: Verbindungsschicht und adaptive Panzerung implementieren

**Files:**
- Create: `src/features/ship-assembly/geometry/connector-geometry-builder.js`
- Create: `src/features/ship-assembly/geometry/adaptive-armor-generator.js`
- Create: `src/render/ship-assembly/connector-renderer.js`
- Create: `src/render/ship-assembly/adaptive-armor-renderer.js`

- [ ] **Step 1: Connector-Geometrie aus zwei Ankern berechnen**

```js
export function buildConnectorGeometry({ from, to, loadClass, energyClass, style }) {
  const direction = normalize(sub(to, from));
  const normal = perpendicular(direction);
  const distance = length(sub(to, from));
  const width = Math.max(4, loadClass * 1.4);
  return {
    spine: { from, to, width },
    leftRail: { from: add(from, scale(normal, width)), to: add(to, scale(normal, width * 0.65)) },
    rightRail: { from: add(from, scale(normal, -width)), to: add(to, scale(normal, -width * 0.65)) },
    cable: { from: add(from, scale(normal, width * 0.25)), to: add(to, scale(normal, width * 0.2)), energyClass },
    distance,
    style
  };
}
```

- [ ] **Step 2: Adaptive Panzerplatten aus Connector und Schiffsstil erzeugen**

```js
export function generateAdaptiveArmor(connector, shipStyle) {
  const plateCount = Math.max(1, Math.ceil(connector.distance / 22));
  return Array.from({ length: plateCount }, (_, index) => {
    const t0 = index / plateCount;
    const t1 = (index + 1) / plateCount;
    return {
      family: shipStyle.armorFamily,
      start: interpolate(connector.spine.from, connector.spine.to, t0),
      end: interpolate(connector.spine.from, connector.spine.to, t1),
      taper: 1 - index / (plateCount * 2),
      overlap: 3
    };
  });
}
```

- [ ] **Step 3: Stilfamilien vollständig codieren**

`tapered-blade`, `heavy-block`, `phase-shard`, `thermal-open`, `void-organic`, `carrier-frame`, `reaper-curve`, `streamline`, `industrial-truss`, `null-fracture`.

- [ ] **Step 4: Energie- und Kühlleitungen entsprechend `energyClass` und Modulrolle rendern**
- [ ] **Step 5: Kann die Panzerung nicht erzeugt werden, verwendet der Renderer einen stilgerechten Standard-Connector und protokolliert die Modul-ID**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/geometry src/render/ship-assembly
git commit -m "feat: generate adaptive armor and connectors"
```

### Task 5: Funktional ausbalancierte Asymmetrie visualisieren

**Files:**
- Create: `src/features/ship-assembly/geometry/balance-decorator.js`
- Modify: `src/render/ship-assembly/adaptive-armor-renderer.js`

- [ ] **Step 1: Visuelle Imbalance messen**

```js
export function calculateVisualImbalance(nodes) {
  return nodes.reduce((sum, node) => sum + node.worldPosition.x * Math.max(1, node.visualMass), 0);
}
```

- [ ] **Step 2: Dekorationsart nach realem Gegenstück wählen**

```js
export function buildBalanceDecorators({ nodes, shipStyle }) {
  const imbalance = calculateVisualImbalance(nodes);
  if (Math.abs(imbalance) < 40) return [];
  const heavySide = Math.sign(imbalance);
  const candidates = nodes.filter(node => Math.sign(node.worldPosition.x) === heavySide);
  return candidates.slice(0, 3).map((node, index) => ({
    decoratorId: `balance-${node.nodeId}-${index}`,
    kind: chooseDecoratorKind(node.visualProfileId, shipStyle),
    position: { x: -node.worldPosition.x * 0.72, y: node.worldPosition.y * 0.86 },
    rotation: -node.worldRotation,
    scale: Math.min(0.7, 0.35 + node.visualMass / 40),
    gameplayRelevant: false
  }));
}
```

- [ ] **Step 3: Dekoratoren dürfen keine Waffenmündungen, vollständigen Schildringe oder aktive Modulkerne darstellen**
- [ ] **Step 4: Renderstile für Kühlrippen, Streben, Panzerplatten, Energieverteiler und Gegengewichte codieren**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/geometry/balance-decorator.js src/render/ship-assembly/adaptive-armor-renderer.js
git commit -m "feat: add non gameplay asymmetry balancing visuals"
```

### Task 6: Geometrie-Snapshot und Ast-Caches implementieren

**Files:**
- Create: `src/features/ship-assembly/geometry/geometry-cache.js`
- Create: `src/features/ship-assembly/geometry/assembly-geometry-service.js`

- [ ] **Step 1: Cache-Struktur definieren**

```js
export function createGeometryCache() {
  return {
    revision: -1,
    nodeGeometry: new Map(),
    connectionGeometry: new Map(),
    armorGeometry: new Map(),
    decorators: [],
    occupiedBounds: [],
    totalBounds: null
  };
}
```

- [ ] **Step 2: Service reagiert ausschließlich auf Assembly-Änderungen**

```js
export function createAssemblyGeometryService({ eventBus, assemblyService, profileRegistry }) {
  const cache = createGeometryCache();
  const rebuild = snapshot => {
    if (cache.revision === snapshot.structuralRevision) return;
    // Root, Knoten, Verbindungen, Panzerung und Dekoratoren aufbauen.
    cache.revision = snapshot.structuralRevision;
    eventBus.emit('assembly:geometry-ready', createGeometrySnapshot(cache));
  };
  eventBus.on('assembly:changed', rebuild);
  return {
    rebuildNow: () => rebuild(assemblyService.getSnapshot()),
    getSnapshot: () => createGeometrySnapshot(cache),
    previewBounds: (profile, port) => buildPreviewBounds(profile, port, cache),
    measurePlacement: (port, profile, blueprint) => measurePlacement(cache, port, profile, blueprint),
    explainPlacement: (metrics, delta) => explainPlacement(metrics, delta)
  };
}
```

- [ ] **Step 3: Nur geänderten Ast und abhängige Sekundärverbindungen invalidieren**
- [ ] **Step 4: Snapshot ist für Renderer schreibgeschützt**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/geometry
git commit -m "feat: cache assembly geometry by structural revision"
```

### Task 7: Assembly Renderer und feste Layerreihenfolge integrieren

**Files:**
- Create: `src/render/ship-assembly/assembly-renderer.js`
- Modify: `src/render/entity-renderer.js`
- Modify: `src/render/canvas-renderer.js`

- [ ] **Step 1: Layerreihenfolge codieren**

```js
export const ASSEMBLY_RENDER_LAYERS = Object.freeze([
  'lower-structure',
  'ventral-modules',
  'rear-connectors',
  'core-hull',
  'module-cores',
  'adaptive-armor',
  'moving-parts',
  'energy-effects',
  'damage-effects',
  'target-markers'
]);
```

- [ ] **Step 2: Renderer transformiert vom Schiffsursprung in Weltkoordinaten**
- [ ] **Step 3: Bestehende feste Spieler-Schiffsgrafik durch `assemblyRenderer.renderPlayerShip()` ersetzen**
- [ ] **Step 4: Kollisions- und Gameplaycode darf keine Canvas-Pfade lesen**
- [ ] **Step 5: Kern bleibt Kamerafokus**
- [ ] **Step 6: Commit**

```bash
git add src/render/ship-assembly src/render/entity-renderer.js src/render/canvas-renderer.js
git commit -m "feat: render player through adaptive ship assembler"
```

### Task 8: Aktivitätsanimationen codieren

**Files:**
- Create: `src/render/ship-assembly/activity-animation-renderer.js`
- Create: `src/features/ship-assembly/geometry/activity-state-adapter.js`

- [ ] **Step 1: Gameplaytelemetrie in visuelle Zustände übersetzen**

```js
export function buildModuleActivityState(moduleTelemetry) {
  return {
    charge: moduleTelemetry.chargeRatio ?? 0,
    cooldown: moduleTelemetry.cooldownRatio ?? 0,
    firing: Boolean(moduleTelemetry.firing),
    heat: moduleTelemetry.heatRatio ?? 0,
    energyFlow: moduleTelemetry.energyFlowRatio ?? 0,
    faulting: Boolean(moduleTelemetry.faulting),
    activeUnits: moduleTelemetry.activeUnits ?? 0
  };
}
```

- [ ] **Step 2: Klassenanimationen implementieren**

- Linearwaffe: Spulenladung und Mündungsrücklauf.
- Raketenrack: Klappen und belegte Schächte.
- Beam: Linsenfokus und Strahlvorbereitung.
- Drohnenbucht: Docktüren und Startschienen.
- Cooling: ausfahrende Rippen und Wärmepuls.
- Shield: pulsierende Ringsegmente und Feldlücken.
- Reactor: lastabhängige Kammerhelligkeit.
- Void/Corruption: unregelmäßige Kontur und versetzte Nachbilder.

- [ ] **Step 3: Animationen verwenden Simulationszeit statt `Date.now()`**
- [ ] **Step 4: Activity-Effekte respektieren reduzierte Bewegung und LOD**
- [ ] **Step 5: Commit**

```bash
git add src/render/ship-assembly src/features/ship-assembly/geometry/activity-state-adapter.js
git commit -m "feat: animate module function cores from gameplay telemetry"
```

### Task 9: Schadensüberlagerungen und Trümmerdarstellung vorbereiten

**Files:**
- Create: `src/render/ship-assembly/damage-overlay-renderer.js`
- Create: `src/render/ship-assembly/detached-debris-renderer.js`

- [ ] **Step 1: Damage Overlay erhält Zustand, Integritätswerte und Stilprofil**
- [ ] **Step 2: Risse, offene Kanten, Funkenpunkte und flackernde Energiepfade codieren**
- [ ] **Step 3: Detached Debris Renderer übernimmt Geometriesnapshot eines Moduls und simuliert nur Position, Rotation, Lebensdauer und Alpha**
- [ ] **Step 4: Trümmer werden nach wenigen Sekunden aus dem Effektpool entfernt**
- [ ] **Step 5: Commit**

```bash
git add src/render/ship-assembly
git commit -m "feat: add coded damage overlays and detached debris visuals"
```

### Task 10: LOD und Miniatur-Renderer implementieren

**Files:**
- Create: `src/render/ship-assembly/assembly-lod-policy.js`
- Create: `src/render/ship-assembly/assembly-thumbnail-renderer.js`

- [ ] **Step 1: Drei Detailstufen definieren**

```js
export function resolveAssemblyLod({ zoom, visibleSegments, particlePressure, userSetting }) {
  if (userSetting === 'low' || zoom < 0.68 || visibleSegments > 16 || particlePressure > 0.85) return 'low';
  if (userSetting === 'medium' || zoom < 0.9 || visibleSegments > 10 || particlePressure > 0.55) return 'medium';
  return 'high';
}
```

- [ ] **Step 2: LOD reduziert nur Kleinteile und Partikel**
- [ ] **Step 3: Funktionskern, Hauptpanzerung, Schadenszustand und aktive Zielmarkierung bleiben immer sichtbar**
- [ ] **Step 4: Thumbnail Renderer zeichnet denselben Snapshot in ein OffscreenCanvas mit neutralem Hintergrund**
- [ ] **Step 5: Commit**

```bash
git add src/render/ship-assembly
git commit -m "feat: add ship assembly lod and thumbnail rendering"
```

### Task 11: Phase-2-Abnahme ohne Testsystem

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/render/canvas-renderer.js`

- [ ] **Step 1: Geometry- und Render-Services in `bootstrap()` registrieren**
- [ ] **Step 2: Entwicklungs-Szenario `assemblyVisualGallery` bereitstellen**

Das Szenario zeigt nacheinander alle zehn Kerne und alle vierzehn Modulklassen in intaktem, beschädigtem und gestörtem Zustand.

- [ ] **Step 3: `npm run validate:assembly` ausführen**
- [ ] **Step 4: `npm run build` ausführen**
- [ ] **Step 5: Manuell prüfen**

1. Jede Schiffssilhouette ist ohne Beschriftung unterscheidbar.
2. Jede Modulklasse ist funktional erkennbar.
3. Adaptive Panzerung wechselt sichtbar mit dem Schiffsstil.
4. Einseitige Builds erhalten glaubwürdige, rein dekorative Gegenelemente.
5. Hohe, mittlere und niedrige LOD behalten spielrelevante Informationen.
6. Keine finale Geometrie besteht nur aus generischen Rechtecken oder Platzhaltersymbolen.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: complete adaptive ship visual assembler"
```
