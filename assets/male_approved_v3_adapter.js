/* Exact approved male Head V3 adapter, 2026-11-21 acceptance sheet.
 * Uses the FIVE original transparent image layers, not a V9 approximation.
 * Works with the existing paperdoll equipment, body, neck and saved states.
 * ?male-head=v8 restores the old V8; ?male-head=v9 allows V9 comparison.
 */
(function(root){
 'use strict';
 const mode=new URLSearchParams(root.location.search).get('male-head');
 const art=root.DungeonMaleV3CorrectedLayers||root.DungeonMaleApprovedV3;
 if(mode==='v8'||mode==='v9'||!art?.head_base||!art?.eyebrows||!art?.eyes||!art?.mouth||!art?.hair_standard)return;
 const W=64,H=160,eyeCenters=[25,39],layerNames=['head_base','eyebrows','eyes','mouth','hair_standard'];
 const loaded={};let ready=false,baseData=null,eyeData=null;
 const skinTones=Object.freeze({fair:[252,218,187],warm:[242,188,145],tan:[207,144,102],deep:[156,99,72]});
 const scratch=document.createElement('canvas');scratch.width=W;scratch.height=H;
 const c=scratch.getContext('2d',{willReadFrequently:true});
 const cvEyes=document.createElement('canvas');cvEyes.width=W;cvEyes.height=H;
 const ec=cvEyes.getContext('2d',{willReadFrequently:true});
 const cvBrows=document.createElement('canvas');cvBrows.width=W;cvBrows.height=H;
 const bc=cvBrows.getContext('2d',{willReadFrequently:true});
 const pidx=(x,y)=>(y*W+x)*4, clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
 function isSkin(r,g,b,a){return a>=100&&r>=90&&r>g+12&&g>b+10}
 function isIris(r,g,b,a){return a>=128&&b>=g+10&&((b>r+4)||(r>g+30&&b>g+15))}
 function skinTint(data,tone){
  const target=skinTones[tone];
  if(!target)return;
  for(let i=0;i<data.length;i+=4){
   const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
   if(!isSkin(r,g,b,a))continue;
   const shade=Math.max(.43,Math.min(1.22,(r*.36+g*.43+b*.21)/205));
   for(let j=0;j<3;j++)data[i+j]=clamp(target[j]*shade);
  }
 }
 function resetBase(tone){
  const data=new Uint8ClampedArray(baseData);
  skinTint(data,tone);
  c.putImageData(new ImageData(data,W,H),0,0);
 }
 const irisHexToRGB=(color)=>/^#[0-9a-f]{6}$/i.test(color||'')?[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)):null;
 const read=(pixels,x,y)=>{let j=pidx(x,y);return [pixels[j],pixels[j+1],pixels[j+2],pixels[j+3]]};
 const write=(pixels,x,y,rgba)=>{if(x<0||x>=W||y<0||y>=H)return;let i=pidx(x,y);for(let j=0;j<4;j++)pixels[i+j]=rgba[j]};
 function eyeFrame(direction='center',color='purple'){
  const data=new Uint8ClampedArray(eyeData),rgb=irisHexToRGB(color);
  const dirs={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1],center:[0,0]};
  const [dx,dy]=dirs[direction]||dirs.center;
  if(dx||dy){
   // The approved V3 eye is only a few native pixels tall. Move a small
   // reflected iris highlight INSIDE the original dark iris, leaving black
   // contours, white glints and the eyelid untouched. Never erase the pupil
   // to transparent, which previously revealed peach holes in the eyes.
   for(const cx of eyeCenters){
    const highlight=[];
    for(let y=37;y<=38;y++)for(let x=cx-3;x<=cx+3;x++){
     const p=read(eyeData,x,y);
     if(p[3]>150&&p[0]>=105&&p[1]>=55&&p[2]>=125&&p[2]>p[1]+25)
      highlight.push({x,y,p});
    }
    for(const {x,y,p} of highlight){
     const nx=x+dx,ny=y+dy;
     if(nx<cx-3||nx>cx+3||ny<37||ny>38)continue;
     const dest=read(eyeData,nx,ny);
     if(!isIris(...dest)||dest[0]>=220)continue;
     write(data,x,y,[clamp(p[0]*.68),clamp(p[1]*.7),clamp(p[2]*.7),p[3]]);
     write(data,nx,ny,p);
    }
   }
  }
  if(rgb){
   for(let y=37;y<=38;y++)for(let x=20;x<=44;x++){
    const p=read(data,x,y);
    if(!isIris(...p)||p[0]>=220)continue;
    const n=Math.max(.22,Math.min(1.1,(p[0]+p[1]+p[2])/340));
    write(data,x,y,[clamp(rgb[0]*n),clamp(rgb[1]*n),clamp(rgb[2]*n),p[3]]);
   }
  }
  ec.clearRect(0,0,W,H);ec.putImageData(new ImageData(data,W,H),0,0);
  return cvEyes;
 }
 function browFrame(pose){
  bc.clearRect(0,0,W,H);
  // Use the ACCEPTED brows themselves, never the old V9 hand-drawn bars.
  // Surprised eyebrows rise by 1 native pixel; angry brows lower by 1.
  let offset=pose==='surprised'?-1:pose==='angry'?1:0;
  bc.drawImage(loaded.eyebrows,0,offset);
  return cvBrows;
 }
 function renderEyes(stage,opts={}){
  const target=stage?.querySelector('.paperdoll-female-eye-motion-canvas');if(!target)return;
  const out=target.getContext('2d');if(!out)return;
  out.imageSmoothingEnabled=false;out.clearRect(0,0,W,H);
  if(!ready)return;
  const closed=!!opts.unconscious||!!opts.closed||!!opts.blink;
  const pose=opts.brows||'original',tone=opts.skinTone||'original';
  // With hair equipped, the 3px edge of the forehead brow must not leak through
  // the silver fringe. In BALD mode, keep the full approved brow and motions.
  const showBrows=stage.classList.contains('paperdoll-bald');
  const gaze=opts.circleEyes||closed?'center':opts.gaze||'center';
  const color=opts.eyeColor||'purple';
  const changed=closed||(showBrows&&pose!=='original')||gaze!=='center'||color!=='purple';
  if(!changed)return;
  resetBase(tone);
  if(showBrows)c.drawImage(browFrame(pose),0,0);
  if(closed){
   c.fillStyle='#3f292d';
   c.fillRect(22,37,6,1);c.fillRect(36,37,6,1);
  }else c.drawImage(eyeFrame(gaze,color),0,0);
  if(pose==='shy'){
   c.fillStyle='rgba(216,130,133,0.45)';c.fillRect(20,40,2,1);c.fillRect(43,40,2,1);
  }
  // Separate eyebrows now occupy y29..30, partly hidden below the hair.
  // Eyes (including formerly-mislabelled upper lashes) occupy y32..38.
  // Repaint both with the original face skin during blink or expression
  // so neither the original eyelid nor eyebrow can ghost underneath.
  out.drawImage(scratch,18,27,30,15,18,27,30,15);
 }
 function renderMouth(stage,opts={}){
  const target=stage?.querySelector('.paperdoll-female-mouth-motion-canvas');if(!target)return;
  const out=target.getContext('2d');if(!out)return;
  out.imageSmoothingEnabled=false;out.clearRect(0,0,W,H);
  if(!ready||opts.unconscious)return;
  let pose=opts.pose||'neutral';
  if(opts.talking){
   const step=Math.floor((opts.time||0)/170)%4;
   pose=step===0?'neutral':step===2?'talkOpen':'talkSmall';
  }
  if(pose==='neutral'||pose==='original')return;
  const tone=opts.skinTone||'original';
  resetBase(tone);
  // The accepted V3 mouth is a small neutral line on y44 (30..32).
  const skin=read(baseData,31,43);
  c.fillStyle=skin[3]?'rgba('+skin.join(',').replace(/,255$/,',1)'):'rgba(250,205,176,1)';
  for(let y=43;y<=46;y++)c.fillRect(29,y,6,1);
  c.fillStyle='#a77765';
  if(pose==='smile'||pose==='happy'){
   c.fillRect(30,44,4,1);c.fillRect(30,43,1,1);c.fillRect(33,43,1,1);
  }else if(pose==='surprised'){c.fillStyle='#744744';c.fillRect(31,44,2,2);
  }else if(pose==='frown'||pose==='angry'){c.fillRect(30,44,1,1);c.fillRect(31,43,2,1);c.fillRect(33,44,1,1);
  }else if(pose==='shy'){c.fillRect(31,44,2,1);
  }else if(pose==='talkSmall'){c.fillStyle='#744744';c.fillRect(31,44,2,1);
  }else if(pose==='talkOpen'){c.fillStyle='#744744';c.fillRect(30,44,4,2)}
  out.drawImage(scratch,29,43,6,4,29,43,6,4);
 }
 async function loadAll(){
  try{
   await Promise.all(layerNames.map(key=>new Promise((resolve,reject)=>{
    const im=new Image();im.onload=()=>{
     if(im.naturalWidth!==W||im.naturalHeight!==H)return reject(Error('Invalid native V3 layer '+key));
     loaded[key]=im;resolve();
    };im.onerror=()=>reject(Error('Missing approved V3 layer '+key));im.src=art[key];
   })));
   ec.drawImage(loaded.eyes,0,0);eyeData=ec.getImageData(0,0,W,H).data;
   c.drawImage(loaded.head_base,0,0);baseData=c.getImageData(0,0,W,H).data;
   // Critical: do NOT bake the approved brows, eyes and mouth back into
   // the head. The equipment page draws all five transparent PNGs separately.
   root.DUNGEON_MALE_SHARED_FACE_V5=art.head_base;
   root.DUNGEON_MALE_HAIR_V8=art.hair_standard;
   root.DUNGEON_MALE_FACE_VERSION='v3-accepted';
   ready=true;
   root.dispatchEvent(new Event('dungeon-male-face-ready'));
   root.dispatchEvent(new Event('dungeon-male-v9-ready'));
  }catch(err){console.error('Could not restore accepted V3 head:',err)}
 }
 const adapter=Object.freeze({active:true,get ready(){return ready},version:'v3-accepted',renderEyes,renderMouth});
 // Retain existing male-female canvas routing; only male paints using this art.
 root.DungeonMaleV9Equipment=adapter;
 // Avoid cache left from the previous V9 while original V3 images are loading.
 loadAll();
})(window);
