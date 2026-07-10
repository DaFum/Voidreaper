export const ASSEMBLY_BUDGET=Object.freeze({maxVisibleSegments:18,maxBranchDepth:4,maxSecondaryConnections:10,maxDamageParticlesPerModule:12,maxDetachedDebris:8,maxGeometryRebuildsPerFrame:1,maxThumbnailSize:320});
export function enforceAssemblyBudget(snapshot){return{...snapshot,nodes:snapshot.nodes.slice(0,ASSEMBLY_BUDGET.maxVisibleSegments+1),decorators:snapshot.decorators.slice(0,6)};}
