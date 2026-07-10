# Forged Abyss Geometry and World Rendering Design

**Status:** Fachlich freigegeben
**Datum:** 10. Juli 2026
**Betrifft:** Schiffe, Module, Gegner, Kampfarena, Sektorkarte und deren Vorschauansichten

## 1. Ziel

VOIDREAPER erhält eine zusammenhängende visuelle Sprache für seine spielrelevante Geometrie. Die bisher einfachen Gegner- und Arenadarstellungen werden ausgebaut, während die vorhandene adaptive Schiffsmontage visuell vertieft wird.

Das Ergebnis soll:

- Schiffs-, Gegner- und Modulfunktionen bereits an ihrer Silhouette erkennen lassen,
- die fünf Regionen als unterschiedliche Orte lesbar machen,
- Werkbank, Bauplanvorschau und Kampf konsistent darstellen,
- reproduzierbar und performant im Canvas laufen,
- Gameplay, Trefferzonen und Speicherstände nicht unbeabsichtigt verändern.

Die freigegebene Designrichtung heißt **Forged Abyss**: lesbare industrielle Konstruktionen werden von lebenden Void-Kernen, Rissen und mutierenden Details durchbrochen.

## 2. Grenzen

### 2.1 Im Umfang

- visuelle Überarbeitung der zehn vorhandenen Schiffskerne,
- visuelle Überarbeitung der 14 vorhandenen Modulprofilfamilien,
- neue prozedurale Gegnergeometrien für die bestehenden regionalen Archetypen,
- regionale Arenahintergründe und rein dekorative Weltgeometrie,
- eine räumlich lesbare Darstellung des bestehenden Sektorkartengraphen,
- konsistente Darstellung in Kampf, Hangar, Werkbank, Bauplan und Thumbnail,
- kleine handgefertigte SVG-Detailassets als Ergänzung prozeduraler Canvas-Geometrie,
- LOD, Caching, reduzierte Bewegung und visuelle Fallbacks,
- Erweiterung der bestehenden Validatoren um neue visuelle Profile und Assets.

### 2.2 Nicht im Umfang

- Änderungen an Gameplaywerten, Gegnerbalance oder Kollisionsregeln,
- neue Schiffe, Module, Gegnerrollen oder Kartentypen,
- eine Änderung der Montage-, Port- oder Blueprint-Datenmodelle,
- persistierte Zufallsgeometrie oder eine Save-Migration,
- eine neue Grafikbibliothek oder ein Wechsel von Canvas 2D,
- komplette Figuren als starre SVG- oder Spritebilder.

Direkte Nutzerfreigabe erlaubt handgefertigte SVG- und Sprite-Details zusätzlich zur prozeduralen Canvas-Geometrie. Diese Vorgabe ersetzt für dieses Redesign die ältere Planannahme, dass keine solchen Assets verwendet werden.

## 3. Visuelle Grammatik

Jedes sichtbare Objekt besteht aus drei Ebenen:

1. **Funktionssilhouette:** Die prozedurale Grundform codiert Rolle, Bewegungsrichtung und Größe. Sie bleibt auch ohne Farbe und auf niedriger LOD-Stufe erkennbar.
2. **Mechanische Konstruktion:** Panzerplatten, Streben, Schächte, Kühlrippen, Leitungen und Waffenöffnungen erklären, wie das Objekt funktioniert.
3. **Void-Signatur:** Kerne, Aperturen, Risse, organische Einschlüsse und mutierende Konturen vermitteln Fraktion, Seltenheit, Korruption und Aktivität.

Aktivität, Schaden und Korruption verändern Materialzustand und Details. Sie verändern nicht stillschweigend die spielrelevante Grundsilhouette oder Trefferzone.

### 3.1 Material- und Zustandsregeln

- intakte Struktur: dunkles Metall, klare Kanten und kontrollierter Energiefluss,
- aktive Funktion: gerichtete Lichtbewegung nahe der zuständigen Baugruppe,
- erhitzte Funktion: warme Emission, offene Kühlflächen und lokales Flimmern,
- beschädigte Panzerung: gebrochene Kanten, freiliegende Struktur und Warnfarbe,
- gestörter Kern: unregelmäßiger Void-Puls und instabile Innenkontur,
- abgetrennte Vorschau: reduzierte Deckkraft und eindeutige Verbindungslücke,
- Korruption: lokale organische Veränderung statt eines globalen Farbfilters.

