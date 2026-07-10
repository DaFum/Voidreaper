export function renderSectorSummary(root, summary) {
  if (!root) return;
  const damage = Object.entries(summary.damageBySource).sort((a, b) => b[1] - a[1]);
  root.innerHTML = `<section class="service-screen summary"><header>SECTOR TELEMETRY <b>LOCAL ONLY</b></header><h2>BUILD SIGNAL</h2><div class="summary-grid"><article><h3>Schaden</h3>${damage.map(([source, value]) => `<p>${source}<b>${Math.round(value)}</b></p>`).join("") || "<p>Keine Daten</p>"}</article><article><h3>Systemdruck</h3><p>Heat-Spitzen <b>${summary.heatPeaks.length}</b></p><p>Fehler <b>${summary.faults.length}</b></p><p>Synergien <b>${summary.synergies.length}</b></p></article><article><h3>Entwicklung</h3><p>Evolutionen <b>${summary.evolutionProgress.length}</b></p><p>Codex-Signaturen <b>${summary.codexSignatures.length}</b></p><p>Prototypen <b>${summary.prototypes.filter(item => item.secured).length}/${summary.prototypes.length}</b></p></article></div></section>`;
}
