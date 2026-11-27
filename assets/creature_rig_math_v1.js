/* 燈火核心：四足骨架與連續蒙皮 V1 */
(function(root){'use strict';
const clamp=(n,l,h)=>Math.max(l,Math.min(h,n)),len=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]),angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
function solve(hip,foot,a,b,bend){
 const dx=foot[0]-hip[0],dy=foot[1]-hip[1],raw=Math.hypot(dx,dy),d=clamp(raw,Math.abs(a-b)+.01,a+b-.01);
 const base=Math.atan2(dy,dx),off=Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
 const theta=base+bend*off;return [hip[0]+Math.cos(theta)*a,hip[1]+Math.sin(theta)*a];
}
function pawPose(l,foot){return {ankle:[foot[0]+l.ankle[0]-l.foot[0],foot[1]+l.ankle[1]-l.foot[1]],angle:0};}

function bodyPoint(x,y,dy,pitch=0,pivot=[105,90]){const c=Math.cos(pitch),q=Math.sin(pitch),[cx,cy]=pivot;return [cx+(x-cx)*c-(y-cy)*q,cy+dy+(x-cx)*q+(y-cy)*c];}
function skinRows(l,hip,knee,ankle,foot,profile){
 const {topY,joinY,kneeY,ankleY,endY,xLimit,minSpan=0}=profile;
 const hx=hip[0]-l.hip[0],hy=hip[1]-l.hip[1],ax=ankle[0]-l.ankle[0],ay=ankle[1]-l.ankle[1],top=topY+hy,bottom=ankleY+ay,span=Math.max(minSpan,bottom-top);
 const mid=clamp(knee[1],top+span*.30,bottom-span*.16),kx=clamp(knee[0]-l.knee[0],Math.min(hx,ax)-xLimit,Math.max(hx,ax)+xLimit);
 return [{y:topY,t:top,dx:hx},{y:joinY,t:top+(mid-top)*(joinY-topY)/(kneeY-topY),dx:hx+(kx-hx)*.30},{y:kneeY,t:mid,dx:kx},{y:ankleY,t:bottom,dx:ax},{y:endY,t:endY+ay,dx:ax}];
}
function drawSkin(ctx,texture,rows){for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1],n=b.y-a.y;for(let j=0;j<n;j++){const u=j/n,v=(j+1)/n,x=a.dx+(b.dx-a.dx)*(u+v)/2,y=a.t+(b.t-a.t)*u,h=(b.t-a.t)/n;if(h>0)ctx.drawImage(texture,0,a.y+j,texture.width,1,x,y,texture.width,h+.10);}}}
root.DungeonCreatureRigV1=Object.freeze({clamp,ease,len,angle,solve,pawPose,bodyPoint,skinRows,drawSkin});
})(typeof window==='undefined'?globalThis:window);