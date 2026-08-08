# 2024-05-24 - Tooltips for icon buttons and disabled states

**Learning:** `aria-label` and `title` alone provide context to screen readers and desktop users, but sighted users relying on touch devices will not see `title` tooltips.
**Action:** Keep `title` as a desktop enhancement, but add visible contextual text (like explicit button text labels) to ensure all users, including touch users, understand what an icon does or why an action is unavailable.

## 2024-08-08 - Added aria-label to research button
**Learning:** Some elements like buttons use the `title` attribute for tooltip/accessible text to explain *why* the button is disabled. In `research-screen.js`, there is a disabled button lacking a title or `aria-label` attribute when the item is locked due to lack of funds.
**Action:** Always add an `aria-label` or `title` property to buttons that become disabled for users to understand why it's disabled.
