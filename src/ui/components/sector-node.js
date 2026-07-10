import { NODE_TYPES } from "../../content/sectors/node-types.js";

export function createSectorNode(node, { status, selected, onSelect }) {
  const definition = NODE_TYPES[node.type] ?? NODE_TYPES.combat;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `sector-node sector-node--${status}`;
  button.dataset.nodeId = node.id;
  button.setAttribute("aria-pressed", String(selected));
  button.disabled = status === "locked";
  const hidden = node.informationLevel < 1 && status !== "visited";
  button.innerHTML = hidden
    ? `<b>?</b><span>UNBEKANNTE SIGNATUR</span><small>Gefahr ${node.danger}</small>`
    : `<b>${definition.icon}</b><span>${definition.label}</span><small>${node.regionId.replaceAll("-", " ")} · Gefahr ${node.danger}<br>${node.reward} · Korr. ${node.corruptionDelta >= 0 ? "+" : ""}${node.corruptionDelta}</small>`;
  button.addEventListener("click", () => onSelect(node, selected));
  return button;
}
