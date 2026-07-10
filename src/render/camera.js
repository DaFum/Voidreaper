export function applyWorldCamera(ctx,camera,viewport,render){ctx.save();const zoom=camera.zoom??1;ctx.translate(viewport.width/2,viewport.height/2);ctx.scale(zoom,zoom);ctx.translate(-viewport.width/2,-viewport.height/2);render();ctx.restore();}
export function createCameraState(){return{x:0,y:0,shake:0,shakeX:0,shakeY:0,zoom:1};}
