/* Front-only brown leather gloves V1 for 《迷宮盡頭的燈火》.
 * Cropped from the user's two newly generated transparent pixel art pairs,
 * then pixel-nearest fitted as male / female 64x160 full-canvas sprites.
 * Accepted into official game on 2026-11-24, sharing the same artwork.
 * Rendered only when the existing hands slot is worn; saves unchanged.
 * Male pair: 11x17 per glove at native Y81; female: 10x15 at Y83.
 */
(function(root){
 'use strict';
 const sheet='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACgCAMAAADzTJTPAAAASFBMVEUAAAATCwkpGBJEKBxkPClRLyFeNiU5IRd3Ti8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjdg+XAAAAGHRSTlMA//////////8AAAAAAAAAAAAAAAAAAAA3pfCuAAABh0lEQVR42u3Wy3LsIAxF0dYT/v+Lr+RUJsZdcJMMUpW9hrRsH0DG/XoBAAAAAAAAAAAAAAAAAAD8FtJ+vPScRqS76fbGopaZEfrDAYap6rBxECBGlZp+dWHelNXELA6eX5UWYQ9LJWNYkd3Vbb1a3aXmpQcBtAtlxn3cfNYUtgFGxZ9p6wL03tpJgKtQKsU9mM6a224Ne6V1qr7ZgqMmjOfCitTNsV3A7rWHmGrhnnHQhCO7cGnCGr9eo20AS89cn9Pj7rFuzrLVGY8BtF7j6bZLUC08+3pdx68Akbs9rBq/Esg9mM8K4Lvr07pumajExwTG/gYaPjMt5N4aPQHdXu/aM132oHqwlr8C7N9jrTK3e7dIZR8esg8g4eoaS4DUKW6vfRPWYldh3k+zfrbXCbmfwJi9DA8/uOxb8Dq1Q3M9cFQ619H1lVTGw/s56ltwdIPRL/x6DmQds2efHXls9esoPvpwvjmya/ToI/1win7+cPzf4b+Gv1EIAAAAAAAAAAAAAMCf8A+OSwZYZQ0LyQAAAABJRU5ErkJggg==';
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
