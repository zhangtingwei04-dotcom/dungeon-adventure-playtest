/* Blue forest bird V1: authored perch-to-ground routes and lightweight sprite flight. */
window.DungeonBirdMotion=(function(){
 const W=119,H=95,P=42,CW=W+2*P,CH=H+2*P;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
 const mix=(a,b,t)=>a+(b-a)*t;
 const routes={'v4-bird15':{x:59,y:69},'spawn-bird-2':{x:62,y:68},'spawn-bird-3':{x:76,y:66},'preview-bird-flight':{x:59,y:69}};
 function sample(a,t){
  const g=routes[a.id]||{x:62,y:68},u=((t%27)+27)%27;
  let x=a.x,y=a.y,groundY=g.y,mode='perch',open=0,peck=0,face=1,depth=1;
  const flight=(p,fromX,fromY,toX,toY,up)=>{
   const q=ease(p);x=mix(fromX,toX,q);y=mix(fromY,toY,q)-7*Math.sin(Math.PI*q);mode='fly';
   open=Math.min(1,ease(p/.13),ease((1-p)/.13));face=toX>=fromX?1:-1;
   depth=mix(up?1.08:1,up?1:1.08,q);
  };
  if(u<3.3){mode='perch';peck=.08*Math.sin(u*2);}
  else if(u<3.8){mode='prepare';open=ease((u-3.3)/.5)*.55;y-=.25*Math.sin(Math.PI*(u-3.3)/.5);}
  else if(u<7.5){flight((u-3.8)/3.7,a.x,a.y,g.x,g.y,false);}
  else if(u<8.1){x=g.x;y=g.y;mode='land';open=0;depth=1.08;face=g.x>=a.x?1:-1;}
  else if(u<15.8){const q=u-8.1;x=g.x+1.1*ease(q/3);y=g.y+.6*ease(q/3);groundY=y;depth=1.08;face=g.x>=a.x?1:-1;mode='forage';peck=.5+.5*Math.sin(q*5.2);if(q>5)peck*=1-ease((q-5)/2.7);}
  else if(u<16.4){x=g.x+1.1;y=g.y+.6;groundY=y;depth=1.08;face=a.x>=g.x?1:-1;mode='prepare';open=.55*ease((u-15.8)/.6);}
  else if(u<20.1){flight((u-16.4)/3.7,g.x+1.1,g.y+.6,a.x,a.y,true);groundY=g.y+.6;}
  else{mode='perch';peck=.08*Math.sin((u-20.1)*2);}
  groundY=Math.max(groundY,y);
  const h=Math.max(0,groundY-y),air=mode==='fly'||mode==='prepare'&&h>1;
  return {x,y:groundY,h,visibleY:y,width:a.width*depth,depth,mode,open,peck,face,z:air?29:mode==='perch'||h>10?a.z:6,shadow:mode==='perch'||h>12?0:clamp(1-h*.075,0,1)};
 }
 const rigs=new WeakMap();
 function attach(node){
  const img=node.querySelector('.forest-v4-art img');if(!img)return;
  const can=document.createElement('canvas');can.width=CW;can.height=CH;can.className='bird-rig-canvas';can.setAttribute('aria-hidden','true');
  const ctx=can.getContext('2d');if(!ctx)return;
  const init=()=>{if(!img.naturalWidth||!node.isConnected||rigs.has(node))return;ctx.drawImage(img,P,P,W,H);img.parentElement.appendChild(can);rigs.set(node,{img,ctx,last:-Infinity});node.dataset.birdRig='ready';};
  if(img.complete&&img.naturalWidth)queueMicrotask(init);else img.addEventListener('load',init,{once:true});
 }
 function paintWing(ctx,img,angle,far,open){
  ctx.save();ctx.translate(70,39);ctx.rotate(angle);ctx.scale(1,far?.76:1);
  // Extend the original blue feather palette with a provisional flight-wing silhouette.
  const grad=ctx.createLinearGradient(0,0,-34,-53);grad.addColorStop(0,'#325b98');grad.addColorStop(.5,far?'#406b9e':'#6695d0');grad.addColorStop(1,'#284a7e');
  ctx.fillStyle=grad;ctx.strokeStyle='#203d66';ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(3,-15,-4,-39,-22,-57);ctx.lineTo(-26,-62);ctx.lineTo(-28,-45);ctx.lineTo(-34,-58);ctx.lineTo(-37,-40);ctx.lineTo(-43,-48);ctx.lineTo(-43,-29);ctx.lineTo(-49,-35);ctx.lineTo(-45,-17);ctx.quadraticCurveTo(-25,-3,0,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(29,60,105,.65)';ctx.lineWidth=1.1;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-10,-7);ctx.quadraticCurveTo(-24,-21,-25-i*5,-45+i*3);ctx.stroke();}
  ctx.restore();
 }
 function render(node,v,t,ms){
  const r=rigs.get(node);if(!r||ms-r.last<32)return;r.last=ms;
  const {ctx,img}=r;ctx.clearRect(0,0,CW,CH);ctx.save();ctx.translate(P,P);
  const flap=Math.sin(t*Math.PI*2*4.2),open=v.open;
  if(open>.01){ctx.save();ctx.globalAlpha=open*.9;paintWing(ctx,img,-.4+flap*.55,true,open);ctx.restore();}
  ctx.save();if(v.mode==='fly'){ctx.translate(62,51);ctx.rotate(.08*Math.sin(t*10));ctx.translate(-62,-51);}
  else if(v.mode==='forage'){ctx.translate(67,87);ctx.rotate(.22*v.peck);ctx.translate(-67,-87);}
  else if(v.mode==='perch'){ctx.translate(63,87);ctx.rotate(.025*v.peck);ctx.translate(-63,-87);}
  ctx.drawImage(img,0,0,W,H);ctx.restore();
  if(open>.01){ctx.save();ctx.globalAlpha=open;paintWing(ctx,img,.55-flap*.85,false,open);ctx.restore();}
  ctx.restore();
 }
 return {sample,attach,render,routes};
})();