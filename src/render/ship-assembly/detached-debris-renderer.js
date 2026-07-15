export function createDetachedDebris(geometry,{x,y,rotation=0,vx=0,vy=0,spin=.8,lifetime=3,lod="high"}={}){return{geometry,x,y,rotation,vx,vy,spin,lifetime,lod,age:0};}
export function updateDetachedDebris(pool, dt) {
  const nextPool = [];
  for (let i = 0; i < pool.length; i++) {
    const debris = pool[i];
    debris.age += dt;
    if (debris.age < debris.lifetime) {
      debris.x += debris.vx * dt;
      debris.y += debris.vy * dt;
      debris.rotation += debris.spin * dt;
      nextPool.push(debris);
    }
  }
  return nextPool;
}
export function renderDetachedDebris(ctx,pool,renderModule){for(const debris of pool){ctx.save();const alpha=Math.max(0,1-debris.age/debris.lifetime);ctx.globalAlpha=alpha;ctx.translate(debris.x,debris.y);ctx.rotate(debris.rotation);if(debris.lod!=="low"&&debris.lod!=="medium"){ctx.shadowColor="#ff5500";ctx.shadowBlur=15*alpha;}else{ctx.shadowBlur=0;}renderModule(ctx,debris.geometry,"detached-preview");ctx.restore();}}
