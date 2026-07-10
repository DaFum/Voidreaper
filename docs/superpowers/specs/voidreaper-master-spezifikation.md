# VOIDREAPER: ETERNAL REDUX
## Master-Spezifikation für den vollständigen Theorycrafting-Ausbau

**Status:** Entwurf zur fachlichen Freigabe  
**Datum:** 10. Juli 2026  
**Grundlage:** `voidreaper-redux.html`  
**Zielbild:** Ein tiefes, aber lesbares Action-Roguelite mit modularen Loadouts, kontrollierter Überlastung, hybriden Evolutionen, planbaren Run-Entscheidungen und langfristiger Meta-Progression.

---

# 1. Produktvision

VOIDREAPER soll von einem kompakten Auto-Fire-Survivor zu einem systemisch tiefen Build-Roguelite ausgebaut werden. Der Spieler soll vor einem Run eine erkennbare Build-Identität wählen, diese während des Runs umbauen, überladen, korrumpieren oder vollständig transformieren können.

Die Erweiterung bewahrt folgende Kerneigenschaften:

- Bewegung bleibt die wichtigste direkte Kampfeingabe.
- Die Primärwaffe und passive Systeme zielen und feuern automatisch.
- Das Spiel bleibt auf Desktop und Touch-Geräten vollständig bedienbar.
- Runs liefern früh sichtbare Machtsteigerungen und ein starkes audiovisuelles Feedback.
- Zufall erzeugt neue Situationen, darf einen guten Build aber nicht vollständig zerstören.
- Komplexität wird schrittweise sichtbar und über einen Codex dauerhaft verständlich gemacht.

Der vollständige Ausbau besteht aus vier fachlich getrennten, technisch aufeinander aufbauenden Spezifikationen:

1. **Build Engine**
2. **Loadouts und Ausrüstung**
3. **Run-Struktur**
4. **Metagame**

---

# 2. Bereits getroffene Designentscheidungen

Diese Entscheidungen gelten für alle vier Spezifikationen:

- Schwerpunkt: tiefes Theorycrafting.
- Pre-Run-Modell: Schiff, Primärwaffe, Reaktorkern und Module.
- Loadouts verwenden ein gemeinsames Energiebudget.
- Das Energielimit darf bewusst überschritten werden.
- Überlastung kombiniert Hitze, Korruption und individuelle Systemfehler.
- Evolutionen verwenden feste Kernrezepte plus ein dynamisches Tag-System.
- Der Vollausbau enthält zehn Primärwaffen-Familien.
- Freischaltungen kombinieren Forschung, Herausforderungen und Blaupausen.
- Runs kombinieren Level-ups, Sektorkarte, Händler, Werkstatt und Risikoereignisse.
- Ein Standard-Run dauert ungefähr 35 Minuten und endet mit einem Kampagnen-Endboss.
- Danach kann derselbe Build freiwillig in den endlosen Abyss wechseln.
- Steuerung: Bewegung, Ausweichen und zwei aktive Modulplätze.
- Aktive Module können unterschiedliche Ressourcenlogiken verwenden.
- Komponenten besitzen einen handgefertigten Kern, variable Affixe und optionale Sockel.
- Affixe sind zufällig, können aber kontrolliert verändert werden.
- Gewöhnliche Run-Gegenstände verfallen; Blaupausen, Relikte und extrahierte Prototypen bleiben.
- Der Verlust von Prototypen hängt von ihrer Seltenheit ab.
- Regeln sind gestaffelt transparent: Zahlen und aktive Synergien sind offen, geheime Transformationen werden entdeckt.
- Zielumfang: acht bis zehn Schiffe, zehn Waffenfamilien, mehr als 100 Module, mehrere Kampagnenpfade, Abyss, Extraktion, Codex und Bergungsmissionen.

---

# 3. Gemeinsame technische Zielarchitektur

## 3.1 Ausgangslage

Die bestehende Version verbindet Daten, Spielzustand, Kampflogik, Rendering, UI, Audio und Persistenz in einer einzelnen HTML-Datei. Für den Vollausbau muss diese Struktur schrittweise modularisiert werden. Die erste Migration darf das aktuelle Spielverhalten nicht verändern.

## 3.2 Zielstruktur

```text
src/
  app/
    bootstrap.js
    game-controller.js
    state-machine.js
  core/
    rng.js
    event-bus.js
    ids.js
    math.js
    schema-validation.js
  data/
    ships.js
    weapons.js
    reactors.js
    modules.js
    affixes.js
    evolutions.js
    enemies.js
    sectors.js
    challenges.js
  systems/
    stats/
    tags/
    combat/
    heat/
    energy/
    corruption/
    faults/
    loot/
    crafting/
    sectors/
    extraction/
    progression/
  runtime/
    run-state.js
    player-state.js
    inventory-state.js
    encounter-state.js
  render/
    renderer.js
    effects.js
    entities.js
    hud-renderer.js
  ui/
    screens/
    components/
    input/
  persistence/
    save-store.js
    migrations.js
    validation.js
  audio/
    audio-system.js
  tests/
    unit/
    integration/
    simulation/
```

## 3.3 Architekturprinzipien

1. **Datengetriebene Inhalte:** Waffen, Module, Affixe, Evolutionen und Herausforderungen werden als validierte Definitionen gespeichert.
2. **Deterministische Runs:** Alle spielrelevanten Zufallsentscheidungen verwenden einen Run-Seed.
3. **Getrennte Zustände:** Meta-Fortschritt, Run-Zustand und rein visuelle Effekte werden nicht vermischt.
4. **Explizite Ereignisse:** Systeme kommunizieren über klar benannte Ereignisse wie `enemy_killed`, `heat_threshold_crossed` oder `module_activated`.
5. **Keine freie Script-Ausführung in Daten:** Effekte verwenden registrierte Effekt-Typen statt dynamischer Code-Strings.
6. **Abwärtskompatible Saves:** Jeder Speicherstand enthält eine Versionsnummer und wird über Migrationen aktualisiert.
7. **Performance bleibt ein Produktmerkmal:** Spatial Hash, Object Pools und Fixed-Step-Simulation werden beibehalten oder verbessert.

## 3.4 Qualitätsziele

- 60 FPS auf üblichem Desktop-Browser.
- Stabiler 30-FPS-Modus auf schwächeren Mobilgeräten; 60 FPS auf leistungsfähigen Geräten.
- Keine spielentscheidende Zufallslogik außerhalb des Seed-Generators.
- Keine verlorenen permanenten Freischaltungen durch einen fehlerhaften Save.
- Vollständige Bedienbarkeit per Tastatur und Touch.
- Reduzierte Bewegung und reduzierte Bildschirmblitze als Optionen.
- Farbige Zustände müssen zusätzlich über Symbole, Muster oder Text erkennbar sein.

---

# SPEZIFIKATION 1: BUILD ENGINE

## 1. Ziel

Die Build Engine ist das gemeinsame Regelsystem für Werte, Tags, Energie, Hitze, Korruption, Affixe, Sockel, Auslöser, Synergien, Evolutionen und Systemfehler. Alle späteren Inhalte müssen sich über diese Engine ausdrücken lassen, ohne neue Sonderlogik direkt in die Hauptschleife einzubauen.

## 2. Erfolgsbild

Ein Spieler kann jederzeit beantworten:

- Was verursacht mein Build?
- Welche Tags sind aktiv?
- Welche Synergien sind erfüllt?
- Wie viel Energie ist belegt?
- Warum entsteht Hitze?
- Woher kommt Korruption?
- Welche Evolution ist beinahe erreichbar?
- Welche Systemfehler drohen?
- Welcher konkrete Effekt würde sich durch einen Austausch verändern?

Gleichzeitig dürfen geheime Transformationen und seltene Interaktionen noch Überraschungen erzeugen.

## 3. Nicht-Ziele

- Kein vollständiges Loot-Inventar in dieser Phase.
- Keine Sektorkarte.
- Keine Online-Ranglisten.
- Kein endgültiges Balancing aller späteren Inhalte.
- Keine frei programmierbaren Spieler-Skripte.

## 4. Zentrales Datenmodell

### 4.1 `StatDefinition`

```text
id
displayName
category
baseValue
minimum
maximum
rounding
displayFormat
stackingRule
```

Beispiele:

- `damage_multiplier`
- `fire_rate`
- `projectile_speed`
- `crit_chance`
- `crit_multiplier`
- `heat_generation`
- `cooling_rate`
- `energy_capacity`
- `corruption_gain`
- `dodge_cooldown`
- `pickup_radius`

### 4.2 Berechnungsreihenfolge

Alle Werte werden in einer festen Reihenfolge berechnet:

1. Basiswert
2. Schiffswerte
3. Reaktorkern
4. feste Komponentenwerte
5. additive Boni
6. multiplikative Boni
7. bedingte Modifikatoren
8. Überlastungsmodifikatoren
9. Korruptionsmodifikatoren
10. globale Grenzwerte
11. temporäre Laufzeiteffekte

