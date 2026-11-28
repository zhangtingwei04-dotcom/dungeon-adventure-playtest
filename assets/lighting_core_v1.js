/* Shared lightweight 2D lighting: pure sampling, local sources, low-res canvas compositing. */
(function(root){
'use strict';
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const transmission=Object.freeze({open:1,half:.5,closed:.16});
const kinds=Object.freeze({natural:'natural',artificial:'artificial',magic:'magic',biological:'biological'});
function sample({exterior,curtain='open',lamp=false,deskLamp=false,windowX=.475,lampX=.5,lampY=.13,deskX=.805,deskY=.49}){
 const t=transmission[curtain]??1;
 const daylight=clamp((exterior.outsideBrightness-.10)/.98);
 const natural=clamp((.055+daylight*.88)*t);
 const base=clamp(.69-natural*.46-(lamp?.10:0),.17,.72);
 const sources=[
  {id:'window',kind:kinds.natural,x:windowX,y:.47,rx:.40,ry:.67,strength:natural*.77,color:exterior.color},
  {id:'ceiling',kind:kinds.artificial,x:lampX,y:lampY+.19,rx:.62,ry:.83,strength:lamp?.85:0,color:[255,204,133]},
  {id:'desk',kind:kinds.artificial,x:deskX,y:deskY,rx:.205,ry:.34,strength:deskLamp?.85:0,color:[255,190,108]}
 ];
 return {base,natural,transmission:t,beam:clamp(daylight*t*.18),beamWidth:curtain==='closed'?.12:curtain==='half'?.52:1,beamColor:exterior.color,sources};
}
function interpolate(a,b,t){
 const mix=(x,y)=>x+(y-x)*t;
 return {...b,base:mix(a.base,b.base),natural:mix(a.natural,b.natural),beam:mix(a.beam,b.beam),beamWidth:mix(a.beamWidth,b.beamWidth),beamColor:b.beamColor.map((v,i)=>mix(a.beamColor[i],v)),sources:b.sources.map((v,i)=>({...v,strength:mix(a.sources[i].strength,v.strength),color:v.color.map((n,j)=>mix(a.sources[i].color[j],n))}))};
}
function paint(canvas,state){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
 ctx.fillStyle='rgba(19,22,32,'+state.base+')';ctx.fillRect(0,0,w,h);
 ctx.globalCompositeOperation='destination-out';
 for(const light of state.sources){
  if(light.strength<=0)continue;
  ctx.save();ctx.translate(light.x*w,light.y*h);ctx.scale(light.rx*w,light.ry*h);
  const g=ctx.createRadialGradient(0,0,0,0,0,1);
  g.addColorStop(0,'rgba(0,0,0,'+light.strength+')');g.addColorStop(.5,'rgba(0,0,0,'+(light.strength*.57)+')');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
 ctx.globalCompositeOperation='source-over';
 // Subtle tint, not a solid white spot or simulated ray tracing.
 for(const light of state.sources){
  if(light.strength<=0)continue;
  ctx.save();ctx.translate(light.x*w,light.y*h);ctx.scale(light.rx*w,light.ry*h);
  const g=ctx.createRadialGradient(0,0,0,0,0,1),rgb=light.color.map(Math.round).join(',');
  g.addColorStop(0,'rgba('+rgb+','+(light.strength*.10)+')');g.addColorStop(1,'rgba('+rgb+',0)');
  ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
}
root.DungeonLightingV1=Object.freeze({version:'1.0.1',kinds,transmission,sample,interpolate,paint});
})(window);
