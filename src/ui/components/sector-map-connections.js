const SVG_NS = "http://www.w3.org/2000/svg";

export function createSectorMapConnections(nodes, nodeElements) {
  const elementsById = new Map(nodeElements.map(element => [element.dataset.nodeId, element]));
  const container = nodeElements[0]?.parentElement;
  if (!container) return { refresh() {}, destroy() {} };
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("sector-map__connections");
  svg.setAttribute("aria-hidden", "true");
  container.prepend(svg);

  function refresh() {
    const width = container.scrollWidth;
    const height = container.scrollHeight;
    if (svg.getAttribute("width") !== String(width) || svg.getAttribute("height") !== String(height)) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
    }
    const paths = [];
    for (const source of nodes) {
      const sourceElement = elementsById.get(source.id);
      if (!sourceElement) continue;
      const startX = sourceElement.offsetLeft + sourceElement.offsetWidth;
      const startY = sourceElement.offsetTop + sourceElement.offsetHeight / 2;
      for (const targetId of source.next ?? []) {
        const targetElement = elementsById.get(targetId);
        if (!targetElement) continue;
        const endX = targetElement.offsetLeft;
        const endY = targetElement.offsetTop + targetElement.offsetHeight / 2;
        const bend = Math.max(24, (endX - startX) * .48);
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`);
        path.dataset.sourceId = source.id;
        path.dataset.targetId = targetId;
        paths.push(path);
      }
    }
    svg.replaceChildren(...paths);
  }

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(refresh) : null;
  observer?.observe(container);
  for (const element of nodeElements) observer?.observe(element);
  requestAnimationFrame(refresh);
  return { refresh, destroy() { observer?.disconnect(); svg.remove(); } };
}
