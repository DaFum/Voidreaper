# VOIDREAPER – Adaptive Ship Assembly Design

> **Status:** Fachlich freigegebener Designentwurf  
> **Datum:** 10. Juli 2026  
> **Geltungsbereich:** Dynamisch wachsendes Schiff mit sichtbaren Modulen, adaptiver Verzweigung, mehrteiligen Trefferzonen, begrenztem Physikeinfluss und speicherbaren Bauplänen  
> **Wichtige Umsetzungsregel:** Sämtliche als „handgestaltet“ bezeichneten visuellen Elemente werden durch den Coding Agent direkt im Code entworfen und implementiert. Es werden keine externen Designer, nachzuliefernden Sprites oder späteren Grafikaufgaben vorausgesetzt.

---

## 1. Zielbild

Das Schiff beginnt jeden Run als kleiner technischer Kern aus Cockpit, Reaktorkammer und Basischassis. Im Verlauf des Runs werden gefundene Module nicht nur als Werte oder Inventareinträge ausgerüstet, sondern als sichtbare Bauteile an das Schiff montiert.

Jedes Modul erweitert die Konstruktion:

- es verändert die Silhouette,
- kann neue Anschlussstellen öffnen,
- besitzt eine eigene Trefferzone,
- kann beschädigt, gestört oder abgetrennt werden,
- beeinflusst Masse, Trägheit und Flugverhalten begrenzt,
- erhält einen erkennbaren Funktionskern,
- wird durch adaptive Panzerung optisch mit dem Schiff verbunden.

Das endgültige Schiff eines Runs soll unmittelbar erkennen lassen, welche Systeme, Waffen, Schutzmechanismen und Risikopfade der Build verwendet.

---

## 2. Verbindliche Designentscheidungen

Die folgenden Entscheidungen gelten als freigegeben:

- Das Schiff wächst nach dem Prinzip **Konstruktion aus einem Kern**.
- Die Konstruktion verwendet **mehrteilige Trefferzonen**.
- Die Slotstruktur folgt einer **adaptiven Verzweigung**.
- Platzierung erfolgt **hybrid**: Das System schlägt zwei bis drei passende Positionen vor, der Spieler entscheidet.
- Module verwenden einen **adaptiven Modulpanzer mit erkennbarem Funktionskern**.
- Schäden folgen einem **dreistufigen Schadensmodell**: Panzerung, Funktionskern, Abtrennung.
- Anschlüsse verwenden **strukturelle Kompatibilität** statt universeller oder strikt fester Slots.
- Asymmetrie wird **funktional ausbalanciert**.
- Die tatsächliche Konstruktion besitzt einen **begrenzten physischen Einfluss** auf das Flugverhalten.
- Kleine Module können während des Runs montiert werden; große und strukturelle Module zwischen Sektoren.
- Die konkrete Run-Konstruktion kann als **Bauplanvorlage** gespeichert werden.
- Rendering basiert auf einem **hybriden Schiffs-Assembler**.
- Sämtliche visuellen Funktionskerne, Platten, Streben, Leitungen, Animationen, Schadenszustände und UI-Elemente werden vom Coding Agent vollständig im Code gestaltet.

---

# 3. Systemarchitektur

## 3.1 Zentraler Schiffskern

Jedes Schiff startet mit:

- Cockpit,
- Reaktorkammer,
- kleinem Basischassis,
- zwei bis vier initialen Anschlusspunkten,
- nahezu konstanter Kern-Hitbox,
- einem schiffsspezifischen visuellen Stil.

Der gewählte Schiffsrahmen definiert zusätzlich:

- Kernform,
- bevorzugte Wachstumsrichtungen,
- Panzerungsstil,
- Leuchtmuster,
- typische Anschlussarten,
- Masse- und Größenlimits,
- natürliche Formen für Ausgleichselemente,
- Stilregeln für Funktionskerne und Übergänge.

## 3.2 Konstruktionsgraph

Die sichtbare Schiffsstruktur wird als gerichteter Konstruktionsgraph gespeichert.

Ein Knoten enthält:

```text
nodeId
parentNodeId
moduleInstanceId
slotType
sizeClass
orientation
mountType
loadClass
energyClass
localPosition
localRotation
damageState
childPorts[]
```

Eine Verbindung enthält:

