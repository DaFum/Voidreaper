export function renderStatBreakdown(container, breakdowns) {
  container.innerHTML = breakdowns.map(({ definition, result }) => `
    <section class="inspector-stat">
      <header><span>${definition.displayName}</span><b>${formatValue(result.value, definition.displayFormat)}</b></header>
      <div class="inspector-source"><span>BASE</span><span>${formatValue(result.baseValue, definition.displayFormat)}</span></div>
      ${result.contributions.map(contribution => `
        <div class="inspector-source"><span>${contribution.sourceId}</span><span>${formatDelta(contribution)}</span></div>
      `).join("")}
    </section>
  `).join("");
}

function formatValue(value, format) {
  if (format === "percent") return `${Math.round(value * 100)}%`;
  if (format === "multiplier") return `×${value.toFixed(2)}`;
  if (format === "integer") return `${Math.round(value)}`;
  return Number(value).toFixed(2);
}

function formatDelta(contribution) {
  if (contribution.operation === "multiply") return `×${Number(contribution.value).toFixed(2)}`;
  if (contribution.operation === "clamp") return `${contribution.value[0]}…${contribution.value[1]}`;
  return `${contribution.operation === "add" && contribution.value >= 0 ? "+" : ""}${contribution.value}`;
}
