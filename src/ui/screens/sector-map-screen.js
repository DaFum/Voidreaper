import { createSectorNode, updateSectorNode } from "../components/sector-node.js";
import { flattenSectorMap } from "../../features/sectors/sector-map-generator.js";
import { createSectorMapConnections } from "../components/sector-map-connections.js";
import { escapeHtml } from "../escape-html.js";
import { animate, MOTION_TIMINGS, MOTION_EASINGS } from "../motion/motion.js";
import { isReducedMotion } from "../motion/reduced-motion.js";

export function createSectorMapScreen(
  root,
  { onConfirm = () => {}, onWorkbench = null, onSelect = () => {} } = {},
) {
  let selectedId = null;
  let model = null;
  let connections = null;

  function statusFor(node, visitedSet, reachableSet) {
    if (visitedSet.has(node.id)) return "visited";
    if (reachableSet.has(node.id)) return "reachable";
    return "locked";
  }

  function render(nextModel = model) {
    model = nextModel;
    if (!root || !model?.map) return;
    connections?.destroy();
    connections = null;
    const visitedSet = new Set(model.visitedNodeIds);
    const reachableSet = new Set(model.reachableNodeIds);
    const nodes = flattenSectorMap(model.map).filter(
      (node) => node.regionIndex === model.regionIndex,
    );
    let graph = root.querySelector(".sector-map__graph");
    const hasWorkbenchBtn = Boolean(root.querySelector("[data-assembly-workbench]"));
    if (!graph || graph.dataset.regionIndex !== String(model.regionIndex) || hasWorkbenchBtn !== Boolean(onWorkbench)) {
      root.innerHTML = `<section class="sector-map" data-tutorial-id="sector-map"><header><span>VR // SECTOR TRACE</span><b>REGION ${escapeHtml(model.regionIndex + 1)}/5</b>${onWorkbench ? `<button type="button" class="btn small" data-assembly-workbench>WERKBANK</button>` : ""}</header><div class="sector-map__graph" data-region-index="${model.regionIndex}"></div><aside class="sector-map__detail" data-tutorial-id="sector-detail">Signal wählen. Zweiter Tap bestätigt den erreichbaren Knoten.</aside></section>`;
      root
        .querySelector("[data-assembly-workbench]")
        ?.addEventListener("click", onWorkbench);
      graph = root.querySelector(".sector-map__graph");
    }

    const existingNodes = new Map();
    for (const child of graph.children) {
      const id = child.dataset?.nodeId ?? child.dataset?.id;
      if (id) existingNodes.set(id, child);
    }

    const nodeElements = [];
    const fragment = document.createDocumentFragment();

    for (const node of nodes) {
      const isSel = selectedId === node.id;
      const options = {
        status: statusFor(node, visitedSet, reachableSet),
        selected: isSel,
        onSelect(candidate, alreadySelected) {
          if (alreadySelected) return onConfirm(candidate);
          selectedId = candidate.id;
          onSelect(candidate);
          render();
        },
      };

      let element;
      let wasSel = false;
      if (existingNodes.has(node.id)) {
        element = existingNodes.get(node.id);
        wasSel = element.getAttribute("aria-selected") === "true" || element.getAttribute("aria-pressed") === "true";
        updateSectorNode(element, node, options);
      } else {
        element = createSectorNode(node, options);
        fragment.append(element);
      }

      if (isSel && !wasSel && !isReducedMotion() && typeof element.animate === "function") {
        animate(
          element,
          { transform: ["translateY(-4px) scale(1)", "translateY(-4px) scale(1.15)", "translateY(-4px) scale(1)"] },
          { duration: MOTION_TIMINGS.fast, ease: MOTION_EASINGS.impact }
        );
      }

      nodeElements.push(element);
    }

    if (fragment.children.length > 0) {
      graph.append(fragment);
    }
    connections = createSectorMapConnections(nodes, nodeElements);
    const selected = nodes.find((node) => node.id === selectedId);
    if (selected)
      root.querySelector(".sector-map__detail").textContent =
        `${selected.reward} · Korruption ${selected.corruptionDelta >= 0 ? "+" : ""}${selected.corruptionDelta} · erneut tippen zum Bestätigen`;
  }

  return {
    render,
    clearSelection() {
      selectedId = null;
    },
    destroy() {
      connections?.destroy();
      connections = null;
      root?.replaceChildren();
    },
  };
}
