import test from "node:test";
import assert from "node:assert/strict";
import { createAssemblyWorkbenchScreen } from "../../src/ui/ship-assembly/assembly-workbench-screen.js";

test("invalid workbench ports stay clickable without claiming to be disabled", () => {
  const portsLayer = { innerHTML: "" };
  const elements = new Map([
    ['[data-role="ports"]', portsLayer],
    ["canvas", {}]
  ]);
  const root = {
    innerHTML: "",
    addEventListener() {},
    querySelector: selector => elements.get(selector) ?? {}
  };
  const screen = createAssemblyWorkbenchScreen(root);

  screen.renderPorts([{
    portId: "port-1",
    state: "invalid",
    label: "S-Port, inkompatibel: Energietyp",
    reasonText: "Energietyp nicht kompatibel",
    sizeClass: "S",
    position: { x: 0, y: 0 }
  }]);

  assert.match(portsLayer.innerHTML, /data-action="select-port"/);
  assert.match(portsLayer.innerHTML, /aria-label="S-Port, inkompatibel: Energietyp"/);
  assert.doesNotMatch(portsLayer.innerHTML, /aria-disabled/);
});
