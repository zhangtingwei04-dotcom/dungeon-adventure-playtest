/* Female character facial overlay V1 — dev workbench preview only.
 * Reads the ACTUAL currently selected female 64x160 face pixels, not old
 * male or female source atlases. Original neutral = no pixel modifications.
 * Never edits hair/scalp, save state, GitHub or production game assets.
 * Facial updates bounded to left/right eyes and center mouth;
 * each render recreates scratch from unmodified source image.
 */
(function(root){
 'use strict';
 const W=64,H=160;
 const scratch=document.createElement('canvas');scratch.width=W;scratch.height=H;
 const c=scratch.getContext('2d',{willReadFrequently:true});
 if(!c){root.DungeonFemaleTrialExpressionV1=Object.freeze({ready:false});return}
 c.imageSmoothingEnabled=false;
 const palette=Object.freeze({
  dark:[80,46,50,255],
  line:[101,61,65,255],
  mouth:[189,121,100,255],
  blush:[225,141,144,170],
  tongue:[235,160,147,255],
  white:[247,242,226,255]
 });
 const clip=(x,y)=>x>=0&&x<W&&y>=0&&y<H;
 function patch(target,data,x,y,color){
  if(!clip(x,y))return;
  let i=(y*W+x)*4;
  for(let k=0;k<4;k++)data[i+k]=color[k];
 }
 function basePixel(base,x,y){
  let i=(y*W+x)*4;
  return [base[i],base[i+1],base[i+2],base[i+3]];
 }
 function drawEyes(base,data,kind){
  // Current reference head's eyes are at x22..28 / x35..41,
  // y35..40. Keep the upper eyebrow rows y31..33 untouched.
  const half=kind==='half',closed=kind==='closed';
  for(const [x0,x1,skinX] of [[22,28,30],[35,41,33]]){
   for(let y=35;y<=40;y++)for(let x=x0;x<=x1;x++){
    if(half&&y<=36)continue;
    patch(scratch,data,x,y,basePixel(base,skinX,y));
   }
   const y=closed?37:38;
   for(let x=x0+1;x<=x1-1;x++)patch(scratch,data,x,y,palette.dark);
   // Pixel-art tapered eyelid ends, not a wide black rectangle.
   patch(scratch,data,x0,y+1,palette.line);
   patch(scratch,data,x1,y+1,palette.line);
  }
 }
 function drawMouth(base,data,name){
  // Original tiny neutral mouth is x31..32 / y45.
  // Restore only the exact mouth region using neighboring skin samples.
  for(let y=44;y<=46;y++)for(let x=30;x<=34;x++){
   const pixel=basePixel(base,x===34?35:29,y);
   if(pixel[3]>150)patch(scratch,data,x,y,pixel);
  }
  const dot=(x,y,color=palette.mouth)=>patch(scratch,data,x,y,color);
  if(name==='smile'){
   dot(30,45);dot(33,45);dot(31,46);dot(32,46);
  }else if(name==='happy'){
   for(let x=30;x<=33;x++)dot(x,45);
   dot(31,46,palette.dark);dot(32,46,palette.tongue);
  }else if(name==='surprised'){
   dot(31,45,palette.dark);dot(32,45,palette.dark);
   dot(31,46,palette.dark);dot(32,46,palette.tongue);
  }else if(name==='frown'||name==='angry'){
   dot(30,46);dot(31,45);dot(32,45);dot(33,46);
  }else if(name==='shy'){
   dot(31,45);dot(32,45);
  }else if(name==='talkSmall'){
   dot(31,45,palette.dark);dot(32,45,palette.dark);dot(32,46,palette.tongue);
  }else if(name==='talkOpen'){
   for(let x=30;x<=33;x++)dot(x,45,palette.dark);
   dot(31,46,palette.tongue);dot(32,46,palette.tongue);
  }
 }
 function drawEmotion(base,data,kind){
  if(kind==='angry'){
   // Add angled brow ends; never move the original eye/eyebrow art.
   patch(scratch,data,27,33,palette.dark);
   patch(scratch,data,28,34,palette.line);
   patch(scratch,data,35,34,palette.line);
   patch(scratch,data,36,33,palette.dark);
  }else if(kind==='surprised'){
   patch(scratch,data,25,34,palette.line);
   patch(scratch,data,38,34,palette.line);
  }else if(kind==='shy'){
   for(const x of [23,24,39,40])patch(scratch,data,x,42,palette.blush);
  }
 }
 function render(ctx,image,frame,options={}){
  if(!ctx||!image||!frame)return;
  const status=frame.status||'normal';
  const pose=frame.expression||'original';
  const closed=pose==='eyesClosed'||frame.parts?.eyes==='eyesClosed'||!!options.closed;
  const weak=status==='weak'&&pose==='weak';
  const critical=status==='critical';
  let mouth=frame.parts?.mouth||pose;
  if(critical||weak)mouth='original';
  if(pose==='eyesClosed'&&!options.talking)mouth='original';
  if(['original','weak','critical'].includes(pose))mouth='original';
  if(options.talking){
   const step=Math.floor((options.time||0)/170)%4;
   mouth=step===0?'original':step===2?'talkOpen':'talkSmall';
  }
  const brows=frame.parts?.brows||pose;
  const mustPatch=closed||weak||mouth!=='original'||['angry','surprised','shy'].includes(brows);
  if(!mustPatch)return; // neutral = exact original PNG with zero differences
  c.clearRect(0,0,W,H);c.drawImage(image,0,0);
  const original=c.getImageData(0,0,W,H);
  const modified=new Uint8ClampedArray(original.data);
  if(closed||weak)drawEyes(original.data,modified,closed?'closed':'half');
  if(mouth!=='original')drawMouth(original.data,modified,mouth);
  if(!closed)drawEmotion(original.data,modified,brows);
  c.putImageData(new ImageData(modified,W,H),0,0);
  ctx.drawImage(scratch,0,0);
 }
 root.DungeonFemaleTrialExpressionV1=Object.freeze({
  version:'1.0.0',ready:true,
  render,
  faceBounds:Object.freeze({eyeBoxes:[[22,35,7,6],[35,35,7,6]],mouth:[30,44,5,3]}),
  usesCurrentFaceSource:true,
  productionApproved:false
 });
})(window);
