# Hangar-Kataloge mit direkter Ausrüstung – Design

## Ziel

Die Hangar-Bereiche „Schiffe“, „Waffen“ und „Module“ werden zu übersichtlichen, filterbaren Katalogen mit direktem Zugang zur Ausrüstung. Spieler erkennen vor jeder Interaktion, was sie sehen, ob ein Eintrag ausgerüstet, verfügbar oder gesperrt ist und wodurch ein gesperrter Eintrag freigeschaltet wird.

Die bestehenden Loadout- und Freischaltregeln bleiben maßgeblich. Die Kataloge erhalten keine parallele Ausrüstungslogik, sondern führen nach einer bewussten Slot-Auswahl durch den vorhandenen Loadout-Service.

## Leitentscheidungen

- Die drei bestehenden Hangar-Tabs bleiben erhalten.
- Jeder Tab erhält Titel, Zweckbeschreibung, Freischaltfortschritt, Suche und Statusfilter.
- Der Modulkatalog erhält zusätzlich Filter für Passiv-, Aktiv-, Utility- und Reliktmodule.
- Die Standardsortierung lautet: ausgerüstet, verfügbar, gesperrt; innerhalb eines Zustands alphabetisch.
- Der Kartenstatus ist vor dem Anklicken durch Text, Symbol und visuelle Gestaltung eindeutig.
- Ein Kartenklick verändert das Loadout noch nicht, sondern öffnet eine kompakte Auswahlleiste.
- Erst die Wahl eines konkreten Slots rüstet den Eintrag aus.
- Gesperrte Karten bleiben für Details und den Freischaltweg auswählbar, bieten aber keine ausführbare Ausrüstungsaktion.

## Aufbau eines Katalog-Tabs

Oberhalb des Katalograsters steht eine kompakte Orientierung mit:

- dem deutschen Namen des Bereichs;
- einer kurzen Erklärung, dass hier Inhalte angesehen und ausgerüstet werden;
- dem Fortschritt „X von Y freigeschaltet“;
- einem beschrifteten Suchfeld;
- den Statusfiltern „Alle“, „Verfügbar“ und „Gesperrt“;
- im Modulkatalog den Typfiltern „Alle“, „Passiv“, „Aktiv“, „Utility“ und „Relikt“;
- der Anzahl der aktuell sichtbaren Treffer.

Suche und Filter arbeiten gemeinsam. Ein leerer Trefferbereich erklärt, welche Filter aktiv sind, und bietet eine Aktion zum Zurücksetzen. Der Zustand von Suche und Filtern wird pro Tab im laufenden Hangar-Screen gehalten und bleibt bei Tabwechseln und nach einem erfolgreichen Ausrüsten erhalten.

## Kartenstatus

Jede Karte besitzt genau einen primären Zustand:

### Ausgerüstet

- sichtbare Kennzeichnung „AUSGERÜSTET“;
- grüner Statusakzent;
- Anzeige der belegten Slot-Positionen;
- Aktionshinweis „Belegung ändern“.

### Verfügbar

- sichtbare Kennzeichnung „VERFÜGBAR“;
- klarer interaktiver Zustand;
- Aktionshinweis „Slots wählen“.

### Gesperrt

- sichtbare Kennzeichnung „GESPERRT“ und Schloss-Symbol;
- gedämpfte, aber weiterhin lesbare Darstellung;
- sichtbarer Freischaltweg aus `unlockSource`: `starter` wird als „Startausrüstung“, `research` als „Über Forschung freischalten“, `blueprint` als „Durch Blaupause freischalten“, `challenge` als „Über Herausforderung freischalten“ und `secret` als „Geheime Bedingung erfüllen“ dargestellt;
- Aktionshinweis „Freischaltweg ansehen“ statt eines Ausrüstungsversprechens.

Farbe ist nie der einzige Zustandsindikator. Der zugängliche Name der Karte enthält Name, Status und bei gesperrten Einträgen den Freischaltweg.

## Auswahlleiste und Ausrüsten

Ein Klick auf eine Karte markiert sie und öffnet innerhalb des Tabs eine kompakte Auswahlleiste. Sie zeigt Name, Status und die für die Definition passenden Loadout-Slots.

Bei Schiffen und Waffen wird der jeweils einzige passende Slot samt aktueller Belegung gezeigt. Bei Modulen werden alle Slots des passenden Typs gezeigt. Jeder Slot nennt:

- Slot-Typ und Position;
- den aktuell ausgerüsteten Eintrag oder „Leer“;
- die eindeutige Aktion „Hier ausrüsten“ beziehungsweise „Ersetzen“.

