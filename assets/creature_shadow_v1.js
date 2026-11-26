/* 燈火核心：生物地面陰影 V1 — actor art and world shadow are separate. */
(function(root){'use strict';
 const profiles=Object.freeze({front:[153,145,126],quarter:[170,142,127],side:[208,143,129],rest:[143,61,53]});
 const cache=new WeakMap();
 function shadowPixel(r,g,b,a){const hi=Math.max(r,g,b),lo=Math.min(r,g,b);return a>0&&hi>=65&&hi<=155&&lo>=55&&hi-lo<=14&&b>=r-4&&r-g<=8;}
 function clean(img,profile){if(!img?.naturalWidth)return null;const p=profiles[profile];if(!p||img.naturalWidth!==p[0]||img.naturalHeight!==p[1])throw Error('Unreviewed creature shadow profile: '+profile);if(cache.has(img))return cache.get(img);
 const c=document.createElement('canvas');c.width=p[0];c.height=p[1];const g=c.getContext('2d');g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height),d=data.data;
 for(let y=p[2];y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(shadowPixel(d[i],d[i+1],d[i+2],d[i+3]))d[i]=d[i+1]=d[i+2]=d[i+3]=0;}
 g.putImageData(data,0,0);cache.set(img,c);return c;}
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function calculate({x,y,height=0,width=166,depth=14,light=1,weather=1}){const h=Math.max(0,Number(height)||0),w=Math.max(1,width),d=Math.max(1,depth),factor=clamp(1-h*.6/(w/2),.5,1);return {x,y,rx:w/2*factor,ry:d/2,alpha:clamp((.6-h*.009)*clamp(light,0,1)*clamp(weather,0,1),0,.6)};}
 function draw(ctx,s){ctx.save();ctx.fillStyle='rgba(25,41,30,'+s.alpha+')';ctx.beginPath();ctx.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);ctx.fill();ctx.restore();}
 root.DungeonCreatureShadowV1=Object.freeze({calculate,draw,clean,shadowPixel});
})(typeof window==='undefined'?globalThis:window);