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
 // The large right foreground boulder and grass are painted into the background,
 // not the independent rock sprite. Add a source-textured, feathered winter layer.
 const smooth=q=>{q=clamp(q,0,1);return q*q*(3-2*q);};
 // Contours traced from the V5 1280x720 background, in 640x360 space.
 // Softness is limited to the actual snow edge, not the entire patch.
 const rockSnow=[[500,279],[504,271],[511,264],[520,259],[532,255],[544,254],[555,255],[568,257],[579,260],[591,265],[600,271],[606,278],[600,280],[594,277],[588,281],[580,278],[572,282],[565,279],[556,283],[550,279],[542,282],[535,278],[526,280],[520,275],[511,278],[507,282]];
 const rootBanks=[
 [[482,289],[494,287],[502,290],[510,291],[519,288],[526,293],[538,295],[550,294],[563,297],[570,302],[558,306],[545,305],[534,308],[519,303],[503,304],[490,300],[478,298]],
 [[451,310],[467,305],[482,306],[493,309],[505,308],[515,314],[528,314],[538,320],[530,326],[515,326],[502,323],[488,326],[474,322],[462,321],[450,318]],
 [[534,308],[546,306],[557,309],[571,308],[582,306],[591,312],[587,320],[577,324],[563,322],[552,327],[539,324],[529,318]],
 [[469,333],[481,330],[495,332],[507,330],[520,337],[514,343],[503,346],[486,343],[473,345],[459,340]]
 ];
 function contour(x,y,points,feather=1.6){
  let inside=false,min=Infinity;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
   const [ax,ay]=points[j],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
   if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
   const q=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);
   min=Math.min(min,Math.hypot(x-ax-q*dx,y-ay-q*dy));
  }
  const rag=.65*Math.sin(x*.64+y*.82)+.38*Math.cos(x*1.41-y*.45);
  return smooth(.5+((inside?min:-min)+rag)/(2*feather));
 }
 function rightSnowProfile(x,y){
  if(x<445||x>609||y<250||y>349)return {cap:0,base:0};
  return {cap:contour(x,y,rockSnow,1.25),base:Math.max(...rootBanks.map(p=>contour(x,y,p,1.7)))};
 }
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
   const foliage=document.createElement('canvas');foliage.width=w;foliage.height=h;const fc=foliage.getContext('2d'),ff=fc.createImageData(w,h),fd=ff.data;
   // Only tint painted green leaves along the forest floor, not trunks, water or sky.
   for(let y=175;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
    if(area[i+3]>120)continue;
    const left=clamp((185-x)/50,0,1),right=clamp((x-490)/45,0,1),zone=Math.max(left,right)*clamp((y-175)/65,0,1);
    const r=pixels[i],g=pixels[i+1],bl=pixels[i+2],l=.25*r+.55*g+.2*bl;
    const green=clamp((g-Math.max(r,bl)-5)/22,0,1),edge=clamp((l-30)/75,0,1);
    if(zone*green*edge<.03)continue;
    const noise=.5+.5*Math.sin(x*.83+y*1.39)*Math.cos(y*.57-x*.24),q=zone*green*edge*(.35+.65*noise);
    fd[i]=clamp(l+64,0,244);fd[i+1]=clamp(l+79,0,250);fd[i+2]=clamp(l+88,0,255);fd[i+3]=Math.round(q*155);
   }fc.putImageData(ff,0,0);
   const rightWinter=document.createElement('canvas');rightWinter.width=w;rightWinter.height=h;
   const rc=rightWinter.getContext('2d'),rf=rc.createImageData(w,h),rd=rf.data;
   for(let y=250;y<350;y++)for(let x=445;x<610;x++){
    const i=(y*w+x)*4,{cap,base}=rightSnowProfile(x,y);
    if(Math.max(cap,base)<.01)continue;
    const r=pixels[i],g=pixels[i+1],bl=pixels[i+2],l=.25*r+.55*g+.20*bl;
    const n0=Math.sin(x*12.9898+y*78.233)*43758.5453,n=n0-Math.floor(n0)-.5;
    // Keep dark foreground leaves in front of the ground layer, not under a translucent veil.
    const foregroundLeaf=y>300?smooth((72-l)/28)*smooth((g-bl+4)/18):0;
    const ground=base*(1-foregroundLeaf*.99);
    const q=Math.max(cap,ground);
    const texture=n*8+5*Math.sin(x*.16+y*.31)+3*Math.cos(x*.43-y*.13);
    const relief=cap>ground?clamp((l-88)*.17,-12,12)-smooth((y-270)/13)*17:clamp((l-94)*.14,-10,10)-7*smooth((y-309)/37);
    rd[i]=clamp(212+texture+relief,0,255);rd[i+1]=clamp(224+texture+relief,0,255);rd[i+2]=clamp(231+texture+relief,0,255);
    rd[i+3]=Math.round(q*253);
   }rc.putImageData(rf,0,0);
   for(let y=0,j=0;y<h;y++)for(let x=0;x<w;x++,j++){const i=j*4;if(!area[i+3])continue;const r=pixels[i],g=pixels[i+1],bl=pixels[i+2],l=.25*r+.55*g+.20*bl;
    const grain=Math.sin(x*12.9898+y*78.233)*43758.5453,noise=grain-Math.floor(grain)-.5;
    const green=clamp((g-r-4)/32,0,1),shade=clamp((95-l)/95,0,1);
    const n=.43+.15*Math.sin(x*.048+y*.038)+.13*Math.cos(x*.084-y*.064)+.11*Math.sin(x*.19+y*.12)+.07*Math.cos(y*.31-x*.17)+noise*.14+green*.16+shade*.12;
    threshold[j]=clamp(n,.04,.96);
    // Retain small-scale source detail and terrain shading in a cool snow palette.
    const texture=(l-110)*.76+noise*13+4*Math.sin(x*.19+y*.25);
    d[i]=clamp(198+texture,93,244);d[i+1]=clamp(213+texture*.91,107,250);d[i+2]=clamp(222+texture*.86,119,255);
    // Keep some painted vegetation and dark rock texture even under heavy snow.
    area[i+3]=Math.round(area[i+3]*(1-green*.28-shade*.13));
   }
   surface={source:img,w,h,out,o,frame,threshold,area,foliage,rightWinter,last:-1};return surface;
  }catch{return null;}
 }
 function paintSurface(ctx,cover,w,h,source,frost=0){
  const a=makeSurface(source);if(!a)return false;const level=Math.round(clamp(cover,0,1)*48)/48;
  if(a.last!==level){const d=a.frame.data;for(let j=0;j<a.threshold.length;j++){const i=j*4,mask=a.area[i+3];if(!mask){d[i+3]=0;continue;}const v=level<=0?0:clamp((level-a.threshold[j]+.11)/.22,0,1);const edge=v*v*(3-2*v);const complete=clamp((level-.88)/.12,0,1);d[i+3]=Math.round(mask*Math.max(edge*.91,complete*.87));}a.o.putImageData(a.frame,0,0);a.last=level;}
  ctx.drawImage(a.out,0,0,w,h);ctx.save();ctx.globalAlpha=clamp(Math.max(cover*.83,frost*.68),0,1);ctx.drawImage(a.foliage,0,0,w,h);ctx.globalAlpha=smooth((cover-.12)/.77);ctx.drawImage(a.rightWinter,0,0,w,h);ctx.restore();return true;
 }
 function ground(ctx,cover,w,h,source=null,frost=0){if(Math.max(cover,frost)<.025)return;if(source&&paintSurface(ctx,cover,w,h,source,frost))return;if(cover<.025)return;ctx.save();ctx.scale(w/640,h/360);
  patches.forEach(([x,y,rx,ry,threshold],i)=>{const q=clamp(cover*1.5-(1-threshold),0,1);if(q<.04)return;
   const size=.35+.65*q;shape(ctx,x,y,rx*size,ry*size,i);ctx.fillStyle='rgba(83,109,112,'+(q*.28)+')';ctx.fill();
   shape(ctx,x,y-.7,rx*size*.96,ry*size*.82,i);
   const g=ctx.createLinearGradient(x,y-ry,x,y+ry);g.addColorStop(0,'rgba(219,232,229,'+(q*.86)+')');g.addColorStop(.6,'rgba(194,214,217,'+(q*.76)+')');g.addColorStop(1,'rgba(143,173,183,'+(q*.62)+')');ctx.fillStyle=g;ctx.fill();
  });ctx.restore();}
 const cache=new Map();
 // Burial is visual only: do not remove resources, change positions or mutate saves.
 const burial={grass_a:1,grass_b:.76,purple_flower:1,white_flower:.9,lavender:.53,yellow_shrub:.48,mushroom:.91};
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
 function grassProfile(id,x,y){
  let h=2166136261;for(const ch of String(id))h=Math.imul(h^ch.charCodeAt(0),16777619);
  const q=(h>>>0)/4294967296,shelter=x<38&&y<74?.66:1;
  return {wind:(.80+q*.40)*shelter,tempo:.84+q*.32,size:.96+q*.08,tone:.96+q*.08,frost:.80+q*.20};
 }
 function applyBurial(node,art,source,kind){
  const depth=plantDepth(kind,parseFloat(node.style.left)||50,parseFloat(node.style.top)||80,parseFloat(node.style.width)||5);
  if(!depth)return;
  const key='bounds:'+source.src;let b=cache.get(key);if(!b){b=bounds(source);if(!b)return;cache.set(key,b);}
  node.dataset.winterPlant='true';
  if(kind.startsWith('grass_')){
   const p=grassProfile(node.dataset.objectId,parseFloat(node.style.left)||50,parseFloat(node.style.top)||80);
   node.dataset.grassDetail='true';for(const [key,value] of Object.entries(p))node.style.setProperty('--grass-'+key,value.toFixed(3));
  }
  art.style.setProperty('--winter-padding',b.padding+'%');art.style.setProperty('--winter-depth',(b.height*depth)+'%');
  art.style.setProperty('--winter-left',Math.max(0,b.left-4)+'%');art.style.setProperty('--winter-right',Math.max(0,b.right-4)+'%');
 }

 const weights={vine:.25,wagon:1,crate_large:.86,crate_small:.86,crate_open:.48,barrel:.8,sack:.62,wheel_flat:.67,plank:.75,plank_lean:.32,rock_group:.85,rock_small:.9,log:.78,branch:.6,grass_a:.84,grass_b:.78,purple_flower:.22,white_flower:.22,lavender:.28,yellow_shrub:.45,mushroom:.45};
 function cap(source,kind){
  const w=Math.min(320,source.naturalWidth),h=Math.max(1,Math.round(source.naturalHeight*w/source.naturalWidth));if(!w||!h)return null;
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d',{willReadFrequently:true});if(!cx)return null;
  cx.drawImage(source,0,0,w,h);const src=cx.getImageData(0,0,w,h).data,out=cx.createImageData(w,h),d=out.data;
  // Frost follows individual exposed leaf edges instead of painting a continuous white band.
  if(kind.startsWith('grass_')||burial[kind]||kind==='vine'){
   const opaque=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&src[(y*w+x)*4+3]>145;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(src[i+3]<145)continue;
    const edge=!opaque(x,y-1)?1:!opaque(x,y-2)?.62:!opaque(x-1,y)?.35:!opaque(x+1,y)?.28:0;
    const n=.5+.5*Math.sin(x*.61+y*.43)*Math.cos(x*.17-y*.82),height=1-y/h;
    const q=edge*(.20+.80*n)*(.45+.55*height);
    if(q<.08)continue;
    const l=.25*src[i]+.55*src[i+1]+.20*src[i+2];
    d[i]=clamp(179+l*.30,0,248);d[i+1]=clamp(195+l*.27,0,252);d[i+2]=clamp(207+l*.25,0,255);d[i+3]=Math.round(src[i+3]*q);
   }cx.clearRect(0,0,w,h);cx.putImageData(out,0,0);return cv;
  }
  const top=new Int32Array(w).fill(-1);
  for(let x=0;x<w;x++)for(let y=0;y<h;y++){if(src[(y*w+x)*4+3]>180){top[x]=y;break;}}
  const thickness=Math.max(2,Math.min(kind==='wagon'?42:kind.startsWith('rock_')?36:25,h*(kind==='wagon'?.20:kind.startsWith('rock_')?.34:.24)));
  for(let x=1;x<w-1;x++){const y=top[x];if(y<0||top[x-1]<0||top[x+1]<0||Math.abs(top[x-1]-top[x+1])>Math.max(5,thickness*1.8))continue;
   const n=.77+.17*Math.sin(x*.17)+.10*Math.cos(x*.81),depth=Math.max(1,thickness*n);
   for(let dy=0;dy<depth;dy++){const yy=y+dy;if(yy>=h)break;const i=(yy*w+x)*4;if(src[i+3]<140)continue;const q=dy/depth;const l=.25*src[i]+.55*src[i+1]+.2*src[i+2],detail=(l-115)*.25;
    d[i]=clamp(Math.round(231-q*47+detail),0,255);d[i+1]=clamp(Math.round(239-q*36+detail),0,255);d[i+2]=clamp(Math.round(244-q*28+detail),0,255);d[i+3]=Math.round(src[i+3]*(1-q*.80));}
  }cx.clearRect(0,0,w,h);cx.putImageData(out,0,0);return cv;
 }
 // Sparse highlights sampled from opaque sprite pixels; never paint outside the asset.
 const wetMaterials={wagon:.82,crate_large:.65,crate_small:.65,crate_open:.6,barrel:.66,sack:.32,wheel_flat:.46,plank:.53,plank_lean:.48,rock_group:.78,rock_small:.8,log:.58,branch:.42};
 function wetGlints(source,kind){
  const plant=Boolean(burial[kind]||kind==='vine'),w=Math.min(240,source.naturalWidth),h=Math.max(1,Math.round(source.naturalHeight*w/source.naturalWidth));
  if(!w||!h)return null;const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const g=cv.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(source,0,0,w,h);
  const data=g.getImageData(0,0,w,h).data;g.clearRect(0,0,w,h);
  const opaque=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&data[(y*w+x)*4+3]>215;
  const count=plant?Math.min(12,Math.max(3,Math.round(w/14))):Math.min(22,Math.max(4,Math.round(w/10)));
  let drawn=0;
  for(let i=0;i<500&&drawn<count;i++){
   const x=2+((i*73+19)%Math.max(1,w-4)),y=2+((i*47+Math.floor(i/7)*11)%Math.max(1,h-4));
   if(!opaque(x,y)||!opaque(x+1,y)||!opaque(x,y+1))continue;
   const p=(y*w+x)*4,l=(data[p]+data[p+1]+data[p+2])/3;
   if(l<65||plant&&y>h*.72||!plant&&y>h*.83)continue;
   g.fillStyle='rgba(172,204,214,.42)';g.fillRect(x,y+1,1,1);
   g.fillStyle='rgba(220,241,244,.87)';g.fillRect(x,y,1,1);
   if(!plant&&opaque(x+1,y+1)){g.fillStyle='rgba(184,216,226,.48)';g.fillRect(x+1,y+1,1,1);}
   drawn++;
  }return cv;
 }
 function attachWet(node,art,img,kind){
  const plant=Boolean(burial[kind]||kind==='vine'),weight=plant?.88:wetMaterials[kind];
  if(!weight||art.querySelector('.surface-wet-glints'))return;
  const key='wet:'+kind+':'+img.src;let base=cache.get(key);
  if(!base){base=wetGlints(img,kind);if(!base)return;cache.set(key,base);}
  const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;cv.getContext('2d').drawImage(base,0,0);
  cv.className='surface-wet-glints';cv.setAttribute('aria-hidden','true');cv.style.setProperty('--surface-wet-weight',String(weight));
  node.dataset.surfaceWet=plant?'plant':'material';node.style.setProperty('--surface-wet-weight',String(weight));art.appendChild(cv);
 }
 function attach(node,art,img,kind){
  const weight=weights[kind];if(!weight)return;
  const init=()=>{if(!node.isConnected||!img.naturalWidth||art.querySelector('.winter-snow-cap'))return;try{applyBurial(node,art,img,kind);attachWet(node,art,img,kind);const key=kind+':'+img.src;let base=cache.get(key);if(!base){base=cap(img,kind);if(!base)return;cache.set(key,base);}const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;cv.getContext('2d').drawImage(base,0,0);cv.className='winter-snow-cap';cv.setAttribute('aria-hidden','true');cv.style.setProperty('--snow-hold',String(weight));art.appendChild(cv);}catch{}};
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 return {ground,attach,weights,plantDepth,grassProfile,rightSnowProfile};
})();