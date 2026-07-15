# Live-Playtest Integration Fixes Design

## Ziel

Der reale Nutzerfluss von Kampagnenfortschritt bis zum ausgerüsteten Schiff soll ohne technische Save-Manipulation funktionieren. Forschung schaltet Schiffe und Waffen frei; im Run gefundene Module werden erst durch eine erfolgreiche Extraktion als Komponenten-Blaupausen dauerhaft verfügbar.

## Umfang

- Ein Kampagnenknoten darf nur einen tatsächlich pausierten Kampagnenkampf fortsetzen. Ein beendeter oder abgebrochener Standardlauf startet keinen Kampagnenknoten mit alten Wellen-, Score- oder Killwerten.
- Nach Game Over und Rückkehr in den Hangar zeigen Shards, Gesamtkills und Runs sofort den aktuellen Laufstand.
- Der Loadout-Bildschirm zeigt Spielernamen aus den Equipment-Definitionen statt interner IDs.
- `save.blueprints[definitionId]` ist ein dauerhafter Unlock für die passende Komponenten-Definition.
- Eine erfolgreiche Kampagnenextraktion speichert für jede im Run-Inventar vorhandene Moduldefinition genau eine Komponenten-Blaupause. Schiff, Waffe und Reaktor werden davon nicht betroffen.
- Bereits vorhandene Blaupausen werden nicht überschrieben.

## Architektur und Datenfluss

`campaign-reward-service.js` bleibt Eigentümer der Kampagnenbelohnungen. Seine neue Extraktionsoperation sammelt eindeutige Modul-Definitionen aus dem Run-Inventar und schreibt sie über den bestehenden Save-Store nach `save.blueprints`. Danach lädt `bootstrap.js` den Meta-Save neu und hydriert den Unlock-Service aus expliziten Unlock-Flags plus Blaupausen-IDs.

Die Entscheidung, ob ein Kampf fortgesetzt werden darf, wird als reine Funktion in `click-path-flows.js` testbar gemacht. Nur `game.state === "sector-map"` mit lebendem Standard-Spieler und bestehender Welle gilt als fortsetzbarer Kampagnenkampf.

Die Hangar-Synchronisierung übernimmt ebenfalls ein kleiner Helper in `click-path-flows.js`. Er kopiert ausschließlich die bereits autoritativen Legacy-Laufwerte in das im Speicher gehaltene Meta-Modell, bevor der Hangar rendert.

`loadout-screen.js` bildet eine ID-zu-Name-Tabelle aus `inspection.sources`. Slots behalten IDs für technische Aktionen und ARIA-Eindeutigkeit, zeigen aber den Spielernamen an.

## Fehlerverhalten

- Eine Extraktion ohne Module ist erfolgreich, erzeugt aber keine Blaupausen.
- Unbekannte oder nicht modulare Definitionen im Inventar werden ignoriert.
- Schlägt das Speichern der Extraktion fehl, wird der Knoten nicht als erfolgreich abgeschlossen dargestellt; der bestehende Toast-/Fehlerpfad meldet den Fehler.
- Doppelte Moduldefinitionen erzeugen nur einen Blueprint-Eintrag.

## Verifikation

- Fokussierte Node-Tests für Kampagnenfortsetzung, Hangar-Synchronisierung, Blueprint-Hydrierung und Extraktionspersistenz.
- Frontend-Test für sichtbare Komponentennamen im Loadout.
- Vollständige Tests und `npm run build`.
- Live-Browsertest ohne technische Save-Änderung: Ressourcen erspielen, zwei Schiffe und vier Waffen über Forschung freischalten, drei Modul-Blaupausen durch Kampagnenextraktion erhalten, neues Schiff ausrüsten und einen Kampf mit diesem Loadout starten.

