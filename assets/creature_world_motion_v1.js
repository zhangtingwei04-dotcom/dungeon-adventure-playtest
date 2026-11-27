/* 燈火核心：八方向世界移動與景深 V1.0。世界 X 向右，Z 向鏡頭。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const defaults={bounds:{minX:-100,maxX:100,minZ:-90,maxZ:90},camera:{cx:240,groundY:195,depthSlope:.25,farScale:.78,nearScale:1.12},speed:{walk:14,trot:38,run:85}};
function create(config={}){
 const bounds={...defaults.bounds,...config.bounds},camera={...defaults.camera,...config.camera},speed={...defaults.speed,...config.speed};
 if(!(bounds.minX<bounds.maxX&&bounds.minZ<bounds.maxZ&&camera.farScale>0&&camera.nearScale>=camera.farScale))throw Error('invalid world bounds or camera');
 function vector(direction){if(!Number.isFinite(direction))throw Error('invalid direction');const rad=direction*Math.PI/4;const clean=n=>Math.abs(n)<1e-10?0:n;return {x:clean(Math.sin(rad)),z:clean(Math.cos(rad))};}
 function position(x=0,z=0){if(!Number.isFinite(x)||!Number.isFinite(z))throw Error('invalid position');return {x:clamp(x,bounds.minX,bounds.maxX),z:clamp(z,bounds.minZ,bounds.maxZ)};}
 function advance(pos,direction,mode,dt){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');const v=vector(direction),d=(speed[mode]??0)*dt/1000,raw={x:pos.x+v.x*d,z:pos.z+v.z*d},next=position(raw.x,raw.z),hit=raw.x!==next.x||raw.z!==next.z;return {...next,hit,distance:Math.hypot(next.x-pos.x,next.z-pos.z)};}
 function project(pos){const p=position(pos.x,pos.z),u=(p.z-bounds.minZ)/(bounds.maxZ-bounds.minZ),scale=camera.farScale+(camera.nearScale-camera.farScale)*u;return {x:camera.cx+p.x*scale,y:camera.groundY+p.z*camera.depthSlope,scale,depth:p.z};}
 return Object.freeze({vector,position,advance,project,bounds:Object.freeze(bounds),speed:Object.freeze(speed)});
}
root.DungeonCreatureWorldMotionV1=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);