```text
connectionId
sourcePort
targetPort
structuralStrength
energyThroughput
visualConnectorType
isSecondaryConnection
```

Die primäre Struktur bleibt ein gerichteter Baum. Zusätzliche Panzerbrücken oder Energieleitungen dürfen Sekundärverbindungen bilden, aber keine zyklische Eigentümerstruktur erzeugen.

## 3.3 Systembereiche

### Ship Assembly State

Speichert ausschließlich:

- Knoten,
- Verbindungen,
- Modulreferenzen,
- Schäden,
- Portzustände,
- visuelle Varianten,
- aktuelle Konstruktionsgrenzen.

### Compatibility Service

Prüft:

- Größenklasse,
- Montageart,
- Traglast,
- Energieklasse,
- harte Sperren,
- geometrische Überschneidung,
- Asttiefe,
- Schiffsgrenzen.

### Placement Suggestion Service

Bewertet gültige Anschlüsse und liefert zwei bis drei Platzierungsvorschläge.

### Geometry Builder

Berechnet:

- Modultransformationen,
- Silhouette,
- Renderreihenfolge,
- Portpositionen,
- Trefferzonen,
- Astgrenzen,
- Kameraausdehnung.

### Adaptive Armor Generator

Erzeugt prozedural:

- Panzerübergänge,
- Streben,
- Kabel,
- Wärmerohre,
- Kühleinheiten,
- Gelenke,
- Rotationslager,
- Anschlussblenden.

### Balance Decorator

Erzeugt rein visuelle Ausgleichselemente auf der Gegenseite einer asymmetrischen Konstruktion.

### Damage Zone System

Erzeugt und aktualisiert:

- Kernzone,
- funktionale Modulzonen,
- vereinfachte Fallback-Zonen,
- Schadenszustände,
- Abtrennungsfolgen.

### Flight Profile Calculator

Leitet aus Masse und Positionen begrenzte Auswirkungen auf:

- Beschleunigung,
- Drehreaktion,
- Drift,
- Rückstoß,
- Ausweichdistanz,
- Ausweich-Cooldown

ab.

### Blueprint Service

Speichert und lädt Konstruktionsvorlagen, ohne konkrete Run-Gegenstände oder gerollte Werte zu duplizieren.

---

# 4. Handgestaltung durch den Coding Agent

## 4.1 Verbindliche Bedeutung von „handgestaltet“

„Handgestaltet“ bedeutet in diesem Projekt:

- Der Coding Agent entwirft die Form jeder Modulklasse selbst.
- Der Coding Agent implementiert die Gestaltung direkt in Canvas-, SVG- oder prozeduraler Pfadgeometrie.
- Der Coding Agent definiert Proportionen, Oberflächen, Leuchtelemente, Bewegung und Schadenszustände.
- Der Coding Agent erstellt alle benötigten visuellen Varianten.
- Es wird keine Aufgabe an einen externen Designer ausgelagert.
- Es gibt keine endgültigen Platzhaltergeometrien.
- Es gibt keine offenen Hinweise wie „Sprite nachträglich liefern“ oder „Grafiker liefert Asset“.

## 4.2 Wiederverwendbare visuelle Primitive

Der Coding Agent erstellt wiederverwendbare Konstruktionsprimitive:

- Panzerplatte,
- Klammer,
- Strebe,
- Gelenk,
- Rohr,
- Energiekabel,
- Wärmeleitung,
- Linse,
- Spule,
- Waffenlauf,
- Raketenklappe,
- Drohnenbucht,
- Sensor,
- Schildring,
- Kühlrippe,
- Triebwerksdüse,
- Void-Riss,
- beschädigte Plattenkante.

Diese Primitive werden kombiniert, aber nicht so stark wiederholt, dass alle Module gleich aussehen.

---

# 5. Visuelle Anatomie eines Moduls

Jedes Modul besteht aus fünf Schichten.

## 5.1 Funktionskern

Der Funktionskern zeigt die Aufgabe des Moduls sofort.

Beispiele:

- Railgun: Lauf, Schiene, Ladespulen,
- Raketenmodul: Halterungen, Klappen, Abschusszellen,
- Schildsystem: Linse, Ringgenerator, Feldemitter,
- Kühlung: Rippen, Lüfter, Wärmerohre,
- Drohnenmodul: Dockingbuchten, Startschienen,
- Reaktormodul: Kammer, Spulen, Energieleitungen,
- Sensor: Antenne, Scanner, rotierende Linse,
- Void-System: instabile Öffnung, verzerrte Kontur.

