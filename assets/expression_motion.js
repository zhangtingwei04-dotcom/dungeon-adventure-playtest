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
   if(kind==='water'){
    px(x+8,yy+3,'#a1f5ff',2,2);px(x+7,yy+5,'#55dcf6',4,3);
    px(x+6,yy+8,'#32b9e2',6,3);line(x+7,yy+11,4,'#4bc9f0');
    px(x+8,yy+6,'#eaffff',1,3);
   }else{
    px(x+6,yy+4,'#c88748',7,2);px(x+5,yy+6,'#a96b3c',9,5);
    px(x+6,yy+6,'#f8dca3',7,4);px(x+7,yy+7,'#fff0c5',4,2);
    line(x+6,yy+11,7,'#bc8250');
   }
   if(x<30){px(x+13,yy+15,'#e3efe7',2,2);px(x+16,yy+18,'#e3efe7');}
   else{px(x+2,yy+15,'#e3efe7',2,2);px(x,yy+18,'#e3efe7');}
  };
  ctx.save();
  for(const id of new Set(states)){
   if(!Object.prototype.hasOwnProperty.call(ABNORMAL_LABELS,id))continue;
   drawn++;
   if(id==='poison'){
    // Green spores and a weak sickly glow near the temples.
    const p=step(300,5);
    px(12,35-p,'#73c578',2,2);px(50,34-posMod(p+2,5),'#a2db82',2,2);
    px(13,33-p,'rgba(118,217,142,.65)');
    line(18,41,3,'rgba(105,173,90,.48)');
    line(43,41,3,'rgba(105,173,90,.48)');
   }else if(id==='fever'){
    const p=step(260,4),light=p<2?'.78':'.45';
    line(19,41,4,'rgba(241,109,114,'+light+')');
    line(42,41,4,'rgba(241,109,114,'+light+')');
    px(10,25-p,'#f18575',2,2);px(53,26-posMod(p+1,4),'#ef9b77',2,2);
    px(10,24-p,'rgba(255,183,137,.52)');
   }else if(id==='injury'){
    const p=step(340,4);
    px(43,43,'#a94152',2,2);px(42,45,'#d66069',2,1);
    px(43,45,'#a94152');
    px(17,83,'#a94152');px(18,84,'#c05460');
    if(p===1||p===2)px(44,44,'#f39a9b');
   }else if(id==='dizzy'){
    const p=step(220,4);
    const offsets=[[-1,-1],[1,-1],[1,1],[-1,1]];
    for(const [x,y] of [[10,23],[53,23]]){
     const [dx,dy]=offsets[p];px(x+dx,y+dy,'#b49bea',3,2);
     px(x-dx,y-dy,'#715bc1');px(x,y,'#d8ccff');
    }
   }else if(id==='unconscious'){
    const p=step(440,5),y=18-p;
    // Rising stylized "Z" is an effect, not a replacement eye shape.
    line(50,y,6,'#baa5ea');
    px(52,y+1,'#baa5ea');px(51,y+2,'#baa5ea');
    line(50,y+3,6,'#baa5ea');
    if(p<3){line(56,y-5,3,'rgba(186,165,234,.7)');px(57,y-4,'rgba(186,165,234,.7)');line(56,y-3,3,'rgba(186,165,234,.7)');}
   }else if(id==='sleep_deprived'){
    // Only floating Z; absolutely no eyelid shadow or dark circles.
    const p=step(330,6);
    zed(51,19-(p%3),6);
    if(p<4)zed(57,10-Math.floor(p/2),4);
   }else if(id==='hunger'){
    // Food pictogram in an animated thought balloon.
    thought(2,4,'food',step(520,4)<2?0:1);
   }else if(id==='dehydration'){
    // Water pictogram in an animated thought balloon.
    thought(45,4,'water',step(470,4)<2?0:1);
   }
  }
  ctx.restore();
  return drawn;
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
  version:'2.9.0',poses:POSES,statuses:STATUS_PRESETS,abnormalLabels:ABNORMAL_LABELS,drawSpiralEye,drawFaceSweat,drawAbnormalEffects,createActor
 });
})(window);