Farbe ist nie das einzige Zustandssignal. Kontur, Muster, Bewegung oder Form ergänzen sie.

## 4. Schiffe und Module

### 4.1 Schiffskerne

Die zehn vorhandenen Kerngeometrien behalten ihre charakteristische Außenkontur und ihre bestehenden Anker. Sie erhalten:

- eine erkennbare Bug- und Bewegungsrichtung,
- getrennte Rumpf-, Struktur- und Panzerungsebenen,
- eingelassene Cockpit- und Reaktorkerne,
- schiffsabhängige Triebwerksformen,
- gezielte Asymmetrie nur für dafür vorgesehene Frames,
- eine eigene Panzerungs- und Lichtsignatur pro Frame,
- lesbare Übergänge zu den Montageports.

Die Außenkonturen werden nicht vereinheitlicht. Vesper bleibt speerförmig, Bastion massig, Specter fragmentiert, Shepherd breit, Harrow sichelförmig und Null Choir bewusst gebrochen.

### 4.2 Modulprofile

Die 14 visuellen Modulprofilfamilien bleiben die öffentliche Zuordnung zwischen Content und Renderer. Ihre Funktionsformen werden verstärkt:

- lineare Waffen: Lauf, Mündung und Rückstoßachse,
- Raketen: einzelne Schächte und öffnende Klappen,
- Strahlenwaffen: fokussierende Linsen und Ladeweg,
- Minen: ventrale Ausstoßkammer,
- Drohnen: getrennte Dockbuchten,
- Schilde: konzentrische Emitter und Feldsegmente,
- Kühlung: offene Rippen und Wärmeabgabe,
- Reaktoren: Kammer, Spulen und Energieabgang,
- Sensoren: gerichtete Linsen,
- Utility: modulare Werkzeugcluster,
- Struktur: tragende Spanten und Verbindungsflächen,
- Void, Orbit und Corrupted: klar getrennte anomale Funktionskerne.

Modulgröße wird nicht nur durch Skalierung, sondern auch durch Detailanzahl, Strukturstärke und Anschlussfläche vermittelt.

### 4.3 Gemeinsame Ansichten

Kampf, Werkbank, Bauplanminiatur und Hangar verwenden dieselben Geometrie- und Profilquellen. Ansichten unterscheiden sich ausschließlich durch:

- Kamera und Zoom,
- LOD,
- Interaktions- und Analyseoverlays,
- Auswahl-, Ghost- und Schadenszustände.

Dadurch bleiben Bauplanminiatur und tatsächlich montiertes Schiff visuell konsistent.

## 5. Gegner

Die aktuelle Kreis-Darstellung wird durch registrierte prozedurale Gegnerprofile ersetzt. Ein Profil enthält:

- Archetyp und regionale Fraktion,
- Grundsilhouette und Bewegungsachse,
- Panzerungs- und Kernmotive,
- Angriffs- beziehungsweise Mündungsrichtung,
- Aktivitäts-, Treffer- und Schadensdarstellung,
- Detailseed und LOD-Regeln.

Die bestehenden regionalen Gegner werden in lesbare Rollenfamilien eingeordnet:

- Drifter und Schwärme: kleine offene Silhouetten, wenig Panzerung,
- Lancer und Rammer: zugespitzte Bewegungs- und Angriffsachse,
- gepanzerte Proxies: geschlossene Blockformen und frontale Platten,
- Drohnen und Träger: erkennbare Buchten, Satelliten oder Ausstoßrichtungen,
- Grave-Einheiten: reparierte Wrackteile und ungleiche Konstruktionen,
- Choir-Einheiten: sakrale Symmetrie mit organischen Aperturen,
- Architect-Einheiten: präzise segmentierte Geometrie,
- Elites: zusätzliche Kernschicht und eindeutiger äußerer Rahmen,
- Bosse: mehrteilige Silhouette, phasenabhängige Aktivierung statt bloßer Skalierung.

