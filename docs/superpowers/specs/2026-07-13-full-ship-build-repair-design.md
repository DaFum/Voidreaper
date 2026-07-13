# Vollständiger Schiffsausbau – Integrationsreparatur

## Kontext

Diese Delta-Spezifikation ergänzt die bestehende [VOIDREAPER Master-Spezifikation](voidreaper-master-spezifikation.md), den [Phase-2-Plan für Loadouts und Ausrüstung](../plans/2026-07-10-voidreaper-phase-2-loadouts-equipment.md) und den [Masterplan für adaptive Schiffsmontage](../plans/2026-07-10-adaptive-ship-assembly-master.md). Sie ändert deren fachliche Ziele nicht, sondern schließt drei im Browser reproduzierte Integrationslücken:

1. Hangar-Auswahl und primäres Loadout sind nicht funktional verbunden.
2. Kampfknoten zeigen Modulbelohnungen an, vergeben sie aber nicht.
3. Das DEV-Szenario `maximum-construction` umgeht die Montageverträge und erzeugt überlappende, schlecht bedienbare Konstruktionen.

## Zielzustand

Ein neuer oder migrierter Spielstand besitzt ein gültiges Starter-Loadout aus Vesper, Railgun und Standard Core. Der Spieler kann jeden freigeschalteten Gegenstand im Loadout-Bildschirm in einen passenden Slot einsetzen, ersetzen und entfernen. Änderungen werden sofort gespeichert und beim nächsten Run für Schiffsrahmen, Assembly und Buildwerte verwendet.

Abgeschlossene Kampf- und Elite-Knoten vergeben genau einmal die auf der Karte angekündigten Ressourcen und ein deterministisch aus dem Knoten-Seed erzeugtes, zum Knotentyp passendes Item. Das Item gelangt in das bestehende Run-Inventar und durchläuft ohne Sonderpfad Quick Mount oder Werkbank.

`maximum-construction` montiert bis zu 18 Segmente ausschließlich über dieselben Größen-, Montage-, Last-, Energie-, Asttiefen-, Kollisions-, Kernfreilegungs- und Segmentverträge wie die Werkbank. Diagnosebeschriftungen bleiben durch deterministische Entzerrung lesbar, und überlagerte Portziele dürfen keinen falschen Klickempfänger erzeugen.

## Architektur

### Persistentes Loadout

- `loadout-service.js` stellt eine einzige Starter-Loadout-Fabrik und die bestehende Slotvalidierung bereit.
- `resolvePrimaryLoadout` normalisiert fehlende Altstände, ohne gültige bestehende Loadouts zu überschreiben.
- Der Loadout-Bildschirm öffnet pro Slot eine gefilterte Auswahl aus freigeschalteten Definitionen. Auswahl und Entfernen werden über Callbacks an `bootstrap.js` gemeldet.
- `bootstrap.js` persistiert die Änderung über den vorhandenen Save Store, lädt `metaSave` neu und rendert den Hangar erneut.
- Katalogkarten sind nur dann Buttons, wenn eine echte Aktion angebunden ist. Reine Katalogansichten verwenden keine irreführende Auswahlsemantik.

### Run-Initialisierung

- Der Game Controller erhält das primäre Loadout über einen Provider und kopiert es in den neuen Run.
- Der gewählte Schiffsrahmen bestimmt das Assembly-Rootprofil.
- Waffe, Reaktor und Module werden als Item-Instanzen in das Run-Inventar übernommen und über die vorhandenen Assembly- und Kompatibilitätsdienste montiert.
- Migrierte unvollständige Loadouts fallen gezielt auf einzelne Starterkomponenten zurück; ein vollständiges gespeichertes Loadout wird nicht stillschweigend ersetzt.

### Knotenbelohnungen

- Ein kleiner Campaign-Reward-Service löst Belohnungen anhand von Knotentyp, Gefahr und Seed auf.
- `combat` vergibt Scrap plus ein gewöhnliches Modul, `elite` Flux plus ein seltenes Modul. Weitere Knotentypen behalten ihre bereits eigenen Oberflächen und Dienste.
- Der Reward-Service fügt das Item dem Run-Inventar hinzu und emittiert das bestehende Ereignis `run-item-acquired` mit dem besitzenden Run.
- Die Belohnung wird vor dem finalen Checkpoint geschrieben und ist über die besuchte Knoten-ID idempotent.

### Gültiger Vollausbau und lesbare Diagnose

- Die Maximum-Suche betrachtet freie Ports und Definitionen deterministisch, prüft jedes Paar mit `compatibility.evaluate` und montiert nur kompatible Kandidaten.
- Wenn kein gültiger Kandidat mehr existiert, endet das Szenario mit einem erklärenden Ergebnis statt Verträge zu umgehen.
- Ein reiner Layouthelfer verteilt Diagnosebeschriftungen mit einem Mindestabstand auf stabile Ankerpositionen. Darstellung und Klickflächen verwenden dieselben Geometriekoordinaten.

## Fehlerverhalten

- Gesperrte, unbekannte oder slotfremde Definitionen verändern weder Loadout noch Save und erzeugen einen verständlichen UI-Hinweis.
- Ein Reward-Fehler lässt den Knoten nicht als erfolgreich und gespeichert erscheinen.
- Fehlende kompatible Montageplätze lagern das Item über den vorhandenen Pending-/Workbench-Fluss ein.
- Das Debugszenario gibt bei Stillstand Segmentzahl und Grund zurück; es erzeugt keine absichtlich ungültige Geometrie.

## Verifikation

Für jede Fehlerklasse wird zuerst ein fokussierter Regressionstest geschrieben und mit der erwarteten Ursache rot ausgeführt. Danach folgen minimaler Fix und grüner fokussierter Test.

Die Endabnahme umfasst:

1. Neuer Spielstand zeigt ein gültiges Starter-Loadout.
2. Schiff, Waffe, Reaktor und alle Mehrfachslots lassen sich speichern, ersetzen und entfernen.
3. Ein Run übernimmt das gespeicherte Schiff und die montierbaren Komponenten.
4. Ein Kampf- und ein Elite-Knoten vergeben ihre Belohnung genau einmal und öffnen Quick Mount beziehungsweise lagern das Item ein.
5. `maximum-construction` erreicht 18 kollisionsfreie Segmente oder meldet nachvollziehbar, welcher harte Vertrag das verhindert.
6. Konstruktion, Struktur, Energie, Schaden und Flugprofil bleiben bei 18 Segmenten lesbar und bedienbar.
7. `npm test`, `npm run test:frontend`, `npm run build` und `git diff --check` laufen fehlerfrei.

