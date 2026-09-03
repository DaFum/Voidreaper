## 2024-09-03 - [Redundant Screen Reader Announcements in Disabled Elements]
**Learning:** When using `<small>` elements to visually explain why a button is disabled, screen readers will often read both the button's standard `aria-label` and the text inside the `<small>` tag, causing confusing redundancy.
**Action:** When adding visible `<small>` explanation text to a disabled element, always add `aria-hidden="true"` to the `<small>` element and ensure the parent button's `aria-label` contains the full combined context.
