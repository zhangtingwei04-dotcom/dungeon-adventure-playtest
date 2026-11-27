/* 燈火玩家普通攻擊演出 V1.1：第一人稱、無武器假設、不顯示傷害浮字。 */
(function(root){'use strict';
const timing=Object.freeze({duration:820,impact:280,hold:65});
const clamp=n=>Math.max(0,Math.min(1,n)),ease=u=>u*u*(3-2*u);
function sample(age){const t=Math.max(0,Math.min(timing.duration,age)),r=Math.max(0,t-timing.impact),swing=clamp((t-115)/235);
 const hit=t>=timing.impact,flash=hit?1-clamp(r/135):0,number=hit&&r<540?1-ease(clamp((r-340)/200)):0;
 const recoil=hit?ease(clamp(r/80))*(1-ease(clamp((r-80)/300))):0;
 return {swing:ease(swing),trail:t>=115&&t<420?Math.sin(Math.PI*clamp((t-115)/305)):0,contact:flash,number,numberRise:hit?20*ease(clamp(r/540)):0,recoil,reactionAge:r,done:t>=timing.duration};}
function draw(ctx,age,{x,y,scale=1,variant='basic'}){
 const p=sample(age);if(!p.trail&&!p.contact)return;
 const w=Math.max(43,Math.min(86,88*scale)),h=w*(variant==='sweep'?.24:.69);
 ctx.save();ctx.translate(x,y);ctx.lineCap='round';ctx.lineJoin='round';
 if(p.trail){const a=-2.0+3.8*p.swing,rotation=variant==='sweep'?0:-.53;
  for(const [color,width,alpha,length] of [['#92723f',12,.38,1.5],['#e6c77f',7,.9,1.32],['#fff5d9',3.2,1,1.12]]){
   ctx.globalAlpha=p.trail*alpha;ctx.strokeStyle=color;ctx.lineWidth=width*(variant==='heavy'?1.35:1);ctx.beginPath();ctx.ellipse(0,0,w,h,rotation,a-length,a);ctx.stroke();
  }
 }
 if(p.contact){const r=(variant==='heavy'?25:17)*(1+.4*(1-p.contact));ctx.globalAlpha=p.contact;ctx.fillStyle='#f2cf82';ctx.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?r*.25:r;const px=Math.cos(a)*rad,py=Math.sin(a)*rad;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff9e7';ctx.fillRect(-4,-4,8,8);
  ctx.strokeStyle='#fff0ba';ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3+.25,dist=9+16*(1-p.contact);ctx.beginPath();ctx.moveTo(Math.cos(a)*dist,Math.sin(a)*dist);ctx.lineTo(Math.cos(a)*(dist+8*p.contact),Math.sin(a)*(dist+8*p.contact));ctx.stroke();}
 }

 ctx.restore();
}
root.DungeonPlayerAttackV1=Object.freeze({timing,sample,draw});
})(typeof window==='undefined'?globalThis:window);
