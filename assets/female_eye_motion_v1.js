/* Female paper doll eye motion V1.
 * The approved head art is never redrawn/replaced in the repository.
 * Only the two 64x160 pixel eye patches change during a blink or a gaze.
 * The original eyes remain perfectly untouched when looking forward.
 */
(function(root){
 'use strict';
 const W=64,H=160;
 const EYES=[{cx:25, x0:20, width:11},{cx:38, x0:34, width:11}];
 const EYE_TOP=39,EYE_HEIGHT=9;
 const SKIN=[252,214,180,255],WHITE=[250,238,232,255];
 let frames=null,waiting=false,failed=false;
 const pixel=(data,x,y,color)=>{
  if(x<0||x>=W||y<0||y>=H)return;
  const p=(y*W+x)*4;
  for(let j=0;j<4;j++)data[p+j]=color[j];
 };
 const get=(data,x,y)=>Array.from(data.slice((y*W+x)*4,(y*W+x)*4+4));
 function buildFrame(original,mode){
  const target=new Uint8ClampedArray(original);
  const paint=(x,y,c)=>pixel(target,x,y,c);
  for(const eye of EYES){
   const cx=eye.cx;
   if(mode==='closed'||mode==='half'){
    const start=mode==='half'?43:40;
    for(let y=start;y<=46;y++){
     for(let x=cx-4;x<=cx+3;x++){
      // Preserve a little natural shading at the outside of the eyelids.
      const base=(x===cx-4||x===cx+3)?get(original,x,48):SKIN;
      paint(x,y,base);
     }
    }
    const lineY=mode==='half'?43:44;
    for(let x=cx-3;x<=cx+2;x++)paint(x,lineY,[70,39,50,255]);
    for(let x=cx-2;x<=cx+1;x++)paint(x,lineY+1,[219,156,139,255]);
    continue;
   }
   const dx=mode==='left'?-1:mode==='right'?1:0;
   const dy=mode==='up'?-1:mode==='down'?1:0;
   // Remove the former pupil/iris before placing its ORIGINAL pixels
   // one pixel away. Without this there would be a doubled pupil.
   for(let y=42;y<=46;y++)
    for(let x=cx-2;x<=cx+2;x++)
     paint(x,y,y===46?SKIN:WHITE);
   for(let y=42;y<=45;y++){
    for(let x=cx-1;x<=cx+2;x++){
     const yy=y+dy,xx=x+dx;
     if(xx>=cx-2&&xx<=cx+2&&yy>=42&&yy<=46)
      paint(xx,yy,get(original,x,y));
    }
   }
  }
  return new ImageData(target,W,H);
 }
 function prepare(){
  if(waiting||frames||failed)return;
  const src=root.DUNGEON_FEMALE_HEAD_V1;
  if(typeof src!=='string'||!src.startsWith('data:image/png;base64,')){failed=true;return;}
  waiting=true;
  const img=new Image();
  img.onload=()=>{
   try{
    if(img.naturalWidth!==W||img.naturalHeight!==H)throw Error('Eye motion source dimensions differ');
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0);
    const original=ctx.getImageData(0,0,W,H).data;
    frames={};
    for(const name of ['left','right','up','down','half','closed'])
     frames[name]=buildFrame(original,name);
    root.dispatchEvent(new Event('dungeon-female-eyes-ready'));
   }catch(err){console.warn('Female eye motion unavailable:',err);failed=true;}
   waiting=false;
  };
  img.onerror=()=>{failed=true;waiting=false;};
  img.src=src;
 }
 function gaze(time){
  // Quiet, repeatable motions: long forward looks, brief side glances,
  // a small downward look, then back to center. No rapid darting.
  const t=((time%12600)+12600)%12600;
  if(t>=3100&&t<4600)return 'left';
  if(t>=6100&&t<7600)return 'right';
  if(t>=9500&&t<10400)return 'down';
  return 'center';
 }
 function render(stage,opts={}){
  if(!stage||!stage.classList.contains('paperdoll-female'))return;
  const canvas=stage.querySelector('.paperdoll-female-eye-motion-canvas');
  if(!canvas)return;
  if(!frames){prepare();return;}
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
  const type=opts.closed?'closed':opts.blink?'closed':opts.half?'half':
   (['left','right','up','down'].includes(opts.gaze)?opts.gaze:'center');
  if(type==='center')return; // perfect original, no extra pixels
  const data=frames[type];
  for(const eye of EYES)
   ctx.putImageData(data,0,0,eye.x0,EYE_TOP,eye.width,EYE_HEIGHT);
 }
 root.DungeonFemaleEyeMotionV1=Object.freeze({render,gaze,prepare});
 prepare();
})(window);
