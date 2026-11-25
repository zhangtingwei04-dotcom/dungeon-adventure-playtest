/* Winter surfaces V1: localized snow banks plus alpha-derived sprite snow caps. */
window.DungeonWinterV1=(function(){
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const patches=[
 [112,211,37,6,.8],[169,200,29,5,.7],[255,194,39,5,.65],[320,205,35,6,.68],[425,209,45,6,.7],
 [193,240,39,8,.85],[242,258,32,7,.8],[295,276,32,7,.72],[450,253,34,7,.75],[475,279,29,7,.8],
 [230,302,34,9,.8],[287,320,36,8,.9],[424,321,37,8,.9],[469,341,36,9,.9],[357,352,34,6,.5],
 [145,161,23,7,.75],[482,176,25,9,.9],[549,176,22,6,.65]
 ];
 function shape(ctx,x,y,rx,ry,seed){
  ctx.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,f=.83+.12*Math.sin(i*2.31+seed)+.08*Math.cos(i*1.7-seed);const px=x+Math.cos(a)*rx*f,py=y+Math.sin(a)*ry*f;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();
 }
 // V5 terrain mask: preserve trees, boulders, foreground leaves and waterfall.
 const terrain=[[67,194],[104,177],[130,164],[164,166],[190,165],[208,164],[235,161],[257,162],[280,166],[305,175],[340,184],[364,188],[390,186],[420,188],[445,196],[467,199],[484,204],[508,207],[528,211],[556,213],[583,212],[610,208],[640,205],[640,255],[613,252],[600,269],[565,275],[548,295],[520,298],[510,321],[486,338],[459,360],[185,360],[184,339],[163,320],[151,309],[134,310],[130,292],[108,284],[103,260],[92,246],[82,228],[73,215]];
 const holes=[[[111,273],[120,258],[139,251],[164,252],[186,264],[198,282],[205,303],[188,311],[163,308],[141,301],[118,294]],[[499,284],[506,263],[524,250],[549,249],[571,255],[590,267],[598,284],[591,304],[562,306],[535,301],[514,294]]];
 let surface=null;
 function makeSurface(img){
  if(!img?.naturalWidth)return null;
  if(surface?.source===img)return surface;
  try{
   const w=640,h=360,base=document.createElement('canvas'),mask=document.createElement('canvas'),out=document.createElement('canvas');for(const cv of [base,mask,out]){cv.width=w;cv.height=h;}
   const b=base.getContext('2d',{willReadFrequently:true}),m=mask.getContext('2d',{willReadFrequently:true}),o=out.getContext('2d');
   b.drawImage(img,0,0,w,h);
   function poly(points){m.beginPath();points.forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();}
   m.fillStyle='white';poly(terrain);m.globalCompositeOperation='destination-out';holes.forEach(poly);
   const pixels=b.getImageData(0,0,w,h).data,area=m.getImageData(0,0,w,h).data,frame=o.createImageData(w,h),threshold=new Float32Array(w*h),d=frame.data;
   for(let y=0,j=0;y<h;y++)for(let x=0;x<w;x++,j++){const i=j*4;if(!area[i+3])continue;const r=pixels[i],g=pixels[i+1],bl=pixels[i+2],l=.25*r+.55*g+.20*bl;
    const n=.48+.19*Math.sin(x*.048+y*.038)+.15*Math.cos(x*.084-y*.064)+.10*Math.sin(x*.19+y*.12)+.06*Math.cos(y*.31-x*.17);
    threshold[j]=clamp(n,.04,.96);
    // Retain small-scale source detail and terrain shading in a cool snow palette.
    d[i]=clamp(202+(l-110)*.32,145,246);d[i+1]=clamp(218+(l-110)*.28,165,251);d[i+2]=clamp(223+(l-110)*.25,174,255);
   }
   surface={source:img,w,h,out,o,frame,threshold,area,last:-1};return surface;
  }catch{return null;}
 }
 function paintSurface(ctx,cover,w,h,source){
  const a=makeSurface(source);if(!a)return false;const level=Math.round(clamp(cover,0,1)*48)/48;
  if(a.last!==level){const d=a.frame.data;for(let j=0;j<a.threshold.length;j++){const i=j*4,mask=a.area[i+3];if(!mask){d[i+3]=0;continue;}const v=clamp((level-a.threshold[j]+.11)/.22,0,1);const edge=v*v*(3-2*v);const complete=clamp((level-.88)/.12,0,1);d[i+3]=Math.round(mask*Math.max(edge*.96,complete*.98));}a.o.putImageData(a.frame,0,0);a.last=level;}
  ctx.drawImage(a.out,0,0,w,h);return true;
 }
 function ground(ctx,cover,w,h,source=null){if(cover<.025)return;if(source&&paintSurface(ctx,cover,w,h,source))return;ctx.save();ctx.scale(w/640,h/360);
  patches.forEach(([x,y,rx,ry,threshold],i)=>{const q=clamp(cover*1.5-(1-threshold),0,1);if(q<.04)return;
   const size=.35+.65*q;shape(ctx,x,y,rx*size,ry*size,i);ctx.fillStyle='rgba(83,109,112,'+(q*.28)+')';ctx.fill();
   shape(ctx,x,y-.7,rx*size*.96,ry*size*.82,i);
   const g=ctx.createLinearGradient(x,y-ry,x,y+ry);g.addColorStop(0,'rgba(219,232,229,'+(q*.86)+')');g.addColorStop(.6,'rgba(194,214,217,'+(q*.76)+')');g.addColorStop(1,'rgba(143,173,183,'+(q*.62)+')');ctx.fillStyle=g;ctx.fill();
  });ctx.restore();}
 const cache=new Map();
 // Burial is visual only: do not remove resources, change positions or mutate saves.
 const burial={grass_a:1,grass_b:.76,purple_flower:.86,white_flower:.9,lavender:.53,yellow_shrub:.48,mushroom:.91};
 function plantDepth(kind,x,y,width){
  const base=burial[kind]||0;if(!base)return 0;
  const sheltered=x<38&&y<74?.78:1;
  const size=clamp(1.14-(width-3)*.035,.76,1.12);
  return clamp(base*sheltered*size,0,1);
 }
 function bounds(source){
  const w=Math.min(160,source.naturalWidth),h=Math.max(1,Math.round(source.naturalHeight*w/source.naturalWidth));
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d',{willReadFrequently:true});
  cx.drawImage(source,0,0,w,h);const d=cx.getImageData(0,0,w,h).data;let top=h,bottom=-1,left=w,right=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>150){top=Math.min(top,y);bottom=Math.max(bottom,y);left=Math.min(left,x);right=Math.max(right,x);}
  return bottom<0?null:{padding:(h-1-bottom)/h*100,height:(bottom-top+1)/h*100,left:left/w*100,right:(w-1-right)/w*100};
 }
 function applyBurial(node,art,source,kind){
  const depth=plantDepth(kind,parseFloat(node.style.left)||50,parseFloat(node.style.top)||80,parseFloat(node.style.width)||5);
  if(!depth)return;
  const key='bounds:'+source.src;let b=cache.get(key);if(!b){b=bounds(source);if(!b)return;cache.set(key,b);}
  node.dataset.winterPlant='true';
  art.style.setProperty('--winter-padding',b.padding+'%');art.style.setProperty('--winter-depth',(b.height*depth)+'%');
  art.style.setProperty('--winter-left',Math.max(0,b.left-4)+'%');art.style.setProperty('--winter-right',Math.max(0,b.right-4)+'%');
 }

 const weights={vine:.25,wagon:1,crate_large:.86,crate_small:.86,crate_open:.48,barrel:.8,sack:.62,wheel_flat:.67,plank:.75,plank_lean:.32,rock_group:.85,rock_small:.9,log:.78,branch:.6,grass_a:.38,grass_b:.38,purple_flower:.22,white_flower:.22,lavender:.28,yellow_shrub:.45,mushroom:.45};
 function cap(source,kind){
  const w=Math.min(320,source.naturalWidth),h=Math.max(1,Math.round(source.naturalHeight*w/source.naturalWidth));if(!w||!h)return null;
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d',{willReadFrequently:true});if(!cx)return null;
  cx.drawImage(source,0,0,w,h);const src=cx.getImageData(0,0,w,h).data,out=cx.createImageData(w,h),d=out.data;
  const top=new Int32Array(w).fill(-1);
  for(let x=0;x<w;x++)for(let y=0;y<h;y++){if(src[(y*w+x)*4+3]>180){top[x]=y;break;}}
  const thickness=Math.max(2,Math.min(17,h*(kind==='wagon'?.085:kind.startsWith('grass')?.11:.17)));
  for(let x=1;x<w-1;x++){const y=top[x];if(y<0||top[x-1]<0||top[x+1]<0||Math.abs(top[x-1]-top[x+1])>Math.max(5,thickness*1.8))continue;
   const n=.68+.26*Math.sin(x*.43)+.12*Math.cos(x*1.21),depth=Math.max(1,thickness*n);
   for(let dy=0;dy<depth;dy++){const yy=y+dy;if(yy>=h)break;const i=(yy*w+x)*4;if(src[i+3]<140)continue;const q=dy/depth;d[i]=Math.round(231-q*54);d[i+1]=Math.round(239-q*36);d[i+2]=Math.round(239-q*25);d[i+3]=Math.round(src[i+3]*(1-q*.64));}
  }cx.clearRect(0,0,w,h);cx.putImageData(out,0,0);return cv;
 }
 function attach(node,art,img,kind){
  const weight=weights[kind];if(!weight)return;
  const init=()=>{if(!node.isConnected||!img.naturalWidth||art.querySelector('.winter-snow-cap'))return;try{applyBurial(node,art,img,kind);const key=kind+':'+img.src;let base=cache.get(key);if(!base){base=cap(img,kind);if(!base)return;cache.set(key,base);}const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;cv.getContext('2d').drawImage(base,0,0);cv.className='winter-snow-cap';cv.setAttribute('aria-hidden','true');cv.style.setProperty('--snow-hold',String(weight));art.appendChild(cv);}catch{}};
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 return {ground,attach,weights,plantDepth};
})();