export function placeTutorialCard(target, card, viewport, gap=16){const margin=8;
// Full-bleed targets (e.g. the game canvas) offer no free edge to anchor against; centering the
// card there parks it over centered UI such as the pause menu buttons. Pin it to the corner instead.
if(target.width>=viewport.width*.9&&target.height>=viewport.height*.9)return{top:Math.max(margin,viewport.height-card.height-margin),left:Math.max(margin,viewport.width-card.width-margin),side:"corner"};
const spaceBelow=viewport.height-target.bottom-gap,spaceAbove=target.top-gap,side=spaceBelow>=card.height||spaceBelow>=spaceAbove?"bottom":"top";let top=side==="bottom"?target.bottom+gap:target.top-gap-card.height;let left=target.left+target.width/2-card.width/2;top=Math.max(margin,Math.min(top,viewport.height-card.height-margin));left=Math.max(margin,Math.min(left,viewport.width-card.width-margin));return{top,left,side};}
