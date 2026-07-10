import test from "node:test";
import assert from "node:assert/strict";
import { renderCodexScreen } from "../../src/ui/screens/codex-screen.js";

test("codex select filters have explicit accessible names", () => {
  const root = { innerHTML: "", querySelectorAll: () => [] };
  renderCodexScreen(root, { entries: [] });

  assert.match(root.innerHTML, /aria-label="Kategorie"/);
  assert.match(root.innerHTML, /aria-label="Entdeckungsstatus"/);
});
