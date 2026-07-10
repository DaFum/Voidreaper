# VOIDREAPER Adaptive Ship Assembly Phase 1: Graph and Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Projektvorgabe:** Für dieses Feature werden keine Testdateien, kein Testverzeichnis und kein automatisiertes Testframework ergänzt. Kontrollschritte bestehen aus Produktions-Builds, statischer Content-Validierung, reproduzierbaren Entwicklungs-Szenarien und manueller Prüfung im integrierten Assembly-Debugmodus.

> **Verbindliche Gestaltungsregel:** „Handgestaltet“ bedeutet, dass der Coding Agent alle sichtbaren Modulkerne, Panzerungen, Ports, Streben, Leitungen, Animationen, Schadenszustände, Symbole und Oberflächen direkt im Code entwirft und implementiert. Externe Designer, nachzuliefernde Sprites und finale Platzhaltergeometrien sind ausgeschlossen.

**Goal:** Einen stabilen Konstruktionsgraphen, strukturelle Ports, Modul-Assembly-Metadaten, Kompatibilitätsregeln und deterministische Platzierungsvorschläge aufbauen, ohne das bestehende Equipment-System zu duplizieren.

**Architecture:** Die Phase ergänzt einen separaten Assembly-State, dessen Knoten vorhandene Item-Instanzen referenzieren. Alle Mutationen laufen über einen `AssemblyService`, der Graphinvarianten erzwingt und Events emittiert. Moduldefinitionen erhalten Assembly-Metadaten oder werden über finale, vom Coding Agent gestaltete Profilregeln aufgelöst.

**Tech Stack:** Bestehende ES-Module, Event Bus, Content Registry, Equipment Registry, Run State und Vite.

---

## Ziel-Dateistruktur

```text
src/features/ship-assembly/
  index.js
  assembly-events.js
  model/
    assembly-constants.js
    create-assembly-state.js
    assembly-graph.js
    assembly-service.js
    assembly-selectors.js
    assembly-snapshot.js
  content/
    assembly-profile-registry.js
    module-assembly-resolver.js
    ship-frame-assembly-profiles.js
    module-visual-profiles.js
    port-profiles.js
  placement/
    compatibility-service.js
    placement-score.js
    placement-suggestion-service.js
    collision-bounds.js
scripts/
  validate-ship-assembly-content.mjs
```

### Task 1: Assembly-Konstanten, Events und State-Factory anlegen

**Files:**
- Create: `src/features/ship-assembly/assembly-events.js`
- Create: `src/features/ship-assembly/model/assembly-constants.js`
- Create: `src/features/ship-assembly/model/create-assembly-state.js`
- Create: `src/features/ship-assembly/index.js`

- [ ] **Step 1: Gemeinsame Enums definieren**

```js
export const SIZE_CLASS = Object.freeze({ S: 'S', M: 'M', L: 'L', XL: 'XL' });
export const MOUNT_TYPE = Object.freeze({
  AXIAL: 'axial',
  LATERAL: 'lateral',
  DORSAL: 'dorsal',
  VENTRAL: 'ventral',
  RADIAL: 'radial',
  STRUCTURAL: 'structural'
});
export const DAMAGE_STATE = Object.freeze({
  INTACT: 'intact',
  ARMOR_BROKEN: 'armor-broken',
  CORE_DISRUPTED: 'core-disrupted',
  DETACHED: 'detached'
});
export const MAX_BRANCH_DEPTH = 4;
export const MAX_VISIBLE_SEGMENTS = 18;
```

- [ ] **Step 2: Events definieren**

```js
export const ASSEMBLY_EVENTS = Object.freeze({
  CHANGED: 'assembly:changed',
  MODULE_MOUNTED: 'assembly:module-mounted',
  MODULE_MOVED: 'assembly:module-moved',
  MODULE_DETACHED: 'assembly:module-detached',
  BRANCH_DETACHED: 'assembly:branch-detached',
  DAMAGE_CHANGED: 'assembly:damage-changed',
  GEOMETRY_READY: 'assembly:geometry-ready',
  FLIGHT_PROFILE_CHANGED: 'assembly:flight-profile-changed',
  BLUEPRINT_APPLIED: 'assembly:blueprint-applied'
});
```

- [ ] **Step 3: State-Factory anlegen**

