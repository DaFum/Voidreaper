# VOIDREAPER Adaptive Ship Assembly Phase 4: Damage and Flight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Projektvorgabe:** Für dieses Feature werden keine Testdateien, kein Testverzeichnis und kein automatisiertes Testframework ergänzt. Kontrollschritte bestehen aus Produktions-Builds, statischer Content-Validierung, reproduzierbaren Entwicklungs-Szenarien und manueller Prüfung im integrierten Assembly-Debugmodus.

> **Verbindliche Gestaltungsregel:** „Handgestaltet“ bedeutet, dass der Coding Agent alle sichtbaren Modulkerne, Panzerungen, Ports, Streben, Leitungen, Animationen, Schadenszustände, Symbole und Oberflächen direkt im Code entwirft und implementiert. Externe Designer, nachzuliefernde Sprites und finale Platzhaltergeometrien sind ausgeschlossen.

**Goal:** Die sichtbare Konstruktion in mehrteilige Trefferzonen, dreistufige Modulschäden, Astabhängigkeiten, Reparatur sowie ein begrenztes, gut steuerbares Flugprofil überführen.

**Architecture:** Hit Shapes werden aus dem Geometrie-Snapshot erzeugt, aber getrennt von Canvas-Pfaden gespeichert. Der Damage Router entscheidet Trefferreihenfolge und emittiert Modulevents. Flight Profile wird nur nach Strukturänderungen neu berechnet und über geglättete Modifier in den bestehenden Player Controller eingespeist.

**Tech Stack:** Bestehendes Combat-, Collision-, Stats-, Fault-, Repair-, Camera- und Player-Movement-System plus Assembly Graph und Geometry Snapshot.

---

## Ziel-Dateistruktur

```text
src/features/ship-assembly/damage/
  hit-zone-builder.js
  hit-zone-index.js
  damage-router.js
  module-damage-service.js
  branch-failure-service.js
  repair-service.js
  module-fault-adapter.js
src/features/ship-assembly/flight/
  flight-profile-service.js
  mass-properties.js
  recoil-service.js
  flight-profile-smoother.js
  camera-fit-service.js
src/content/ship-assembly/
  module-damage-behaviors.js
  module-mass-profiles.js
  repair-actions.js
```

### Task 1: Getrennte Hit-Zone-Datenstrukturen erzeugen

**Files:**
- Create: `src/features/ship-assembly/damage/hit-zone-builder.js`
- Create: `src/features/ship-assembly/damage/hit-zone-index.js`

- [ ] **Step 1: Hit-Zone-Format definieren**

```js
export function createHitZone({ id, ownerType, ownerId, shape, transform, priority }) {
  return { id, ownerType, ownerId, shape, transform, priority, enabled: true };
}
```

- [ ] **Step 2: Kernzone aus Schiffprofil erzeugen**
- [ ] **Step 3: Modulzonen aus Profiltypen erzeugen**

Kreis für kompakte Module, Kapsel für Läufe und Streben, Polygon für Plattformen, Ringsegmente für Orbit- und Schildsysteme.

