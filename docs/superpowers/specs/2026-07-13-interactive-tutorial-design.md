# Interaktives Tutorial – Design

## Ziel

Voidreaper erhält ein vollständig interaktives, aber überspringbares Hybrid-Tutorial. Ein isolierter Grundlagenlauf vermittelt Steuerung und Kampf. Später freigeschaltete Systeme erklären sich kontextuell an ihren echten Oberflächen. Alle Kapitel sind jederzeit über eine Tutorialbibliothek wiederholbar.

Das Tutorial verwaltet ausschließlich Lernfortschritt. Freischaltungen und regulärer Spielfortschritt bleiben davon getrennt. Die fachliche Reihenfolge der Systeme folgt der [Master-Spezifikation](./voidreaper-master-spezifikation.md), insbesondere deren gestaffeltem Onboarding. Bestehende Validierungs- und Integrationsanforderungen bleiben gemäß [Master-Plan](../plans/2026-07-10-voidreaper-master-plan.md) verbindlich.

## Leitentscheidungen

- Hybrid aus einem interaktiven Grundlagenlauf und kontextuellen Kapiteln.
- Vollständige, aber gestaffelte Abdeckung der aktuell erreichbaren Spiel- und Hangarfunktionen.
- Gezielte Fokusführung: Andere Aktionen bleiben grundsätzlich möglich und werden nur blockiert, wenn sie den aktiven Lernschritt unmöglich machen würden.
- Gesamtes Tutorial und einzelne Kapitel sind überspringbar, pausierbar und jederzeit wiederholbar.
- Tutorialfortschritt verändert keine Unlocks.
- Aktionsschritte werden durch erfolgreiche fachliche Ergebnisse bestätigt, nicht durch bloße Klicks oder Tastendrücke.

## Architektur

### Deklarative Kapiteldefinitionen

Tutorialinhalte werden als deklarative Kapitel mit stabilen Kapitel- und Schritt-IDs definiert. Ein Schritt enthält:

- Titel und verständliche Erklärung;
- optional eine semantische Ziel-ID für ein echtes UI-Element;
- die erwartete erfolgreiche Aktion als semantisches Ereignis;
- optional eine Vorbedingung für die Verfügbarkeit;
- Hinweise für Tastatur und Maus sowie, falls relevant, Touch;
- eine Kennzeichnung als Erklär- oder Aktionsschritt.

Texte, Reihenfolge und Zieldefinitionen werden nicht in Spielstände kopiert. Dadurch können Korrekturen an Tutorialinhalten vorgenommen werden, ohne veraltete Definitionen im Save zu konservieren.

### Tutorial-Koordinator

Ein zentraler Tutorial-Koordinator verwaltet verfügbares Kapitel, aktiven Schritt, Modus, Pause, Überspringen und Abschluss. Er beobachtet den bestehenden Event-Bus und gleicht nur das erwartete Ereignis des aktiven Schritts ab.

Der Koordinator besitzt keine Spielregeln. Screens und Features führen ihre normalen Aktionen aus und melden nur nach erfolgreichem Ergebnis ein semantisches Ereignis. Fehlgeschlagene Käufe, ungültige Platzierungen oder abgebrochene Aktionen schließen keinen Schritt ab.

### UI-Anbindung

Echte Bedienelemente erhalten stabile `data-tutorial-id`-Markierungen. Ein gemeinsames Overlay findet das aktuelle Ziel, zeichnet einen Fokusrahmen und zeigt die Schrittkarte. Screens enthalten keine eigenen Fortschrittsautomaten.

Der Hangar erhält einen Bereich „Tutorials“. Er zeigt verfügbare, abgeschlossene und noch nicht entdeckte Kapitel und erlaubt Start sowie Wiederholung. „Noch nicht entdeckt“ blockiert nur das Tutorialkapitel; es ist keine neue Spielfreischaltung.

## Kapitel und Abdeckung

### 1. Grundlagen-Training

- Bewegung mit Tastatur beziehungsweise Touch-Stick;
- Zielen und Feuern;
- Ausweichen;
- aktive Module;
- Lebenspunkte, Schild, Energie, Hitze und Korruption;
- Pause, Fortsetzen und relevante Einstellungen;
- erster Gegner, Belohnung und Evolutionswahl.

### 2. Run-Navigation

- Sektorkarte und Informationsstufen;
- erreichbare, besuchte und gesperrte Knoten;
- Gefahren, Belohnungen und Routenbestätigung;
- Händlerkauf und Ressourcenknappheit;
- Werkstattaktionen und Aktionspunkte;
- Checkpoints und Fortsetzen eines Runs.

### 3. Schiff und Ausrüstung

- Loadout, Schiffe, Waffen, Reaktoren und Module;
- Last, Energiebedarf, Hitze und Synergien;
- Quick-Mount: Vorschlag wechseln, bestätigen und zurückstellen;
- Werkbank: Ports, Auswahl, Platzierung, Bewegung, Rotation, Demontage, Reparatur und Ansichtsmodi;
- Bauplan erstellen, aktivieren, duplizieren, importieren und exportieren.

