/* Shared lightweight 2D lighting: pure sampling, local sources, low-res canvas compositing. */
(function(root){
'use strict';
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const transmission=Object.freeze({open:1,half:.5,closed:.16});
const kinds=Object.freeze({natural:'natural',artificial:'artificial',magic:'magic',biological:'biological'});
// Shared adjacent-space light sampling. No light crosses a closed portal.
function adjacent({exterior,naturalReach=.48,lamps=[]}){
 const daylight=clamp((exterior.outsideBrightness-.10)/.98);
 const natural=daylight*naturalReach;
 const active=lamps.filter(v=>v.on);
 const artificial=active.reduce((sum,v)=>sum+clamp(v.strength),0);
 const total=natural+artificial;
 const color=total>0?exterior.color.map((n,i)=>Math.round((n*natural+active.reduce((sum,v)=>sum+v.color[i]*clamp(v.strength),0))/total)):[55,48,43];
 return {strength:clamp(.035+total),natural,artificial,color};
}
// A doorway transfers light only if the adjacent space actually has a source.
function portalProjection({portal,open=false,bounds}){
 const strength=clamp((portal?.natural??0)+(portal?.artificial??0));
 const color=portal?.color??[55,48,43];
 const b=bounds??{x:.91,y:.17,w:.09,h:.72};
 const nearA=[b.x+b.w*.34,b.y+b.h*.924],nearB=[b.x+b.w*.98,b.y+b.h*.968];
 const length=.105+.055*strength;
 const farA=[nearA[0]-length,Math.min(.992,nearA[1]+.045)];
 const farB=[nearB[0]-length*.83,Math.min(.998,nearB[1]+.10)];
 return {strength:open?strength:0,seam:open?0:strength*.28,color,polygon:[nearA,nearB,farB,farA]};
}
function paintPortal(ctx,w,h,p,mode){
 if(!p||p.strength<=.001)return;
 const [a,b,c,d]=p.polygon;
 const trace=points=>{ctx.beginPath();for(let i=0;i<points.length;i++){const [x,y]=points[i];if(i===0)ctx.moveTo(x*w,y*h);else ctx.lineTo(x*w,y*h);}ctx.closePath();};
 const midpoint=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const near=midpoint(a,b),far=midpoint(c,d);
 const g=ctx.createLinearGradient(near[0]*w,near[1]*h,far[0]*w,far[1]*h);
 const rgb=p.color.map(Math.round).join(',');
 const alpha=p.strength*(mode==='cut'?.82:.22);
 g.addColorStop(0,'rgba('+ (mode==='cut'?'0,0,0':rgb)+','+alpha+')');
 g.addColorStop(.55,'rgba('+(mode==='cut'?'0,0,0':rgb)+','+alpha*.62+')');
 g.addColorStop(1,'rgba('+(mode==='cut'?'0,0,0':rgb)+',0)');
 ctx.save();trace(p.polygon);ctx.fillStyle=g;ctx.fill();
 if(mode==='tint'){
  // Narrow occlusion bands on the illuminated footprint, not a dark sticker on an unlit floor.
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  ctx.clip();ctx.fillStyle='rgba(38,26,21,'+p.strength*.24+')';
  trace([a,lerp(a,b,.10),lerp(d,c,.13),d]);ctx.fill();
  trace([lerp(a,b,.91),b,c,lerp(d,c,.88)]);ctx.fill();
 }
 ctx.restore();
}
function sample({exterior,curtain='open',lamp=false,deskLamp=false,windowX=.475,lampX=.5,lampY=.13,deskX=.805,deskY=.49,portal=null,doorOpen=false,doorX=.96,doorY=.68,doorBounds=null}){
 const t=transmission[curtain]??1;
 const daylight=clamp((exterior.outsideBrightness-.10)/.98);
 const natural=clamp((.055+daylight*.88)*t);
 const base=clamp(.69-natural*.46-(lamp?.10:0),.17,.72);
 const sources=[
  {id:'window',kind:kinds.natural,x:windowX,y:.47,rx:.40,ry:.67,strength:natural*.77,color:exterior.color},
  {id:'ceiling',kind:kinds.artificial,x:lampX,y:lampY+.19,rx:.62,ry:.83,strength:lamp?.85:0,color:[255,204,133]},
  {id:'desk',kind:kinds.artificial,x:deskX,y:deskY,rx:.205,ry:.34,strength:deskLamp?.85:0,color:[255,190,108]},
  {id:'adjacent-door',kind:kinds.artificial,x:doorX,y:doorY,rx:.12,ry:.36,strength:doorOpen&&portal?clamp((portal.natural??0)+(portal.artificial??0))*.95:0,color:portal?.color??[55,48,43]}
 ];
 return {base,natural,transmission:t,beam:clamp(daylight*t*.18),beamWidth:curtain==='closed'?.12:curtain==='half'?.52:1,beamColor:exterior.color,sources,portalProjection:portalProjection({portal,open:doorOpen,bounds:doorBounds??undefined})};
}
function interpolate(a,b,t){
 const mix=(x,y)=>x+(y-x)*t;
 return {...b,portalProjection:{...b.portalProjection,strength:mix(a.portalProjection.strength,b.portalProjection.strength),seam:mix(a.portalProjection.seam,b.portalProjection.seam),color:b.portalProjection.color.map((v,i)=>mix(a.portalProjection.color[i],v))},base:mix(a.base,b.base),natural:mix(a.natural,b.natural),beam:mix(a.beam,b.beam),beamWidth:mix(a.beamWidth,b.beamWidth),beamColor:b.beamColor.map((v,i)=>mix(a.beamColor[i],v)),sources:b.sources.map((v,i)=>({...v,strength:mix(a.sources[i].strength,v.strength),color:v.color.map((n,j)=>mix(a.sources[i].color[j],n))}))};
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
 paintPortal(ctx,w,h,state.portalProjection,'cut');
 ctx.globalCompositeOperation='source-over';
 // Subtle tint, not a solid white spot or simulated ray tracing.
 for(const light of state.sources){
  if(light.strength<=0)continue;
  ctx.save();ctx.translate(light.x*w,light.y*h);ctx.scale(light.rx*w,light.ry*h);
  const g=ctx.createRadialGradient(0,0,0,0,0,1),rgb=light.color.map(Math.round).join(',');
  g.addColorStop(0,'rgba('+rgb+','+(light.strength*.10)+')');g.addColorStop(1,'rgba('+rgb+',0)');
  ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
 paintPortal(ctx,w,h,state.portalProjection,'tint');
}
root.DungeonLightingV1=Object.freeze({version:'1.2.0',kinds,transmission,adjacent,portalProjection,sample,interpolate,paint});
})(window);
