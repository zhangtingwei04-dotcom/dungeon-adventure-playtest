/* Shared eye motion V2.2: one animation controller with independently
 * approved male and female 64x160 eye art and eyelid profiles. */
(function(root){
 'use strict';
 const W=64,H=160;
 // Native head anchors currently match; each character's eye pixels and
 // blink-line style stay independent and can be adjusted without a fork.
 const PROFILES=Object.freeze({
  female:Object.freeze({eyes:[{cx:25,x0:20},{cx:39,x0:34}],lidHalfWidth:3,lidColor:[76,44,53,255],top:32,boxH:10,irisTop:34,irisBottom:39,clearTop:34,clearBottom:39,lidClosedY:36,lidHalfY:37,skinY:42}),
  male:Object.freeze({eyes:[{cx:25,x0:20},{cx:39,x0:34}],lidHalfWidth:2,lidColor:[64,43,50,255],top:34,boxH:10,irisTop:38,irisBottom:41,clearTop:36,clearBottom:42,lidClosedY:38,lidHalfY:39,skinY:44})
 });
 const boxW=11;
 let imagePixels=null,pending=false,failed=false;
 let malePixels=null,malePending=false;
 // Male and female facial pixels have independent sources. Never import
 // the female eye appearance or skin color into a male eyelid patch.
 const src=()=>root.DUNGEON_FEMALE_FACE_V2||root.DUNGEON_FEMALE_HEAD_V1;
 const colorHex=hex=>/^#[0-9a-f]{6}$/i.test(hex||'')?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)):null;
 const isIris=(r,g,b)=>(b>=g+14&&r>=g+12&&r<=206&&b>=65);
 function prepare(){
  if(imagePixels||pending||failed)return;
  const uri=src();
  if(!uri||!uri.startsWith('data:image/png;base64,')){failed=true;return;}
  pending=true;const img=new Image();
  img.onload=()=>{
   try{
    if(img.width!==W||img.height!==H)throw Error('Female face must be 64x160');
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0);imagePixels=ctx.getImageData(0,0,W,H).data;
    root.dispatchEvent(new Event('dungeon-female-eyes-ready'));
   }catch(e){failed=true;console.warn('Female eye atlas:',e)}
   pending=false;
  };
  img.onerror=()=>{failed=true;pending=false};img.src=uri;
 }
 function prepareMale(){
  if(malePixels||malePending)return;
  const uri=root.DUNGEON_MALE_SHARED_FACE_V5;
  if(typeof uri!=='string'||!uri.startsWith('data:image/png;base64,'))return;
  malePending=true;const img=new Image();
  img.onload=()=>{
   try{
    if(img.width!==W||img.height!==H)throw Error('Male shared face must be 64x160');
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    malePixels=ctx.getImageData(0,0,W,H).data;
    root.dispatchEvent(new Event('dungeon-female-eyes-ready'));
   }catch(err){console.warn('Male shared eye source:',err)}
   malePending=false;
  };
  img.onerror=()=>{malePending=false};img.src=uri;
 }
 const sample=(px,x,y)=>Array.from(px.slice((y*W+x)*4,(y*W+x)*4+4));
 const pix=(px,x,y,c)=>{if(x<0||x>=W||y<0||y>=H)return;const i=(y*W+x)*4;for(let k=0;k<4;k++)px[i+k]=c[k];};
 const gaze=t=>{
  const phase=((Number(t)||0)%12600+12600)%12600;
  if(phase>=3100&&phase<4600)return 'left';
  if(phase>=6100&&phase<7600)return 'right';
  if(phase>=9500&&phase<10400)return 'down';
  return 'center';
 };
 function patch(type,irisColor,sourcePixels,profile){
  const out=new Uint8ClampedArray(sourcePixels);
  for(const {cx} of profile.eyes){
   if(type==='closed'||type==='half'){
    const upper=type==='closed'?profile.clearTop:profile.lidHalfY;
    for(let y=upper;y<=profile.clearBottom;y++)for(let x=cx-4;x<=cx+4;x++){
     const skin=sample(sourcePixels,x,profile.skinY);
     pix(out,x,y,skin[3]>100?skin:[252,226,209,255]);
    }
    const yy=type==='closed'?profile.lidClosedY:profile.lidHalfY;
    for(let x=cx-profile.lidHalfWidth;x<=cx+profile.lidHalfWidth;x++)
     pix(out,x,yy,profile.lidColor);
    continue;
   }
   const moving=type!=='center';
   const dx=type==='left'?-1:type==='right'?1:0;
   const dy=type==='up'?-1:type==='down'?1:0;
   const moved=[];
   for(let y=profile.irisTop;y<=profile.irisBottom;y++)for(let x=cx-3;x<=cx+3;x++){
    const p=sample(sourcePixels,x,y);
    if(!isIris(p[0],p[1],p[2])||p[3]<80)continue;
    const tint=irisColor?[...irisColor,255]:p;
    if(irisColor){
     const shade=Math.max(.4,Math.min(1,(p[0]+p[1]+p[2])/360));
     for(let k=0;k<3;k++)tint[k]=Math.round(irisColor[k]*shade);
    }
    moved.push([x+dx,y+dy,tint]);
    if(moving)pix(out,x,y,sample(sourcePixels,x,profile.skinY));
   }
   for(const [x,y,v] of moved)if(x>=cx-4&&x<=cx+4&&y>=profile.irisTop&&y<=profile.irisBottom+1)pix(out,x,y,v);
  }
  return new ImageData(out,W,H);
 }
 function render(stage,opt={}){
  if(!stage||!(stage.classList.contains('paperdoll-female')||
    stage.classList.contains('paperdoll-shared-male-face')))return;
  const cv=stage.querySelector('.paperdoll-female-eye-motion-canvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
  const isSharedMale=stage.classList.contains('paperdoll-shared-male-face');
  const profile=isSharedMale?PROFILES.male:PROFILES.female;
  let sourcePixels=isSharedMale?malePixels:imagePixels;
  if(!sourcePixels){if(isSharedMale)prepareMale();else prepare();return;}
  // A blink must sample the tinted skin, not expose the original face color.
  if(stage.classList.contains('skin-tinted')){
   const skinCtx=stage.querySelector('.paperdoll-skin-canvas')?.getContext('2d',{willReadFrequently:true});
   if(skinCtx)sourcePixels=skinCtx.getImageData(0,0,W,H).data;
  }
  const type=opt.closed||opt.blink?'closed':opt.half?'half':(['left','right','up','down'].includes(opt.gaze)?opt.gaze:'center');
  const rgb=opt.eyeColor==='purple'||!opt.eyeColor?null:colorHex(opt.eyeColor);
  if(type==='center'&&!rgb)return; // face's original purple pupils, no needless overwrite
  const painted=patch(type,rgb,sourcePixels,profile);
  for(const eye of profile.eyes)ctx.putImageData(painted,0,0,eye.x0,profile.top,boxW,profile.boxH);
 }
 root.DungeonFemaleEyeMotionV1=Object.freeze({version:'2.3.0',render,gaze,prepare});
 prepare();
})(window);