Ein fehlendes Profil verwendet einen deutlich erkennbaren neutralen Fallback und protokolliert einmalig eine Warnung.

## 6. Regionen und Kampfarena

Ein regionales Renderprofil steuert Palette, Bodenstruktur, dekorative Geometrie, Partikel und atmosphärische Bewegung:

- **Shattered Approach:** schwebende Splitter, gebrochene Leitlinien und offene Tiefe,
- **Furnace Expanse:** thermische Platten, Schlackenrisse und Hitzezonen,
- **Grave Circuit:** Wracks, Kabel, Bergungsmarkierungen und unregelmäßige Raster,
- **Null Cathedral:** sakrale Bögen, Void-Fenster und verzerrte Symmetrie,
- **Architect's Crown:** präzise Segmente, rotierende Strukturen und kontrollierte Lichtachsen.

Dekorative Weltgeometrie bleibt kollisionsfrei. Sie darf Projektile, Gegner oder Gefahrenhinweise nicht überdecken. Parallax, Partikel und animierte Details werden über LOD und die Einstellung für reduzierte Bewegung begrenzt.

## 7. Sektorkarte

Die bestehende Kartenlogik und ihre Knoten bleiben unverändert. Die Ansicht wird als echter gerichteter Pfadgraph dargestellt:

- Spalten entsprechen weiterhin den vorhandenen Layern,
- Verbindungen werden aus den tatsächlichen `next`-IDs gezeichnet,
- Knoten verwenden geometrische Symbole passend zu ihrem Typ,
- regionale Hintergründe und Übergänge vermitteln Fortschritt,
- erreichbar, ausgewählt, besucht, verborgen und gesperrt besitzen jeweils Form-, Muster- und Textsignale,
- Bossknoten bilden den visuellen Abschluss einer Region,
- Desktop und Mobil verwenden dieselben Graphdaten mit unterschiedlicher räumlicher Anordnung.

Die Detailansicht erklärt Risiko, Belohnung und Korruptionsänderung, ohne den Graphen zu verdecken.

## 8. Technische Struktur

### 8.1 Gemeinsame Renderprimitiven

Ein fokussierter Satz wiederverwendbarer Canvas-Primitiven zeichnet:

- Platten, Rippen und Spanten,
- Leitungen und Energiepfade,
- Linsen, Kammern und Aperturen,
- Triebwerke, Mündungen und Schächte,
- Risse, Brüche und organische Einschlüsse.

Renderer kombinieren diese Primitiven über registrierte Profile. Gameplayregeln bleiben außerhalb der Renderdateien.

### 8.2 SVG- und Sprite-Details

Kleine lokale Assets stellen wiederverwendbare Masken, Oberflächenmotive und spezielle Details bereit. Zur Laufzeit werden sie:

- im Canvas eingefärbt,
- skaliert, gedreht und gespiegelt,
- mit prozeduralen Konturen kombiniert,
- über stabile Profil-IDs referenziert.

Ein Asset darf keine vollständige spielrelevante Silhouette ersetzen. Fehlende Assets führen zu einem prozeduralen Fallback und einer sichtbaren Validierungswarnung.

### 8.3 Seeds und Datenfluss

Visuelle Varianten werden aus stabilen bestehenden Seeds abgeleitet. Derselbe Snapshot und dieselbe Zeit liefern dieselbe Geometrie. Rein atmosphärische Partikel dürfen davon abweichen, sofern sie keine Gameplayinformation tragen.

Content- beziehungsweise Assembly-Profile liefern IDs und Zustände. Geometrieservices erzeugen oder cachen Pfade. Renderer lesen Snapshots und Profile, ohne Spielzustand zu verändern.

### 8.4 Caching und LOD

- Geometrie wird nur bei Struktur-, Profil- oder relevanten Zustandsänderungen neu aufgebaut.
- SVG- beziehungsweise Spritequellen werden einmal geladen und wiederverwendet.
- High LOD zeigt vollständige Mechanik, Licht und Materialdetails.
- Medium LOD reduziert Innendetails, Schatten und Partikel.
- Low LOD bewahrt Außenkontur, Kern, Waffenrichtung und Schaden.
- Maximale Konstruktionen mit 18 Segmenten bleiben der maßgebliche Assembly-Stresstest.

