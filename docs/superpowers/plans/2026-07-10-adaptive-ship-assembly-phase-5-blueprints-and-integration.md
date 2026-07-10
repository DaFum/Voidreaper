# VOIDREAPER Adaptive Ship Assembly Phase 5: Blueprints and Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Projektvorgabe:** Für dieses Feature werden keine Testdateien, kein Testverzeichnis und kein automatisiertes Testframework ergänzt. Kontrollschritte bestehen aus Produktions-Builds, statischer Content-Validierung, reproduzierbaren Entwicklungs-Szenarien und manueller Prüfung im integrierten Assembly-Debugmodus.

> **Verbindliche Gestaltungsregel:** „Handgestaltet“ bedeutet, dass der Coding Agent alle sichtbaren Modulkerne, Panzerungen, Ports, Streben, Leitungen, Animationen, Schadenszustände, Symbole und Oberflächen direkt im Code entwirft und implementiert. Externe Designer, nachzuliefernde Sprites und finale Platzhaltergeometrien sind ausgeschlossen.

**Goal:** Bauplanbibliothek, Geisterstrukturen, Varianten, Import/Export, Save-Migration, Performancegrenzen, Entwicklungs-Debugmodus und die vollständige Featureintegration abschließen.

**Architecture:** Baupläne speichern ausschließlich abstrakte Konstruktion und Modulpräferenzen. Der Blueprint Service validiert und migriert Daten, ohne Equipment zu erzeugen. Performance wird über Revisionen, Ast-Caches, Offscreen-Miniaturen und LOD abgesichert. Ein DEV-only Debug Panel ersetzt ein automatisiertes Testsystem für reproduzierbare Funktionsszenarien.

**Tech Stack:** Bestehende Persistence-, Hangar-, Codex-, Sector-, Debug- und Rendering-Systeme, Browser Storage, Base64URL-Codec und Vite.

---

## Ziel-Dateistruktur

```text
src/features/ship-assembly/blueprints/
  blueprint-schema.js
  blueprint-service.js
  blueprint-validator.js
  blueprint-codec.js
  blueprint-matcher.js
  blueprint-migration.js
  blueprint-thumbnail-service.js
src/ui/ship-assembly/
  blueprint-library-screen.js
  blueprint-card.js
  blueprint-detail-screen.js
  blueprint-ghost-overlay.js
  blueprint-import-dialog.js
src/features/ship-assembly/debug/
  assembly-debug-service.js
  assembly-debug-panel.js
  assembly-debug-scenarios.js
src/features/ship-assembly/performance/
  assembly-performance-budget.js
  assembly-revision-tracker.js
src/persistence/
  migrations/ship-assembly-migration.js
```

### Task 1: Blueprint-Schema und Validator implementieren

**Files:**
- Create: `src/features/ship-assembly/blueprints/blueprint-schema.js`
- Create: `src/features/ship-assembly/blueprints/blueprint-validator.js`

- [ ] **Step 1: Schema-Factory definieren**

```js
export const BLUEPRINT_VERSION = 1;

export function createBlueprint({ id, name, shipFrameId, nodes, connections, variants = [] }) {
  const now = new Date().toISOString();
  return {
    blueprintVersion: BLUEPRINT_VERSION,
    blueprintId: id,
    name,
    shipFrameId,
    createdAt: now,
    updatedAt: now,
    nodes,
    connections,
    visualVariants: variants,
    favorite: false,
    usage: { lastUsedAt: null, highestAbyssDepth: 0 },
    thumbnailDataUrl: null
  };
}
```

- [ ] **Step 2: Blueprint-Knoten speichern keine Item-Instanz**

```js
export function toBlueprintNode(assemblyNode) {
  return {
    blueprintNodeId: assemblyNode.nodeId,
    parentBlueprintNodeId: assemblyNode.parentNodeId,
    preferredModuleDefinitionId: assemblyNode.definitionId,
    allowedRoles: assemblyNode.allowedRoles ?? [],
    allowedTags: assemblyNode.allowedTags ?? [],
    sizeClass: assemblyNode.sizeClass,
    mountType: assemblyNode.mountType,
    localPosition: assemblyNode.localPosition,
    localRotation: assemblyNode.localRotation,
    mirrorBehavior: assemblyNode.mirrorBehavior ?? 'none',
    childPortLayout: assemblyNode.childPortLayout ?? []
  };
}
```

- [ ] **Step 3: Validator repariert ungültige Graphteile in einer Kopie**

Er entfernt Zyklen, fehlende Verbindungen und doppelte Knoten; Root und gültige Präferenzen bleiben erhalten. Das Original wird nicht überschrieben.

