# VOIDREAPER Phase 3 – Run-Struktur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Vorgabe des Auftraggebers:** In dieser Planung werden keine Testdateien, kein Testverzeichnis, kein Testframework und keine automatisierten Testläufe angelegt. Die Kontrollschritte bestehen ausschließlich aus Build-Prüfungen, Browser-Konsole, reproduzierbaren Seeds und manuellen Funktionskontrollen. Es dürfen insbesondere weder Vitest/Jest noch Playwright/Cypress oder vergleichbare Systeme ergänzt werden.


**Goal:** Die bisher lineare Wellenfolge durch eine 30–40-minütige Kampagne mit Sektorkarte, unterschiedlichen Begegnungszielen, Händler, Werkstatt, Risikoereignissen, Endboss, Extraktion und optionalem Abyss ersetzen.

**Architecture:** Der Run Controller verwaltet Kampagnenabschnitte und Knotenübergänge. Ein deterministischer Kartengenerator erzeugt einen gerichteten Graphen. Jeder Knoten delegiert an einen Encounter Controller oder einen Nicht-Kampf-Screen. Checkpoints werden ausschließlich zwischen Knoten gespeichert.

**Tech Stack:** Modulare Vanilla-JavaScript-Anwendung aus Phase 1 und 2, Canvas, DOM und Vite. Keine automatisierten Tests.

---

## Dateizuordnung

- `src/features/sectors/sector-map-generator.js`
- `src/features/sectors/sector-controller.js`
- `src/features/encounters/encounter-controller.js`
- `src/features/encounters/objectives/*.js`
- `src/features/merchant/merchant-service.js`
- `src/features/workshop/workshop-service.js`
- `src/features/extraction/extraction-service.js`
- `src/features/abyss/abyss-controller.js`
- `src/features/checkpoints/checkpoint-service.js`
- `src/content/sectors/regions.js`
- `src/content/sectors/node-types.js`
- `src/content/sectors/anomaly-events.js`
- `src/content/bosses/campaign-bosses.js`
- `src/ui/screens/sector-map-screen.js`
- `src/ui/screens/merchant-screen.js`
- `src/ui/screens/workshop-screen.js`
- `src/ui/screens/extraction-screen.js`
- `src/ui/screens/sector-summary-screen.js`
- `src/styles/map.css`

---

### Task 1: Kampagnenzustand und Run-Phasen einführen

**Files:**
- Create: `src/features/sectors/campaign-state.js`
- Modify: `src/runtime/create-run-state.js`
- Modify: `src/app/state-machine.js`

- [ ] **Step 1: Kampagnenzustand definieren**

```js
export function createCampaignState() {
  return {
    regionIndex: 0,
    currentNodeId: null,
    visitedNodeIds: [],
    map: null,
    elapsedCampaignTime: 0,
    bossProgress: 0,
    extractionWindowsUsed: 0,
    abyssDepth: 0
  };
}
```

- [ ] **Step 2: Zustände `sector-map`, `merchant`, `workshop`, `anomaly`, `extraction`, `sector-summary` und `abyss-transition` ergänzen**
- [ ] **Step 3: Alte automatische `startWave(wave + 1)`-Folge nur noch innerhalb eines Combat-Knotens verwenden**
- [ ] **Step 4: Commit**

```bash
git add src/features/sectors/campaign-state.js src/runtime src/app/state-machine.js
git commit -m "feat: add campaign and sector runtime states"
```

---

### Task 2: Deterministischen Sektorkartengenerator implementieren

**Files:**
- Create: `src/features/sectors/sector-map-generator.js`
- Create: `src/content/sectors/node-types.js`

- [ ] **Step 1: Graphform definieren**

Fünf Regionen, pro Region zwei bis vier Ebenen, je Ebene zwei bis drei Knoten, ein garantierter Bossausgang.

- [ ] **Step 2: Knotenregeln implementieren**

