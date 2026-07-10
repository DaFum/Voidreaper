# VOIDREAPER Phase 4 – Metagame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Vorgabe des Auftraggebers:** In dieser Planung werden keine Testdateien, kein Testverzeichnis, kein Testframework und keine automatisierten Testläufe angelegt. Die Kontrollschritte bestehen ausschließlich aus Build-Prüfungen, Browser-Konsole, reproduzierbaren Seeds und manuellen Funktionskontrollen. Es dürfen insbesondere weder Vitest/Jest noch Playwright/Cypress oder vergleichbare Systeme ergänzt werden.


**Goal:** Langfristige Forschung, Codex, Challenges, Prototyplager, Verlustregeln, Wrack-Signale, Bergungsmissionen, Kampagnenpfade, Onboarding, Build-Simulator und vollständige Save-Migration implementieren.

**Architecture:** Der Meta-State ist vollständig vom Run-State getrennt. Dauerhafte Belohnungen werden über atomare Transaktionen gebucht. Das Metagame öffnet primär Optionen und Wissen statt unbegrenzt vertikale Stärke. Bergungsmissionen referenzieren unveränderliche Snapshots verlorener Prototypen.

**Tech Stack:** Modulare Vanilla-JavaScript-Anwendung aus Phase 1–3, Vite, Browser Storage und Canvas/DOM. Keine automatisierten Tests.

---

## Dateizuordnung

- `src/runtime/create-meta-state.js`
- `src/features/research/research-service.js`
- `src/features/codex/codex-service.js`
- `src/features/challenges/challenge-service.js`
- `src/features/inventory/prototype-vault.js`
- `src/features/salvage/wreck-signal-service.js`
- `src/features/salvage/salvage-mission-service.js`
- `src/features/campaigns/campaign-path-service.js`
- `src/features/onboarding/onboarding-service.js`
- `src/features/simulator/build-simulator.js`
- `src/features/telemetry/profile-statistics.js`
- `src/content/research/research-tree.js`
- `src/content/challenges/challenges.js`
- `src/content/campaigns/campaign-paths.js`
- `src/ui/screens/codex-screen.js`
- `src/ui/screens/challenges-screen.js`
- `src/ui/screens/prototype-vault-screen.js`
- `src/ui/screens/salvage-mission-screen.js`
- `src/ui/screens/simulator-screen.js`
- `src/styles/codex.css`

---

### Task 1: Save-Schema auf vollständigen Meta-State erweitern

**Files:**
- Modify: `src/persistence/save-schema.js`
- Modify: `src/persistence/migrations.js`
- Create: `src/runtime/create-meta-state.js`

- [ ] **Step 1: Save-Version auf 4 erhöhen**
- [ ] **Step 2: Felder für Profil, Währungen, Forschung, Unlocks, Blueprints, Inventar, Wracks, Codex, Challenges, Statistiken und Rekorde ergänzen**
- [ ] **Step 3: Jede Sammlung als Objekt nach ID statt als ungebundene Array-Position speichern**
- [ ] **Step 4: Vor Migration eine Sicherung des alten JSON anlegen**
- [ ] **Step 5: Commit**

```bash
git add src/persistence src/runtime/create-meta-state.js
git commit -m "feat: expand save schema for complete metagame"
```

---

### Task 2: Fünf permanente Ressourcen implementieren

**Files:**
- Create: `src/features/economy/meta-currency-service.js`
- Modify: `src/runtime/create-meta-state.js`
- Modify: `src/ui/screens/hangar-screen.js`

- [ ] **Step 1: Void Shards, Boss Cores, Anomaly Data, Challenge Seals und Salvage Fragments definieren**
- [ ] **Step 2: Atomare `credit`, `debit` und `transact`-Operationen implementieren**
- [ ] **Step 3: Negative Werte verhindern**
- [ ] **Step 4: Herkunft jeder Belohnung in der lokalen Historie speichern**
- [ ] **Step 5: Commit**

```bash
git add src/features/economy src/runtime src/ui/screens/hangar-screen.js
git commit -m "feat: add five resource metagame economy"
```

---

### Task 3: Forschungsnetz implementieren

