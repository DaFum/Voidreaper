# UI/UX-Komplettaudit und Optimierung — Design

Datum: 2026-07-10 · Branch: `ui_ux_fix` · Status: vom Nutzer freigegeben (Ansatz A)

## Ziel
Systematische Prüfung der kompletten UI/UX im laufenden Spiel (alle Screens, Desktop + Mobile) plus Code-Review des Styling-/UI-Systems. Findings priorisieren, anschließend die wichtigsten Probleme beheben.

## Vorgehen
1. **Audit-Phase**
   - Dev-Server (`npm run dev`) starten, alle Screens per Browser-Automation aufrufen.
   - Pro Screen: Screenshot, Accessibility-Snapshot, Konsolen-Fehler; Viewports 1280×800 (Desktop) und 375×812 (Mobile).
   - Parallel Code-Review: `src/styles/*` (Token-Nutzung, Kaskade, Desktop/Mobile-Paarung) und `src/ui/*` (Focus/Hover-Zustände, Teardown-Leaks, Konsistenz).
2. **Priorisierung**
   - Findings-Liste nach Schweregrad (Kritisch / Hoch / Mittel / Niedrig) in `docs/superpowers/specs/2026-07-10-ui-ux-audit-findings.md`.
3. **Fix-Phase**
   - Kritische und hohe Findings zuerst; Desktop- und Mobile-CSS immer gepaart ändern; kleine, lokale Edits gemäß AGENTS.md.
   - Verifikation im Browser nach jedem Fix-Block.
4. **Abschluss**
   - `npm run build` (beide Validatoren + Vite-Build) als finale Prüfung.

## Rahmenbedingungen (aus AGENTS.md)
- CSS wird global aus `src/main.js` importiert → Kaskadeneffekte über Screens hinweg prüfen.
- `bootstrap.js` ist Integrations-Hub → keine Service-Umbenennungen.
- Keine breiten Refactorings; Content-IDs und Validatoren unangetastet lassen, sofern nicht nötig.