Der Funktionskern behält seine Identität unabhängig vom gewählten Schiff.

## 5.2 Adaptiver Außenpanzer

Der Außenpanzer übernimmt die Formensprache des Schiffskerns.

Beispiele:

- Vesper: schlanke, spitze Platten,
- Bastion: breite, massive Segmente,
- Specter: schmale, phasenartige Flächen,
- Furnace: offene Wärmekanäle und glühende Bereiche,
- Reliquary: organisch-voidartige Rahmen,
- Shepherd: Trägerstreben und Dockingformen,
- Harrow: gekrümmte Klingenformen,
- Vector: stromlinienförmige Beschleunigungsflächen,
- Gravewright: industrielle Gerüste,
- Null Choir: instabile asymmetrische Geometrien.

## 5.3 Verbindungsschicht

Die Verbindung zwischen Eltern- und Kindmodul wird aus Entfernung, Winkel, Traglast und Energieklasse erzeugt.

Mögliche Bestandteile:

- tragende Streben,
- Panzerübergänge,
- Kabelbündel,
- Kühlleitungen,
- Gelenke,
- Rotationslager,
- Energieverteiler.

## 5.4 Zustandsüberlagerung

Jedes Modul besitzt sichtbare Zustände:

- intakt,
- Panzerung beschädigt,
- Funktionskern gestört,
- kritisch beschädigt,
- abgetrennt.

Zustände werden nicht ausschließlich über Farbe vermittelt. Zusätzlich werden verwendet:

- Risse,
- fehlende Platten,
- Funken,
- unregelmäßige Lichtpulse,
- offene Leitungen,
- Rauch,
- Void-Partikel,
- stockende Animationen.

## 5.5 Aktivitätsanimation

Beispiele:

- Railgun-Spulen laden nacheinander,
- Raketenklappen öffnen sich,
- Kühler fahren Rippen aus,
- Drohnenbuchten öffnen sich,
- Schildmodule pulsieren,
- Reaktoren reagieren auf Last und Hitze,
- korrumpierte Module flackern oder verformen sich,
- beschädigte Module arbeiten unregelmäßig.

---

# 6. Slot-, Anschluss- und Astlogik

## 6.1 Anschlussmerkmale

Jeder Port enthält:

```text
portId
parentNodeId
sizeClass
direction
mountType
loadCapacity
energyClass
preferredRoles[]
blockedRoles[]
branchDepth
```

## 6.2 Größenklassen

- `S` – Sensoren, kleine Kühler, Utility,
- `M` – Standardmodule, Schilde, leichte Waffen,
- `L` – schwere Waffen, große Drohnenbuchten,
- `XL` – seltene Struktur- und Endgame-Systeme.

## 6.3 Montagearten

- `axial`,
- `lateral`,
- `dorsal`,
- `ventral`,
- `radial`,
- `structural`.

## 6.4 Kompatibilitätsregeln

Ein Modul kann montiert werden, wenn:

- Größe kompatibel ist,
- Traglast ausreicht,
- Energieklasse unterstützt wird,
- Montageart möglich ist,
- keine harte Funktionssperre besteht,
- keine unauflösbare geometrische Kollision entsteht,
- Ast- und Größenlimits eingehalten werden.

Funktionspräferenzen sind weiche Regeln.

Ein Kühler kann am Bug montiert werden, wird dort aber schlechter bewertet. Eine Railgun kann seitlich montiert werden, muss dann passend als Seitenwaffe dargestellt werden.

## 6.5 Platzierungsbewertung

Die Bewertung verwendet:

```text
Gesamtwertung =
  Funktionsposition
+ Anschlussqualität
+ Schwerpunktbalance
+ Energieverbindungsqualität
+ Panzerbarkeit
+ freie Schusslinie
+ Bauplanübereinstimmung
- Kollisionsrisiko
- überlange Aststruktur
- extreme Massenasymmetrie
```

Jeder Vorschlag zeigt eine verständliche Begründung.

## 6.6 Entstehung neuer Äste

Module dürfen Kindports öffnen.

Beispiele:

- Waffenstrebe,
- Drohnenträger,
- Energieknoten,
- Panzerbrücke,
- Größenadapter,
- Richtungsadapter,
- Gelenkmodul,
- Strukturspine.

Die Standard-Asttiefe beträgt höchstens vier funktionale Ebenen vom Kern. Spezielle Inhalte können sie begrenzt erhöhen.

## 6.7 Paarmodule

Ein Paarmodul:

- verwendet zwei sichtbare Segmente,
- besitzt zwei Trefferzonen,
- kann getrennt beschädigt werden,
- zählt als eine Item-Instanz,
- benötigt zwei kompatible Ports.

## 6.8 Visuelle Ausgleichselemente

Ausgleichselemente:

- sind rein visuell,
- belegen keinen Slot,
- erzeugen keine Werte,
- haben keine Trefferzone,
- dürfen nicht wie eine echte Waffe wirken,
- passen Form und Stil an das reale Gegenstück an.

---

# 7. Montageabläufe

## 7.1 Schnellmontage im Run

Kleine und mittlere Module:

1. werden aufgenommen,
2. lösen eine kurze Verlangsamung oder optionale Pause aus,
3. zeigen zwei bis drei transparente Vorschläge,
4. können direkt bestätigt oder ins Run-Inventar gelegt werden,
5. werden durch eine kurze Aufbauanimation montiert.

Desktop:

- `A/D` oder Mausrad wechseln Vorschläge,
- `Enter` oder Klick bestätigt,
- `Tab` zeigt Details,
- `Escape` legt das Modul ins Inventar.

Touch:

- Vorschlag antippen,
- große Bestätigung,
- Wischen zum Wechsel,
- Long-Press für Details.

## 7.2 Konstruktionsmodus zwischen Sektoren

Große, schwere, korrumpierte und strukturelle Module werden zwischen Sektoren montiert.

Die Ansicht zeigt:

- frei drehbares Schiff,
- echte Module,
- freie Ports,
- Aststruktur,
- Energieverbindungen,
- Traglast,
- Schwerpunkt,
- Trefferzonen,
- Schäden,
- Kindports,
- Bauplan-Geisterstruktur.

Ansichtsmodi:

- Normal,
- Struktur,
- Energie,
- Schaden,
- Flug.

## 7.3 Umbau

Zwischen Sektoren darf der Spieler:

- Module verschieben,
- ganze Äste versetzen,
- Module drehen,
- Adapter einsetzen,
- beschädigte Module näher zum Kern verlagern,
- Äste einklappen oder zerlegen.

Reine Positionsänderungen sind kostenlos. Änderungen an Größe, Montageart oder Energieklasse benötigen Adapter oder Werkstattaktion.

## 7.4 Aufbauanimation

Reihenfolge:

1. Port leuchtet,
2. Träger fahren aus,
3. Funktionskern rastet ein,
4. Leitungen verbinden sich,
5. Panzerplatten schließen,
6. System fährt hoch,
7. neue Ports werden kurz hervorgehoben.

---

# 8. Mehrteilige Trefferzonen

## 8.1 Kernzone

Die Kernzone umfasst:

- Cockpit,
- Reaktorkammer,
- zentrales Chassis.

Treffer verursachen direkten Hull-Schaden. Die Kernzone bleibt nahezu konstant und kann nicht abgetrennt werden.

## 8.2 Funktionale Modulzonen

Trefferformen:

- Kreis für kompakte Module,
- Kapsel für Läufe und Streben,
- Polygon für Plattformen,
- Ringsegment für Orbit- und Schildsysteme.

## 8.3 Dekorative Geometrie

Kabel, kleine Platten, Übergänge und Gegengewichte haben keine eigenen Trefferzonen.

---

# 9. Schadensmodell

## 9.1 Widerstandswerte

Jedes funktionale Modul besitzt:

```text
armorIntegrity
coreIntegrity
```

## 9.2 Zustände

### Intakt

- volle Funktion,
- normale Animation,
- geschlossene Panzerung.

### Panzerung gebrochen

- Funktion bleibt erhalten,
- Stabilität sinkt,
- Fehlerwahrscheinlichkeit steigt leicht,
- Reparatur ist günstig.

### Funktionskern gestört

- Wirkung wird reduziert oder deaktiviert,
- aktive Systeme laden langsamer,
- passive Systeme verlieren Teilwirkung,
- Waffen arbeiten unregelmäßig.