**Files:**
- Create: `src/content/research/research-tree.js`
- Create: `src/features/research/research-service.js`
- Modify: `src/ui/screens/research-screen.js`

- [ ] **Step 1: Zweige Arsenal, Engineering, Navigation, Void Studies und Recovery definieren**
- [ ] **Step 2: Knoten besitzen Kosten, Voraussetzungen, Unlocks und sichtbare Beschreibung**
- [ ] **Step 3: Kauf prüft und bucht Ressourcen in einer atomaren Save-Transaktion**
- [ ] **Step 4: Zahlenboni auf kleine Startvorteile begrenzen**
- [ ] **Step 5: Fokus auf Schiffe, Waffen, Werkstattoptionen, Kartenwissen und Bergung legen**
- [ ] **Step 6: Commit**

```bash
git add src/content/research src/features/research src/ui/screens/research-screen.js
git commit -m "feat: add five branch horizontal research network"
```

---

### Task 4: Codex-Datenmodell und Entdeckungsstufen implementieren

**Files:**
- Create: `src/features/codex/codex-service.js`
- Create: `src/content/codex/codex-categories.js`
- Create: `src/ui/screens/codex-screen.js`
- Create: `src/styles/codex.css`

- [ ] **Step 1: Kategorien aus der Spezifikation definieren**
- [ ] **Step 2: Stufen Unknown, Observed, Analyzed und Mastered implementieren**
- [ ] **Step 3: Verbotene Transformationen zeigen vor Entdeckung nur Signaturen**
- [ ] **Step 4: Codex-Einträge direkt aus Content-Registries erzeugen**
- [ ] **Step 5: Filter nach Kategorie, Tags, Status und Quelle implementieren**
- [ ] **Step 6: Commit**

```bash
git add src/features/codex src/content/codex src/ui/screens/codex-screen.js src/styles/codex.css
git commit -m "feat: add progressive discovery codex"
```

---

### Task 5: Build-Historie und Build-Code implementieren

**Files:**
- Create: `src/features/codex/build-history-service.js`
- Create: `src/features/codex/build-code.js`
- Modify: `src/ui/screens/codex-screen.js`

- [ ] **Step 1: Erfolgreiche und favorisierte Builds speichern**
- [ ] **Step 2: Schiff, Waffe, Reaktor, Module, Evolutionen, Tags, Seed und Ergebnis erfassen**
- [ ] **Step 3: Lokalen Build-Code als kompaktes Base64URL-JSON erzeugen**
- [ ] **Step 4: Import validiert IDs und markiert fehlende Inhalte**
- [ ] **Step 5: Commit**

```bash
git add src/features/codex src/ui/screens/codex-screen.js
git commit -m "feat: add local build history and share codes"
```

---

### Task 6: Challenge-Service implementieren

**Files:**
- Create: `src/features/challenges/challenge-service.js`
- Create: `src/content/challenges/challenges.js`
- Create: `src/ui/screens/challenges-screen.js`

- [ ] **Step 1: Kategorien Waffen-, Schiff-, Boss-, Risiko-, Extraktions-, Build-, Daily- und Langzeitchallenges definieren**
- [ ] **Step 2: Run-Abschluss erzeugt ein unveränderliches Summary-Objekt**
- [ ] **Step 3: Challenges prüfen ausschließlich das Summary und Meta-Flags**
- [ ] **Step 4: Belohnungen atomar buchen und doppelte Vergabe verhindern**
- [ ] **Step 5: Die neun Beispielchallenges der Spezifikation implementieren**
- [ ] **Step 6: Pro Waffe und Schiff mindestens fünf Meisterschaftsstufen definieren**
- [ ] **Step 7: Commit**

```bash
git add src/features/challenges src/content/challenges src/ui/screens/challenges-screen.js
git commit -m "feat: add challenge and mastery progression"
```

---

### Task 7: Prototyp-Vault implementieren

**Files:**
- Create: `src/features/inventory/prototype-vault.js`
- Create: `src/ui/screens/prototype-vault-screen.js`
- Modify: `src/features/inventory/inventory-service.js`