### 4. Metafortschritt

- Forschung und Kosten;
- Prototypen und Stabilität;
- Codex und Filter;
- Herausforderungen;
- Kampagnenpfade;
- Bergung;
- Simulator mit reproduzierbarem Seed;
- Statistiken.

### 5. Fortgeschrittener Run

- Überlastung und Systemfehler;
- Korruption und Anomalien;
- Bossmechaniken;
- Extraktion, Run-Abschluss und Zusammenfassungen.

### 6. Bedienung und Barrierefreiheit

- Tastenbelegung;
- UI-Skalierung;
- reduzierte Bewegung, Zustandsmuster und weitere Anzeigeoptionen;
- Touch-spezifische Bedienung ausschließlich auf Touch-Geräten.

Das Grundlagen-Training wird neuen Profilen beim ersten Start angeboten. Kontextkapitel werden beim ersten Öffnen des zugehörigen, bereits verfügbaren Systems angeboten. Ein Angebot kann ignoriert oder pausiert werden.

## Interaktionsdesign

Das Tutorial-Overlay besteht aus einer kompakten Schrittkarte und einem sichtbaren Fokusrahmen um das echte Bedienelement. Eine eindeutige visuelle Verbindung ordnet Karte und Ziel einander zu. Die Karte positioniert sich automatisch so, dass Ziel, HUD und wichtige Spielfläche sichtbar bleiben.

Jeder Schritt erklärt:

- was die Funktion bewirkt;
- warum sie relevant ist;
- welche konkrete Aktion erwartet wird;
- welche Eingabe zum aktuellen Gerät passt;
- Kapitel- und Schrittfortschritt.

Die Karte bietet „Zurück“, „Hinweis“, „Pausieren“, „Kapitel überspringen“ und „Tutorial beenden“. „Weiter“ existiert nur bei Erklärschritten. Aktionsschritte wechseln automatisch nach dem erfolgreichen Ergebnis.

Andere Steuerelemente werden optisch zurückgenommen, bleiben aber grundsätzlich nutzbar. Eine kurzzeitige Sperre ist nur zulässig, wenn eine Aktion den Lernzustand zerstören würde, beispielsweise das Verlassen des isolierten Trainingskampfs. Die Sperre erklärt ihren Grund.

Fehlschläge werden nicht bestraft. Das Tutorial erklärt den Grund, behält den Schritt bei und lässt einen neuen Versuch zu. Verschwindet das Ziel durch Navigation oder Re-Rendering, pausiert der Schritt und bietet eine konkrete Rückkehraktion an.

## Grundlagenlauf

Der Grundlagenlauf nutzt einen festen, reproduzierbaren und temporären Run-Zustand. Er verwendet die echten Steuerungs-, Kampf- und UI-Pfade, aber keine dauerhaften Belohnungs- oder Metafortschrittspfade.

Start, Abschluss, Abbruch und Wiederholung des Grundlagenlaufs verändern nicht:

- Währungen;
- Unlocks;
- Statistiken und Rekorde;
- Challenges;
- Checkpoints;
- gespeicherte Builds oder Baupläne;
- reguläre Kampagnenläufe.

Beim Verlassen wird der temporäre Zustand vollständig verworfen.

## Datenfluss

Eine erfolgreiche Tutorialaktion durchläuft folgende Kette:

1. Screen oder Spielsystem führt die normale Aktion aus.
2. Das Ergebnis wird fachlich bestätigt.
3. Das System sendet ein semantisches Ereignis über den vorhandenen Event-Bus.
4. Der Koordinator gleicht Ereignis und aktiven Schritt ab.
5. Bei Übereinstimmung speichert er den Lernfortschritt.
6. Das Overlay aktiviert und positioniert den nächsten Schritt.

Semantische Ereignisse erhalten stabile Namen und nur die für die Abschlussbedingung notwendigen Daten. Das Tutorial darf keine privaten Zustände von Screens über DOM-Text oder CSS-Klassen erraten.

## Persistenz und Migration

Die Save-Version wird von 5 auf 6 angehoben. Der neue Lernzustand hat diese Form:

```js
tutorial: {
  version: 1,
  autoOffer: true,
  active: null,
  completedChapters: {},
  skippedChapters: {},
  seenSteps: {}
}
```

`active` enthält Kapitel-ID, Schritt-ID und den Modus `guided` oder `replay`. Wiederholungsmodus und regulärer Lernfortschritt werden getrennt behandelt; eine Wiederholung entzieht keinen bestehenden Abschluss.

Die Migration erfüllt folgende Regeln:

