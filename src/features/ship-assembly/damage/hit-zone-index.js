// Conservative AABB half-extent: a capsule spans length/2 + radius along its
// axis (orientation is unknown here, so both axes use the full extent), a
// polygon spans its farthest vertex, circles/rings their (outer) radius.
const boundsFor = zone => {
  const p = zone.transform.position;
  const shape = zone.shape;
  const radius = shape.radius ?? shape.outerRadius ?? 0;
  let s;
  if (shape.length != null) {
    s = shape.length / 2 + radius;
  } else if (shape.points?.length) {
    s = 0;
    for (let i = 0; i < shape.points.length; i++) {
      const point = shape.points[i];
      const maxDim = Math.max(Math.abs(point.x), Math.abs(point.y));
      if (maxDim > s) s = maxDim;
    }
  } else {
    s = radius || 24;
  }
  return { minX: p.x - s, minY: p.y - s, maxX: p.x + s, maxY: p.y + s };
};
export function createHitZoneIndex(){let revision=-1,zones=[];return{rebuild(nextRevision,nextZones){if(revision===nextRevision)return false;revision=nextRevision;zones=nextZones.map(zone=>({zone,bounds:boundsFor(zone)}));return true;},// ⚡ Bolt: Removed chained array methods (.filter().map()) in hit zone query
// to prevent allocating multiple intermediate arrays and closures on every collision check
query(bounds){
  const result = [];
  for (let i = 0; i < zones.length; i++) {
    const entry = zones[i];
    if (!(entry.bounds.maxX < bounds.minX || entry.bounds.minX > bounds.maxX || entry.bounds.maxY < bounds.minY || entry.bounds.minY > bounds.maxY)) {
      result.push(entry.zone);
    }
  }
  return result;
},all:()=>zones.map(entry=>entry.zone),get revision(){return revision;}};}
