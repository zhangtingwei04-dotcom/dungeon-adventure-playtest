/* Female paper doll mouth motion V1 — 64x160 pixel-art overlay.
 * Preserve the approved combined head sprite and the nose/chin pixels.
 * Only tiny mouth poses near x29..35, y53..55 are painted.
 */
(function(root){
 'use strict';
 const W=64,H=160;
 const DARK='#50313b',MID='#966371',LIP='#d58b88',INNER='#482837',TONGUE='#e7a0a3';
 const POSES=new Set(['neutral','smile','happy','surprised','frown','shy','talkSmall','talkOpen']);
 function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
 function normalizePose(value){return POSES.has(value)?value:'neutral';}
 function render(stage,options={}){
  if(!stage||!stage.classList.contains('paperdoll-female'))return;
  const canvas=stage.querySelector('.paperdoll-female-mouth-motion-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;
  ctx.clearRect(0,0,W,H);
  let pose=options.unconscious?'neutral':normalizePose(options.pose);
  // Talking is session-only preview. Real dialogue can drive this in future.
  if(!options.unconscious&&options.talking){
   const phase=Math.floor((Number(options.time)||0)/170)%4;
   pose=phase===0?'neutral':phase===2?'talkOpen':'talkSmall';
  }
  if(pose==='neutral'){
   rect(ctx,30,54,4,1,DARK);
   rect(ctx,31,55,2,1,MID);
  }else if(pose==='smile'){
   rect(ctx,29,53,1,1,MID);rect(ctx,34,53,1,1,MID);
   rect(ctx,30,54,4,1,DARK);
   rect(ctx,31,55,2,1,LIP);
  }else if(pose==='happy'){
   rect(ctx,29,53,1,1,MID);rect(ctx,34,53,1,1,MID);
   rect(ctx,30,53,4,1,DARK);
   rect(ctx,30,54,4,1,INNER);
   rect(ctx,31,55,2,1,TONGUE);
  }else if(pose==='shy'){
   rect(ctx,30,54,3,1,DARK);
   rect(ctx,30,55,2,1,LIP);
  }else if(pose==='surprised'){
   rect(ctx,31,53,2,1,DARK);
   rect(ctx,30,54,4,1,INNER);
   rect(ctx,31,55,2,1,DARK);
  }else if(pose==='frown'){
   rect(ctx,30,53,4,1,MID);
   rect(ctx,29,54,1,1,DARK);rect(ctx,34,54,1,1,DARK);
  }else if(pose==='talkSmall'){
   rect(ctx,30,53,4,1,DARK);
   rect(ctx,30,54,4,1,INNER);
  }else if(pose==='talkOpen'){
   rect(ctx,30,53,4,1,DARK);
   rect(ctx,30,54,4,1,INNER);
   rect(ctx,31,55,2,1,TONGUE);
  }
 }
 root.DungeonFemaleMouthMotionV1=Object.freeze({render,normalizePose});
})(window);
