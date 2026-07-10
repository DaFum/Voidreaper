# VOIDREAPER Adaptive Ship Assembly Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Projektvorgabe:** Für dieses Feature werden keine Testdateien, kein Testverzeichnis und kein automatisiertes Testframework ergänzt. Kontrollschritte bestehen aus Produktions-Builds, statischer Content-Validierung, reproduzierbaren Entwicklungs-Szenarien und manueller Prüfung im integrierten Assembly-Debugmodus.

> **Verbindliche Gestaltungsregel:** „Handgestaltet“ bedeutet, dass der Coding Agent alle sichtbaren Modulkerne, Panzerungen, Ports, Streben, Leitungen, Animationen, Schadenszustände, Symbole und Oberflächen direkt im Code entwirft und implementiert. Externe Designer, nachzuliefernde Sprites und finale Platzhaltergeometrien sind ausgeschlossen.

**Goal:** Das bisher feste Spielerschiff in einen während des Runs sichtbar wachsenden, adaptiv verzweigten Schiffs-Assembler mit mehrteiligen Trefferzonen, begrenztem Physikeinfluss und speicherbaren Bauplänen überführen.

**Architecture:** Das bestehende Equipment-System bleibt alleinige Quelle für Module, Werte, Energie, Tags und Affixe. Ein neuer Ship-Assembly-Bereich referenziert vorhandene `moduleInstanceId`-Werte und ergänzt ausschließlich Konstruktion, Geometrie, Darstellung, Platzierung, Trefferzonen, Schäden, Flugprofil und Bauplanvorlagen. Die Umsetzung wird in fünf voneinander abhängige Teilpläne zerlegt, damit jede Stufe separat integrierbar und manuell abnehmbar bleibt.

**Tech Stack:** Bestehende VOIDREAPER-Anwendung mit Vanilla JavaScript/ES Modules, Vite, Canvas 2D, DOM/CSS, bestehendem Event Bus, Equipment-, Run-, Sector-, Persistence- und Rendering-System. Keine zusätzliche Grafikbibliothek und kein Testsystem.

---

## Voraussetzungen

Der aktuelle Arbeitsbranch enthält bereits die vier zuvor umgesetzten Hauptphasen:

- Build Engine,
- Loadouts und Ausrüstung,
- Run-Struktur,
- Metagame.

Die folgenden Pfade orientieren sich an der freigegebenen Zielarchitektur. Falls die tatsächliche Implementierung gleichwertige Dateien unter leicht anderen Namen verwendet, wird beim Start der Ausführung eine einmalige Pfadzuordnung dokumentiert. Danach bleiben alle im Plan verwendeten Namen konsistent.

## Teilpläne und Reihenfolge

1. `2026-07-10-adaptive-ship-assembly-phase-1-graph-and-content.md`
   - Konstruktionsgraph, Ports, Kompatibilität, Modulmetadaten, Placement-Vorschläge.
2. `2026-07-10-adaptive-ship-assembly-phase-2-geometry-and-visuals.md`
   - prozedurale Geometrie, Funktionskerne, adaptive Panzerung, Ausgleichselemente, Animationen, LOD.
3. `2026-07-10-adaptive-ship-assembly-phase-3-mounting-and-ui.md`
   - Schnellmontage, Werkbank, Ansichtsmodi, Umbau, Touch-/Desktop-Bedienung, Bauanimation.
4. `2026-07-10-adaptive-ship-assembly-phase-4-damage-and-flight.md`
   - Trefferzonen, dreistufiger Modulschaden, Astverlust, Reparatur, Masse, Trägheit, Rückstoß und Kamera.
5. `2026-07-10-adaptive-ship-assembly-phase-5-blueprints-and-integration.md`
   - Baupläne, Persistenz, Import/Export, Miniaturen, Performance-Caches, Debugmodus und Gesamtabnahme.


## Abdeckungsmatrix der freigegebenen Spezifikation

