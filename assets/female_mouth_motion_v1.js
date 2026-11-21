/* Female mouth motion V2 — 64x160 non-destructive sprite patch.
 * The approved head has a pale neutral mouth at x30..33, y51..52.
 * IMPORTANT: x29..34, y50..53 is the ONLY animation region. Do not
 * paint at y54..56: the jawline begins at y55 and must stay intact.
 * Neutral pose leaves the original face completely untouched.
 */
(function(root){
 'use strict';
 const W=64,H=160,LEFT=29,TOP=50,PW=6,PH=4;
 const POSES=new Set(['neutral','smile','happy','surprised','frown','shy','talkSmall','talkOpen']);
 const COLORS=Object.freeze({
  mid:[212,153,134,255],warm:[190,132,122,255],
  deep:[129,73,76,255],tongue:[236,167,152,255]
 });
 let sourcePatch=null,loading=false,failed=false;
 const clock=()=>root.performance&&typeof root.performance.now==='function'?root.performance.now():Date.now();
 function normalizePose(p){return POSES.has(p)?p:'neutral';}
 function imagePatch(full){
  const out=new Uint8ClampedArray(PW*PH*4);
  for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){
   const src=((TOP+y)*W+(LEFT+x))*4,dst=(y*PW+x)*4;
   for(let k=0;k<4;k++)out[dst+k]=full[src+k];
  }
  return out;
 }
 function prepare(){
  if(sourcePatch||loading||failed)return;
  const uri=root.DUNGEON_FEMALE_HEAD_V1;
  if(typeof uri!=='string'||!uri.startsWith('data:image/png;base64,')){failed=true;return;}
  loading=true;
  const img=new Image();
  img.onload=()=>{
   try{
    if(img.naturalWidth!==W||img.naturalHeight!==H)throw Error('Expected 64x160 female head');
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0);
    sourcePatch=imagePatch(ctx.getImageData(0,0,W,H).data);
    root.dispatchEvent(new Event('dungeon-female-mouth-ready'));
   }catch(err){failed=true;console.warn('Female mouth motion unavailable:',err);}
   loading=false;
  };
  img.onerror=()=>{failed=true;loading=false;};
  img.src=uri;
 }
 function makePose(base,pose){
  const data=new Uint8ClampedArray(base);
  const at=(x,y)=>( (y-TOP)*PW+(x-LEFT))*4;
  const px=(x,y,color)=>{
   if(x<LEFT||x>=LEFT+PW||y<TOP||y>=TOP+PH)return;
   const i=at(x,y);for(let k=0;k<4;k++)data[i+k]=color[k];
  };
  const get=(x,y)=>Array.from(base.slice(at(x,y),at(x,y)+4));
  // Remove the original pale neutral mouth: otherwise the two overlap.
  // x29 is normal cheek skin; copying its shade preserves the existing palette.
  for(let y=51;y<=52;y++)for(let x=30;x<=33;x++)px(x,y,get(29,y));
  const {mid,warm,deep,tongue}=COLORS;
  if(pose==='smile'){
   px(30,51,mid);px(31,52,warm);px(32,52,warm);px(33,51,mid);
  }else if(pose==='happy'){
   px(30,51,mid);px(31,51,deep);px(32,51,deep);px(33,51,mid);
   px(31,52,tongue);px(32,52,tongue);
  }else if(pose==='surprised'){
   px(31,51,warm);px(32,51,warm);px(31,52,deep);px(32,52,deep);
  }else if(pose==='frown'){
   px(30,52,warm);px(31,51,mid);px(32,51,mid);px(33,52,warm);
  }else if(pose==='shy'){
   px(31,52,mid);px(32,52,mid);
  }else if(pose==='talkSmall'){
   px(31,51,warm);px(32,51,warm);px(31,52,deep);px(32,52,tongue);
  }else if(pose==='talkOpen'){
   for(let x=30;x<=33;x++)px(x,51,deep);
   px(31,52,deep);px(32,52,tongue);
  }
  return new ImageData(data,PW,PH);
 }
 function render(stage,opts={}){
  if(!stage||!stage.classList.contains('paperdoll-female'))return;
  const canvas=stage.querySelector('.paperdoll-female-mouth-motion-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
  if(!sourcePatch){prepare();return;}
  let pose=opts.unconscious?'neutral':normalizePose(opts.pose);
  if(!opts.unconscious&&opts.talking){
   // Small mouth cycles; no dialog animation while asleep or unconscious.
   const step=Math.floor((Number(opts.time)||clock())/170)%4;
   pose=step===0?'neutral':step===2?'talkOpen':'talkSmall';
  }
  if(pose==='neutral')return;
  let base=sourcePatch;
  const tinted=stage.classList.contains('skin-tinted')&&stage.querySelector('.paperdoll-skin-canvas');
  if(tinted){
   const c=tinted.getContext('2d',{willReadFrequently:true});
   if(c)base=c.getImageData(LEFT,TOP,PW,PH).data;
  }
  ctx.putImageData(makePose(base,pose),LEFT,TOP);
 }
 root.DungeonFemaleMouthMotionV1=Object.freeze({version:'2.0.0',render,prepare,normalizePose});
 prepare();
})(window);
