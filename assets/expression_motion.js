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
 // Four readable 3x3 pixel-art spiral frames. Position is caller-specific.
 const SPIRAL_FRAMES=Object.freeze([
  Object.freeze([[-1,-1],[0,-1],[1,0],[1,1]]),
  Object.freeze([[1,-1],[1,0],[0,1],[-1,1]]),
  Object.freeze([[1,1],[0,1],[-1,0],[-1,-1]]),
  Object.freeze([[-1,1],[-1,0],[0,-1],[1,-1]])
 ]);
 function drawSpiralEye(ctx,cx,cy,phase){
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
  if(frame===0||frame===5)return;
  ctx.save();
  // A clear but compact highlight ON THE SKIN of the right forehead.
  // Both HP states use exactly the same art. Only their frame rates differ.
  if(frame===1||frame===4){
   ctx.fillStyle='rgba(16,115,141,0.8)';
   ctx.fillRect(px,py,1,1);
  }else{
   ctx.fillStyle='rgba(18,118,141,0.94)';
   ctx.fillRect(px+1,py+1,1,1);
   ctx.fillStyle='rgba(37,207,231,0.96)';
   ctx.fillRect(px,py+1,1,1);
   ctx.fillStyle='#f1ffff';
   ctx.fillRect(px,py,1,1);
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
 const REST_SLEEP=Object.freeze({awake:'清醒',drowsy:'想睡',sleeping:'睡著'});
 const REST_VITALITY=Object.freeze({high:'充沛',normal:'一般',low:'不足'});
 function drawRestEffects(ctx,rest,time=clock(),layout){
  if(!ctx||!rest)return;
  const ox=Number.isFinite(layout?.x)?layout.x:0;
  const oy=Number.isFinite(layout?.y)?layout.y:0;
  const sleep=Object.prototype.hasOwnProperty.call(REST_SLEEP,rest.sleep)?rest.sleep:'awake';
  const vitality=Object.prototype.hasOwnProperty.call(REST_VITALITY,rest.vitality)?rest.vitality:'normal';
  const t=Number.isFinite(time)?time:0;
  const px=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(ox+x),Math.round(oy+y),w,h);};
  ctx.save();
  if(sleep==='sleeping'||sleep==='drowsy'){
   // Soft, buoyant Z; sleeping has two Zs, drowsy has one intermittent Z.
   const step=Math.floor(t/420);
   if(sleep==='sleeping'||step%4<2){
    const bob=step%4,yy=15-bob;
    const color=sleep==='sleeping'?'#dac6ef':'#b4a8bd';
    px(50,yy,5,1,color);px(53,yy+1,1,1,color);
    px(52,yy+2,1,1,color);px(51,yy+3,1,1,color);
    px(50,yy+4,5,1,color);
    if(sleep==='sleeping'){
     const smallY=8-(Math.floor(t/630)%3);
     px(56,smallY,4,1,'#ac9ac9');px(58,smallY+1,1,1,'#ac9ac9');
     px(57,smallY+2,1,1,'#ac9ac9');px(56,smallY+3,4,1,'#ac9ac9');
     // Very faint rise and fall at the ribcage: breathing, not torso scaling.
     const pulse=Math.floor(t/850)%2;
     px(47,78+pulse,2,1,'rgba(226,228,205,.63)');
     px(48,80+pulse,1,1,'rgba(226,228,205,.42)');
    }
   }
  }
  // Sleep and vitality are two INDEPENDENT axes. Show the same vitality
  // thought when awake, drowsy or fully asleep (only unconsciousness hides it).
  // Right side below the existing water bubble; left-side hunger stays visible.
  const bubble=(kind,bob)=>{
   const x=45,y=31+bob,edge='#f4e6c9',inside='rgba(27,51,56,.94)';
   px(x+3,y,11,1,edge);px(x+1,y+1,15,1,edge);
   px(x,y+2,17,11,edge);px(x+1,y+13,15,1,edge);px(x+3,y+14,11,1,edge);
   px(x+2,y+2,13,11,inside);
   px(x+2,y+15,2,2,'#dce8db');px(x,y+18,1,1,'#dce8db');
   if(kind==='plus'){
    // Recognizable bright green plus with darker edge and light center.
    px(x+7,y+4,4,8,'#225d40');
    px(x+4,y+7,10,3,'#225d40');
    px(x+8,y+5,2,6,'#70ef88');
    px(x+5,y+8,8,1,'#7dff95');
    px(x+8,y+8,2,1,'#d6ffd4');
   }else{
    // Chaotic scribble instead of a vague exhaustion cloud.
    const shift=Math.floor(t/380)%2;
    px(x+4,y+5+shift,2,1,'#a99fbc');
    px(x+6,y+6,4,1,'#cbbdd7');
    px(x+5,y+7,2,2,'#80788b');
    px(x+9,y+5,1,3,'#ddd2df');
    px(x+10,y+7+shift,3,1,'#a79bb9');
    px(x+7,y+8,3,2,'#c5afc9');
    px(x+4,y+10,5,1,'#8d809e');
    px(x+11,y+10-shift,2,2,'#7f7890');
    px(x+6,y+11,5,1,'#dbccd6');
   }
  };
  if(vitality==='high'||vitality==='low'){
   const bob=Math.floor(t/490)%4<2?0:1;
   bubble(vitality==='high'?'plus':'scribble',bob);
  }
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
  version:'2.14.0',poses:POSES,statuses:STATUS_PRESETS,abnormalLabels:ABNORMAL_LABELS,restSleep:REST_SLEEP,restVitality:REST_VITALITY,drawSpiralEye,drawFaceSweat,drawUnconsciousEyes,drawAbnormalEffects,drawRestEffects,applyAbnormalFacePriority,createActor
 });
})(window);
