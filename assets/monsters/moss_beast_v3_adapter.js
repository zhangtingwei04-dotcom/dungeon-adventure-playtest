/* Candidate V3 presentation adapter. Uses shared V1 motion and rig math. */
(function(root){'use strict';
const P=root.DungeonMossBeastV3Profile,R=root.DungeonCreatureRigV1,M=root.DungeonCreatureMotionV1.create(P.motion);
function sample(mode,ms){
 const running=mode==='run',g=mode==='run'?M.gaits.run:mode==='trot'?M.gaits.trot:M.gaits.walk,phase=(ms/g.period)%1,walk=['walk','trot','run'].includes(mode);
 const j=['jump','jump-up'].includes(mode)?M.jumpState(ms):['charge','pounce','slam'].includes(mode)?M.attackState(mode,ms):M.reactionModes.includes(mode)?M.reactionState(mode,ms):null;
 const b=j|| (running?M.gallopBody(phase):{dy:mode==='rest'?17:mode==='rise'?5+12*(1-R.ease(ms/850)):walk?5+.9*Math.cos(phase*8*Math.PI):5,pitch:0});
 const height=j?j.height:running?M.flightLift(phase):0;
 const dy=(b.dy+height-5)*.55-height,pitch=(b.pitch||0)*.65;
 const legs=P.legs.map(l=>{
  const hip=R.bodyPoint(l.hip[0],l.hip[1],dy,pitch,P.pivot),raw=j?M.jumpFoot(l,l.far,j):M.footAt(l,phase,walk,l.far,g),foot=[raw[0],raw[1]];
  const a=R.len(l.hip,l.knee),b=R.len(l.knee,l.ankle),ankle=R.pawPose(l,foot).ankle,knee=R.solve(hip,ankle,a,b,l.bend);
  const rows=R.skinRows(l,hip,knee,ankle,foot,l.skin);
  return {key:l.key,hip,knee,ankle,foot,rows,reachError:Math.abs(R.len(knee,ankle)-b)};
 });
 return {mode,stage:j?.stage||mode,height,dy,pitch,dx:mode==='jump-up'||!j?0:j.dx,legs};
}
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;}
function owner(x,y){for(let i=P.legs.length-1;i>=0;i--)if(inside(x,y,P.legs[i].polygon))return i;return -1;}
function split(img){const [w,h]=P.canvas;if(img.naturalWidth!==w||img.naturalHeight!==h)throw Error('V3 asset dimensions');const source=document.createElement('canvas');source.width=w;source.height=h;const sc=source.getContext('2d');sc.drawImage(img,0,0);const src=sc.getImageData(0,0,w,h);const canvases=Array.from({length:5},()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c});const pixels=canvases.map(c=>c.getContext('2d').createImageData(w,h));for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=owner(x+.5,y+.5)+1;pixels[k].data.set(src.data.subarray(i,i+4),i);}canvases.forEach((c,i)=>c.getContext('2d').putImageData(pixels[i],0,0));return {body:canvases[0],legs:Object.fromEntries(P.legs.map((l,i)=>[l.key,canvases[i+1]]))};}
function draw(ctx,art,s,{debug=false,bodyOnly=false}={}){const leg=l=>R.drawSkin(ctx,art.legs[l.key],l.rows);if(!bodyOnly)s.legs.slice(0,2).forEach(leg);ctx.save();ctx.translate(P.pivot[0],P.pivot[1]+s.dy);ctx.rotate(s.pitch);ctx.translate(-P.pivot[0],-P.pivot[1]);ctx.drawImage(art.body,0,0);ctx.restore();if(!bodyOnly)s.legs.slice(2).forEach(leg);if(debug)for(const l of s.legs){ctx.strokeStyle=l.key.startsWith('far')?'#8ac8d5':'#f7cc78';ctx.lineWidth=1;ctx.beginPath();[l.hip,l.knee,l.ankle,l.foot].forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();for(const p of [l.hip,l.knee,l.ankle,l.foot])ctx.fillRect(p[0]-1,p[1]-1,3,3);}}
root.DungeonMossBeastV3Adapter=Object.freeze({sample,split,draw,owner});
})(typeof window==='undefined'?globalThis:window);