export const ASSEMBLY_DEBUG_SCENARIOS=Object.freeze({"visual-gallery":deps=>deps.visualGallery(),"maximum-construction":deps=>deps.buildMaximum?.()??{instruction:"Mount compatible modules until 18 segments are visible."},"asymmetric-heavy":deps=>deps.buildAsymmetric?.()??{instruction:"Mount heavy modules on one lateral branch."},"damage-single":deps=>deps.damageSingle(),"bridge-survival":deps=>deps.bridgeSurvival?.()??{instruction:"Bridge a child, then detach its parent."},"branch-collapse":deps=>deps.branchCollapse(),"repair-remount":deps=>deps.repairRemount(),"blueprint-roundtrip":deps=>deps.blueprintRoundtrip?.(),"lod-stress":deps=>["high","medium","low"].map(lod=>deps.setLod(lod))});
export function findMaximumConstructionCandidate({ state, geometry, ports, definitions, evaluate }) {
  const orderedPorts = ports
    .filter(port => !port.occupiedByNodeId)
    .sort((a, b) => (a.branchDepth ?? 0) - (b.branchDepth ?? 0) || a.portId.localeCompare(b.portId));

  const orderedDefinitions = [...definitions]
    .filter(d => d.assembly)
    .sort(
      (a, b) => (b.assembly?.childPorts?.length ?? 0) - (a.assembly?.childPorts?.length ?? 0) || a.id.localeCompare(b.id)
    );

  for (const definition of orderedDefinitions) {
    for (const port of orderedPorts) {
      const moduleProfile = {
        ...definition.assembly,
        definitionId: definition.id,
        tags: definition.tags
      };
      if (evaluate({ state, moduleProfile, port, geometrySnapshot: geometry }).compatible) {
        return { port, definition };
      }
    }
  }
  return null;
}
export function summarizeMaximumConstructionBlockers({state,geometry,ports,definitions,evaluate}){const blockers={};for(const port of ports.filter(item=>!item.occupiedByNodeId))for(const definition of definitions){const moduleProfile={...definition.assembly,definitionId:definition.id,tags:definition.tags},result=evaluate({state,moduleProfile,port,geometrySnapshot:geometry});for(const reason of result.reasons??[])blockers[reason]=(blockers[reason]??0)+1;}return blockers;}
export function createAssemblyDebugScenarios(deps){return{list:()=>Object.keys(ASSEMBLY_DEBUG_SCENARIOS),run:id=>{const scenario=ASSEMBLY_DEBUG_SCENARIOS[id];if(!scenario)throw new Error(`Unknown assembly debug scenario: ${id}`);return scenario(deps);}};}
