# VOIDREAPER Phase 2 – Loadouts und Ausrüstung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Verbindliche Vorgabe des Auftraggebers:** In dieser Planung werden keine Testdateien, kein Testverzeichnis, kein Testframework und keine automatisierten Testläufe angelegt. Die Kontrollschritte bestehen ausschließlich aus Build-Prüfungen, Browser-Konsole, reproduzierbaren Seeds und manuellen Funktionskontrollen. Es dürfen insbesondere weder Vitest/Jest noch Playwright/Cypress oder vergleichbare Systeme ergänzt werden.


**Goal:** Den Pre-Run-Hangar, zehn Schiffe, zehn Waffenfamilien, Reaktoren, 120 Module, Item-Instanzen, Affixe, Sockel, Forschung, aktive Module und Prototyp-Grundlagen vollständig implementieren.

**Architecture:** Content-Definitionen liegen getrennt von Item-Instanzen. Definitionen beschreiben Identität und erlaubte Pools; Instanzen speichern Seltenheit, Item Power, konkrete Affixe, Sockel, Korruption und Prototypstatus. Waffenfamilien implementieren eine gemeinsame Adapter-Schnittstelle und verwenden die Build Engine aus Phase 1.

**Tech Stack:** Bestehende modulare Vanilla-JavaScript-Anwendung aus Phase 1, Vite, Canvas und DOM. Keine automatisierten Tests.

---

## Dateizuordnung

- `src/features/equipment/equipment-registry.js`
- `src/features/equipment/loadout-service.js`
- `src/features/equipment/item-factory.js`
- `src/features/inventory/inventory-service.js`
- `src/features/hangar/hangar-controller.js`
- `src/features/research/unlock-service.js`
- `src/features/combat/weapon-controller.js`
- `src/features/combat/active-module-system.js`
- `src/content/ships/*.js`
- `src/content/weapons/*.js`
- `src/content/reactors/reactors.js`
- `src/content/modules/*.js`
- `src/content/affixes/*.js`
- `src/content/sockets/socket-chips.js`
- `src/content/evolutions/weapon-evolutions.js`
- `src/ui/screens/hangar-screen.js`
- `src/ui/screens/loadout-screen.js`
- `src/ui/screens/research-screen.js`
- `src/styles/hangar.css`

---

### Task 1: Equipment-Schemas und Registries definieren

**Files:**
- Create: `src/features/equipment/equipment-registry.js`
- Create: `src/features/equipment/equipment-schema.js`
- Create: `src/features/equipment/item-factory.js`

- [ ] **Step 1: Gemeinsame Slots definieren**

```js
export const EQUIPMENT_SLOT = Object.freeze({
  SHIP: "ship",
  PRIMARY_WEAPON: "primary-weapon",
  REACTOR: "reactor",
  PASSIVE: "passive",
  ACTIVE: "active",
  UTILITY: "utility",
  RELIC: "relic"
});
```

- [ ] **Step 2: Definitionen validieren**

Jede Definition benötigt `id`, `name`, `slot`, `energyCost`, `tags`, `effects` und `faultProfileId`.

- [ ] **Step 3: Item-Instanzen erzeugen**

```js
export function createItemInstance(definition, rollContext) {
  return {
    instanceId: rollContext.ids.create("item"),
    definitionId: definition.id,
    rarity: rollContext.rarity,
    itemPower: rollContext.itemPower,
    affixes: rollContext.affixes,
    sockets: rollContext.sockets,
    corruptionLevel: rollContext.corruptionLevel ?? 0,
    stability: rollContext.stability ?? 100,
    prototypeStatus: rollContext.prototypeStatus ?? "temporary",
    boundRunId: rollContext.runId ?? null,
    discoveredAt: new Date().toISOString()
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/equipment
git commit -m "feat: add equipment schemas registries and item instances"
```

---

### Task 2: Loadout-Service mit Energieberechnung implementieren

**Files:**
- Create: `src/features/equipment/loadout-service.js`
- Modify: `src/runtime/create-player-state.js`

- [ ] **Step 1: Slots implementieren**

Standard: 1 Schiff, 1 Primärwaffe, 1 Reaktor, 4 Passive, 2 Active, 2 Utility, 1 Relikt. Zweiter Reliktslot ist meta-gesperrt.

- [ ] **Step 2: Ausrüstung validieren**

Nur Definitionen des passenden Slots, keine doppelte einzigartige Komponente und keine fehlenden Freischaltungen.

