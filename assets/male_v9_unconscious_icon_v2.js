/* Male V9 only: enlarge the single floating unconscious spiral from native
 * 5x5 to 8x8 pixels around its unchanged x55/y12 anchor. Reuse the shared
 * black spiral animation and its already-approved slow rotation. No changes
 * to face eyes, hair, battle-defeat spirals, female sprites or the V8 rollback.
 */
(function(root){
 'use strict';
 const SIZE=8,SOURCE=5;
 const buffer=document.createElement('canvas');
 buffer.width=9;buffer.height=9;
 const b=buffer.getContext('2d');
 function draw(ctx,time=0,x=55,y=12){
  const motion=root.DungeonExpressionMotion;
  if(!ctx||!b||!motion?.drawUnconsciousEyes)return false;
  b.clearRect(0,0,9,9);
  // The established 0.45 time factor produces the previously approved
  // rotation speed. The single spiral is the SAME sprite as before.
  motion.drawUnconsciousEyes(b,time*0.45,{eyeCenters:[[4,4]]});
  ctx.save();
  ctx.imageSmoothingEnabled=false;
  // Source pixel art covers x2..6/y2..6; enlarge to 8x8 without blur.
  ctx.drawImage(buffer,2,2,SOURCE,SOURCE,Math.round(x-SIZE/2),Math.round(y-SIZE/2),SIZE,SIZE);
  ctx.restore();
  return true;
 }
 root.DungeonMaleV9UnconsciousIcon=Object.freeze({version:'2.0.0',size:SIZE,draw});
})(window);
