# 2024-05-24 - Tooltips for icon buttons and disabled states

**Learning:** `aria-label` and `title` alone provide context to screen readers and desktop users, but sighted users relying on touch devices will not see `title` tooltips.
**Action:** Keep `title` as a desktop enhancement, but add visible contextual text (like explicit button text labels) to ensure all users, including touch users, understand what an icon does or why an action is unavailable.

## 2024-05-19 - Assembly Port Button Fallback Titles
**Learning:** In the ship assembly workbench, `assembly-port` buttons only displayed a `title` tooltip when they were invalid (via `reasonText`). Sighted users hovering over valid ports did not receive the context (e.g., "MEDIUM PORT, Modul auswählen") that screen readers received via `aria-label`.
**Action:** Always ensure that icon-only interactive elements (like the port buttons) provide a `title` attribute matching the `aria-label` when a more specific error or reason title is not present, ensuring equal context for sighted users.
