export function calculateVisualImbalance(nodes) {
  let sum = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    sum += node.worldPosition.x * Math.max(1, node.visualMass);
  }
  return sum;
}
function chooseDecoratorKind(id,style){if(id?.includes("cooling")||style?.armorFamily==="thermal-open")return"cooling-ribs";if(style?.armorFamily==="industrial-truss"||style?.armorFamily==="heavy-block")return"counterweight";return"brace-plate";}
export function buildBalanceDecorators({nodes,shipStyle}){const imbalance=calculateVisualImbalance(nodes);if(Math.abs(imbalance)<40)return[];const heavySide=Math.sign(imbalance);return nodes.filter(node=>Math.sign(node.worldPosition.x)===heavySide).slice(0,3).map((node,index)=>Object.freeze({decoratorId:`balance-${node.nodeId}-${index}`,kind:chooseDecoratorKind(node.visualProfileId,shipStyle),position:{x:-node.worldPosition.x*.72,y:node.worldPosition.y*.86},rotation:-node.worldRotation,scale:Math.min(.7,.35+node.visualMass/40),gameplayRelevant:false}));}
