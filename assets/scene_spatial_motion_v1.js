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
  'spawn-beetle-3':{dx:-1.3,dy:1.0,curve:.25,frontZ:10},
  'preview-beetle-flight':{dx:3.5,dy:2.4,curve:.5,frontZ:18}
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
 // Scene-ground action points: authored local route + nearby visible props.
 const kind=o=>String(o.assetId||'').replace('forest4_','');
 const metric=(a,b)=>Math.hypot((a.x-b.x)*1.7778,a.y-b.y);
 function buildActionMap(objects=[]){
  const visible=objects.filter(o=>o.visible&&Number.isFinite(o.x)&&Number.isFinite(o.y)&&o.width>0);
  const solids=visible.filter(o=>/^(wagon|crate_|barrel|wheel_flat|plank|rock_|log|chassis|sack)/.test(kind(o))).map(o=>({
   id:o.id,x:o.x,y:o.y,rx:Math.max(.7,o.width*(kind(o)==='wagon'?.42:.40)),ry:Math.max(.55,o.width*(kind(o)==='wagon'?.11:.20)),kind:kind(o),z:o.z
  }));
  const food=visible.filter(o=>/^grass_|^purple_flower$|^white_flower$/.test(kind(o)));
  const shelter=visible.filter(o=>/^(wagon|rock_|log|yellow_shrub)/.test(kind(o)));
  return {solids,food,shelter};
 }
 function inside(p,o,pad=0){return ((p.x-o.x)/(o.rx+pad))**2+((p.y-o.y)/(o.ry+pad*.65))**2<1;}
 function walkable(p,map,anchor){
  if(p.x<3||p.x>96||p.y<50||p.y>94||metric(p,anchor)>15)return false;
  return !map.solids.some(o=>inside(p,o,.32));
 }
 function segmentClear(from,to,map,anchor){
  const n=Math.max(2,Math.ceil(metric(from,to)*2));
  for(let i=1;i<=n;i++){const q=i/n,p={x:from.x+(to.x-from.x)*q,y:from.y+(to.y-from.y)*q};if(!walkable(p,map,anchor))return false;}
  return true;
 }
 function actionPoints(anchor,map,from=anchor,env={}){
  const points=[],route=routes[anchor.id],end={x:anchor.x+(route?.dx??-anchor.width*.54),y:anchor.y+(route?.dy??0),z:route?.frontZ??anchor.z};
  function add(p){if(metric(p,from)<.16||segmentClear(from,p,map,anchor))points.push(p);}
  add({id:'anchor',type:'rest',x:anchor.x,y:anchor.y,z:anchor.z});
  add({id:'route-end',type:'explore',...end});
  if((env.snowCover||0)<.15&&env.kind!=='snow'&&env.kind!=='blizzard'){
   for(const o of map.food){
    // Stop just beside the plant root, not at the centre of its artwork.
    const side=from.x<=o.x?-1:1;
    for(const dir of [side,-side])add({id:'food:'+o.id+':'+dir,type:'food',sourceId:o.id,x:o.x+dir*Math.max(.7,o.width*.21),y:o.y-.5,z:o.z??anchor.z});
   }
  }
  for(const o of map.shelter){
   const solid=map.solids.find(s=>s.id===o.id),rx=solid?.rx??o.width*.38;
   for(const dir of [-1,1])add({id:'shelter:'+o.id+':'+dir,type:'shelter',sourceId:o.id,x:o.x+dir*(rx+.65),y:o.y-.4,z:(o.z??anchor.z)-1});
  }
  return points;
 }
 function nearest(points,type,from){return points.filter(p=>p.type===type).sort((a,b)=>metric(a,from)-metric(b,from))[0]||null;}
 return {routes,project,sample,buildActionMap,actionPoints,segmentClear,walkable,metric,nearest};
})();