Die Auswahl eines Slots verwendet den bestehenden Equip-Pfad und speichert das primäre Loadout. Nach Erfolg werden Katalog, Statusmarkierungen, Slotbelegung und Fortschrittsanzeige aktualisiert. Die Auswahlleiste wird geschlossen; Suche und Filter bleiben erhalten.

Bei einer gesperrten Karte enthält die Leiste statt Slot-Aktionen eine Erklärung des Freischaltwegs. Bei einem fachlichen Equip-Fehler bleibt die Leiste geöffnet und zeigt die bestehende Fehlermeldung in einem `aria-live`-Bereich. Es wird kein teilweise verändertes Loadout angezeigt.

## Datenfluss und Zuständigkeiten

Der Hangar-Screen besitzt Darstellung, Filterzustand, Kartenauswahl und Auswahlleiste. Er erhält von der App-Wiring-Schicht:

- die Katalogdefinitionen;
- eine aktuelle Abfrage des primären Loadouts;
- den bestehenden Freischaltstatus;
- eine Aktion zum Ausrüsten in einen konkreten Slot.

Die App-Wiring-Schicht verwendet für diese Aktion dieselben bestehenden Bausteine wie der Loadout-Tab: `createLoadoutItem`, `services.loadouts.equip`, den Save-Store und anschließendes erneutes Laden des Meta-Saves. Slot-, Unlock- und Unique-Regeln werden nicht im Hangar-Screen dupliziert.

`unlockSource` wird ausschließlich für verständliche UI-Texte abgebildet. Diese Abbildung entscheidet nicht über den tatsächlichen Freischaltstatus.

## Responsive Darstellung

Auf breiten Ansichten liegt die Auswahlleiste kompakt zwischen Filterleiste und Katalog, ohne den Seitenkontext zu verdecken. Auf schmalen Ansichten erscheint derselbe Inhalt als fokussierte Bottom-Sheet-Ansicht mit klarer Schließen-Aktion.

Die Filter bleiben auf kleinen Ansichten horizontal oder mehrzeilig bedienbar. Karten werden weiterhin einspaltig dargestellt. Auswahlleiste, Suchfeld, Filter und Slot-Aktionen müssen bei 200 Prozent UI-Skalierung ohne abgeschnittene Aktionsbeschriftungen nutzbar bleiben.

## Barrierefreiheit

- Alle interaktiven Karten, Filter und Slot-Aktionen sind per Tastatur erreichbar.
- Der aktive Tab, aktive Filter, ausgewählte Karte und belegte Slot werden semantisch ausgezeichnet.
- Gesperrte Karten sind nicht als native deaktivierte Buttons umgesetzt, da ihr Freischaltweg weiterhin zugänglich sein muss.
- Die nicht verfügbare Ausrüstungsaktion wird in der Auswahlleiste sichtbar und semantisch als nicht verfügbar erklärt.
- Trefferzahl und Ergebnis einer Ausrüstungsaktion werden zurückhaltend über `aria-live` gemeldet.
- Fokus- und Sperrzustände sind auch ohne Hover erkennbar.

## Validierung

Automatisierte Frontend-Tests prüfen mindestens:

- die sichtbaren Zustände „Ausgerüstet“, „Verfügbar“ und „Gesperrt“ vor dem Anklicken;
- die verständliche Abbildung aller verwendeten `unlockSource`-Werte;
- Standardsortierung, Suche, Statusfilter und Modultypfilter;
- den erklärenden Leerzustand und das Zurücksetzen der Filter;
- die korrekten aktuellen Belegungen im Slot-Wähler;
- dass gesperrte Karten keine Equip-Aktion auslösen;
- dass die Wahl eines konkreten Slots den vorhandenen Equip-Callback mit Slot, Index und Definition-ID aufruft;
- dass Filterzustände nach Tabwechsel und Re-Rendering erhalten bleiben;
- Tastatur- und ARIA-Verträge der neuen Bedienelemente.

Als Abschluss werden `npm run test:frontend`, `npm run build` und `git diff --check` ausgeführt. Zusätzlich werden die drei Kataloge im Browser auf Desktopbreite und einer schmalen mobilen Ansicht geprüft, einschließlich Suche, Filter, gesperrter Erklärung und erfolgreicher Slot-Auswahl.

## Nicht-Ziele

- Keine Änderung der Freischaltbedingungen oder Inhalte.
- Keine neue Loadout-, Save- oder Migrationsstruktur.
- Keine direkte Ausrüstung ohne bewusste Slot-Auswahl.
- Keine Neugestaltung anderer Hangar-Tabs.
- Keine neue globale Such- oder Inventararchitektur.
