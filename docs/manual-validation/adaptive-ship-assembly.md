# Adaptive Ship Assembly – manuelle Abnahme

Build-Befehl: `npm run build`  
DEV-API: `globalThis.__VOIDREAPER_DEBUG__.assembly`

| # | Szenario | Reproduzierbarer Ablauf | Datum | Build | Ergebnis | Beobachtung |
|---:|---|---|---|---|---|---|
| 1 | Kernstart, zehn Schiffe | `assemblyVisualGallery()` beziehungsweise `visual-gallery`; alle zehn Kern-IDs nacheinander darstellen. | 2026-08-11 | local | ☑ | Alle zehn Kern-IDs mit detaillierter Geometrie (Structure, Detail, Void) erfolgreich abgeglichen. Keine Abweichungen zum Lab. |
| 2 | Schnellmontage S/M | Debugitem S/M erzeugen, bis zu drei Vorschläge wechseln, bestätigen und einmal mit Escape einlagern. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 3 | Werkbank L/XL/Structural/Corrupted | Zwischen Sektoren Werkbank öffnen, Item wählen, Zielport per zweitem Tap wählen, montieren. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 4 | Vier Astebenen / 18 Segmente | `maximum-construction`; Grenzwerte sowie verbleibende Lesbarkeit prüfen. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 5 | Asymmetrie | `asymmetric-heavy`; Gegengewichte auf leichter Seite prüfen, keine Trefferzonen/Werte. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 6 | Fünf Werkbankmodi | Normal, Struktur, Energie, Schaden und Flugprofil nacheinander aktivieren. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 7 | Drei Schadensstufen | `damage-single`; Armor Broken, Core Disrupted und Detached visuell/funktional vergleichen. | 2026-08-11 | local | ☑ | Schadensstufen rendern konsistent mit den Lab-Vorgaben, Overlay-Renderer funktioniert fehlerfrei. |
| 8 | Astverlust | `bridge-survival`, danach `branch-collapse`; Kindast einmal gehalten, einmal abgetrennt. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 9 | Reparatur | `repair-remount`; Kampfpatch, Werkstatt-Vollreparatur und erneute Montage prüfen. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 10 | Flugprofil | Vor/nach `asymmetric-heavy` Masse, Trägheit, Dodge, Drift und `recoilAsymmetry` vergleichen. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 11 | Bauplan-Roundtrip | Konstruktion speichern, Variante erstellen, exportieren, importieren, Ghost und `blueprint-roundtrip` prüfen. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 12 | Save-Migration | Sicherung eines v4-Saves laden; Loadouts, Forschung, Inventar und Rekorde unverändert vergleichen. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 13 | LOD | `lod-stress`; high/medium/low vergleichen, Kerne, Hauptpanzerung und Schaden bleiben sichtbar. | 2026-08-11 | local | ☑ | Detailreduktion bei LOW-Settings greift korrekt, Hauptpanzerung und Risse bleiben priorisiert sichtbar. |
| 14 | Desktop / Touch | Tasten, Mausrad, Klick sowie Tap, Swipe, Long-Press, Zweischritt-Platzierung und Gesten prüfen. | 2026-08-11 | local | ☑ | Erfolgreich geprüft. |
| 15 | Barrierefreiheit | Reduzierte Bewegung, UI-Skalierung, 48-px-Touchziele, Fokusrahmen und Portmuster prüfen. | 2026-08-11 | local | ☑ | Reduzierte Bewegung stoppt Puls- und Rotationsanimationen wie erwartet, Deckungsgleich mit Lab-Reduced-Motion. |

## Automatisch belegte Kontrollpunkte

- `npm run validate:assembly`: erwartet 152 Equipmentprofile, 10 Schiffskerne, 14 Visualfamilien.
- `npm run build`: erwartet Content- und Assembly-Validator sowie fehlerfreien Vite-Produktions-Build.
- Die DEV-Szenarien verändern ausschließlich den aktuellen lokalen Run und sind im Produktionsmodus nicht sichtbar.
- Baupläne enthalten keine `moduleInstanceId`, Affixe, Items oder Unlock-Zuweisungen.

## Forged-Abyss-Browserabnahme – 10. Juli 2026

Build: Branch `design`, Forged-Abyss-Implementierung nach `9d07368`

| Ansicht | Ergebnis | Beobachtung |
|---|---|---|
| Vesper-Kern im Kampf | ☑ | Mehrteilige Silhouette, Void-Reaktor, Panzerung, Triebwerke und montierte Railgun bleiben klar lesbar. |
| Gegner im Standard-Run | ☑ | Rollenbasierte prozedurale Silhouetten werden dargestellt; Treffer, Beute und automatische Zielerfassung funktionieren weiter. |
| Shattered-Approach-Arena | ☑ | Regionale Splitter, Raster und Hintergrund liegen hinter Schiff, Gegnern, Geschossen und Gefahrenhinweisen. |
| Sektorkarte Desktop | ☑ | Zwölf tatsächliche `next`-Verbindungen für den geprüften Seed; Auswahl und Zweitklick-Bestätigung funktionieren. |
| Sektorkarte Mobil, 390 × 844 | ☑ | Layer bleiben horizontal verfolgbar, Verbindungslayer und Knotensignaturen bleiben sichtbar. |
| Werkbank Mobil, 390 × 844 | ☑ | Schiff, Ports, Modi und Inspektor bleiben erreichbar; die Bühne ist innerhalb des vorhandenen Scrollbereichs bedienbar. |
| Browserkonsole | ☑ | Keine neuen Warnungen oder Fehler während Karte, Kampf und Werkbank. |
| Visuelle Profilabdeckung | ☑ | Validator bestätigt 10 Schiffskerne, 14 Modulfamilien, 11 Gegnerprofile, 5 Regionsprofile und 2 Detailassets. |
| Lab Renderer Integration | ☑ | Ship hulls, enemies, mounted modules, and mounted weapons show refined shading and distinct weapon looks. No new console warnings from renderer fallback. |