- [ ] **Step 1: Startkapazität 20 und Forschungserweiterung bis 100 implementieren**
- [ ] **Step 2: Filter nach Familie, Tags, Seltenheit, Stabilität und Herkunft implementieren**
- [ ] **Step 3: Favoriten vor Zerlegen und Überschreiben schützen**
- [ ] **Step 4: Überlauf in unbegrenztes Bergungslager verschieben**
- [ ] **Step 5: Reparieren, Zerlegen, Affix extrahieren und ausrüsten implementieren**
- [ ] **Step 6: Commit**

```bash
git add src/features/inventory src/ui/screens/prototype-vault-screen.js
git commit -m "feat: add persistent prototype vault"
```

---

### Task 8: Seltenheitsabhängige Verlustregeln implementieren

**Files:**
- Create: `src/features/inventory/prototype-loss-service.js`
- Modify: `src/features/inventory/prototype-service.js`

- [ ] **Step 1: Gewöhnliche und seltene nicht extrahierte Prototypen entfernen**
- [ ] **Step 2: Epische Gegenstände in Fragmente oder beschädigte Wracks umwandeln**
- [ ] **Step 3: Legendäre und einzigartige Gegenstände auf `lost` setzen und Wrack-Signal erzeugen**
- [ ] **Step 4: Initiate-Schwierigkeit schützt gewöhnliche Prototypen**
- [ ] **Step 5: Verlusttransaktion erst nach vollständigem Run-Abschluss schreiben**
- [ ] **Step 6: Commit**

```bash
git add src/features/inventory
git commit -m "feat: add rarity based prototype loss rules"
```

---

### Task 9: Wrack-Signale implementieren

**Files:**
- Create: `src/features/salvage/wreck-signal-service.js`
- Create: `src/features/salvage/wreck-signal-schema.js`

- [ ] **Step 1: Snapshotfelder aus der Spezifikation speichern**
- [ ] **Step 2: Originalitem unveränderlich im Signal einbetten**
- [ ] **Step 3: Region, Korruption, Todesursache und Missionsmodifikatoren ableiten**
- [ ] **Step 4: Signalsichtbarkeit und Ablauf nach Anzahl gespielter Runs verwalten**
- [ ] **Step 5: Commit**

```bash
git add src/features/salvage
git commit -m "feat: add persistent wreck signals"
```

---

### Task 10: Bergungsmissionen implementieren

**Files:**
- Create: `src/features/salvage/salvage-mission-service.js`
- Create: `src/content/salvage/salvage-modifiers.js`
- Create: `src/ui/screens/salvage-mission-screen.js`

- [ ] **Step 1: Aus Wrack-Signal einen speziellen Kartenpfad erzeugen**
- [ ] **Step 2: Gegner übernehmen ausgewählte Affixe des verlorenen Items**
- [ ] **Step 3: Endgegner trägt den Prototyp und muss vor Extraktion besiegt werden**
- [ ] **Step 4: Ergebnisse vollständige, beschädigte, korrumpierte oder Blueprint-Wiederherstellung implementieren**
- [ ] **Step 5: Missionsergebnis atomar auf Signal und Vault anwenden**
- [ ] **Step 6: Commit**

```bash
git add src/features/salvage src/content/salvage src/ui/screens/salvage-mission-screen.js
git commit -m "feat: add prototype salvage missions"
```

---

### Task 11: Vier Kampagnenpfade implementieren

**Files:**
- Create: `src/content/campaigns/campaign-paths.js`
- Create: `src/features/campaigns/campaign-path-service.js`
- Create: `src/ui/screens/campaign-select-screen.js`

- [ ] **Step 1: Architect Path als Standardpfad definieren**
- [ ] **Step 2: Furnace Path mit Hitze- und Reaktorbelohnungen definieren**
- [ ] **Step 3: Grave Path mit Drohnen, Wracks und Prototypen definieren**
- [ ] **Step 4: Null Path mit Korruption, Anomalien und tiefem Abyss definieren**
- [ ] **Step 5: Pfade verwenden Regionen in anderer Reihenfolge und mit eigenen Bossen**
- [ ] **Step 6: Fortschritt und Freischaltung im Meta-State speichern**
- [ ] **Step 7: Commit**

```bash
git add src/content/campaigns src/features/campaigns src/ui/screens/campaign-select-screen.js
git commit -m "feat: add four campaign paths"
```