Jeder Wert kann im Build-Inspektor bis zu seinen Quellen zurückverfolgt werden.

### 4.3 `Tag`

Tags beschreiben Verhalten und erlauben systemische Synergien.

**Auslieferung**
- `Projectile`
- `Beam`
- `Orbit`
- `Drone`
- `Mine`
- `Aura`
- `Summon`
- `Nova`

**Schaden**
- `Kinetic`
- `Plasma`
- `Arc`
- `Void`
- `Bleed`
- `Burn`
- `Shock`
- `Corrosion`

**Verhalten**
- `Critical`
- `Pierce`
- `Chain`
- `Explosive`
- `Homing`
- `Echo`
- `Execute`
- `Control`

**Ressourcen**
- `Energy`
- `Heat`
- `Corruption`
- `Charge`
- `Cooldown`
- `Sacrifice`

**Ursprung**
- `Weapon`
- `ActiveModule`
- `PassiveModule`
- `Ship`
- `Reactor`
- `Affix`
- `Socket`

Tags dürfen gestapelte Intensitäten besitzen, zum Beispiel `Burn:3` oder `Drone:5`.

### 4.4 `Modifier`

```text
id
sourceId
targetStat
operation: add | multiply | override | clamp
value
condition
priority
duration
stackKey
```

### 4.5 `Trigger`

Unterstützte Auslöser:

- beim Schuss
- beim Treffer
- beim kritischen Treffer
- beim Kill
- bei Elite-Kill
- bei Boss-Treffer
- bei erlittenem Schaden
- beim Ausweichen
- beim Überschreiten einer Hitzegrenze
- beim Überhitzen
- beim Korruptionsanstieg
- beim Aktivieren eines Moduls
- beim Einsammeln einer Ressource
- periodisch
- beim Betreten eines Sektors
- beim Extrahieren

Trigger besitzen interne Cooldowns und eine maximale Auslösefrequenz.

### 4.6 `Effect`

Registrierte Effekttypen:

- Schaden
- Heilung
- Schild
- Projektil erzeugen
- Zone erzeugen
- Einheit beschwören
- Ressource verändern
- Teleport
- Statuseffekt anwenden
- Gegner verschieben
- Cooldown verändern
- Modul deaktivieren
- Affix temporär kopieren
- Loot-Chance verändern
- Evolution markieren
- Systemfehler auslösen

## 5. Tag- und Synergie-Engine

### 5.1 Synergiearten

**Schwellensynergie:**  
Wird ab einer bestimmten Tag-Intensität aktiv.

Beispiel: `Projectile >= 4` und `Pierce >= 2` erzeugen `Ballistic Convergence`.

**Kreuzsynergie:**  
Verbindet zwei unterschiedliche Systeme.

Beispiel: `Burn`-Treffer auf `Shocked`-Gegner lösen eine Plasma-Entladung aus.

**Trigger-Synergie:**  
Ein Trigger lädt oder aktiviert ein anderes System.

Beispiel: Kritische Treffer laden ein aktives Modul.

**Konfliktsynergie:**  
Widersprüchliche Tags erzeugen ein Risiko oder eine Transformation.

Beispiel: `Cooling` und `Overheat` gleichzeitig können den Zustand `Thermal Fracture` erzeugen.

**Verbotene Synergie:**  
Benötigt hohe Korruption, Überlastung oder ein bestimmtes Relikt.

### 5.2 Priorität

1. Sicherheits- und Grenzwertregeln
2. feste Kern-Evolutionen
3. verbotene Transformationen
4. einzigartige Relikte
5. Affixe
6. allgemeine Tag-Synergien

Damit überschreibt ein zufälliges Affix niemals unkontrolliert die Identität einer Evolution.

## 6. Energiebudget und Überlastung

### 6.1 Werte

- `energyCapacity`: verfügbare Reaktorleistung
- `energyReserved`: dauerhaft belegte Energie
- `energyBurstCost`: kurzfristiger Verbrauch aktiver Module
- `energyRegeneration`: Regeneration pro Sekunde
- `loadRatio`: `energyReserved / energyCapacity`

### 6.2 Überlastungsstufen

| Last | Zustand | Wirkung |
|---|---|---|
| 0–100 % | Stabil | keine Strafe |
| 101–115 % | Angespannt | +10 % Hitze, leichte Fehlerchance |
| 116–135 % | Überladen | +25 % Hitze, stärkere Affixe, regelmäßige Fehler |
| 136–160 % | Kritisch | +50 % Hitze, Korruptionsgewinn, schwere Fehler |
| über 160 % | Kollapsnah | exponentielle Risiken, verbotene Synergien möglich |

Überlastung ist erlaubt und kann positive Affixe oder Evolutionen aktivieren. Ein Build oberhalb von 160 % muss spielbar bleiben, aber nur mit bewusstem Gegenbau.

## 7. Hitzesystem

### 7.1 Grundregeln

- Hitze reicht regulär von 0 bis 100.
- Waffen und Module erzeugen Hitze pro Nutzung oder pro Sekunde.
- Kühlung beginnt nach einer kurzen Verzögerung oder läuft dauerhaft, abhängig vom Reaktor.
- Hitze ist kurzfristig und kann aktiv gemanagt werden.

### 7.2 Schwellen

- **60 – Warm:** visuelle Warnung; hitzebasierte Affixe werden aktiv.
- **85 – Instabil:** Feuerrate und Energieeffizienz können sinken.
- **100 – Überhitzt:** mindestens ein Systemfehler wird ausgelöst; die stärkste Wärmequelle wird kurz deaktiviert.
- **über 100 durch Sonderregeln:** Selbstschaden, Kernschmelze oder verbotene Transformation.

### 7.3 Anti-Frust-Regeln

- Ein System darf nicht länger als drei Sekunden vollständig blockiert werden.
- Mehrere Deaktivierungen desselben Moduls besitzen abnehmende Dauer.
- Visuelle und akustische Warnung mindestens 1,2 Sekunden vor einem schweren Fehler.
- Keine sofortige tödliche Kernschmelze ohne vorherige erkennbare Eskalation.

## 8. Korruptionssystem

### 8.1 Bedeutung

Korruption ist die langfristige Risikoachse eines Runs. Sie steigt langsamer als Hitze und sinkt nur durch seltene Entscheidungen.

### 8.2 Schwellen

| Korruption | Auswirkung |
|---|---|
| 0–24 | stabil |
| 25–49 | korrumpierte Affixe können erscheinen |
| 50–74 | stärkere Gegner und erste verbotene Angebote |
| 75–99 | Elite-Modifikatoren eskalieren; schwere Transformationen |
| 100 | dauerhafter Run-Mutator; Abyss-Zugang oder Krisenereignis |
| über 100 | nur im Abyss oder durch Relikte; endlose Eskalation |

### 8.3 Quellen

- überlastete Reaktoren
- korrumpierte Module
- Anomalie-Ereignisse
- verbotene Evolutionen
- Wiederbelebung
- Abyss-Fortschritt
- bestimmte Händlerdienste

### 8.4 Gegenmaßnahmen

- Reinigung in Werkstätten
- Opfer eines Affixes
- Zerstörung eines Moduls
- seltene Null-Katalysatoren
- spezielle Schiffe oder Reaktoren

Korruption darf nie nur eine lineare Strafe sein. Jede Stufe eröffnet auch neue Belohnungen oder Build-Pfade.

## 9. Systemfehler

### 9.1 Prinzip

Fehler werden nicht in jedem Frame zufällig gewürfelt. Ein deterministischer Scheduler erzeugt Fehlerfenster anhand von:

- Überlastungsstufe
- aktueller Hitze
- Korruption
- Modulstabilität
- Fehlerresistenz
- internen Cooldowns

### 9.2 Fehlerklassen

**Leicht**
- Zielerfassung springt auf einen anderen Gegner.
- Projektilstreuung steigt kurz.
- Aktivmodul benötigt mehr Energie.
- Drohne pausiert.

**Mittel**
- Rakete detoniert früh.
- Mine wird in Spielnähe gelegt.
- Schild kehrt Schaden teilweise um.
- Strahl zieht den Spieler leicht an.

**Schwer**
- Modul deaktiviert sich.
- Void-Projektil kann reflektieren.
- Drohne wird kurz feindlich.
- Reaktor entlädt Energie als gefährliche Zone.

### 9.3 Charakteristische Fehler

Jede Komponentenfamilie besitzt eigene Fehler. Dadurch fühlt sich Überlastung nicht wie eine generische Debuff-Leiste an.

## 10. Evolutionen und Transformationen

### 10.1 Reguläre Evolution

Voraussetzungen:

