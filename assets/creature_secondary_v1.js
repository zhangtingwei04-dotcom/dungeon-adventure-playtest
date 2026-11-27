/* 燈火核心：鬃毛及尾巴次級動態 V1.0。獨立局部投影，方向資料由生物設定。 */
(function(root){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
function sample(mode,ms,secondary,p){const q=secondary||{},t=Math.max(0,ms);if(mode==='stand'||mode==='static'||mode==='down')return {mane:0,tail:0};
 const run=mode==='run'?ease(t/200):0,alert=mode==='alert'?(q.alert||0):mode==='charge'?.5*(q.alert||0):0;
 return {mane:clamp((q.mane||0)*.8+alert*p.maneMax-run*.6,-p.maneMax,p.maneMax),tail:clamp((q.tail||0)*1.15-run*.7,-p.tailMax,p.tailMax)};}
function band(x,a,b,c,d){return ease((x-a)/(b-a))*(1-ease((x-c)/(d-c)));}
function weights(x,y,p){const m=p.mane,t=p.tail;return {mane:band(x,...m.x)*(1-ease((y-m.rigidY)/(m.fixedY-m.rigidY))),tail:ease((x-t.rootX)/(t.tipX-t.rootX))*band(y,...t.y)};}
function sourcePoint(x,y,mane,tail,p){let sx=x,sy=y;for(let i=0;i<5;i++){const w=weights(sx,sy,p);sx=x-mane*w.mane*.35-tail*w.tail*.25;sy=y+mane*w.mane-tail*w.tail;}return [sx,sy];}
function create(p){let out=null,g=null,buf=null;const maps=new Map();function frame(source,mane,tail){const m=clamp(Math.round(mane||0),-p.maneMax,p.maneMax),t=clamp(Math.round(tail||0),-p.tailMax,p.tailMax);if(!m&&!t)return source;
 const w=source.width,h=source.height,key=w+'x'+h+':'+m+':'+t;
 if(!out||out.width!==w||out.height!==h){out=document.createElement('canvas');out.width=w;out.height=h;g=out.getContext('2d');buf=g.createImageData(w,h);}
 let map=maps.get(key);if(!map){map=new Int32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=sourcePoint(x+.5,y+.5,m,t,p),ix=Math.floor(q[0]),iy=Math.floor(q[1]);map[y*w+x]=ix>=0&&ix<w&&iy>=0&&iy<h?(iy*w+ix)*4:-1;}if(maps.size>=24)maps.delete(maps.keys().next().value);maps.set(key,map);}
 // Upstream head renderer reuses its output canvas: do not cache pixels by canvas identity.
 const src=source.getContext('2d').getImageData(0,0,w,h).data,d=buf.data;for(let i=0;i<map.length;i++){const j=map[i],k=i*4;if(j<0){d[k]=d[k+1]=d[k+2]=d[k+3]=0;}else{d[k]=src[j];d[k+1]=src[j+1];d[k+2]=src[j+2];d[k+3]=src[j+3];}}g.putImageData(buf,0,0);return out;
 }return Object.freeze({frame});}
root.DungeonCreatureSecondaryV1=Object.freeze({sample,weights,sourcePoint,create});
})(typeof window==='undefined'?globalThis:window);