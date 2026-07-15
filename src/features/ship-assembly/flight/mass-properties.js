export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
// V8 performance optimization: Using for loops instead of reduce() avoids allocating
// multiple intermediate objects and callback overhead during hot-path flight recalculations.
export function calculateMassProperties(nodes, rootPosition = { x: 0, y: 0 }) {
  let totalMass = 0;
  let comX = 0;
  let comY = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const mass = node.mass ?? node.visualMass ?? 0;
    totalMass += mass;
    comX += node.worldPosition.x * mass;
    comY += node.worldPosition.y * mass;
  }

  comX /= totalMass || 1;
  comY /= totalMass || 1;

  let rotationalInertia = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const mass = node.mass ?? node.visualMass ?? 0;
    const dx = node.worldPosition.x - comX;
    const dy = node.worldPosition.y - comY;
    rotationalInertia += mass * (dx * dx + dy * dy);
  }

  return {
    totalMass,
    centerOfMass: { x: comX, y: comY },
    rotationalInertia,
    lateralImbalance: comX - rootPosition.x
  };
}
export function mapToFlightModifiers(properties,thrust={}){return{accelerationMultiplier:clamp(1-properties.totalMass/260,.75,1.08),turnMultiplier:clamp(1-properties.rotationalInertia/900000,.85,1.08),dodgeDistanceMultiplier:clamp(1+(thrust.dodgeAuthority??0)/100-properties.totalMass/520,.8,1.15),dodgeCooldownMultiplier:clamp(1+properties.totalMass/650-(thrust.lateral??0)/130,.85,1.25),driftBias:clamp(properties.lateralImbalance/900,-.04,.04),recoilControl:clamp((thrust.structuralSupport??0)/100,0,.35)};}