- definierte Kernkomponente
- Mindestwerte bestimmter Tags
- gegebenenfalls ein Evolutionskatalysator
- bekannte Voraussetzungen im UI

### 10.2 Alternative Evolution

Eine Waffenfamilie kann zwei reguläre Endformen besitzen. Die Auswahl hängt von Tags, Affixen und aktiven Modulen ab.

### 10.3 Verbotene Transformation

Voraussetzungen können enthalten:

- Korruption über 50 oder 75
- Last über 130 %
- bestimmtes Relikt
- Konflikt zweier Tags
- Abschluss eines Risikoereignisses

Vor der Entdeckung zeigt das UI nur eine kryptische Signatur. Nach der ersten Aktivierung wird der vollständige Eintrag im Codex sichtbar.

### 10.4 Transformationsregeln

- Eine Primärwaffe besitzt maximal eine Endform gleichzeitig.
- Passive Systeme können zusätzliche Teil-Evolutionen besitzen.
- Eine verbotene Transformation darf eine reguläre Evolution ersetzen oder verzerren.
- Der Wechsel muss bestätigt werden, wenn er einen permanenten Nachteil erzeugt.

## 11. Affixe

### 11.1 Seltenheiten

| Seltenheit | Affixe | Sockel | Besonderheit |
|---|---:|---:|---|
| Gewöhnlich | 0–1 | 0 | klare Basisversion |
| Ungewöhnlich | 1 | 0–1 | kleiner Build-Impuls |
| Selten | 2 | 0–1 | gezielte Synergie |
| Episch | 3 | 1 | starke Kombination |
| Legendär | 3 | 1–2 | einzigartiger Modifikator |
| Einzigartig | fest | variabel | handgeschriebene Regel |

### 11.2 Affix-Pools

Affixe werden gewichtet nach:

- Komponentenfamilie
- bestehenden Tags
- Seltenheit
- Sektor
- Korruption
- Spielerfreischaltungen

Unpassende Affixe sind möglich, aber selten. Sie dienen als Material für ungewöhnliche Theorycrafting-Builds.

### 11.3 Affix-Manipulation

- ein Affix neu würfeln
- ein Affix sperren
- Wertebereich erhöhen
- Affix in einen Sockel extrahieren
- Affix korrumpieren
- zwei Affixe verschmelzen

Jede Methode besitzt Kosten und Grenzen, damit perfektes Loot nicht beliebig erzeugt werden kann.

## 12. Sockel und Chips

Sockel enthalten gezielte Modifikatoren. Chips verändern bevorzugt Verhalten statt nur Prozentwerte.

Beispiele:

- **Echo-Chip:** jeder dritte Effekt wird wiederholt.
- **Thermal Vent:** Überhitzen erzeugt eine Schadenswelle.
- **Hunter Kernel:** Zielpriorität wechselt auf Eliten.
- **Mirror Shard:** Projektile können sich spiegeln.
- **Null Seal:** reduziert Korruption, blockiert aber verbotene Evolutionen.
- **Blood Circuit:** Heilung lädt aktive Module.

## 13. Aktive Module

Zwei aktive Slots stehen zur Verfügung.

Unterstützte Ressourcenmodelle:

- fester Cooldown
- Energieverbrauch
- Hitzeerzeugung
- Aufladung durch Kills
- Aufladung durch kritische Treffer
- Aufladung durch Bewegung
- Aufladung durch erlittenen Schaden
- Korruptionskosten
- Verbrauch einer beschworenen Einheit
- begrenzte Ladungen pro Sektor

Jedes Modul muss klar anzeigen:

- Auslösekosten
- aktuelle Bereitschaft
- Synergie-Tags
- Auswirkungen der Überlastung
- möglichen Systemfehler

## 14. UI-Anforderungen

### 14.1 HUD

Zusätzlich zum bestehenden HUD:

- Energieanzeige
- Hitzebalken
- Korruptionsanzeige
- zwei aktive Modulschaltflächen
- Ausweich-Cooldown
- kompaktes Synergieband
- Warnsymbol für den nächsten wahrscheinlichen Fehler

### 14.2 Build-Inspektor

Im Pausemenü:

- vollständige Werte
- Quellen jedes Werts
- aktive Tags
- erfüllte Synergien
- fast erfüllte bekannte Evolutionen
- aktuell mögliche verbotene Signaturen
- Energieverbrauch pro Komponente
- Wärmequellen
- Fehlerwahrscheinlichkeit pro Minute

### 14.3 Upgrade-Karten

Jede Karte zeigt:

- Kernwirkung
- neue und verstärkte Tags
- direkte Wertänderung
- Einfluss auf Energie, Hitze und Korruption
- neu aktivierte Synergien
- Evolutionsfortschritt
- Warnung bei einem neuen Konflikt

## 15. Balancingregeln

- Multiplikative Schadensboni erhalten ab einem definierten Punkt abnehmenden Grenznutzen.
- Kritische Trefferchance wird regulär bei 100 % begrenzt; Überkrits skalieren kontrolliert den Multiplikator.
- Abklingzeitreduktion besitzt eine Mindestgrenze.
- Bildschirmfüllende Effekte erhalten eine globale Projektil- und Partikelbegrenzung.
- Heilung durch Treffer besitzt pro Sekunde ein Cap.
- Beschwörungen besitzen ein aktives Einheitenbudget.
- Kontroll-Effekte gegen Bosse verwenden Widerstand statt vollständiger Immunität.
- Keine Synergie darf ohne Gegenbau unbegrenzte Trigger-Schleifen erzeugen.

## 16. Fehlerbehandlung

- Ungültige Definitionen werden beim Start validiert und deaktiviert.
- Fehlende Referenzen verwenden eine sichtbare Platzhalterdefinition.
- Ein Effektfehler darf nicht die Hauptschleife stoppen.
- Triggerketten besitzen eine maximale Tiefe.
- Save-Daten speichern Definition-ID und Instanzdaten getrennt.
- Unbekannte alte Affixe werden als inaktive Legacy-Einträge erhalten, nicht gelöscht.

## 17. Tests

### 17.1 Unit-Tests

- Wertreihenfolge
- Tag-Intensitäten
- Synergieaktivierung
- Evolutionsvoraussetzungen
- Überlastungsstufen
- Hitzeabkühlung
- Korruptionsschwellen
- Fehler-Scheduler
- Affixgewichtung
- Trigger-Cooldowns
- Schleifenschutz

### 17.2 Simulationstests

Mindestens 10.000 deterministische Auto-Runs pro Balance-Build:

- durchschnittlicher Schaden
- Überlebenszeit
- Evolutionsrate
- Häufigkeit schwerer Fehler
- Häufigkeit verbotener Transformationen
- Nutzung der Waffenfamilien
- Dominanz einzelner Affixe

### 17.3 Abnahmekriterien

- Ein Build mit mindestens 20 aktiven Modifikatoren bleibt vollständig erklärbar.
- Gleicher Seed plus gleiche Entscheidungen erzeugen denselben Run.
- Keine unendliche Triggerkette.
- Energie, Hitze und Korruption reagieren innerhalb eines Frames korrekt.
- Bekannte Evolutionen zeigen korrekte Voraussetzungen.
- Geheime Transformationen werden erst nach Entdeckung vollständig offengelegt.
- Bestehende fünf Evolutionen können über die neue Engine abgebildet werden.

---

# SPEZIFIKATION 2: LOADOUTS UND AUSRÜSTUNG

## 1. Ziel

Diese Spezifikation definiert den Hangar, die Schiffe, Waffenfamilien, Reaktoren, passiven und aktiven Module, Item-Instanzen, Blaupausen, Forschung, Affixe, Sockel und Prototypen.

## 2. Pre-Run-Loadout

Ein Loadout enthält:

- 1 Schiff
- 1 Primärwaffe
- 1 Reaktorkern
- 4 passive Modulplätze
- 2 aktive Modulplätze
- 2 Utility-Slots
- 1 Reliktplatz, nach Freischaltung 2
- 1 kosmetisches Profil ohne Spielwert

Slots besitzen keine feste Energiebeschränkung. Die Summe aller Komponenten bestimmt die Überlastung.

## 3. Schiffe

Die Zahlen sind Startwerte für Prototyping und werden nach Simulation angepasst.

### 3.1 VESPER – Standardjäger

- Hull: 100
- Geschwindigkeit: 190
- Energie: 100
- Kühlung: 10/s
- Signatur: Der erste Tag jeder Kategorie erhält +1 Intensität.
- Nachteil: keine extreme Spezialisierung.
- Rolle: Einstieg und flexible Hybrid-Builds.

### 3.2 BASTION – Belagerungsrahmen

- Hull: 150
- Geschwindigkeit: 150
- Energie: 115
- Kühlung: 8/s
- Signatur: Stillstand erzeugt Panzerung und Rückstoßresistenz.
- Nachteil: Ausweichen hat längeren Cooldown.
- Rolle: Tank, Minen, Strahlen, schwere Raketen.

