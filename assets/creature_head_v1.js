/* 燈火核心：局部頭部俯仰 V1。方向專屬遮罩，頭頸柔性過渡；與口部組合。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
function sample(mode,ms,secondary=0,attack={windup:440,push:580,airEnd:1050,end:1580},max=7){
 const t=Math.max(0,ms),mix=(a,b,u)=>a+(b-a)*ease(u);let v=0;
 if(mode==='stand'||mode==='static'||mode==='down')v=0;
 else if(mode==='alert')v=mix(0,5,t/500);
 else if(mode==='charge')v=mix(0,-5,t/440);
 else if(mode==='pounce'){
 if(t<attack.windup)v=mix(0,-5,t/attack.windup);
 else if(t<attack.push)v=mix(-5,6,(t-attack.windup)/(attack.push-attack.windup));
 else if(t<attack.airEnd)v=mix(6,-5,(t-attack.push)/(attack.airEnd-attack.push));
 else v=mix(-5,0,(t-attack.airEnd)/(attack.end-attack.airEnd));
 }else if(mode==='run'||mode==='trot'||mode==='walk')v=(mode==='run'?1.8:mode==='trot'?1.4:1.1)*secondary;
 else if(mode==='jump'||mode==='jump-up'||mode==='slam'||mode==='rise'||mode==='hit'||mode==='heavy-hit'||mode==='recover')v=-2*secondary;
 else v=-secondary;
 return clamp(Number.isFinite(v)?v:0,-max,max);
}
function sourcePoint(x,y,deg,p){
 if(p.projection==='frontal'){
  // Frontal pitch is a symmetric projected vertical motion, never image-plane roll.
  let sy=y;const wx=1-ease((Math.abs(x-p.centerX)-p.rigidRadius)/(p.fixedRadius-p.rigidRadius));
  for(let i=0;i<5;i++){const wy=ease((sy-p.upperFixed)/(p.upperRigid-p.upperFixed))*(1-ease((sy-p.taperY)/(p.fixedY-p.taperY)));sy=y+deg/p.maxAngle*p.shift*wx*wy;}
  return [x,sy];
 }
 let sx=x,sy=y;const [px,py]=p.pivot;
 for(let i=0;i<5;i++){
 const w=(1-ease((sx-p.rigidX)/(p.fixedX-p.rigidX)))*(1-ease((sy-p.taperY)/(p.fixedY-p.taperY)));
 const r=-deg*Math.PI/180*w,c=Math.cos(r),s=Math.sin(r);
 sx=px+(x-px)*c-(y-py)*s;sy=py+(x-px)*s+(y-py)*c;
 }return [sx,sy];
}
function create(p){
 const maps=new Map(),pixels=new WeakMap();let output=null,ctx=null;
 function frame(source,deg,volatile=false){
 const a=clamp(Math.round(deg||0),-p.maxAngle,p.maxAngle);if(!a)return source;
 const w=source.width,h=source.height,key=w+'x'+h+':'+a;
 if(!output||output.width!==w||output.height!==h){output=document.createElement('canvas');output.width=w;output.height=h;ctx=output.getContext('2d');}
 let map=maps.get(key);if(!map){map=new Int32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const [sx,sy]=sourcePoint(x+.5,y+.5,a,p),ix=Math.floor(sx),iy=Math.floor(sy);map[y*w+x]=ix>=0&&ix<w&&iy>=0&&iy<h?(iy*w+ix)*4:-1;}maps.set(key,map);}
 let src=volatile?null:pixels.get(source);if(!src){src=source.getContext('2d').getImageData(0,0,w,h).data;if(!volatile)pixels.set(source,src);}
 const out=ctx.createImageData(w,h),d=out.data;for(let i=0;i<map.length;i++){const j=map[i];if(j<0)continue;const k=i*4;d[k]=src[j];d[k+1]=src[j+1];d[k+2]=src[j+2];d[k+3]=src[j+3];}ctx.putImageData(out,0,0);return output;
 }return Object.freeze({frame,maxAngle:p.maxAngle});
}
root.DungeonCreatureHeadV1=Object.freeze({sample,sourcePoint,create});
})(typeof window==='undefined'?globalThis:window);