- [ ] **Step 3: Energie und Tags aus allen Quellen aggregieren**
- [ ] **Step 4: Loadout darf über 100 Prozent liegen und wird nicht blockiert**
- [ ] **Step 5: Commit**

```bash
git add src/features/equipment src/runtime/create-player-state.js
git commit -m "feat: add modular loadout slots and overload calculation"
```

---

### Task 3: Zehn Schiffsrahmen implementieren

**Files:**
- Create: `src/content/ships/vesper.js`
- Create: `src/content/ships/bastion.js`
- Create: `src/content/ships/specter.js`
- Create: `src/content/ships/furnace.js`
- Create: `src/content/ships/reliquary.js`
- Create: `src/content/ships/shepherd.js`
- Create: `src/content/ships/harrow.js`
- Create: `src/content/ships/vector.js`
- Create: `src/content/ships/gravewright.js`
- Create: `src/content/ships/null-choir.js`
- Create: `src/content/ships/index.js`

- [ ] **Step 1: Für jedes Schiff die freigegebenen Hull-, Speed-, Energie- und Kühlungswerte definieren**
- [ ] **Step 2: Jede Signatur als registrierte Modifier- oder Triggerdefinition ausdrücken**
- [ ] **Step 3: Jeden Nachteil als sichtbaren Build-Eintrag ausgeben**
- [ ] **Step 4: Null Choir bis zur Meta-Freischaltung verbergen**
- [ ] **Step 5: Schiffsauswahl im Hangar ergänzen**
- [ ] **Step 6: Commit**

```bash
git add src/content/ships src/ui/screens/hangar-screen.js
git commit -m "feat: add ten distinct ship frames"
```

---

### Task 4: Weapon Controller und gemeinsame Waffen-Schnittstelle implementieren

**Files:**
- Create: `src/features/combat/weapon-controller.js`
- Create: `src/features/combat/weapon-context.js`
- Create: `src/content/weapons/weapon-schema.js`

- [ ] **Step 1: Schnittstelle definieren**

Jede Waffe stellt `createState`, `update`, `fire`, `onEquip`, `onUnequip` und `getTelemetry` bereit.

- [ ] **Step 2: Auto-Targeting als austauschbaren Targeting-Service verwenden**
- [ ] **Step 3: Waffeneffekte über Effect Registry auslösen**
- [ ] **Step 4: Waffen-Telemetrie für Build-Inspektor bereitstellen**
- [ ] **Step 5: Commit**

```bash
git add src/features/combat src/content/weapons/weapon-schema.js
git commit -m "feat: add common primary weapon controller"
```

---

### Task 5: Railgun und Plasma Caster implementieren

**Files:**
- Create: `src/content/weapons/railgun.js`
- Create: `src/content/weapons/plasma-caster.js`
- Modify: `src/content/evolutions/weapon-evolutions.js`

- [ ] **Step 1: Railgun-Basis mit Projectile, Kinetic, Critical und Pierce umsetzen**
- [ ] **Step 2: Prism Lance, Event Horizon Driver und Fractured Lance registrieren**
- [ ] **Step 3: Plasma-Basis mit Brandstapeln, Hitze und Zonen umsetzen**
- [ ] **Step 4: Solar Kiln, Cinder Bloom und Star-Eater registrieren**
- [ ] **Step 5: Commit**

```bash
git add src/content/weapons src/content/evolutions
git commit -m "feat: add railgun and plasma weapon families"
```

---

### Task 6: Missile Battery und Drone Core implementieren

**Files:**
- Create: `src/content/weapons/missile-battery.js`
- Create: `src/content/weapons/drone-core.js`
- Create: `src/features/combat/drone-controller.js`

- [ ] **Step 1: Zielsuchende Salven, Flugverzögerung und Explosionen implementieren**
- [ ] **Step 2: Seraph Barrage, Chain Cataclysm und Judas Swarm registrieren**
- [ ] **Step 3: Drohnenbudget, Formation, Zielwahl und Zerstörung implementieren**
- [ ] **Step 4: Aegis Constellation, Predator Mesh und Orphan Protocol registrieren**
- [ ] **Step 5: Commit**

```bash
git add src/content/weapons src/features/combat/drone-controller.js
git commit -m "feat: add missile and drone weapon families"
```

---

### Task 7: Arc Generator und Void Beam implementieren

**Files:**
- Create: `src/content/weapons/arc-generator.js`
- Create: `src/content/weapons/void-beam.js`
- Create: `src/features/combat/beam-controller.js`