### 3.3 SPECTER – Phasenjäger

- Hull: 75
- Geschwindigkeit: 225
- Energie: 90
- Kühlung: 12/s
- Signatur: Ausweichen garantiert kurzzeitig kritische Treffer.
- Nachteil: erlittene Treffer erhöhen Hitze.
- Rolle: Railgun, Klingen, kritische Trigger.

### 3.4 FURNACE – Thermalkreuzer

- Hull: 115
- Geschwindigkeit: 170
- Energie: 120
- Kühlung: 6/s
- Signatur: Hohe Hitze verstärkt Plasma- und Explosionsschaden.
- Nachteil: Überhitzen verursacht stärkere Fehler.
- Rolle: Plasma, Raketen, Hitze-Builds.

### 3.5 RELIQUARY – Void-Gefäß

- Hull: 90
- Geschwindigkeit: 180
- Energie: 110
- Kühlung: 9/s
- Signatur: Korruptionsschwellen gewähren zusätzliche Relikt-Effekte.
- Nachteil: Reinigung ist weniger effektiv.
- Rolle: Void, Anomalie, verbotene Evolutionen.

### 3.6 SHEPHERD – Drohnenträger

- Hull: 105
- Geschwindigkeit: 165
- Energie: 125
- Kühlung: 9/s
- Signatur: +2 Beschwörungsbudget; Drohnen teilen Affixe.
- Nachteil: direkte Primärwaffe verursacht weniger Basisschaden.
- Rolle: Drohnen und Naniten.

### 3.7 HARROW – Reaper-Chassis

- Hull: 125
- Geschwindigkeit: 185
- Energie: 85
- Kühlung: 11/s
- Signatur: Nahbereichs-Kills heilen und laden aktive Module.
- Nachteil: Fernkampfreichweite reduziert.
- Rolle: Klingen, Orbitalsysteme, Lebensraub.

### 3.8 VECTOR – Beschleunigungsrahmen

- Hull: 85
- Geschwindigkeit: 245
- Energie: 95
- Kühlung: 13/s
- Signatur: Bewegung erzeugt Ladung und reduziert Hitze.
- Nachteil: Stillstand reduziert Schaden.
- Rolle: Arc, Railgun, bewegungsbasierte Module.

### 3.9 GRAVEWRIGHT – Feldkonstrukteur

- Hull: 110
- Geschwindigkeit: 160
- Energie: 115
- Kühlung: 9/s
- Signatur: Minen, Zonen und Beschwörungen halten länger.
- Nachteil: direkte Projektile fliegen langsamer.
- Rolle: Minen, Naniten, Gebietskontrolle.

### 3.10 NULL CHOIR – Experimentalschiff

- Hull: 80
- Geschwindigkeit: 175
- Energie: variabel 80–140 pro Sektor
- Kühlung: variabel
- Signatur: Ein Loadout-Slot erhält pro Sektor eine zufällige Regeländerung.
- Nachteil: schwer planbare Stabilität.
- Rolle: Anomaly Engine und extreme Theorycrafting-Builds.
- Freischaltung: geheime Blaupause und Bergungsmission.

## 4. Primärwaffen-Familien

Jede Familie besitzt eine Basiswaffe, mindestens zwei reguläre Evolutionen und eine verbotene Transformation.

### 4.1 RAILGUN

**Basis:** präzise Hochgeschwindigkeitsprojektile.  
**Tags:** Projectile, Kinetic, Critical, Pierce.

- **Prism Lance:** Multishot + Projektilgeschwindigkeit; durchdringt alle Ziele und refraktiert bei Kills.
- **Event Horizon Driver:** Pierce + Control + Void; jeder Durchschlag zieht Gegner zur Flugbahn.
- **Fractured Lance:** hohe Korruption; Projektile zerbrechen in rückkehrende Splitter und können den Spieler treffen.

### 4.2 PLASMA CASTER

**Basis:** langsame Projektile mit Hitze und Brandflächen.  
**Tags:** Projectile, Plasma, Burn, Heat, Explosive.

- **Solar Kiln:** Brandstapel explodieren bei Maximalwert.
- **Cinder Bloom:** Kills erzeugen wachsende Plasmazonen.
- **Star-Eater:** überhitzte Schüsse verbrauchen eigene Hull, wachsen aber unbegrenzt bis zum Treffer.

### 4.3 MISSILE BATTERY

**Basis:** zielsuchende Salven mit Verzögerung.  
**Tags:** Projectile, Homing, Explosive, Heat.

- **Seraph Barrage:** viele kleine Raketen markieren Ziele und fokussieren Eliten.
- **Chain Cataclysm:** Explosionen lösen Sekundärsalven aus.
- **Judas Swarm:** korrumpierte Raketen wechseln gelegentlich das Ziel und können danach massiv verstärkt zurückkehren.

### 4.4 DRONE CORE

**Basis:** autonome Kampfdrohnen in Formationen.  
**Tags:** Drone, Summon, Energy.

- **Aegis Constellation:** Drohnen fangen Projektile ab und bilden Schilde.
- **Predator Mesh:** Drohnen markieren und zerlegen Einzelziele.
- **Orphan Protocol:** zerstörte Drohnen werden aggressiver, können aber kurzzeitig feindlich werden.

### 4.5 ARC GENERATOR

**Basis:** Kettenblitze zwischen Gegnern.  
**Tags:** Arc, Chain, Shock, Energy.

- **Thunder Crown:** Blitze springen über den Spieler und verstärken sich durch Bewegung.
- **Neural Storm:** geschockte Gegner übertragen Debuffs und kritische Treffer.
- **Blackout Gospel:** deaktiviert zufällig eigene Module, erzeugt dafür globale Blitzstürme.

### 4.6 VOID BEAM

**Basis:** kontinuierlicher Strahl mit steigender Intensität.  
**Tags:** Beam, Void, Corruption, Control.

- **Erasure Ray:** beseitigt schwache Gegner unter einer Lebensschwelle.
- **Graviton Scalpel:** schmaler Strahl zieht Gegner in seine Achse.
- **Mouth of Nothing:** öffnet einen Riss am Strahlende, der alles einschließlich Pick-ups verschlingt.

### 4.7 MINE LAYER

**Basis:** legt automatisch Minen entlang der Bewegungsroute.  
**Tags:** Mine, Explosive, Control, Cooldown.

- **Quantum Lattice:** Minen verbinden sich mit Schadenslinien.
- **Funeral Orbit:** ungezündete Minen beginnen um den Spieler zu kreisen.
- **Friendly Fire Doctrine:** Minen verursachen extremen Schaden, besitzen aber volle Eigengefährdung.

### 4.8 REAPER BLADES

**Basis:** rotierende oder zurückkehrende Nahkampfklingen.  
**Tags:** Orbit, Kinetic, Bleed, Critical.

- **Blood Halo:** Treffer heilen; Klingen wachsen.
- **Guillotine Array:** Klingen führen Hinrichtungen gegen geschwächte Gegner aus.
- **Cannibal Crown:** Klingen verbrauchen beschworene Einheiten und erhalten deren Affixe.

### 4.9 NANITE SWARM

**Basis:** infiziert Gegner und repliziert sich.  
**Tags:** Summon, Corrosion, Chain, Sacrifice.

- **Grey Bloom:** Infektion springt bei Tod weiter und erzeugt Wolken.
- **Symbiotic Armor:** ein Teil des Schwarms schützt und repariert den Spieler.
- **Replication Plague:** der Schwarm kopiert Gegnerfähigkeiten, kann aber unkontrollierbar mutieren.

### 4.10 ANOMALY ENGINE

**Basis:** erzeugt pro Salve eine regelverändernde Anomalie.  
**Tags:** Anomaly, Echo, Corruption, variabel.

- **Probability Engine:** zufällige Effekte werden gewichtet und können gespeichert werden.
- **Mirror Collapse:** kopiert die zuletzt ausgelöste Fähigkeit.
- **Unwritten Weapon:** löscht für einen Sektor eine Kernregel und ersetzt sie durch eine unbekannte.

## 5. Reaktorkerne

Mindestens zwölf Reaktoren im Vollausbau.

Beispiele:

- **Standard Core:** ausgeglichene Kapazität und Kühlung.
- **Furnace Heart:** hohe Kapazität, geringe Kühlung, Hitze-Boni.
- **Cold Star:** starke Kühlung, reduzierte aktive Energie.
- **Grave Battery:** lädt sich durch Kills.
- **Blood Dynamo:** Energie durch Hull-Verlust.
- **Void Crucible:** hohe Kapazität, stetige Korruption.
- **Pulse Reactor:** niedrige Dauerleistung, starke Energieimpulse.
- **Hive Core:** Energie skaliert mit Beschwörungen.
- **Entropy Coil:** Affixe werden stärker, Werte schwanken.
- **Mirror Core:** kopiert einen Modulverbrauch.
- **Null Reactor:** blockiert Korruption, verhindert verbotene Evolutionen.
- **Abyssal Heart:** wächst im Abyss und kann nicht normal extrahiert werden.

