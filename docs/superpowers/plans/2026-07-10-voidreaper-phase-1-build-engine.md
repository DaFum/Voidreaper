# VOIDREAPER Phase 1 – Build Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Vorgabe des Auftraggebers:** In dieser Planung werden keine Testdateien, kein Testverzeichnis, kein Testframework und keine automatisierten Testläufe angelegt. Die Kontrollschritte bestehen ausschließlich aus Build-Prüfungen, Browser-Konsole, reproduzierbaren Seeds und manuellen Funktionskontrollen. Es dürfen insbesondere weder Vitest/Jest noch Playwright/Cypress oder vergleichbare Systeme ergänzt werden.


**Goal:** Die bestehende Ein-Datei-Anwendung verhaltensneutral modularisieren und danach die gemeinsame Build Engine für Stats, Tags, Trigger, Energie, Hitze, Korruption, Systemfehler und Evolutionen einführen.

**Architecture:** Die aktuelle Simulation bleibt Fixed-Step-basiert und nutzt weiterhin Canvas, Object Pools und Spatial Hash. Gameplay-Regeln werden aus `Game` in kleine Feature-Services verschoben. Content-Definitionen referenzieren registrierte Effekte und Bedingungen; sie enthalten keinen frei ausführbaren Code.

**Tech Stack:** Vanilla JavaScript ES Modules, Vite, Canvas 2D, Web Audio API, CSS. Keine automatisierten Tests.

---

## Dateizuordnung

### Neu

- `package.json` – Entwicklungs- und Build-Kommandos.
- `vite.config.js` – Vite-Konfiguration.
- `index.html` – DOM-Shell ohne eingebettete Spiellogik.
- `src/main.js` – Einstieg.
- `src/app/bootstrap.js` – Initialisierung aller Services.
- `src/app/game-controller.js` – High-Level-Zustandsübergänge.
- `src/app/state-machine.js` – Menü-, Run-, Pause-, Level-up- und Game-over-Zustände.
- `src/core/event-bus.js` – synchrone Domain-Events.
- `src/core/rng.js` – deterministischer Run-RNG.
- `src/core/registry.js` – Content- und Effektregistrierung.
- `src/core/schema.js` – Laufzeitvalidierung.
- `src/core/math.js` – mathematische Helfer.
- `src/runtime/create-run-state.js` – kompletter Run-Zustand.
- `src/runtime/create-player-state.js` – Spieler-Laufzeitdaten.
- `src/runtime/selectors.js` – abgeleitete Werte.
- `src/persistence/save-store.js` – Speichern und Laden.
- `src/persistence/migrations.js` – Übernahme des bisherigen Speicherstands.
- `src/input/input-controller.js` – Tastatur und Pointer.
- `src/audio/audio-system.js` – prozedurales Audio.
- `src/render/canvas-renderer.js` – Canvas-Frame.
- `src/render/world-renderer.js` – Arena und Hintergrund.
- `src/render/entity-renderer.js` – Spieler, Gegner, Projektile und Pick-ups.
- `src/render/effects-renderer.js` – Partikel und Texte.
- `src/features/stats/stat-engine.js`
- `src/features/tags/tag-engine.js`
- `src/features/effects/effect-registry.js`
- `src/features/triggers/trigger-engine.js`
- `src/features/energy/energy-system.js`
- `src/features/heat/heat-system.js`
- `src/features/corruption/corruption-system.js`
- `src/features/faults/fault-scheduler.js`
- `src/features/evolution/evolution-system.js`
- `src/ui/screens/build-inspector.js`
- `src/ui/components/resource-meters.js`
- `src/content/evolutions/legacy-evolutions.js`

### Beibehalten

- `voidreaper-redux.html` – unveränderte Referenz bis zum Abschluss dieser Phase.

---

### Task 1: Vite-Shell und unveränderte Referenz sichern

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Preserve: `voidreaper-redux.html`

- [ ] **Step 1: Projektmetadaten anlegen**

```json
{
  "name": "voidreaper-eternal-redux",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^7.0.0"
  }
}
```

- [ ] **Step 2: Vite-Konfiguration anlegen**

