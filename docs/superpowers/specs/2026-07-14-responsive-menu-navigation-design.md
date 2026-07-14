# Responsive Menü-Navigation – Design

## Ziel

Die Hangar- und Menüoberflächen von Voidreaper erhalten gleichwertig gute Klickwege auf Desktop- und Mobile-Viewports. Alle vorhandenen Bereiche bleiben auffindbar, der aktive Kontext und der Rückweg bleiben sichtbar, und Inhalte oder Aktionen werden nicht unbemerkt abgeschnitten.

Die bestehenden Screens, Services, Spielregeln und Save-Strukturen bleiben die fachliche Grundlage. Die Optimierung verändert Navigation und Darstellung nur dort, wo ein Klickweg oder eine Ansicht im Browser nachweislich problematisch ist.

## Browserbefund

Die bestehende Bereichsnavigation enthält 16 Tabs mit einer Gesamtbreite von rund 1309 Pixeln. Bei einem Desktop-Viewport von 898 Pixeln stehen ihr höchstens 830 Pixel zur Verfügung; auf einem 390-Pixel-Mobile-Viewport sind es 342 Pixel. Der Überlauf ist scrollbar, besitzt aber keine sichtbare Links-/Rechtssteuerung oder eindeutige Fortsetzungsanzeige.

Dadurch verschwinden auf Desktop und Mobile Bereiche aus dem sichtbaren Ausschnitt. Nach einem Sprung zu einem rechten Tab sind umgekehrt die ersten Bereiche nicht mehr sichtbar. Einzelne mobile Ansichten, insbesondere Karten mit eigener horizontaler Geometrie, schneiden zusätzlich Beschriftungen oder Aktionen an.

## Leitentscheidungen

- Desktop und Mobile haben denselben Qualitätsanspruch.
- Die vorhandene Tabnavigation bleibt die semantische und technische Grundlage.
- Desktop verwendet eine kontrollierte horizontale Bereichsleiste mit sichtbarer Überlaufsteuerung.
- Mobile verwendet einen kompakten Bereichswähler mit vollständiger Zielübersicht.
- Der aktive Bereich und „Zurück zum Start“ bleiben jederzeit eindeutig erkennbar.
- Screen-Renderfunktionen, Services und Save-Schema werden nicht durch ein paralleles Menüsystem ersetzt.
- Änderungen an einzelnen Screens müssen auf einen im Browser reproduzierten Klickweg-, Layout-, Fokus- oder Zustandsfehler zurückgehen.

## Responsive Bereichsnavigation

### Desktop

Die vorhandene Tablist bleibt sichtbar. Wenn nicht alle Tabs in den verfügbaren Raum passen, flankieren eindeutige Zurück- und Weiter-Schaltflächen die Leiste. Dezente Verlaufskanten zeigen an, auf welcher Seite weitere Bereiche liegen.

Beim Wechsel eines Bereichs scrollt der aktive Tab vollständig in den sichtbaren Ausschnitt. Die Überlaufsteuerung wird deaktiviert, sobald in der jeweiligen Richtung kein weiterer Inhalt existiert. Der aktuell aktive Tab bleibt visuell und über `aria-selected` ausgezeichnet.

Die Tastaturbedienung unterstützt die üblichen Tablist-Interaktionen:

- Pfeil links und rechts wechseln zum vorherigen beziehungsweise nächsten Bereich;
- `Home` aktiviert den ersten Bereich;
- `Ende` aktiviert den letzten Bereich;
- der Fokus folgt dem aktivierten Tab und der Tab wird sichtbar positioniert.

### Mobile

Auf kleinen Viewports wird die lange Tabzeile durch einen kompakten Bereichskopf ersetzt. Er zeigt den aktiven Bereich und eine Schaltfläche „Bereiche“. Die Schaltfläche öffnet ein Auswahlpanel mit allen 16 vorhandenen Zielen.

Das Panel verwendet ausreichend große Touch-Flächen, markiert den aktiven Bereich und lässt sich über eine sichtbare Schließen-Aktion, die Escape-Taste oder die Auswahl eines Ziels verlassen. Nach einer Auswahl wird der gewählte Screen gerendert und der Fokus sinnvoll zum Bereichskopf oder zur Screen-Überschrift zurückgeführt.