- [ ] **Step 4: Unbekannte Modul-IDs werden als Rollenplätze erhalten**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/blueprints
git commit -m "feat: add safe ship blueprint schema and validation"
```

### Task 2: Blueprint Service und Bibliotheksoperationen implementieren

**Files:**
- Create: `src/features/ship-assembly/blueprints/blueprint-service.js`
- Modify: `src/runtime/create-meta-state.js`

- [ ] **Step 1: Meta-State erweitern**

```js
shipBlueprints: {},
activeBlueprintId: null,
blueprintLibraryVersion: 1,
assemblyVisualPreferences: { lod: 'auto', showBlueprintGhosts: true }
```

- [ ] **Step 2: Service-API implementieren**

```js
export function createBlueprintService({ saveStore, idFactory, thumbnailService }) {
  let cached = {};
  const requireBlueprint = blueprintId => {
    const blueprint = cached[blueprintId];
    if (!blueprint) throw new Error(`Unknown ship blueprint: ${blueprintId}`);
    return blueprint;
  };
  const persist = async mutator => {
    const next = await saveStore.update(save => {
      save.shipBlueprints ??= {};
      mutator(save);
      return save;
    });
    cached = structuredClone(next.shipBlueprints ?? {});
    return next;
  };

  return {
    hydrate(metaState) {
      cached = structuredClone(metaState.shipBlueprints ?? {});
    },
    async saveFromAssembly({ name, assemblySnapshot, replaceBlueprintId = null }) {
      const blueprintId = replaceBlueprintId ?? idFactory.create('ship-blueprint');
      const previous = cached[blueprintId];
      const blueprint = createBlueprint({
        id: blueprintId,
        name: name.trim().slice(0, 48) || 'Unbenannter Bauplan',
        shipFrameId: assemblySnapshot.shipFrameId,
        nodes: Object.values(assemblySnapshot.nodesById).map(toBlueprintNode),
        connections: Object.values(assemblySnapshot.secondaryConnectionsById),
        variants: previous?.visualVariants ?? []
      });
      if (previous) blueprint.createdAt = previous.createdAt;
      blueprint.thumbnailDataUrl = await thumbnailService.render(assemblySnapshot);
      await persist(save => { save.shipBlueprints[blueprintId] = blueprint; });
      return structuredClone(blueprint);
    },
    async duplicate(blueprintId) {
      const source = requireBlueprint(blueprintId);
      const copyId = idFactory.create('ship-blueprint');
      const copy = structuredClone(source);
      copy.blueprintId = copyId;
      copy.name = `${source.name} Kopie`;
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      await persist(save => { save.shipBlueprints[copyId] = copy; });
      return structuredClone(copy);
    },
    async rename(blueprintId, name) {
      const cleanName = name.trim().slice(0, 48);
      if (!cleanName) throw new Error('Blueprint name must not be empty');
      await persist(save => {
        const blueprint = save.shipBlueprints[blueprintId];
        if (!blueprint) throw new Error(`Unknown ship blueprint: ${blueprintId}`);
        blueprint.name = cleanName;
        blueprint.updatedAt = new Date().toISOString();
      });
    },
    async delete(blueprintId) {
      await persist(save => {
        delete save.shipBlueprints[blueprintId];
        if (save.activeBlueprintId === blueprintId) save.activeBlueprintId = null;
      });
    },
    async setActive(blueprintId) {
      requireBlueprint(blueprintId);
      await persist(save => { save.activeBlueprintId = blueprintId; });
    },
    async createVariant(blueprintId, variantName, assemblySnapshot) {
      const variant = {
        variantId: idFactory.create('blueprint-variant'),
        name: variantName.trim().slice(0, 48) || 'Variante',
        nodes: Object.values(assemblySnapshot.nodesById).map(toBlueprintNode),
        connections: Object.values(assemblySnapshot.secondaryConnectionsById),
        createdAt: new Date().toISOString()
      };
      await persist(save => { save.shipBlueprints[blueprintId].visualVariants.push(variant); });
      return structuredClone(variant);
    },
    list() {
      return Object.values(cached)
        .map(structuredClone)
        .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt));
    },
    require: blueprintId => structuredClone(requireBlueprint(blueprintId))
  };
}
```

- [ ] **Step 3: Speichern übernimmt intakte Geometrie; Veteranenvariante kann Schäden nur kosmetisch erfassen**
- [ ] **Step 4: Löschung vergibt keine Items und verändert keine Loadouts**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/blueprints/blueprint-service.js src/runtime/create-meta-state.js
git commit -m "feat: add persistent ship blueprint library service"
```