```js
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    host: "0.0.0.0"
  },
  build: {
    target: "es2020",
    sourcemap: true
  }
});
```

- [ ] **Step 3: `index.html` als DOM-Shell aus der vorhandenen Datei übernehmen**

Alle vorhandenen Canvas-, HUD- und Screen-Elemente werden übernommen. Das eingebettete `<script>` wird entfernt und vor `</body>` ersetzt durch:

```html
<script type="module" src="/src/main.js"></script>
```

- [ ] **Step 4: Einstieg anlegen**

```js
import "./styles/tokens.css";
import "./styles/base.css";
import { bootstrap } from "./app/bootstrap.js";

bootstrap();
```

- [ ] **Step 5: Abhängigkeiten installieren und Build prüfen**

Run:

```bash
npm install
npm run build
```

Expected: Vite erzeugt `dist/` ohne Import- oder Syntaxfehler.

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.js index.html src
git commit -m "chore: initialize modular vite application"
```

---

### Task 2: CSS aus der HTML-Datei extrahieren

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/hud.css`
- Create: `src/styles/screens.css`
- Create: `src/styles/hangar.css`
- Modify: `src/main.js`

- [ ] **Step 1: Variablen und globale Regeln nach `tokens.css` und `base.css` verschieben**
- [ ] **Step 2: HUD-Regeln nach `hud.css` verschieben**
- [ ] **Step 3: Menü-, Pause-, Level-up- und Game-over-Regeln nach `screens.css` verschieben**
- [ ] **Step 4: Hangar- und Meta-Karten-Regeln nach `hangar.css` verschieben**
- [ ] **Step 5: Imports ergänzen**

```js
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/hud.css";
import "./styles/screens.css";
import "./styles/hangar.css";
```

- [ ] **Step 6: Manuelle Kontrolle**

Run `npm run dev`, öffnen, Startmenü und Level-up-Dialog mit der Referenzdatei vergleichen. Erwartet: keine sichtbare Layoutänderung.

- [ ] **Step 7: Commit**

```bash
git add src/styles src/main.js
git commit -m "refactor: split game styles by responsibility"
```

---

### Task 3: Kernhelfer und deterministischen RNG extrahieren

**Files:**
- Create: `src/core/math.js`
- Create: `src/core/rng.js`
- Create: `src/core/ids.js`

- [ ] **Step 1: Mathematische Helfer definieren**

```js
export const TAU = Math.PI * 2;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const distanceSquared = (ax, ay, bx, by) => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};
export const formatTime = seconds =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds) % 60).padStart(2, "0")}`;
```

- [ ] **Step 2: Seed-Service definieren**

```js
export function mulberry32(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRunRng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    integer: (min, maxInclusive) => Math.floor(min + next() * (maxInclusive - min + 1)),
    pick: values => values[Math.floor(next() * values.length)]
  };
}
```

- [ ] **Step 3: Instanz-IDs trennen**

```js
let counter = 0;

