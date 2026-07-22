import { renderStatBreakdown } from "../components/stat-breakdown.js";
import { renderSynergyList } from "../components/synergy-list.js";
import { escapeHtml } from "../escape-html.js";

const TABS = ["Übersicht", "Stats", "Tags", "Evolutionen", "Risiken"];

export function createBuildInspector(container, services) {
  let activeTab = "Übersicht";
  let model = null;
  container.innerHTML = `
    <nav class="inspector-tabs" aria-label="Build inspector">${TABS.map(tab => `<button type="button" data-tab="${escapeHtml(tab)}">${escapeHtml(tab)}</button>`).join("")}</nav>
    <div class="inspector-panel"></div>`;
  const panel = container.querySelector(".inspector-panel");

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    activeTab = button.dataset.tab;
    render();
  });

  function render() {
    if (!model) return;
    for (const button of container.querySelectorAll("[data-tab]"))
      button.toggleAttribute("aria-current", button.dataset.tab === activeTab);
    if (activeTab === "Stats") {
      renderStatBreakdown(
        panel,
        services.stats.definitions().map((definition) => ({
          definition,
          result: services.stats.calculate(definition.id, model.statContext),
        })),
      );
    } else if (activeTab === "Tags") {
      panel.innerHTML = [...model.tags.entries()]
        .map(
          ([id, value]) =>
            `<article class="tag-entry"><b>${escapeHtml(id)}</b><strong>${escapeHtml(value)}</strong><small>${(model.tags.provenance?.get(id) ?? []).map((source) => escapeHtml(source.sourceId)).join(", ")}</small></article>`,
        )
        .join("");
    } else if (activeTab === "Evolutionen") {
      panel.innerHTML = model.evolutions
        .map(
          (entry) =>
            `<article class="evolution-entry" data-ready="${entry.eligible}"><b>${escapeHtml(entry.definition.name)}</b><span>${entry.requirements.filter((requirement) => requirement.met).length}/${entry.requirements.length}</span><small>${entry.blockedBy ? `Blockiert durch ${escapeHtml(entry.blockedBy)}` : escapeHtml(entry.definition.kind)}</small></article>`,
        )
        .join("");
    } else if (activeTab === "Risiken") {
      panel.innerHTML = `<div class="risk-grid"><span>LAST</span><b>${escapeHtml(Math.round(model.load.ratio * 100))}% ${escapeHtml(model.load.tier)}</b><span>HITZE</span><b>${escapeHtml(Math.round(model.heat))}°</b><span>KORRUPTION</span><b>${escapeHtml(Math.round(model.corruption))}%</b><span>FEHLERDRUCK</span><b>${escapeHtml(model.faultPressure.toFixed(2))}</b></div>`;
    } else {
      renderSynergyList(panel, model.synergies);
    }
  }

  return {
    update(nextModel) {
      model = nextModel;
      render();
    },
    showTab(tab) {
      if (TABS.includes(tab)) {
        activeTab = tab;
        render();
      }
    },
  };
}

export function describeUpgradeImpact(before, after, services) {
  return {
    tags: services.tags.delta(before.sources, after.sources),
    load: { before: before.load, after: after.load },
    heat: { before: before.heat, after: after.heat },
    corruption: { before: before.corruption, after: after.corruption },
  };
}
