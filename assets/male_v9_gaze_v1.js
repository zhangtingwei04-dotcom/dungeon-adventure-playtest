/* V9 candidate head: native 64x160 eye-gaze frames.
 * Uses ONLY the approved V9 face PNG (same base eyes); never touches production V8,
 * female art, eye shape, brow, hair, jaw, clothing or player saves.
 * Horizontal glance shifts original violet/blue iris pixels by one native pixel.
 * Vertical glance shifts original iris highlights inside the original eye rims,
 * avoiding painting over the lash at y36 or the cheek below y40.
 */
(function(root){
 'use strict';
 const W=64,H=160,DIRS=['center','left','right','up','down'];
 const EYES=Object.freeze([{cx:25,x0:21,x1:29},{cx:39,x0:35,x1:43}]);
 const isIris=(r,g,b,a)=>a>=128&&b>=r+12&&b>=g+10&&b>=45;
 const isSclera=(r,g,b,a)=>a>=180&&r>=170&&g>=160&&b>=170&&Math.abs(r-g)<55&&Math.abs(b-g)<65;
 function gazeAt(time){
  const t=((Number(time)||0)%12600+12600)%12600;
  if(t>=3100&&t<4600)return 'left';
  if(t>=6100&&t<7600)return 'right';
  if(t>=9500&&t<10400)return 'down';
  if(t>=11000&&t<11700)return 'up';
  return 'center';
 }
 function create(faceImage){
  if(!faceImage||faceImage.naturalWidth!==W||faceImage.naturalHeight!==H)throw Error('V9 eye gaze expects approved 64x160 face');
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;
  const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(faceImage,0,0);
  const original=c.getImageData(0,0,W,H).data;
  const offset=(x,y)=>(y*W+x)*4;
  const read=(data,x,y)=>{
   const o=offset(x,y);return [data[o],data[o+1],data[o+2],data[o+3]];
  };
  const write=(data,x,y,p)=>{
   const o=offset(x,y);for(let k=0;k<4;k++)data[o+k]=p[k];
  };
  const eyePixels=EYES.map(eye=>{
   const mask=[];
   for(let y=37;y<=40;y++)for(let x=eye.x0;x<=eye.x1;x++){
    const p=read(original,x,y);
    if(isIris(...p))mask.push({x,y,p});
   }
   return {eye,mask};
  });
  if(eyePixels.some(v=>v.mask.length<5))throw Error('V9 eye iris pixels not found');
  const sclera=(eye,x,y)=>{
   const options=[];
   for(let xx=eye.x0;xx<=eye.x1;xx++){
    const p=read(original,xx,y);
    if(isSclera(...p))options.push({distance:Math.abs(x-xx),p});
   }
   options.sort((a,b)=>a.distance-b.distance);
   return options.length?options[0].p:[235,218,216,255];
  };
  const frames={};
  for(const dir of DIRS.slice(1)){
   const data=new Uint8ClampedArray(original);
   for(const {eye,mask} of eyePixels){
    if(dir==='left'||dir==='right'){
     const dx=dir==='left'?-1:1;
     // Replace only original iris pixels with real nearby eye-white pixels.
     for(const {x,y} of mask)write(data,x,y,sclera(eye,x,y));
     // Restore the original purple/blue iris at an offset, with black lash
     // and skin preserved. No enlarged or independently generated pupils.
     for(const {x,y,p} of mask){
      const xx=x+dx;
      if(xx<eye.x0||xx>eye.x1)continue;
      const target=read(original,xx,y);
      if(isIris(...target)||isSclera(...target))write(data,xx,y,p);
     }
    }else{
     // Four pixel rows of real eye art leave no spare space above/below.
     // Translate its blue focus highlights by one row inside the iris, but
     // preserve the original pupil rim so the eye does not become half-closed.
     const fromY=dir==='up'?40:39,toY=dir==='up'?39:40;
     const focus=mask.filter(v=>v.y===fromY&&v.p[2]>=120&&
       (v.p[1]>=55||v.p[0]>=75));
     for(const {x,y,p} of focus){
      let dark=read(original,x,38);
      if(!isIris(...dark))dark=[67,53,131,255];
      write(data,x,y,dark);
     }
     for(const {x,p} of focus)write(data,x,toY,p);
    }
   }
   frames[dir]=new ImageData(data,W,H);
  }
  function paint(ctx,dir){
   if(!ctx||dir==='center'||!frames[dir])return;
   // Only this 25x4 window is replaced, with no head or brow movement.
   ctx.putImageData(frames[dir],0,0,20,37,25,4);
  }
  return Object.freeze({paint,eyeCenters:[[25,39],[39,39]],irisPixelCounts:eyePixels.map(x=>x.mask.length)});
 }
 root.DungeonMaleV9Gaze=Object.freeze({version:'1.0.0',directions:DIRS,gazeAt,create});
})(window);
