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
 function ground(ctx,cover,w,h){if(cover<.025)return;ctx.save();ctx.scale(w/640,h/360);
  patches.forEach(([x,y,rx,ry,threshold],i)=>{const q=clamp(cover*1.5-(1-threshold),0,1);if(q<.04)return;
   const size=.35+.65*q;shape(ctx,x,y,rx*size,ry*size,i);ctx.fillStyle='rgba(83,109,112,'+(q*.28)+')';ctx.fill();
   shape(ctx,x,y-.7,rx*size*.96,ry*size*.82,i);
   const g=ctx.createLinearGradient(x,y-ry,x,y+ry);g.addColorStop(0,'rgba(219,232,229,'+(q*.86)+')');g.addColorStop(.6,'rgba(194,214,217,'+(q*.76)+')');g.addColorStop(1,'rgba(143,173,183,'+(q*.62)+')');ctx.fillStyle=g;ctx.fill();
  });ctx.restore();}
 const cache=new Map();
 const weights={wagon:1,crate_large:.86,crate_small:.86,crate_open:.48,barrel:.8,sack:.62,wheel_flat:.67,plank:.75,plank_lean:.32,rock_group:.85,rock_small:.9,log:.78,branch:.6,grass_a:.38,grass_b:.38,purple_flower:.22,white_flower:.22,lavender:.28,yellow_shrub:.45,mushroom:.45};
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
  const init=()=>{if(!node.isConnected||!img.naturalWidth||art.querySelector('.winter-snow-cap'))return;try{const key=kind+':'+img.src;let base=cache.get(key);if(!base){base=cap(img,kind);if(!base)return;cache.set(key,base);}const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;cv.getContext('2d').drawImage(base,0,0);cv.className='winter-snow-cap';cv.setAttribute('aria-hidden','true');cv.style.setProperty('--snow-hold',String(weight));art.appendChild(cv);}catch{}};
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 return {ground,attach,weights};
})();