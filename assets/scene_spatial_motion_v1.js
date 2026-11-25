/* Scene-space movement V1. Coordinates are normalized scene percentages.
   x,y = ground contact, h = vertical height in scene-height percentage.
   Authored routes are deliberately local until a full collision map is available. */
window.DungeonSpatialMotion=(function(){
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const routes={
  'v4-rabbit16':{dx:-3.2,dy:2.4,curve:.5,frontZ:5},
  'spawn-rabbit-2':{dx:-1.4,dy:1.3,curve:.2,frontZ:3},
  'spawn-rabbit-3':{dx:-2.4,dy:1.6,curve:.4,frontZ:5},
  'v4-beetle17':{dx:1.1,dy:.9,curve:.22,frontZ:10},
  'spawn-beetle-2':{dx:1.1,dy:1.1,curve:.25,frontZ:10},
  'spawn-beetle-3':{dx:-1.3,dy:1.0,curve:.25,frontZ:10}
 };
 function project(anchor,position,aspect=16/9){
  const x=clamp(position.x,2,98),y=clamp(position.y,3,97);
  const h=Math.max(0,position.h||0);
  const scale=clamp(Math.exp((y-anchor.y)*.023),.72,1.3);
  const width=anchor.width*scale;
  // Convert world height into a sprite-local vertical translation.
  const spriteHeight=(width*aspect)/(anchor.artAspect||1);
  const lift=spriteHeight>0?100*h/spriteHeight:0;
  return {x,y,h,scale,width,lift,z:position.z??anchor.z,shadow:clamp(1-h*.16,.2,1)};
 }
 function sample(anchor,v,kind){
  const route=routes[anchor.id];
  const max=kind==='rabbit'?54:30;
  const q=clamp(Math.abs(v.x)/max,0,1);
  const dx=route?route.dx:(v.x<0?-1:1)*anchor.width*max/100;
  const dy=route?route.dy:0;
  const x=anchor.x+dx*q,y=anchor.y+dy*q+(route?.curve||0)*Math.sin(Math.PI*q);
  const originalHeight=anchor.width*(16/9)/(anchor.artAspect||1);
  const h=originalHeight*Math.max(0,v.lift)/100;
  return project(anchor,{x,y,h,z:route?.frontZ??anchor.z});
 }
 return {routes,project,sample};
})();