- keine Sackgasse
- mindestens ein Recovery- oder Workshop-Pfad pro zwei Regionen
- kein Händler direkt nach Händler
- Boss nur am Regionsende
- Extraction nach Zwischenboss möglich
- Gefahr und Belohnung werden beim Erzeugen gespeichert

- [ ] **Step 3: Seed und Content-Version in der Karte speichern**
- [ ] **Step 4: Generator erzeugt bei ungültigem Content einen Combat-Ersatzknoten**
- [ ] **Step 5: Commit**

```bash
git add src/features/sectors/sector-map-generator.js src/content/sectors/node-types.js
git commit -m "feat: add deterministic sector graph generation"
```

---

### Task 3: Sektorkarten-UI implementieren

**Files:**
- Create: `src/ui/screens/sector-map-screen.js`
- Create: `src/ui/components/sector-node.js`
- Create: `src/styles/map.css`

- [ ] **Step 1: Erreichbare, besuchte, gesperrte und unbekannte Knoten darstellen**
- [ ] **Step 2: Jeder sichtbare Knoten zeigt Typ, Region, Gefahr, Belohnung und Korruptionsänderung**
- [ ] **Step 3: Unbekannte Signaturen zeigen nur die freigegebene Informationsstufe**
- [ ] **Step 4: Touch-Auswahl erfordert einen Tap für Details und einen zweiten für Bestätigung**
- [ ] **Step 5: Commit**

```bash
git add src/ui/screens/sector-map-screen.js src/ui/components/sector-node.js src/styles/map.css
git commit -m "feat: add interactive sector map screen"
```

---

### Task 4: Encounter Controller und Objective-Schnittstelle implementieren

**Files:**
- Create: `src/features/encounters/encounter-controller.js`
- Create: `src/features/encounters/objective-schema.js`

- [ ] **Step 1: Objective-Schnittstelle definieren**

```js
{
  id: "survive",
  createState(context) {},
  start(context, state) {},
  update(context, state, dt) {},
  isComplete(context, state) {},
  getHud(context, state) {},
  finish(context, state) {}
}
```

- [ ] **Step 2: Encounter startet Gegnerdirector, Ziel und Zeitbudget**
- [ ] **Step 3: Abschluss emittiert genau einmal `encounter-completed`**
- [ ] **Step 4: Abbruch durch Game-over oder Extraktion räumt alle temporären Entities auf**
- [ ] **Step 5: Commit**

```bash
git add src/features/encounters
git commit -m "feat: add encounter objective framework"
```

---

### Task 5: Zehn Begegnungsziele implementieren

**Files:**
- Create: `src/features/encounters/objectives/survive.js`
- Create: `src/features/encounters/objectives/eliminate-target.js`
- Create: `src/features/encounters/objectives/protect-convoy.js`
- Create: `src/features/encounters/objectives/close-rifts.js`
- Create: `src/features/encounters/objectives/hold-zones.js`
- Create: `src/features/encounters/objectives/salvage-rush.js`
- Create: `src/features/encounters/objectives/weaken-boss.js`
- Create: `src/features/encounters/objectives/hunt-warper.js`
- Create: `src/features/encounters/objectives/minefield-run.js`
- Create: `src/features/encounters/objectives/voluntary-evacuation.js`

- [ ] **Step 1: Jedes Ziel nach der gemeinsamen Schnittstelle implementieren**
- [ ] **Step 2: Zielzustand im HUD anzeigen**
- [ ] **Step 3: Ziele mit Auto-Fire und Touch-Bewegung lösbar halten**
- [ ] **Step 4: Kontroll-Builds erhalten alternative Fortschrittsbeiträge**
- [ ] **Step 5: Commit**

```bash
git add src/features/encounters/objectives
git commit -m "feat: add ten distinct combat objectives"
```

---

### Task 6: Fünf Regionen und Arenaregeln implementieren

**Files:**
- Create: `src/content/sectors/regions.js`
- Create: `src/features/sectors/region-rules.js`
- Modify: `src/render/world-renderer.js`

