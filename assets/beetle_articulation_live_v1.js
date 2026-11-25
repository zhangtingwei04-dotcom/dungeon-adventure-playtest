/* Rust-shell beetle: localized leg and antenna articulation on original sprite.
   Six virtual leg phases; visible legs are deformed, occluded legs are not invented. */
window.DungeonBeetleArticulation=(function(){
 const W=145,H=89,P=24,CW=W+2*P,CH=H+2*P;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ramp=(v,a,b)=>{const q=clamp((v-a)/(b-a),0,1);return q*q*(3-2*q);};
 // Rear, middle, front on near and far sides, then two antenna roots.
 const pivots=[[39,53],[70,53],[103,49],[25,52],[55,52],[112,47],[119,27],[125,28]];
 function weights(x,y){
  // Keep shell and head rigid; only the exposed appendages move.
  const legs=ramp(y,53,72),left=1-ramp(x,30,49),middle=ramp(x,30,47)*(1-ramp(x,76,97)),right=ramp(x,87,105);
  const rearTip=(1-ramp(x,20,39))*ramp(y,48,60);
  const middleTip=ramp(x,35,52)*(1-ramp(x,61,78))*ramp(y,56,75);
  const frontTip=ramp(x,111,130)*ramp(y,49,61);
  const far=.45*(1-ramp(y,65,83));
  const ant= ramp(x,112,127)*(1-ramp(y,22,35));
  const split=ramp(x,123,136);
  return [legs*left,legs*middle,legs*right,rearTip*far,middleTip*far,frontTip*far,ant*(1-split),ant*split];
 }
 const n=CW*CH,coeff=pivots.map(()=>[new Float32Array(n),new Float32Array(n)]);
 for(let y=0,i=0;y<CH;y++)for(let x=0;x<CW;x++,i++){
  const px=x-P,py=y-P,w=weights(px,py);
  pivots.forEach(([cx,cy],j)=>{coeff[j][0][i]=-(py-cy)*w[j];coeff[j][1][i]=(px-cx)*w[j];});
 }
 function angles(v,t){
  const walk=v.mode==='crawl',turn=v.mode==='turn';
  const u=((t%10.9)+10.9)%10.9;
  const env=walk?Math.min(ramp(u,1.2,1.45)*(1-ramp(u,3.95,4.2))+ramp(u,6.2,6.45)*(1-ramp(u,8.95,9.2)),1):0;
  const phase=t*2*Math.PI*3.1, a=.13*env*Math.sin(phase), b=-a;
  return [a,b,a,b,a,b,.09*Math.sin(t*4.1)+(turn?.08:0),.075*Math.sin(t*3.2+1.2)-(turn?.07:0)];
 }
 // The closed-shell reference contains no flight pose. Draw provisional wing artwork
 // only during flight; use the original shell texture for lifted covers.
 function paintFlight(ctx,img,v,t){
  const q=clamp(v.wingOpen||0,0,1);if(q<.005)return;
  const flap=v.mode==='fly'?Math.sin(t*Math.PI*2*8):0;
  ctx.save();ctx.translate(P,P);
  ctx.globalCompositeOperation='destination-over';
  function wing(pivot,angle,far){
   ctx.save();ctx.translate(...pivot);ctx.rotate(angle);ctx.scale(1,Math.max(.16,.72+.26*flap*(far?-1:1)));
   const g=ctx.createLinearGradient(0,0,-66,-20);g.addColorStop(0,'rgba(177,143,86,.82)');g.addColorStop(.55,'rgba(223,211,165,.65)');g.addColorStop(1,'rgba(216,232,219,.28)');
   ctx.fillStyle=g;ctx.strokeStyle='rgba(106,91,59,.7)';ctx.lineWidth=1.15;
   ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-18,-15,-54,-24,-70,-12);ctx.bezierCurveTo(-71,3,-32,14,0,0);ctx.fill();ctx.stroke();
   ctx.strokeStyle='rgba(124,105,65,.48)';ctx.lineWidth=.8;
   for(const [x,y] of [[-60,-13],[-50,-2],[-35,7]]){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-25,-5,x,y);ctx.stroke();}
   ctx.restore();
  }
  wing([85,31],q*.62,true);wing([79,43],-q*.6,false);
  ctx.globalCompositeOperation='source-over';
  // Dark abdomen exposed under the opened elytra; keep the head and legs intact.
  ctx.globalAlpha=q*.92;ctx.fillStyle='#54341e';ctx.beginPath();ctx.ellipse(61,35,29,13,-.20,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#98643a';ctx.lineWidth=1.3;
  for(let x=42;x<82;x+=8){ctx.beginPath();ctx.moveTo(x,28);ctx.quadraticCurveTo(x+4,35,x+2,43);ctx.stroke();}
  ctx.globalAlpha=1;
  function cover(angle,dy,sy){
   ctx.save();ctx.translate(88,29+dy);ctx.rotate(angle);ctx.scale(1,sy);ctx.translate(-88,-29);
   ctx.beginPath();ctx.moveTo(88,30);ctx.bezierCurveTo(91,8,62,6,43,14);ctx.bezierCurveTo(24,21,18,37,24,46);ctx.bezierCurveTo(50,51,78,43,88,30);ctx.closePath();ctx.clip();ctx.drawImage(img,0,0,W,H);ctx.restore();
  }
  ctx.globalAlpha=q;cover(q*.53,-3,.72);cover(-q*.38,4,.78);ctx.restore();
 }
 const rigs=new WeakMap();
 function attach(node){
  const img=node.querySelector('.forest-v4-art img');if(!img)return;
  const art=img.parentElement,can=document.createElement('canvas');
  can.width=CW;can.height=CH;can.className='beetle-rig-canvas';can.setAttribute('aria-hidden','true');
  const ctx=can.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  const init=()=>{
   if(!img.naturalWidth||!node.isConnected||rigs.has(node))return;
   try{
    ctx.clearRect(0,0,CW,CH);ctx.drawImage(img,P,P,W,H);
    const source=ctx.getImageData(0,0,CW,CH).data;
    const out=ctx.createImageData(CW,CH);
    art.appendChild(can);rigs.set(node,{ctx,img,source,out,last:-Infinity,dx:new Float32Array(n),dy:new Float32Array(n)});
    node.dataset.beetleRig='ready';
   }catch(e){/* Original image remains visible if canvas is unavailable. */}
  };
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 function render(node,v,t,ms){
  const r=rigs.get(node);if(!r||ms-r.last<(v.mode==='fly'?32:50))return;r.last=ms;
  const a=angles(v,t),{dx,dy,source,out,ctx}=r,d=out.data;
  for(let i=0;i<n;i++){let x=0,y=0;for(let j=0;j<8;j++){x+=coeff[j][0][i]*a[j];y+=coeff[j][1][i]*a[j];}dx[i]=x;dy[i]=y;}
  for(let y=0,i=0;y<CH;y++)for(let x=0;x<CW;x++,i++){
   // Two inverse-field refinements and premultiplied bilinear resampling.
   let sx=x-dx[i],sy=y-dy[i];
   for(let k=0;k<2;k++){const j=clamp(Math.round(sy),0,CH-1)*CW+clamp(Math.round(sx),0,CW-1);sx=x-dx[j];sy=y-dy[j];}
   const o=i*4;if(sx<0||sy<0||sx>=CW-1||sy>=CH-1){d[o]=d[o+1]=d[o+2]=d[o+3]=0;continue;}
   const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
   const q=(iy*CW+ix)*4,q1=q+4,q2=q+CW*4,q3=q2+4;
   const w0=(1-fx)*(1-fy)*source[q+3],w1=fx*(1-fy)*source[q1+3],w2=(1-fx)*fy*source[q2+3],w3=fx*fy*source[q3+3],alpha=w0+w1+w2+w3;
   d[o+3]=alpha;
   if(alpha>.01){for(let k=0;k<3;k++)d[o+k]=(source[q+k]*w0+source[q1+k]*w1+source[q2+k]*w2+source[q3+k]*w3)/alpha;}else d[o]=d[o+1]=d[o+2]=0;
  }
  ctx.putImageData(out,0,0);
  paintFlight(ctx,r.img,v,t);
 }
 return {attach,render,angles,weights};
})();