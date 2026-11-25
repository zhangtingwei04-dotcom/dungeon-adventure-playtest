/* Blue forest bird V2: jointed flight and two-foot ground hopping. */
window.DungeonBirdMotion=(function(){
 const W=119,H=95,P=42,CW=W+2*P,CH=H+2*P;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
 const mix=(a,b,t)=>a+(b-a)*t;
 const routes={'v4-bird15':{x:59,y:69},'spawn-bird-2':{x:62,y:68},'spawn-bird-3':{x:76,y:66},'preview-bird-flight':{x:59,y:69}};
 function sample(a,t){
  const g=routes[a.id]||{x:62,y:68},u=((t%27)+27)%27;
  const outFace=g.x>=a.x?1:-1;
  let x=a.x,y=a.y,groundY=g.y,mode='perch',open=0,peck=0,face=outFace,depth=1,hop=0,crouch=0,tuck=0,tail=0,pitch=0,brake=0;
  const flight=(p,fromX,fromY,toX,toY,up)=>{
   const q=ease(p);x=mix(fromX,toX,q);y=mix(fromY,toY,q)-7*Math.sin(Math.PI*q);mode='fly';
   open=.55+.45*Math.min(ease(p/.15),ease((1-p)/.20));face=toX>=fromX?1:-1;
   depth=mix(up?1.08:1,up?1:1.08,q);
   tuck=ease(p/.15)*(1-ease((p-.76)/.24));
   brake=ease((p-.72)/.28);tail=.24*brake;pitch=(up?-.16:.09)*(1-brake)-.23*brake;
  };
  if(u<3.3){mode='perch';peck=.07*Math.sin(u*2);}
  else if(u<3.8){const p=(u-3.3)/.5;mode='prepare';open=ease(p)*.55;crouch=Math.sin(Math.PI*p);pitch=-.08*p;}
  else if(u<7.5){flight((u-3.8)/3.7,a.x,a.y,g.x,g.y,false);}
  else if(u<8.1){const p=(u-7.5)/.6;x=g.x;y=g.y;mode='land';open=.55*(1-ease(p));brake=1-ease(p);tail=.24*brake;crouch=Math.sin(Math.PI*p);pitch=-.23*brake;depth=1.08;}
  else if(u<15.8){
   const q=u-8.1,seq=[0,2.0,4.0],len=.62;let travel=0;
   for(const start of seq){const p=clamp((q-start)/len,0,1);travel+=ease(p);
    if(p>0&&p<1){mode='hop';const air=clamp((p-.17)/.67,0,1);hop=Math.sin(Math.PI*air);crouch=p<.17?Math.sin(Math.PI*p/.17):p>.84?Math.sin(Math.PI*(p-.84)/.16):0;tuck=.48*hop;tail=.09*hop;pitch=-.08*hop;}
   }
   x=g.x+outFace*travel*.72;groundY=g.y+travel*.24;y=groundY-hop*.72;depth=1.08;
   if(mode!=='hop'){mode='forage';const k=q%2;peck=.5+.5*Math.sin(k*7);peck*=ease((k-.62)/.24);if(q>5.8)peck*=1-ease((q-5.8)/1.9);}
  }
  else if(u<16.4){const p=(u-15.8)/.6;x=g.x+outFace*2.16;y=g.y+.72;groundY=y;depth=1.08;face=-outFace;mode='prepare';open=.55*ease(p);crouch=Math.sin(Math.PI*p);pitch=-.08*p;}
  else if(u<20.1){flight((u-16.4)/3.7,g.x+outFace*2.16,g.y+.72,a.x,a.y,true);groundY=g.y+.72;}
  else if(u<20.7){const p=(u-20.1)/.6;mode='land';face=-outFace;open=.55*(1-ease(p));brake=1-ease(p);tail=.24*brake;pitch=-.23*brake;crouch=Math.sin(Math.PI*p);}
  else{mode='perch';face=-outFace;peck=.07*Math.sin((u-20.7)*2);}
  groundY=Math.max(groundY,y);
  const h=Math.max(0,groundY-y),air=mode==='fly'||mode==='prepare'&&h>1;
  return {x,y:groundY,h,visibleY:y,width:a.width*depth,depth,mode,open,peck,face,hop,crouch,tuck,tail,pitch,brake,z:air?29:mode==='perch'||h>10?a.z:6,shadow:mode==='perch'||h>12?0:clamp(1-h*.075,0,1)};
 }
 function wingPose(t,open,brake){
  const phase=(t*5.6)%1,down=phase<.43;
  const p=down?phase/.43:(phase-.43)/.57;
  const stroke=down?mix(-1.05,1.18,ease(p)):mix(1.18,-1.05,ease(p));
  const flex=down?.10:.12+.68*Math.sin(Math.PI*p);
  return {shoulder:stroke*open,elbow:-flex*open,wrist:-flex*.52*open,span:1-flex*.32,fan:brake*.18};
 }
 const rigs=new WeakMap();
 function attach(node){
  const img=node.querySelector('.forest-v4-art img');if(!img)return;
  const can=document.createElement('canvas');can.width=CW;can.height=CH;can.className='bird-rig-canvas';can.setAttribute('aria-hidden','true');
  const ctx=can.getContext('2d');if(!ctx)return;
  const init=()=>{if(!img.naturalWidth||!node.isConnected||rigs.has(node))return;ctx.drawImage(img,P,P,W,H);img.parentElement.appendChild(can);rigs.set(node,{img,ctx,last:-Infinity});node.dataset.birdRig='ready';};
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 // Flight feathers are provisional procedural art, with independent shoulder, elbow and wrist.
 function paintWing(ctx,pose,far){
  ctx.save();ctx.translate(70,39);ctx.rotate(pose.shoulder+(far?-.22:.14));ctx.scale(far?.77:1,far?.79:1);
  const grad=ctx.createLinearGradient(0,0,-34,-46);grad.addColorStop(0,'#31598f');grad.addColorStop(.45,far?'#426da5':'#6799d3');grad.addColorStop(1,'#284a7e');
  ctx.fillStyle=grad;ctx.strokeStyle='#203d66';ctx.lineWidth=1.25;
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(6,-16,-12,-32);ctx.quadraticCurveTo(-28,-35,-33,-16);ctx.quadraticCurveTo(-18,-3,0,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.translate(-12,-29);ctx.rotate(pose.elbow);ctx.scale(1,pose.span);
  ctx.beginPath();ctx.moveTo(3,6);ctx.quadraticCurveTo(-5,-16,-16,-25);ctx.quadraticCurveTo(-29,-25,-31,-11);ctx.lineTo(-19,7);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.translate(-16,-20);ctx.rotate(pose.wrist);
  for(let k=0;k<6;k++){ctx.save();ctx.rotate(-.35+k*(.13+pose.fan*.1));ctx.beginPath();ctx.moveTo(3,9);ctx.quadraticCurveTo(-7,-3,-9,-22+k*1.9);ctx.quadraticCurveTo(-2,-28+k*2,4,-6);ctx.lineTo(8,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  ctx.restore();
 }
 function clipPart(ctx,img,points,pivot,angle,scaleY=1,dx=0,dy=0){
  ctx.save();ctx.translate(pivot[0]+dx,pivot[1]+dy);ctx.rotate(angle);ctx.scale(1,scaleY);ctx.translate(-pivot[0],-pivot[1]);ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(img,0,0,W,H);ctx.restore();
 }
 const bodyPoly=[[0,0],[119,0],[119,73],[97,73],[90,76],[72,75],[60,72],[44,65],[0,59]];
 const tailPoly=[[0,58],[29,45],[58,50],[51,64],[22,77],[0,81]];
 const feetPoly=[[58,70],[98,70],[103,95],[57,95]];
 function render(node,v,t,ms){
  const r=rigs.get(node);if(!r||ms-r.last<32)return;r.last=ms;
  const {ctx,img}=r;ctx.clearRect(0,0,CW,CH);ctx.save();ctx.translate(P,P);
  const pose=wingPose(t,v.open,v.brake);
  const active=v.open>.01||v.hop>0||v.crouch>0||v.peck>.09;
  if(!active){ctx.drawImage(img,0,0,W,H);ctx.restore();return;}
  ctx.translate(67,80);ctx.rotate(v.pitch+.14*v.peck);ctx.translate(-67,-80);
  if(v.open>.01){ctx.save();ctx.globalAlpha=Math.min(1,v.open*2);paintWing(ctx,pose,true);ctx.restore();}
  clipPart(ctx,img,tailPoly,[53,54],-.22*v.tail-.11*v.hop,1+v.tail*.35);
  // Two feet are re-positioned together for hopping; in flight they tuck beneath the belly.
  clipPart(ctx,img,feetPoly,[77,72],-.28*v.tuck,1-.78*v.tuck,0,-3*v.tuck);
  clipPart(ctx,img,bodyPoly,[70,73],0,1-.045*v.crouch,0,2*v.crouch);
  if(v.open>.01){ctx.save();ctx.globalAlpha=Math.min(1,v.open*2);paintWing(ctx,pose,false);ctx.restore();}
  ctx.restore();
 }
 return {sample,attach,render,routes,wingPose};
})();