- [ ] **Step 1: Shattered Approach mit klarer Arena und Basiskadern definieren**
- [ ] **Step 2: Furnace Expanse mit Hitzezonen und Kühlressourcen definieren**
- [ ] **Step 3: Grave Circuit mit Wracks, Drohnen und Salvage definieren**
- [ ] **Step 4: Null Cathedral mit Sichtverzerrung und Korruptionsangeboten definieren**
- [ ] **Step 5: Architect's Crown mit wechselnden Arenaregeln definieren**
- [ ] **Step 6: Region beeinflusst Hintergrund, Hex-Floor, Gegnerpool, Loot und Audio**
- [ ] **Step 7: Commit**

```bash
git add src/content/sectors src/features/sectors/region-rules.js src/render/world-renderer.js
git commit -m "feat: add five campaign regions and arena rules"
```

---

### Task 7: Scrap- und Flux-Runökonomie implementieren

**Files:**
- Create: `src/features/economy/run-currency-service.js`
- Modify: `src/runtime/create-run-state.js`
- Modify: `src/ui/components/resource-meters.js`

- [ ] **Step 1: `scrap` und `flux` zum Run-Zustand hinzufügen**
- [ ] **Step 2: Gegner, Ziele, Salvage und Verkauf als Quellen registrieren**
- [ ] **Step 3: Void Shards aus normalen Händlerkäufen ausschließen**
- [ ] **Step 4: HUD und Sektorübersicht ergänzen**
- [ ] **Step 5: Commit**

```bash
git add src/features/economy src/runtime src/ui/components
git commit -m "feat: add run specific scrap and flux economy"
```

---

### Task 8: Händler implementieren

**Files:**
- Create: `src/features/merchant/merchant-service.js`
- Create: `src/content/merchant/merchant-pools.js`
- Create: `src/ui/screens/merchant-screen.js`

- [ ] **Step 1: Drei bis fünf Module, eine Waffen- oder Reaktoroption, zwei Dienste und ein korruptes Angebot rollen**
- [ ] **Step 2: Preise aus Item Power, Seltenheit, Region und Händlerstufe berechnen**
- [ ] **Step 3: Kaufen, Verkaufen, Reservieren, Reroll und Kartenaufdeckung implementieren**
- [ ] **Step 4: Seed-deterministische Angebote speichern**
- [ ] **Step 5: Commit**

```bash
git add src/features/merchant src/content/merchant src/ui/screens/merchant-screen.js
git commit -m "feat: add deterministic sector merchant"
```

---

### Task 9: Werkstatt implementieren

**Files:**
- Create: `src/features/workshop/workshop-service.js`
- Create: `src/ui/screens/workshop-screen.js`

- [ ] **Step 1: Begrenzte Aktionspunkte pro Werkstatt einführen**
- [ ] **Step 2: Modulwechsel, Affix-Reroll, Affix-Sperre, Sockel, Stabilisierung und Korruption implementieren**
- [ ] **Step 3: Reaktorübertaktung verändert Last, Hitze und Fehlerprofil**
- [ ] **Step 4: Jede Aktion zeigt Kosten und endgültige Folgen vor Bestätigung**
- [ ] **Step 5: Commit**

```bash
git add src/features/workshop src/ui/screens/workshop-screen.js
git commit -m "feat: add limited action workshop"
```

---

### Task 10: Risiko- und Anomalieereignisse implementieren

**Files:**
- Create: `src/content/sectors/anomaly-events.js`
- Create: `src/features/sectors/anomaly-service.js`
- Create: `src/ui/screens/anomaly-screen.js`

- [ ] **Step 1: The Choir Answers implementieren**
- [ ] **Step 2: Cold Forge implementieren**
- [ ] **Step 3: Dead Pilot implementieren**
- [ ] **Step 4: Mirror Tax implementieren**
- [ ] **Step 5: Mindestens zwölf weitere Ereignisse über dieselbe Entscheidungsstruktur ergänzen**
- [ ] **Step 6: Kosten, bekannte Belohnung und mögliche unbekannte Folge separat anzeigen**
- [ ] **Step 7: Commit**

