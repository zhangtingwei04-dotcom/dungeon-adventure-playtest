/* Candidate V3 presentation adapter. Uses shared V1 motion and rig math. */
(function(root){'use strict';
function create(P){const R=root.DungeonCreatureRigV1,M=root.DungeonCreatureMotionV1.create(P.motion);
function sample(mode,ms){
 const running=mode==='run',g=mode==='run'?M.gaits.run:mode==='trot'?M.gaits.trot:M.gaits.walk,phase=(ms/g.period)%1,walk=['walk','trot','run'].includes(mode);
 const j=['jump','jump-up'].includes(mode)?M.jumpState(ms):['charge','pounce','slam'].includes(mode)?M.attackState(mode,ms):M.reactionModes.includes(mode)?M.reactionState(mode,ms):null;
 const b=j|| (running?M.gallopBody(phase):{dy:mode==='rest'?17:mode==='rise'?5+12*(1-R.ease(ms/850)):walk?5+.9*Math.cos(phase*8*Math.PI):5,pitch:0});
 const height=j?j.height:running?M.flightLift(phase):0;
 const dy=(b.dy+height-5)*.30-height+(walk?2.4:0),pitch=(b.pitch||0)*.10;
 const legs=P.legs.map(l=>{
  const hip=R.bodyPoint(l.hip[0],l.hip[1],dy,pitch,P.pivot),raw=j?M.jumpFoot(l,l.far,j):M.footAt(l,phase,walk,l.far,g),foot=[l.foot[0]+(raw[0]-l.foot[0])*.16,raw[1]+l.foot[1]-P.ground];
  const a=R.len(l.hip,l.knee),b=R.len(l.knee,l.ankle),ankle=R.pawPose(l,foot).ankle,knee=R.solve(hip,ankle,a,b,l.bend);
  const rows=R.skinRows(l,hip,knee,ankle,foot,l.skin);
  return {key:l.key,hip,knee,ankle,foot,rows,reachError:Math.abs(R.len(knee,ankle)-b)};
 });
 return {mode,stage:j?.stage||mode,height,dy,pitch,dx:0,legs};
}
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;}
function owner(x,y){for(let i=P.legs.length-1;i>=0;i--)if(inside(x,y,P.legs[i].polygon))return i;return -1;}
function split(img){const [w,h]=P.canvas;if(img.naturalWidth!==w||img.naturalHeight!==h)throw Error('V3 asset dimensions');const source=document.createElement('canvas');source.width=w;source.height=h;const sc=source.getContext('2d');sc.drawImage(img,0,0);const src=sc.getImageData(0,0,w,h);const canvases=Array.from({length:P.legs.length+1},()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c});const pixels=canvases.map(c=>c.getContext('2d').createImageData(w,h));for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=owner(x+.5,y+.5)+1;pixels[k].data.set(src.data.subarray(i,i+4),i);}canvases.forEach((c,i)=>c.getContext('2d').putImageData(pixels[i],0,0));return {original:source,body:canvases[0],legs:Object.fromEntries(P.legs.map((l,i)=>[l.key,canvases[i+1]]))};}
function draw(ctx,art,s,{debug=false,bodyOnly=false}={}){const leg=l=>{if(s.mode==='stand')ctx.drawImage(art.legs[l.key],0,0);else R.drawSkin(ctx,art.legs[l.key],l.rows);};if(!bodyOnly)s.legs.forEach(leg);ctx.save();ctx.translate(P.pivot[0],P.pivot[1]+s.dy);ctx.rotate(s.pitch);ctx.translate(-P.pivot[0],-P.pivot[1]);ctx.drawImage(art.body,0,0);ctx.restore();if(debug)for(const l of s.legs){ctx.strokeStyle=l.key.startsWith('far')?'#8ac8d5':'#f7cc78';ctx.lineWidth=1;ctx.beginPath();[l.hip,l.knee,l.ankle,l.foot].forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();for(const p of [l.hip,l.knee,l.ankle,l.foot])ctx.fillRect(p[0]-1,p[1]-1,3,3);}}
function audit(art){
 const [w,h]=P.canvas,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 // Compare neutral reconstruction against the original over an opaque background,
 // avoiding irrelevant RGB values of fully transparent pixels.
 function read(fn){g.clearRect(0,0,w,h);g.fillStyle='#263b31';g.fillRect(0,0,w,h);fn();return g.getImageData(0,0,w,h).data;}
 const ref=read(()=>g.drawImage(art.original,0,0)),actual=read(()=>draw(g,art,sample('stand',0)));
 let different=0,maxDelta=0;for(let i=0;i<ref.length;i+=4){let d=0;for(let k=0;k<3;k++)d=Math.max(d,Math.abs(ref[i+k]-actual[i+k]));if(d>1)different++;maxDelta=Math.max(maxDelta,d);}
 const bd=art.body.getContext('2d').getImageData(0,0,w,h).data,seen=new Uint8Array(w*h),sizes=[];
 for(let i=0;i<w*h;i++){if(seen[i]||bd[i*4+3]<=32)continue;let q=[i],n=0;seen[i]=1;for(let k=0;k<q.length;k++){const v=q[k],x=v%w,y=Math.floor(v/w);n++;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx<0||xx>=w||yy<0||yy>=h||seen[j]||bd[j*4+3]<=32)continue;seen[j]=1;q.push(j);}}sizes.push(n);}
 sizes.sort((a,b)=>b-a);return {different,maxDelta,bodyComponents:sizes.length,detachedPixels:sizes.slice(1).reduce((a,b)=>a+b,0)};
}
return Object.freeze({sample,split,draw,owner,audit});}
root.DungeonMossBeastV3Axial=Object.freeze(Object.fromEntries(Object.entries(root.DungeonMossBeastV3AxialProfiles).map(([k,p])=>[k,create(p)])));
})(typeof window==='undefined'?globalThis:window);