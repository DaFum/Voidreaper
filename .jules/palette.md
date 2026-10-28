## 2026-07-11 - Add ARIA label to Prototype Vault favorites
**Learning:** Icon-only buttons (like favorite stars ★/☆) must have clear, localized `aria-label` attributes.
**Action:** Next time I will make sure ARIA labels match the locale of the app.

## 2024-05-14 - Modals and Overlays

**Learning:** App overlays in `index.html` like the pause screen (`#pausescr`) and game over screen (`#over`) function as dialogs but initially lacked standard ARIA dialog attributes. Screen readers would not have known these were modal overlays. Pointing `aria-labelledby` at the stylized headings (split `<span>`s plus `::before`/`::after` glitch pseudo-elements) causes duplicated or fragmented announcements, so a plain `aria-label` on the dialog container is preferred. Note that `role="dialog"` and `aria-modal="true"` only provide semantics and an accessible name — they do not move or trap focus.
**Action:** When adding or updating overlay screens in this app, ensure they include `role="dialog"`, `aria-modal="true"`, and a clean `aria-label` attribute (not `aria-labelledby` on stylized headings), and handle focus management (moving focus into the dialog on open) separately at runtime.

## 2024-07-15 - Add confirmation dialog to Abandon Run

**Learning:** Using the custom uiConfirm modal dialog ensures visual consistency and accessibility across the application, even when triggering actions from legacy runtime files.
**Action:** Use the existing uiConfirm helper for confirmation dialogs to maintain a unified theme and consistent user experience.

## 2025-05-18 - Improve Custom Modal Accessibility
**Learning:** Custom modals generated via DOM API (like in `modal-dialog.js`) need unique dynamically generated IDs so that `aria-labelledby` and `aria-describedby` can be correctly mapped between the `<dialog>` (and nested `<input>`) elements and the text content. Reusing static IDs causes mapping conflicts when multiple modals open sequentially or simultaneously.
**Action:** Always generate unique ID suffixes (e.g. using an incrementing counter) for modal title/message elements and tie them to ARIA reference attributes correctly inside custom dialog builders.

## 2024-08-03 - Add confirmation dialog to Prototype Dismantle

**Learning:** Destructive actions like dismantling prototypes should require user confirmation to prevent accidental data loss. The `uiConfirm` utility provides an accessible and visually consistent way to prompt the user.
**Action:** When adding destructive actions, always check if a confirmation step is appropriate and use `uiConfirm` with clear, localized messaging.

## 2024-08-03 - Revalidate Inventory Target
**Learning:** During UI interactions involving asynchronous operations (like modal confirmation dialogs via `uiConfirm`), the underlying state can change before the operation executes. When performing destructive actions, it's critical to revalidate the target's existence and mutate the state transactionally to avoid data corruption.
**Action:** When working with long-running confirmations (like `await uiConfirm`), perform the final state mutation inside an atomic update block (e.g. `services.save.update`) and immediately reload any cached representations of the state (like `metaSave`).

## 2024-09-03 - [Redundant Screen Reader Announcements in Disabled Elements]
**Learning:** When using `<small>` elements to visually explain why a button is disabled, screen readers will often read both the button's standard `aria-label` and the text inside the `<small>` tag, causing confusing redundancy.
**Action:** When adding visible `<small>` explanation text to a disabled element, always add `aria-hidden="true"` to the `<small>` element and ensure the parent button's `aria-label` contains the full combined context.
## 2026-07-11 - Add ARIA label to Prototype Vault favorites
**Learning:** Icon-only buttons (like favorite stars ★/☆) must have clear, localized `aria-label` attributes.
**Action:** Next time I will make sure ARIA labels match the locale of the app.

## 2024-05-14 - Modals and Overlays

**Learning:** App overlays in `index.html` like the pause screen (`#pausescr`) and game over screen (`#over`) function as dialogs but initially lacked standard ARIA dialog attributes. Screen readers would not have known these were modal overlays. Pointing `aria-labelledby` at the stylized headings (split `<span>`s plus `::before`/`::after` glitch pseudo-elements) causes duplicated or fragmented announcements, so a plain `aria-label` on the dialog container is preferred. Note that `role="dialog"` and `aria-modal="true"` only provide semantics and an accessible name — they do not move or trap focus.
**Action:** When adding or updating overlay screens in this app, ensure they include `role="dialog"`, `aria-modal="true"`, and a clean `aria-label` attribute (not `aria-labelledby` on stylized headings), and handle focus management (moving focus into the dialog on open) separately at runtime.

## 2024-07-15 - Add confirmation dialog to Abandon Run

