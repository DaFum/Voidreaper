import { createSectorNode } from "../components/sector-node.js";
import { flattenSectorMap } from "../../features/sectors/sector-map-generator.js";
import { createSectorMapConnections } from "../components/sector-map-connections.js";
import { escapeHtml } from "../escape-html.js";

export function createSectorMapScreen(root, { onConfirm = () => {}, onWorkbench = null, onSelect = () => {} } = {}) {
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
    const nodes = flattenSectorMap(model.map).filter(node => node.regionIndex === model.regionIndex);
    root.innerHTML = `<section class="sector-map" data-tutorial-id="sector-map"><header><span>VR // SECTOR TRACE</span><b>REGION ${escapeHtml(model.regionIndex + 1)}/5</b>${onWorkbench?`<button class="btn small" data-assembly-workbench>WERKBANK</button>`:""}</header><div class="sector-map__graph"></div><aside class="sector-map__detail" data-tutorial-id="sector-detail">Signal wählen. Zweiter Tap bestätigt den erreichbaren Knoten.</aside></section>`;
    root.querySelector("[data-assembly-workbench]")?.addEventListener("click",onWorkbench);
    const graph = root.querySelector(".sector-map__graph");
    const nodeElements = [];
    for (const node of nodes) {
      const element=createSectorNode(node, {
        status: statusFor(node, visitedSet, reachableSet),
        selected: selectedId === node.id,
        onSelect(candidate, alreadySelected) {
          if (alreadySelected) return onConfirm(candidate);
          selectedId = candidate.id; onSelect(candidate);
          render();
        }
      });
      nodeElements.push(element);
      graph.append(element);
    }
    connections=createSectorMapConnections(nodes,nodeElements);
    const selected = nodes.find(node => node.id === selectedId);
    if (selected) root.querySelector(".sector-map__detail").textContent = `${selected.reward} · Korruption ${selected.corruptionDelta >= 0 ? "+" : ""}${selected.corruptionDelta} · erneut tippen zum Bestätigen`;
  }

  return { render, clearSelection() { selectedId = null; }, destroy() { connections?.destroy(); connections=null; root?.replaceChildren(); } };
}