## 6. Modulbestand

Zielumfang: mindestens 120 Module.

| Kategorie | Anzahl |
|---|---:|
| offensive passive Module | 30 |
| defensive passive Module | 20 |
| Utility-Module | 20 |
| aktive offensive Module | 15 |
| aktive defensive Module | 10 |
| aktive Kontrollmodule | 10 |
| korrumpierte Module | 10 |
| einzigartige Reliktmodule | 5 |
| **Gesamt** | **120** |

### 6.1 Beispielmodule

**Offensiv**
- Splitter Matrix
- Kritischer Resonator
- Explosionsverdichter
- Kettenleiter
- Scharfschützenkern
- Hinrichtungsprotokoll

**Defensiv**
- Phasenschild
- Reaktive Panzerung
- Nanitreparatur
- Notkühlung
- Schadensumleiter
- Letzte Barriere

**Utility**
- Gravitationstrichter
- Zielprioritätskern
- Schrottscanner
- Affixverstärker
- Bewegungsbatterie
- Extraktionssender

**Aktiv**
- Zeitstopp
- Reaktorentladung
- Teleportsprung
- Schildimpuls
- Drohnenübernahme
- Minen-Fernzündung
- Gravitationsanker
- Opferkaskade
- Void-Tor
- Thermischer Auslass

**Korrumpiert**
- Schwarzes Herz
- Flüsternder Zielkern
- Parasitäre Kühlung
- Umgekehrter Schild
- Hungernder Sockel
- Gebrochener Timer

## 7. Item-Instanzen

Eine Item-Definition beschreibt die Identität. Eine Item-Instanz speichert:

```text
instanceId
definitionId
rarity
itemPower
affixes[]
sockets[]
corruptionLevel
stability
prototypeStatus
boundRunId
discoveredAt
```

## 8. Forschung und Freischaltungen

### 8.1 Grundwaffen

Vier Waffen sind früh über Void Shards erforschbar:

- Railgun
- Plasma Caster
- Missile Battery
- Reaper Blades

### 8.2 Erweiterte Waffen

Über Herausforderungen:

- Drone Core
- Arc Generator
- Mine Layer

### 8.3 Exotische Waffen

Über Blaupausen und Ereignisse:

- Void Beam
- Nanite Swarm
- Anomaly Engine

### 8.4 Forschungskosten

Forschung benötigt Kombinationen aus:

- Void Shards
- Waffenfragmenten
- Bosskernen
- Anomaliedaten
- Challenge-Siegeln

Keine einzelne Ressource darf alle Freischaltungen dominieren.

## 9. Hangar-UI

Tabs:

1. Run starten
2. Loadout
3. Schiffe
4. Waffen
5. Module
6. Forschung
7. Prototypen
8. Codex
9. Herausforderungen

### 9.1 Loadout-Ansicht

- zentrale Schiffsansicht
- Slots um das Schiff
- Energiekapazität und Last
- erwartete Hitze
- Startkorruption
- aktive Tags
- bekannte Evolutionen
- Warnungen zu Konflikten
- Vergleich mit aktuell ausgerüstetem Gegenstand

### 9.2 Mobile Bedienung

- Slot-Liste statt komplexer Drag-and-drop-Pflicht
- große Auswahlkarten
- Filterchips
- Long-Press für Details
- Bestätigung bei zerstörerischen Aktionen

## 10. Prototypen

Prototypen sind extrahierbare Item-Instanzen mit ungewöhnlichen Affixen oder erhöhtem Item-Power-Wert.

Regeln:

- maximal drei Prototypen können gleichzeitig in einem Run markiert werden.
- Extraktionssender können dieses Limit erhöhen.
- Prototypen verbrauchen Lagerplätze.
- Prototypen können im Hangar repariert, zerlegt oder in Test-Runs verwendet werden.
- Daily Runs erlauben keine dauerhafte Nutzung eigener Prototypen.

## 11. Fehlerfälle

- Doppelte Instanz-ID wird beim Laden ersetzt und protokolliert.
- Fehlende Definition erzeugt ein Legacy-Wrack.
- Inventarüberlauf sendet Gegenstände in ein zeitlich unbegrenztes Bergungslager.
- Ein ausgerüstetes, später gesperrtes Item wird nicht gelöscht, aber deaktiviert.
- Forschung darf nie Shards abbuchen, bevor die Freischaltung erfolgreich gespeichert wurde.

## 12. Tests

- Loadout-Energie wird korrekt berechnet.
- Schiffspassive werden genau einmal angewendet.
- Affix-Pools erzeugen nur erlaubte Kombinationen.
- Blaupausen werden dauerhaft gespeichert.
- Prototypen werden nach erfolgreicher Extraktion übertragen.
- Daily Loadouts sind für alle Spieler seed-identisch.
- UI-Vergleiche zeigen tatsächliche Endwerte.
- Kein Gegenstand verschwindet bei Save-Migration.

## 13. Abnahmekriterien

- Zehn Waffenfamilien sind datengetrieben definiert.
- Mindestens acht Schiffe sind spielbar; Ziel sind zehn.
- Mindestens 120 Module sind im Content-Katalog vorgesehen.
- Jedes Loadout zeigt Energie, Hitze, Korruption und Tags vor dem Start.
- Jede Waffenfamilie besitzt zwei reguläre Evolutionen und eine verbotene Transformation.
- Forschung, Challenges und Blaupausen sind technisch getrennte Freischaltwege.
- Prototypen können extrahiert und später ausgerüstet werden.

---

# SPEZIFIKATION 3: RUN-STRUKTUR

## 1. Ziel

Ein Run soll nicht nur aus automatisch aufeinanderfolgenden Wellen bestehen. Er wird zu einer ungefähr 35-minütigen Kampagne mit taktischen Pfadentscheidungen, Umbauten, Risikoereignissen, Extraktion und einem optionalen endlosen Abyss.

## 2. Kernablauf

```text
Loadout
  -> Sektor 1
  -> Pfadwahl
  -> Sektor 2
  -> Zwischenboss
  -> Pfadwahl
  -> Sektor 3
  -> Extraktionsfenster
  -> Sektor 4
  -> Pfadwahl
  -> Sektor 5
  -> Kampagnen-Endboss
  -> Extrahieren oder Abyss
```

## 3. Zeitstruktur

Zielwerte:

- Einführung: 0–3 Minuten
- erste Build-Definition: 3–10 Minuten
- erste Evolution: 8–15 Minuten
- mittlere Build-Korrektur: 15–23 Minuten
- Endform: 23–32 Minuten
- Endboss: 32–35 Minuten
- Abyss: unbegrenzt

## 4. Sektorkarte

### 4.1 Aufbau

- gerichteter azyklischer Graph
- drei sichtbare Pfade pro Entscheidung
- zwei bis vier Knoten bis zum nächsten Boss
- keine Sackgassen
- Seed bestimmt Struktur und Inhalte
- mindestens ein Reparatur- oder Werkstattpfad pro zwei Sektoren
- Risiko und Belohnung werden vor der Wahl verständlich dargestellt

### 4.2 Knotentypen

**Combat**
- klassische Überlebenswelle
- garantierte Level-ups und Scrap

**Elite Hunt**
- ein oder mehrere Eliten
- erhöhte Affix- und Prototypchance

**Boss**
- definierter Boss mit garantierter Kernbelohnung

**Merchant**
- kaufen, verkaufen, sperren, reservieren

**Workshop**
- Affixe verändern, Sockel einsetzen, Energie umbauen, reparieren

**Anomaly**
- regelveränderndes Ereignis
- hohe Korruption oder seltene Blaupause

**Salvage Field**
- Ressourcen sammeln unter Zeitdruck

**Recovery**
- Hull, Hitze oder Korruption reduzieren

**Challenge**
- optionales Ziel mit besonderer Belohnung

**Extraction**
- ausgewählte Prototypen und Ressourcen sichern

## 5. Begegnungstypen

Jeder Kampfknoten wählt ein primäres Ziel:

- Überleben
- Zielgegner eliminieren
- Konvoi schützen
- Riss schließen
- Kontrollzonen halten
- Ressourcen bergen
- Boss schwächen
- Jagd auf einen Warper
- Minenfeld durchqueren
- endlose Gegner bis zur freiwilligen Evakuierung

Ziele dürfen die Bewegung und Build-Funktion verändern, ohne das Auto-Fire-Grundprinzip aufzugeben.

## 6. Regionen

Mindestens fünf visuelle und mechanische Regionen:

