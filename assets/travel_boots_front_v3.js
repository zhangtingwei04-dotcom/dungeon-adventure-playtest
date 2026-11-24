/* Original pixel leather boots, front-only V3 trial.
 * Two 64x160 transparent PNGs, one paired front view for each gender.
 * Back heel extensions trimmed and old side layer retired.
 * Existing pants, base models, V13 shirt, cloak, and satchel unchanged.
 */
(function(root){
 'use strict';
 const sheet='data:image/png;base64,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';
 const names=Object.freeze(['maleTravelerBootFront','femaleTravelerBootFront']);
 async function build(){
  const img=await new Promise((resolve,reject)=>{
   const i=new Image();
   i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Boot V3 image decode failed'));
   i.src=sheet;
  });
  if(img.naturalWidth!==128||img.naturalHeight!==160)throw Error('Expected 128x160 front-only atlas');
  const sprites={};
  for(let i=0;i<2;i++){
   const c=document.createElement('canvas');c.width=64;c.height=160;
   const ctx=c.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=false;
   ctx.drawImage(img,i*64,0,64,160,0,0,64,160);
   sprites[names[i]]=c.toDataURL('image/png');
  }
  return Object.freeze(sprites);
 }
 root.DungeonTravelBootsWorkbenchV3=Object.freeze({
  version:'front-only-v3-20261124',
  canvas:Object.freeze({width:64,height:160}),
  layers:Object.freeze(['front']),
  sourceSha256:'c927347b96eb88c5d4d0bcad413ca4152e137ba4bc66a1b9ed2e2df33d6111bb',
  build
 });
})(window);
