/* 64x160 independent female eye motion.
 * Source is a separate, male-aligned bare face (female_parts_v2).
 * All paints stay within eye boxes; hair is a different image layer.
 */
(function(root){
 'use strict';
 const W=64,H=160;
 const eyes=[{cx:25,x0:20},{cx:39,x0:34}],top=32,boxW=11,boxH=10;
 let imagePixels=null,pending=false,failed=false;
 let malePixels=null,malePending=false;
 // Male head is a skin-recolored copy of this exact female face.
 // Cache that recolored sprite separately so eye blinks never paint pale patches.
 const src=()=>root.DUNGEON_FEMALE_FACE_V2||root.DUNGEON_FEMALE_HEAD_V1;
 const colorHex=hex=>/^#[0-9a-f]{6}$/i.test(hex||'')?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)):null;
 const isIris=(r,g,b)=>(b>=g+14&&r>=g+12&&r<=206&&b>=65);
 function prepare(){
  if(imagePixels||pending||failed)return;
  const uri=src();
  if(!uri||!uri.startsWith('data:image/png;base64,')){failed=true;return;}
  pending=true;const img=new Image();
  img.onload=()=>{
   try{
    if(img.width!==W||img.height!==H)throw Error('Female face must be 64x160');
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0);imagePixels=ctx.getImageData(0,0,W,H).data;
    root.dispatchEvent(new Event('dungeon-female-eyes-ready'));
   }catch(e){failed=true;console.warn('Female eye atlas:',e)}
   pending=false;
  };
  img.onerror=()=>{failed=true;pending=false};img.src=uri;
 }
 function prepareMale(){
  if(malePixels||malePending)return;
  const uri=root.DUNGEON_MALE_SHARED_FACE_V5;
  if(typeof uri!=='string'||!uri.startsWith('data:image/png;base64,'))return;
  malePending=true;const img=new Image();
  img.onload=()=>{
   try{
    if(img.width!==W||img.height!==H)throw Error('Male shared face must be 64x160');
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    malePixels=ctx.getImageData(0,0,W,H).data;
    root.dispatchEvent(new Event('dungeon-female-eyes-ready'));
   }catch(err){console.warn('Male shared eye source:',err)}
   malePending=false;
  };
  img.onerror=()=>{malePending=false};img.src=uri;
 }
 const sample=(px,x,y)=>Array.from(px.slice((y*W+x)*4,(y*W+x)*4+4));
 const pix=(px,x,y,c)=>{if(x<0||x>=W||y<0||y>=H)return;const i=(y*W+x)*4;for(let k=0;k<4;k++)px[i+k]=c[k];};
 const gaze=t=>{
  const phase=((Number(t)||0)%12600+12600)%12600;
  if(phase>=3100&&phase<4600)return 'left';
  if(phase>=6100&&phase<7600)return 'right';
  if(phase>=9500&&phase<10400)return 'down';
  return 'center';
 };
 function patch(type,irisColor,sourcePixels){
  const out=new Uint8ClampedArray(sourcePixels);
  for(const {cx} of eyes){
   if(type==='closed'||type==='half'){
    const upper=type==='closed'?34:37;
    for(let y=upper;y<=39;y++)for(let x=cx-4;x<=cx+4;x++){
     const skin=sample(sourcePixels,x,42);
     pix(out,x,y,skin[3]>100?skin:[252,226,209,255]);
    }
    const yy=type==='closed'?36:37;
    for(let x=cx-3;x<=cx+3;x++)pix(out,x,yy,[76,44,53,255]);
    continue;
   }
   const moving=type!=='center';
   const dx=type==='left'?-1:type==='right'?1:0;
   const dy=type==='up'?-1:type==='down'?1:0;
   const moved=[];
   for(let y=34;y<=39;y++)for(let x=cx-3;x<=cx+3;x++){
    const p=sample(sourcePixels,x,y);
    if(!isIris(p[0],p[1],p[2])||p[3]<80)continue;
    const tint=irisColor?[...irisColor,255]:p;
    if(irisColor){
     const shade=Math.max(.4,Math.min(1,(p[0]+p[1]+p[2])/360));
     for(let k=0;k<3;k++)tint[k]=Math.round(irisColor[k]*shade);
    }
    moved.push([x+dx,y+dy,tint]);
    if(moving)pix(out,x,y,sample(sourcePixels,x,42));
   }
   for(const [x,y,v] of moved)if(x>=cx-4&&x<=cx+4&&y>=34&&y<=39)pix(out,x,y,v);
  }
  return new ImageData(out,W,H);
 }
 function render(stage,opt={}){
  if(!stage||!(stage.classList.contains('paperdoll-female')||
    stage.classList.contains('paperdoll-shared-male-face')))return;
  const cv=stage.querySelector('.paperdoll-female-eye-motion-canvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
  const isSharedMale=stage.classList.contains('paperdoll-shared-male-face');
  const sourcePixels=isSharedMale?malePixels:imagePixels;
  if(!sourcePixels){if(isSharedMale)prepareMale();else prepare();return;}
  const type=opt.closed||opt.blink?'closed':opt.half?'half':(['left','right','up','down'].includes(opt.gaze)?opt.gaze:'center');
  const rgb=opt.eyeColor==='purple'||!opt.eyeColor?null:colorHex(opt.eyeColor);
  if(type==='center'&&!rgb)return; // face's original purple pupils, no needless overwrite
  const painted=patch(type,rgb,sourcePixels);
  for(const eye of eyes)ctx.putImageData(painted,0,0,eye.x0,top,boxW,boxH);
 }
 root.DungeonFemaleEyeMotionV1=Object.freeze({version:'2.1.0',render,gaze,prepare});
 prepare();
})(window);
