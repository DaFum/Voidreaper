import { createSectorNode } from "../components/sector-node.js";
import { flattenSectorMap } from "../../features/sectors/sector-map-generator.js";

export function createSectorMapScreen(root, { onConfirm = () => {}, onWorkbench = null } = {}) {
  let selectedId = null;
  let model = null;

  function statusFor(node) {
    if (model.visitedNodeIds.includes(node.id)) return "visited";
    if (model.reachableNodeIds.includes(node.id)) return "reachable";
    return "locked";
  }

  function render(nextModel = model) {
    model = nextModel;
    if (!root || !model?.map) return;
    const nodes = flattenSectorMap(model.map).filter(node => node.regionIndex === model.regionIndex);
    root.innerHTML = `<section class="sector-map"><header><span>VR // SECTOR TRACE</span><b>REGION ${model.regionIndex + 1}/5</b>${onWorkbench?`<button class="btn small" data-assembly-workbench>WERKBANK</button>`:""}</header><div class="sector-map__graph"></div><aside class="sector-map__detail">Signal wählen. Zweiter Tap bestätigt den erreichbaren Knoten.</aside></section>`;
    root.querySelector("[data-assembly-workbench]")?.addEventListener("click",onWorkbench);
    const graph = root.querySelector(".sector-map__graph");
    for (const node of nodes) {
      graph.append(createSectorNode(node, {
        status: statusFor(node),
        selected: selectedId === node.id,
        onSelect(candidate, alreadySelected) {
          if (alreadySelected) return onConfirm(candidate);
          selectedId = candidate.id;
          render();
        }
      }));
    }
    const selected = nodes.find(node => node.id === selectedId);
    if (selected) root.querySelector(".sector-map__detail").textContent = `${selected.reward} · Korruption ${selected.corruptionDelta >= 0 ? "+" : ""}${selected.corruptionDelta} · erneut tippen zum Bestätigen`;
  }

  return { render, clearSelection() { selectedId = null; } };
}