- [ ] **Step 1: Kettenzielsuche und Schockstatus implementieren**
- [ ] **Step 2: Thunder Crown, Neural Storm und Blackout Gospel registrieren**
- [ ] **Step 3: Kontinuierlichen Strahl mit Intensitätsaufbau implementieren**
- [ ] **Step 4: Erasure Ray, Graviton Scalpel und Mouth of Nothing registrieren**
- [ ] **Step 5: Commit**

```bash
git add src/content/weapons src/features/combat/beam-controller.js
git commit -m "feat: add arc and void beam weapon families"
```

---

### Task 8: Mine Layer und Reaper Blades implementieren

**Files:**
- Create: `src/content/weapons/mine-layer.js`
- Create: `src/content/weapons/reaper-blades.js`
- Create: `src/features/combat/mine-controller.js`
- Create: `src/features/combat/orbit-controller.js`

- [ ] **Step 1: Minenplatzierung entlang der Bewegungsroute implementieren**
- [ ] **Step 2: Quantum Lattice, Funeral Orbit und Friendly Fire Doctrine registrieren**
- [ ] **Step 3: Klingenorbit, Rückkehr und Nahbereichstreffer implementieren**
- [ ] **Step 4: Blood Halo, Guillotine Array und Cannibal Crown registrieren**
- [ ] **Step 5: Commit**

```bash
git add src/content/weapons src/features/combat
git commit -m "feat: add mine and reaper blade weapon families"
```

---

### Task 9: Nanite Swarm und Anomaly Engine implementieren

**Files:**
- Create: `src/content/weapons/nanite-swarm.js`
- Create: `src/content/weapons/anomaly-engine.js`
- Create: `src/features/combat/nanite-controller.js`
- Create: `src/features/combat/anomaly-controller.js`

- [ ] **Step 1: Infektion, Replikation und Beschwörungsbudget implementieren**
- [ ] **Step 2: Grey Bloom, Symbiotic Armor und Replication Plague registrieren**
- [ ] **Step 3: Gewichtete Anomalieeffekte und gespeicherten letzten Effekt implementieren**
- [ ] **Step 4: Probability Engine, Mirror Collapse und Unwritten Weapon registrieren**
- [ ] **Step 5: Commit**

```bash
git add src/content/weapons src/features/combat
git commit -m "feat: add nanite and anomaly weapon families"
```

---

### Task 10: Zwölf Reaktorkerne implementieren

**Files:**
- Create: `src/content/reactors/reactors.js`
- Create: `src/features/equipment/reactor-service.js`

- [ ] **Step 1: Die zwölf freigegebenen Reaktoren definieren**
- [ ] **Step 2: Kill-, Hull-, Summon- und Sektor-basierte Energiequellen als Trigger registrieren**
- [ ] **Step 3: Null Reactor blockiert verbotene Evolutionen explizit**
- [ ] **Step 4: Abyssal Heart erhält `extractable: false` bis zur Meta-Freischaltung**
- [ ] **Step 5: Commit**

```bash
git add src/content/reactors src/features/equipment/reactor-service.js
git commit -m "feat: add twelve reactor cores"
```

---

### Task 11: Affix-Pools und Seltenheiten implementieren

**Files:**
- Create: `src/content/affixes/offensive-affixes.js`
- Create: `src/content/affixes/defensive-affixes.js`
- Create: `src/content/affixes/utility-affixes.js`
- Create: `src/content/affixes/corrupted-affixes.js`
- Create: `src/features/equipment/affix-roller.js`

- [ ] **Step 1: Seltenheitsregeln aus der Spezifikation abbilden**
- [ ] **Step 2: Gewichtung nach Komponentenfamilie, Tags, Seltenheit, Sektor und Korruption implementieren**
- [ ] **Step 3: Werte mit dem Run-RNG rollen und auf der Instanz speichern**
- [ ] **Step 4: Legendäre und einzigartige feste Regeln von zufälligen Affixen trennen**
- [ ] **Step 5: Commit**

```bash
git add src/content/affixes src/features/equipment/affix-roller.js
git commit -m "feat: add weighted item affix generation"
```

---

### Task 12: Sockel und Chips implementieren

**Files:**
- Create: `src/content/sockets/socket-chips.js`
- Create: `src/features/equipment/socket-service.js`

