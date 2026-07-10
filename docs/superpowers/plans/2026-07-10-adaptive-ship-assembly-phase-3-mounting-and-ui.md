# VOIDREAPER Adaptive Ship Assembly Phase 3: Mounting and UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Projektvorgabe:** Für dieses Feature werden keine Testdateien, kein Testverzeichnis und kein automatisiertes Testframework ergänzt. Kontrollschritte bestehen aus Produktions-Builds, statischer Content-Validierung, reproduzierbaren Entwicklungs-Szenarien und manueller Prüfung im integrierten Assembly-Debugmodus.

> **Verbindliche Gestaltungsregel:** „Handgestaltet“ bedeutet, dass der Coding Agent alle sichtbaren Modulkerne, Panzerungen, Ports, Streben, Leitungen, Animationen, Schadenszustände, Symbole und Oberflächen direkt im Code entwirft und implementiert. Externe Designer, nachzuliefernde Sprites und finale Platzhaltergeometrien sind ausgeschlossen.

**Goal:** Schnellmontage im laufenden Run und einen vollständigen Konstruktionsmodus zwischen Sektoren mit verständlichen Vorschlägen, Ansichtsmodi, Umbau, Bauanimationen und vollständiger Desktop-/Touch-Bedienung implementieren.

**Architecture:** Der Quick Mount Controller arbeitet mit Pending-Items und maximal drei Vorschlägen. Die Werkbank verwendet denselben AssemblyService, bietet aber vollständige Graphoperationen. UI-Komponenten zeigen Snapshots und senden Commands; sie verändern den Graphen nicht direkt.

**Tech Stack:** Bestehender Screen Controller, DOM/CSS, Canvas Overlay, Input Controller, Sector State Machine und Assembly Services.

---

## Ziel-Dateistruktur

```text
src/features/ship-assembly/mounting/
  pending-mount-service.js
  quick-mount-controller.js
  construction-workbench-controller.js
  assembly-command-service.js
  build-animation-controller.js
src/ui/ship-assembly/
  quick-mount-overlay.js
  placement-preview-overlay.js
  assembly-workbench-screen.js
  assembly-canvas-controller.js
  port-overlay.js
  assembly-inspector-panel.js
  assembly-view-modes.js
  assembly-toolbar.js
  assembly-touch-controls.js
src/styles/
  ship-assembly.css
  ship-assembly-mobile.css
```

### Task 1: Pending-Mount-Lebenszyklus definieren

**Files:**
- Create: `src/features/ship-assembly/mounting/pending-mount-service.js`
- Modify: `src/features/inventory/run-inventory.js`

- [ ] **Step 1: Pending-Datensatz definieren**

```js
export function createPendingMount({ itemInstance, source, acquiredAt, requiresWorkbench }) {
  return {
    pendingMountId: `pending-${itemInstance.instanceId}`,
    itemInstanceId: itemInstance.instanceId,
    definitionId: itemInstance.definitionId,
    source,
    acquiredAt,
    requiresWorkbench,
    suggestionPortIds: [],
    status: 'awaiting-placement'
  };
}
```

- [ ] **Step 2: Größenregeln anwenden**

`S` und `M` dürfen Schnellmontage verwenden. `L`, `XL`, `structural`, `corrupted` und profilseitig `requiresWorkbench: true` landen in der Werkbankwarteschlange.

