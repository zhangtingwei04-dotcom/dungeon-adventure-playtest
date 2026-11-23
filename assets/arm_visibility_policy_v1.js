/* 《迷宮盡頭的燈火》 — reusable garment-aware arm visibility.
 * Version 1: 64x160 native pixels. This module does NOT alter source art.
 * Draws a cloak FRONT layer with the arm pixels removed from its alpha:
 * existing hands, currently worn shirt sleeves, and future hand garments
 * become visible from the already-painted layers below the cloak.
 * Shoulder/collar/upper cape and hanging fabric outside the actual arm
 * silhouettes remain untouched.
 *
 * NOTE: This is an opt-in workbench pipeline, not yet official gameplay.
 * The overlay image and user's equipment coordinates are never mutated.
 */
(function(global){
 'use strict';
 const NATIVE_WIDTH=64,NATIVE_HEIGHT=160;
 const VERSION='arm-visibility-reveal-current-garments-v1';
 function newCanvas(width,height){
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  return canvas;
 }
 // Slightly conservative corridors; no body or trousers outside the arm zone
 // can be exposed. Measured original landmarks: shoulder y56, elbow y70,
 // wrist y83. The cape should cover y<74, then yield to lower arms/hands.
 function leftInnerLimit(y){
  if(y<74||y>102)return -1;
  if(y<81)return 22;
  if(y<89)return 20;
  if(y<97)return 19;
  return 18;
 }
 function inArmCorridor(x,y){
  const limit=leftInnerLimit(y);
  return limit>=0&&(x<=limit||x>=NATIVE_WIDTH-1-limit);
 }
 // Optional future garments (armour, gloves) can be passed in without
 // requiring a hard-coded shirt ID or re-cutting the approved cloak PNG.
 function paintCloakFront({ctx,outerImage,outerTransform,paintLayer,
   bodyImage,garmentLayers=[],edgeGuardPx=0}){
  if(!ctx||!outerImage||typeof paintLayer!=='function')return false;
  const frontCanvas=newCanvas(NATIVE_WIDTH,NATIVE_HEIGHT);
  const frontCtx=frontCanvas.getContext('2d',{willReadFrequently:true});
  if(!frontCtx)return false;
  frontCtx.imageSmoothingEnabled=false;
  paintLayer(frontCtx,outerImage,outerTransform);

  const bodyCanvas=newCanvas(NATIVE_WIDTH,NATIVE_HEIGHT);
  const coverage=bodyCanvas.getContext('2d',{willReadFrequently:true});
  if(!coverage){ctx.drawImage(frontCanvas,0,0);return false}
  coverage.imageSmoothingEnabled=false;
  if(bodyImage)coverage.drawImage(bodyImage,0,0,NATIVE_WIDTH,NATIVE_HEIGHT);
  for(const layer of garmentLayers){
   if(layer&&layer.image){
    paintLayer(coverage,layer.image,layer.transform);
   }
  }
  const source=coverage.getImageData(0,0,NATIVE_WIDTH,NATIVE_HEIGHT).data;
  const pixels=frontCtx.getImageData(0,0,NATIVE_WIDTH,NATIVE_HEIGHT);
  const out=pixels.data;

  // Each column is cut only where the current under-cloak body/clothing
  // actually exists. Do NOT cut rectangular areas in the cloak artwork.
  // Dilation <= 1 pixel is optional and helps align layered cuff outlines.
  const guard=Math.max(0,Math.min(1,Math.round(Number(edgeGuardPx)||0)));
  for(let y=74;y<=102;y++){
   for(let x=0;x<NATIVE_WIDTH;x++){
    if(!inArmCorridor(x,y))continue;
    const i=(y*NATIVE_WIDTH+x)*4;
    if(out[i+3]===0)continue;
    let occupied=source[i+3]>=45;
    if(!occupied&&guard){
     for(let dy=-1;dy<=1&&!occupied;dy++){
      const yy=y+dy;if(yy<0||yy>=NATIVE_HEIGHT)continue;
      for(let dx=-1;dx<=1;dx++){
       const xx=x+dx;
       if(xx<0||xx>=NATIVE_WIDTH||!inArmCorridor(xx,yy))continue;
       if(source[(yy*NATIVE_WIDTH+xx)*4+3]>=95){occupied=true;break}
      }
     }
    }
    if(occupied)out[i+3]=0;
   }
  }
  frontCtx.putImageData(pixels,0,0);
  ctx.drawImage(frontCanvas,0,0);
  return true;
 }
 global.DungeonArmVisibilityPolicyV1=Object.freeze({
  version:VERSION,canvas:{width:NATIVE_WIDTH,height:NATIVE_HEIGHT},
  leftInnerLimit,inArmCorridor,paintCloakFront
 });
})(window);
