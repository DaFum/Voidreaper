import { escapeHtml } from "../escape-html.js";
export function renderAssemblyInspector(
  root,
  { node, port, item, title, deltas = [], warnings = [], actions = {} } = {},
) {
  const heading =
      title ??
      node?.definitionId ??
      item?.definitionId ??
      port?.key ??
      "KEINE AUSWAHL",
    kind = node
      ? "VERBAUTES MODUL"
      : item
        ? "INVENTAR-MODUL"
        : port
          ? "MONTAGEPORT"
          : "INSPEKTION",
    empty = !node && !item && !port;
  root.innerHTML = `<header><small>ASSEMBLY // ${escapeHtml(kind)}</small><h2>${escapeHtml(heading)}</h2></header>${empty ? `<p class="assembly-inspector__empty">Wähle ein Modul im Inventar oder ein verbautes Modul auf der Bühne, um Details und Aktionen zu sehen.</p>` : ""}<dl>${deltas.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(String(value))}</dd></div>`).join("")}</dl>${warnings.length ? `<ul class="assembly-warnings">${warnings.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul>` : ""}<div class="assembly-inspector__actions"><button type="button" data-action="rotate"${actions.rotate ? "" : ' disabled aria-label="Drehen nicht möglich" title="Aktion in diesem Kontext nicht verfügbar"'}>DREHEN${actions.rotate ? "" : ' <small aria-hidden="true">(Gesperrt)</small>'}</button><button type="button" data-action="move-branch"${actions.moveBranch ? "" : ' disabled aria-label="Ast versetzen nicht möglich" title="Aktion in diesem Kontext nicht verfügbar"'}>AST VERSETZEN${actions.moveBranch ? "" : ' <small aria-hidden="true">(Gesperrt)</small>'}</button><button type="button" data-action="dismantle"${actions.dismantle ? "" : ' disabled aria-label="Demontieren nicht möglich" title="Aktion in diesem Kontext nicht verfügbar"'}>DEMONTIEREN${actions.dismantle ? "" : ' <small aria-hidden="true">(Gesperrt)</small>'}</button></div>`;
  return root;
}