- [ ] **Step 3: Escape oder fehlende Ports legt das Item ohne Werteverlust ins Run-Inventar**
- [ ] **Step 4: Pending-Status wird im Sektorcheckpoint gespeichert**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/mounting src/features/inventory/run-inventory.js
git commit -m "feat: add pending ship module placement lifecycle"
```

### Task 2: AssemblyCommandService als UI-Sicherheitsgrenze implementieren

**Files:**
- Create: `src/features/ship-assembly/mounting/assembly-command-service.js`

- [ ] **Step 1: Command-API definieren**

```js
export function createAssemblyCommandService({ assemblyService, compatibilityService, geometryService, equipmentService }) {
  return {
    mount({ itemInstanceId, portId, transform }) {
      const item = equipmentService.requireInstance(itemInstanceId);
      const profile = equipmentService.requireAssemblyProfile(item.definitionId);
      const port = assemblyService.getSnapshot().portsById[portId];
      const result = compatibilityService.evaluate({
        state: assemblyService.getSnapshot(),
        moduleProfile: profile,
        port,
        geometrySnapshot: geometryService.getSnapshot()
      });
      if (!result.compatible) throw new Error(`Incompatible mount: ${result.reasons.join(',')}`);
      return assemblyService.mountModule({
        moduleInstanceId: item.instanceId,
        definitionId: item.definitionId,
        parentPort: port,
        assemblyProfile: profile,
        transform
      });
    },
    move(args) { return assemblyService.moveNode(args); },
    moveBranch(args) { return assemblyService.moveBranch(args); },
    rotate(args) { return assemblyService.rotateNode(args); },
    dismantle(args) { return assemblyService.dismantleNode(args); }
  };
}
```

- [ ] **Step 2: Alle Commands prüfen aktuelle Revision, damit veraltete UI-Vorschläge nicht montiert werden**
- [ ] **Step 3: Fehlermeldungen werden als nutzerlesbare Toasts ausgegeben**
- [ ] **Step 4: Commit**

```bash
git add src/features/ship-assembly/mounting/assembly-command-service.js
git commit -m "feat: add validated ship assembly commands"
```

### Task 3: Schnellmontage-Controller implementieren

**Files:**
- Create: `src/features/ship-assembly/mounting/quick-mount-controller.js`
- Modify: `src/app/state-machine.js`
- Modify: `src/app/game-controller.js`

- [ ] **Step 1: Zustand `quick-mount` ergänzen**
- [ ] **Step 2: Controller berechnet Vorschläge und stoppt beziehungsweise verlangsamt Simulation**

```js
export function createQuickMountController({
  suggestionService,
  commandService,
  pendingMountService,
  runInventory,
  assemblyService,
  stateMachine,
  timeScaleService
}) {
  let session = null;
  const close = () => {
    timeScaleService.pop('quick-mount');
    stateMachine.returnToPrevious();
    session = null;
  };
  const refreshSuggestions = context => suggestionService.suggest({
    state: assemblyService.getSnapshot(),
    moduleProfile: context.moduleProfile,
    blueprint: context.blueprint
  });

  return {
    open(pendingMount, context) {
      const suggestions = refreshSuggestions(context);
      if (suggestions.length === 0) return { opened: false, reason: 'no-compatible-port' };
      session = {
        pendingMount,
        context,
        suggestions,
        selectedIndex: 0,
        assemblyRevision: assemblyService.getSnapshot().structuralRevision
      };
      timeScaleService.push('quick-mount', context.settings.pauseOnMount ? 0 : 0.12);
      stateMachine.transition('quick-mount');
      return { opened: true };
    },
    next() {
      session.selectedIndex = (session.selectedIndex + 1) % session.suggestions.length;
    },
    previous() {
      session.selectedIndex = (session.selectedIndex - 1 + session.suggestions.length) % session.suggestions.length;
    },
    confirm() {
      const snapshot = assemblyService.getSnapshot();
      if (snapshot.structuralRevision !== session.assemblyRevision) {
        session.suggestions = refreshSuggestions(session.context);
        session.selectedIndex = 0;
        session.assemblyRevision = snapshot.structuralRevision;
        if (session.suggestions.length === 0) return { mounted: false, reason: 'no-compatible-port' };
      }
      const suggestion = session.suggestions[session.selectedIndex];
      const nodeId = commandService.mount({
        itemInstanceId: session.pendingMount.itemInstanceId,
        portId: suggestion.portId,
        transform: suggestion.transform
      });
      pendingMountService.complete(session.pendingMount.pendingMountId, nodeId);
      close();
      return { mounted: true, nodeId };
    },
    defer() {
      runInventory.store(session.pendingMount.itemInstanceId);
      pendingMountService.defer(session.pendingMount.pendingMountId);
      close();
      return { deferred: true };
    }
  };
}
```

- [ ] **Step 3: `confirm()` prüft Revision und berechnet bei Änderung die Vorschläge neu**
- [ ] **Step 4: Nach Montage sofort in vorherigen Run-Zustand zurückkehren**
- [ ] **Step 5: Commit**

```bash
git add src/features/ship-assembly/mounting src/app
git commit -m "feat: add in run quick module mounting flow"
```

### Task 4: Schnellmontage-Overlay und Vorschau gestalten

**Files:**
- Create: `src/ui/ship-assembly/quick-mount-overlay.js`
- Create: `src/ui/ship-assembly/placement-preview-overlay.js`
- Create: `src/styles/ship-assembly.css`

- [ ] **Step 1: Overlay-Struktur im Code erzeugen**

```js
export function createQuickMountOverlay(root) {
  root.innerHTML = `
    <section class="quick-mount" aria-label="Modul montieren">
      <header><span class="quick-mount__eyebrow">NEUES MODUL</span><h2 data-role="module-name"></h2></header>
      <div class="quick-mount__reason" data-role="reason"></div>
      <dl class="quick-mount__deltas" data-role="deltas"></dl>
      <footer>
        <button data-action="previous">Vorherige Position</button>
        <button data-action="confirm">Montieren</button>
        <button data-action="next">Nächste Position</button>
        <button data-action="defer">Ins Inventar</button>
      </footer>
    </section>`;
  return root;
}
```

- [ ] **Step 2: Canvas-Vorschau rendert Modul, Panzerung, neue Ports und Silhouettenänderung transparent**
- [ ] **Step 3: Infobox zeigt Energie, Last, Hitze, Korruption, Masse, Flugdelta, Tags und Risiko**
- [ ] **Step 4: Primäransicht bleibt auf drei bis sechs Kernaussagen begrenzt; Tab öffnet Details**
- [ ] **Step 5: CSS wird im Neon-/Void-/CRT-Stil gestaltet, nicht als generisches Browserformular**
- [ ] **Step 6: Commit**

```bash
git add src/ui/ship-assembly src/styles/ship-assembly.css
git commit -m "feat: design quick mount overlay and ghost previews"
```

### Task 5: Desktop- und Touch-Eingaben für Schnellmontage ergänzen

**Files:**
- Modify: `src/input/action-bindings.js`
- Create: `src/ui/ship-assembly/assembly-touch-controls.js`
- Create: `src/styles/ship-assembly-mobile.css`

- [ ] **Step 1: Aktionen definieren**

```js
export const ASSEMBLY_ACTIONS = Object.freeze({
  PREVIOUS_SUGGESTION: 'assembly-previous',
  NEXT_SUGGESTION: 'assembly-next',
  CONFIRM: 'assembly-confirm',
  DETAILS: 'assembly-details',
  DEFER: 'assembly-defer'
});
```

- [ ] **Step 2: Desktop-Bindings**

`A/D`, Pfeile oder Mausrad wechseln; `Enter` oder Klick bestätigt; `Tab` zeigt Details; `Escape` verschiebt ins Inventar.

- [ ] **Step 3: Touch-Bedienung**

Direktes Antippen von Vorschlägen, Wischen zum Wechseln, Long-Press für Details und mindestens 48-Pixel große Hauptschaltflächen.

- [ ] **Step 4: Eingaben werden ausschließlich im Zustand `quick-mount` abgefangen**
- [ ] **Step 5: Commit**

```bash
git add src/input/action-bindings.js src/ui/ship-assembly/assembly-touch-controls.js src/styles/ship-assembly-mobile.css
git commit -m "feat: add desktop and touch quick mount controls"
```

### Task 6: Vollständigen Konstruktionsmodus zwischen Sektoren implementieren

**Files:**
- Create: `src/features/ship-assembly/mounting/construction-workbench-controller.js`
- Create: `src/ui/ship-assembly/assembly-workbench-screen.js`
- Create: `src/ui/ship-assembly/assembly-canvas-controller.js`
- Modify: `src/app/state-machine.js`
- Modify: `src/features/sectors/sector-controller.js`

- [ ] **Step 1: Zustand `assembly-workbench` ergänzen**
- [ ] **Step 2: Werkbankzugang nach Sektor, Werkstatt oder definierter Montagephase erlauben**
- [ ] **Step 3: Canvas Controller unterstützt Drehen, Zoomen, Schwenken und Auswahl**

```js
export function createAssemblyCanvasController({ canvas, camera }) {
  return {
    rotateBy(delta) { camera.rotation += delta; },
    zoomBy(delta) { camera.zoom = Math.max(0.55, Math.min(1.8, camera.zoom + delta)); },
    panBy(dx, dy) { camera.offset.x += dx; camera.offset.y += dy; },
    resetView() { camera.rotation = 0; camera.zoom = 1; camera.offset = { x: 0, y: 0 }; }
  };
}
```

- [ ] **Step 4: Linke Leiste zeigt Run-Inventar, Mitte Schiff, rechte Leiste Inspektor und Deltas**
- [ ] **Step 5: Keine Drag-and-drop-Pflicht auf Touch; Auswahl und Zielport funktionieren auch als zweistufiger Tap**
- [ ] **Step 6: Commit**

```bash
git add src/features/ship-assembly/mounting src/ui/ship-assembly src/app/state-machine.js src/features/sectors/sector-controller.js
git commit -m "feat: add between sector assembly workbench"
```

### Task 7: Fünf Werkbank-Ansichtsmodi implementieren

**Files:**
- Create: `src/ui/ship-assembly/assembly-view-modes.js`
- Create: `src/ui/ship-assembly/port-overlay.js`
- Create: `src/ui/ship-assembly/assembly-inspector-panel.js`

- [ ] **Step 1: Modusdefinitionen codieren**

```js
export const ASSEMBLY_VIEW_MODES = Object.freeze({
  NORMAL: 'normal',
  STRUCTURE: 'structure',
  ENERGY: 'energy',
  DAMAGE: 'damage',
  FLIGHT: 'flight'
});
```

- [ ] **Step 2: Strukturmodus zeigt Ports, Asttiefe, Traglast und Primär-/Sekundärverbindungen**
- [ ] **Step 3: Energiemodus zeigt Energieklassen, Leitungswege und Überlastung**
- [ ] **Step 4: Schadensmodus zeigt Armor/Core-Integrität, Notverbindungen und exponierte Zonen**
- [ ] **Step 5: Flugmodus zeigt Masse, Schwerpunkt, Schubvektoren und Rückstoßachsen**
- [ ] **Step 6: Normalmodus zeigt ausschließlich fertige Konstruktion**
- [ ] **Step 7: Commit**

```bash
git add src/ui/ship-assembly
git commit -m "feat: add assembly workbench visualization modes"
```

### Task 8: Portsymbole und Kompatibilitätsfeedback gestalten

**Files:**
- Modify: `src/ui/ship-assembly/port-overlay.js`
- Modify: `src/styles/ship-assembly.css`

- [ ] **Step 1: Formen codieren**

- `S`: Sechseck,
- `M`: Doppelring,
- `L`: verstärkte Klammer,
- `XL`: massive Strukturhalterung.

- [ ] **Step 2: Montageart wird über Ausrichtung und Zusatzmarke dargestellt**
- [ ] **Step 3: Energieklasse wird über inneres Muster und nicht nur über Farbe gezeigt**
- [ ] **Step 4: Traglast wird über Linien- beziehungsweise Ringstärke angezeigt**
- [ ] **Step 5: Inkompatible Ports bleiben gedimmt sichtbar und zeigen beim Fokus die konkrete Ursache**
- [ ] **Step 6: Commit**

```bash
git add src/ui/ship-assembly/port-overlay.js src/styles/ship-assembly.css
git commit -m "feat: design accessible structural port language"
```

### Task 9: Umbauoperationen für Module und Äste implementieren

**Files:**
- Modify: `src/features/ship-assembly/model/assembly-service.js`
- Modify: `src/features/ship-assembly/mounting/assembly-command-service.js`
- Modify: `src/features/ship-assembly/mounting/construction-workbench-controller.js`

- [ ] **Step 1: `rotateNode` implementieren**

```js
rotateNode({ nodeId, localRotation }) {
  const node = requireNode(nodeId);
  if (nodeId === state.rootNodeId) throw new Error('Root rotation is controlled by the ship frame');
  state.nodesById[nodeId] = { ...node, localRotation };
  publish(ASSEMBLY_EVENTS.MODULE_MOVED, { nodeId, localRotation });
}
```

- [ ] **Step 2: `moveBranch` implementieren und alle Kindtransformationen relativ erhalten**

```js
moveBranch({ rootNodeId, targetPort, transform }) {
  const branchIds = getBranchNodeIds(state, rootNodeId);
  if (branchIds.includes(targetPort.parentNodeId)) throw new Error('Branch move would create a cycle');
  moveNode({ nodeId: rootNodeId, targetPort, transform });
  publish(ASSEMBLY_EVENTS.MODULE_MOVED, { rootNodeId, branchIds, mode: 'branch' });
  return branchIds;
}
```

- [ ] **Step 3: `dismantleNode` legt Item ins Run-Inventar und entfernt nur zulässige Struktur**

```js
dismantleNode({ nodeId, includeBranch = false }) {
  const nodeIds = includeBranch ? getBranchNodeIds(state, nodeId) : [nodeId];
  const items = nodeIds.map(currentId => requireNode(currentId).moduleInstanceId).filter(Boolean);
  const detached = detachNode({ nodeId, detachBranch: includeBranch });
  for (const itemInstanceId of items) runInventory.store(itemInstanceId);
  return detached;
}
```
- [ ] **Step 4: Reine Positionsänderungen kostenlos halten**
- [ ] **Step 5: Größen-, Montage- oder Energieklassenwechsel nur mit Adapter beziehungsweise Werkstattaktion erlauben**
- [ ] **Step 6: Vor Ausführung eine Konsequenzvorschau anzeigen**
- [ ] **Step 7: Commit**

```bash
git add src/features/ship-assembly/model src/features/ship-assembly/mounting
git commit -m "feat: add safe module and branch reconstruction commands"
```

### Task 10: Bau-, Umbau- und Demontageanimationen implementieren

**Files:**
- Create: `src/features/ship-assembly/mounting/build-animation-controller.js`
- Modify: `src/render/ship-assembly/assembly-renderer.js`
- Modify: `src/render/ship-assembly/activity-animation-renderer.js`

- [ ] **Step 1: Animationsphasen definieren**

```js
export const BUILD_PHASES = [
  { id: 'port-glow', duration: 0.12 },
  { id: 'extend-braces', duration: 0.18 },
  { id: 'lock-core', duration: 0.16 },
  { id: 'connect-lines', duration: 0.14 },
  { id: 'close-armor', duration: 0.22 },
  { id: 'power-up', duration: 0.18 }
];
```

- [ ] **Step 2: Controller berechnet normalisierten Fortschritt pro Phase**
- [ ] **Step 3: Run-Montage dauert ungefähr 0,5 bis 1 Sekunde; Werkbankmontage 1 bis 2 Sekunden**
- [ ] **Step 4: Steuerung wird nach Bestätigung sofort wieder freigegeben; die Animation läuft visuell weiter**
- [ ] **Step 5: Umbau öffnet Panzerung und löst Leitungen; Demontage fährt Bauteile kontrolliert zurück**
- [ ] **Step 6: Reduzierte Bewegung verwendet verkürzte Überblendungen ohne starke Partikel**
- [ ] **Step 7: Commit**

```bash
git add src/features/ship-assembly/mounting src/render/ship-assembly
git commit -m "feat: animate ship construction and reconstruction"
```

### Task 11: Phase-3-Abnahme ohne Testsystem

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/styles/ship-assembly.css`
- Modify: `src/styles/ship-assembly-mobile.css`

- [ ] **Step 1: Alle Controller und UI-Komponenten verdrahten**
- [ ] **Step 2: `npm run build` ausführen**
- [ ] **Step 3: Desktop-Szenario prüfen**

1. S-Modul finden, drei Vorschläge durchschalten, montieren.
2. M-Modul über Escape ins Inventar legen.
3. Werkbank öffnen, M-Modul manuell platzieren.
4. Ganzen Ast verschieben und drehen.
5. Struktur-, Energie-, Schaden- und Flugmodus prüfen.

- [ ] **Step 4: Touch-Szenario prüfen**

1. Vorschläge antippen und wischen.
2. Details per Long-Press öffnen.
3. Werkbank ohne Drag-and-drop bedienen.
4. Zoom und Drehung per Gesten prüfen.

- [ ] **Step 5: Visuelle Prüfung**

Keine finalen UI-Bereiche bestehen nur aus generischen Rechtecken; Ports, Panelrahmen, Icons und Vorschauen passen zum VOIDREAPER-Stil.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: complete ship assembly mounting experience"
```
