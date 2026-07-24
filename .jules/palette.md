## 2024-05-24 - Tooltips for icon buttons and disabled states
**Learning:** `aria-label` alone provides context to screen readers, but sighted users relying on mice (or hovering via touch) may lack context when clicking icon-only buttons or seeing disabled buttons. Without tooltips, they might not understand what an icon does or why an action is unavailable.
**Action:** Always complement `aria-label` on icon-only buttons with the `title` attribute, and consider using `title` to explain disabled states, ensuring clear feedback for both assistive technology and visual users.
