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
  critical:Object.freeze({brows:'angry',eyes:'original',mouth:'angry'}),
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
 function drawFaceSweat(ctx,status,phase=0,layout){
  if(!ctx||!(status==='weak'||status==='critical'))return;
  const opt=layout||{};
  const px=Math.round((Number.isFinite(opt.x)?opt.x:0)+
    (Number.isFinite(opt.sweatX)?opt.sweatX:40));
  const py=Math.round((Number.isFinite(opt.y)?opt.y:0)+
    (Number.isFinite(opt.sweatY)?opt.sweatY:28));
  const frame=posMod(Math.floor(phase),6);
  if(frame===0||frame===5)return;
  ctx.save();
  // Small bright mark at the viewer's RIGHT forehead, above the eye.
  if(frame===1||frame===4){
   ctx.fillStyle='#15536a';ctx.fillRect(px+1,py+1,1,1);
   ctx.fillStyle='#84f2ff';ctx.fillRect(px,py,1,1);
  }else{
   const drift=frame===3?1:0;
   ctx.fillStyle='#15536a';ctx.fillRect(px+2,py+1+drift,1,3);
   ctx.fillStyle='#1bdaf2';ctx.fillRect(px,py+1+drift,2,2);
   ctx.fillStyle='#f5ffff';ctx.fillRect(px,py+drift,2,1);
   ctx.fillStyle='#69e8fb';ctx.fillRect(px+1,py+3+drift,1,1);
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
 root.DungeonExpressionMotion=Object.freeze({
  version:'2.6.0',poses:POSES,statuses:STATUS_PRESETS,drawSpiralEye,drawFaceSweat,createActor
 });
})(window);
