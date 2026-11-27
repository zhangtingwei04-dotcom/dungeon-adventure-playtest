/* 燈火核心候選：各物種獨立驚擾退場；時間毫秒、位置百分比。 */
(function(root){'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=u=>u*u*(3-2*u),mix=(a,b,u)=>a+(b-a)*u;
function sample(o,age,{cover=null}={}){
 const kind=o.assetId.replace('forest4_','');if(age<0)return o;
 if(!['rabbit','bird','butterfly','beetle'].includes(kind))return o;
 const delay={rabbit:180,bird:80,butterfly:320,beetle:420}[kind],t=age-delay;
 if(t<0)return o;
 if(kind==='rabbit'){
  const dir=o.x>=50?1:-1,end=dir>0?109:-9,n=3,period=360,total=n*period;
  if(t>=total)return null;
  const k=Math.floor(t/period),u=(t%period)/period,air=clamp((u-.15)/.7),p=(k+ease(air))/n;
  const lift=Math.sin(Math.PI*air)*2.8,crouch=u<.15?Math.sin(Math.PI*u/.15):u>.85?Math.sin(Math.PI*(u-.85)/.15):0;
  return {...o,x:mix(o.x,end,p),y:o.y,flip:dir>0,rotation:0,lift,stretch:1-.12*crouch+.05*Math.sin(Math.PI*air),escapeKind:kind};
 }
 if(kind==='bird'){
  const u=clamp(t/1050);if(u>=1)return null;
  const prep=clamp(t/130),p=ease(clamp((t-130)/920));
  return {...o,x:mix(o.x,-12,p),y:o.y,lift:(o.y+15)*p,flip:true,rotation:0,escapeKind:kind,birdPose:{open:prep,brake:0,pitch:-.18,peck:0,hop:0,crouch:t<130?Math.sin(Math.PI*prep):0,tuck:prep,tail:.12},birdTime:t/1000};
 }
 if(kind==='beetle'){
  // Crawl to a real nearby cover object, shrink visibility only during the final occlusion.
  if(!cover)return o;
  const u=clamp(t/1050);if(u>=1)return null;
  return {...o,x:mix(o.x,cover.x,u),y:mix(o.y,cover.y,u),flip:cover.x<o.x,rotation:0,escapeKind:kind,escapeOpacity:1-ease(clamp((u-.82)/.18)),lift:0};
 }
 const u=clamp(t/1500);if(u>=1)return null;
 const p=ease(u);return {...o,x:mix(o.x,110,p)+Math.sin(u*Math.PI*6)*1.2*Math.sin(Math.PI*u),y:o.y,lift:(o.y+10)*p,rotation:0,escapeKind:kind,flutter:.84+.16*Math.abs(Math.cos(t*.037))};
}
root.DungeonWildlifeExitV1=Object.freeze({sample});
})(typeof window==='undefined'?globalThis:window);
