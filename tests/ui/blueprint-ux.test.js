import test from "node:test";
import assert from "node:assert/strict";
import { blueprintImportErrorMessage } from "../../src/ui/ship-assembly/blueprint-import-dialog.js";
import { isBlueprintDetailAction } from "../../src/ui/ship-assembly/blueprint-detail-screen.js";

test("raw parser failures become an actionable blueprint message", () => {
  const message = blueprintImportErrorMessage(new SyntaxError("Unexpected token '�', invalid JSON"));
  assert.equal(message, "Der Bauplan-Code ist beschädigt oder unvollständig.");
});

test("known blueprint format guidance remains visible", () => {
  assert.equal(blueprintImportErrorMessage(new Error("Ungültiges Bauplanformat")), "Ungültiges Bauplanformat");
});

test("detail delegation ignores library actions after returning to the archive", () => {
  assert.equal(isBlueprintDetailAction("back"), true);
  assert.equal(isBlueprintDetailAction("import"), false);
  assert.equal(isBlueprintDetailAction("create"), false);
});