| Nr. | Anforderung | Umsetzung |
|---:|---|---|
| 1 | Run startet mit kleinem Kernschiff | Phase 1, Tasks 4 und 8 |
| 2 | Module erzeugen sichtbare Funktionskerne und Astsegmente | Phase 2, Tasks 2 bis 4 |
| 3 | Module öffnen neue Ports | Phase 1, Tasks 3 und 5 |
| 4 | Zwei bis drei kompatible Vorschläge | Phase 1, Task 7; Phase 3, Task 3 |
| 5 | Kleine Module im Run montierbar | Phase 3, Tasks 1 bis 5 |
| 6 | Große und strukturelle Module zwischen Sektoren | Phase 3, Task 6 |
| 7 | Adaptive Panzerung verbindet Module mit Kernstil | Phase 2, Task 4 |
| 8 | Ausgleichselemente für asymmetrische Konstruktionen | Phase 2, Task 5 |
| 9 | Eigene Trefferzonen für echte Module | Phase 4, Task 1 |
| 10 | Panzerung, Kernstörung und Abtrennung | Phase 4, Tasks 2 und 3 |
| 11 | Astreaktion beim Verlust eines Elternmoduls | Phase 4, Task 5 |
| 12 | Begrenzter Einfluss von Masse und Position | Phase 4, Tasks 8 bis 11 |
| 13 | Baupläne speichern Konstruktion statt Ausrüstung | Phase 5, Tasks 1 und 2 |
| 14 | Import, Export und Geisterstruktur | Phase 5, Tasks 3 und 4 |
| 15 | Sämtliche Gestaltung durch Coding Agent | Phase 1, Task 5; Phase 2, Tasks 1 bis 5; Phase 3, Tasks 4 und 8 |
| 16 | Keine ausgelagerten Grafikaufgaben | Verbindliche Regel in allen Teilplänen; Phase 5, Task 11 validiert Profile |
| 17 | Desktop- und Touch-Bedienung | Phase 3, Tasks 4 bis 8 |
| 18 | Kein zusätzliches Testsystem | Verbindliche Regel in allen Teilplänen; manuelle DEV-Szenarien |
| 19 | Performance und Lesbarkeit maximaler Konstruktion | Phase 2, Tasks 6 und 10; Phase 5, Task 8 |
| 20 | Fehlerhafte Module beschädigen Run oder Save nicht dauerhaft | Phase 5, Tasks 7 und 10 |
| 21 | Equipment bleibt einzige Gameplay-Wertequelle | Phase 1, Tasks 5 und 8 |
| 22 | Keine parallele Gameplay-Logik im Assembler | Phase 1, Tasks 3 und 8 |
| 23 | Ausgleichselemente ohne Werte und Trefferzonen | Phase 2, Task 5 |
| 24 | Abgetrennte Module bleiben beschädigte Item-Instanzen | Phase 4, Tasks 3 und 5 |
| 25 | Kern und Root-Knoten sind nicht entfernbar | Phase 1, Tasks 2 und 3 |

## Gemeinsame öffentliche Schnittstellen

Diese Namen gelten über alle Teilpläne hinweg:

```js
// src/features/ship-assembly/index.js
export { createAssemblyState } from './model/create-assembly-state.js';
export { createAssemblyService } from './model/assembly-service.js';
export { createCompatibilityService } from './placement/compatibility-service.js';
export { createPlacementSuggestionService } from './placement/placement-suggestion-service.js';
export { createAssemblyGeometryService } from './geometry/assembly-geometry-service.js';
export { createAssemblyDamageService } from './damage/assembly-damage-service.js';
export { createFlightProfileService } from './flight/flight-profile-service.js';
export { createBlueprintService } from './blueprints/blueprint-service.js';
```

Der `AssemblyService` ist die einzige Schreibschnittstelle für den Konstruktionsgraphen. Renderer, UI, Damage- und Flight-Systeme lesen Snapshots oder reagieren auf Events.

## Gemeinsame Events

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

## Nicht verhandelbare Grenzen

- maximal vier funktionale Astebenen im Standardmodus,
- maximal 18 sichtbare echte Modulsegmente,
- Kern und Root-Knoten sind nicht entfernbar,
- visuelle Ausgleichselemente besitzen keine Werte und keine Trefferzonen,
- jedes echte Modul referenziert genau eine bestehende Item-Instanz,
- Paarmodule dürfen mehrere sichtbare Segmente besitzen, aber nur einen logischen Eigentümerknoten,
- komplette Geometrie wird nur nach Strukturänderungen neu berechnet,
- fehlende Visual- oder Hitboxdaten erhalten stilgerechte Laufzeit-Fallbacks, werden aber durch die Content-Validierung als Fehler gemeldet,
- Baupläne geben keine Items, Affixe oder Freischaltungen.

## Manuelle Gesamt-Abnahme

- [ ] Einen neuen Run mit ausschließlich Kernrumpf starten.
- [ ] Kleine Module über Schnellmontage an drei unterschiedlichen Ports platzieren.
- [ ] Ein großes Strukturmodul zwischen Sektoren montieren und einen neuen Ast erzeugen.
- [ ] Eine deutlich asymmetrische Konstruktion bauen und die visuellen Ausgleichselemente prüfen.
- [ ] Alle fünf Werkbank-Ansichtsmodi prüfen.
- [ ] Panzerung eines Außenmoduls brechen, Funktionskern stören und Modul abtrennen.
- [ ] Ein tragendes Elternmodul mit und ohne Sekundärverbindung abtrennen.
- [ ] Ein abgetrenntes Modul reparieren und erneut montieren.
- [ ] Masse, Schwerpunkt, Rückstoß und Dodge-Auswirkung vor und nach Umbau vergleichen.
- [ ] Eine maximale Konstruktion mit 18 sichtbaren Segmenten erzeugen und im Kampf spielen.
- [ ] Eine Konstruktion als Bauplan speichern, exportieren, importieren und als Geisterstruktur verwenden.
- [ ] Einen alten Save laden und prüfen, dass Loadouts, Prototypen und Runs unverändert bleiben.
- [ ] `npm run validate:assembly` ausführen; erwartet: keine fehlenden Profile oder ungültigen Referenzen.
- [ ] `npm run build` ausführen; erwartet: Produktions-Build ohne Fehler.
