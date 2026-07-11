export function attachStartMenuToggle(startScreen, { openButton, closeButton } = {}) {
  if (!startScreen) return { open() {}, close() {}, destroy() {} };
  const setView = view => { startScreen.dataset.view = view; };
  const open = () => setView("menu");
  const close = () => setView("home");
  if (!startScreen.dataset.view) setView("home");
  openButton?.addEventListener("click", open);
  closeButton?.addEventListener("click", close);
  return { open, close, destroy() { openButton?.removeEventListener("click", open); closeButton?.removeEventListener("click", close); } };
}