### Abgetrennt

- Modul wird aus der aktiven Konstruktion entfernt,
- visuelle Abtrennung wird abgespielt,
- Item bleibt als beschädigte Instanz erhalten,
- Wiederherstellung erfolgt durch Reparatur oder Werkstatt.

## 9.3 Astabhängigkeit

Beim Verlust eines Elternmoduls gelten drei Fälle:

1. Sekundärverbindung hält den Ast.
2. Provisorische Notverbindung hält ihn mit Nachteilen.
3. Der gesamte abhängige Ast wird abgetrennt.

Redundanz und Panzerbrücken erhalten dadurch spielmechanischen Wert.

## 9.4 Schadensweiterleitung

```text
Trefferpunkt
→ nächste funktionale Trefferzone
→ Modulpanzerung
→ Modulkern
→ verbleibender Durchschlag
→ Kernzone
```

Regeln:

- normale Treffer treffen zuerst Außenteile,
- Durchschlag kann weitere Zonen treffen,
- Flächenschaden wird verteilt und begrenzt,
- Kontakt trifft das berührte Außenteil,
- Spezialangriffe dürfen den Kern teilweise direkt bedrohen,
- Schilde werden zuerst ausgewertet.

## 9.5 Schutz gegen Panzerwände

- Kern muss aus mindestens zwei Richtungsbereichen erreichbar bleiben.
- Geometry Builder verhindert vollständige Abschirmung.
- Reine Strukturmodule bieten begrenzten Schutz.
- Strukturstress steigt bei wiederholten Treffern.
- Bosse dürfen Richtungen wechseln und Kernangriffe ankündigen.
- Große Konstruktionen besitzen mehr Angriffsfläche und leicht erhöhte Trägheit.

## 9.6 Modulspezifische Störungen

Beispiele:

- Railgun: unregelmäßige Ladespulen,
- Raketenmodul: blockierte Schächte,
- Drohnenbucht: kein Start oder Andocken,
- Kühlung: eingefahrene Rippen,
- Schild: flackernde Feldlücken,
- Reaktorzusatz: pulsierende Leistung,
- Sensor: springende Zielerfassung,
- Minenleger: größere Streuung,
- Void-Modul: zusätzliche Korruption,
- Strukturadapter: Verlust von Stabilität.

Diese Störungen werden durch den Coding Agent funktional und visuell vollständig umgesetzt.

---

# 10. Reparatur und Abtrennung

## 10.1 Reparatur im Kampf

Mögliche Systeme:

- Reparaturdrohnen,
- Naniten,
- Notfallreparatur,
- provisorische Streben,
- Opfer eines Moduls zugunsten eines wichtigeren Moduls.

Ein abgetrenntes Modul kann im Kampf nur montiert werden, wenn ein kompatibler Port vorhanden ist.

## 10.2 Reparatur zwischen Sektoren

Ohne Werkstatt:

- Panzerung teilweise reparieren,
- Kern neu starten,
- Notverbindung stabilisieren.

Mit Werkstatt:

- vollständige Reparatur,
- Modul erneut montieren,
- Port ersetzen,
- Ast versetzen,
- Modul näher zum Kern montieren.

## 10.3 Visuelle Abtrennung

1. Verbindungsteile reißen,
2. Kabel lösen sich,
3. Modul übernimmt aktuelle Bewegung,
4. rotiert als Trümmer,
5. Schadenspartikel werden erzeugt,
6. Schiff wird neu zusammengesetzt,
7. Übergänge und Ausgleichselemente werden neu berechnet.

Trümmer bleiben nur kurz aktiv.

---

# 11. Flugverhalten und Konstruktion

## 11.1 Berechnetes Profil

```text
totalMass
centerOfMass
lateralImbalance
rotationalInertia
forwardThrust
lateralThrust
dodgeAuthority
structuralDrag
```

## 11.2 Begrenzte Auswirkungen

Die Konstruktion beeinflusst:

- Beschleunigung,
- Bremsen,
- Richtungswechsel,
- Ausweichdistanz,
- Ausweich-Cooldown,
- leichte Drift,
- Rückstoß.

Grenzen:

- höchstens etwa 20–25 Prozent langsamere Beschleunigung,
- höchstens etwa 15 Prozent geringere Drehreaktion,
- keine unkontrollierbare Rotation,
- kein Verlust der Ausweichfähigkeit,
- keine permanente Gegensteuerung.

## 11.3 Asymmetrie

Einseitige Konstruktionen erzeugen eine leichte, lesbare Charakteristik. Automatische Ausgleichselemente begrenzen Extreme, besitzen aber keine eigenen Werte.

## 11.4 Rückstoß

- Railgun: linearer Gegenimpuls,
- Raketen: Salvenvibration,
- Plasma: Hitze- und Stabilitätsbelastung,
- Seitenwaffen: kleiner Drehimpuls,
- Streben und Reaktoren: Rückstoßkontrolle.

## 11.5 Größenlimits

- höchstens vier funktionale Astebenen,
- höchstens 18 sichtbare echte Modulsegmente im Standardmodus,
- schiffsspezifische Maximalbreite und -länge,
- XL-Module benötigen tragfähige innere Äste,
- nicht auflösbare Überschneidungen werden abgelehnt.

## 11.6 Kamera

- sanfte Zoomanpassung,
- keine abrupten Sprünge,
- Orientierung am Kern,
- HUD unabhängig vom Zoom,
- Gegner und Projektile bleiben lesbar.

## 11.7 Vorschau

Vor Montage werden unter anderem angezeigt:

- Masse,
- Drehreaktion,
- Ausweichdistanz,
- Rückstoßkontrolle,
- Schwerpunkt.

---

# 12. Montageoberfläche

## 12.1 Schnellmontage

Zeigt:

- zwei bis drei transparente Positionen,
- wichtigste Vorteile,
- wichtigste Nachteile,
- neue Ports,
- Flug- und Schadensrisiken.

## 12.2 Konstruktionsmodus

Darstellungsmodi:

- Normalansicht,
- Strukturansicht,
- Energieansicht,
- Schadensansicht,
- Flugansicht.

## 12.3 Portdarstellung

- `S`: kleiner sechseckiger Punkt,
- `M`: Doppelring,
- `L`: verstärkte Halterung,
- `XL`: massive Klammer.

Montageart, Energieklasse, Traglast und Funktionspräferenz werden zusätzlich über Form, Muster und Symbol dargestellt.

## 12.4 Vorschauinhalte

### Geometrie

- Modulform,
- Außenpanzer,
- Streben,
- Leitungen,
- Ausgleichselemente,
- neue Silhouette.

### Spielwerte

- Energie,
- Überlastung,
- Hitze,
- Korruption,
- Masse,
- Flugverhalten,
- Tags,
- Synergien.

### Risiken

- exponierte Trefferzone,
- Astabhängigkeit,
- Systemfehler,
- blockierte Ports,
- Kühlung,
- Schusslinie.

## 12.5 Kampflesbarkeit

Im Kampf sichtbar:

- Funktionskerne,
- aktive Animationen,
- Energiepfade,
- Schäden,
- Störungen,
- Zielmarkierungen,
- Abtrennungen.

Nicht dauerhaft sichtbar:

- Ports,
- Traglast,
- Schwerpunkt,
- Trefferzonen,
- Bauplangeister.

## 12.6 Detailreduktion

Der Renderer reduziert bei großen Schiffen:

- kleine Leitungen,
- Kleinteile,
- Partikel,
- nicht spielrelevante Dekoration.

Funktionskern, Schadenszustand und Silhouette bleiben sichtbar.

---

# 13. Baupläne

## 13.1 Inhalt eines Bauplans

```text
blueprintId
name
shipFrameId
createdAt
updatedAt
coreStyle
nodes[]
connections[]
preferredModuleDefinitions[]
visualVariants[]
balanceDecorators[]
cameraThumbnail
```

Nicht gespeichert werden:

- Run-Werte,
- konkrete Affixe,
- Schäden,
- Energie,
- Korruption,
- temporäre Evolutionen,
- nicht freigeschaltete Gegenstände.

## 13.2 Nutzung im Run

Ein Bauplan kann:

- deaktiviert bleiben,
- als Geisterstruktur geladen werden,
- als zuletzt verwendete Vorlage geladen werden,
- nur zur Betrachtung geöffnet werden.

Der Run startet trotzdem nur mit Kern und regulärer Startausrüstung.