---

### Task 12: Gestaffeltes Onboarding implementieren

**Files:**
- Create: `src/features/onboarding/onboarding-service.js`
- Create: `src/content/onboarding/onboarding-steps.js`
- Create: `src/ui/components/tutorial-callout.js`

- [ ] **Step 1: Run 1 nur Standard-Schiff, Railgun und reguläre Evolution**
- [ ] **Step 2: Run 2 Energie, Überlastung und zweites Schiff**
- [ ] **Step 3: Run 3 Werkstatt, Hitze und aktives Modul**
- [ ] **Step 4: Run 4 Korruption und geheime Signatur**
- [ ] **Step 5: Run 5 Extraktion und Prototyp**
- [ ] **Step 6: Bereits erfahrene Spieler können Onboarding im Menü überspringen**
- [ ] **Step 7: Commit**

```bash
git add src/features/onboarding src/content/onboarding src/ui/components/tutorial-callout.js
git commit -m "feat: add five run progressive onboarding"
```

---

### Task 13: In-Game-Build-Simulator implementieren

**Files:**
- Create: `src/features/simulator/build-simulator.js`
- Create: `src/features/simulator/simulator-enemies.js`
- Create: `src/ui/screens/simulator-screen.js`

- [ ] **Step 1: Simulator als separaten, belohnungsfreien Run-Modus anlegen**
- [ ] **Step 2: Gegner, Dichte, Boss-Dummy und Dauer auswählbar machen**
- [ ] **Step 3: DPS, Hitzeverlauf, Energie, Trigger und Fehlerprotokoll anzeigen**
- [ ] **Step 4: Prototypstabilität und Währungen nicht verändern**
- [ ] **Step 5: Seed für reproduzierbare Build-Vergleiche auswählbar machen**
- [ ] **Step 6: Commit**

```bash
git add src/features/simulator src/ui/screens/simulator-screen.js
git commit -m "feat: add reward free in game build simulator"
```

---

### Task 14: Profilstatistiken und lokale Rekorde implementieren

**Files:**
- Create: `src/features/telemetry/profile-statistics.js`
- Create: `src/features/leaderboards/local-records.js`
- Create: `src/ui/screens/statistics-screen.js`

- [ ] **Step 1: Alle in der Spezifikation genannten Statistiken aggregieren**
- [ ] **Step 2: Highscore, Kampagnenzeit, Abyss-Tiefe, Daily Score und Boss-Rush lokal speichern**
- [ ] **Step 3: Content- und Seed-Version mit Rekorden speichern**
- [ ] **Step 4: Keine externe Übertragung implementieren**
- [ ] **Step 5: Commit**

```bash
git add src/features/telemetry src/features/leaderboards src/ui/screens/statistics-screen.js
git commit -m "feat: add local profile statistics and records"
```

---

### Task 15: Anti-Grind-Ökonomie und Duplikatverwertung implementieren

**Files:**
- Create: `src/features/economy/reward-balancer.js`
- Modify: `src/features/research/research-service.js`
- Modify: `src/features/inventory/prototype-vault.js`

- [ ] **Step 1: Erste neue Waffe innerhalb der ersten drei regulären Runs erreichbar machen**
- [ ] **Step 2: Duplikate in passende Fragmente umwandeln**
- [ ] **Step 3: Erfolglosen Runs Fortschritt geben, aber Extraktion klar besser belohnen**
- [ ] **Step 4: Wichtige Kernfunktionen nicht an extrem seltene Drops binden**
- [ ] **Step 5: Commit**

```bash
git add src/features/economy src/features/research src/features/inventory
git commit -m "feat: balance metagame rewards against grind"
```

---

### Task 16: Bestehende Meta-Upgrades migrieren

**Files:**
- Modify: `src/persistence/migrations.js`
- Create: `src/content/migrations/legacy-meta-conversion.js`