### 6.1 Shattered Approach

- klare Arena
- geringe Korruption
- Einführung in Pfadwahl
- Gegner: Chaser, Swarm, Orbiter

### 6.2 Furnace Expanse

- Hitzezonen
- Plasma- und Explosionsgegner
- Kühlung als Sektorressource

### 6.3 Grave Circuit

- Wracks, Drohnen, Bergungsfelder
- beschworene Gegner
- Prototyp- und Modulbelohnungen

### 6.4 Null Cathedral

- Sichtverzerrung
- Void-Strahlen
- hohe Korruptionsangebote

### 6.5 Architect’s Crown

- Endregion
- kombinierte Eliten
- wechselnde Arenaregeln
- finaler Kampagnenboss

## 7. Händler

### 7.1 Angebot

- drei bis fünf Module
- ein Reaktor oder eine Waffenvariante
- zwei Verbrauchsdienste
- ein seltenes korruptes Angebot

### 7.2 Dienste

- Affix neu würfeln
- Affix sperren
- Item verkaufen
- Prototyp markieren
- Hitze sofort entfernen
- Korruption gegen dauerhaften Fluch reduzieren
- nächstes Kartenfeld aufdecken

### 7.3 Preismodell

Run-Währung: **Scrap**  
Spezialwährung: **Flux**  
Permanente Währung: **Void Shards**

Shards werden nicht für normale Händlerkäufe verwendet. Dadurch konkurriert die langfristige Progression nicht direkt mit jedem Run-Kauf.

## 8. Werkstatt

Mögliche Aktionen:

- Module austauschen
- Energieverteilung ändern
- Reaktor übertakten
- Affix neu würfeln
- Affix sperren
- Sockel einsetzen
- Modul stabilisieren
- Modul absichtlich korrumpieren
- einen Systemfehler gegen einen anderen tauschen
- Prototyp extraktionsfähig machen

Jede Werkstatt besitzt begrenzte Aktionen. Zusätzliche Aktionen können über Module oder Meta-Forschung freigeschaltet werden.

## 9. Risikoereignisse

Ereignisse präsentieren immer:

- klare unmittelbare Kosten
- bekannte Belohnungskategorie
- mögliche unbekannte Folge
- Auswirkungen auf Korruption und Überlastung

Beispiele:

**The Choir Answers**
- +20 Korruption
- eine verbotene Upgrade-Auswahl
- späterer Elite-Angriff

**Cold Forge**
- Hitze dauerhaft reduziert
- ein zufälliges Modul verliert ein Affix

**Dead Pilot**
- Prototyp aufnehmen
- Wrack-Signal erzeugt stärkeren Boss

**Mirror Tax**
- aktives Modul wird dupliziert
- beide Kopien teilen denselben Fehler

## 10. Bossstruktur

### 10.1 Zwischenbosse

Alle ungefähr zehn Minuten.

- testen einzelne Build-Eigenschaften
- garantieren Evolutionskatalysator oder Reaktorkern
- besitzen keine vollständige Immunität gegen Kontroll-Builds

### 10.2 Kampagnen-Endboss

Arbeitstitel: **THE ETERNAL ARCHITECT**

Phasen:

1. Arena wird segmentiert.
2. Boss kopiert dominante Tags des Spielers.
3. Überlastung und Korruption erzeugen personalisierte Angriffe.
4. Finale Phase zwingt die Entscheidung zwischen stabilisieren und maximal überladen.

Der Boss soll den Build spiegeln, aber nicht hart kontern. Jede Waffenfamilie benötigt einen fairen Lösungsweg.

## 11. Extraktion

### 11.1 Extraktionsfenster

- nach Zwischenbossen
- an seltenen Kartenknoten
- nach dem Endboss
- jederzeit über ein seltenes aktives Modul

### 11.2 Ablauf

Standardextraktion:

1. Prototypen auswählen.
2. Sender aktivieren.
3. 45–75 Sekunden Holdout.
4. Bei Erfolg werden Gegenstände sofort permanent gespeichert.
5. Der Run kann danach beendet oder mit reduziertem Bonus fortgesetzt werden.

### 11.3 Risiko

- Abbruch ist möglich.
- Beschädigte Prototypen benötigen mehr Zeit.
- hohe Korruption verändert den Holdout.
- ein extrahierter Gegenstand kann im laufenden Run weiterverwendet werden, gilt aber als gesichert.

## 12. Abyss

### 12.1 Eintritt

Nach dem Kampagnen-Endboss:

- sicher extrahieren
- oder in den Abyss eintreten

### 12.2 Skalierung

Pro Tiefe:

- Gegnerleben und Schaden
- Elite-Dichte
- zusätzliche Elite-Modifikatoren
- Korruption
- Kartenverzerrungen
- Systemfehlerstärke
- Lootqualität
- Wrack-Signalchance

### 12.3 Abyss-Regeln

- jede fünfte Tiefe: Boss
- jede dritte Tiefe: Extraktionschance
- Korruption kann über 100 steigen
- verbotene Evolutionen erhalten zusätzliche Stufen
- nicht extrahierte Prototypen bleiben im Risiko
- Score verwendet Tiefe, Zeit, Bossanzahl und Build-Stabilität

## 13. Daily Seed

Daily Runs müssen vollständig fair vergleichbar sein:

- gleiches Startschiff oder definierte Auswahl
- identische Karte
- identische Angebote
- identische Gegnerzusammenstellung
- keine permanenten Prototypboni
- separate Daily-Forschung darf nur kosmetisch oder horizontal sein
- Ergebnis speichert Seed-Version und Content-Version

## 14. Checkpoints

- automatischer Checkpoint nur zwischen Sektoren
- kein Speichern mitten im Kampf
- Wiederaufnahme verwendet denselben Seed und vollständigen Run-Zustand
- Checkpoint wird nach Run-Ende gelöscht
- Daily Run kann nur einmal gleichzeitig aktiv sein

## 15. Schwierigkeitsgrade

**Initiate**
- geringere Gegnerdichte
- weniger Systemfehler
- kein Verlust gewöhnlicher Prototypen

**Standard**
- vorgesehene Balance

**Reaper**
- stärkere Elite-Synergien
- geringere Reparatur
- bessere Blaupausen

**Abyssal**
- Startkorruption
- zusätzliche Bossmechaniken
- hohe Prototypchance
- für Ranglisten geeignet

Schwierigkeit verändert nicht bloß Gegnerleben, sondern Risikoökonomie und Begegnungsmuster.

## 16. UI

### 16.1 Kartenansicht

Jeder Knoten zeigt:

- Typ
- Region
- Gefahr
- erwartete Belohnung
- Korruptionsänderung
- Händler- oder Werkstattdienste
- unbekannte Signaturen

### 16.2 Run-Zusammenfassung

Nach jedem Sektor:

- verursachter Schaden nach Quelle
- Heat-Spitzen
- aktive Synergien
- häufigste Systemfehler
- neue Codex-Einträge
- Prototypstatus
- nächster Evolutionsfortschritt

## 17. Fehlerfälle

- Kartengenerator garantiert mindestens einen gültigen Pfad.
- Nicht ladbare Knoten werden durch Combat ersetzt.
- Händler mit ungültigem Item ersetzt dieses ohne den Seed zu verändern.
- Checkpoint speichert atomar.
- Ein Absturz während Extraktion darf keine Duplikation erzeugen.
- Endboss und Abyss-Eintritt sind idempotente Zustandsübergänge.

## 18. Tests

- Kartengenerator erzeugt keine Sackgassen.
- jeder Seed ist reproduzierbar.
- alle Regionen besitzen gültige Begegnungen.
- Extraktion überträgt nur markierte Instanzen.
- Händlerpreise bleiben innerhalb definierter Bereiche.
- Werkstattaktionen verändern gesperrte Affixe nicht.
- Endboss ist mit jeder Waffenfamilie besiegbar.
- Checkpoint-Wiederaufnahme reproduziert Zustand und RNG.
- Abyss-Skalierung wächst monoton.

## 19. Abnahmekriterien

- Standardkampagne dauert im Median 30–40 Minuten.
- Mindestens drei Pfadentscheidungen beeinflussen jeden Run.
- Händler und Werkstatt erlauben eine erkennbare Build-Korrektur.
- Mindestens fünf Regionen und zehn Knotentypen sind definiert.
- Nach Endboss kann sicher extrahiert oder in den Abyss gewechselt werden.
- Daily Seed ist reproduzierbar und unabhängig von permanenten Ausrüstungswerten.
- Ein pausierter Run kann zwischen Sektoren zuverlässig fortgesetzt werden.

---

# SPEZIFIKATION 4: METAGAME

## 1. Ziel

Das Metagame gibt Runs langfristige Bedeutung, ohne die eigentliche Run-Entscheidung durch reine permanente Zahlenboni zu entwerten. Fortschritt soll hauptsächlich neue Optionen, Informationen und horizontale Spielweisen öffnen.