- [ ] **Step 1: Echo Chip, Thermal Vent, Hunter Kernel, Mirror Shard, Null Seal und Blood Circuit definieren**
- [ ] **Step 2: Zusätzlich mindestens 18 Chips für alle Waffen- und Ressourcenfamilien definieren**
- [ ] **Step 3: Einsetzen, Entfernen und Zerstören über explizite Aktionen abbilden**
- [ ] **Step 4: Chips erzeugen primär Verhaltensänderungen statt Prozentboni**
- [ ] **Step 5: Commit**

```bash
git add src/content/sockets src/features/equipment/socket-service.js
git commit -m "feat: add behavioral socket chip system"
```

---

### Task 13: 120 Moduldefinitionen in getrennten Content-Dateien anlegen

**Files:**
- Create: `src/content/modules/offensive-passive.js`
- Create: `src/content/modules/defensive-passive.js`
- Create: `src/content/modules/utility.js`
- Create: `src/content/modules/active-offensive.js`
- Create: `src/content/modules/active-defensive.js`
- Create: `src/content/modules/active-control.js`
- Create: `src/content/modules/corrupted.js`
- Create: `src/content/modules/unique-relics.js`
- Create: `src/content/modules/index.js`

- [ ] **Step 1: Für jeden unten aufgeführten Modul-ID eine vollständige Definition anlegen**
- [ ] **Step 2: Jede Definition erhält Energiepreis, Tags, Effekt-IDs, Affix-Pool, Fehlerprofil und Freischaltquelle**
- [ ] **Step 3: Aktive Module erhalten genau ein Ressourcenmodell**
- [ ] **Step 4: Korrumpierte Module erhalten positive und negative Kernwirkung**
- [ ] **Step 5: Registry-Startmeldung muss exakt 120 Module ausgeben**
- [ ] **Step 6: Commit**

```bash
git add src/content/modules
git commit -m "feat: add complete 120 module catalog"
```

## Verbindlicher Modulkatalog

### Offensive passive Module (30)

- `splitter-matrix` — **Split Matrix** — `Projectile/Multishot` — Jeder vierte Schuss erzeugt zwei schwächere Seitenprojektile.
- `critical-resonator` — **Critical Resonator** — `Critical/Charge` — Kritische Treffer laden einen Resonanzimpuls.
- `blast-compressor` — **Blast Compressor** — `Explosive` — Kleinere Explosionsfläche, deutlich höherer Zentralschaden.
- `chain-conductor` — **Chain Conductor** — `Chain/Arc` — Kettensprünge erhalten zusätzliche Reichweite.
- `sniper-kernel` — **Sniper Kernel** — `Critical/Projectile` — Schaden steigt mit Projektilflugzeit.
- `execution-protocol` — **Execution Protocol** — `Execute` — Schaden gegen Gegner unter 20 Prozent Hull.
- `piercing-rail` — **Piercing Rail** — `Pierce/Kinetic` — Erster Durchschlag verliert keinen Schaden.
- `plasma-accelerant` — **Plasma Accelerant** — `Plasma/Burn` — Brandstapel erhöhen Projektiltempo.
- `volatile-casing` — **Volatile Casing** — `Explosive/Heat` — Explosionen erzeugen Hitze und Sekundärsplitter.
- `hunter-lock` — **Hunter Lock** — `Homing` — Eliten werden bevorzugt und markiert.
- `echo-chamber` — **Echo Chamber** — `Echo` — Jeder fünfte Waffenangriff wird wiederholt.
- `void-aperture` — **Void Aperture** — `Void/Corruption` — Void-Schaden wächst mit Korruption.
- `bleed-serrator` — **Bleed Serrator** — `Bleed/Orbit` — Klingen bauen zusätzliche Blutung auf.
- `storm-capacitor` — **Storm Capacitor** — `Arc/Energy` — Überschüssige Energie verstärkt den nächsten Blitz.
- `mine-amplifier` — **Mine Amplifier** — `Mine/Explosive` — Länger liegende Minen verursachen mehr Schaden.
- `drone-weapon-link` — **Drone Weapon Link** — `Drone` — Drohnen übernehmen einen Teil der Waffenaffixe.
- `nanite-brood` — **Nanite Brood** — `Summon/Corrosion` — Infizierte Kills erzeugen kleine Schwärme.
- `beam-lens` — **Beam Lens** — `Beam` — Schmalerer Strahl mit höherer Intensität.
- `orbit-expander` — **Orbit Expander** — `Orbit` — Größerer Radius und höhere Klingengeschwindigkeit.
- `nova-igniter` — **Nova Igniter** — `Nova/Heat` — Nova entzündet getroffene Gegner.
- `recoil-harvester` — **Recoil Harvester** — `Kinetic/Energy` — Pierce-Kills gewinnen Energie zurück.
- `mark-of-ruin` — **Mark of Ruin** — `Critical/Void` — Crits markieren Gegner für Void-Schaden.
- `salvo-brain` — **Salvo Brain** — `Homing/Chain` — Raketen teilen Zielinformationen.
- `thermal-breach` — **Thermal Breach** — `Heat/Explosive` — Überhitzen verstärkt die nächste Explosion.
- `sacrificial-guidance` — **Sacrificial Guidance** — `Summon/Sacrifice` — Opfert eine Einheit für garantierten Raketen-Crit.
- `gravity-warhead` — **Gravity Warhead** — `Explosive/Control` — Explosionen ziehen Gegner kurz ins Zentrum.
- `phase-ammunition` — **Phase Ammunition** — `Projectile/Void` — Projektile ignorieren Schilde, erzeugen Korruption.
- `predator-algorithm` — **Predator Algorithm** — `Drone/Execute` — Drohnen fokussieren verwundete Ziele.
- `shock-puncture` — **Shock Puncture** — `Arc/Pierce` — Durchschlag überträgt Schock.
- `entropy-amplifier` — **Entropy Amplifier** — `Anomaly/Corruption` — Zufällige Effekte erhalten größere Wertebereiche.

