import test from "node:test";
import assert from "node:assert/strict";
import { createAssemblyWorkbenchScreen } from "../../src/ui/ship-assembly/assembly-workbench-screen.js";

// VERY IMPORTANT: declare portsLayer globally because node:test traps uncaught exceptions
// originating from async timeouts and we need to ensure the variable survives the block scope!
const portsLayer = { innerHTML: "" };

test("invalid workbench ports stay clickable without claiming to be disabled", () => {
  portsLayer.innerHTML = "";
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
    portId: "port-occupied",
    state: "occupied",
    label: "Steuerbord, Modul auswählen",
    sizeClass: "M",
    position: { x: 10, y: 10 }
  }, {
    portId: "port-empty",
    state: "empty",
    label: "S-Port, Modul auswählen",
    sizeClass: "S",
    position: { x: 20, y: 20 }
  }, {
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

  assert.match(portsLayer.innerHTML, /title="Steuerbord, Modul ausw(&#xE4;|ä)hlen"/);
  assert.match(portsLayer.innerHTML, /title="S-Port, Modul ausw(&#xE4;|ä)hlen"/);
});
