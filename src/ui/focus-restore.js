// Builds a selector that re-identifies the focused element after a full
// innerHTML re-render. Uses the element's first data-* attribute including its
// value, so grids with many elements sharing the same attribute key (e.g.
// data-level, data-favorite) restore focus to the right element instead of the
// first match.
export function buildFocusSelector(root, activeElement) {
  if (!activeElement || !root?.contains(activeElement)) return null;
  const key = activeElement.dataset ? Object.keys(activeElement.dataset)[0] : null;
  if (!key) return null;
  const attribute = `data-${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
  const value = activeElement.dataset[key];
  return value ? `[${attribute}="${value.replace(/"/g, '\\"')}"]` : `[${attribute}]`;
}