### Defensive passive Module (20)

- `phase-shield` — **Phase Shield** — `Shield/Dodge` — Ausweichen erzeugt kurz einen Schild.
- `reactive-armor` — **Reactive Armor** — `Hull` — Nach einem Treffer kurzzeitig Schadensreduktion.
- `nanite-repair` — **Nanite Repair** — `Healing` — Heilt außerhalb unmittelbarer Gefahr.
- `emergency-cooling` — **Emergency Cooling** — `Cooling` — Bei 90 Hitze einmalig starke Kühlung.
- `damage-router` — **Damage Router** — `Energy` — Ein Teil des Schadens verbraucht Energie.
- `last-barrier` — **Last Barrier** — `Shield` — Bei kritischer Hull einmal pro Sektor Barriere.
- `kinetic-dampers` — **Kinetic Dampers** — `Control` — Reduziert Rückstoß und Kontaktschaden.
- `void-insulation` — **Void Insulation** — `Corruption` — Reduziert Korruptionsschaden, senkt Reinigung.
- `drone-screen` — **Drone Screen** — `Drone/Shield` — Drohnen können Projektile abfangen.
- `thermal-plating` — **Thermal Plating** — `Heat/Hull` — Hohe Hitze gewährt Rüstung.
- `blood-seal` — **Blood Seal** — `Healing/Corruption` — Überheilung wird Schild, erzeugt Korruption.
- `mirror-shell` — **Mirror Shell** — `Shield/Echo` — Gelegentliche Projektilreflexion.
- `stasis-gel` — **Stasis Gel** — `Cooldown` — Treffer verlangsamt Gegner in kleinem Radius.
- `ablative-lattice` — **Ablative Lattice** — `Hull/Sacrifice` — Verbraucht eine Modulstabilitätsschicht statt Hull.
- `guardian-node` — **Guardian Node** — `Summon/Shield` — Beschwört defensive Wächterdrohne.
- `fault-grounding` — **Fault Grounding** — `Stability` — Leichte Fehler werden absorbiert.
- `cold-blood-loop` — **Cold Blood Loop** — `Cooling/Healing` — Kühlung heilt bei niedriger Hitze.
- `shock-absorber` — **Shock Absorber** — `Arc/Shield` — Schockeffekte laden Schild.
- `escape-vector` — **Escape Vector** — `Dodge` — Niedrige Hull reduziert Dodge-Cooldown.
- `phoenix-array` — **Phoenix Array** — `Revive/Heat` — Einmalige Wiederbelebung mit maximaler Hitze.

### Utility-Module (20)

