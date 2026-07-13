import { boundsFromCenter } from "../placement/collision-bounds.js";
export function buildPreviewBounds(profile,port){const center=port.worldPosition??port.localPosition??{x:(port.direction?.x??0)*46,y:(port.direction?.y??0)*46};return{...boundsFromCenter(center,profile.sizeClass,`preview-${port.portId}`,profile.rendererId),center};}