```js
export function createAssemblyState({ shipFrameId, rootNode, rootPorts }) {
  return {
    version: 1,
    shipFrameId,
    rootNodeId: rootNode.nodeId,
    nodesById: { [rootNode.nodeId]: rootNode },
    connectionsById: {},
    portsById: Object.fromEntries(rootPorts.map(port => [port.portId, port])),
    secondaryConnectionsById: {},
    detachedItems: [],
    visualRevision: 0,
    structuralRevision: 0,
    activeBlueprintId: null
  };
}
```

- [ ] **Step 4: Barrel-Exports anlegen**

```js
export * from './assembly-events.js';
export * from './model/assembly-constants.js';
export { createAssemblyState } from './model/create-assembly-state.js';
```

- [ ] **Step 5: Produktions-Build prüfen**

Run: `npm run build`  
Expected: Die neuen Dateien werden ohne Importfehler verarbeitet.

- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly
git commit -m "feat: add ship assembly state primitives"
```

### Task 2: Graphoperationen und Invarianten implementieren

**Files:**
- Create: `src/features/ship-assembly/model/assembly-graph.js`
- Create: `src/features/ship-assembly/model/assembly-snapshot.js`

- [ ] **Step 1: Graphleser implementieren**

```js
export function getChildren(state, nodeId) {
  return Object.values(state.nodesById).filter(node => node.parentNodeId === nodeId);
}

export function getBranchNodeIds(state, rootNodeId) {
  const result = [];
  const queue = [rootNodeId];
  while (queue.length) {
    const nodeId = queue.shift();
    result.push(nodeId);
    queue.push(...getChildren(state, nodeId).map(node => node.nodeId));
  }
  return result;
}

