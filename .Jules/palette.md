## 2026-07-11 - Add ARIA label to Prototype Vault favorites
**Learning:** Icon-only buttons (like favorite stars ★/☆) must have clear, localized `aria-label` attributes.
**Action:** Next time I will make sure ARIA labels match the locale of the app.

## 2024-05-14 - Modals and Overlays

**Learning:** App overlays in `index.html` like the pause screen (`#pausescr`) and game over screen (`#over`) function as dialogs but initially lacked standard ARIA dialog attributes. Screen readers would not have known these were modal overlays. Pointing `aria-labelledby` at the stylized headings (split `<span>`s plus `::before`/`::after` glitch pseudo-elements) causes duplicated or fragmented announcements, so a plain `aria-label` on the dialog container is preferred. Note that `role="dialog"` and `aria-modal="true"` only provide semantics and an accessible name — they do not move or trap focus.
**Action:** When adding or updating overlay screens in this app, ensure they include `role="dialog"`, `aria-modal="true"`, and a clean `aria-label` attribute (not `aria-labelledby` on stylized headings), and handle focus management (moving focus into the dialog on open) separately at runtime.

## 2024-07-15 - Add confirmation dialog to Abandon Run

**Learning:** Using the custom uiConfirm modal dialog ensures visual consistency and accessibility across the application, even when triggering actions from legacy runtime files.
**Action:** Use the existing uiConfirm helper for confirmation dialogs to maintain a unified theme and consistent user experience.
