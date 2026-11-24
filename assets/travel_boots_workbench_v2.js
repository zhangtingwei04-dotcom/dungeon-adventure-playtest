/* 《迷宮盡頭的燈火》 — faithful leather boots V2, preview only.
 * Exact native 64x160 frames already fitted: male left/right, female left/right.
 * Real transparent pixel atlas. NO procedural rectangle boots, NO body painting.
 * This pixel source follows the user-approved brown folded-cuff, brass-buckle
 * and chunky-sole design instead of V1's simplified shapes.
 */
(function(root){
 'use strict';
 const DATA='data:image/png;base64,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';
 const names=Object.freeze(['maleTravelerBootLeft','maleTravelerBootRight',
  'femaleTravelerBootLeft','femaleTravelerBootRight']);
 async function build(){
  const src=await new Promise((resolve,reject)=>{
   const img=new Image();img.onload=()=>resolve(img);
   img.onerror=()=>reject(Error('V2 boots pixel atlas decode failed'));img.src=DATA;
  });
  if(src.naturalWidth!==256||src.naturalHeight!==160)
   throw Error('V2 boots atlas expected 256x160');
  const out={};
  for(let i=0;i<names.length;i++){
   const c=document.createElement('canvas');c.width=64;c.height=160;
   const ctx=c.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=false;
   ctx.drawImage(src,i*64,0,64,160,0,0,64,160);
   out[names[i]]=c.toDataURL('image/png');
  }
  return Object.freeze(out);
 }
 root.DungeonTravelBootsWorkbenchV2=Object.freeze({
  version:'original-art-pixel-atlas-64x160-v2',
  canvas:Object.freeze({width:64,height:160}),
  independentLayers:4,
  sourceAtlasSha256:'05fa5c6d907c13cb8ada9f691e272ade023927de6f163cdf2a35f394af7dc601',
  build
 });
})(window);
