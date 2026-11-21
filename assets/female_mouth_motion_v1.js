/* Female mouth expressions V3 — separate face, male-aligned 64x160.
 * Source mouth is at x31..33 / y44; never draw over nose or jaw.
 * Original neutral is preserved without an overlay.
 */
(function(root){
 'use strict';
 const W=64,H=160,LEFT=29,TOP=43,MALE_TOP=45,PW=7,PH=4;
 const poses=new Set(['neutral','smile','happy','surprised','frown','shy','talkSmall','talkOpen']);
 let base=null,loading=false,failed=false;
 let maleBase=null,maleLoading=false;
 // Match gender-specific skin pixels: male face is female art recolored warm.
 function prepare(){
  if(base||loading||failed)return;
  const uri=root.DUNGEON_FEMALE_FACE_V2||root.DUNGEON_FEMALE_HEAD_V1;
  if(!uri||!uri.startsWith('data:image/png;base64,')){failed=true;return;}
  loading=true;const img=new Image();
  img.onload=()=>{
   try{
    if(img.width!==W||img.height!==H)throw Error('Expected 64x160 face source');
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const raw=ctx.getImageData(0,0,W,H).data,part=new Uint8ClampedArray(PW*PH*4);
    for(let y=0;y<PH;y++)for(let x=0;x<PW;x++)for(let k=0;k<4;k++)
     part[(y*PW+x)*4+k]=raw[((TOP+y)*W+LEFT+x)*4+k];
    base=part;root.dispatchEvent(new Event('dungeon-female-mouth-ready'));
   }catch(err){failed=true;console.warn('Female mouth source:',err)}
   loading=false;
  };
  img.onerror=()=>{failed=true;loading=false};img.src=uri;
 }
 function prepareMale(){
  if(maleBase||maleLoading)return;
  const uri=root.DUNGEON_MALE_SHARED_FACE_V5;
  if(typeof uri!=='string'||!uri.startsWith('data:image/png;base64,'))return;
  maleLoading=true;const img=new Image();
  img.onload=()=>{
   try{
    if(img.width!==W||img.height!==H)throw Error('Male shared face must be 64x160');
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const raw=ctx.getImageData(0,0,W,H).data,part=new Uint8ClampedArray(PW*PH*4);
    for(let y=0;y<PH;y++)for(let x=0;x<PW;x++)for(let k=0;k<4;k++)
     part[(y*PW+x)*4+k]=raw[((MALE_TOP+y)*W+LEFT+x)*4+k];
    maleBase=part;root.dispatchEvent(new Event('dungeon-female-mouth-ready'));
   }catch(err){console.warn('Male shared mouth source:',err)}
   maleLoading=false;
  };
  img.onerror=()=>{maleLoading=false};img.src=uri;
 }
 function poseFrame(background,pose){
  const pixels=new Uint8ClampedArray(background);
  const get=(x,y)=>Array.from(background.slice(((y-TOP)*PW+x-LEFT)*4,((y-TOP)*PW+x-LEFT)*4+4));
  const set=(x,y,c)=>{if(x<LEFT||x>=LEFT+PW||y<TOP||y>=TOP+PH)return;const j=((y-TOP)*PW+x-LEFT)*4;for(let k=0;k<4;k++)pixels[j+k]=c[k];};
  const edge=[154,98,98,255],dark=[90,49,60,255],soft=[217,151,142,255],tongue=[235,172,155,255];
  // Remove only the small neutral mouth, never the under-chin black outline.
  for(let x=30;x<=34;x++)for(let y=44;y<=45;y++)set(x,y,get(29,y));
  if(pose==='smile'){
   set(30,44,edge);set(31,45,soft);set(32,45,soft);set(33,44,edge);
  }else if(pose==='happy'){
   for(let x=30;x<=33;x++)set(x,44,edge);
   set(31,45,dark);set(32,45,tongue);
  }else if(pose==='surprised'){
   set(31,44,dark);set(32,44,dark);
   set(31,45,dark);set(32,45,tongue);
  }else if(pose==='frown'){
   set(30,45,edge);set(31,44,soft);set(32,44,soft);set(33,45,edge);
  }else if(pose==='shy'){
   set(31,45,soft);set(32,45,soft);
  }else if(pose==='talkSmall'){
   set(31,44,dark);set(32,44,dark);
   set(31,45,soft);set(32,45,soft);
  }else if(pose==='talkOpen'){
   for(let x=30;x<=33;x++)set(x,44,dark);
   set(31,45,dark);set(32,45,tongue);
  }
  return new ImageData(pixels,PW,PH);
 }
 // Male V8 uses its OWN mouth at x31..32/y46; the female's neutral mouth
 // and y44 facial patch must never paint over the new head's nose.
 function malePoseFrame(background,pose){
  const pixels=new Uint8ClampedArray(background);
  const get=(x,y)=>Array.from(background.slice(((y-MALE_TOP)*PW+x-LEFT)*4,((y-MALE_TOP)*PW+x-LEFT)*4+4));
  const set=(x,y,color)=>{
   if(x<LEFT||x>=LEFT+PW||y<MALE_TOP||y>=MALE_TOP+PH)return;
   const j=((y-MALE_TOP)*PW+x-LEFT)*4;
   for(let k=0;k<4;k++)pixels[j+k]=color[k];
  };
  const edge=[145,68,47,255],dark=[84,42,43,255],soft=[211,134,106,255],tongue=[241,160,143,255];
  // Replace only the NEW neutral mouth; keep nose at y43 and chin at y49.
  for(let x=30;x<=34;x++)for(let y=46;y<=47;y++)set(x,y,get(29,y));
  if(pose==='smile'){
   set(30,46,edge);set(31,47,soft);set(32,47,soft);set(33,46,edge);
  }else if(pose==='happy'){
   for(let x=30;x<=33;x++)set(x,46,edge);
   set(31,47,dark);set(32,47,tongue);
  }else if(pose==='surprised'){
   set(31,46,dark);set(32,46,dark);set(31,47,dark);set(32,47,tongue);
  }else if(pose==='frown'){
   set(30,47,edge);set(31,46,soft);set(32,46,soft);set(33,47,edge);
  }else if(pose==='shy'){
   set(31,47,soft);set(32,47,soft);
  }else if(pose==='talkSmall'){
   set(31,46,dark);set(32,46,dark);set(31,47,soft);set(32,47,soft);
  }else if(pose==='talkOpen'){
   for(let x=30;x<=33;x++)set(x,46,dark);
   set(31,47,dark);set(32,47,tongue);
  }
  return new ImageData(pixels,PW,PH);
 }
 function render(stage,opts={}){
  if(!stage||!(stage.classList.contains('paperdoll-female')||
    stage.classList.contains('paperdoll-shared-male-face')))return;
  const cv=stage.querySelector('.paperdoll-female-mouth-motion-canvas');if(!cv)return;
  const ctx=cv.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
  const isSharedMale=stage.classList.contains('paperdoll-shared-male-face');
  const sourceBase=isSharedMale?maleBase:base;
  if(!sourceBase){if(isSharedMale)prepareMale();else prepare();return;}
  let pose=opts.unconscious?'neutral':(poses.has(opts.pose)?opts.pose:'neutral');
  if(!opts.unconscious&&opts.talking){
   const step=Math.floor((Number(opts.time)||0)/170)%4;
   pose=step===0?'neutral':step===2?'talkOpen':'talkSmall';
  }
  if(pose==='neutral')return;
  let skinBase=sourceBase;
  if(stage.classList.contains('skin-tinted')){
   const skin=stage.querySelector('.paperdoll-skin-canvas')?.getContext('2d',{willReadFrequently:true});
   if(skin)skinBase=skin.getImageData(LEFT,isSharedMale?MALE_TOP:TOP,PW,PH).data;
  }
  ctx.putImageData(isSharedMale?malePoseFrame(skinBase,pose):poseFrame(skinBase,pose),LEFT,isSharedMale?MALE_TOP:TOP);
 }
 root.DungeonFemaleMouthMotionV1=Object.freeze({version:'3.2.0',render,prepare});
 prepare();
})(window);
