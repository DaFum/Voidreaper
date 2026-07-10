# VOIDREAPER Full Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Vorgabe des Auftraggebers:** In dieser Planung werden keine Testdateien, kein Testverzeichnis, kein Testframework und keine automatisierten Testläufe angelegt. Die Kontrollschritte bestehen ausschließlich aus Build-Prüfungen, Browser-Konsole, reproduzierbaren Seeds und manuellen Funktionskontrollen. Es dürfen insbesondere weder Vitest/Jest noch Playwright/Cypress oder vergleichbare Systeme ergänzt werden.


**Goal:** Die vier freigegebenen Spezifikationen Build Engine, Loadouts und Ausrüstung, Run-Struktur sowie Metagame vollständig und in einzeln auslieferbaren Phasen umsetzen.

**Architecture:** Die bestehende einzelne HTML-Datei wird zunächst verhaltensneutral in eine Vite-basierte Vanilla-JavaScript-Anwendung mit ES-Modulen überführt. Danach werden datengetriebene Feature-Bereiche ergänzt, die über klar definierte Runtime-Services, Content-Registries und Zustandsübergänge kommunizieren. Persistenter Meta-Zustand, Run-Zustand und visuelle Effekte bleiben strikt getrennt.

**Tech Stack:** HTML5 Canvas, Vanilla JavaScript mit ES-Modulen, CSS, Web Audio API, Vite, Browser Storage API beziehungsweise `localStorage`-Fallback. Keine UI-Bibliothek, kein Backend und gemäß Auftrag kein Testsystem.

---

## 1. Planpaket

Dieser Masterplan verweist auf vier detaillierte Umsetzungspläne:

1. `docs/superpowers/plans/2026-07-10-voidreaper-phase-1-build-engine.md`
2. `docs/superpowers/plans/2026-07-10-voidreaper-phase-2-loadouts-equipment.md`
3. `docs/superpowers/plans/2026-07-10-voidreaper-phase-3-run-structure.md`
4. `docs/superpowers/plans/2026-07-10-voidreaper-phase-4-metagame.md`

Die Dateien sind in dieser Reihenfolge auszuführen. Phase 2 setzt die öffentlichen APIs von Phase 1 voraus. Phase 3 setzt Phase 1 und 2 voraus. Phase 4 setzt alle vorherigen Phasen voraus.

## 2. Verbindliche Lieferregeln

- Jede Aufgabe endet mit einem kleinen, einzeln verständlichen Commit.
- Keine Aufgabe darf gleichzeitig Content, Rendering und Persistenz tiefgreifend ändern.
- Neue Inhalte werden ausschließlich über registrierte Definitionen ergänzt.
- Spielentscheidende Zufallswerte müssen aus dem Run-RNG stammen.
- `Math.random()` bleibt nur für rein visuelle, nicht reproduzierbare Effekte zulässig.
- Alle Speicheränderungen benötigen eine `saveVersion` und eine Migration.
- Build-Prüfungen verwenden ausschließlich `npm run build`.
- Funktionskontrollen erfolgen lokal mit `npm run dev` und den im Plan beschriebenen Browser-Schritten.
- Es wird kein Ordner `tests/`, `__tests__/`, `e2e/` oder ähnliches erstellt.
- Die bestehende Datei `voidreaper-redux.html` bleibt bis zur erfolgreichen Modularisierung als unveränderte Referenz erhalten.

## 3. Zielstruktur nach allen Phasen

```text
voidreaper/
  index.html
  package.json
  vite.config.js
  public/
    icons/
    manifest.webmanifest
  src/
    main.js
    styles/
      tokens.css
      base.css
      hud.css
      screens.css
      hangar.css
      map.css
      codex.css
    core/
      event-bus.js
      ids.js
      math.js
      rng.js
      registry.js
      schema.js
    app/
      bootstrap.js
      game-controller.js
      screen-controller.js
      state-machine.js
    runtime/
      create-run-state.js
      create-player-state.js
      create-meta-state.js
      selectors.js
    persistence/
      save-store.js
      migrations.js
      save-schema.js
    input/
      input-controller.js
      touch-stick.js
      action-bindings.js
    audio/
      audio-system.js
      sound-events.js
    render/
      canvas-renderer.js
      camera.js
      world-renderer.js
      entity-renderer.js
      effects-renderer.js
      hud-renderer.js
    content/
      enemies/
      bosses/
      events/
      ships/
      weapons/
      reactors/
      modules/
      affixes/
      sockets/
      evolutions/
      sectors/
      challenges/
      research/
    features/
      combat/
      stats/
      tags/
      effects/
      triggers/
      energy/
      heat/
      corruption/
      faults/
      evolution/
      equipment/
      inventory/
      hangar/
      sectors/
      encounters/
      merchant/
      workshop/
      extraction/
      abyss/
      codex/
      research/
      challenges/
      salvage/
      simulator/
    ui/
      dom.js
      modal.js
      toast.js
      components/
      screens/
```

## 4. Phasenabnahme

### Phase 1 – Build Engine

Abgenommen, wenn das bestehende Spiel modular läuft und Energie, Hitze, Korruption, Tags, Trigger, Systemfehler sowie Evolutionen über die neue Engine gesteuert werden.

### Phase 2 – Loadouts und Ausrüstung

Abgenommen, wenn Schiffe, zehn Waffenfamilien, Reaktoren, 120 Module, Affixe, Sockel, aktive Module, Hangar, Forschung und Prototyp-Grundlagen verfügbar sind.

### Phase 3 – Run-Struktur

Abgenommen, wenn eine 30–40-minütige Kampagne mit Sektorkarte, Begegnungszielen, Händler, Werkstatt, Endboss, Extraktion und optionalem Abyss vollständig spielbar ist.

### Phase 4 – Metagame

Abgenommen, wenn Forschung, Codex, Challenges, Prototyplager, Verlust- und Bergungssystem, Kampagnenpfade, Onboarding, Build-Simulator und Save-Migration vollständig integriert sind.

## 5. Manuelle Gesamtkontrolle nach Phase 4

- [ ] Neuen Speicherstand starten und die ersten fünf Onboarding-Runs durchlaufen.
- [ ] Einen Standard-Run mit stabiler Last unter 100 Prozent abschließen.
- [ ] Einen Run mit Last über 140 Prozent und einer verbotenen Transformation abschließen.
- [ ] Einen Prototyp extrahieren, im Hangar ausrüsten und erneut verwenden.
- [ ] Einen legendären Prototyp verlieren und die erzeugte Bergungsmission abschließen.
- [ ] Den Kampagnen-Endboss besiegen und in den Abyss wechseln.
- [ ] Einen Daily Seed zweimal mit denselben Entscheidungen starten und Karten- sowie Händlerfolge vergleichen.
- [ ] Einen alten `voidreaper-eternal`-Speicherstand laden und Bestwerte, Shards, Achievements und Statistiken prüfen.
- [ ] Desktop-Steuerung mit WASD, Leertaste, Q und E prüfen.
- [ ] Touch-Steuerung mit Stick, Ausweichen und zwei Aktivmodulen prüfen.
- [ ] `npm run build` ausführen; erwartetes Ergebnis: Vite beendet den Produktions-Build ohne Fehler.