## 2. Persistenzschema

```text
saveVersion
profile
settings
currencies
research
unlockedShips
unlockedWeapons
unlockedModules
blueprints
prototypeInventory
wreckSignals
codex
challenges
achievements
statistics
dailyRecords
campaignRecords
abyssRecords
activeRunCheckpoint
migrationHistory
```

## 3. Ressourcen

### 3.1 Void Shards

- allgemeine Forschung
- Hangar-Erweiterungen
- frühe Waffenfreischaltungen
- keine normalen Run-Händlerkäufe

### 3.2 Boss Cores

- Reaktoren
- Schiffe
- Evolutionsforschung

### 3.3 Anomaly Data

- exotische Waffen
- geheime Codex-Analysen
- korrumpierte Werkstattoptionen

### 3.4 Challenge Seals

- Belohnung für definierte Spielleistungen
- freischalten spezielle Varianten und Kosmetik

### 3.5 Salvage Fragments

- Reparatur epischer und legendärer Prototypen
- Bergungsmissionen

## 4. Forschungsnetz

Fünf Hauptzweige:

### 4.1 Arsenal

- Waffenfamilien
- Startvarianten
- Waffen-Testkammer
- zusätzliche bekannte Evolutionen

### 4.2 Engineering

- Reaktoren
- Modulslots
- Werkstattaktionen
- Affixkontrolle

### 4.3 Navigation

- zusätzliche Karteninformationen
- neue Knotentypen
- Extraktionsoptionen
- Regionen

### 4.4 Void Studies

- Korruptionsanalyse
- verbotene Transformationen
- Anomalie-Waffen
- Abyss-Modifikatoren

### 4.5 Recovery

- Prototyplager
- Wrack-Signale
- Bergungsmissionen
- Reparatur und Versicherung

Forschung soll überwiegend Optionen öffnen. Reine permanente Schadensboni werden stark begrenzt.

## 5. Codex

### 5.1 Kategorien

- Schiffe
- Waffen
- Module
- Affixe
- Sockel
- Tags
- Synergien
- Evolutionen
- verbotene Transformationen
- Gegner
- Elite-Modifikatoren
- Bosse
- Regionen
- Ereignisse
- Systemfehler
- Relikte
- Wrack-Signale

### 5.2 Entdeckungsstufen

**Unbekannt**
- nur Silhouette oder Signal

**Beobachtet**
- Name und grobe Kategorie

**Analysiert**
- vollständige Werte und Voraussetzungen

**Gemeistert**
- zusätzliche Statistiken, Varianten oder kosmetische Belohnung

### 5.3 Build-Historie

Der Codex speichert erfolgreiche Kombinationen:

- verwendetes Schiff
- Waffe
- Evolution
- wichtigste Tags
- Abyss-Tiefe
- Run-Seed
- optionaler lokaler Build-Code

## 6. Herausforderungen

### 6.1 Kategorien

- Waffenmeisterschaft
- Schiffmeisterschaft
- Boss-Herausforderungen
- Risiko- und Korruptionsziele
- Extraktionsziele
- Build-Rätsel
- Daily-Aufgaben
- Langzeit-Meilensteine

### 6.2 Beispiele

- Besiege einen Boss mit mindestens 140 % Überlastung.
- Schließe einen Sektor ab, ohne unter 80 Hitze zu fallen.
- Aktiviere drei verbotene Synergien in einem Run.
- Extrahiere einen legendären Prototyp mit 75 Korruption.
- Besiege den Eternal Architect ohne Heilung.
- Erreiche Abyss-Tiefe 15 mit einer Mine-Layer-Waffe.
- Gewinne einen Run mit nur einer offensiven Komponente.

### 6.3 Belohnungen

- Waffenvarianten
- Schiffe
- Sockelchips
- Blaupausen
- Challenge Seals
- kosmetische Effekte
- Codex-Analysen

## 7. Prototypinventar

### 7.1 Lager

- Startkapazität: 20
- erweiterbar auf 100
- Filter nach Familie, Tags, Seltenheit, Stabilität und Herkunft
- Favoriten können nicht versehentlich zerlegt werden
- Duplikate lassen sich vergleichen

### 7.2 Nutzung

- als Startausrüstung
- in Testkammer
- als Material
- zur Affixextraktion
- für Bergungsmissionen
- zur Forschungsspende

### 7.3 Verschleiß

Normale Runs verbrauchen Prototypen nicht automatisch. Bestimmte korrumpierte oder Abyssal-Komponenten können jedoch Stabilität verlieren.

## 8. Verlust- und Bergungssystem

### 8.1 Gewöhnliche und seltene Prototypen

Nicht extrahiert und Run verloren:

- Gegenstand geht verloren.
- geringe Chance auf Salvage Fragments.

### 8.2 Epische Prototypen

- erzeugen Fragmente.
- Chance auf beschädigtes Wrack.
- Reparatur benötigt Ressourcen.

### 8.3 Legendäre und einzigartige Prototypen

- erzeugen garantiert ein Wrack-Signal.
- Gegenstand bleibt im Zustand `lost`.
- eine Bergungsmission wird freigeschaltet.
- Mission kann die ursprüngliche oder eine korrumpierte Version liefern.

## 9. Bergungsmissionen

### 9.1 Entstehung

Ein Wrack-Signal speichert:

```text
signalId
lostItemInstance
originRunSeed
region
corruptionAtLoss
killerType
expiresAfterRuns
missionModifiers
```

### 9.2 Missionsablauf

- spezieller Kartenpfad
- reduzierte freie Loadoutwahl oder definierte Einschränkung
- Gegner übernehmen Affixe des verlorenen Items
- Endgegner trägt den Prototyp
- Extraktion nach Bergung erforderlich

### 9.3 Ergebnisse

- vollständige Wiederherstellung
- beschädigte Wiederherstellung
- korrumpierte Verbesserung
- Verlust gegen große Menge Fragmente
- neue Blaupause statt Original

Legendäre Gegenstände verschwinden nicht kommentarlos, bleiben aber mit echtem Risiko verbunden.

## 10. Kampagnenpfade

Der Vollausbau enthält mehrere Kampagnenvarianten:

### 10.1 Architect Path

- ausgeglichener Standardpfad
- erklärt die Kernsysteme
- endet beim Eternal Architect

### 10.2 Furnace Path

- Hitze und Explosion
- alternative Bosse
- Reactor-Blueprints

### 10.3 Grave Path

- Drohnen, Wracks und Bergungen
- hohe Prototypdichte

### 10.4 Null Path

- Korruption und Anomalien
- verbotene Transformationen
- Zugang zum tiefen Abyss

Pfade werden schrittweise freigeschaltet und verwenden gemeinsame Regionen in anderer Reihenfolge und mit anderen Regeln.

## 11. Onboarding

### 11.1 Erste Runs

Run 1:
- Standard-Schiff
- Railgun
- keine Affixmanipulation
- klare reguläre Evolution

Run 2:
- zweites Schiff
- erster Händler
- Energie und Überlastung

Run 3:
- Werkstatt
- Hitze
- erstes aktives Modul

Run 4:
- Korruption
- erste geheime Signatur

Run 5:
- Extraktion und Prototyp

Komplexe Systeme werden freigeschaltet, nicht alle gleichzeitig eingeblendet.

## 12. Testkammer

Im Hangar kann ein Build ohne Belohnung getestet werden:

- frei wählbare Gegner
- DPS-Auswertung
- Hitzeverlauf
- Systemfehlerprotokoll
- Tag- und Synergieansicht
- Boss-Dummy
- kein Verbrauch von Prototypstabilität
- Seed für reproduzierbare Tests

## 13. Statistiken

- Runs
- Siege
- Todesursachen
- Waffenwahl
- Evolutionen
- Synergien
- maximale Überlastung
- höchste Hitze
- maximale Korruption
- extrahierte Prototypen
- verlorene Prototypen
- Abyss-Tiefe
- Bosszeiten
- Schaden nach Quelle

Statistiken dienen Spielern und Balancing. Eine externe Übertragung ist optional und standardmäßig deaktiviert.

## 14. Ranglisten

Erste Version lokal:

- Highscore
- Kampagnenzeit
- Abyss-Tiefe
- Daily Score
- Boss-Rush-Zeit

Eine spätere Online-Version benötigt:

- signierte Run-Daten
- Content-Version
- Seed-Version
- Plausibilitätsprüfung
- Datenschutzkonzept

Online-Ranglisten sind nicht Voraussetzung für den Vollausbau der vier Kernphasen.

## 15. Ökonomie und Anti-Grind

