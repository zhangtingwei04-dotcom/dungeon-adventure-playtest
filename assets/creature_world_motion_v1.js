/* 燈火核心：八方向世界移動與景深 V1.0。世界 X 向右，Z 向鏡頭。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const defaults={bounds:{minX:-100,maxX:100,minZ:-90,maxZ:90},camera:{cx:240,groundY:195,depthSlope:.25,farScale:.78,nearScale:1.12},speed:{walk:14,trot:38,run:85}};
function create(config={}){
 const bounds={...defaults.bounds,...config.bounds},camera={...defaults.camera,...config.camera},speed={...defaults.speed,...config.speed};
 if(!(bounds.minX<bounds.maxX&&bounds.minZ<bounds.maxZ&&camera.farScale>0&&camera.nearScale>=camera.farScale))throw Error('invalid world bounds or camera');
 function vector(direction){if(!Number.isFinite(direction))throw Error('invalid direction');const rad=direction*Math.PI/4;const clean=n=>Math.abs(n)<1e-10?0:n;return {x:clean(Math.sin(rad)),z:clean(Math.cos(rad))};}
 function position(x=0,z=0){if(!Number.isFinite(x)||!Number.isFinite(z))throw Error('invalid position');return {x:clamp(x,bounds.minX,bounds.maxX),z:clamp(z,bounds.minZ,bounds.maxZ)};}
 function advanceDistance(pos,direction,d){if(!Number.isFinite(d)||d<0)throw Error('invalid distance');const v=vector(direction),raw={x:pos.x+v.x*d,z:pos.z+v.z*d},next=position(raw.x,raw.z),hit=raw.x!==next.x||raw.z!==next.z;return {...next,hit,distance:Math.hypot(next.x-pos.x,next.z-pos.z)};}
 function advance(pos,direction,mode,dt){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');return advanceDistance(pos,direction,(speed[mode]??0)*dt/1000);}
 // Fixed takeoff and landing anchors. Clip travel along the heading, not independently by axis.
 function planJump(pos,direction,{distance=60,push=470,airEnd=1030,end=1500}={}){
  if(![distance,push,airEnd,end].every(Number.isFinite)||distance<0||push<0||airEnd<=push||end<airEnd)throw Error('invalid jump timing');
  const start=position(pos.x,pos.z),v=vector(direction);let allowed=distance;
  if(v.x>0)allowed=Math.min(allowed,(bounds.maxX-start.x)/v.x);if(v.x<0)allowed=Math.min(allowed,(bounds.minX-start.x)/v.x);
  if(v.z>0)allowed=Math.min(allowed,(bounds.maxZ-start.z)/v.z);if(v.z<0)allowed=Math.min(allowed,(bounds.minZ-start.z)/v.z);
  allowed=Math.max(0,allowed);return {start,v,distance:allowed,requested:distance,push,airEnd,end};
 }
 function sampleJump(j,ms){if(!Number.isFinite(ms))throw Error('invalid elapsed');const u=clamp((ms-j.push)/(j.airEnd-j.push),0,1),p=position(j.start.x+j.v.x*j.distance*u,j.start.z+j.v.z*j.distance*u);return {...p,progress:u,done:ms>=j.end,limited:j.distance+1e-8<j.requested};}
 function projectGround(p){const u=clamp((p.z-bounds.minZ)/(bounds.maxZ-bounds.minZ),0,1),scale=camera.farScale+(camera.nearScale-camera.farScale)*u;return {x:camera.cx+p.x*scale,y:camera.groundY+p.z*camera.depthSlope,scale,depth:p.z};}
 function project(pos){return projectGround(position(pos.x,pos.z));}
 function unprojectGround(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||!camera.depthSlope)throw Error('invalid ground projection');const z=(y-camera.groundY)/camera.depthSlope,scale=projectGround({x:0,z}).scale;return {x:(x-camera.cx)/scale,z};}
 return Object.freeze({vector,position,advance,advanceDistance,planJump,sampleJump,project,projectGround,unprojectGround,bounds:Object.freeze(bounds),speed:Object.freeze(speed)});
}
root.DungeonCreatureWorldMotionV1=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);