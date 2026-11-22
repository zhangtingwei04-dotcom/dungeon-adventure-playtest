/* Male V9 production adapter: approved 64x160 head and separate hair.
 * Original V8 remains loadable via ?male-head=v8; all other body/save art stays.
 */
(function(root){
 'use strict';
 const fallback=new URLSearchParams(root.location.search).get('male-head')==='v8';
 const asset=root.DUNGEON_MALE_V9_TEST;
 if(fallback||!asset?.face?.startsWith('data:image/png;base64,')||!asset?.hair?.startsWith('data:image/png;base64,')){
  root.DungeonMaleV9Equipment=Object.freeze({active:false,ready:false,reason:fallback?'rollback':'missing-asset'});
  return;
 }
 const W=64,H=160,eyeCenters=[25,39];
 const skinTones=Object.freeze({fair:[252,218,187],warm:[242,188,145],tan:[207,144,102],deep:[156,99,72]});
 // Only replace the male face and hair. Retain original 64x160 anchor.
 root.DUNGEON_MALE_SHARED_FACE_V5=asset.face;
 root.DUNGEON_MALE_HAIR_V8=asset.hair;
 root.DUNGEON_MALE_FACE_VERSION='v9-original-template';
 let original=null,painter=null,loaded=false;
 const work=document.createElement('canvas');work.width=W;work.height=H;
 const ctx=work.getContext('2d',{willReadFrequently:true});
 const ix=(x,y)=>4*(y*W+x),clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
 const iris=(r,g,b,a)=>a>=128&&b>=r+12&&b>=g+10&&b>=45;
 const skin=(r,g,b,a)=>a>0&&r>=86&&r>g+12&&g>b+10;
 const get=(d,x,y)=>{const i=ix(x,y);return [d[i],d[i+1],d[i+2],d[i+3]]};
 function tintSkin(d,tone,y0=0,y1=H-1){
  const target=skinTones[tone];if(!target)return;
  for(let y=y0;y<=y1;y++)for(let x=0;x<W;x++){
   const i=ix(x,y),r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
   if(!skin(r,g,b,a))continue;
   const n=Math.max(.43,Math.min(1.22,(r*.36+g*.43+b*.21)/205));
   for(let k=0;k<3;k++)d[i+k]=clamp(target[k]*n);
  }
 }
 function resetBase(tone){
  const d=new Uint8ClampedArray(original);tintSkin(d,tone);
  ctx.putImageData(new ImageData(d,W,H),0,0);
 }
 function skinAt(x,y,tone){
  const p=get(original,Math.max(0,Math.min(63,x)),Math.max(0,Math.min(159,y)));
  const target=skinTones[tone];
  if(target&&skin(...p)){
   const n=Math.max(.43,Math.min(1.22,(p[0]*.36+p[1]*.43+p[2]*.21)/205));
   for(let k=0;k<3;k++)p[k]=clamp(target[k]*n);
  }
  return 'rgba('+p[0]+','+p[1]+','+p[2]+','+(p[3]/255)+')';
 }
 function fillSkin(x,y,referenceY,tone){ctx.fillStyle=skinAt(x,referenceY,tone);ctx.fillRect(x,y,1,1)}
 function replaceEyes(blank,tone){
  for(const cx of eyeCenters)for(let y=36;y<=41;y++)for(let x=cx-5;x<=cx+5;x++)fillSkin(x,y,43,tone);
  if(blank)return;
  ctx.fillStyle='#3c2725';
  for(const cx of eyeCenters){ctx.fillRect(cx-3,38,7,1);ctx.fillRect(cx-2,39,5,1)}
 }
 function brows(pose,tone){
  if(!['angry','surprised','shy'].includes(pose))return;
  for(const cx of eyeCenters)for(let y=31;y<=35;y++)for(let x=cx-5;x<=cx+5;x++)fillSkin(x,y,29,tone);
  ctx.fillStyle='#674039';
  if(pose==='surprised')for(const cx of eyeCenters){ctx.fillRect(cx-4,32,7,1);ctx.fillRect(cx-3,31,5,1)}
  else if(pose==='angry'){
   ctx.fillRect(21,33,5,1);ctx.fillRect(24,34,5,1);
   ctx.fillRect(35,34,5,1);ctx.fillRect(38,33,5,1);
  }else for(const cx of eyeCenters)ctx.fillRect(cx-3,34,6,1);
 }
 function tintIris(hex){
  if(!/^#[0-9a-f]{6}$/i.test(hex||''))return;
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const image=ctx.getImageData(20,36,25,7),d=image.data;
  for(let y=0;y<7;y++)for(let x=0;x<25;x++){
   if(!((x>=1&&x<=9)||(x>=15&&x<=23)))continue;
   const i=(y*25+x)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
   if(!iris(r,g,b,a)||(r>=205&&g>=180))continue;
   const f=Math.max(.22,Math.min(1.1,(r+g+b)/340));
   for(let k=0;k<3;k++)d[i+k]=clamp(rgb[k]*f);
  }
  ctx.putImageData(image,20,36);
 }
 function renderEyes(stage,opts={}){
  const el=stage?.querySelector('.paperdoll-female-eye-motion-canvas');
  if(!el)return;
  const out=el.getContext('2d');if(!out)return;
  out.imageSmoothingEnabled=false;out.clearRect(0,0,W,H);
  if(!loaded)return;
  const blank=!!opts.unconscious,closed=blank||!!opts.closed||!!opts.blink;
  const gaze=closed||opts.circleEyes?'center':opts.gaze||'center';
  const brow=opts.brows||'original',tone=opts.skinTone||'original',eyeColor=opts.eyeColor||'purple';
  const recolor=eyeColor!=='purple'&&/^#[0-9a-f]{6}$/i.test(eyeColor);
  if(!closed&&gaze==='center'&&brow==='original'&&!recolor)return;
  resetBase(tone);
  if(!closed&&gaze!=='center'&&painter){
   painter.paint(ctx,gaze);
   // Gaze frames contain original skin, so match customized skin after the patch.
   if(skinTones[tone]){
    // Recolor only the gaze engine's original-color patch. The rest of the
    // face has already been tinted in resetBase() and must not be tinted twice.
    const img=ctx.getImageData(20,37,25,4);
    const d=img.data,target=skinTones[tone];
    for(let i=0;i<d.length;i+=4){
     const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
     if(!skin(r,g,b,a))continue;
     const n=Math.max(.43,Math.min(1.22,(r*.36+g*.43+b*.21)/205));
     for(let k=0;k<3;k++)d[i+k]=clamp(target[k]*n);
    }
    ctx.putImageData(img,20,37);
   }
  }
  if(closed)replaceEyes(blank,tone);
  else if(recolor)tintIris(eyeColor);
  brows(brow,tone);
  if(brow==='shy'){ctx.fillStyle='rgba(225,142,132,.56)';ctx.fillRect(20,43,2,1);ctx.fillRect(43,43,2,1)}
  out.drawImage(work,20,31,25,14,20,31,25,14);
 }
 function renderMouth(stage,opts={}){
  const el=stage?.querySelector('.paperdoll-female-mouth-motion-canvas');
  if(!el)return;
  const out=el.getContext('2d');if(!out)return;
  out.imageSmoothingEnabled=false;out.clearRect(0,0,W,H);
  if(!loaded||opts.unconscious)return;
  let pose=opts.pose||'neutral';
  if(opts.talking){
   const frame=Math.floor((opts.time||0)/170)%4;
   pose=frame===0?'neutral':frame===2?'talkOpen':'talkSmall';
  }
  if(pose==='neutral'||pose==='original')return;
  const tone=opts.skinTone||'original';
  resetBase(tone);
  for(let y=45;y<=47;y++)for(let x=29;x<=35;x++)fillSkin(x,y,44,tone);
  const pix=(x,y,color,w=1,h=1)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
  const muted='#936252',pale='#c18b70',dark='#623e38';
  if(pose==='smile'||pose==='happy'){
   pix(30,46,pale);pix(31,46,muted,2);pix(33,46,pale);
  }else if(pose==='surprised'){
   pix(31,45,dark,2,2);pix(31,46,pale);
  }else if(pose==='frown'||pose==='angry'){
   pix(30,47,pale);pix(31,46,dark,2);pix(33,47,pale);
  }else if(pose==='shy'){pix(31,46,pale,2);
  }else if(pose==='talkSmall'){pix(31,45,dark,2);pix(32,46,pale);
  }else if(pose==='talkOpen'){pix(30,45,dark,4,2);pix(31,46,pale,2)}
  out.drawImage(work,29,44,7,5,29,44,7,5);
 }
 const face=new Image();
 face.onload=()=>{
  try{
   if(face.naturalWidth!==W||face.naturalHeight!==H)throw Error('V9 PNG must be 64x160');
   ctx.drawImage(face,0,0);
   original=ctx.getImageData(0,0,W,H).data;
   painter=root.DungeonMaleV9Gaze?.create(face)||null;
   loaded=true;root.dispatchEvent(new Event('dungeon-male-v9-ready'));
  }catch(err){console.error('V9 head preparation failed:',err)}
 };
 face.onerror=()=>console.error('V9 face asset unavailable');
 face.src=asset.face;
 root.DungeonMaleV9Equipment=Object.freeze({active:true,get ready(){return loaded},renderEyes,renderMouth,version:'1.0.0',rollback:'?male-head=v8'});
})(window);