## 9. Fehlerbehandlung und Kompatibilität

- Unbekannte Profile warnen einmalig und verwenden einen neutralen Fallback.
- Ein fehlgeschlagenes Detailasset darf das Canvas-Rendering nicht abbrechen.
- Renderfehler mutieren weder Run- noch Assemblyzustand.
- Hitboxen, Montageports, Blueprintform und Save-Schema bleiben unverändert.
- Persistierte Geometrie wird nicht eingeführt.
- Sollte die Umsetzung persistierte Felder benötigen, wird sie vorab als separate Kompatibilitätsänderung spezifiziert.

## 10. Barrierefreiheit

- Funktion und Zustand bleiben ohne Farberkennung unterscheidbar.
- Reduzierte Bewegung deaktiviert pulsierende, rotierende und flackernde Dekoration.
- Kritische Formen besitzen ausreichenden Kontrast zum regionalen Hintergrund.
- Mobile Ansichten bewahren Mindestgrößen und verdecken keine interaktiven Ports oder Knoten.
- Blitz- und Glüheffekte beachten die vorhandenen Anzeigeeinstellungen.

## 11. Validierung und Abnahme

Die Umsetzung erweitert bestehende Validatoren, ergänzt aber kein neues Testframework. Verbindliche Kontrollen:

1. `npm run validate-content`,
2. `npm run validate:assembly`,
3. `npm run build`,
4. Assembly-Galerie aller zehn Schiffskerne,
5. Galerie aller 14 Modulprofilfamilien in Aktivitäts- und Schadenszuständen,
6. Gegnergalerie für alle regionalen Archetypen, Elites und Bosse,
7. Browserprüfung aller fünf Regionen im Kampf,
8. Browserprüfung der Sektorkarte auf Desktop und Mobil,
9. Werkbank, Bauplanminiatur und Live-Schiff im direkten Vergleich,
10. maximale 18-Segment-Konstruktion auf allen LOD-Stufen,
11. reduzierte Bewegung und farbunabhängige Zustandslesbarkeit,
12. Prüfung der Browserkonsole auf neue Warnungen oder Fehler.

## 12. Erfolgskriterien

Das Redesign ist abgeschlossen, wenn:

- keine Standardgegner mehr als einfacher gefüllter Kreis dargestellt werden,
- jedes Schiff, Modul und jede Gegnerrolle eine erkennbare Funktionssilhouette besitzt,
- alle fünf Regionen visuell ohne Text unterscheidbar sind,
- die Sektorkarte tatsächliche Verbindungen statt eines dekorativen Rasters zeigt,
- Werkbank, Thumbnail und Kampf dieselben Geometrieprofile verwenden,
- Fallbacks sichtbar und validierbar sind,
- Build und beide vorhandenen Validatoren erfolgreich abschließen,
- Gameplaywerte, Trefferzonen, Blueprints und Saves unverändert bleiben.

## 13. Umsetzungspakete

Der Umfang wird in vier nacheinander integrierbare Pakete zerlegt:

1. **Gemeinsame Renderbasis:** Primitiven, Assetloader, Profilverträge, Seeds, Caching, LOD und Fallbacks.
2. **Schiffe und Module:** zehn Kernschiffe, 14 Modulprofilfamilien sowie gemeinsame Kampf-, Werkbank- und Thumbnailpfade.
3. **Gegner und Regionen:** Gegnerprofile, regionale Arenageometrie, Dekoration und Atmosphäreneffekte.
4. **Sektorkarte und Gesamtabnahme:** echter Verbindungslayer, Knotengeometrien, responsive Anordnung und vollständige Browservalidierung.

Jedes Paket endet mit den dafür relevanten bestehenden Validatoren und einem Produktions-Build. Ein Paket darf erst in das nächste übergehen, wenn seine visuellen Galerien und Fallbacks manuell geprüft wurden.