export function createRuntimeId(prefix = "runtime") {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
```

- [ ] **Step 4: Spielrelevante `Math.random()`-Aufrufe durch `run.rng` ersetzen**

Rein visuelle Partikel dürfen weiterhin `Math.random()` verwenden. Drops, Affixe, Gegner, Events, Händler und Fehler müssen den Run-RNG verwenden.

- [ ] **Step 5: Commit**

```bash
git add src/core
git commit -m "refactor: centralize math ids and deterministic rng"
```

---

### Task 4: Event Bus und Registries einführen

**Files:**
- Create: `src/core/event-bus.js`
- Create: `src/core/registry.js`
- Create: `src/core/schema.js`

- [ ] **Step 1: Event Bus implementieren**

```js
export function createEventBus() {
  const listeners = new Map();

  return {
    on(eventName, listener) {
      const bucket = listeners.get(eventName) ?? new Set();
      bucket.add(listener);
      listeners.set(eventName, bucket);
      return () => bucket.delete(listener);
    },
    emit(eventName, payload) {
      for (const listener of listeners.get(eventName) ?? []) {
        try {
          listener(payload);
        } catch (error) {
          console.error(`[event:${eventName}]`, error);
        }
      }
    },
    clear() {
      listeners.clear();
    }
  };
}
```

- [ ] **Step 2: Registry implementieren**

```js
export function createRegistry(kind) {
  const entries = new Map();

  return {
    register(definition) {
      if (!definition?.id) throw new Error(`${kind} definition requires id`);
      if (entries.has(definition.id)) throw new Error(`Duplicate ${kind} id: ${definition.id}`);
      entries.set(definition.id, Object.freeze(definition));
    },
    get(id) {
      return entries.get(id) ?? null;
    },
    require(id) {
      const value = entries.get(id);
      if (!value) throw new Error(`Unknown ${kind} id: ${id}`);
      return value;
    },
    values() {
      return [...entries.values()];
    }
  };
}
```

- [ ] **Step 3: Gemeinsame Definition-Prüfung anlegen**

`assertDefinition(definition, requiredKeys, kind)` prüft ID, Name und Pflichtfelder und liefert verständliche Konsolenmeldungen.

- [ ] **Step 4: Browser-Konsole prüfen**

Beim Start dürfen keine doppelten IDs oder fehlenden Pflichtfelder gemeldet werden.

- [ ] **Step 5: Commit**

```bash
git add src/core
git commit -m "feat: add event bus and content registries"
```

---

### Task 5: Persistenz versionieren und alten Save übernehmen

**Files:**
- Create: `src/persistence/save-schema.js`
- Create: `src/persistence/migrations.js`
- Create: `src/persistence/save-store.js`

- [ ] **Step 1: Version-2-Defaults definieren**

```js
export const CURRENT_SAVE_VERSION = 2;

export function createDefaultSave() {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    profile: {
      createdAt: new Date().toISOString(),
      totalRuns: 0,
      totalKills: 0
    },
    currencies: {
      voidShards: 0
    },
    legacy: {
      best: 0,
      dailyBest: {},
      meta: {},
      achievements: []
    },
    settings: {
      reducedMotion: false,
      screenShake: true,
      damageFlashes: true
    }
  };
}
```

- [ ] **Step 2: Migration des bisherigen Objekts implementieren**

Die Felder `best`, `dailyBest`, `shards`, `meta`, `ach`, `totalKills` und `totalRuns` werden ohne Werteverlust übernommen.

- [ ] **Step 3: Atomare Save-API bereitstellen**

```js
export function createSaveStore(storage = window.storage) {
  const key = "voidreaper-eternal-v2";
  return {
    async load() { /* Defaults, alte Keys und Migration anwenden */ },
    async save(data) { /* serialisieren und erst nach Erfolg ersetzen */ },
    async update(mutator) { /* laden, kopieren, mutieren, speichern */ }
  };
}
```

- [ ] **Step 4: Fehlerfall behandeln**

Kann ein Save nicht gelesen werden, wird er unter `voidreaper-eternal-v2-corrupt-<timestamp>` gesichert und ein Default-Save gestartet. Der Nutzer erhält einen Toast, aber die App bleibt nutzbar.

- [ ] **Step 5: Manuelle Kontrolle**

Einen bestehenden Speicherstand laden. Erwartet: Shards, Bestscore, Daily-Bestwerte und Meta-Stufen stimmen mit der Referenz überein.

- [ ] **Step 6: Commit**

```bash
git add src/persistence
git commit -m "feat: add versioned persistence and legacy migration"
```

---

### Task 6: Run- und Spielerzustand aus `Game` herauslösen

**Files:**
- Create: `src/runtime/create-run-state.js`
- Create: `src/runtime/create-player-state.js`
- Create: `src/runtime/selectors.js`
- Create: `src/app/state-machine.js`

- [ ] **Step 1: Run-Zustand als Factory definieren**

Der Zustand enthält Seed, RNG, Modus, Zeit, Score, Kills, Wave, Gegner, Pools, Kamera, Eventzustand, Buildzustand und Ressourcen.

- [ ] **Step 2: Spielerzustand als Factory definieren**

```js
export function createPlayerState(base = {}) {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 14,
    hull: base.hull ?? 100,
    maxHull: base.maxHull ?? 100,
    shield: 0,
    tags: new Map(),
    stats: new Map(),
    resources: {
      energy: 0,
      heat: 0,
      corruption: 0
    },
    activeModules: [null, null],
    dodge: {
      cooldown: 1.2,
      remaining: 0,
      duration: 0.18,
      invulnerability: 0.22
    }
  };
}
```

- [ ] **Step 3: Zustandsmaschine definieren**

Erlaubte Zustände: `menu`, `hangar`, `run`, `levelup`, `pause`, `sector`, `gameover`.

- [ ] **Step 4: Direkte DOM-Änderungen aus dem Runtime-Zustand entfernen**

Runtime setzt nur Daten und emittiert Events. UI reagiert auf Events.

- [ ] **Step 5: Commit**

```bash
git add src/runtime src/app/state-machine.js
git commit -m "refactor: isolate run player and screen state"
```

---

### Task 7: Input, Audio und Rendering modularisieren

**Files:**
- Create: `src/input/input-controller.js`
- Create: `src/input/touch-stick.js`
- Create: `src/input/action-bindings.js`
- Create: `src/audio/audio-system.js`
- Create: `src/render/canvas-renderer.js`
- Create: `src/render/world-renderer.js`
- Create: `src/render/entity-renderer.js`
- Create: `src/render/effects-renderer.js`

- [ ] **Step 1: Achsen und Aktionen standardisieren**

```js
export const ACTIONS = Object.freeze({
  PAUSE: "pause",
  DODGE: "dodge",
  ACTIVE_1: "active-1",
  ACTIVE_2: "active-2"
});
```

Desktop-Belegung: Pause `P/Escape`, Ausweichen `Space`, Aktivmodule `Q` und `E`.

- [ ] **Step 2: Touch-Stick als eigenständigen Controller extrahieren**
- [ ] **Step 3: Audio-Methoden aus `AudioSys` unverändert übernehmen**
- [ ] **Step 4: Renderer in Welt, Entities und Effekte aufteilen**
- [ ] **Step 5: Rendering darf Runtime-Daten nur lesen**
- [ ] **Step 6: Manuelle Kontrolle**

Referenz und modulare Version parallel öffnen. Bewegung, Auto-Fire, Bossbar, Partikel, Audio, Pause und Touch-Stick vergleichen.

- [ ] **Step 7: Commit**

```bash
git add src/input src/audio src/render
git commit -m "refactor: separate input audio and canvas rendering"
```

---

### Task 8: Stat Engine implementieren

**Files:**
- Create: `src/features/stats/stat-engine.js`
- Create: `src/content/stats/stat-definitions.js`

- [ ] **Step 1: Operationen und feste Reihenfolge definieren**

```js
export const MODIFIER_STAGE = Object.freeze({
  BASE: 10,
  SHIP: 20,
  REACTOR: 30,
  ITEM_FLAT: 40,
  ADDITIVE: 50,
  MULTIPLICATIVE: 60,
  CONDITIONAL: 70,
  OVERLOAD: 80,
  CORRUPTION: 90,
  CLAMP: 100,
  TEMPORARY: 110
});
```

- [ ] **Step 2: Stat Engine mit Quellenauflösung implementieren**

`calculate(statId, context)` liefert:

```js
{
  value: 1.42,
  baseValue: 1,
  contributions: [
    { sourceId: "ship-vesper", operation: "add", value: 0.1 },
    { sourceId: "module-war-core", operation: "multiply", value: 1.2 }
  ]
}
```

- [ ] **Step 3: Kernstats registrieren**

Mindestens: Hull, Geschwindigkeit, Schaden, Feuerrate, Projektilgeschwindigkeit, Crit-Chance, Crit-Multiplikator, Pierce, Magnetradius, Regeneration, Energie, Energierückgewinnung, Hitzeerzeugung, Kühlung, Korruptionsgewinn und Dodge-Cooldown.

- [ ] **Step 4: Alte direkte Felder schrittweise über Selektoren lesen**

`selectors.js` stellt kompatible Abfragen bereit, bis alle Systeme umgestellt sind.

- [ ] **Step 5: Commit**

```bash
git add src/features/stats src/content/stats src/runtime/selectors.js
git commit -m "feat: add ordered stat modifier engine"
```

---

### Task 9: Tag Engine und Synergieauswertung implementieren

**Files:**
- Create: `src/features/tags/tag-engine.js`
- Create: `src/content/tags/tag-definitions.js`
- Create: `src/content/tags/synergy-definitions.js`

- [ ] **Step 1: Tags mit Intensität aggregieren**

```js
export function collectTags(sources) {
  const totals = new Map();
  for (const source of sources) {
    for (const tag of source.tags ?? []) {
      totals.set(tag.id, (totals.get(tag.id) ?? 0) + (tag.value ?? 1));
    }
  }
  return totals;
}
```

- [ ] **Step 2: Die in der Spezifikation festgelegten Tags registrieren**
- [ ] **Step 3: Synergietypen `threshold`, `cross`, `trigger`, `conflict` und `forbidden` implementieren**
- [ ] **Step 4: Synergieergebnis liefert aktive, fast erfüllte und blockierte Regeln**
- [ ] **Step 5: Level-up-Karten erhalten Tag-Deltas**
- [ ] **Step 6: Commit**

```bash
git add src/features/tags src/content/tags
git commit -m "feat: add tag aggregation and synergy resolution"
```

---

### Task 10: Effect Registry und Trigger Engine implementieren

**Files:**
- Create: `src/features/effects/effect-registry.js`
- Create: `src/features/triggers/trigger-engine.js`
- Create: `src/content/effects/core-effects.js`

- [ ] **Step 1: Effekt-Handler registrieren**

Pflicht-IDs: `deal-damage`, `heal-player`, `grant-shield`, `spawn-projectile`, `spawn-zone`, `summon-unit`, `change-resource`, `teleport`, `apply-status`, `move-enemy`, `change-cooldown`, `disable-module`, `copy-affix`, `modify-loot`, `mark-evolution`, `trigger-fault`.

- [ ] **Step 2: Trigger-Abonnements aus Buildquellen sammeln**

Unterstützte Events: `shot-fired`, `enemy-hit`, `critical-hit`, `enemy-killed`, `elite-killed`, `boss-hit`, `player-damaged`, `dodge-used`, `heat-threshold`, `overheated`, `corruption-changed`, `active-module-used`, `pickup-collected`, `sector-entered`, `extraction-completed`, `tick`.

- [ ] **Step 3: Schleifenschutz implementieren**

Maximale Trigger-Tiefe: 12. Maximal 100 Effekte pro Simulationsschritt. Überschreitung wird protokolliert und der Rest der Kette verworfen.

- [ ] **Step 4: Interne Cooldowns pro Triggerinstanz verwalten**
- [ ] **Step 5: Commit**

```bash
git add src/features/effects src/features/triggers src/content/effects
git commit -m "feat: add registered effects and bounded trigger chains"
```

---

### Task 11: Energie und Überlastung implementieren

**Files:**
- Create: `src/features/energy/energy-system.js`
- Create: `src/ui/components/resource-meters.js`
- Modify: `index.html`
- Modify: `src/styles/hud.css`

- [ ] **Step 1: Energiewerte berechnen**

```js
export function calculateLoad({ capacity, reserved }) {
  const ratio = capacity <= 0 ? 9.99 : reserved / capacity;
  const tier =
    ratio <= 1 ? "stable" :
    ratio <= 1.15 ? "strained" :
    ratio <= 1.35 ? "overloaded" :
    ratio <= 1.6 ? "critical" : "collapse";
  return { ratio, tier };
}
```

- [ ] **Step 2: Überlastungsmodifikatoren definieren**

- `stable`: 1.00 Hitze
- `strained`: 1.10 Hitze und leichte Fehler
- `overloaded`: 1.25 Hitze und verstärkte Overload-Affixe
- `critical`: 1.50 Hitze und Korruptionsgewinn
- `collapse`: exponentieller Fehlerdruck und verbotene Synergien

- [ ] **Step 3: Burst-Energie aktiver Module ergänzen**
- [ ] **Step 4: HUD-Meter für Kapazität, reservierte Last und aktuelle Energie ergänzen**
- [ ] **Step 5: Commit**

```bash
git add src/features/energy src/ui/components index.html src/styles/hud.css
git commit -m "feat: add energy capacity and overload tiers"
```

---

### Task 12: Hitzesystem implementieren

**Files:**
- Create: `src/features/heat/heat-system.js`
- Create: `src/content/heat/heat-rules.js`
- Modify: `src/ui/components/resource-meters.js`

- [ ] **Step 1: Hitzezustand definieren**

```js
export function createHeatState() {
  return {
    value: 0,
    coolingDelay: 0,
    lastThreshold: "cold",
    overheatedAt: null
  };
}
```

- [ ] **Step 2: Erzeugung, Verzögerung und Kühlung pro Fixed Step berechnen**
- [ ] **Step 3: Schwellen 60, 85 und 100 als Events ausgeben**
- [ ] **Step 4: Überhitzen deaktiviert die stärkste Wärmequelle maximal drei Sekunden**
- [ ] **Step 5: Wiederholte Deaktivierungen desselben Moduls verkürzen**
- [ ] **Step 6: HUD-Warnung und 1,2-Sekunden-Vorwarnung ergänzen**
- [ ] **Step 7: Commit**

```bash
git add src/features/heat src/content/heat src/ui/components
git commit -m "feat: add heat thresholds cooling and overheat handling"
```

---

### Task 13: Korruptionssystem implementieren

**Files:**
- Create: `src/features/corruption/corruption-system.js`
- Create: `src/content/corruption/corruption-rules.js`
- Modify: `src/ui/components/resource-meters.js`

- [ ] **Step 1: Schwellen 25, 50, 75, 100 und Abyss-Werte über 100 implementieren**
- [ ] **Step 2: Quellen als benannte Buchungen erfassen**

Jede Änderung speichert `sourceId`, `amount` und Zeitpunkt, damit der Build-Inspektor die Herkunft zeigt.

- [ ] **Step 3: Positive und negative Folgen pro Schwelle registrieren**
- [ ] **Step 4: Reinigung blockiert verbotene Pfade nicht rückwirkend**
- [ ] **Step 5: HUD mit Segmenten und Signaturanzeige ergänzen**
- [ ] **Step 6: Commit**

```bash
git add src/features/corruption src/content/corruption src/ui/components
git commit -m "feat: add persistent run corruption thresholds"
```

---

### Task 14: Deterministischen Fault Scheduler implementieren

**Files:**
- Create: `src/features/faults/fault-scheduler.js`
- Create: `src/content/faults/fault-profiles.js`

- [ ] **Step 1: Fehlerdruck berechnen**

Eingaben: Laststufe, Hitze, Korruption, Stabilität, Widerstand und Cooldown.

- [ ] **Step 2: Fehlerfenster statt Frame-Zufall verwenden**

Der Scheduler plant den nächsten Fehlerzeitpunkt mit dem Run-RNG und berechnet erst bei Fälligkeit das betroffene Modul.

- [ ] **Step 3: Fehlerklassen registrieren**

Leicht: Zielwechsel, Streuung, Energiekosten, Drohnenpause.  
Mittel: Frühdetonation, Mine nahe Spieler, Schildumkehr, Strahlzug.  
Schwer: Modulabschaltung, Projektilreflexion, feindliche Drohne, Reaktorzone.

- [ ] **Step 4: Komponentenfamilien erhalten eigene `faultProfileId`**
- [ ] **Step 5: HUD zeigt nächste Fehlerstufe, aber nicht den exakten Zeitpunkt**
- [ ] **Step 6: Commit**

```bash
git add src/features/faults src/content/faults
git commit -m "feat: add deterministic component fault scheduler"
```

---

### Task 15: Evolution Engine und Legacy-Evolutionen migrieren

**Files:**
- Create: `src/features/evolution/evolution-system.js`
- Create: `src/content/evolutions/legacy-evolutions.js`
- Remove after migration: direkte `EVOLUTIONS`-Logik aus der alten Hauptdatei

- [ ] **Step 1: Evolutionsdefinition festlegen**

```js
{
  id: "prism-lance",
  weaponFamily: "railgun",
  kind: "regular",
  requirements: [
    { type: "tag", id: "Projectile", minimum: 3 },
    { type: "tag", id: "Pierce", minimum: 2 }
  ],
  effects: ["evolution-prism-lance"],
  visible: true
}
```

- [ ] **Step 2: Fünf bestehende Evolutionen auf die Engine übertragen**

`prism`, `singularity`, `bloodhalo`, `reaperprot`, `tempest`.

- [ ] **Step 3: Alternative und verbotene Evolutionsarten unterstützen**
- [ ] **Step 4: Pro Primärwaffe nur eine Endform zulassen**
- [ ] **Step 5: Ersetzen einer Endform erfordert bei permanentem Nachteil eine Bestätigung**
- [ ] **Step 6: Commit**

```bash
git add src/features/evolution src/content/evolutions
git commit -m "feat: migrate evolutions to data driven engine"
```

---

### Task 16: Ausweichen und zwei aktive Modulaktionen in die Runtime einführen

**Files:**
- Create: `src/features/combat/dodge-system.js`
- Create: `src/features/combat/active-module-system.js`
- Modify: `src/input/action-bindings.js`
- Modify: `index.html`
- Modify: `src/styles/hud.css`

- [ ] **Step 1: Dodge mit Geschwindigkeitsschub und kurzem Iframe-Fenster implementieren**
- [ ] **Step 2: Kollision während der Iframes ignorieren, aber Arena-Grenzen beibehalten**
- [ ] **Step 3: Zwei aktive Slots an Q/E und Touch-Buttons binden**
- [ ] **Step 4: Active Module System delegiert Kosten an Energie, Hitze, Charge, Cooldown oder Korruption**
- [ ] **Step 5: Leere Slots bleiben sichtbar, aber deaktiviert**
- [ ] **Step 6: Commit**

```bash
git add src/features/combat src/input/action-bindings.js index.html src/styles/hud.css
git commit -m "feat: add dodge and active module actions"
```

---

### Task 17: Build-Inspektor und transparente Upgrade-Karten ergänzen

**Files:**
- Create: `src/ui/screens/build-inspector.js`
- Create: `src/ui/components/stat-breakdown.js`
- Create: `src/ui/components/synergy-list.js`
- Modify: `src/styles/screens.css`

- [ ] **Step 1: Pausemenü um Tabs `Übersicht`, `Stats`, `Tags`, `Evolutionen`, `Risiken` erweitern**
- [ ] **Step 2: Stats zeigen Basiswert und alle Quellen**
- [ ] **Step 3: Tags zeigen Intensität und Quelle**
- [ ] **Step 4: Evolutionen zeigen bekannte Anforderungen, Fortschritt und blockierende Konflikte**
- [ ] **Step 5: Risiken zeigen Energie, Wärmequellen, Korruptionsquellen und Fehlerdruck**
- [ ] **Step 6: Upgrade-Karten zeigen vorher/nachher-Deltas**
- [ ] **Step 7: Commit**

```bash
git add src/ui
git commit -m "feat: add build inspector and upgrade impact details"
```

---

### Task 18: Phase-1-Integration und Referenzablösung

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/main.js`
- Preserve: `voidreaper-redux.html`

- [ ] **Step 1: Alle Services in `bootstrap()` verdrahten**
- [ ] **Step 2: Game Controller erhält nur öffentliche Services**
- [ ] **Step 3: Alte globale Objekte `Game`, `UI`, `Input`, `AudioSys` und `Persist` vollständig entfernen**
- [ ] **Step 4: Produktions-Build ausführen**

```bash
npm run build
```

Expected: `dist/` wird ohne Fehler erzeugt.

- [ ] **Step 5: Manuelle Phase-1-Kontrolle**

1. Standard-Run starten.
2. Wave 5 erreichen und Boss besiegen.
3. Mindestens eine Legacy-Evolution aktivieren.
4. Last künstlich über 120 Prozent bringen.
5. Hitze auf 100 steigern und Abschaltung beobachten.
6. Korruption auf 50 steigern und verbotene Signatur prüfen.
7. Pause öffnen und alle Wertquellen prüfen.
8. Touch- und Desktop-Aktionen prüfen.
9. Save neu laden und Bestwerte prüfen.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: complete modular build engine foundation"
```
