/* Rust-shell beetle: localized leg and antenna articulation on original sprite.
   Six virtual leg phases; visible legs are deformed, occluded legs are not invented. */
window.DungeonBeetleArticulation=(function(){
 const W=145,H=89,P=8,CW=W+2*P,CH=H+2*P;
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
    art.appendChild(can);rigs.set(node,{ctx,source,out,last:-Infinity,dx:new Float32Array(n),dy:new Float32Array(n)});
    node.dataset.beetleRig='ready';
   }catch(e){/* Original image remains visible if canvas is unavailable. */}
  };
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 function render(node,v,t,ms){
  const r=rigs.get(node);if(!r||ms-r.last<50)return;r.last=ms;
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
 }
 return {attach,render,angles,weights};
})();