export function getDepth(state, nodeId) {
  let depth = 0;
  let current = state.nodesById[nodeId];
  while (current?.parentNodeId) {
    depth += 1;
    current = state.nodesById[current.parentNodeId];
  }
  return depth;
}
```

- [ ] **Step 2: Invarianten als klare Fehler implementieren**

```js
export function assertAssemblyInvariants(state) {
  if (!state.nodesById[state.rootNodeId]) throw new Error('Assembly root node is missing');
  const moduleOwners = new Set();
  for (const node of Object.values(state.nodesById)) {
    if (node.nodeId !== state.rootNodeId && !state.nodesById[node.parentNodeId]) {
      throw new Error(`Missing parent for node ${node.nodeId}`);
    }
    if (node.moduleInstanceId) {
      if (moduleOwners.has(node.moduleInstanceId)) throw new Error(`Duplicate module owner ${node.moduleInstanceId}`);
      moduleOwners.add(node.moduleInstanceId);
    }
    if (getDepth(state, node.nodeId) > 4) throw new Error(`Branch depth exceeded at ${node.nodeId}`);
  }
}
```

- [ ] **Step 3: Zyklenschutz für Primärverbindungen ergänzen**

```js
export function wouldCreateCycle(state, nodeId, newParentNodeId) {
  if (nodeId === newParentNodeId) return true;
  return getBranchNodeIds(state, nodeId).includes(newParentNodeId);
}
```

- [ ] **Step 4: Unveränderlichen Snapshot für Leser erzeugen**

```js
export function createAssemblySnapshot(state) {
  return structuredClone({
    ...state,
    nodesById: state.nodesById,
    portsById: state.portsById,
    connectionsById: state.connectionsById,
    secondaryConnectionsById: state.secondaryConnectionsById
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/model
git commit -m "feat: add assembly graph invariants and snapshots"
```

### Task 3: AssemblyService als einzige Schreibschnittstelle implementieren

**Files:**
- Create: `src/features/ship-assembly/model/assembly-service.js`
- Create: `src/features/ship-assembly/model/assembly-selectors.js`

- [ ] **Step 1: Service-Konstruktor definieren**

```js
import { ASSEMBLY_EVENTS } from '../assembly-events.js';
import { assertAssemblyInvariants, getBranchNodeIds, wouldCreateCycle } from './assembly-graph.js';
import { createAssemblySnapshot } from './assembly-snapshot.js';

export function createAssemblyService({ state, eventBus, idFactory }) {
  const getSnapshot = () => createAssemblySnapshot(state);
  const requireNode = nodeId => {
    const node = state.nodesById[nodeId];
    if (!node) throw new Error(`Unknown assembly node: ${nodeId}`);
    return node;
  };
  const publish = (eventName, payload, { structural = true, visual = true } = {}) => {
    if (structural) state.structuralRevision += 1;
    if (visual) state.visualRevision += 1;
    assertAssemblyInvariants(state);
    eventBus.emit(eventName, payload);
    eventBus.emit(ASSEMBLY_EVENTS.CHANGED, getSnapshot());
  };
  const publishDamageChange = nodeId => publish(
    ASSEMBLY_EVENTS.DAMAGE_CHANGED,
    { nodeId },
    { structural: false, visual: true }
  );

  // Die in den folgenden Schritten definierten Funktionen werden am Ende
  // dieser Aufgabe über die gemeinsame öffentliche API zurückgegeben.
```

- [ ] **Step 2: `mountModule` vollständig implementieren**

```js
mountModule({ moduleInstanceId, definitionId, parentPort, assemblyProfile, transform }) {
  if (Object.values(state.nodesById).some(node => node.moduleInstanceId === moduleInstanceId)) {
    throw new Error(`Module already mounted: ${moduleInstanceId}`);
  }
  const nodeId = idFactory.create('assembly-node');
  const node = {
    nodeId,
    parentNodeId: parentPort.parentNodeId,
    parentPortId: parentPort.portId,
    moduleInstanceId,
    definitionId,
    visualProfileId: assemblyProfile.visualProfileId,
    sizeClass: assemblyProfile.sizeClass,
    mountType: parentPort.mountType,
    localPosition: transform.position,
    localRotation: transform.rotation,
    armorIntegrity: assemblyProfile.damage.armor,
    coreIntegrity: assemblyProfile.damage.core,
    damageState: 'intact',
    childPortIds: []
  };
  state.nodesById[nodeId] = node;
  state.portsById[parentPort.portId] = { ...parentPort, occupiedByNodeId: nodeId };
  for (const childPortTemplate of assemblyProfile.childPorts) {
    const portId = idFactory.create('assembly-port');
    state.portsById[portId] = { ...childPortTemplate, portId, parentNodeId: nodeId, occupiedByNodeId: null };
    node.childPortIds.push(portId);
  }
  publish(ASSEMBLY_EVENTS.MODULE_MOUNTED, { nodeId, moduleInstanceId });
  return nodeId;
}
```

- [ ] **Step 3: `moveNode` mit Zyklus- und Portprüfung implementieren**

```js
moveNode({ nodeId, targetPort, transform }) {
  const node = state.nodesById[nodeId];
  if (!node || nodeId === state.rootNodeId) throw new Error('Node cannot be moved');
  if (wouldCreateCycle(state, nodeId, targetPort.parentNodeId)) throw new Error('Move would create a cycle');
  const oldPort = state.portsById[node.parentPortId];
  state.portsById[oldPort.portId] = { ...oldPort, occupiedByNodeId: null };
  state.portsById[targetPort.portId] = { ...targetPort, occupiedByNodeId: nodeId };
  state.nodesById[nodeId] = {
    ...node,
    parentNodeId: targetPort.parentNodeId,
    parentPortId: targetPort.portId,
    localPosition: transform.position,
    localRotation: transform.rotation
  };
  publish(ASSEMBLY_EVENTS.MODULE_MOVED, { nodeId, targetPortId: targetPort.portId });
}
```

- [ ] **Step 4: Sekundärverbindung implementieren**

```js
addSecondaryConnection({ sourceNodeId, targetNodeId, profile }) {
  const connectionId = idFactory.create('assembly-bridge');
  state.secondaryConnectionsById[connectionId] = {
    connectionId,
    sourceNodeId,
    targetNodeId,
    structuralStrength: profile.structuralStrength,
    energyThroughput: profile.energyThroughput,
    visualConnectorType: profile.visualConnectorType
  };
  publish(ASSEMBLY_EVENTS.CHANGED, { connectionId });
  return connectionId;
}
```

- [ ] **Step 5: Abtrennung als Zustandsänderung plus Branch-Liste implementieren**

```js
detachNode({ nodeId, detachBranch = false }) {
  if (nodeId === state.rootNodeId) throw new Error('Root node cannot be detached');
  const nodeIds = detachBranch ? getBranchNodeIds(state, nodeId) : [nodeId];
  for (const currentId of nodeIds) {
    const node = state.nodesById[currentId];
    state.detachedItems.push({
      moduleInstanceId: node.moduleInstanceId,
      definitionId: node.definitionId,
      formerNodeId: currentId,
      damageState: 'detached'
    });
    delete state.nodesById[currentId];
  }
  publish(detachBranch ? ASSEMBLY_EVENTS.BRANCH_DETACHED : ASSEMBLY_EVENTS.MODULE_DETACHED, { nodeIds });
  return nodeIds;
}
```

- [ ] **Step 6: Finale öffentliche Service-API zurückgeben**

```js
return {
  getSnapshot,
  requireNode,
  publishDamageChange,
  mountModule,
  moveNode,
  addSecondaryConnection,
  detachNode
};
}
```

- [ ] **Step 7: Selektoren für echte Segmente, freie Ports und Modulbesitz ergänzen**

- [ ] **Step 8: Commit**

```bash
git add src/features/ship-assembly/model
git commit -m "feat: add transactional assembly service"
```

### Task 4: Schiffskern-Assembly-Profile für alle zehn Schiffe definieren

**Files:**
- Create: `src/features/ship-assembly/content/assembly-profile-registry.js`
- Create: `src/features/ship-assembly/content/ship-frame-assembly-profiles.js`
- Modify: `src/app/bootstrap.js`

- [ ] **Step 1: Profilregistry definieren**

```js
export function createAssemblyProfileRegistry() {
  const shipFrames = new Map();
  const moduleProfiles = new Map();
  const portProfiles = new Map();
  return {
    registerShipFrame: profile => shipFrames.set(profile.id, Object.freeze(profile)),
    registerModuleProfile: profile => moduleProfiles.set(profile.id, Object.freeze(profile)),
    registerPortProfile: profile => portProfiles.set(profile.id, Object.freeze(profile)),
    getShipFrame: id => shipFrames.get(id) ?? null,
    getModuleProfile: id => moduleProfiles.get(id) ?? null,
    getPortProfile: id => portProfiles.get(id) ?? null,
    getCounts: () => ({ shipFrames: shipFrames.size, moduleProfiles: moduleProfiles.size, portProfiles: portProfiles.size })
  };
}
```

- [ ] **Step 2: Gemeinsames Schiffsprofilformat festlegen**

```js
const baseProfile = {
  coreHitZone: { shape: 'capsule', length: 40, radius: 15 },
  maxBranchDepth: 4,
  maxVisibleSegments: 18,
  dimensionLimits: { width: 310, length: 360 },
  initialPorts: [],
  style: { armorFamily: '', lightPattern: '', connectorFamily: '' }
};
```

- [ ] **Step 3: Zehn finale Profile codieren**

Für `vesper`, `bastion`, `specter`, `furnace`, `reliquary`, `shepherd`, `harrow`, `vector`, `gravewright` und `null-choir` werden jeweils konkrete Kernabmessungen, zwei bis vier Startports, Richtungen, Traglasten, Energieklassen, Dimensionsgrenzen und Stilfamilien eingetragen. Der Coding Agent gestaltet die Root-Konturen als Canvas-Pfade und verwendet keine generische Dreiecksform als finales Profil.

Beispiel Vesper:

```js
export const SHIP_FRAME_ASSEMBLY_PROFILES = [{
  ...baseProfile,
  id: 'vesper',
  coreGeometryId: 'core-vesper-spear',
  dimensionLimits: { width: 280, length: 340 },
  initialPorts: [
    { key: 'left-wing', sizeClass: 'M', mountType: 'lateral', direction: { x: -1, y: 0.15 }, loadCapacity: 8, energyClass: 'standard' },
    { key: 'right-wing', sizeClass: 'M', mountType: 'lateral', direction: { x: 1, y: 0.15 }, loadCapacity: 8, energyClass: 'standard' },
    { key: 'dorsal', sizeClass: 'S', mountType: 'dorsal', direction: { x: 0, y: -1 }, loadCapacity: 4, energyClass: 'precision' },
    { key: 'rear', sizeClass: 'L', mountType: 'structural', direction: { x: 0, y: 1 }, loadCapacity: 12, energyClass: 'standard' }
  ],
  style: { armorFamily: 'vesper-blade', lightPattern: 'split-cyan', connectorFamily: 'tapered' }
}];
```

- [ ] **Step 4: Profile in `bootstrap()` registrieren**
- [ ] **Step 5: Debug-Konsole gibt exakt zehn Schiffsprofile aus**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/content src/app/bootstrap.js
git commit -m "feat: add ten ship core assembly profiles"
```

### Task 5: Finale Modul-Assembly-Metadaten und Profilresolver implementieren

**Files:**
- Create: `src/features/ship-assembly/content/module-visual-profiles.js`
- Create: `src/features/ship-assembly/content/module-assembly-resolver.js`
- Create: `src/features/ship-assembly/content/port-profiles.js`
- Modify: `src/features/equipment/equipment-registry.js`

- [ ] **Step 1: Visuelle Profilfamilien definieren**

Mindestens folgende final gestaltete Familien werden codiert:

```js
export const MODULE_VISUAL_PROFILES = [
  { id: 'weapon-linear', rendererId: 'core-linear-weapon', sizeClass: 'M', preferredMounts: ['axial', 'lateral'] },
  { id: 'weapon-missile', rendererId: 'core-missile-rack', sizeClass: 'L', preferredMounts: ['lateral', 'dorsal'] },
  { id: 'weapon-beam', rendererId: 'core-beam-emitter', sizeClass: 'L', preferredMounts: ['axial', 'dorsal'] },
  { id: 'weapon-mine', rendererId: 'core-mine-bay', sizeClass: 'M', preferredMounts: ['ventral', 'rear'] },
  { id: 'drone-bay', rendererId: 'core-drone-dock', sizeClass: 'L', preferredMounts: ['lateral', 'dorsal'] },
  { id: 'shield-emitter', rendererId: 'core-shield-ring', sizeClass: 'M', preferredMounts: ['lateral', 'radial'] },
  { id: 'cooling-array', rendererId: 'core-cooling-ribs', sizeClass: 'M', preferredMounts: ['rear', 'dorsal'] },
  { id: 'reactor-aux', rendererId: 'core-reactor-chamber', sizeClass: 'L', preferredMounts: ['structural', 'dorsal'] },
  { id: 'sensor-array', rendererId: 'core-sensor-lens', sizeClass: 'S', preferredMounts: ['dorsal', 'axial'] },
  { id: 'utility-node', rendererId: 'core-utility-cluster', sizeClass: 'S', preferredMounts: ['dorsal', 'ventral', 'lateral'] },
  { id: 'structure-spine', rendererId: 'core-structural-spine', sizeClass: 'L', preferredMounts: ['structural'] },
  { id: 'void-anomaly', rendererId: 'core-void-aperture', sizeClass: 'L', preferredMounts: ['dorsal', 'radial'] },
  { id: 'orbit-hub', rendererId: 'core-orbit-bearing', sizeClass: 'M', preferredMounts: ['radial', 'dorsal'] },
  { id: 'corrupted-node', rendererId: 'core-corrupted-organ', sizeClass: 'M', preferredMounts: ['structural', 'dorsal'] }
];
```

- [ ] **Step 2: Profilauflösung aus Definition, Kategorie und Tags implementieren**

```js
export function resolveModuleAssemblyProfile(moduleDefinition) {
  const explicit = moduleDefinition.assembly;
  if (explicit) return explicit;
  const tags = new Set((moduleDefinition.tags ?? []).map(tag => typeof tag === 'string' ? tag : tag.id));
  if (tags.has('Drone')) return buildProfile('drone-bay', moduleDefinition);
  if (tags.has('Beam')) return buildProfile('weapon-beam', moduleDefinition);
  if (tags.has('Mine')) return buildProfile('weapon-mine', moduleDefinition);
  if (tags.has('Shield')) return buildProfile('shield-emitter', moduleDefinition);
  if (tags.has('Cooling')) return buildProfile('cooling-array', moduleDefinition);
  if (tags.has('Void') || tags.has('Anomaly')) return buildProfile('void-anomaly', moduleDefinition);
  if (tags.has('Explosive') || tags.has('Homing')) return buildProfile('weapon-missile', moduleDefinition);
  if (tags.has('Projectile') || tags.has('Critical')) return buildProfile('weapon-linear', moduleDefinition);
  return buildProfile('utility-node', moduleDefinition);
}
```

- [ ] **Step 3: `buildProfile` erzeugt keine Platzhalter, sondern final definierte Geometrieparameter**

```js
function buildProfile(profileId, definition) {
  return {
    visualProfileId: profileId,
    variantSeed: definition.id,
    sizeClass: definition.assemblySizeClass ?? 'M',
    mountTypes: definition.assemblyMountTypes ?? ['lateral', 'dorsal'],
    loadDemand: definition.assemblyLoadDemand ?? 4,
    energyClass: definition.assemblyEnergyClass ?? 'standard',
    mass: definition.assemblyMass ?? 6,
    damage: definition.assemblyDamage ?? { armor: 40, core: 24 },
    childPorts: definition.assemblyChildPorts ?? []
  };
}
```

- [ ] **Step 4: Equipment Registry speichert das aufgelöste Profil einmalig beim Registrieren**
- [ ] **Step 5: Für einzigartige Relikte und Strukturadapter explizite Overrides ergänzen**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/content src/features/equipment/equipment-registry.js
git commit -m "feat: resolve final assembly profiles for all modules"
```

### Task 6: Strukturelle Kompatibilitätsprüfung implementieren

**Files:**
- Create: `src/features/ship-assembly/placement/collision-bounds.js`
- Create: `src/features/ship-assembly/placement/compatibility-service.js`

- [ ] **Step 1: Größenkompatibilität definieren**

```js
const SIZE_RANK = { S: 1, M: 2, L: 3, XL: 4 };
export function fitsSize(moduleSize, portSize) {
  return SIZE_RANK[moduleSize] <= SIZE_RANK[portSize];
}
```

- [ ] **Step 2: Bounds-Prüfung definieren**

```js
export function overlapsAny(candidateBounds, occupiedBounds, margin = 4) {
  return occupiedBounds.some(bounds => !(
    candidateBounds.maxX + margin < bounds.minX ||
    candidateBounds.minX - margin > bounds.maxX ||
    candidateBounds.maxY + margin < bounds.minY ||
    candidateBounds.minY - margin > bounds.maxY
  ));
}
```

- [ ] **Step 3: Vollständige Prüfroutine implementieren**

```js
export function createCompatibilityService({ profileRegistry }) {
  return {
    evaluate({ state, moduleProfile, port, geometrySnapshot }) {
      const reasons = [];
      if (port.occupiedByNodeId) reasons.push('occupied');
      if (!fitsSize(moduleProfile.sizeClass, port.sizeClass)) reasons.push('size');
      if (!moduleProfile.mountTypes.includes(port.mountType)) reasons.push('mount-type');
      if (moduleProfile.loadDemand > port.loadCapacity) reasons.push('load');
      if (!port.acceptedEnergyClasses.includes(moduleProfile.energyClass)) reasons.push('energy-class');
      if (port.branchDepth >= 4) reasons.push('branch-depth');
      const candidate = geometrySnapshot.previewBounds(moduleProfile, port);
      if (overlapsAny(candidate, geometrySnapshot.occupiedBounds)) reasons.push('overlap');
      return { compatible: reasons.length === 0, reasons, candidate };
    }
  };
}
```

- [ ] **Step 4: UI-lesbare deutsche Begründungen zentral mappen**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/placement
git commit -m "feat: add structural module compatibility rules"
```

### Task 7: Platzierungsbewertung und Vorschläge implementieren

**Files:**
- Create: `src/features/ship-assembly/placement/placement-score.js`
- Create: `src/features/ship-assembly/placement/placement-suggestion-service.js`

- [ ] **Step 1: Einzelkriterien normalisieren**

```js
export function scorePlacement(metrics) {
  return (
    metrics.functionalPosition * 2.0 +
    metrics.mountQuality * 1.5 +
    metrics.balance * 1.2 +
    metrics.energyPath * 1.0 +
    metrics.protection * 0.9 +
    metrics.fireLane * 1.4 +
    metrics.blueprintMatch * 1.6 -
    metrics.collisionRisk * 3.0 -
    metrics.branchPenalty * 1.1 -
    metrics.massAsymmetry * 1.0
  );
}
```

- [ ] **Step 2: Vorschlagservice implementieren**

```js
export function createPlacementSuggestionService({ compatibilityService, geometryService, flightProfileService }) {
  return {
    suggest({ state, moduleProfile, blueprint }) {
      const geometry = geometryService.getSnapshot();
      return Object.values(state.portsById)
        .map(port => ({ port, result: compatibilityService.evaluate({ state, moduleProfile, port, geometrySnapshot: geometry }) }))
        .filter(entry => entry.result.compatible)
        .map(entry => {
          const metrics = geometryService.measurePlacement(entry.port, moduleProfile, blueprint);
          const flightDelta = flightProfileService.previewPlacement(entry.port, moduleProfile);
          return {
            portId: entry.port.portId,
            score: scorePlacement({ ...metrics, massAsymmetry: flightDelta.lateralImbalance }),
            metrics,
            flightDelta,
            reasons: geometryService.explainPlacement(metrics, flightDelta)
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    }
  };
}
```

- [ ] **Step 3: Begründungen aus Messwerten erzeugen**

Beispiele: `Beste Waffenlinie`, `Gut geschützt`, `Kürzeste Energieleitung`, `Verbessert Balance`, `Öffnet zwei Utility-Ports`, `Erhöht Trägheit`, `Exponierte Außenposition`.

- [ ] **Step 4: Gleicher Run- und Bauplanzustand liefert dieselbe Sortierung**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/placement
git commit -m "feat: add explainable placement suggestions"
```

### Task 8: Assembly in Run- und Equipment-Lebenszyklus integrieren

**Files:**
- Modify: `src/runtime/create-run-state.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/features/equipment/loadout-service.js`
- Modify: `src/features/inventory/run-inventory.js`

- [ ] **Step 1: Run-State erhält `assembly` und `pendingAssemblyItems`**
- [ ] **Step 2: Beim Run-Start Root-Knoten aus dem aktiven Schiffprofil erzeugen**
- [ ] **Step 3: Kernnahe Startausrüstung über feste Startports montieren**
- [ ] **Step 4: Neue kleine Run-Items erzeugen einen Pending-Mount-Eintrag statt sofortiger unsichtbarer Ausrüstung**
- [ ] **Step 5: Gameplaywerte bleiben über Loadout- und Equipment-Service aktiv; Assembly speichert nur Referenzen**
- [ ] **Step 6: Manuelles Szenario**

Run `npm run dev`, neuen Run starten und in der Konsole prüfen:

```js
window.__VOIDREAPER_DEBUG__.assembly.getSnapshot()
```

Erwartet: ein Root-Knoten, zwei bis vier freie Ports und eindeutige Modulreferenzen.

- [ ] **Step 7: Commit**

```bash
git add src/runtime src/app src/features/equipment src/features/inventory
git commit -m "feat: connect ship assembly to run equipment lifecycle"
```

### Task 9: Statische Assembly-Content-Validierung ergänzen

**Files:**
- Create: `scripts/validate-ship-assembly-content.mjs`
- Modify: `package.json`

- [ ] **Step 1: Validator lädt registrierbare Contentdefinitionen und prüft Pflichtfelder**

```js
const errors = [];
for (const definition of allEquipmentDefinitions) {
  const profile = resolveModuleAssemblyProfile(definition);
  if (!profile.visualProfileId) errors.push(`${definition.id}: visualProfileId missing`);
  if (!profile.sizeClass) errors.push(`${definition.id}: sizeClass missing`);
  if (!Array.isArray(profile.mountTypes) || profile.mountTypes.length === 0) errors.push(`${definition.id}: mountTypes missing`);
  if (!Number.isFinite(profile.mass)) errors.push(`${definition.id}: mass missing`);
  if (!profile.damage?.armor || !profile.damage?.core) errors.push(`${definition.id}: damage profile missing`);
}
if (errors.length) {
  console.error(errors.join('
'));
  process.exit(1);
}
console.log(`Validated ${allEquipmentDefinitions.length} assembly profiles`);
```

- [ ] **Step 2: Package-Script ergänzen**

```json
{
  "scripts": {
    "validate:assembly": "node scripts/validate-ship-assembly-content.mjs"
  }
}
```

- [ ] **Step 3: Validierung ausführen**

Run: `npm run validate:assembly`  
Expected: Alle registrierten Equipmentdefinitionen besitzen ein finales Assembly-Profil.

- [ ] **Step 4: Produktions-Build ausführen**

Run: `npm run build`  
Expected: Build ohne Fehler.

- [ ] **Step 5: Commit**

```bash
git add scripts package.json
git commit -m "chore: validate ship assembly content metadata"
```
