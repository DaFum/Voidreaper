import { NODE_TYPES } from "../../content/sectors/node-types.js";
import { escapeHtml } from "../escape-html.js";


export const isSectorNodeInteractive = status => status === "reachable";

export function createSectorNode(node, { status, selected, onSelect }) {
  const definition = NODE_TYPES[node.type] ?? NODE_TYPES.combat;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `sector-node sector-node--${status}`;
  button.dataset.nodeId = node.id;
  button.dataset.layer = String(node.layer);
  button.dataset.index = String(node.index);
  button.dataset.nodeType = node.type;
  button.style.gridColumn = String(node.layer + 1);
  button.style.gridRow = String(node.index * 2 + 1);
  button.setAttribute("aria-pressed", String(selected));
  button.disabled = !isSectorNodeInteractive(status);
  const hidden = node.informationLevel < 1 && status !== "visited";
  button.innerHTML = hidden
    ? `<b class="sector-node__sigil" data-sigil="unknown">?</b><span>UNBEKANNTE SIGNATUR</span><small>Gefahr ${node.danger}</small>`
    : `<b class="sector-node__sigil" data-sigil="${escapeHtml(node.type)}"><i aria-hidden="true"></i><em>${escapeHtml(definition.icon)}</em></b><span>${escapeHtml(definition.label)}</span><small>${escapeHtml(node.regionId.replaceAll("-", " "))} · Gefahr ${node.danger}<br>${escapeHtml(node.reward)} · Korr. ${node.corruptionDelta >= 0 ? "+" : ""}${node.corruptionDelta}</small>`;
  button.addEventListener("click", () => onSelect(node, selected));
  return button;
}