## 13.3 Ersatzmodule

Ein Bauplanknoten enthält:

- bevorzugte Modul-ID,
- erlaubte Rollen,
- erlaubte Tags,
- Größenbereich,
- Montagearten,
- harte Sperren.

Status:

- exakte Übereinstimmung,
- kompatibler Ersatz,
- strukturell passend,
- nicht kompatibel.

## 13.4 Abweichungen

Der Spieler darf jederzeit vom Bauplan abweichen. Das Original wird erst nach ausdrücklicher Bestätigung überschrieben.

## 13.5 Varianten

Mögliche Varianten:

- stabil,
- überladen,
- defensiv,
- asymmetrisch,
- korrumpiert.

## 13.6 Bauplanbibliothek

Jeder Eintrag zeigt:

- Name,
- Miniatur,
- Schiffskern,
- Knotenzahl,
- Waffenfamilien,
- Tags,
- höchste Abyss-Tiefe,
- letzte Verwendung,
- Favoritenstatus.

Aktionen:

- ansehen,
- drehen,
- zoomen,
- duplizieren,
- umbenennen,
- Variante erstellen,
- löschen,
- Standard setzen,
- exportieren.

## 13.7 Import und Export

Der Code enthält:

- Schiffsrahmen,
- Graph,
- Porttypen,
- Modulpräferenzen,
- visuelle Varianten,
- Versionsnummer.

Import vergibt keine Gegenstände oder Freischaltungen.

## 13.8 Veteranenvarianten

Beschädigte Endzustände können optional als rein kosmetische Veteranenvariante gespeichert werden.

---

# 14. Persistenz

Neue Bereiche:

```text
shipBlueprints
activeBlueprintId
blueprintLibraryVersion
assemblyVisualPreferences
```

Regeln:

- Baupläne sind von Item-Instanzen getrennt.
- Fehlende Module bleiben als unaufgelöste Rollenplätze erhalten.
- Bestehende Saves erhalten eine leere Bibliothek und eine Standardvorlage.
- Strukturänderungen werden atomar gespeichert.
- Bei Fehler bleibt die letzte gültige Konstruktion aktiv.

---

# 15. Performance

## 15.1 Neuberechnung

Vollständige Geometrie wird nur neu berechnet bei:

- Montage,
- Demontage,
- Modulverlust,
- Astverschiebung,
- Reparatur eines abgetrennten Moduls,
- Bauplanwechsel,
- strukturellem Adapterwechsel.

## 15.2 Caches

Getrennte Caches für:

- Renderpfade,
- Trefferzonen,
- Ports,
- Panzersegmente,
- Leitungen,
- Ausgleichselemente,
- Masse,
- Miniaturen.

Änderungen invalidieren nur betroffene Äste und Abhängigkeiten.

## 15.3 Renderreihenfolge

```text
untere Strukturteile
→ ventrale Module
→ hintere Leitungen und Streben
→ Kernrumpf
→ Funktionsmodule
→ adaptive Panzerung
→ Waffenläufe und bewegliche Teile
→ Energieeffekte
→ Schadenseffekte
→ Zielmarkierungen
```

## 15.4 Detailstufen

### Hoch

- vollständige Leitungen,
- kleine Platten,
- komplexe Schäden,
- Zusatzanimationen.

### Mittel

- reduzierte Kleinteile,
- vereinfachte Kabel,
- weniger Partikel.

### Niedrig

- Funktionskerne,
- Hauptpanzerung,
- zentrale Lichter,
- vereinfachte Schäden.

Spielrelevante Informationen dürfen nicht entfallen.

---

# 16. Fehlerfälle und Fallbacks

## 16.1 Kein kompatibler Port

Das Modul wird ins Run-Inventar gelegt. UI erklärt:

- Ursache,
- benötigten Adapter,
- mögliche Werkstattlösung.

## 16.2 Geometrieüberlappung

Vorschlag wird verworfen und durch die nächste gültige Position ersetzt.

## 16.3 Strukturlimit

Port bleibt sichtbar und zeigt „Strukturlimit erreicht“.

## 16.4 Ungültiger Bauplan

Das System:

1. lädt gültigen Teilgraphen,
2. entfernt ungültige Verbindungen,
3. markiert nicht auflösbare Knoten,
4. behält Präferenzen,
5. überschreibt das Original nicht.