- Jeder von Version 5 migrierte Spielstand erhält `tutorial.autoOffer = false`; `onboarding.skipped === true` bleibt damit ebenfalls respektiert.
- Alte bestätigte Run-Karten werden als `seenSteps["legacy-run-N"] = true` vermerkt, aber nicht als abgeschlossene interaktive Kapitel gewertet.
- Bestehende Profile werden dadurch nicht automatisch in das neue Tutorial versetzt.
- Neue Profile erhalten `autoOffer = true`.
- Bestehende Unlocks werden weder entfernt noch ergänzt.
- Die alte `onboarding`-Struktur wird nach der Migration nicht mehr gelesen oder geschrieben.
- Unbekannte oder veraltete gespeicherte Schritt-IDs fallen auf den ersten gültigen Schritt des Kapitels zurück.

Speicherfehler verwenden weiterhin die Warn- und Fehlerverträge des vorhandenen Save-Stores. Das Overlay darf lokal weiterlaufen, muss aber darauf hinweisen, dass der Lernfortschritt nicht dauerhaft gespeichert wurde.

## Barrierefreiheit und responsive Darstellung

- Alle Tutorialsteuerelemente sind per Tastatur erreichbar.
- Der sichtbare Fokus bleibt erhalten; während Kampfaktionen erzwingt das Overlay keinen Fokuswechsel.
- `aria-live` meldet Schrittwechsel und Fehlerhinweise, nicht jede Positionsänderung.
- Farbe ist nie der einzige Bedeutungsträger.
- Die bestehende Einstellung für reduzierte Bewegung deaktiviert beziehungsweise vereinfacht Tutorialanimationen.
- Automatische Positionierung bleibt bei UI-Skalierung und kleinen Touch-Viewports lesbar.
- Das Overlay erzeugt keinen horizontalen Seitenüberlauf.
- Touch-Hinweise erscheinen nur, wenn Touch-Bedienung relevant ist.

## Fehlerverhalten

- Ein fehlgeschlagenes fachliches Ergebnis lässt den Schritt aktiv und erklärt den Grund.
- Ein verschwundenes Ziel pausiert den Schritt und bietet eine Rückkehraktion.
- Ein noch nicht verfügbares Kapitel nennt in der Bibliothek die konkrete Entdeckungsbedingung.
- Eine unbekannte Kapitel-ID beendet den aktiven Zustand sicher und führt zur Tutorialbibliothek.
- Ein unbekannter Schritt fällt auf den ersten gültigen Schritt seines Kapitels zurück.
- Ein Speicherfehler wird sichtbar gemeldet und nicht als dauerhafter Abschluss ausgegeben.

## Teststrategie

Die Umsetzung folgt Test-Driven Development: Jeder neue fachliche Ablauf erhält zuerst einen fehlschlagenden Test, dann die kleinste Implementierung.

### Koordinator-Tests

Start, Pause, Fortsetzung, Zurück, Überspringen, Wiederholung, Vorbedingungen, Ereignisabgleich und sichere Fallbacks werden isoliert geprüft.

### Persistenztests

Defaults, Version-5-zu-6-Migration, alte `skipped`- und `completed`-Werte, unveränderte Unlocks, aktiver Schritt und Fallback veralteter IDs werden geprüft. Laden, Speichern und Exportpfade müssen dieselbe Form liefern.

### Komponententests

Overlay-Positionierung, Fokusrahmen, Tastaturbedienung, fehlendes Ziel, kleine Viewports, reduzierte Bewegung, sichere Textausgabe und gerätespezifische Hinweise werden geprüft.

### Integrations- und Browsertests

Jedes Kapitel wird an der echten Oberfläche durchlaufen. Die Tests bestätigen, dass bloße Eingaben nicht genügen, fehlgeschlagene Aktionen keinen Schritt abschließen und Wiederholungen weder Ressourcen noch Spielfortschritt verändern. Aktuelle Screenshots, sichtbarer Spielzustand und Browserkonsole werden kontrolliert.

## Akzeptanzkriterien

- Neue Spieler können das Grundlagen-Training mit Tastatur und Maus oder Touch vollständig abschließen.
- Alle festgelegten Kapitel sind in der Tutorialbibliothek sichtbar und detailliert beschrieben.
- Kontextkapitel erscheinen erst, wenn das zugehörige System verfügbar ist.
- Jeder Aktionsschritt bestätigt das tatsächliche Ergebnis statt nur eine Eingabe.
- Tutorial und einzelne Kapitel sind pausier-, überspring- und erneut startbar.
- Tutorialstatus und Unlocks bleiben vollständig getrennt.
- Ein Reload setzt ein aktives Kapitel am gespeicherten Schritt fort.
- Kein Overlay verdeckt sein Ziel oder erzeugt horizontalen Seitenüberlauf.
- Tastaturfokus, Screenreader-Meldungen, UI-Skalierung und reduzierte Bewegung funktionieren.
- Trainingsläufe verändern keine Währungen, Unlocks, Challenges, Statistiken, Checkpoints, Builds oder Baupläne.
- Alte Saves werden ohne Inhaltsverlust migriert und nicht automatisch bedrängt.
- Die Browserkonsole bleibt während der geprüften Kapitel frei von neuen Fehlern.
- `npm test`, `npm run test:frontend` und `npm run build` bestehen.
