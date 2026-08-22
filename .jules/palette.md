# 2024-05-24 - Tooltips for icon buttons and disabled states

**Learning:** `aria-label` and `title` alone provide context to screen readers and desktop users, but sighted users relying on touch devices will not see `title` tooltips.
**Action:** Keep `title` as a desktop enhancement, but add visible contextual text (like explicit button text labels) to ensure all users, including touch users, understand what an icon does or why an action is unavailable.

## 2024-08-22 - Stateful Toggle Button Accessibility
**Learning:** For stateful toggle buttons (like favorites or bookmarks), `aria-pressed` is crucial to communicate the current state to screen reader users. Simply changing text visually isn't enough. Separating the visual icon and hiding the visible text using `aria-hidden="true"` while providing a robust `aria-label` prevents duplicate screen reader announcements while ensuring full clarity.
**Action:** Always include `aria-pressed`, `aria-label`, and a visible tooltip (`title`) when implementing toggle buttons. Use `aria-hidden="true"` on visible text nodes if they are redundant to the `aria-label`.
