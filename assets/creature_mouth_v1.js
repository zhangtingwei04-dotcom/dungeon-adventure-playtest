/* 燈火核心：共用嘴部動態 V1。角度由動作階段驅動，素材與關節由各生物設定。 */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
function sample(mode,ms,attack={windup:440,push:580,airEnd:1050,rearDown:1170,end:1580},max=34){
 const t=Math.max(0,ms),mix=(a,b,u)=>a+(b-a)*ease(u);let open=0;
 if(mode==='pounce'){if(t<attack.windup)open=mix(0,.40,t/attack.windup);else if(t<attack.push)open=mix(.40,1,(t-attack.windup)/(attack.push-attack.windup));else if(t<attack.airEnd-85)open=1;else if(t<attack.airEnd+45)open=mix(1,0,(t-(attack.airEnd-85))/130);}
 else if(mode==='charge'||mode==='alert')open=.35*ease(t/420);
 else if(mode==='run')open=.16+.09*(.5+.5*Math.sin(t/480*Math.PI*2));
 else if(mode==='hit'||mode==='heavy-hit')open=.55*Math.sin(Math.PI*clamp(t/360,0,1));
 else if(mode==='slam')open=.35*Math.sin(Math.PI*clamp(t/1320,0,1));
 return clamp(open,0,1)*max;
}
function rotate(p,pivot,deg){const r=-deg*Math.PI/180,c=Math.cos(r),s=Math.sin(r),x=p[0]-pivot[0],y=p[1]-pivot[1];return [pivot[0]+x*c-y*s,pivot[1]+x*s+y*c];}
function create(profile){const cache=new WeakMap(),max=profile.maxAngle;
 function poly(g,points,color){g.fillStyle=color;g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();}
 function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 function frame(source,deg){const angle=clamp(Math.round(deg||0),0,max);if(!angle)return source;let store=cache.get(source);if(!store){store=new Map();cache.set(source,store);}if(store.has(angle))return store.get(angle);
 const c=canvas(source.width,source.height),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(source,0,0);
 if(profile.projection==='frontal'||profile.projection==='oblique'){
  const f=angle/max;for(const l of profile.layers)poly(g,l.points.map(([x,y,dy,dx=0])=>[Math.round(x+dx*f),Math.round(y+dy*f*(profile.verticalScale??1))]),l.color);
  for(const p of profile.upperPolygons){g.save();g.beginPath();p.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.closePath();g.clip();g.drawImage(source,0,0);g.restore();}
  store.set(angle,c);return c;
 }
 g.globalCompositeOperation='destination-out';poly(g,profile.cut,'#000');g.globalCompositeOperation='source-over';
 const rot=p=>rotate(p,profile.pivot,angle);
 poly(g,[[32,112],[43,110],[53,109],rot([53,113]),rot([43,114]),rot([33,114])],'#352223');
 poly(g,[[37,113],[46,111],rot([46,113]),rot([39,114])],'#643735');
 for(const l of profile.layers)poly(g,l.points.map(rot),l.color);
 // Original upper muzzle and fang remain above the new jaw.
 g.save();g.beginPath();profile.upper.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.clip();g.drawImage(source,0,0);g.restore();
 store.set(angle,c);return c;
 }return Object.freeze({frame,maxAngle:max});
}
root.DungeonCreatureMouthV1=Object.freeze({sample,rotate,create});
})(typeof window==='undefined'?globalThis:window);