- [ ] **Step 4: Fehlende Form fällt auf einen Kreis mit profilabhängigem Radius zurück und protokolliert die Definition-ID**
- [ ] **Step 5: Spatial Index pro Geometry Revision aktualisieren**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/damage
git commit -m "feat: build independent ship assembly hit zones"
```

### Task 2: Trefferreihenfolge und Durchschlag implementieren

**Files:**
- Create: `src/features/ship-assembly/damage/damage-router.js`
- Modify: `src/features/combat/collision-system.js`

- [ ] **Step 1: Trefferkandidaten entlang Projektilsegment sortieren**

```js
export function sortHitCandidates(candidates) {
  return [...candidates].sort((a, b) => a.distanceAlongRay - b.distanceAlongRay || b.zone.priority - a.zone.priority);
}
```

- [ ] **Step 2: Damage Router implementieren**

```js
export function createDamageRouter({ moduleDamageService, playerDamageService }) {
  return {
    route({ hit, damage, penetration }) {
      let remainingDamage = damage;
      let remainingPenetration = penetration;
      for (const candidate of sortHitCandidates(hit.candidates)) {
        if (candidate.zone.ownerType === 'module') {
          const result = moduleDamageService.applyDamage(candidate.zone.ownerId, remainingDamage, hit.damageType);
          remainingDamage = result.remainingDamage;
          remainingPenetration -= result.penetrationCost;
        } else if (candidate.zone.ownerType === 'core') {
          playerDamageService.applyHullDamage(remainingDamage, hit.damageType);
          remainingDamage = 0;
        }
        if (remainingDamage <= 0 || remainingPenetration < 0) break;
      }
    }
  };
}
```

- [ ] **Step 3: Flächenschaden verteilt Gesamtschaden mit Cap auf betroffene Zonen**
- [ ] **Step 4: Kontakt trifft bevorzugt die zuerst berührte Außenzone**
- [ ] **Step 5: Phasen- und Präzisionsangriffe können profilgesteuert Modulzonen teilweise ignorieren**
- [ ] **Step 6: Schilde werden vor Assembly-Zonen ausgewertet**
- [ ] **Step 7: Commit**

```bash
git add src/features/ship-assembly/damage src/features/combat/collision-system.js
git commit -m "feat: route combat damage through modular ship zones"
```

### Task 3: Dreistufiges Modulschadensmodell implementieren

**Files:**
- Create: `src/features/ship-assembly/damage/module-damage-service.js`
- Create: `src/content/ship-assembly/module-damage-behaviors.js`
- Modify: `src/features/ship-assembly/model/assembly-service.js`

- [ ] **Step 1: Zustandsübergänge definieren**

```js
export function resolveDamageState(node) {
  if (node.damageState === 'detached') return 'detached';
  if (node.coreIntegrity <= 0) return 'detached';
  if (node.coreIntegrity < node.maxCoreIntegrity * 0.45) return 'core-disrupted';
  if (node.armorIntegrity <= 0) return 'armor-broken';
  return 'intact';
}
```

- [ ] **Step 2: Damage Service implementieren**

```js
export function createModuleDamageService({ assemblyService, eventBus, branchFailureService }) {
  return {
    applyDamage(nodeId, amount, damageType) {
      const node = assemblyService.requireNode(nodeId);
      let remaining = amount;
      const armorAbsorb = Math.min(node.armorIntegrity, remaining);
      node.armorIntegrity -= armorAbsorb;
      remaining -= armorAbsorb;
      if (remaining > 0) node.coreIntegrity -= remaining;
      const previousState = node.damageState;
      node.damageState = resolveDamageState(node);
      assemblyService.publishDamageChange(nodeId);
      if (node.damageState !== previousState) eventBus.emit('assembly:damage-state-changed', { nodeId, previousState, nextState: node.damageState });
      if (node.damageState === 'detached') branchFailureService.resolveNodeLoss(nodeId);
      return { remainingDamage: Math.max(0, -node.coreIntegrity), penetrationCost: armorAbsorb > 0 ? 1 : 0 };
    }
  };
}
```

- [ ] **Step 3: Armor Broken erhöht Stabilitäts- beziehungsweise Fehlerdruck leicht**
- [ ] **Step 4: Core Disrupted reduziert oder deaktiviert Modulfunktion profilabhängig**
- [ ] **Step 5: Detached entfernt Gameplaywirkung über Equipment-Adapter, behält Item-Instanz beschädigt im Run-Inventar**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/damage src/content/ship-assembly src/features/ship-assembly/model/assembly-service.js
git commit -m "feat: add armor core and detachment damage states"
```

### Task 4: Modulspezifische Störreaktionen anbinden

**Files:**
- Create: `src/features/ship-assembly/damage/module-fault-adapter.js`
- Modify: `src/features/faults/fault-scheduler.js`
- Modify: `src/features/equipment/equipment-service.js`

