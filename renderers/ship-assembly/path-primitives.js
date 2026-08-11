// Unchanged from repo.
export function traceTaperedPlate(c, { length, frontWidth, rearWidth, notch = 0 }) {
  c.beginPath();
  c.moveTo(0, -frontWidth / 2);
  c.lineTo(length - notch, -rearWidth / 2);
  c.lineTo(length, 0);
  c.lineTo(length - notch, rearWidth / 2);
  c.lineTo(0, frontWidth / 2);
  c.closePath();
}
export function traceCapsule(c, length, r) {
  c.beginPath();
  c.arc(-length / 2, 0, r, Math.PI / 2, Math.PI * 1.5);
  c.arc(length / 2, 0, r, Math.PI * 1.5, Math.PI / 2);
  c.closePath();
}
export function tracePipe(c, from, to, bend = .35) {
  c.beginPath();
  c.moveTo(from.x, from.y);
  c.bezierCurveTo(from.x + (to.x - from.x) * bend, from.y, to.x - (to.x - from.x) * bend, to.y, to.x, to.y);
}
export function traceLens(c, x, y, rx, ry, rotation = 0) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
}
export function traceCoil(c, x, length, radius, turns = 4) {
  c.beginPath();
  for (let i = 0; i <= turns * 12; i++) {
    const t = i / (turns * 12);
    const px = x + t * length;
    const py = Math.sin(t * Math.PI * 2 * turns) * radius;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
}
export function traceLauncherDoor(c, x, y, w, h, open = 0) {
  c.beginPath();
  c.roundRect(x - w / 2 - open * w * .3, y - h / 2, w, h, 2);
}
export function traceCoolingFin(c, x, y, length, angle = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  traceTaperedPlate(c, { length, frontWidth: 5, rearWidth: 1, notch: 2 });
  c.restore();
}
export function traceThrusterNozzle(c, x, y, size) {
  c.beginPath();
  c.moveTo(x - size, y - size * .6);
  c.lineTo(x + size, y - size * .35);
  c.lineTo(x + size, y + size * .35);
  c.lineTo(x - size, y + size * .6);
  c.closePath();
}
export function traceShieldRing(c, x, y, r, gap = .35) {
  c.beginPath();
  c.arc(x, y, r, gap, Math.PI - gap);
  c.moveTo(x - r * Math.cos(gap), y - r * Math.sin(gap));
  c.arc(x, y, r, Math.PI + gap, Math.PI * 2 - gap);
}
export function traceBrokenPlateEdge(c, length, seed = 1) {
  c.beginPath();
  c.moveTo(0, 0);
  for (let i = 1; i <= 5; i++) c.lineTo((length * i) / 5, (i % 2 ? 1 : -1) * (2 + (seed + i) % 4));
}