- [ ] **Step 1: Bestehende IDs `mhp`, `mdmg`, `mspd`, `mxp`, `mshard`, `mreroll`, `mbanish`, `mrevive`, `mmag`, `mluck` erfassen**
- [ ] **Step 2: Investierte Shards aus tatsächlicher Kostenfunktion zurückrechnen**
- [ ] **Step 3: 100 Prozent der investierten Shards als Forschungsgutschrift zurückgeben**
- [ ] **Step 4: Veteranenprofil und kosmetisches Abzeichen für bestehende Saves freischalten**
- [ ] **Step 5: Bestscore, Daily, Achievements, Kills und Runs unverändert übernehmen**
- [ ] **Step 6: Commit**

```bash
git add src/persistence/migrations.js src/content/migrations
git commit -m "feat: convert legacy meta upgrades without value loss"
```

---

### Task 17: Accessibility- und Einstellungsabschluss

**Files:**
- Create: `src/ui/screens/settings-screen.js`
- Modify: `src/persistence/save-schema.js`
- Modify: `src/render/effects-renderer.js`
- Modify: `src/input/input-controller.js`

- [ ] **Step 1: Reduced Motion, Screen Shake, Damage Flashes und CRT separat schaltbar machen**
- [ ] **Step 2: UI-Skalierung und große Touch-Buttons anbieten**
- [ ] **Step 3: Farbcodierte Zustände zusätzlich mit Symbolen und Mustern ausgeben**
- [ ] **Step 4: Tastaturbelegung für Dodge und Aktivmodule änderbar machen**
- [ ] **Step 5: Einstellungen sofort speichern**
- [ ] **Step 6: Commit**

```bash
git add src/ui/screens/settings-screen.js src/persistence src/render src/input
git commit -m "feat: complete accessibility and control settings"
```

---

### Task 18: Vollständige Content- und Registry-Kontrolle ohne Testsystem

**Files:**
- Create: `scripts/validate-content.mjs`
- Modify: `package.json`

- [ ] **Step 1: Reinen Content-Validator als Build-Werkzeug anlegen**

Der Validator lädt Definitionen und prüft nur statische Integrität: eindeutige IDs, Pflichtfelder, Referenzen und erwartete Katalogmengen. Er ist kein Testframework und erzeugt keine Testdateien.

- [ ] **Step 2: Script ergänzen**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "node scripts/validate-content.mjs && vite build",
    "preview": "vite preview",
    "validate-content": "node scripts/validate-content.mjs"
  }
}
```

- [ ] **Step 3: Erwartete Katalogmengen prüfen**

- 10 Schiffe
- 10 Waffenfamilien
- 12 Reaktoren
- 120 Module
- mindestens 24 Sockelchips
- alle Evolutionen referenzieren gültige Effekte
- alle Challenges referenzieren gültige Belohnungen
- alle Forschungsknoten referenzieren gültige Unlocks

- [ ] **Step 4: Commit**

```bash
git add scripts/validate-content.mjs package.json
git commit -m "chore: validate static content during production build"
```

---

### Task 19: Phase-4-Integration und vollständige manuelle Abnahme

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/persistence/save-schema.js`

- [ ] **Step 1: Alle Meta-Screens im Hangar verdrahten**
- [ ] **Step 2: Produktions-Build ausführen**

```bash
npm run build
```

Expected: Content-Validator und Vite-Build werden ohne Fehler beendet.

- [ ] **Step 3: Vollständige manuelle Abnahme**

1. Frischen Save starten und Onboarding Run 1 bis 5 durchlaufen.
2. Forschungsknoten aus jedem Zweig erwerben.
3. Eine Challenge freischalten und Belohnung prüfen.
4. Codex-Eintrag von Unknown bis Analyzed entwickeln.
5. Prototyp extrahieren und im Vault ausrüsten.
6. Legendären Prototyp verlieren.
7. Wrack-Signal öffnen und Bergungsmission abschließen.
8. Jeden Kampagnenpfad starten.
9. Build-Simulator öffnen und Telemetrie prüfen.
10. Alten Save migrieren und alle Legacy-Werte vergleichen.
11. Daily Run ohne Prototypvorteile starten.
12. Desktop- und Touch-Steuerung prüfen.
13. Browser schließen, neu öffnen und alle permanenten Daten prüfen.

- [ ] **Step 4: Release-Commit**

```bash
git add .
git commit -m "feat: complete voidreaper full expansion metagame"
```
