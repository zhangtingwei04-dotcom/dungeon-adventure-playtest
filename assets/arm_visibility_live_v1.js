/* 《迷宮盡頭的燈火》 — Live paper-doll arm visibility adapter V1.
 * Promotes the workbench's DungeonArmVisibilityPolicyV1, without changing art,
 * equipment IDs, save formats or the approved paper-doll fit.
 * The policy cuts alpha from the CLOAK FRONT and bag POUCH, rather than
 * repainting rectangles of bare arm/shorts/tank above worn sleeves.
 * Works with real native 64x160 sprites and 4/6-column garment atlases.
 * Every run is tied to a single connected DOM stage. Async image decoding
 * leaves original art intact until BOTH masked layers are ready.
 */
(function(root){
 'use strict';
 const W=64,H=160,cache=new Map();
 const paintLayer=(ctx,image,t)=>{
  if(!image)return;
  const scale=Number(t?.scale)||1;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,32-W*scale/2+(Number(t?.x)||0),
   80-H*scale/2+(Number(t?.y)||0),W*scale,H*scale);
 };
 function makeCanvas(){
  const c=document.createElement('canvas');c.width=W;c.height=H;
  return c;
 }
 function load(src){
  if(typeof src!=='string'||!src.startsWith('data:image/png;base64,'))return Promise.reject(Error('PNG source unavailable'));
  if(cache.has(src))return cache.get(src);
  const task=new Promise((resolve,reject)=>{
   const image=new Image();
   image.onload=()=>resolve(image);
   image.onerror=()=>reject(Error('Could not decode arm-visible source'));
   image.src=src;
  });
  cache.set(src,task);
  return task;
 }
 function frameOf(image,frames,index){
  if(!Number.isInteger(index)||index<0||index>=frames||image.naturalWidth!==W*frames||image.naturalHeight!==H)
   throw Error('Invalid garment frame or atlas dimensions');
  const out=makeCanvas();
  const c=out.getContext('2d');c.imageSmoothingEnabled=false;
  c.drawImage(image,index*W,0,W,H,0,0,W,H);
  return out;
 }
 function lowerPouch(image){
  if(image.naturalWidth!==W||image.naturalHeight!==H)throw Error('Invalid satchel size');
  const out=makeCanvas(),ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;
  // Original approved satchel. Only pixels from native Y97 onward are
  // present here, matching the game and workbench split.
  ctx.drawImage(image,0,97,W,H-97,0,97,W,H-97);
  return out;
 }
 function hiddenFronts(stage){
  const front=stage.querySelector('.paperdoll-cloak-trial-front');
  const pouch=stage.querySelector('.paperdoll-bag-lower');
  return {front,pouch};
 }
 function overlayAfter(el,kind){
  const c=makeCanvas();
  c.className='paperdoll-arm-policy-'+kind;
  c.setAttribute('aria-hidden','true');
  c.style.position='absolute';c.style.inset='0';
  c.style.width='100%';c.style.height='100%';
  c.style.pointerEvents='none';
  c.style.imageRendering='pixelated';
  c.style.transform='translateY(9px)';
  el.insertAdjacentElement('afterend',c);
  return c;
 }
 function hideLegacyHandOverlays(stage){
  for(const el of stage.querySelectorAll(
   '.paperdoll-original-arm-left,.paperdoll-original-arm-right,'+
   '.paperdoll-original-shorts-left,.paperdoll-original-shorts-right,'+
   '.paperdoll-original-tank-left,.paperdoll-original-tank-right,'+
   '.paperdoll-original-arms-tinted'))el.style.visibility='hidden';
 }
 async function apply(stage,options){
  if(!stage||!stage.isConnected)return false;
  const policy=root.DungeonArmVisibilityPolicyV1;
  if(typeof policy?.paintCloakFront!=='function')return false;
  const {front,pouch}=hiddenFronts(stage);
  if(!front&&!pouch)return false;
  const request=Symbol('arm-mask-request');
  stage.__armPolicyRequest=request;
  try{
   const descriptors=Array.isArray(options?.garments)?options.garments:[];
   const loadJobs=[load(options.bodySrc)];
   if(front)loadJobs.push(load(options.cloakSrc));
   if(pouch)loadJobs.push(load(options.bagSrc));
   for(const d of descriptors)loadJobs.push(load(d.src));
   const images=await Promise.all(loadJobs);
   if(!stage.isConnected||stage.__armPolicyRequest!==request)return false;
   let at=0;const body=images[at++];
   if(body.naturalWidth!==W||body.naturalHeight!==H)throw Error('Invalid native body size');
   const cloakImg=front?images[at++]:null;
   const pouchImg=pouch?images[at++]:null;
   const garments=descriptors.map(d=>({
    image:frameOf(images[at++],d.frames,d.frame),
    transform:{x:d.x||0,y:d.y||0,scale:d.scale||1}
   }));
   const prepared=[];
   const drawPolicy=(target,image,t)=>{
    const ctx=target.getContext('2d',{willReadFrequently:true});
    if(!policy.paintCloakFront({
     ctx,outerImage:image,outerTransform:t,paintLayer,
     bodyImage:body,garmentLayers:garments,edgeGuardPx:0
    }))throw Error('Arm masking failed');
   };
   if(front){
    if(cloakImg.naturalWidth!==W||cloakImg.naturalHeight!==H)throw Error('Invalid cloak front');
    const mask=makeCanvas();
    // Workbench front offset Y=-6. Game's shared native BODY +9px is
    // provided by overlayAfter CSS; never resize/modify the original PNG.
    drawPolicy(mask,cloakImg,{x:0,y:-6,scale:1});
    prepared.push([front,mask,'cloak']);
   }
   if(pouch){
    // Bag source is anchored at -2 CSS px; game native BODY is +9 px.
    // Hence approved bag Y=-11 in the BODY's 64x160 local coordinates.
    const mask=makeCanvas();
    drawPolicy(mask,lowerPouch(pouchImg),{x:0,y:-11,scale:1});
    prepared.push([pouch,mask,'pouch']);
   }
   if(!stage.isConnected||stage.__armPolicyRequest!==request)return false;
   for(const [original,mask,kind] of prepared){
    const overlay=overlayAfter(original,kind);
    const ctx=overlay.getContext('2d');ctx.imageSmoothingEnabled=false;
    ctx.drawImage(mask,0,0);
    original.style.visibility='hidden';
   }
   // IMPORTANT: the old overlay repainted naked body/shorts/tank in front
   // of real sleeves and created leg-colored strips. Both cloak/pouch alpha
   // are now open wherever the REAL underlayer is visible; no skin repaint.
   hideLegacyHandOverlays(stage);
   stage.dataset.armPolicy='v1';
   return true;
  }catch(err){
   // Preserve unmodified cloak, pouch, and old overlays if any decode fails.
   console.warn('Keeping original paper doll cloak layer:',err);
   return false;
  }
 }
 root.DungeonLiveArmVisibilityV1=Object.freeze({
  version:'live-garment-aware-arm-mask-v1',
  nativeCanvas:Object.freeze({width:W,height:H}),
  apply
 });
})(window);