- `gravity-siphon` — **Gravity Siphon** — `Pickup/Control` — Vergrößert Pickup-Radius und zieht leichte Gegner.
- `target-priority-core` — **Target Priority Core** — `Targeting` — Konfigurierbare Zielprioritäten.
- `salvage-scanner` — **Salvage Scanner** — `Loot` — Zeigt Prototyp- und Blaupausenchancen.
- `affix-booster` — **Affix Booster** — `Affix` — Verstärkt ein zufälliges Affix pro Sektor.
- `motion-battery` — **Motion Battery** — `Movement/Energy` — Bewegung erzeugt Energie.
- `extraction-beacon` — **Extraction Beacon** — `Extraction` — Erlaubt seltene Notextraktion.
- `flux-condenser` — **Flux Condenser** — `Currency` — Mehr Flux, geringere Heilungsdrops.
- `map-probe` — **Map Probe** — `Navigation` — Deckt einen zusätzlichen Kartenknoten auf.
- `workshop-pass` — **Workshop Pass** — `Crafting` — Eine zusätzliche Werkstattaktion.
- `merchant-transponder` — **Merchant Transponder** — `Merchant` — Verbessert Händlerangebot.
- `heat-telemetry` — **Heat Telemetry** — `Heat` — Zeigt nächste Überhitzungsquelle.
- `fault-predictor` — **Fault Predictor** — `Fault` — Zeigt Fehlerklasse früher.
- `corruption-filter` — **Corruption Filter** — `Corruption` — Verringert kleine Korruptionsbuchungen.
- `module-switcher` — **Module Switcher** — `Loadout` — Ein passiver Slot im Sektor wechselbar.
- `socket-extractor` — **Socket Extractor** — `Socket` — Erlaubt sichere Chip-Entnahme.
- `prototype-locker` — **Prototype Locker** — `Prototype` — Ein zusätzlicher markierter Prototyp.
- `scrap-compactor` — **Scrap Compactor** — `Currency` — Verkaufserlös steigt.
- `elite-tracker` — **Elite Tracker** — `Elite` — Markiert Elite-Spawns und Belohnungen.
- `coolant-reservoir` — **Coolant Reservoir** — `Cooling` — Speichert aktive Sofortkühlung.
- `signal-decoder` — **Signal Decoder** — `Codex` — Unbekannte Signaturen zeigen eine Zusatzinformation.

### Aktive offensive Module (15)

- `reactor-discharge` — **Reactor Discharge** — `Energy/Arc` — Verbraucht Energie für kreisförmige Entladung.
- `remote-detonator` — **Remote Detonator** — `Mine/Charge` — Zündet alle Minen und verstärkt sie.
- `orbital-strike` — **Orbital Strike** — `Cooldown/Explosive` — Markiert Fläche für schweren Einschlag.
- `void-gate` — **Void Gate** — `Corruption/Void` — Öffnet schädigendes Portal.
- `drone-overclock` — **Drone Overclock** — `Heat/Drone` — Drohnen feuern schneller und erzeugen Hitze.
- `blood-burst` — **Blood Burst** — `Hull/Sacrifice` — Verbraucht Hull für massiven Nahbereichsschaden.
- `arc-cascade` — **Arc Cascade** — `Charge/Arc` — Entlädt gespeicherte Schockladungen.
- `plasma-flood` — **Plasma Flood** — `Heat/Plasma` — Erzeugt wandernde Brandzone.
- `rail-salvo` — **Rail Salvo** — `Cooldown/Projectile` — Feuert konzentrierte Pierce-Salve.
- `nanite-consume` — **Nanite Consume** — `Sacrifice/Summon` — Verbraucht Schwärme für Explosionen.
- `anomaly-cast` — **Anomaly Cast** — `Corruption/Anomaly` — Löst gespeicherten Zufallseffekt aus.
- `execution-dive` — **Execution Dive** — `Charge/Execute` — Teleportiert zu schwachem Eliteziel.
- `singularity-anchor` — **Singularity Anchor** — `Energy/Control` — Setzt starken Gravitationspunkt.
- `missile-saturation` — **Missile Saturation** — `Heat/Homing` — Mehrere Zielwellen.
- `reaper-unbound` — **Reaper Unbound** — `Charge/Orbit` — Klingen verlassen Orbit und jagen Ziele.

### Aktive defensive Module (10)

