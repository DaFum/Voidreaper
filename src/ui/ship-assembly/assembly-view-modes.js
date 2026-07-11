import { escapeHtml } from "../escape-html.js";
export const ASSEMBLY_VIEW_MODES = Object.freeze({ NORMAL: "normal", STRUCTURE: "structure", ENERGY: "energy", DAMAGE: "damage", FLIGHT: "flight" });
export const ASSEMBLY_VIEW_MODE_LABELS = Object.freeze({ normal: "KONSTRUKTION", structure: "STRUKTUR", energy: "ENERGIE", damage: "SCHADEN", flight: "FLUGPROFIL" });

export function renderAssemblyToolbar(root, active, onChange) {
  root.innerHTML = Object.values(ASSEMBLY_VIEW_MODES).map(mode => `<button data-mode="${mode}" aria-pressed="${mode === active}">${escapeHtml(ASSEMBLY_VIEW_MODE_LABELS[mode])}</button>`).join("");
  root.onclick = event => { const mode = event.target.closest("[data-mode]")?.dataset.mode; if (mode) onChange(mode); };
}

export function getViewModeOverlay(mode, { assembly, geometry, flightProfile } = {}) {
  if (mode === ASSEMBLY_VIEW_MODES.STRUCTURE) return { connections: geometry.connections, labels: geometry.nodes.map(node => ({ position: node.worldPosition, text: node.isRoot ? "KERN" : `T${assembly.portsById[node.parentPortId]?.branchDepth ?? 0}` })) };
  if (mode === ASSEMBLY_VIEW_MODES.ENERGY) return { connections: geometry.connections.map(connection => ({ ...connection, label: connection.cable.energyClass })), labels: [] };
  if (mode === ASSEMBLY_VIEW_MODES.DAMAGE) return { labels: geometry.nodes.map(node => ({ position: node.worldPosition, text: node.isRoot ? "KERN" : `${Math.round(node.armorIntegrity ?? 0)}A / ${Math.round(node.coreIntegrity ?? 0)}C` })) };
  if (mode === ASSEMBLY_VIEW_MODES.FLIGHT) return { centerOfMass: flightProfile?.centerOfMass, thrustVectors: flightProfile?.thrustVectors ?? [], labels: [{ position: { x: 0, y: 0 }, text: `MASSE ${flightProfile?.totalMass ?? "—"}` }] };
  return {};
}

export function renderViewModeOverlay(ctx, overlay = {}) {
  ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = "#48eaff"; ctx.fillStyle = "#dffaff"; ctx.font = "11px monospace";
  for (const connection of overlay.connections ?? []) {
    const segment = connection.cable ?? connection.spine ?? connection;
    if (!segment.from || !segment.to) continue;
    ctx.beginPath(); ctx.moveTo(segment.from.x, segment.from.y); ctx.lineTo(segment.to.x, segment.to.y); ctx.stroke();
    if (connection.label) ctx.fillText(connection.label, (segment.from.x + segment.to.x) / 2, (segment.from.y + segment.to.y) / 2);
  }
  for (const label of overlay.labels ?? []) ctx.fillText(label.text, label.position.x + 6, label.position.y - 6);
  if (overlay.centerOfMass) { const { x, y } = overlay.centerOfMass; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke(); ctx.fillText("COM", x + 8, y - 8); }
  for (const vector of overlay.thrustVectors ?? []) { const end = { x: vector.position.x + vector.direction.x * 28 * vector.strength, y: vector.position.y + vector.direction.y * 28 * vector.strength }; ctx.beginPath(); ctx.moveTo(vector.position.x, vector.position.y); ctx.lineTo(end.x, end.y); ctx.stroke(); }
  ctx.restore();
}
