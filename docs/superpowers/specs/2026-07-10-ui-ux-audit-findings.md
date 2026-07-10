# UI/UX-Audit — Findings (2026-07-10)

Quellen: Live-Audit im Browser (Desktop 1280×800 + Mobile 375×812, alle Hangar-Tabs, Sektor-Karte, Run/HUD, Werkbank) und Code-Review von `src/styles/*`, `src/ui/*`, `src/main.js`. Keine Konsolen-Fehler im Durchlauf.

Status-Legende: ✅ behoben in diesem Branch · 📋 dokumentiert, bewusst nicht behoben.

## Kritisch

| # | Finding | Ort | Status |
|---|---------|-----|--------|
| K1 | Delegierter Klick-Listener mit `{once:true}`: Ein Fehlklick auf leere Fläche entfernt den Handler — Forschung-Kauf, Kampagnen-Wahl und Favoriten in der Build-History sterben bis zum nächsten Re-Render. | `research-screen.js:3`, `campaign-select-screen.js:3`, `codex-screen.js` (`renderBuildHistory`) | ✅ |

## Hoch

| # | Finding | Ort | Status |
|---|---------|-----|--------|
| H1 | Meta-Screens komplett unstyled: Forschung (`.research-grid/.research-node`), Statistiken (`.service-screen/.summary-grid`, „Runs0"-Konkatenation), Einstellungen (Checkbox-Labels laufen inline zusammen, Keybind-Felder ohne Struktur), Simulator. Die Klassen existieren in keinem Stylesheet. | `screens.css` (fehlende Regeln) | ✅ |
| H2 | `--font-ui` nirgends definiert → gesamte Ship-Assembly-UI (Werkbank, Blueprints, Quick-Mount) rendert in system-ui statt Spiel-Font. | `tokens.css`, `ship-assembly.css` | ✅ |
| H3 | Werkbank-View-Tabs (STRUKTUR/ENERGIE/…) werden auf Desktop abgeschnitten; Toolbar hat nur mobil `overflow-x:auto`. | `ship-assembly.css` | ✅ |
| H4 | Blueprint-Bibliothek: Header-Buttons (IMPORT / SPEICHERN) unstyled (native graue Buttons), Empty-State-Text konkateniert. | `ship-assembly.css`, `blueprint-library-screen.js` | ✅ |
| H5 | `.btn.danger:hover` erbt phosphorgrünen Glow — widersprüchliches Feedback auf Danger-Aktionen. | `screens.css:161-188` | ✅ |
| H6 | Hangar-Tab-Leiste: nativer horizontaler Scrollbalken, abgeschnittene Tabs ohne Overflow-Hinweis; Tab-Buttons ohne Fokus-Stil, Tap-Höhe < 44px. | `hangar.css:93-95` | ✅ |
| H7 | Tab-Switcher ohne Tab-Semantik (`role="tablist"/"tab"`, `aria-selected`); nur `aria-current="true/false"`-Strings. | `hangar-screen.js`, `hangar.css` | ✅ |
| H8 | Quick-Mount-Overlay ohne Dialog-Semantik (`role="dialog"`, `aria-modal`), kein Focus-Management. | `quick-mount-overlay.js` | ✅ (Semantik) / 📋 (Focus-Trap) |

## Mittel

| # | Finding | Ort | Status |
|---|---------|-----|--------|
| M1 | `#hangar` doppelt definiert: `max-width:660px` (Z.2) kappt späteres `width:min(1120px,96vw)` (Z.92). | `hangar.css` | ✅ |
| M2 | Erreichbare Sektor-Knoten ohne `:hover`/`:focus-visible`; ausgewählter Knoten mischt gelben Rahmen mit pinkem Glow (`rgba(255,78,205,…)` ist kein Token). | `map.css:10-14` | ✅ |
| M3 | Global fehlende `:focus-visible`-Anzeige auf Buttons/Inputs/Selects (außer `.btn`). | `base.css` | ✅ |
| M4 | Native, ungestylte Scrollbars in der durchgestylten Dark-UI (Hangar-Content, Panel, Codex …). | `base.css` | ✅ |
| M5 | `.btn` ohne `:disabled`-Zustand, obwohl disabled gerendert wird (Forschung, Import). | `screens.css` | ✅ |
| M6 | Simulator: vier Eingabefelder ohne Label (Dichte/Dauer/Seed nicht erkennbar). | `simulator-screen.js` | ✅ |
| M7 | Prototypen-Vault ohne Empty-State (leere Fläche unter Filtern). | `prototype-vault-screen.js` | ✅ |
| M8 | Settings-Screen hängt bei jedem Render neuen `change`-Listener an denselben Root (Stacking bei Re-Render). | `settings-screen.js:5` | ✅ |
| M9 | Natives `confirm()` im Workshop-Flow bricht Look & Feel. | `workshop-screen.js:14` | 📋 |
| M10 | Tap-Targets < 44px: Inspector-Tabs, Codex-Filter, Blueprint-Favorit (42px). | `screens.css`, `codex.css`, `ship-assembly.css` | ✅ (Favorit, Hangar-Tabs) / 📋 (Rest) |
| M11 | „1 PATHS" — fehlende Singular-Form im Campaign-Router. | `campaign-select-screen.js` | ✅ |

## Niedrig (dokumentiert, überwiegend nicht behoben)

- N1 📋 Content wird in mehreren Screens unescaped in `innerHTML` interpoliert (`item-card.js`, `merchant-screen.js`, `challenges-screen.js`, `codex-screen.js`, `statistics-screen.js`, `research-screen.js`). Aktuell nur statischer Content, aber inkonsistent zu den Ship-Assembly-Screens, die konsequent escapen.
- N2 📋 Sehr niedrige Kontraste durch Alpha-Werte (.42–.55) kombiniert mit 8–9px-Schrift (`.hint`, Tab-Labels, `codex.css`, `item-card small`) — grenzwertig unter WCAG AA. Bewusste Ästhetik; empfohlen: Mindestgröße 10px und Alpha ≥ .6 für Fließtext.
- N3 📋 Locked-Einträge (Codex/Hangar) mit `opacity:.38` + `grayscale` + Kleinstschrift praktisch unlesbar (beabsichtigt „locked", aber hart an der Grenze).
- N4 📋 `!important`-Overrides in `ship-assembly.css`/`-mobile.css` (Kaskaden-Risiko, laut AGENTS.md bekannt).
- N5 📋 Punktuelle Rohfarben statt Tokens in `hud.css` (`#b3123f`, `#ff7b00`, `#590d22`), `screens.css:459`, `codex.css:4`; paralleles Farbsystem in `ship-assembly.css` (`--assembly-*`).
- N6 ✅ `.assembly-port:focus-visible` nur über Opazität sichtbar → Outline ergänzt.
- N7 📋 `body{touch-action:none}` global; scrollbare Container verlassen sich auf Nicht-Vererbung (fragil, funktioniert aktuell).
- N8 📋 Sprachmix Deutsch/Englisch in der UI („Run starten" vs. „CAMPAIGN ROUTER", „PATHS", „NO REWARDS") — Produktentscheidung nötig.
- N9 📋 Sektor-Karte erscheint im eingebetteten Menü-Panel inkl. Menü-Header („STANDARD RUN"-Buttons bleiben sichtbar) — visuelle Hierarchie im Run-Kontext verwirrend; größerer Umbau, nicht Teil dieses Fixes.

## Positiv
- Ship-Assembly: sauberes Teardown (`destroy()`), konsequentes Escaping von User-Input, natives `<dialog>` mit `aria-live` im Import-Dialog.
- `prefers-reduced-motion` wird konsequent respektiert.
- Keine Konsolen-Fehler beim Durchspielen von Menü → Sektor-Karte → Run → Werkbank.
