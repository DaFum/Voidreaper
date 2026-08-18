# 2024-05-24 - Tooltips for icon buttons and disabled states

**Learning:** `aria-label` and `title` alone provide context to screen readers and desktop users, but sighted users relying on touch devices will not see `title` tooltips.
**Action:** Keep `title` as a desktop enhancement, but add visible contextual text (like explicit button text labels) to ensure all users, including touch users, understand what an icon does or why an action is unavailable.

## 2024-08-18 - Added descriptive attributes to disabled state
**Learning:** In the research tree grid, disabling buttons natively (`disabled` attribute) communicates state to standard controls, but fails to provide context as to *why* an action is unavailable. Using both an `aria-label` and `title` tooltip allows screen-reader users and mouse-hover users to understand why (e.g. "Bereits erforscht" vs "Voraussetzungen nicht erfüllt").
**Action:** When adding or maintaining interactive elements that can be disabled due to specific conditions, ensure that native `title` and `aria-label` attributes provide descriptive, context-aware reasoning for the disabled state, matching the app's German localization.