### Task 3: Blueprint-Matching und Geisterstruktur implementieren

**Files:**
- Create: `src/features/ship-assembly/blueprints/blueprint-matcher.js`
- Create: `src/ui/ship-assembly/blueprint-ghost-overlay.js`
- Modify: `src/features/ship-assembly/placement/placement-suggestion-service.js`

- [ ] **Step 1: Match-Stufen definieren**

```js
export const BLUEPRINT_MATCH = Object.freeze({
  EXACT: 'exact',
  COMPATIBLE: 'compatible',
  STRUCTURAL: 'structural',
  INCOMPATIBLE: 'incompatible',
  BLOCKED: 'blocked'
});
```

- [ ] **Step 2: Matching aus ID, Rollen, Tags, Größe und Mount-Typ berechnen**
- [ ] **Step 3: Exakte oder kompatible Zielknoten erhalten Bonus in Placement Score**
- [ ] **Step 4: Ghost Overlay unterscheidet erfüllt, kompatibler Ersatz, offen und blockiert über Form, Muster und Transparenz**
- [ ] **Step 5: Abweichungen aktualisieren nur Overlaystatus; Blueprint wird nicht automatisch verändert**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/blueprints/blueprint-matcher.js src/ui/ship-assembly/blueprint-ghost-overlay.js src/features/ship-assembly/placement/placement-suggestion-service.js
git commit -m "feat: add blueprint guided placement and ghost structures"
```

### Task 4: Blueprint-Import und -Export implementieren

**Files:**
- Create: `src/features/ship-assembly/blueprints/blueprint-codec.js`
- Create: `src/ui/ship-assembly/blueprint-import-dialog.js`

- [ ] **Step 1: Base64URL-Codec implementieren**

```js
export function encodeBlueprint(blueprint) {
  const json = JSON.stringify({
    v: blueprint.blueprintVersion,
    f: blueprint.shipFrameId,
    n: blueprint.nodes,
    c: blueprint.connections,
    x: blueprint.visualVariants
  });
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export function decodeBlueprint(code) {
  const normalized = code.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
```

- [ ] **Step 2: Import führt Migration und Validierung aus**
- [ ] **Step 3: Import zeigt unbekannte Module und entfernte Verbindungen vor dem Speichern**
- [ ] **Step 4: Import vergibt keine Items, Unlocks oder Affixe**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/blueprints/blueprint-codec.js src/ui/ship-assembly/blueprint-import-dialog.js
git commit -m "feat: add safe ship blueprint import and export"
```

### Task 5: Blueprint-Miniaturen und Bibliotheksoberfläche gestalten

**Files:**
- Create: `src/features/ship-assembly/blueprints/blueprint-thumbnail-service.js`
- Create: `src/ui/ship-assembly/blueprint-library-screen.js`
- Create: `src/ui/ship-assembly/blueprint-card.js`
- Create: `src/ui/ship-assembly/blueprint-detail-screen.js`
- Modify: `src/styles/ship-assembly.css`

- [ ] **Step 1: Thumbnail Service verwendet AssemblyThumbnailRenderer und OffscreenCanvas**
- [ ] **Step 2: Miniatur wird nach Blueprintänderung neu erzeugt und als Data URL gespeichert**
- [ ] **Step 3: Bibliothekskarte zeigt Name, Schiff, Knotenzahl, Waffenfamilien, Tags, Abyss-Tiefe, letzte Verwendung und Favorit**
- [ ] **Step 4: Detailansicht unterstützt Drehen, Zoomen, Umbenennen, Duplizieren, Varianten, Standardsetzen, Export und Löschen**
- [ ] **Step 5: Die Oberfläche wird vom Coding Agent vollständig im VOIDREAPER-Stil gestaltet; generische Kartenrahmen gelten nicht als finale Ausführung**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/blueprints src/ui/ship-assembly src/styles/ship-assembly.css
git commit -m "feat: design ship blueprint library and thumbnails"
```

### Task 6: Run-Start und Run-Ende mit Bauplänen integrieren

**Files:**
- Modify: `src/ui/screens/loadout-screen.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/ui/screens/run-summary-screen.js`

- [ ] **Step 1: Vor Runstart Auswahl `ohne Vorlage`, `aktive Vorlage`, `zuletzt verwendet` anbieten**
- [ ] **Step 2: Run startet weiterhin nur mit regulärer Ausrüstung**
- [ ] **Step 3: Blueprint-ID und Variante werden im Run-State gespeichert**
- [ ] **Step 4: Run-Ende bietet `neuer Bauplan`, `Variante`, `bestehenden ersetzen` oder `nicht speichern`**
- [ ] **Step 5: Beschädigte Endform kann als rein kosmetische Veteranenvariante gespeichert werden**
- [ ] **Step 6: Commit**

```bash
git add src/ui/screens/loadout-screen.js src/app/game-controller.js src/ui/screens/run-summary-screen.js
git commit -m "feat: integrate ship blueprints into run lifecycle"
```

### Task 7: Save-Schema und Migration implementieren

**Files:**
- Create: `src/persistence/migrations/ship-assembly-migration.js`
- Modify: `src/persistence/save-schema.js`
- Modify: `src/persistence/migrations.js`

- [ ] **Step 1: Save-Version erhöhen und Defaults ergänzen**
- [ ] **Step 2: Migration erzeugt leere Bibliothek plus Standardvorlage aus aktivem Schiffskern**
- [ ] **Step 3: Bestehende Loadouts, Prototypen, Forschung, Runs und Rekorde unverändert übernehmen**
- [ ] **Step 4: Fehlende Moduldefinitionen in Bauplänen werden als unaufgelöste Rollenplätze erhalten**
- [ ] **Step 5: Vor Migration wird bestehender Save gesichert**
- [ ] **Step 6: Commit**

```bash
git add src/persistence
git commit -m "feat: migrate saves for adaptive ship blueprints"
```

### Task 8: Performancebudgets und Revisionskontrolle abschließen

**Files:**
- Create: `src/features/ship-assembly/performance/assembly-performance-budget.js`
- Create: `src/features/ship-assembly/performance/assembly-revision-tracker.js`
- Modify: `src/features/ship-assembly/geometry/assembly-geometry-service.js`
- Modify: `src/render/ship-assembly/assembly-renderer.js`

- [ ] **Step 1: Budgets definieren**

```js
export const ASSEMBLY_BUDGET = Object.freeze({
  maxVisibleSegments: 18,
  maxBranchDepth: 4,
  maxSecondaryConnections: 10,
  maxDamageParticlesPerModule: 12,
  maxDetachedDebris: 8,
  maxGeometryRebuildsPerFrame: 1,
  maxThumbnailSize: 320
});
```

- [ ] **Step 2: Revision Tracker unterscheidet Struktur, Visual, Damage und Activity**
- [ ] **Step 3: Strukturänderung invalidiert Geometrie; Schaden nur Overlay und Hit Zones; Activity nur Animation**
- [ ] **Step 4: Geometrieaufbau wird bei mehreren Änderungen in demselben Frame zusammengefasst**
- [ ] **Step 5: Detailreduktion reagiert auf Zoom, Segmentzahl, Partikeldruck und Einstellung**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/performance src/features/ship-assembly/geometry src/render/ship-assembly
git commit -m "perf: enforce adaptive ship assembly budgets"
```

### Task 9: Entwicklungs-Debugservice und Panel implementieren

**Files:**
- Create: `src/features/ship-assembly/debug/assembly-debug-service.js`
- Create: `src/features/ship-assembly/debug/assembly-debug-scenarios.js`
- Create: `src/features/ship-assembly/debug/assembly-debug-panel.js`
- Modify: `src/app/bootstrap.js`

- [ ] **Step 1: Debugservice nur unter `import.meta.env.DEV` registrieren**
- [ ] **Step 2: API implementieren**

```js
export function createAssemblyDebugService(deps) {
  return {
    spawnModule: definitionId => deps.inventory.grantDebugItem(definitionId),
    setDamageState: (nodeId, state) => deps.damage.forceState(nodeId, state),
    detachNode: nodeId => deps.assembly.detachNode({ nodeId }),
    detachBranch: nodeId => deps.assembly.detachNode({ nodeId, detachBranch: true }),
    addBridge: (sourceNodeId, targetNodeId) => deps.assembly.addSecondaryConnection({ sourceNodeId, targetNodeId, profile: deps.defaultBridge }),
    showHitZones: enabled => deps.debugFlags.set('assemblyHitZones', enabled),
    showPorts: enabled => deps.debugFlags.set('assemblyPorts', enabled),
    showMass: enabled => deps.debugFlags.set('assemblyMass', enabled),
    setLod: lod => deps.settings.setTemporary('assemblyLod', lod),
    buildMaximumShip: () => deps.scenarios.run('maximum-construction'),
    exportBlueprint: () => deps.blueprints.exportCurrent(),
    importBlueprint: code => deps.blueprints.importCode(code)
  };
}
```

- [ ] **Step 3: Reproduzierbare Szenarien codieren**

`visual-gallery`, `maximum-construction`, `asymmetric-heavy`, `damage-single`, `bridge-survival`, `branch-collapse`, `repair-remount`, `blueprint-roundtrip`, `lod-stress`.

- [ ] **Step 4: Panel erhält klare Schaltflächen, Node-Auswahl und Szenariodropdown**
- [ ] **Step 5: Produktions-Build enthält keine sichtbare Debugoberfläche**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/debug src/app/bootstrap.js
git commit -m "dev: add adaptive ship assembly debug scenarios"
```

### Task 10: Fallbacks und Fehlerisolation vervollständigen

**Files:**
- Create: `src/features/ship-assembly/model/assembly-error-boundary.js`
- Modify: `src/features/ship-assembly/geometry/assembly-geometry-service.js`
- Modify: `src/render/ship-assembly/module-core-renderers.js`
- Modify: `src/features/ship-assembly/damage/hit-zone-builder.js`

- [ ] **Step 1: Fehlerboundary protokolliert Feature, Definition-ID, Node-ID und Revision**
- [ ] **Step 2: Fehlender Modulrenderer verwendet neutralen, stilgerechten Funktionskern und behält Gameplaywirkung**
- [ ] **Step 3: Fehlende Panzerung verwendet Standardstrebe**
- [ ] **Step 4: Fehlende Hit Shape verwendet Kreiszone**
- [ ] **Step 5: Ungültige Strukturmutation wird verworfen und letzte gültige Assembly bleibt aktiv**
- [ ] **Step 6: Save wird nur nach erfolgreicher Invariantenprüfung geschrieben**
- [ ] **Step 7: Commit**

```bash
git add src/features/ship-assembly
git commit -m "fix: isolate adaptive ship assembly runtime failures"
```

### Task 11: Build-Validierung erweitern

**Files:**
- Modify: `scripts/validate-ship-assembly-content.mjs`
- Modify: `package.json`

- [ ] **Step 1: Validator prüft zusätzliche Integrität**

- zehn Schiffskern-Renderer,
- alle Modulprofil-Renderer vorhanden,
- alle Ports gültige Größen-, Mount- und Energieklassen,
- alle Damage-Behavior-Profile vorhanden,
- alle Massewerte numerisch,
- Blueprint-Version und Migration registriert,
- keine Definition überschreitet maximale Kindportanzahl,
- keine finale Contentdefinition verwendet `placeholder`, `generic-final` oder leere Renderer-ID.

- [ ] **Step 2: Build-Script verkettet Validierung und Vite-Build**

```json
{
  "scripts": {
    "validate:assembly": "node scripts/validate-ship-assembly-content.mjs",
    "build": "npm run validate:assembly && vite build"
  }
}
```

- [ ] **Step 3: `npm run validate:assembly` ausführen**
- [ ] **Step 4: `npm run build` ausführen**
- [ ] **Step 5: Commit**

```bash
git add scripts/validate-ship-assembly-content.mjs package.json
git commit -m "chore: enforce complete ship assembly content at build time"
```

### Task 12: Vollständige manuelle Featureabnahme

**Files:**
- Modify: `docs/manual-validation/adaptive-ship-assembly.md`
- Modify: `src/app/bootstrap.js`

- [ ] **Step 1: Manuelles Abnahmedokument mit diesen Szenarien anlegen**

1. Kernstart für jedes der zehn Schiffe.
2. Schnellmontage S/M.
3. Werkbankmontage L/XL/Structural/Corrupted.
4. vier Astebenen und 18 sichtbare Segmente.
5. asymmetrische Konstruktion plus Gegenelemente.
6. fünf Werkbankmodi.
7. Panzerung, Kernstörung, Abtrennung.
8. Astverlust mit und ohne Brücke.
9. Kampf- und Werkstattreparatur.
10. Masse-, Trägheits-, Dodge- und Rückstoßänderung.
11. Bauplan speichern, Variante, Export, Import, Ghost.
12. Save-Migration.
13. LOD high/medium/low.
14. Desktop und Touch.
15. reduzierte Bewegung und UI-Skalierung.

- [ ] **Step 2: Jede Zeile erhält Felder `Datum`, `Build`, `Ergebnis`, `Beobachtung`**
- [ ] **Step 3: Alle Debugszenarien einmal ausführen**
- [ ] **Step 4: Produktions-Build ausführen**

Run: `npm run build`  
Expected: Assembly-Validator und Vite-Build enden ohne Fehler.

- [ ] **Step 5: Release-Commit**

```bash
git add .
git commit -m "feat: complete adaptive modular ship construction system"
```
