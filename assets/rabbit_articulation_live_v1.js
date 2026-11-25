/* Moon-marked rabbit: continuous, source-preserving 2D skin deformation.
   Same joint intent as the approved preview; no independent rear-side artwork. */
window.DungeonRabbitArticulation=(function(){
 const W=114,H=121,P=12,CW=W+2*P,CH=H+2*P;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ramp=(v,a,b)=>{const q=clamp((v-a)/(b-a),0,1);return q*q*(3-2*q);};
 const pivots=[[42,62],[49,35],[48,36],[38,82],[77,88],[103,94]];
 // Soft weights prevent holes at the roots of the ears, neck and visible limbs.
 function weights(x,y){
  const upper=(1-ramp(y,57,81))*(1-ramp(x,45,65));
  const head=Math.max(upper,(1-ramp(y,29,48))*(1-ramp(x,84,99)));
  const ears=1-ramp(y,27,44),front=ramp(x,35,73);
  const fore=ramp(y,77,107)*(1-ramp(x,38,54)) * ramp(x,8,20);
  const hind=ramp(y,88,112)*ramp(x,51,70)*(1-ramp(x,95,111));
  const tail=ramp(x,94,111)*ramp(y,73,89)*(1-ramp(y,104,116));
  return [head,ears*(1-front),ears*front,fore,hind,tail];
 }
 const n=CW*CH,coeff=pivots.map(()=>[new Float32Array(n),new Float32Array(n)]);
 for(let y=0,i=0;y<CH;y++)for(let x=0;x<CW;x++,i++){
  const px=x-P,py=y-P,w=weights(px,py);
  pivots.forEach(([cx,cy],j)=>{coeff[j][0][i]=-(py-cy)*w[j];coeff[j][1][i]=(px-cx)*w[j];});
 }
 function angles(v,t){
  const a=[.014*Math.sin(t*2),.035*Math.sin(t*1.7+1),.032*Math.sin(t*1.5),0,0,0];
  if(v.mode==='pause'){
   const q=(.5-.5*Math.cos(t*2.4));a[0]=-.19*q+.023*Math.sin(t*8)*q;a[1]=.14*q;a[2]=.12*q;a[3]=-.045*q;
  }else if(v.mode==='turn'){a[0]=.07;a[1]=-.14;a[2]=.12*Math.sin(t*7);}
  else if(v.mode==='hop'){
   const q=clamp(v.lift/17,0,1);a[0]=.085*q;a[1]=.14*q;a[2]=.17*q;a[3]=.34*q;a[4]=-.29*q;a[5]=.12*q;
  }else if(v.mode==='crouch'||v.mode==='land'){a[0]=-.045;a[1]=.08;a[2]=.075;a[3]=-.07;a[4]=.055;}
  return a;
 }
 // Recolour only pale fur, preserving dark outlines, pink inner ears and moon marking.
 function goldenFur(data,w,h,p=0){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2];if(data[i+3]<12)continue;
   const light=(r+g+b)/3,fur=ramp(light,60,155)*(1-ramp(r-g,34,65))*(1-ramp(g-b,42,76));
   const belly=ramp(y-p,78,109)*(1-ramp(x-p,36,66));const blend=fur*(1-.64*belly);
   data[i]=Math.round(clamp(r+6*blend,0,255));data[i+1]=Math.round(clamp(g-27*blend,0,255));data[i+2]=Math.round(clamp(b-77*blend,0,255));
  }return data;
 }
 const rigs=new WeakMap();
 function attach(node){
  const img=node.querySelector('.forest-v4-art img');if(!img)return;
  const art=img.parentElement,can=document.createElement('canvas');
  can.width=CW;can.height=CH;can.className='rabbit-rig-canvas';can.setAttribute('aria-hidden','true');
  const ctx=can.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  const init=()=>{
   if(!img.naturalWidth||!node.isConnected||rigs.has(node))return;
   try{
    ctx.clearRect(0,0,CW,CH);ctx.drawImage(img,P,P,W,H);
    const source=ctx.getImageData(0,0,CW,CH).data;
    if(node.dataset.rabbitVariant==='golden')goldenFur(source,CW,CH,P);
    const out=ctx.createImageData(CW,CH);
    art.appendChild(can);rigs.set(node,{ctx,source,out,last:-Infinity,dx:new Float32Array(n),dy:new Float32Array(n)});
    node.dataset.rabbitRig='ready';
   }catch(e){/* Original image remains visible if canvas is unavailable. */}
  };
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 function render(node,v,t,ms){
  const r=rigs.get(node);if(!r||ms-r.last<42)return;r.last=ms;
  const a=angles(v,t),{dx,dy,source,out,ctx}=r,d=out.data;
  for(let i=0;i<n;i++){let x=0,y=0;for(let j=0;j<6;j++){x+=coeff[j][0][i]*a[j];y+=coeff[j][1][i]*a[j];}dx[i]=x;dy[i]=y;}
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
 return {attach,render,angles,weights,goldenFur};
})();