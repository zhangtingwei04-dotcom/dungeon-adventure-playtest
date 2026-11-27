/* 燈火玩家普通攻擊演出候選：第一人稱、無武器假設、無傷害規則。 */
(function(root){'use strict';
const timing=Object.freeze({duration:700,impact:280,hold:55});
const clamp=n=>Math.max(0,Math.min(1,n)),ease=u=>u*u*(3-2*u),mix=(a,b,u)=>a+(b-a)*u;
function sample(age){const t=Math.max(0,Math.min(timing.duration,age));const swing=clamp((t-160)/180),flash=clamp((t-timing.impact)/180);
 return {swing:ease(swing),trail:t>=160&&t<365?Math.sin(Math.PI*clamp((t-160)/205))*.9:0,contact:t>=timing.impact&&t<460?(1-flash)**2:0,reactionAge:Math.max(0,t-timing.impact),done:t>=timing.duration};}
function draw(ctx,age,{x,y,scale=1}){
 const p=sample(age);if(!p.trail&&!p.contact)return;
 // Neutral strike arc aimed at the selected actor, not a sword asset or invented equipped item.
 const w=Math.max(26,Math.min(62,62*scale)),h=w*.62;
 ctx.save();ctx.translate(x,y);ctx.lineCap='round';
 if(p.trail){const u=p.swing,a=-1.4+2.7*u;
 ctx.globalAlpha=p.trail*.7;ctx.strokeStyle='#dfd5b9';ctx.lineWidth=3.2;
 ctx.beginPath();ctx.ellipse(0,0,w,h,-.55,a-.85,a);ctx.stroke();
 ctx.globalAlpha=p.trail;ctx.strokeStyle='#fff0cf';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.ellipse(0,0,w,h,-.55,a-.58,a);ctx.stroke();}
 if(p.contact){ctx.globalAlpha=p.contact*.8;ctx.strokeStyle='#fff0cf';ctx.lineWidth=1.4;for(let i=0;i<5;i++){const a=i*Math.PI*2/5+.3,r=5+13*(1-p.contact);ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+7*p.contact),Math.sin(a)*(r+7*p.contact));ctx.stroke();}}
 ctx.restore();
}
root.DungeonPlayerAttackV1=Object.freeze({timing,sample,draw});
})(typeof window==='undefined'?globalThis:window);
