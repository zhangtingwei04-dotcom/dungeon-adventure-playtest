/* Male V5 face: exact female face pixels, recolored to original male warm skin.
   Keep the female eye/mouth silhouettes and 64x160 origin intact.
   Skin-color transfer only; dark outlines and purple irises untouched.
   The result is cached as a PNG data URL, never written into player saves. */
(function(root){
 'use strict';
 const uri=root.DUNGEON_FEMALE_FACE_V2;
 if(typeof uri!=='string'||!uri.startsWith('data:image/png;base64,'))return;
 const image=new Image();
 image.onload=()=>{
  try{
   if(image.naturalWidth!==64||image.naturalHeight!==160)throw Error('Expected 64x160 head');
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=160;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   if(!ctx)throw Error('Canvas unavailable');
   ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
   const pixels=ctx.getImageData(0,0,64,160),d=pixels.data;
   for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
    if(!a||!(r>g+8&&g>b+2&&r>115&&r-g<105&&g-b<75))continue;
    const shade=Math.min(1,Math.max(0,(r-85)/150));
    d[i+1]=Math.max(0,Math.round(g-14*shade));
    d[i+2]=Math.max(0,Math.round(b-31*shade));
   }
   ctx.putImageData(pixels,0,0);
   root.DUNGEON_MALE_SHARED_FACE_V5=canvas.toDataURL('image/png');
   root.dispatchEvent(new Event('dungeon-male-face-ready'));
  }catch(err){console.warn('Could not prepare male shared female face',err)}
 };
 image.onerror=()=>console.warn('Female face source did not load for male swap');
 image.src=uri;
})(window);