```bash
git add src/content/sectors/anomaly-events.js src/features/sectors/anomaly-service.js src/ui/screens/anomaly-screen.js
git commit -m "feat: add risk and anomaly decision events"
```

---

### Task 11: Zwischenbosse implementieren

**Files:**
- Create: `src/content/bosses/mid-bosses.js`
- Create: `src/features/encounters/boss-controller.js`

- [ ] **Step 1: Mindestens fünf Zwischenbosse, je einer pro Region, definieren**
- [ ] **Step 2: Jeder Boss prüft eine andere Build-Eigenschaft**
- [ ] **Step 3: Kontroll-Effekte verwenden Widerstandsskalen statt Immunität**
- [ ] **Step 4: Garantierte Belohnung ist Evolutionskatalysator oder Reaktor**
- [ ] **Step 5: Commit**

```bash
git add src/content/bosses/mid-bosses.js src/features/encounters/boss-controller.js
git commit -m "feat: add region specific mid bosses"
```

---

### Task 12: Eternal Architect als Kampagnen-Endboss implementieren

**Files:**
- Create: `src/content/bosses/eternal-architect.js`
- Create: `src/features/encounters/architect-controller.js`

- [ ] **Step 1: Phase 1 mit segmentierter Arena umsetzen**
- [ ] **Step 2: Phase 2 kopiert dominante Spielertags**
- [ ] **Step 3: Phase 3 erzeugt Angriffe aus Last und Korruption**
- [ ] **Step 4: Finale Phase bietet Stabilisierung oder maximale Überladung als Kampfentscheidung**
- [ ] **Step 5: Für jede Waffenfamilie einen fairen Schadens- und Kontrollweg sicherstellen**
- [ ] **Step 6: Commit**

```bash
git add src/content/bosses/eternal-architect.js src/features/encounters/architect-controller.js
git commit -m "feat: add eternal architect campaign finale"
```

---

### Task 13: Extraktionsservice implementieren

**Files:**
- Create: `src/features/extraction/extraction-service.js`
- Create: `src/ui/screens/extraction-screen.js`
- Modify: `src/features/inventory/prototype-service.js`

- [ ] **Step 1: Extraktionsfenster nach Zwischenbossen und Endboss anlegen**
- [ ] **Step 2: Auswahl markierter Prototypen implementieren**
- [ ] **Step 3: 45–75 Sekunden Holdout aus Itemzustand und Korruption berechnen**
- [ ] **Step 4: Erfolgreiche Gegenstände sofort atomar in den permanenten Save übertragen**
- [ ] **Step 5: Gesicherte Gegenstände im Run weiter nutzbar lassen**
- [ ] **Step 6: Commit**

```bash
git add src/features/extraction src/ui/screens/extraction-screen.js src/features/inventory
git commit -m "feat: add prototype extraction holdouts"
```

---

### Task 14: Checkpoints zwischen Sektoren implementieren

**Files:**
- Create: `src/features/checkpoints/checkpoint-service.js`
- Modify: `src/persistence/save-schema.js`
- Modify: `src/persistence/save-store.js`

- [ ] **Step 1: Vollständigen Run-Zustand ohne Canvas- und Audioobjekte serialisieren**
- [ ] **Step 2: RNG-Zustand, Karte, Inventar und Händlerangebote speichern**
- [ ] **Step 3: Checkpoint nur nach abgeschlossenem Knoten schreiben**
- [ ] **Step 4: Checkpoint bei Game-over oder erfolgreichem Run löschen**
- [ ] **Step 5: Wiederaufnahme im Menü anbieten**
- [ ] **Step 6: Commit**

```bash
git add src/features/checkpoints src/persistence
git commit -m "feat: add between sector run checkpoints"
```

---

### Task 15: Daily Seed vollständig standardisieren

**Files:**
- Create: `src/features/sectors/daily-run-service.js`
- Modify: `src/app/game-controller.js`

