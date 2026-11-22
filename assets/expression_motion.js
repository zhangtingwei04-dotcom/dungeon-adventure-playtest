/* Facial motion V2: shared HP loops for player and future NPCs.
 * Each actor has separate timing; the renderer owns face and effect artwork.
 * Sampling uses the game/preview update loop, not a timer per NPC.
 */
(function(root){
 'use strict';
 const POSES=Object.freeze({
  original:Object.freeze({brows:'original',eyes:'original',mouth:'original'}),
  smile:Object.freeze({brows:'original',eyes:'original',mouth:'smile'}),
  happy:Object.freeze({brows:'original',eyes:'original',mouth:'smile'}),
  weak:Object.freeze({brows:'original',eyes:'original',mouth:'original'}),
  critical:Object.freeze({brows:'angry',eyes:'original',mouth:'original'}),
  surprised:Object.freeze({brows:'surprised',eyes:'surprised',mouth:'surprised'}),
  angry:Object.freeze({brows:'angry',eyes:'angry',mouth:'angry'}),
  shy:Object.freeze({brows:'shy',eyes:'original',mouth:'shy'}),
  eyesClosed:Object.freeze({brows:'original',eyes:'eyesClosed',mouth:'original'})
 });
 const STATUS_PRESETS=Object.freeze({
  healthy:Object.freeze({pose:'happy',blinkMin:2800,blinkMax:5300,blinkDuration:120,doubleBlink:0.07,sweat:false,circleEyes:false}),
  normal:Object.freeze({pose:'original',blinkMin:4500,blinkMax:7500,blinkDuration:135,doubleBlink:0.04,sweat:false,circleEyes:false}),
  weak:Object.freeze({pose:'weak',blinkMin:5800,blinkMax:8700,blinkDuration:155,doubleBlink:0.02,sweat:true,circleEyes:false}),
  critical:Object.freeze({pose:'critical',blinkMin:0,blinkMax:0,blinkDuration:0,doubleBlink:0,sweat:true,circleEyes:true})
 });
 const clock=()=>root.performance&&typeof root.performance.now==='function'?root.performance.now():Date.now();
 const poseOf=s=>Object.prototype.hasOwnProperty.call(POSES,s)?s:'original';
 const statusOf=s=>Object.prototype.hasOwnProperty.call(STATUS_PRESETS,s)?s:'normal';
 const between=(min,max)=>min+Math.random()*(max-min);
 const posMod=(a,b)=>((a%b)+b)%b;
 // Both genders use EXACTLY the same purple 3x3 spiral sprite during
 // HP defeat, over their existing eye art. Unconscious black spirals remain
 // a separate, higher-priority effect shared by both genders.
 const SPIRAL_FRAMES=Object.freeze([
  Object.freeze([[-1,-1],[0,-1],[1,0],[1,1]]),
  Object.freeze([[1,-1],[1,0],[0,1],[-1,1]]),
  Object.freeze([[1,1],[0,1],[-1,0],[-1,-1]]),
  Object.freeze([[-1,1],[-1,0],[0,-1],[1,-1]])
 ]);
 function drawSpiralEye(ctx,cx,cy,phase){
  if(!ctx)return;
  // No gender-specific white backing, scaling or alternate shape.
  const shape=SPIRAL_FRAMES[posMod(Math.floor(phase),4)];
  ctx.fillStyle='#3c2252';ctx.fillRect(cx-1,cy-1,3,3);
  for(let i=0;i<shape.length;i++){
   ctx.fillStyle=i%2?'#a977c4':'#f1d3fa';
   ctx.fillRect(cx+shape[i][0],cy+shape[i][1],1,1);
  }
  ctx.fillStyle='#573275';ctx.fillRect(cx,cy,1,1);
 }
 /* Tiny, translucent face highlights instead of illustrated droplets.
  * Presets use the 64x160 paperdoll face. NPCs may pass their own points.
  * Each mark is only 1 pixel; no long drips, outlines, or body-wide sweat.
  */
 /* Tiny but readable facial sweat glints (64x160 reference artwork).
  * Skin-local coordinates: temples and cheeks, not hair/body/background.
  * Never draw a large droplet; use 2-3 colored pixels with a pale highlight.
  * NPCs pass their own face-local points and optional offsets.
  */
 /* One reusable forehead sweat animation for BOTH weak and critical.
  * Same right-side artwork and six-frame appearance cycle;
  * only the speed changes with HP. Left side never draws sweat.
  */
 /* Sweat shared by weak + critical. Position tested against the actual
  * 64x160 V3 sprite: exposed RIGHT forehead skin is at x36..38, y29..30.
  * The old x40/y28 painted a bright square over the fringe.
  */
 function drawFaceSweat(ctx,status,phase=0,layout){
  if(!ctx||!(status==='weak'||status==='critical'))return;
  const opt=layout||{};
  const px=Math.round((Number.isFinite(opt.x)?opt.x:0)+
    (Number.isFinite(opt.sweatX)?opt.sweatX:37));
  const py=Math.round((Number.isFinite(opt.y)?opt.y:0)+
    (Number.isFinite(opt.sweatY)?opt.sweatY:29));
  const frame=posMod(Math.floor(phase),6);
  // Frames progress one way: appear -> elongate -> slide down -> disappear.
  // Never return to the original forehead position within a cycle.
  if(frame===0||frame===5)return;
  // Keep male V3's approved +1px length without changing other sprites.
  const extraLength=opt.sweatLong===true?1:0;
  const stages=[
   null,
   {dx:0,dy:0,length:1},
   {dx:0,dy:1,length:2+extraLength},
   {dx:0,dy:2,length:3+extraLength},
   // V3 eyes start at y32; with sweatY=26 the old final 4px drip
   // at x38/y30..33 overlapped the right upper eyelid at (38,33).
   // Keep downward-only motion: the fading tail moves from y28 to y29,
   // and ends at y31 instead of retracting upward or touching the eye.
   opt.sweatEyeSafe===true?{dx:1,dy:3,length:2+extraLength}:
     {dx:1,dy:4,length:3+extraLength}
  ];
  const s=stages[frame];
  ctx.save();
  ctx.fillStyle=frame===4?'rgba(37,207,231,0.72)':'rgba(37,207,231,0.96)';
  ctx.fillRect(px+s.dx,py+s.dy,1,s.length);
  ctx.fillStyle=frame===4?'rgba(18,118,141,0.55)':'rgba(18,118,141,0.94)';
  ctx.fillRect(px+s.dx+1,py+s.dy+Math.min(1,s.length-1),1,1);
  if(frame===1||frame===2){
   ctx.fillStyle='#f1ffff';
   ctx.fillRect(px+s.dx,py+s.dy,1,1);
  }
  ctx.restore();
 }
 /* Eight abnormal conditions are separate overlays, never face/HP substitutions.
  * One shared pixel renderer serves the player and future NPCs. Times are
  * sampled from the existing scene update rather than independent timers.
  */
 /* Unconscious overrides EVERY eye emotion, including blinking, closed eyes
  * and the HP-critical purple spiral. Four black-pixel spiral frames rotate
  * on a pale eye base. The rest of the face remains unchanged.
  */
 /* Four rotated 5x5 spirals with a black 1-pixel LINE, not a black
  * square. Use pale eye whites only within a tiny rounded pixel oval.
  */
 const BLACK_SPIRAL_PATH=Object.freeze([
  [-1,-2],[0,-2],[1,-2],[2,-1],[2,0],[1,1],[0,1],[0,0]
 ]);
 function drawUnconsciousEyes(ctx,time=clock(),layout){
  if(!ctx)return;
  const x0=Number.isFinite(layout?.x)?layout.x:0;
  const y0=Number.isFinite(layout?.y)?layout.y:0;
  const centers=Array.isArray(layout?.eyeCenters)?layout.eyeCenters:[[25,36],[39,36]];
  const phase=posMod(Math.floor((Number(time)||0)/210),4);
  for(const [ex,ey] of centers){
   const x=Math.round(x0+ex),y=Math.round(y0+ey);
   // Compact rounded white eye, with the face outline undisturbed.
   ctx.fillStyle='#f1e8e3';
   ctx.fillRect(x-1,y-2,3,1);
   ctx.fillRect(x-2,y-1,5,3);
   ctx.fillRect(x-1,y+2,3,1);
   for(const [dx,dy] of BLACK_SPIRAL_PATH){
    let rx=dx,ry=dy;
    for(let i=0;i<phase;i++){const old=rx;rx=-ry;ry=old;}
    ctx.fillStyle='#121317';
    ctx.fillRect(x+rx,y+ry,1,1);
   }
  }
 }
 const ABNORMAL_LABELS=Object.freeze({
  poison:'中毒',fever:'發燒',injury:'受傷／流血',dizzy:'暈眩',
  unconscious:'昏迷',sleep_deprived:'睡眠不足',hunger:'飢餓',dehydration:'缺水'
 });
 function drawAbnormalEffects(ctx,states,time=clock(),layout){
  if(!ctx||!Array.isArray(states)||states.length===0)return 0;
  const x0=Number.isFinite(layout?.x)?layout.x:0;
  const y0=Number.isFinite(layout?.y)?layout.y:0;
  const t=Math.max(0,Number(time)||0);
  const step=(speed,n)=>posMod(Math.floor(t/speed),n);
  let drawn=0;
  const px=(x,y,color,w=1,h=1)=>{
   ctx.fillStyle=color;
   ctx.fillRect(Math.round(x0+x),Math.round(y0+y),w,h);
  };
  const line=(x,y,length,color)=>px(x,y,color,length,1);
  const zed=(x,y,w=6)=>{
   const color='#e9dbff';line(x,y,w,color);
   for(let i=1;i<5;i++)px(x+w-i-1,y+i,color,2,1);
   line(x,y+5,w,color);
  };
  const thought=(x,y,kind,bob)=>{
   const yy=y+bob,edge='#f4e6c9',inside='rgba(27,51,56,.93)';
   line(x+3,yy,11,edge);line(x+1,yy+1,15,edge);
   px(x,yy+2,edge,17,11);line(x+1,yy+13,15,edge);line(x+3,yy+14,11,edge);
   px(x+2,yy+2,inside,13,11);
   if(kind==='blood'){
    // Visible blood drop in a thought bubble, never a wound painted on skin.
    px(x+8,yy+3,'#ff9b9c',2,2);px(x+7,yy+5,'#e54f62',4,3);
    px(x+6,yy+8,'#b92946',6,3);line(x+7,yy+11,4,'#d94c60');
    px(x+8,yy+7,'#ffe9e1',1,2);
   }else if(kind==='water'){
    px(x+8,yy+3,'#a1f5ff',2,2);px(x+7,yy+5,'#55dcf6',4,3);
    px(x+6,yy+8,'#32b9e2',6,3);line(x+7,yy+11,4,'#4bc9f0');
    px(x+8,yy+6,'#eaffff',1,3);
   }else if(kind==='food'){
    // 🍖 Pixel drumstick: red roasted meat with a light ivory bone.
    // The shape has a bulbous meat end and a distinct protruding bone.
    px(x+9,yy+4,'#7b3833',4,1);
    px(x+8,yy+5,'#a4483b',6,6);
    px(x+7,yy+6,'#c45c43',8,4);
    px(x+9,yy+7,'#ed9965',4,2);
    px(x+10,yy+5,'#ffbb83',2,1);
    px(x+8,yy+10,'#844137',5,1);
    px(x+4,yy+9,'#ede5d1',5,2);
    px(x+3,yy+8,'#fff4e2',2,2);
    px(x+4,yy+11,'#e2d1b6',2,1);
    px(x+6,yy+9,'#fff9ed',2,1);
   }
   if(x<30){px(x+13,yy+15,'#e3efe7',2,2);px(x+16,yy+18,'#e3efe7');}
   else{px(x+2,yy+15,'#e3efe7',2,2);px(x,yy+18,'#e3efe7');}
  };
  ctx.save();
  for(const id of new Set(states)){
   if(!Object.prototype.hasOwnProperty.call(ABNORMAL_LABELS,id))continue;
   drawn++;
   if(id==='poison'){
    // Three large green fumes rise directly above the hair, at different phases.
    const sway=[-1,0,1,0];
    for(let i=0;i<3;i++){
     const p=posMod(step(170,18)+i*6,18),y=20-p;
     const x=[23,32,41][i]+sway[posMod(step(230,4)+i,4)];
     px(x-2,y-1,'#276c3b',6,5);
     px(x-1,y,'#64d46b',4,3);
     px(x,y-1,'#d4ffa4',2,1);
     px(x+1,y+2,'#b6f692',1,1);
    }
    const y=17-step(205,14);
    px(28,y,'#8deb83',3,3);px(29,y-1,'#eeffb5');
   }else if(id==='fever'){
    // Three wide orange/red heat columns rise from the head, clearly distinct from poison.
    for(let i=0;i<3;i++){
     const p=posMod(step(180,17)+i*5,17),y=19-p;
     const x=[24,33,42][i]+(step(280,2)?1:-1);
     px(x-2,y,'#a93b35',6,5);
     px(x-1,y,'#f56642',4,4);
     px(x,y-1,'#ffb761',3,3);
     px(x+1,y,'#ffe79b',1,2);
    }
    const y=18-step(215,15);
    px(30,y,'#ff8752',4,3);px(31,y-1,'#ffe49e',2,1);
   }else if(id==='injury'){
    // Show a blood-related THOUGHT instead of physical cuts or bleeding.
    thought(2,4,'blood',step(420,4)<2?0:1);
   }else if(id==='dizzy'){
    // Animated 💫: two bright gold/white stars circle the head.
    const orbit=[[32,10],[44,13],[53,20],[44,27],
                 [32,29],[20,27],[11,20],[20,13]];
    const frame=step(170,8);
    for(let i=0;i<2;i++){
     const index=posMod(frame+(i?4:0),8),[x,y]=orbit[index];
     const light=i?'#ffe99a':'#ffe16b';
     const glow=i?'#d8a94f':'#e9b947';
     px(x-1,y-3,glow,3,7);px(x-3,y-1,glow,7,3);
     px(x-1,y-1,light,3,3);px(x,y,'#fffdf0');
     px(x-2,y-2,'#ffeaa2');px(x+2,y+2,'#ffeaa2');
     const [tx,ty]=orbit[posMod(index+7,8)];
     px(tx,ty,'#ffedac',2,2);
    }
   }else if(id==='unconscious'){
    // Drawn LAST below, over any other abnormal effect or facial expression.
   }else if(id==='sleep_deprived'){
    // Only floating Z; absolutely no eyelid shadow or dark circles.
    const p=step(330,6);
    zed(51,19-(p%3),6);
    if(p<4)zed(57,10-Math.floor(p/2),4);
   }else if(id==='hunger'){
    // Food pictogram in an animated thought balloon.
    thought(2,28,'food',step(520,4)<2?0:1);
   }else if(id==='dehydration'){
    // Water pictogram in an animated thought balloon.
    thought(45,4,'water',step(470,4)<2?0:1);
   }
  }
  // Black animated spirals get final drawing priority in all combinations.
  if(states.includes('unconscious'))drawUnconsciousEyes(ctx,t,layout);
  ctx.restore();
  return drawn;
 }
 /* Light-weight, visual-only sleep and vitality preview shared by NPCs.
  * Independent from injury, HP and permanent save state.
  */
 const REST_SLEEP=Object.freeze({
  awake:'清醒',drowsy:'想睡',sleeping:'正常睡眠',
  nightmare_mild:'輕微惡夢',nightmare_severe:'嚴重惡夢',nightmare_waking:'惡夢驚醒',
  dream_good:'美夢',dream_smile:'美夢中的微笑',dream_waking:'美夢醒來'
 });
 const REST_VITALITY=Object.freeze({high:'充沛',normal:'一般',low:'不足'});
 /*
  * The same sleep pose is used by the player paper doll and the procedural
  * 48x64 NPC painter. The temporary waking pose settles to neutral after
  * about 1.5 seconds, with no forced gameplay or save changes.
  */
 function sleepFace(sleep,elapsed=0){
  if(sleep==='sleeping')return {eyes:'eyesClosed',brows:null,mouth:null,phase:'sleeping'};
  if(sleep==='nightmare_mild')return {eyes:'eyesClosed',brows:'angry',mouth:'shy',phase:'mild'};
  if(sleep==='nightmare_severe')return {eyes:'eyesClosed',brows:'angry',mouth:'angry',phase:'severe'};
  if(sleep==='nightmare_waking'){
   return elapsed<1450?
    {eyes:'surprised',brows:'surprised',mouth:'surprised',phase:'startled'}:
    {eyes:'original',brows:'original',mouth:'original',phase:'calming'};
  }
  if(sleep==='dream_good')
   return {eyes:'eyesClosed',brows:'original',mouth:'smile',phase:'dream_good'};
  if(sleep==='dream_smile')
   return {eyes:'eyesClosed',brows:'original',mouth:'smile',phase:'dream_smile'};
  if(sleep==='dream_waking'){
   if(elapsed<1050)
    return {eyes:'eyesClosed',brows:'original',mouth:'smile',phase:'dream_awakening'};
   if(elapsed<2500)
    return {eyes:'original',brows:'original',mouth:'smile',phase:'dream_eyes_open'};
   return {eyes:'original',brows:'original',mouth:'original',phase:'dream_settled'};
  }
  return null;
 }
 function applySleepFacePriority(frame,sleep,elapsed=0){
  if(!frame||!frame.parts)return frame;
  const pose=sleepFace(sleep,Math.max(0,Number(elapsed)||0));
  if(!pose)return frame;
  if(pose.eyes)frame.parts.eyes=pose.eyes;
  if(pose.brows)frame.parts.brows=pose.brows;
  if(pose.mouth)frame.parts.mouth=pose.mouth;
  frame.blink=false;
  if(frame.effects){
   frame.effects.blink=false;
   frame.effects.circleEyes=false;
  }
  return frame;
 }
 function drawRestEffects(ctx,rest,time=clock(),layout){
  if(!ctx||!rest)return;
  const ox=Number.isFinite(layout?.x)?layout.x:0;
  const oy=Number.isFinite(layout?.y)?layout.y:0;
  const sleep=Object.prototype.hasOwnProperty.call(REST_SLEEP,rest.sleep)?rest.sleep:'awake';
  const t=Number.isFinite(time)?time:0;
  const elapsed=Math.max(0,Number(rest.elapsed)||0);
  const px=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(ox+x),Math.round(oy+y),w,h);};
  const z=(x,y,color)=>{
   px(x,y,5,1,color);px(x+3,y+1,1,1,color);
   px(x+2,y+2,1,1,color);px(x+1,y+3,1,1,color);px(x,y+4,5,1,color);
  };
  ctx.save();
  if(sleep==='sleeping'||sleep==='drowsy'){
   // Normal sleep: calm and slow breathing, with occasional pale Z.
   const step=Math.floor(t/420);
   if(sleep==='sleeping'||step%4<2){
    const yy=15-step%4;
    z(50,yy,sleep==='sleeping'?'#dac6ef':'#b4a8bd');
    if(sleep==='sleeping'){
     z(56,8-(Math.floor(t/630)%3),'#ac9ac9');
     const pulse=Math.floor(t/850)%2;
     px(47,78+pulse,2,1,'rgba(226,228,205,.63)');
     px(48,80+pulse,1,1,'rgba(226,228,205,.42)');
    }
   }
  }else if(sleep==='nightmare_mild'||sleep==='nightmare_severe'){
   // No Z during nightmares. Different sweat and shoulder tension cadence.
   const severe=sleep==='nightmare_severe';
   const pace=severe?190:410;
   const phase=Math.floor(t/pace)%6;
   if(severe||phase<4){
    const dropY=29+(severe?phase%3:phase%2);
    px(37,dropY,2,severe?3:2,'rgba(44,165,189,.84)');
    px(37,dropY,1,1,'#c9f7ff');
   }
   if(severe){
    // Single-pixel jitter beside the shoulders, not an entire moving body.
    const y=Math.floor(t/170)%2;
    px(9,72+y,2,1,'rgba(168,171,180,.75)');
    px(52,73-y,2,1,'rgba(168,171,180,.70)');
    const pulse=Math.floor(t/260)%2;
    px(48,79+pulse,2,1,'rgba(225,214,210,.65)');
   }
  }else if(sleep==='nightmare_waking'&&elapsed<2100){
   // Short startled sweat which fades as eyes and mouth return to neutral.
   if(elapsed<1450||Math.floor(elapsed/280)%2===0){
    px(37,29+(Math.floor(t/200)%2),2,2,'rgba(44,170,195,.88)');
    px(37,29,1,1,'#dcfaff');
   }
  }else if(sleep==='dream_good'||sleep==='dream_smile'||sleep==='dream_waking'){
   // Dream warmth is a small, intermittent golden glimmer, not vitality.
   // Avoid the sleep Z; this light belongs only to the dream state.
   const waking=sleep==='dream_waking';
   const smiling=sleep==='dream_smile';
   if(!waking||elapsed<2500){
    const breath=Math.floor(t/920)%2;
    px(47,78+breath,2,1,'rgba(233,226,204,.52)');
    px(48,80+breath,1,1,'rgba(233,226,204,.32)');
   }
   if((!waking||elapsed<2050)&&Math.floor(t/560)%4!==3){
    const b=Math.floor(t/560)%3;
    const starX=50+(smiling?2:0),starY=15-b;
    px(starX,starY-2,1,5,'#c69d55');
    px(starX-2,starY,5,1,'#e6c87e');
    px(starX,starY,1,1,'#fff1b7');
    if(smiling&&Math.floor(t/790)%3===1){
     px(57,10,1,3,'#ead49b');px(56,11,3,1,'#ead49b');
    }
   }
   // Barely visible cheek blush accent: no reshaping the face outline.
   if(smiling||waking&&elapsed>=1050&&elapsed<2500){
    px(20,43,2,1,'rgba(219,137,127,.57)');
    px(43,43,2,1,'rgba(219,137,127,.57)');
   }
  }
  // Vitality never paints a visual effect, even if the actor is asleep.
  ctx.restore();
 }
 function createActor(options){
  const opts=options||{};
  let status=statusOf(opts.status||'normal');
  let override=opts.expression?poseOf(opts.expression):null;
  let pose=override||STATUS_PRESETS[status].pose;
  let previous=pose;
  let changedAt=-10000;
  let enteredAt=clock();
  let enabled=opts.enabled!==false;
  let blinkEnabled=opts.blink!==false;
  let blinkUntil=-1,secondBlinkAt=-1,nextBlinkAt=Infinity;
  const preset=()=>STATUS_PRESETS[status];
  function scheduleBlink(t){
   const p=preset();
   nextBlinkAt=p.blinkMin>0?t+between(p.blinkMin,p.blinkMax):Infinity;
  }
  scheduleBlink(enteredAt);
  function setStatus(value,at){
   const next=statusOf(value);
   if(status===next)return false;
   const time=Number.isFinite(at)?at:clock();
   status=next;enteredAt=time;previous=pose;pose=override||preset().pose;changedAt=time;
   blinkUntil=-1;secondBlinkAt=-1;scheduleBlink(time);
   return true;
  }
  function setExpressionOverride(value,at){
   const next=value==null?null:poseOf(value);
   if(next===override)return false;
   const time=Number.isFinite(at)?at:clock();
   override=next;previous=pose;pose=override||preset().pose;changedAt=time;
   return true;
  }
  function setEnabled(value){
   const next=!!value;
   if(next===enabled)return;
   enabled=next;
   if(!enabled){blinkUntil=-1;secondBlinkAt=-1;}
   else scheduleBlink(clock());
  }
  function setBlink(value){
   blinkEnabled=!!value;
   if(!blinkEnabled){blinkUntil=-1;secondBlinkAt=-1;}
  }
  function sample(at){
   const time=Number.isFinite(at)?at:clock(),p=preset();
   if(enabled&&blinkEnabled&&p.blinkMin>0&&pose!=='eyesClosed'){
    if(secondBlinkAt>=0&&time>=secondBlinkAt){
     blinkUntil=time+p.blinkDuration;secondBlinkAt=-1;
    }else if(time>=nextBlinkAt){
     blinkUntil=time+p.blinkDuration;
     secondBlinkAt=Math.random()<p.doubleBlink?time+230:-1;
     scheduleBlink(time);
    }
   }
   const blinking=enabled&&blinkEnabled&&p.blinkMin>0&&pose!=='eyesClosed'&&time<blinkUntil;
   const face=POSES[pose],before=POSES[previous];
   const passed=time-changedAt;
   const circlePhase=p.circleEyes?posMod(Math.floor((time-enteredAt)/185),4):0;
   // Identical 6-frame sweat loop for both states, with a slower weak cycle.
   const sweatStepMs=status==='critical'?210:520;
   const sweatPhase=p.sweat?posMod(Math.floor((time-enteredAt)/sweatStepMs),6):0;
   return {
    status,expression:pose,pose,blink:blinking,
    parts:{
     brows:passed<90?before.brows:face.brows,
     eyes:blinking?'eyesClosed':face.eyes,
     mouth:face.mouth
    },
    effects:{
     blink:blinking,
     sweat:enabled&&p.sweat,
     sweatPhase,
     circleEyes:enabled&&p.circleEyes,
     circlePhase
    }
   };
  }
  return Object.freeze({
   id:String(opts.id||'actor'),
   setStatus,setExpressionOverride,
   // Backwards compatibility for manual expression preview.
   setExpression(value,at){return setExpressionOverride(value,at);},
   setEnabled,setBlink,sample,
   get status(){return status;},
   get expression(){return pose;},
   get enabled(){return enabled;}
  });
 }
 /* An unconscious actor loses normal eye art and uses the original calm
  * mouth regardless of chosen emotion or HP. Does not mutate saved data.
  */
 function applyAbnormalFacePriority(frame,states){
  if(!frame||!Array.isArray(states)||!states.includes('unconscious'))return frame;
  frame.parts.eyes=null;
  frame.parts.mouth='original';
  frame.blink=false;
  if(frame.effects)frame.effects.blink=false;
  return frame;
 }
 root.DungeonExpressionMotion=Object.freeze({
  version:'2.18.0',poses:POSES,statuses:STATUS_PRESETS,abnormalLabels:ABNORMAL_LABELS,restSleep:REST_SLEEP,restVitality:REST_VITALITY,sleepFace,applySleepFacePriority,drawSpiralEye,drawFaceSweat,drawUnconsciousEyes,drawAbnormalEffects,drawRestEffects,applyAbnormalFacePriority,createActor
 });
})(window);