**Learning:** Using the custom uiConfirm modal dialog ensures visual consistency and accessibility across the application, even when triggering actions from legacy runtime files.
**Action:** Use the existing uiConfirm helper for confirmation dialogs to maintain a unified theme and consistent user experience.

## 2024-05-24 - Contextual disabled states for HUD action buttons
**Learning:** The active module slots in the HUD (`#active1btn`, `#active2btn`) were disabled when empty, but lacked visible context for why they couldn't be used, relying only on the word "EMPTY" and standard `disabled` attributes.
**Action:** Always add a visible `<small aria-hidden="true">(Slot empty)</small>` and an updated `title`/`aria-label` to HUD action buttons that are disabled due to missing equipment, providing clear context for both sighted and touch users, consistent with secondary UI actions elsewhere.
## 2026-09-10 - Visible Context for Legacy UI Action Buttons
**Learning:** The legacy UI buttons (Reroll and Banish) lacked visible feedback when disabled (e.g., when no rerolls or banishes remain). This means touch users could not see why the actions were disabled since they don't see tooltips.
**Action:** Appended visible text via `<small aria-hidden="true">(reason)</small>` to disabled buttons in legacy systems, complementing existing `aria-label` and `title` updates for a universally accessible experience.
## 2024-05-18 - Decorative Unicode characters in interactive elements
**Learning:** Decorative Unicode characters (like `⟲`, `✕`, `◇`, or emojis) inside interactive elements are read out by screen readers using their literal character names (e.g., "anticlockwise open circle arrow", "white diamond"), which creates a poor audio experience.
**Action:** Wrap decorative text-based symbols or Unicode icons inside interactive elements with `<span aria-hidden="true">` to prevent screen readers from reading out literal character names.
## 2024-10-04 - Hiding decorative Unicode icons in Item Cards and Merchant Screen
**Learning:** Screen readers often announce Unicode characters used purely for decoration or UI structure (like `🔒` or `⟲`), causing unnecessary and confusing audio clutter. We need to hide these explicitly when the visual state they represent is already covered by the surrounding text or accessibility attributes.
**Action:** When working with UI elements that embed decorative Unicode icons (e.g. status indicators, reroll buttons), wrap the icon in a `<span aria-hidden="true">` tag to prevent screen readers from reading them out.
## 2024-10-24 - Screen readers reading emoji and Unicode characters literally
**Learning:** Screen readers often read out literal character names for decorative Unicode icons (e.g., `🔒`, `⟲`), which can be confusing for users.
**Action:** Wrap decorative text-based symbols or Unicode icons inside interactive elements with `<span aria-hidden="true">` to prevent assistive technologies from announcing them, while relying on `aria-label` or visible text for semantic meaning.
## 2025-05-18 - Improve Custom Modal Accessibility
**Learning:** Custom modals generated via DOM API (like in `modal-dialog.js`) need unique dynamically generated IDs so that `aria-labelledby` and `aria-describedby` can be correctly mapped between the `<dialog>` (and nested `<input>`) elements and the text content. Reusing static IDs causes mapping conflicts when multiple modals open sequentially or simultaneously.
**Action:** Always generate unique ID suffixes (e.g. using an incrementing counter) for modal title/message elements and tie them to ARIA reference attributes correctly inside custom dialog builders.

## 2024-08-03 - Add confirmation dialog to Prototype Dismantle

**Learning:** Destructive actions like dismantling prototypes should require user confirmation to prevent accidental data loss. The `uiConfirm` utility provides an accessible and visually consistent way to prompt the user.
**Action:** When adding destructive actions, always check if a confirmation step is appropriate and use `uiConfirm` with clear, localized messaging.

## 2024-08-03 - Revalidate Inventory Target
**Learning:** During UI interactions involving asynchronous operations (like modal confirmation dialogs via `uiConfirm`), the underlying state can change before the operation executes. When performing destructive actions, it's critical to revalidate the target's existence and mutate the state transactionally to avoid data corruption.
**Action:** When working with long-running confirmations (like `await uiConfirm`), perform the final state mutation inside an atomic update block (e.g. `services.save.update`) and immediately reload any cached representations of the state (like `metaSave`).

## 2024-09-03 - [Redundant Screen Reader Announcements in Disabled Elements]
**Learning:** When using `<small>` elements to visually explain why a button is disabled, screen readers will often read both the button's standard `aria-label` and the text inside the `<small>` tag, causing confusing redundancy.
**Action:** When adding visible `<small>` explanation text to a disabled element, always add `aria-hidden="true"` to the `<small>` element and ensure the parent button's `aria-label` contains the full combined context.