- [ ] **Step 1: Seed aus Datum, Seed-Version und Content-Version erzeugen**
- [ ] **Step 2: Eigene Prototypwerte und permanente Zahlenboni im Daily deaktivieren**
- [ ] **Step 3: Karte, Händler, Gegner und Angebote vollständig deterministisch machen**
- [ ] **Step 4: Daily-Rekord mit Versionsmetadaten speichern**
- [ ] **Step 5: Commit**

```bash
git add src/features/sectors/daily-run-service.js src/app/game-controller.js
git commit -m "feat: standardize fair daily seeded runs"
```

---

### Task 16: Abyss-Controller implementieren

**Files:**
- Create: `src/features/abyss/abyss-controller.js`
- Create: `src/content/abyss/abyss-modifiers.js`
- Create: `src/ui/screens/abyss-transition-screen.js`

- [ ] **Step 1: Nach Endboss zwischen sicherer Extraktion und Abyss wählen**
- [ ] **Step 2: Pro Tiefe Gegner, Eliten, Korruption, Fehler und Loot monoton steigern**
- [ ] **Step 3: Jede dritte Tiefe Extraktion und jede fünfte Tiefe Boss garantieren**
- [ ] **Step 4: Korruption über 100 und zusätzliche verbotene Stufen zulassen**
- [ ] **Step 5: Score aus Tiefe, Zeit, Bossen und Stabilität berechnen**
- [ ] **Step 6: Commit**

```bash
git add src/features/abyss src/content/abyss src/ui/screens/abyss-transition-screen.js
git commit -m "feat: add endless abyss progression"
```

---

### Task 17: Schwierigkeitsprofile implementieren

**Files:**
- Create: `src/content/difficulty/difficulty-profiles.js`
- Create: `src/ui/components/difficulty-selector.js`

- [ ] **Step 1: Initiate, Standard, Reaper und Abyssal definieren**
- [ ] **Step 2: Gegnerdichte, Fehler, Reparatur, Elite-Synergien und Loot anpassen**
- [ ] **Step 3: Initiate schützt gewöhnliche Prototypen vor Verlust**
- [ ] **Step 4: Abyssal startet mit Korruption und erweiterten Bossmechaniken**
- [ ] **Step 5: Commit**

```bash
git add src/content/difficulty src/ui/components/difficulty-selector.js
git commit -m "feat: add systemic difficulty profiles"
```

---

### Task 18: Sektor-Zusammenfassung implementieren

**Files:**
- Create: `src/ui/screens/sector-summary-screen.js`
- Create: `src/features/telemetry/run-telemetry.js`

- [ ] **Step 1: Schaden nach Quelle erfassen**
- [ ] **Step 2: Heat-Spitzen, Systemfehler und aktive Synergien erfassen**
- [ ] **Step 3: Evolutionsfortschritt, neue Codex-Signaturen und Prototypstatus anzeigen**
- [ ] **Step 4: Telemetrie bleibt lokal und wird nicht extern gesendet**
- [ ] **Step 5: Commit**

```bash
git add src/ui/screens/sector-summary-screen.js src/features/telemetry
git commit -m "feat: add post sector build telemetry summary"
```

---

### Task 19: Phase-3-Integration und manuelle Kontrolle

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/persistence/save-schema.js`

- [ ] **Step 1: Kampagne als Standardmodus aktivieren**
- [ ] **Step 2: Produktions-Build ausführen**

```bash
npm run build
```

- [ ] **Step 3: Manuelle Phase-3-Kontrolle**

1. Neue Kampagne starten und drei verschiedene Pfade wählen.
2. Alle zehn Knotentypen mindestens einmal öffnen.
3. Händlerkauf und Werkstatt-Reroll durchführen.
4. Zwischenboss besiegen und Prototyp extrahieren.
5. Checkpoint nach Sektor speichern, Browser neu laden und fortsetzen.
6. Eternal Architect besiegen.
7. Einmal sicher extrahieren.
8. Zweiten Run nach Endboss in den Abyss führen.
9. Abyss-Tiefe 5 und Boss erreichen.
10. Daily zweimal mit identischen Entscheidungen vergleichen.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: complete campaign sectors extraction and abyss"
```
