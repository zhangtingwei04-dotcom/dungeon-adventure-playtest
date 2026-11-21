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
 function drawFaceSweat(ctx,status,phase=0,layout){
  if(!ctx||!(status==='weak'||status==='critical'))return;
  const face=layout||{};
  const originX=Number.isFinite(face.x)?face.x:0;
  const originY=Number.isFinite(face.y)?face.y:0;
  const points=Array.isArray(face.points)?face.points:
   (status==='weak'?[[43,40],[21,40]]:
      [[21,38],[43,39],[23,42],[41,43]]);
  const p=posMod(Math.floor(phase),3);
  ctx.save();
  for(let i=0;i<points.length;i++){
   // Keep the sweat confined to visible skin, beside/below the eyes.
   // Weak shows one bead at a time; critical shows several glints.
   if(status==='weak'&&i!==p%2)continue;
   if(status==='critical'&&i===3&&p===1)continue;
   const [x,y]=points[i];
   const px=Math.round(originX+x),py=Math.round(originY+y+((i+p)%3===0?1:0));
   // Dark blue-teal pixel anchors the highlight against light skin.
   ctx.fillStyle='rgba(18,111,144,0.88)';
   ctx.fillRect(px,py+1,1,1);
   // Brighter aqua reads as moisture, not a white skin blemish.
   ctx.fillStyle='rgba(44,202,229,0.97)';
   ctx.fillRect(px,py,1,1);
   if(status==='critical'||p!==1){
    ctx.fillStyle='rgba(233,253,255,0.99)';
    ctx.fillRect(px-1,py,1,1);
   }
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
   const sweatPhase=p.sweat?posMod(Math.floor((time-enteredAt)/(status==='critical'?300:420)),3):0;
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
  version:'2.2.0',poses:POSES,statuses:STATUS_PRESETS,drawSpiralEye,drawFaceSweat,createActor
 });
})(window);
