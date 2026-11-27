/* 燈火核心：八方向轉向 V1.0。只處理方向、計時和踏步銜接，不混合不同方向的圖片。 */
(function(root){'use strict';
const speeds=Object.freeze({slow:450,alert:275,fast:180});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),wrap=n=>((n%8)+8)%8;
function direction(n){if(!Number.isInteger(n))throw Error('direction must be an integer');return wrap(n);}
function plan(from,to,{speed='alert',prefer=1,full=false}={}){
 from=direction(from);to=direction(to);if(!Object.hasOwn(speeds,speed))throw Error('unknown turn speed');
 let steps=wrap(to-from);if(steps>4)steps-=8;if(steps===4&&prefer<0)steps=-4;if(full){if(to!==from)throw Error('full turn must end at start');steps=prefer<0?-8:8;}
 const route=Array.from({length:Math.abs(steps)+1},(_,i)=>wrap(from+Math.sign(steps)*i));
 return Object.freeze({from,to,steps,route:Object.freeze(route),stepMs:speeds[speed],duration:Math.abs(steps)*speeds[speed]});
}
function sample(p,ms){if(!Number.isFinite(ms))throw Error('invalid elapsed');const t=clamp(ms,0,p.duration),u=t/p.stepMs,index=Math.min(p.route.length-1,Math.floor(u+.5)),progress=p.duration?t/p.duration:1;
 return {direction:p.route[index],heading:((p.from+Math.sign(p.steps)*u)*45+360)%360,elapsed:t,progress,done:t>=p.duration,stepTime:u*500,weight:Math.min(1,t/120,(p.duration-t)/120)};
}
function mixPose(neutral,step,w){
 w=clamp(w,0,1);if(w===0)return neutral;if(w===1)return {...step,dx:0,mode:'turn-step'};
 const lerp=(a,b)=>a+(b-a)*w,point=(a,b)=>a.map((v,i)=>lerp(v,b[i]));
 return {...step,mode:'turn-step',dx:0,height:lerp(neutral.height,step.height),dy:lerp(neutral.dy,step.dy),pitch:lerp(neutral.pitch,step.pitch),legs:neutral.legs.map((a,i)=>{const b=step.legs[i];if(!b||a.key!==b.key||a.rows.length!==b.rows.length)throw Error('pose mismatch');return {...b,hip:point(a.hip,b.hip),knee:point(a.knee,b.knee),ankle:point(a.ankle,b.ankle),foot:point(a.foot,b.foot),rows:a.rows.map((r,j)=>({y:r.y,t:lerp(r.t,b.rows[j].t),dx:lerp(r.dx,b.rows[j].dx)}))};})};
}
// Resolve a single locomotion transition. Never launch an attack before braking and turning finish.
function transition({mode,desiredMode,angle,desiredDirection,turning=false,stopping=false,restWeight=0}){
 const moving=['walk','trot','run'].includes(mode),wantsMove=['walk','trot','run'].includes(desiredMode);
 if(turning){if(moving&&!wantsMove&&!stopping)return {kind:'brake'};return {kind:'wait'};}
 if(moving&&!wantsMove)return {kind:stopping?'wait':'brake'};
 if(moving&&stopping)return {kind:'wait'};
 if(mode==='rest'&&(desiredMode!=='rest'||angle!==desiredDirection)&&restWeight>.001)return {kind:'set',mode:'rise'};
 if(mode==='rise'&&restWeight>.001)return {kind:'wait'};
 if(angle!==desiredDirection)return {kind:'turn',direction:desiredDirection};
 if(mode!==desiredMode)return {kind:'set',mode:desiredMode};
 return {kind:'wait'};
}
root.DungeonCreatureDirectionV1=Object.freeze({plan,sample,mixPose,speeds,transition});
})(typeof window==='undefined'?globalThis:window);