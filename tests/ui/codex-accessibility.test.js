import test from "node:test";
import assert from "node:assert/strict";
import { renderCodexScreen } from "../../src/ui/screens/codex-screen.js";

test("codex select filters have explicit accessible names", () => {
  const root = { innerHTML: "", querySelectorAll: () => [] };
  renderCodexScreen(root, { entries: [] });

  assert.match(root.innerHTML, /aria-label="Kategorie"/);
  assert.match(root.innerHTML, /aria-label="Entdeckungsstatus"/);
});

test("codex filters persist in rendered controls", () => {
  const root = { innerHTML: "", querySelectorAll: () => [] };
  renderCodexScreen(root, { entries: [], filters: { category: "weapons", status: "analyzed", tag: "Void", source: "boss" } });

  assert.match(root.innerHTML, /<option value="weapons" selected>weapons<\/option>/);
  assert.match(root.innerHTML, /<option value="analyzed" selected>analyzed<\/option>/);
  assert.match(root.innerHTML, /data-tag[^>]*value="Void"/);
  assert.match(root.innerHTML, /data-source[^>]*value="boss"/);
});

test("codex shows an empty state when active filters match nothing", () => {
  const root = { innerHTML: "", querySelectorAll: () => [] };
  renderCodexScreen(root, { entries: [], filters: { tag: "missing" } });
  assert.match(root.innerHTML, /KEINE PASSENDEN SIGNALE/);
});
