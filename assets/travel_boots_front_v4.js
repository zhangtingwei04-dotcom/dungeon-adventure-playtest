/* 《迷宮盡頭的燈火》 — V4 smaller front-only leather boots.
 * Revision: rear boot opening removed, overall width/height reduced vs V3.
 * One 64x160 RGBA-transparent paired boot sprite for male and female each;
 * original model, pants, cloak and satchel remain untouched. DEV ONLY.
 */
(function(root){
 'use strict';
 const sheet='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACgCAMAAADzTJTPAAAAeFBMVEVVMSoYEA5HKiI6Ix55UkE0HRpdQTSIUD96SDi3gGLKkW8AAABKKiNYMypmOi8sGRd2RTc6Ih2MV0WDTDyXY00UCwtBJB6sdFoWCwwdEREUCwwUCwwlFRM9JSEqGRYoGBWibFTFjWwbERArGRe1fWAcEQ89Ix04Ih6+Lg8MAAAAKHRSTlNhVaKm/8P//3D//wD///////////////+P/3etr/9zk///rVr/m1dvzVsXZAAABBlJREFUeNrtl1tz2zgMhZM2vewKIACKkqzYju3m9v//4R5otqnoOPTLdrYPUB86A1riR+DggLnp/ufnJgACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAD+MABm1tz3OSfmOq45aykI0+8EYGVOiazXxMTyM2yJnMAoASDRbwTQnJIWkSdkIE1vO1HBvnkSKZpSz63v4Qcld36AKlVEONikWvBfC2BHqpOapanvE21+hjekvU7JCGVQ2zX2R4pST5IVOUtvGexElTjnwbKyaksDs4iORGNmkflXWEQ4I06pCl9IQC7am/TIY9LPb+GDx3MWKrn0qQUg2ByVxoZCsgqPHkFW8UgL4EAKdqLcq3xaxTcCbeNlzvrltgWwRQ2QPiJbVaDrBuLl/FgcfzQ1tRUyIiRS7HG9DYkZvgL+TdsHZkKRUjKrTypLYlS5nQAcFY2MRjFjeliFX/GiCxH/dm0AMaEEAZrUACBawnYFoBsVCgTCGSmAXJ/f1B66dgkSHh698TfVuVAEtJCmcdsGGEYvFI9nqT6gtXp0J81XrFj4X7dhuf8VvUf+0uJRfCUD965iTxVZJTYXIPc4BLcz0H11DSOB7zRgew8L87USJFcxHHXdBN2DcVIUETbSzoAwGh4qcMmscvgMTeCjcsdyTYXQCpKoZHW37NzHPS5NgC0XuyMMI7ecqgQ4fUEnK1y5LYKsExv2kecq/CyGl9NfOV/JgEme4RZQIlF1LAjwyHM2s+b+PyA/2B5KOJ+l1qgUhbi2V0S4qE0kVVMPMXUnvC7CneWvQ1qm6VptN95BmiQVa/vAnGDZEDEysZ5me3YjINwTNM1tAjdsuA5q9loDiDHz+wPUABvTPE2YWO6ZZ20IEeo0ZbVNG8ANix3hprZiKDthGLYBPMsuVvfzdRcclumQXAnrKXvpgZP32afJ57NBj1ezD5pmCZCA4+R+5UayXnjxCsDKpmPWpgp9muXsc7Pyge4Tsu8AObWG0UB6PJ0mKMjmff27B3ErmU6no9rQANjjV4uTnjU8aqi0eJQ1ANCrPgsZrXR+87tRX/RhQNaQoWiZoFQkwHT96e9wMKD1+amoNABQp+UuQnv+Un/50afZssb8cQ0ekz79PX2DWqS2YnTB6ADT6alPLx8DcMZlCLNc323yQt7Gfi3ShhWgd31i+b1pqET4SoPrmpZF+RBgIzg6soDhvW7C5Ww4+9LIe270oeDynEsp4Bjqm9dmwJt+MSzcAFhun3jmS2ec5XZZkqYLYYec75iGCwaxrJ1bwX/8p9lhHpbncHFOLEsit/HHaQAEQAAEQAAEQAD8UQD/AK1XiD7w7mRkAAAAAElFTkSuQmCC';
 const names=Object.freeze(['maleTravelerBootFront','femaleTravelerBootFront']);
 async function build(){
  const img=await new Promise((resolve,reject)=>{
   const i=new Image();
   i.onload=()=>resolve(i);
   i.onerror=()=>reject(Error('Boot V4 source PNG failed to decode'));
   i.src=sheet;
  });
  if(img.naturalWidth!==128||img.naturalHeight!==160)
   throw Error('Boot V4 expected two 64x160 front frames');
  const sprites={};
  for(let i=0;i<2;i++){
   const c=document.createElement('canvas');c.width=64;c.height=160;
   const ctx=c.getContext('2d',{alpha:true});
   ctx.imageSmoothingEnabled=false;
   ctx.drawImage(img,i*64,0,64,160,0,0,64,160);
   sprites[names[i]]=c.toDataURL('image/png');
  }
  return Object.freeze(sprites);
 }
 root.DungeonTravelBootsWorkbenchV4=Object.freeze({
  version:'reduced-front-only-v4-20261124',
  canvas:Object.freeze({width:64,height:160}),
  layers:Object.freeze(['front']),
  build
 });
})(window);