- [ ] **Step 1: Assembly-Schadenszustand in Equipment-Modifikatoren übersetzen**

```js
export function getDamageModifiers(node, visualProfileId) {
  if (node.damageState === 'intact') return [];
  if (node.damageState === 'armor-broken') return [{ stat: 'stability', operation: 'add', value: -0.15 }];
  if (node.damageState === 'core-disrupted') return DAMAGE_BEHAVIORS[visualProfileId].disruptedModifiers;
  return [{ stat: 'enabled', operation: 'override', value: false }];
}
```

- [ ] **Step 2: Klassenreaktionen definieren**

Railgun-Spulen unregelmäßig; Raketenstartschächte blockiert; Drohnenstart eingeschränkt; Kühlung reduziert; Schild erhält Feldlücken; Reaktor pulsiert; Sensor springt; Minenstreuung steigt; Void erhöht Korruption; Strukturadapter reduziert Kindstabilität.

- [ ] **Step 3: Damage Faults und bestehende Overload Faults verwenden getrennte Quellen, aber dieselbe Telemetrieanzeige**
- [ ] **Step 4: Commit**

```bash
git add src/features/ship-assembly/damage/module-fault-adapter.js src/features/faults src/features/equipment/equipment-service.js
git commit -m "feat: connect module damage to visible gameplay disruptions"
```

### Task 5: Astverlust und Sekundärverbindungen implementieren

**Files:**
- Create: `src/features/ship-assembly/damage/branch-failure-service.js`
- Modify: `src/features/ship-assembly/model/assembly-service.js`

- [ ] **Step 1: Verbindungsstatus prüfen**

```js
export function createBranchFailureService({ assemblyService, geometryService }) {
  return {
    resolveNodeLoss(nodeId) {
      const snapshot = assemblyService.getSnapshot();
      const children = Object.values(snapshot.nodesById).filter(node => node.parentNodeId === nodeId);
      for (const child of children) {
        const bridge = findSurvivingSecondaryConnection(snapshot, child.nodeId);
        if (bridge) {
          assemblyService.promoteSecondaryConnection(child.nodeId, bridge.connectionId);
          assemblyService.applyBranchPenalty(child.nodeId, 'secondary-support');
          continue;
        }
        if (geometryService.canCreateEmergencyBrace(child.nodeId)) {
          assemblyService.createEmergencyBrace(child.nodeId);
          assemblyService.applyBranchPenalty(child.nodeId, 'emergency-brace');
          continue;
        }
        assemblyService.detachNode({ nodeId: child.nodeId, detachBranch: true });
      }
      assemblyService.detachNode({ nodeId, detachBranch: false });
    }
  };
}
```

- [ ] **Step 2: Hilfsfunktion für eine überlebende Sekundärverbindung definieren**

```js
function findSurvivingSecondaryConnection(snapshot, childNodeId) {
  return Object.values(snapshot.secondaryConnectionsById).find(connection => {
    const touchesChild = connection.sourceNodeId === childNodeId || connection.targetNodeId === childNodeId;
    const otherNodeId = connection.sourceNodeId === childNodeId ? connection.targetNodeId : connection.sourceNodeId;
    return touchesChild && Boolean(snapshot.nodesById[otherNodeId]);
  }) ?? null;
}
```

- [ ] **Step 3: Sekundärverbindung zur Primärverbindung befördern, ohne Modulbesitz zu duplizieren**

```js
promoteSecondaryConnection(nodeId, connectionId) {
  const node = requireNode(nodeId);
  const connection = state.secondaryConnectionsById[connectionId];
  if (!connection) throw new Error(`Unknown secondary connection: ${connectionId}`);
  const newParentNodeId = connection.sourceNodeId === nodeId ? connection.targetNodeId : connection.sourceNodeId;
  state.nodesById[nodeId] = {
    ...node,
    parentNodeId: newParentNodeId,
    parentPortId: null,
    supportMode: 'secondary-support'
  };
  delete state.secondaryConnectionsById[connectionId];
  publish(ASSEMBLY_EVENTS.CHANGED, { nodeId, connectionId, mode: 'promoted-secondary' });
}
```