- `shield-pulse` — **Shield Pulse** — `Energy/Shield` — Temporärer Rundumschild.
- `time-stop` — **Time Stop** — `Cooldown/Control` — Verlangsamt Gegner und Projektile stark.
- `phase-jump` — **Phase Jump** — `Charge/Dodge` — Gezielter kurzer Teleport.
- `emergency-vent` — **Emergency Vent** — `Heat/Cooling` — Entfernt Hitze als Schadenswelle.
- `hull-conversion` — **Hull Conversion** — `Energy/Healing` — Energie wird in Hull umgewandelt.
- `drone-recall` — **Drone Recall** — `Drone/Shield` — Drohnen bilden Schutzformation.
- `null-field` — **Null Field** — `Corruption/Shield` — Unterdrückt Void-Effekte gegen Korruptionskosten.
- `fault-reset` — **Fault Reset** — `Cooldown/Stability` — Beendet aktuellen Systemfehler.
- `stasis-shell` — **Stasis Shell** — `Charge/Shield` — Unbewegliche Unverwundbarkeit mit Nachteil.
- `phoenix-trigger` — **Phoenix Trigger** — `Charge/Revive` — Manuell aktivierbare Notwiederherstellung.

### Aktive Kontrollmodule (10)

- `gravity-anchor` — **Gravity Anchor** — `Energy/Control` — Zieht Gegner in ein Zentrum.
- `shock-net` — **Shock Net** — `Charge/Arc` — Verbindet Gegner mit verlangsamenden Blitzen.
- `mine-wall` — **Mine Wall** — `Cooldown/Mine` — Legt lineare Minensperre.
- `decoy-drone` — **Decoy Drone** — `Energy/Drone` — Zieht Gegneraggro.
- `repulsion-wave` — **Repulsion Wave** — `Heat/Nova` — Stößt Gegner und Projektile weg.
- `void-tether` — **Void Tether** — `Corruption/Void` — Bindet Elite an Position.
- `chronolock` — **Chronolock** — `Cooldown/Control` — Friert einen Zielbereich ein.
- `target-scramble` — **Target Scramble** — `Charge/Anomaly` — Gegner greifen kurz einander an.
- `nanite-snare` — **Nanite Snare** — `Summon/Control` — Infizierte Gegner werden verlangsamt.
- `orbit-cage` — **Orbit Cage** — `Energy/Orbit` — Klingen bilden stationären Käfig.

### Korrumpierte Module (10)

- `black-heart` — **Black Heart** — `Corruption/Energy` — Große Energie, stetige Korruption.
- `whispering-targeter` — **Whispering Targeter** — `Corruption/Targeting` — Enormer Crit-Bonus, gelegentlich falsches Ziel.
- `parasitic-cooling` — **Parasitic Cooling** — `Corruption/Cooling` — Kühlt durch Verbrauch von Beschwörungen.
- `inverted-shield` — **Inverted Shield** — `Corruption/Shield` — Absorbiert Schaden und gibt ihn später zurück.
- `hungry-socket` — **Hungry Socket** — `Corruption/Socket` — Verstärkt Chip durch Verbrauch eines Affixes.
- `broken-timer` — **Broken Timer** — `Corruption/Cooldown` — Cooldown kann sofort oder doppelt lang sein.
- `friendly-fire-core` — **Friendly Fire Core** — `Corruption/Explosive` — Massiver Explosionsbonus mit Eigengefährdung.
- `orphan-command` — **Orphan Command** — `Corruption/Drone` — Drohnen werden stärker und zeitweise feindlich.
- `mirror-wound` — **Mirror Wound** — `Corruption/Echo` — Kopiert Treffer auf Spieler und Gegner.
- `unwritten-rule` — **Unwritten Rule** — `Corruption/Anomaly` — Ändert pro Sektor eine Kernregel.

### Einzigartige Reliktmodule (5)

- `crown-of-static` — **Crown of Static** — `Relic/Arc` — Alle Trigger können Schock erzeugen; Energie bleibt dauerhaft instabil.
- `saint-of-machines` — **Saint of Machines** — `Relic/Drone` — Drohnen erben sämtliche Sockelchips.
- `grave-sun` — **Grave Sun** — `Relic/Heat` — Hitze kann 150 erreichen und wird zu Schaden.
- `eye-beyond-zero` — **Eye Beyond Zero** — `Relic/Void` — Zeigt verbotene Transformationen früh, verhindert Reinigung.
- `last-perfect-engine` — **Last Perfect Engine** — `Relic/Stability` — Keine leichten Fehler; jeder Fehler ist schwer und verstärkt.


---

### Task 14: Aktive Modulressourcen vollständig anbinden

**Files:**
- Modify: `src/features/combat/active-module-system.js`
- Create: `src/features/combat/charge-system.js`

