/* Front-only brown leather gloves V1 for 《迷宮盡頭的燈火》.
 * Cropped from the user's two newly generated transparent pixel art pairs,
 * then pixel-nearest fitted as male / female 64x160 full-canvas sprites.
 * Testing ONLY in developer-studio, not official game, no save changes.
 * Male pair: 11x17 per glove at native Y81; female: 10x15 at Y83.
 */
(function(root){
 'use strict';
 const sheet='data:image/png;base64,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';
 const names=Object.freeze(['maleTravelerGlovesFront','femaleTravelerGlovesFront']);
 async function build(){
  const img=await new Promise((resolve,reject)=>{
   const i=new Image();i.onload=()=>resolve(i);
   i.onerror=()=>reject(Error('Glove V1 PNG did not load'));i.src=sheet;
  });
  if(img.naturalWidth!==128||img.naturalHeight!==160)throw Error('Glove sheet expected 128x160');
  const out={};
  for(let i=0;i<2;i++){
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=160;
   const ctx=canvas.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=false;
   ctx.drawImage(img,i*64,0,64,160,0,0,64,160);
   out[names[i]]=canvas.toDataURL('image/png');
  }
  return Object.freeze(out);
 }
 root.DungeonTravelerGlovesWorkbenchV1=Object.freeze({
  version:'brown-leather-gold-buckle-front-gloves-v1-20261124',
  canvas:Object.freeze({width:64,height:160}),
  layers:Object.freeze(['front']),
  build
 });
})(window);