- [ ] **Step 4: Notstrebe und Branch-Nachteile implementieren**

```js
createEmergencyBrace(nodeId) {
  const node = requireNode(nodeId);
  state.nodesById[nodeId] = { ...node, supportMode: 'emergency-brace' };
  publish(ASSEMBLY_EVENTS.CHANGED, { nodeId, mode: 'emergency-brace' });
}

applyBranchPenalty(nodeId, penaltyId) {
  const branchIds = getBranchNodeIds(state, nodeId);
  for (const branchNodeId of branchIds) {
    const node = requireNode(branchNodeId);
    state.nodesById[branchNodeId] = {
      ...node,
      structuralPenalties: [...new Set([...(node.structuralPenalties ?? []), penaltyId])]
    };
  }
  publish(ASSEMBLY_EVENTS.CHANGED, { nodeId, branchIds, penaltyId });
}
```

- [ ] **Step 5: Kompletter Astverlust erzeugt für jedes Item einen beschädigten Inventory-Eintrag**
- [ ] **Step 6: `promoteSecondaryConnection`, `createEmergencyBrace` und `applyBranchPenalty` in die öffentliche AssemblyService-API aufnehmen**
- [ ] **Step 7: Commit**

```bash
git add src/features/ship-assembly/damage src/features/ship-assembly/model/assembly-service.js
git commit -m "feat: resolve modular branch failures and emergency supports"
```

### Task 6: Schutz gegen vollständige Kernabschirmung implementieren

**Files:**
- Create: `src/features/ship-assembly/placement/core-exposure-service.js`
- Modify: `src/features/ship-assembly/placement/compatibility-service.js`

- [ ] **Step 1: Kern in acht Richtungssektoren abtasten**
- [ ] **Step 2: Mindestens zwei getrennte Richtungsbereiche müssen eine freie Linie zum Kern behalten**

```js
export function hasRequiredCoreExposure({ coreBounds, occupiedBounds }) {
  const directions = Array.from({ length: 8 }, (_, index) => index * Math.PI / 4);
  const open = directions.filter(angle => rayFromCoreIsOpen(coreBounds.center, angle, occupiedBounds));
  const hasSeparatedPair = open.some(a => open.some(b => Math.abs(normalizeAngle(a - b)) >= Math.PI / 2));
  return hasSeparatedPair;
}
```

- [ ] **Step 3: Platzierung wird mit Grund `core-exposure` abgelehnt, nicht stillschweigend verschoben**
- [ ] **Step 4: Reine Strukturmodule erhalten sinkende Absorptionswirkung bei wiederholtem Treffer**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/placement
git commit -m "feat: preserve fair core exposure in defensive builds"
```

### Task 7: Reparatur im Kampf und zwischen Sektoren implementieren

**Files:**
- Create: `src/features/ship-assembly/damage/repair-service.js`
- Create: `src/content/ship-assembly/repair-actions.js`
- Modify: `src/features/workshop/workshop-service.js`

- [ ] **Step 1: Reparaturoperationen definieren**

```js
export const REPAIR_ACTIONS = Object.freeze({
  PATCH_ARMOR: 'patch-armor',
  RESTART_CORE: 'restart-core',
  STABILIZE_BRACE: 'stabilize-brace',
  FULL_REPAIR: 'full-repair',
  REMOUNT_DETACHED: 'remount-detached',
  REPLACE_PORT: 'replace-port'
});
```

- [ ] **Step 2: Kampfaktionen begrenzen**

Patch Armor, Restart Core, Emergency Brace und Remount nur mit passenden aktiven Modulen beziehungsweise Ressourcen.

- [ ] **Step 3: Werkstatt erlaubt vollständige Reparatur, Portersatz, Astversetzung und erneute Montage**
- [ ] **Step 4: Reparatur aktualisiert Geometrie, Damage Zones und Flight Profile über Events**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/damage src/content/ship-assembly src/features/workshop/workshop-service.js
git commit -m "feat: add modular ship repair and remount actions"
```