Der Mobile-Wähler verwendet dieselbe Bereichsdefinition und denselben Aktivierungsweg wie die Desktop-Tabs. Es entsteht keine zweite Liste von Zielen und keine abweichende Navigationslogik.

### Permanente Orientierung

„Zurück zum Start“ bleibt außerhalb der Bereichsnavigation sichtbar und behält seine bestehende Bedeutung. Ressourcen- und Katalogstatus bleiben dem Bereichsinhalt zugeordnet und dürfen die Navigation nicht so weit verdrängen, dass deren Bedienung verloren geht.

## Ansichten und Klickwege

Jede geprüfte Menüansicht folgt demselben Bedienmuster:

1. Ein Kopfbereich benennt den Bereich und erklärt knapp seinen Zweck.
2. Relevante Ressourcen, Fortschritte oder aktive Auswahlen sind sichtbar, bevor eine davon abhängige Aktion ausgelöst wird.
3. Es gibt eine klar erkennbare Primäraktion; Sekundäraktionen bleiben sichtbar, sind aber visuell untergeordnet.
4. Detailansichten und Auswahlpanels bieten einen eindeutigen Schließen- oder Rückweg.
5. Die Rückkehr stellt nach Möglichkeit den vorherigen Bereich, die Auswahl sowie Scroll- und Fokuskontext wieder her.

Desktop-Layouts dürfen mehrere Spalten verwenden. Auf Mobile wechseln Karten, Formulare und Aktionsgruppen auf eine lesbare Einzelspalte, sofern ihre fachliche Darstellung keine zweidimensionale Fläche benötigt. Interaktive Ziele sind auf Mobile mindestens 44 mal 44 CSS-Pixel groß.

Zweidimensionale Flächen wie die Sektorkarte dürfen intern horizontal navigierbar bleiben. Ihre Beschriftungen, Statushinweise, Scrollsteuerung und erreichbaren Aktionen müssen jedoch ohne abgeschnittenen Text verständlich sein. Horizontaler Inhalt benötigt eine sichtbare Steuerungs- oder Fortsetzungsanzeige.

## Zustände und Rückmeldungen

Aktive, leere, gesperrte, nicht bezahlbare und fehlerhafte Zustände werden unterscheidbar dargestellt. Farbe ist nicht der einzige Bedeutungsträger.

Leere Zustände erklären den nächsten sinnvollen Schritt. Ein leerer Loadout-Slot nennt beispielsweise nicht nur das Fehlen freigeschalteter Komponenten, sondern verweist auf den fachlich passenden vorhandenen Bereich wie Forschung, Bergung oder Katalog. Ein solcher Verweis verwendet den gemeinsamen Bereichswechsel und erzeugt keinen Sonder-Navigationspfad.

Gesperrte und deaktivierte Aktionen nennen ihren Grund. Fachlich ungültige Aktionen bleiben im aktuellen Kontext und liefern sichtbare Rückmeldung, anstatt den Screen zu schließen. Normale Navigation und Auswahl erzeugen keine Bestätigungsdialoge. Bestehende Bestätigungen für destruktive Aktionen bleiben erhalten.

## Spielstand und Testzustände

Für die Browserprüfung dürfen lokale Spielstände gezielt angepasst werden, um bestehende Bereiche, Komponenten, Baupläne, Forschung, Ressourcen und Checkpoints erreichbar zu machen. Testzustände verwenden ausschließlich das aktuelle Save-Schema und vorhandene Content-IDs.

Das Vorhaben ändert weder Save-Version noch Datenform. Eine Migration ist nicht erforderlich. Permanente Teständerungen werden nur vorgenommen, wenn sie für reproduzierbare lokale Validierung benötigt werden; Produktionsdefaults erhalten keine künstlichen Freischaltungen.

## Fehlerverhalten und Barrierefreiheit

