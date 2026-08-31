import { escapeHtml } from "../escape-html.js";
import {
  animate,
  animatePanelEnter,
  animatePressFeedback,
  MOTION_TIMINGS,
  MOTION_EASINGS,
} from "../motion/motion.js";
import { isReducedMotion } from "../motion/reduced-motion.js";

const finiteCoordinate = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const PORT_STATE_CLASS = Object.freeze({
  occupied: "assembly-port--occupied",
  valid: "assembly-port--valid",
  invalid: "assembly-port--invalid",
  free: "",
});

export function createAssemblyWorkbenchScreen(root, { onAction } = {}) {
  root.innerHTML = `<section class="assembly-workbench" aria-label="Schiffswerkbank"><aside class="assembly-workbench__inventory"><header><small>RUN-INVENTAR</small><h2>MODULE</h2><button type="button" data-action="close">ZURÜCK ZUR KARTE</button></header><div data-role="inventory"></div></aside><main class="assembly-workbench__stage"><div class="assembly-toolbar" data-role="modes"></div><canvas data-role="canvas" width="960" height="640"></canvas><div class="assembly-stage__layer" data-role="ports"></div><div class="assembly-camera" role="group" aria-label="Ansicht" data-tutorial-id="workbench-actions"><button type="button" data-action="zoom-in" aria-label="Vergrößern" title="Vergrößern">+</button><button type="button" data-action="zoom-out" aria-label="Verkleinern" title="Verkleinern">−</button><button type="button" data-action="reset-view" aria-label="Ansicht zurücksetzen" title="Ansicht zurücksetzen">⌖</button></div><footer class="assembly-stage__hint" data-role="hint" aria-live="polite"></footer></main><aside class="assembly-workbench__inspector" data-role="inspector"></aside></section>`;

  const abort = new AbortController();
  let currentInspectorAnim = null;
  const previousPortStates = new Map();

  root.addEventListener(
    "click",
    (event) => {
      const control = event.target.closest("[data-action]"),
        action = control?.dataset.action;
      if (action && !control.disabled) {
        animatePressFeedback(control);
        onAction?.(action, control.dataset);
      }
    },
    { signal: abort.signal },
  );

  return {
    root,
    canvas: root.querySelector("canvas"),
    portsLayer: root.querySelector('[data-role="ports"]'),
    destroy() {
      if (currentInspectorAnim?.cancel) currentInspectorAnim.cancel();
      abort.abort();
    },
    renderInventory(items, selectedItemId = null) {
      root.querySelector('[data-role="inventory"]').innerHTML = items.length
        ? items
            .map(
              (item) =>
                `<button type="button" data-action="select-item" data-id="${escapeHtml(item.instanceId)}" aria-pressed="${item.instanceId === selectedItemId}"><span class="assembly-item__name">${escapeHtml(item.label ?? item.definitionId)}</span><span class="assembly-item__meta">${item.sizeClass ? `<b>${escapeHtml(item.sizeClass)}</b>` : ""}<small>${item.stored ? "EINGELAGERT" : "BEREIT"}</small></span></button>`,
            )
            .join("")
        : `<p class="assembly-inventory__empty">Keine losen Module.<br>Beute aus Kämpfen landet hier.</p>`;
    },
    renderPorts(ports, { selectedPortId = null, selectedNodeId = null } = {}) {
      const portsContainer = root.querySelector('[data-role="ports"]');
      portsContainer.innerHTML = ports
        .map((port) => {
          const state = port.occupiedByNodeId
              ? "occupied"
              : (port.state ?? "free"),
            selected = port.occupiedByNodeId
              ? port.occupiedByNodeId === selectedNodeId
              : port.portId === selectedPortId;
          const portKey = port.occupiedByNodeId ?? port.portId;
          return `<button type="button" class="assembly-port ${PORT_STATE_CLASS[state] ?? ""}${selected ? " assembly-port--selected" : ""}" style="left:calc(50% + ${finiteCoordinate(port.position?.x)}px);top:calc(50% + ${finiteCoordinate(port.position?.y)}px)" data-action="${port.occupiedByNodeId ? "select-node" : "select-port"}" data-id="${escapeHtml(portKey)}"${port.reasonText ? ` title="${escapeHtml(port.reasonText)}"` : ` title="${escapeHtml(port.occupiedByNodeId ? `${port.label}, Modul auswählen` : port.label)}"`} aria-label="${escapeHtml(port.occupiedByNodeId ? `${port.label}, Modul auswählen` : port.label)}"><i></i>${escapeHtml(port.sizeClass)}</button>`;
        })
        .join("");

      // Trigger state transition impulse animation for newly selected / changed ports
      if (!isReducedMotion()) {
        ports.forEach((port) => {
          const state = port.occupiedByNodeId ? "occupied" : (port.state ?? "free");
          const selected = port.occupiedByNodeId
            ? port.occupiedByNodeId === selectedNodeId
            : port.portId === selectedPortId;
          const key = port.occupiedByNodeId ?? port.portId;
          const prevState = previousPortStates.get(key);
          const stateKey = `${state}:${selected}`;

          if (prevState && prevState !== stateKey) {
            const btn = portsContainer.querySelector(`[data-id="${key}"]`);
            if (btn && typeof btn.animate === "function") {
              if (selected) {
                animate(
                  btn,
                  { transform: ["translate(-50%, -50%) scale(1)", "translate(-50%, -50%) scale(1.2)", "translate(-50%, -50%) scale(1)"] },
                  { duration: MOTION_TIMINGS.fast, ease: MOTION_EASINGS.impact }
                );
              } else if (state === "valid") {
                animate(
                  btn,
                  { transform: ["translate(-50%, -50%) scale(0.9)", "translate(-50%, -50%) scale(1.1)", "translate(-50%, -50%) scale(1)"] },
                  { duration: MOTION_TIMINGS.feedback, ease: MOTION_EASINGS.ui }
                );
              }
            }
          }
          previousPortStates.set(key, stateKey);
        });
      }
    },
    setHint(text) {
      const hint = root.querySelector('[data-role="hint"]');
      if (hint.textContent !== text) hint.textContent = text ?? "";
    },
    setInspector(content) {
      const inspector = root.querySelector('[data-role="inspector"]');
      if (currentInspectorAnim?.cancel) currentInspectorAnim.cancel();

      if (isReducedMotion() || !inspector) {
        inspector.replaceChildren(content);
        return;
      }

      // Fast directional opacity cross-fade transition
      inspector.replaceChildren(content);
      currentInspectorAnim = animatePanelEnter(inspector, { yOffset: 6 });
    },
  };
}
