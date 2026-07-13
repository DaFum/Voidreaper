import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// bootstrap.js wires together the entire application (services, screens, the
// legacy game loop, ...) and cannot be exercised as a plain unit without
// standing up the whole runtime. These tests instead guard the actual change
// made to this file: rewrapping long lines/string concatenations to stay
// within a 120 character line limit without altering behaviour or wording.
const bootstrapPath = fileURLToPath(
  new URL("../../src/app/bootstrap.js", import.meta.url),
);
const source = readFileSync(bootstrapPath, "utf8");
const lines = source.split("\n");

test("bootstrap.js remains syntactically valid after the line-wrap refactor", () => {
  // node --check parses the file as an ES module without importing it, so this
  // catches broken template literals/mismatched brackets from manual
  // rewrapping without pulling in the module's huge dependency graph.
  assert.doesNotThrow(() =>
    execFileSync(process.execPath, ["--check", bootstrapPath]),
  );
});

test("no line in bootstrap.js exceeds the 120 character limit", () => {
  const overLength = lines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => line.length > 120);

  assert.deepEqual(
    overLength.map(({ number }) => number),
    [],
    `expected no lines over 120 characters, found lines: ${overLength
      .map(({ number, line }) => `${number} (${line.length} chars)`)
      .join(", ")}`,
  );
});

test("bootstrap still exposes exactly one export: the async bootstrap function", () => {
  const exportLines = lines.filter((line) => line.startsWith("export"));
  assert.deepEqual(exportLines, ["export async function bootstrap() {"]);
});

test("the wrapped ships/weapons/reactors/modules content summary preserves its exact wording", () => {
  const match = source.match(
    /console\.info\(\s*(`[^`]*`)\s*\+\s*(`[^`]*`),?\s*\);/,
  );
  assert.ok(match, "expected the wrapped content-summary console.info call");

  const combined = match[1].slice(1, -1) + match[2].slice(1, -1);
  assert.equal(
    combined,
    "[content] ${SHIPS.length} ships · ${WEAPONS.length} weapons · " +
      "${REACTORS.length} reactors · ${MODULES.length} modules",
  );
});

test("the wrapped wreck-signal placeholder markup preserves its exact wording", () => {
  const match = source.match(
    /content\.innerHTML\s*=\s*(`[^`]*`)\s*\+\s*(`[^`]*`);/,
  );
  assert.ok(match, "expected the wrapped wreck-signal placeholder markup");

  const combined = match[1].slice(1, -1) + match[2].slice(1, -1);
  assert.equal(
    combined,
    '<div class="hangar-placeholder"><strong>KEIN AKTIVES WRACK-SIGNAL</strong>' +
      "<span>Legendäre verlorene Prototypen erscheinen nach dem nächsten Run.</span></div>",
  );
});

test("the rewrapped import specifiers were not accidentally duplicated or dropped", () => {
  // Manually wrapping a multi-line `import { a, b, c } from "...";` statement
  // risks losing or repeating a specifier. Every wrapped named-import block
  // should still resolve to a well-formed, de-duplicated specifier list.
  const importBlockPattern = /import\s*\{([^}]*)\}\s*from\s*"[^"]+";/gs;
  let match;
  let checkedMultilineImports = 0;

  while ((match = importBlockPattern.exec(source)) !== null) {
    if (!match[0].includes("\n")) continue;
    checkedMultilineImports += 1;

    const specifiers = match[1]
      .split(",")
      .map((specifier) => specifier.trim())
      .filter((specifier) => specifier.length > 0);

    assert.deepEqual(
      specifiers,
      [...new Set(specifiers)],
      `duplicate import specifier detected in: ${match[0]}`,
    );
    for (const specifier of specifiers)
      assert.match(specifier, /^[A-Za-z_$][\w$]*$/, `malformed import specifier: "${specifier}"`);
  }

  assert.ok(
    checkedMultilineImports > 0,
    "expected at least one multi-line named import to verify",
  );
});