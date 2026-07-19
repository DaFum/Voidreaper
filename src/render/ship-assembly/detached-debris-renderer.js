export function createDetachedDebris(geometry,{x,y,rotation=0,vx=0,vy=0,spin=.8,lifetime=3,lod="high"}={}){return{geometry,x,y,rotation,vx,vy,spin,lifetime,lod,age:0};}
export function updateDetachedDebris(pool,dt){for(const debris of pool){debris.age+=dt;debris.x+=debris.vx*dt;debris.y+=debris.vy*dt;debris.rotation+=debris.spin*dt;}return pool.filter(debris=>debris.age<debris.lifetime);}