- erste neue Waffe innerhalb der ersten drei Runs erreichbar
- regelmäßige horizontale Freischaltung
- keine kostenpflichtige Währung
- keine zufälligen Echtgeldmechaniken
- Duplikate liefern gezielte Ressourcen
- erfolglose Runs geben Fortschritt, aber nicht dieselbe Effizienz wie erfolgreiche Extraktion
- wichtige Build-Funktionen werden nicht hinter extrem seltenen Drops versteckt
- geheime Inhalte benötigen Entdeckung, nicht bloß hunderte Wiederholungen

## 16. Save-Migration

### 16.1 Übernahme bestehender Daten

- Bestscore bleibt erhalten.
- Daily-Bestwerte bleiben erhalten.
- Shards bleiben erhalten.
- bestehende Meta-Upgrades werden in Forschungsgutschriften oder Legacy-Boni überführt.
- Achievements bleiben freigeschaltet.
- Total Kills und Total Runs bleiben erhalten.

### 16.2 Legacy-Boni

Bestehende permanente Werteboni werden nicht ersatzlos entfernt. Sie können:

- in kleine accountweite Startboni umgewandelt,
- als Forschungspunkte erstattet,
- oder als kosmetische Veteranenabzeichen markiert werden.

Die konkrete Umwandlung wird vor Implementierung in einer Migrationstabelle festgelegt.

## 17. Fehlerbehandlung

- Save wird vor jeder Migration gesichert.
- Migrationen sind wiederholbar und idempotent.
- beschädigte Teilbereiche werden isoliert zurückgesetzt.
- Währungen dürfen nie negativ werden.
- Belohnungen werden atomar gebucht.
- Challenges werden serverfrei anhand lokaler Run-Protokolle validiert; bei Online-Ranglisten zusätzlich extern.
- fehlende Codex-Einträge blockieren keine Ausrüstung.

## 18. Tests

- Migration alter Speicherstände.
- atomare Forschungskäufe.
- Challenge-Fortschritt.
- Wrack-Signal-Erzeugung.
- Bergungsmission mit Originalitem.
- Lagerüberlauf.
- Codex-Entdeckungsstufen.
- Testkammer ohne permanente Belohnung.
- Daily-Rekorde nach Content-Version.
- keine doppelte Belohnung nach Neuladen.

## 19. Abnahmekriterien

- bestehende Speicherstände können migriert werden.
- Forschung öffnet überwiegend neue Optionen statt nur mehr Schaden.
- Codex bildet alle Build-Regeln und Entdeckungen ab.
- legendäre verlorene Prototypen erzeugen eine Bergungsmission.
- mindestens vier Kampagnenpfade sind vorgesehen.
- Testkammer erklärt Schaden, Hitze und Fehler eines Builds.
- Challenge-System kann Waffen, Schiffe, Chips und Kosmetik freischalten.
- Meta-Fortschritt entwertet Daily Runs nicht.

---

# 5. Abhängigkeiten zwischen den Spezifikationen

| System | benötigt Build Engine | benötigt Loadouts | benötigt Run-Struktur | benötigt Metagame |
|---|---:|---:|---:|---:|
| Tags und Synergien | – |  |  |  |
| Affixe und Sockel | ja | – |  |  |
| Schiffe und Waffen | ja | – |  |  |
| Händler und Werkstatt | ja | ja | – |  |
| Extraktion | ja | ja | ja |  |
| Prototypen | ja | ja | ja | – |
| Codex | ja | ja | ja | – |
| Bergungsmissionen | ja | ja | ja | ja |
| Abyss | ja | ja | ja | ja |

---

# 6. Empfohlene Umsetzungsreihenfolge

## Phase 0 – Sichere Modularisierung

- bestehende Ein-Datei-Version in Module zerlegen
- Verhalten unverändert halten
- Regressionstests für Kernkampf
- Save-Versionierung einführen
- deterministische RNG-Grenzen definieren

## Phase 1 – Build Engine

- Stat- und Modifikatorpipeline
- Tag-System
- Energie und Überlastung
- Hitze
- Korruption
- Fehler-Scheduler
- Evolutionsregeln
- Build-Inspektor

## Phase 2 – Loadouts und Ausrüstung

- Schiffssystem
- Waffenadapter
- Reaktoren
- passive und aktive Module
- Affixe und Sockel
- Hangar
- Forschung und Blaupausen
- erste Prototypen

## Phase 3 – Run-Struktur

- Sektorkarte
- Begegnungsziele
- Händler
- Werkstatt
- Extraktion
- Regionen
- Endboss
- Abyss
- Checkpoints

## Phase 4 – Metagame

- vollständiger Forschungsbaum
- Codex
- Challenges
- Prototyplager
- Verlustregeln
- Wrack-Signale
- Bergungsmissionen
- Kampagnenpfade
- Testkammer

## Phase 5 – Content-Vollausbau

- 8–10 Schiffe
- 10 Waffenfamilien
- 120+ Module
- alle Evolutionen
- alle Regionen und Bosse
- Simulation, Balancing und Accessibility-Polish

---

# 7. Übergreifende Risikobewertung

## 7.1 Größtes technisches Risiko: Regelkombinationen

Gegenmaßnahme:

- feste Trigger-Tiefe
- registrierte Effekte
- deterministische Simulation
- automatische Build-Fuzz-Tests
- globale Effektbudgets

## 7.2 Größtes Designrisiko: Unlesbare Komplexität

Gegenmaßnahme:

- gestaffelte Freischaltung
- Build-Inspektor
- Karten zeigen konkrete Deltas
- Codex
- klare Kernidentität jedes Items
- seltene statt permanente Geheimhaltung

## 7.3 Größtes Content-Risiko: 120 Module

Gegenmaßnahme:

- zunächst Systemfamilien statt Einzelsonderfälle
- Modul-Templates
- Content-Validierung
- automatisierte Simulation
- feste Qualitätskriterien für jedes Modul

## 7.4 Größtes Balancingrisiko: Überlastung wird immer optimal

Gegenmaßnahme:

- Risiken skalieren nicht nur numerisch
- Fehler sind komponentenspezifisch
- stabile Builds erhalten eigene Vorteile
- bestimmte Bosse und Ziele belohnen Zuverlässigkeit
- Score berücksichtigt Stabilität und nicht nur Schaden

## 7.5 Größtes Progressionsrisiko: Meta-Power entwertet Runs

Gegenmaßnahme:

- horizontale Freischaltungen
- standardisierte Daily Runs
- begrenzte accountweite Zahlenboni
- stärkere Belohnung für Wissen, Optionen und Build-Kontrolle

---

# 8. Gesamt-Abnahmekriterien

Der vollständige Ausbau gilt als fachlich erreicht, wenn:

1. Ein Spieler vor dem Run aus mindestens acht Schiffen und zehn Waffenfamilien wählen kann.
2. Das Loadout aus Waffe, Reaktor, passiven, aktiven und Utility-Modulen besteht.
3. Überlastung Hitze, Korruption und komponentenspezifische Fehler erzeugt.
4. Builds über Tags, feste Evolutionen und verbotene Transformationen funktionieren.
5. Mindestens 120 Module im validierten Content-Katalog vorhanden sind.
6. Ein Standard-Run eine 30–40-minütige Kampagne mit Sektorkarte, Händler und Werkstatt bietet.
7. Der Endboss besiegt und anschließend der Abyss betreten werden kann.
8. Prototypen extrahiert, verloren, repariert und über Bergungsmissionen zurückgewonnen werden können.
9. Der Codex Regeln, Entdeckungen und Build-Historien verständlich dokumentiert.
10. Alte Speicherstände ohne Verlust zentraler Fortschrittsdaten migriert werden.
11. Daily Runs reproduzierbar und von permanenten Ausrüstungsvorteilen unabhängig sind.
12. Keine bekannte Triggerkombination eine unendliche Schleife, einen unkontrollierten Speicheranstieg oder einen blockierenden Fehler erzeugt.
13. Die Oberfläche auf Desktop und Touch vollständig bedienbar bleibt.
14. Komplexe Builds über Build-Inspektor, Tags und Wertquellen erklärbar bleiben.
15. Der Vollausbau nicht als monolithische Einmaländerung, sondern über freigabefähige Phasen umgesetzt wird.

---

# 9. Offene Punkte für die fachliche Freigabe

Die folgenden Detailentscheidungen sind bewusst noch nicht endgültig numerisch festgeschrieben:

- endgültige Startwerte und Energiekosten aller Komponenten
- genaue Anzahl der Slots pro Schiffsvariante
- finale Namen einzelner Schiffe, Regionen und Bosse
- konkrete Migrationswerte bestehender Meta-Upgrades
- exakte Drop-Raten
- Online-Ranglisten und Backend
- finale Content-Menge zum ersten öffentlichen Release

Diese Punkte blockieren nicht die Architektur oder die vier Spezifikationen. Sie werden in der Umsetzungsplanung als Balance- und Content-Arbeitspakete behandelt.
