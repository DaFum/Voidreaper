# 2024-05-24 - Tooltips for icon buttons and disabled states

**Learning:** `aria-label` and `title` alone provide context to screen readers and desktop users, but sighted users relying on touch devices will not see `title` tooltips.
**Action:** Keep `title` as a desktop enhancement, but add visible contextual text (like explicit button text labels) to ensure all users, including touch users, understand what an icon does or why an action is unavailable.

## 2024-08-22 - Stateful Toggle Button Accessibility
**Learning:** For stateful toggle buttons (like favorites or bookmarks), `aria-pressed` is crucial to communicate the current state to screen reader users. Simply changing text visually isn't enough. Separating the visual icon and hiding the visible text using `aria-hidden="true"` while providing a robust `aria-label` prevents duplicate screen reader announcements while ensuring full clarity.
**Action:** Always include `aria-pressed`, `aria-label`, and a visible tooltip (`title`) when implementing toggle buttons. Use `aria-hidden="true"` on visible text nodes if they are redundant to the `aria-label`.
## 2024-08-18 - Added descriptive attributes to disabled state
**Learning:** In the research tree grid, disabling buttons natively (`disabled` attribute) communicates state to standard controls, but fails to provide context as to *why* an action is unavailable. Using both an `aria-label` and `title` tooltip allows screen-reader users and mouse-hover users to understand why (e.g. "Bereits erforscht" vs "Voraussetzungen nicht erfüllt").
**Action:** When adding or maintaining interactive elements that can be disabled due to specific conditions, ensure that native `title` and `aria-label` attributes provide descriptive, context-aware reasoning for the disabled state, matching the app's German localization.

## 2024-08-18 - Avoid replacing visible button labels with aria-label
**Learning:** Using `aria-label` to provide the disabled reason entirely replaces the visible button text ("FORSCHEN") for screen reader users, violating WCAG 2.5.3 (Label in Name).
**Action:** Provide additional context alongside the button text (e.g. visible text within the button like `<small>(Reason)</small>`) instead of overwriting the element's accessible name with `aria-label`. Keep `title` for supplementary hover context.
## 2024-05-19 - Assembly Port Button Fallback Titles
**Learning:** In the ship assembly workbench, `assembly-port` buttons only displayed a `title` tooltip when they were invalid (via `reasonText`). Sighted users hovering over valid ports did not receive the context (e.g., "MEDIUM PORT, Modul auswählen") that screen readers received via `aria-label`.
**Action:** Always ensure that icon-only interactive elements (like the port buttons) provide a `title` attribute matching the `aria-label` when a more specific error or reason title is not present, ensuring equal context for sighted users.

## 2024-08-27 - Contextual Disabled States for Secondary Action Buttons
**Learning:** Secondary UI actions (like the Merchant "Reroll" button) that can be unavailable due to missing resources (e.g., Scrap) often lacked contextual feedback when disabled. Relying solely on the native `disabled` attribute leaves users wondering why an action is blocked.
**Action:** When adding or maintaining secondary interactive elements that can be disabled due to specific conditions, ensure that native `title` and `aria-label` attributes provide descriptive, context-aware reasoning for the disabled state, and embed a visible ` <small aria-hidden="true">(reason)</small>` directly in the button to provide context to all users, especially touch users, while ensuring accessibility via `aria-label`.
## 2024-09-15 - Hide decorative icons from screen readers
**Learning:** Screen readers often read out literal character names for decorative Unicode icons (e.g., `‖`, `☰`, `←`), which can be confusing for users (e.g., reading "Trigram for Heaven" for a hamburger menu icon).
**Action:** When adding or maintaining interactive elements with decorative text-based symbols or Unicode icons, wrap them in `<span aria-hidden="true">` to prevent assistive technologies from announcing them, while relying on `aria-label` for semantic meaning.

## 2024-05-24 - Contextual disabled states for HUD action buttons
**Learning:** The active module slots in the HUD (`#active1btn`, `#active2btn`) were disabled when empty, but lacked visible context for why they couldn't be used, relying only on the word "EMPTY" and standard `disabled` attributes.
**Action:** Always add a visible `<small aria-hidden="true">(Slot empty)</small>` and an updated `title`/`aria-label` to HUD action buttons that are disabled due to missing equipment, providing clear context for both sighted and touch users, consistent with secondary UI actions elsewhere.
## 2026-09-10 - Visible Context for Legacy UI Action Buttons
**Learning:** The legacy UI buttons (Reroll and Banish) lacked visible feedback when disabled (e.g., when no rerolls or banishes remain). This means touch users could not see why the actions were disabled since they don't see tooltips.
**Action:** Appended visible text via `<small aria-hidden="true">(reason)</small>` to disabled buttons in legacy systems, complementing existing `aria-label` and `title` updates for a universally accessible experience.
## 2026-09-21 - Added aria-hidden to decorative Unicode icons\n**Learning:** Screen readers often read out the literal name of decorative Unicode icons (e.g. "Leftwards arrow", "Black star", "Anticlockwise gapped circle arrow"), which is confusing when they are used alongside textual labels or just for visual flair inside interactive elements.\n**Action:** Wraps decorative Unicode icons inside interactive elements with `<span aria-hidden="true">`. This ensures they are ignored by screen readers while keeping textual labels untouched, improving the auditory experience without altering visuals.