### Task 8: Masse- und Trägheitsprofil implementieren

**Files:**
- Create: `src/features/ship-assembly/flight/mass-properties.js`
- Create: `src/features/ship-assembly/flight/flight-profile-service.js`
- Create: `src/content/ship-assembly/module-mass-profiles.js`

- [ ] **Step 1: Masseeigenschaften berechnen**

```js
export function calculateMassProperties(nodes, rootPosition = { x: 0, y: 0 }) {
  const totalMass = nodes.reduce((sum, node) => sum + node.mass, 0);
  const centerOfMass = nodes.reduce((sum, node) => ({
    x: sum.x + node.worldPosition.x * node.mass,
    y: sum.y + node.worldPosition.y * node.mass
  }), { x: 0, y: 0 });
  centerOfMass.x /= totalMass || 1;
  centerOfMass.y /= totalMass || 1;
  const rotationalInertia = nodes.reduce((sum, node) => {
    const dx = node.worldPosition.x - centerOfMass.x;
    const dy = node.worldPosition.y - centerOfMass.y;
    return sum + node.mass * (dx * dx + dy * dy);
  }, 0);
  return { totalMass, centerOfMass, rotationalInertia, lateralImbalance: centerOfMass.x - rootPosition.x };
}
```

- [ ] **Step 2: Flight Profile auf sichere Grenzwerte abbilden**

```js
export function mapToFlightModifiers(properties, thrust) {
  return {
    accelerationMultiplier: clamp(1 - properties.totalMass / 260, 0.75, 1.08),
    turnMultiplier: clamp(1 - properties.rotationalInertia / 900000, 0.85, 1.08),
    dodgeDistanceMultiplier: clamp(1 + thrust.dodgeAuthority / 100 - properties.totalMass / 520, 0.8, 1.15),
    dodgeCooldownMultiplier: clamp(1 + properties.totalMass / 650 - thrust.lateral / 130, 0.85, 1.25),
    driftBias: clamp(properties.lateralImbalance / 900, -0.04, 0.04),
    recoilControl: clamp(thrust.structuralSupport / 100, 0, 0.35)
  };
}
```

- [ ] **Step 3: Dekorative Teile werden nicht in die Berechnung aufgenommen**
- [ ] **Step 4: Profil wird nur nach Struktur- oder Schadensänderung neu berechnet**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/flight src/content/ship-assembly
git commit -m "feat: calculate bounded flight profile from ship construction"
```

### Task 9: Flugprofil geglättet in Bewegungssystem einspeisen

**Files:**
- Create: `src/features/ship-assembly/flight/flight-profile-smoother.js`
- Modify: `src/features/combat/player-movement-system.js`
- Modify: `src/features/combat/dodge-system.js`

- [ ] **Step 1: Werte über 0,3 bis 0,6 Sekunden glätten**

```js
export function createFlightProfileSmoother(initial) {
  let current = { ...initial };
  let target = { ...initial };
  return {
    setTarget(next) { target = { ...next }; },
    update(dt) {
      const factor = 1 - Math.exp(-dt / 0.42);
      for (const key of Object.keys(current)) current[key] += (target[key] - current[key]) * factor;
      return current;
    },
    getCurrent: () => current
  };
}
```

- [ ] **Step 2: Player Movement multipliziert Beschleunigung und Richtungsreaktion**
- [ ] **Step 3: Dodge verwendet Distanz- und Cooldownmultiplikatoren, bleibt aber immer verfügbar**
- [ ] **Step 4: DriftBias erzeugt nur eine minimale Richtungscharakteristik und keine permanente Gegensteuerung**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/flight src/features/combat/player-movement-system.js src/features/combat/dodge-system.js
git commit -m "feat: apply smoothed construction flight modifiers"
```

