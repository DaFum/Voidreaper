# UX and Accessibility Learnings

## 2024-07-25 - Complement aria-label with title for better UX
**Learning:** Adding an `aria-label` to an icon-only or disabled button successfully supports screen readers, but sighted users miss out on this context when they hover over these elements.
**Action:** Always complement `aria-label` attributes on icon-only buttons or disabled interactive elements with the standard HTML `title` attribute. This ensures sighted users hovering over the element receive the same helpful context provided to screen readers.