## 16.5 Fehlende Elternstruktur

Kindknoten werden an eine gültige Ersatzverbindung gehängt oder als nicht erreichbare Geisterknoten angezeigt.

## 16.6 Renderfehler

Kann ein Modul nicht dargestellt werden:

- Gameplay-Wirkung bleibt erhalten,
- neutraler stilgerechter Funktionskern erscheint,
- Fehler wird mit Modul-ID protokolliert,
- übrige Konstruktion bleibt aktiv.

## 16.7 Panzerungsfehler

Kann adaptive Panzerung nicht erzeugt werden, wird eine einfache Standardstrebe verwendet.

## 16.8 Trefferzonenfehler

Kann keine Form berechnet werden, wird eine Kreiszone verwendet.

Diese Fallbacks sind Laufzeitschutz und keine zulässigen finalen Content-Varianten.

---

# 17. Entwicklungs-Debugmodus

Es werden keine Testdateien und kein automatisiertes Testframework vorausgesetzt.

Der Coding Agent implementiert stattdessen einen nur in der Entwicklungsumgebung verfügbaren Debugmodus mit folgenden Funktionen:

- beliebiges Modul erzeugen,
- Modulzustand setzen,
- Panzerung beschädigen,
- Kern stören,
- Modul abtrennen,
- Ast abtrennen,
- Sekundärverbindung hinzufügen,
- Masse anzeigen,
- Schwerpunkt anzeigen,
- Trefferzonen anzeigen,
- Port-Kompatibilität anzeigen,
- Detailstufe wechseln,
- Bauplan exportieren,
- Bauplan importieren,
- maximale Konstruktion erzeugen.

---

# 18. Verbindliche Abnahmekriterien

Die Funktion gilt als vollständig umgesetzt, wenn:

1. Jeder Run mit einem kleinen Kernschiff beginnt.
2. Module erzeugen sichtbare Funktionskerne und Astsegmente.
3. Module können neue Ports öffnen.
4. Das System schlägt zwei bis drei kompatible Positionen vor.
5. Kleine Module können im Run montiert werden.
6. Große und strukturelle Module werden zwischen Sektoren eingebaut.
7. Adaptive Panzerung verbindet Module mit dem Kernstil.
8. Einseitige Konstruktionen erhalten visuelle Ausgleichselemente.
9. Echte Module besitzen eigene Trefferzonen.
10. Panzerung, Kernstörung und Abtrennung sind getrennte Zustände.
11. Abhängige Äste reagieren auf den Verlust eines Elternmoduls.
12. Masse und Position beeinflussen das Flugverhalten begrenzt.
13. Baupläne speichern Konstruktion, nicht kostenlose Ausrüstung.
14. Baupläne können importiert, exportiert und als Geisterstruktur angezeigt werden.
15. Alle Funktionskerne, Panzerungen, Animationen, Ports und UI-Elemente werden vom Coding Agent selbst im Code gestaltet.
16. Es bleiben keine Aufgaben wie „Grafik nachträglich liefern“ oder „Designer liefert Asset“ offen.
17. Desktop- und Touch-Bedienung sind vollständig unterstützt.
18. Die Funktion benötigt kein zusätzliches automatisiertes Testsystem.
19. Die maximale Standardkonstruktion bleibt performant und visuell lesbar.
20. Fehlerhafte Einzelmodule beschädigen weder Run noch Save dauerhaft.
21. Das bestehende Equipment-System bleibt die einzige Quelle für Werte, Tags, Affixe und Energie.
22. Der Assembler erzeugt keine zweite parallele Gameplay-Logik.
23. Visuelle Ausgleichselemente liefern keine Werte und keine Trefferzonen.
24. Abgetrennte Module bleiben als beschädigte Item-Instanzen erhalten.
25. Kern und Root-Knoten können nicht entfernt werden.

---

# 19. Nicht-Ziele

Nicht Bestandteil dieser Funktion:

- vollständige Newtonsche Flugphysik,
- frei zeichnbare Schiffsformen,
- externe Grafikpipeline als Voraussetzung,
- Online-Bauplanmarktplatz,
- frei programmierbare Module,
- permanente Übernahme gefundener Run-Module durch Baupläne,
- automatisierte Testdateien oder ein zusätzliches Testframework.