### Task 10: Waffenrückstoß und Schubdarstellung anbinden

**Files:**
- Create: `src/features/ship-assembly/flight/recoil-service.js`
- Modify: `src/features/combat/weapon-controller.js`
- Modify: `src/render/ship-assembly/activity-animation-renderer.js`

- [ ] **Step 1: Rückstoßprofile definieren**

```js
export const RECOIL_PROFILES = Object.freeze({
  rail: { impulse: 18, torque: 0.12 },
  missile: { impulse: 4, torque: 0.04 },
  plasma: { impulse: 7, torque: 0.05 },
  beam: { impulse: 2, torque: 0.01 }
});
```

- [ ] **Step 2: Weltposition der Waffe bestimmt Gegenimpuls und kleinen Drehimpuls**
- [ ] **Step 3: Flight Profile `recoilControl` reduziert Wirkung**
- [ ] **Step 4: Seitliche und zusätzliche Triebwerke reagieren sichtbar auf Bewegung und Dodge**
- [ ] **Step 5: Beschädigte Triebwerke flackern und zünden verzögert, ohne unkontrollierbare Rotation zu erzeugen**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/flight src/features/combat/weapon-controller.js src/render/ship-assembly/activity-animation-renderer.js
git commit -m "feat: add construction aware recoil and thruster response"
```

### Task 11: Kameraanpassung an wachsende Konstruktionen implementieren

**Files:**
- Create: `src/features/ship-assembly/flight/camera-fit-service.js`
- Modify: `src/render/camera.js`

- [ ] **Step 1: Zielzoom aus Gesamtbounds berechnen**

```js
export function calculateAssemblyZoom(bounds, viewport) {
  const widthRatio = viewport.width / Math.max(bounds.width * 2.7, viewport.width);
  const heightRatio = viewport.height / Math.max(bounds.height * 2.7, viewport.height);
  return clamp(Math.min(widthRatio, heightRatio), 0.82, 1);
}
```

- [ ] **Step 2: Kamera bleibt auf Kernposition zentriert**
- [ ] **Step 3: Zoomänderung wird über mindestens 0,8 Sekunden geglättet**
- [ ] **Step 4: HUD und Screen-Space-Effekte bleiben unskaliert**
- [ ] **Step 5: Lesbarkeitsminimum verhindert zu weites Herauszoomen**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/flight/camera-fit-service.js src/render/camera.js
git commit -m "feat: fit camera smoothly around modular ship bounds"
```

### Task 12: Phase-4-Abnahme ohne Testsystem

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/features/telemetry/run-telemetry.js`

- [ ] **Step 1: Damage-, Repair- und Flight-Services verdrahten**
- [ ] **Step 2: Entwicklungs-Szenarien registrieren**

- `damageSingleModule`
- `detachParentWithBridge`
- `detachParentWithoutBridge`
- `areaDamageCluster`
- `directCoreAttack`
- `repairAndRemount`
- `massExtremes`
- `recoilAsymmetry`

- [ ] **Step 3: Manuelle Prüfung**

1. Außenteil absorbiert normalen Treffer vor Kern.
2. Durchschlag erreicht nach Modul den Kern.
3. Panzerung, Störung und Abtrennung sind sichtbar und funktional verschieden.
4. Brücke hält Kindast mit Nachteil.
5. Fehlende Brücke trennt Ast ab.
6. Reparatur stellt Zustand und Darstellung wieder her.
7. Maximale Masse bleibt steuerbar.
8. Modulverlust aktualisiert Flugprofil geglättet.
9. Kern bleibt aus mindestens zwei Richtungsbereichen erreichbar.

- [ ] **Step 4: `npm run build` ausführen**
- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: complete modular ship damage and flight behavior"
```
