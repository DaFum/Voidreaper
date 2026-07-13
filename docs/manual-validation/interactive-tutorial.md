# Interaktives Tutorial – manuelle Abnahme

## Voraussetzungen

- Entwicklungsserver mit `npm run dev` starten.
- Für die Erstnutzerprüfung einen frischen lokalen Spielstand verwenden.
- Danach denselben Spielstand neu laden, um Persistenz und Wiederholung zu prüfen.

## Grundlagen-Training

1. Automatisches Angebot annehmen und Bewegung, Feuer, Ausweichen, Pause und Fortsetzen ausführen.
2. Einen Gegner besiegen, den tatsächlichen XP-Pickup einsammeln und eine Evolution wählen.
3. Prüfen, dass Abschluss, `ÜBERSPRINGEN` und `BEENDEN` den isolierten Trainingslauf verlassen und zum Hangar führen.
4. Training wiederholen und auf Touch prüfen, dass eine Stickbewegung den Bewegungsschritt abschließt.

## Gestaffelte Kapitel

1. Auf frischem Profil prüfen: Ausrüstung ist verfügbar; Forschung, Run-Navigation und Fortgeschrittener Run sind gesperrt.
2. Sektorkarte öffnen: Run-Navigation wird verfügbar.
3. Einen Checkpoint erzeugen: Fortgeschrittener Run wird verfügbar.
4. Genügend Metawährung erwerben: Metafortschritt wird verfügbar.
5. Jedes abgeschlossene Kapitel nach Ressourcenverbrauch erneut öffnen; `WIEDERHOLEN` muss erhalten bleiben.

## Kapitelpfade

- Run-Navigation: Karte fokussieren, erreichbaren Knoten einmal wählen und erneut bestätigen; Händler, Werkstatt, Checkpoint und Anomalie vollständig durchgehen.
- Schiff und Ausrüstung: Loadout und Katalog öffnen; Quick-Mount, Werkbank und Bauplan-Schritte auch ohne Beute oder gespeicherten Bauplan bis zum Ende weiterführen.
- Metafortschritt: Forschung kaufen, Codexfilter ändern, Simulation starten und Statistik öffnen.
- Fortgeschrittener Run: HUD-Ressourcen, Fehler, Boss, Extraktion und Zusammenfassung durchgehen; fehlender Kontext darf das Kapitel nicht blockieren.
- Bedienung: Bindings, eine Anzeigeoption, reduzierte Bewegung, Zustandsmuster und Touch-Steuerung prüfen.

## Fokus, Persistenz und Responsive

1. Bei jedem sichtbaren Ziel Fokusrahmen und freie Lesbarkeit der Karte prüfen.
2. Während eines Kapitels neu laden; Kapitel und Schritt müssen erhalten bleiben.
3. Kapitel pausieren und fortsetzen; Aktionsereignisse dürfen im pausierten Zustand nicht fortschreiten.
4. Grundlagen überspringen und neu laden; das automatische Angebot darf nicht erneut starten.
5. Bei 390×844 prüfen: Overlay, Zielrahmen und alle Aktionen bleiben vollständig sichtbar und bedienbar.

## Automatische Abschlussgates

```text
npm test
npm run test:frontend
npm run build
git diff --check
```

## Abnahmeprotokoll 2026-07-13

- Browser: In-App-Browser gegen Vite auf `http://localhost:5173`.
- Kapitel: alle sechs Kapitel gestartet; Run-Navigation, Schiff und Ausrüstung, Metafortschritt, Fortgeschrittener Run sowie Bedienung vollständig beendet. Grundlagen bis Evolution durchgespielt sowie Skip, Reload und Rückkehr zum Hangar separat geprüft.
- Reale Aktionen: Händlerkauf, Forschungskauf, Codex-Kategoriefilter, Simulation, Pause/Fortsetzen, Sektorauswahl/-bestätigung und Einstellungen ausgeführt.
- Persistenz: Skip blieb nach Reload erhalten und löste kein erneutes Autoangebot aus; abgeschlossene Kapitel behielten `WIEDERHOLEN`, auch nachdem Metawährung verbraucht war.
- Fokus: spät gerenderte Ziele wurden nach Navigation automatisch aufgelöst; Loadout, aktive Module, Settings, Händler, Karte und Werkbank wurden visuell fokussiert.
- Responsive: 390×844 visuell geprüft; Dialog, Fokusrahmen und sämtliche Tutorialaktionen blieben im Viewport und bedienbar.
- Browserfehler: während des Durchlaufs keine neue Fehleransicht oder Platzhalter-Fallbacks nach den dokumentierten Korrekturen.
- Automatische Gates nach Review-Korrekturen: `npm test` 192/192, `npm run test:frontend` 108/108, Tutorialvalidator 6 Kapitel/51 Schritte/44 Fähigkeiten, Produktionsbuild erfolgreich, `git diff --check` ohne Fehler.