- [ ] **Step 1: Ressourcenmodelle `cooldown`, `energy`, `heat`, `kill-charge`, `crit-charge`, `movement-charge`, `damage-charge`, `corruption`, `sacrifice` und `sector-charges` implementieren**
- [ ] **Step 2: HUD zeigt Kosten und verbleibende Ladung**
- [ ] **Step 3: Fehlerprofile können die Aktivierung verändern oder blockieren**
- [ ] **Step 4: Commit**

```bash
git add src/features/combat
git commit -m "feat: support all active module resource models"
```

---

### Task 15: Inventar und temporäre Run-Ausrüstung implementieren

**Files:**
- Create: `src/features/inventory/inventory-service.js`
- Create: `src/features/inventory/run-inventory.js`
- Create: `src/features/inventory/prototype-service.js`

- [ ] **Step 1: Temporäre, Blueprint-, Relikt- und Prototypgegenstände unterscheiden**
- [ ] **Step 2: Run-Inventar getrennt vom permanenten Hangar speichern**
- [ ] **Step 3: Maximal drei Prototypen markierbar machen**
- [ ] **Step 4: `Prototype Locker` erhöht das Limit**
- [ ] **Step 5: Commit**

```bash
git add src/features/inventory
git commit -m "feat: add run inventory and prototype marking"
```

---

### Task 16: Hangar- und Loadout-UI implementieren

**Files:**
- Create: `src/ui/screens/hangar-screen.js`
- Create: `src/ui/screens/loadout-screen.js`
- Create: `src/ui/components/item-card.js`
- Create: `src/ui/components/item-comparison.js`
- Modify: `src/styles/hangar.css`

- [ ] **Step 1: Tabs Run starten, Loadout, Schiffe, Waffen, Module, Forschung, Prototypen und Codex anlegen**
- [ ] **Step 2: Slots um eine zentrale Schiffsansicht darstellen**
- [ ] **Step 3: Energie, Laststufe, erwartete Wärme und Startkorruption live berechnen**
- [ ] **Step 4: Itemvergleich zeigt Endwert-Deltas, Tags, Synergien und Fehlerprofil**
- [ ] **Step 5: Mobile Ansicht verwendet Listen und große Auswahlkarten**
- [ ] **Step 6: Commit**

```bash
git add src/ui/screens src/ui/components src/styles/hangar.css
git commit -m "feat: add full hangar and loadout interface"
```

---

### Task 17: Forschung, Challenges und Blaupausen als Freischaltquellen vorbereiten

**Files:**
- Create: `src/features/research/unlock-service.js`
- Create: `src/content/research/phase-two-unlocks.js`
- Create: `src/ui/screens/research-screen.js`

- [ ] **Step 1: Unlock-Typen `research`, `challenge`, `blueprint`, `secret` implementieren**
- [ ] **Step 2: Railgun, Plasma, Missile und Reaper über Forschung verfügbar machen**
- [ ] **Step 3: Drone, Arc und Mine über Challenge-Flags verfügbar machen**
- [ ] **Step 4: Void Beam, Nanite und Anomaly über Blueprints verfügbar machen**
- [ ] **Step 5: Gesperrte Inhalte zeigen verständliche Hinweise ohne geheime Details zu verraten**
- [ ] **Step 6: Commit**

```bash
git add src/features/research src/content/research src/ui/screens/research-screen.js
git commit -m "feat: add hybrid equipment unlock sources"
```

---

### Task 18: Phase-2-Integration und manuelle Kontrolle

**Files:**
- Modify: `src/app/bootstrap.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/persistence/save-schema.js`

- [ ] **Step 1: Content-Registrierung in stabiler Reihenfolge durchführen**
- [ ] **Step 2: Save um Loadouts, Unlocks, Inventar und Blueprints erweitern**
- [ ] **Step 3: Produktions-Build ausführen**

```bash
npm run build
```

- [ ] **Step 4: Manuelle Phase-2-Kontrolle**

1. Jedes der zehn Schiffe auswählen.
2. Jede Waffenfamilie mindestens einen Sektor lang spielen.
3. Ein Loadout unter 100, bei 120 und über 160 Prozent Last starten.
4. Zwei aktive Module mit unterschiedlichen Ressourcenmodellen verwenden.
5. Affix und Sockel im Itemvergleich prüfen.
6. Einen temporären Prototyp markieren.
7. App neu laden und Hangar-Loadout prüfen.
8. Registry-Zähler prüfen: zehn Schiffe, zehn Waffen, zwölf Reaktoren, 120 Module.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: complete loadouts equipment and content catalog"
```