- Der Mobile-Bereichswähler hält den Fokus im geöffneten Panel und gibt ihn beim Schließen an den Auslöser zurück.
- Neu gerenderte Bereiche erhalten keine willkürlichen Fokuswechsel; bei expliziter Navigation wird die Zielüberschrift oder der Bereichskopf programmatisch erreichbar gemacht.
- Navigations- und Screenaktionen besitzen eindeutige zugängliche Namen.
- Überlaufpfeile und Schließen-Aktionen melden ihren Zweck und ihren deaktivierten Zustand semantisch.
- UI-Skalierung, reduzierte Bewegung und Zustandsmuster bleiben wirksam.
- Viewport- und Screenänderungen erzeugen keinen neuen horizontalen Seitenüberlauf.
- Ein fehlender oder unbekannter Bereich fällt auf „Run starten“ zurück, ohne einen leeren Screen zu hinterlassen.

## Teststrategie

Die Umsetzung folgt Test-Driven Development. Jede Verhaltensänderung beginnt mit einem fokussierten fehlschlagenden Test und erhält anschließend die kleinste passende Implementierung.

### Komponententests

Die Navigationstests decken mindestens folgende Verträge ab:

- Auswahl und sichtbare Positionierung eines überlaufenden Tabs;
- korrekte Aktivierung der Desktop-Überlaufsteuerung;
- Mobile-Bereichswähler mit allen Zielen und markierter Auswahl;
- Escape-, Schließen- und Fokus-Rückkehrverhalten;
- Pfeiltasten-, `Home`- und `Ende`-Navigation;
- gemeinsamer Aktivierungsweg für Desktop und Mobile;
- sicherer Fallback für unbekannte Bereichs-IDs.

Screen-Regressionsprüfungen werden nur für konkret reproduzierte Probleme ergänzt, beispielsweise abgeschnittene Karteninhalte, fehlende Rückwege oder unverständliche leere Zustände.

### Browserprüfung

Desktop und Mobile durchlaufen dieselben zentralen Wege:

- Start → Menü → erster, mittlerer und letzter Bereich → zurück zum Start;
- Start → Menü → Loadout-Slot → Auswahl schließen → vorheriger Kontext;
- Start → Menü → Bauplan oder anderer Detailbereich → Aktion oder Abbruch → Rückkehr;
- Start → Checkpoint → Sektorkarte → Werkbank → Rückkehr;
- Navigation ausschließlich per Tastatur;
- leere, gesperrte und nicht bezahlbare Zustände mit vorbereitetem Spielstand.

Nach jedem relevanten Übergang werden sichtbarer Zustand, aktiver Bereich, Fokus und Browserkonsole geprüft. Die Viewports umfassen mindestens einen Desktop- und einen schmalen Mobile-Zustand.

### Abschlussvalidierung

Die verbindliche Abschlussprüfung umfasst:

- fokussierte neue Regressionstests;
- `npm run test:frontend`;
- `npm test`;
- `npm run build`;
- `git diff --check`;
- erneute Desktop- und Mobile-Prüfung im In-App-Browser.

## Nicht-Ziele

- keine neue Spielmechanik oder zusätzlicher Content;
- keine Änderung der Save-Version oder des Save-Schemas;
- kein Ersatz vorhandener Screens oder Services durch ein paralleles Menüsystem;
- keine umfassende visuelle Neugestaltung außerhalb browserbestätigter Probleme;
- keine spekulativen Refactorings benachbarter Systeme.

## Akzeptanzkriterien

- Alle 16 Bereiche sind auf Desktop und Mobile ohne verborgen vorausgesetztes horizontales Scrollen auffindbar.
- Der aktive Bereich und „Zurück zum Start“ bleiben jederzeit eindeutig.
- Desktop-Überlaufsteuerung und Mobile-Bereichswähler verwenden dieselben Bereichsdefinitionen und Aktivierungswege.
- Tastatur- und Touch-Bedienung erreichen jeden Bereich und jeden vorgesehenen Rückweg.
- Kein geprüfter Screen schneidet seine Primäraktion oder notwendige Statusinformation ab.
- Detail- und Auswahlwege kehren nachvollziehbar in den vorherigen Kontext zurück.
- Leere, gesperrte und fehlgeschlagene Zustände erklären Ursache und nächsten sinnvollen Schritt.
- Desktop- und Mobile-Kernwege funktionieren mit demselben vorbereiteten Save-Zustand.
- Während der geprüften Klickwege treten keine neuen Browserkonsolenfehler auf.
- Alle Abschlussvalidierungen bestehen.
