/* 燈火核心：四足動作取樣 V1。毫秒與骨架本地像素。 */
(function(root){'use strict';
const {clamp,ease}=root.DungeonCreatureRigV1;
const defaults={ground:136,farOffset:[5,3],footBias:{front:5,run:11},tuckBias:[5,-6],fleeDistance:360,gaits:{walk:{period:1000,stance:.75,stride:16,lift:7},trot:{period:510,stance:.58,stride:20,lift:11},run:{period:480,stance:.28,stride:26,lift:19}},jump:{crouch:320,push:470,airEnd:1030,rearDown:1140,end:1500,apex:38,distance:112},attacks:{pounce:{windup:440,push:580,airEnd:1050,rearDown:1170,end:1580,apex:26,distance:130},slam:{windup:510,push:670,airEnd:1320,rearDown:1450,end:1900,apex:48,distance:0}},turnDurations:{'turn-slow':1800,turn:1100,'turn-fast':720,flee:720}};
function create(profile={}){
 const ground=profile.ground??defaults.ground,farOffset=profile.farOffset||defaults.farOffset,footBias={...defaults.footBias,...profile.footBias},tuckBias=profile.tuckBias||defaults.tuckBias,fleeDistance=profile.fleeDistance??defaults.fleeDistance;
 const gaits=Object.freeze(Object.fromEntries(Object.entries(defaults.gaits).map(([k,v])=>[k,Object.freeze({...v,...profile.gaits?.[k]})])));
 const speedOf=g=>g.stride/(g.stance*g.period);
 const turnDurations={...defaults.turnDurations,...profile.turnDurations},turnDuration=m=>turnDurations[m]??turnDurations.turn;
 function limbPhase(l,phase,far,g){
 if(g===gaits.run){const touchdown=l.id==='rear'?(far?.08:0):(far?.48:.40);return (phase-touchdown+1)%1;}
 return (phase+(g===gaits.trot?(l.id==='rear'?.5:0):l.phase)+(far?.5:0))%1;
}
function flightLift(p){if(p>=.36&&p<.40)return .7*Math.sin(Math.PI*(p-.36)/.04)**2;if(p>=.76)return 7*Math.sin(Math.PI*(p-.76)/.24)**2;return 0;}
function gallopBody(p){return {dy:12+2.2*Math.cos(2*Math.PI*(p-.08))-flightLift(p),pitch:.075*Math.sin(2*Math.PI*(p-.14))};}
// A discrete jump: a fixed ground plane and a separate ballistic height.
const jumpTiming={...defaults.jump,...profile.jump};
function jumpState(ms){
 const t=clamp(ms,0,jumpTiming.end),j=jumpTiming;
 if(t<j.crouch){const p=ease(t/j.crouch);return {stage:'屈腿蓄力',height:0,dx:0,dy:5+12*p,pitch:0,frontLift:0,rearLift:0,air:0};}
 if(t<j.push){const p=ease((t-j.crouch)/(j.push-j.crouch));return {stage:'後腿蹬地',height:0,dx:0,dy:17-12*p,pitch:.06*p,frontLift:9*p,rearLift:0,air:0};}
 if(t<j.airEnd){const u=(t-j.push)/(j.airEnd-j.push),height=4*j.apex*u*(1-u);return {stage:u<.5?'上升騰空':'下降準備落地',height,dx:-j.distance*u,dy:5-height,pitch:.06*Math.cos(Math.PI*u),frontLift:9*(1-u)+9*Math.sin(Math.PI*u),rearLift:9*u+10*Math.sin(Math.PI*u),air:u};}
 if(t<j.rearDown){const p=ease((t-j.airEnd)/(j.rearDown-j.airEnd));return {stage:'前足落地緩衝',height:0,dx:-j.distance,dy:5+9*p,pitch:-.06*(1-p),frontLift:0,rearLift:9*(1-p),air:1};}
 const p=ease((t-j.rearDown)/(j.end-j.rearDown));return {stage:p===1?'落地完成':'後足接地・恢復',height:0,dx:-j.distance,dy:14-9*p,pitch:0,frontLift:0,rearLift:0,air:1};
}
// Combat movement uses the approved V13 skin and ground plane, not new art.
const attackProfiles=Object.freeze(Object.fromEntries(Object.entries(defaults.attacks).map(([k,v])=>[k,{...v,...profile.attacks?.[k]}])));
function attackState(mode,ms){
 const j=attackProfiles[mode]||attackProfiles.pounce;
 const t=clamp(ms,0,j.end),base={height:0,dx:0,dy:5,pitch:0,frontLift:0,rearLift:0,air:0,attack:true,impact:false,impactAge:Infinity};
 if(mode==='charge'){const p=ease(ms/440);return {...base,stage:'蓄力警戒',dy:5+12*p,pitch:-.035*p};}
 if(t<j.windup){const p=ease(t/j.windup);return {...base,stage:'屈腿蓄力',dy:5+12*p,pitch:-.035*p};}
 if(t<j.push){const p=ease((t-j.windup)/(j.push-j.windup));return {...base,stage:'後足爆發蹬地',dy:17-12*p,pitch:-.035+.095*p,frontLift:9*p};}
 if(t<j.airEnd){const u=(t-j.push)/(j.airEnd-j.push),height=4*j.apex*u*(1-u);return {...base,stage:u<.5?'騰空撲出':'伸出前肢準備落地',height,dx:-j.distance*u,dy:5-height,pitch:.06*Math.cos(Math.PI*u),frontLift:9*(1-u)+9*Math.sin(Math.PI*u),rearLift:9*u+10*Math.sin(Math.PI*u),air:u};}
 const age=t-j.airEnd;
 if(t<j.rearDown){const p=ease(age/(j.rearDown-j.airEnd));return {...base,stage:'前足著地・衝擊',dx:-j.distance,dy:5+9*p,pitch:-.06*(1-p),rearLift:9*(1-p),air:1,impact:true,impactAge:age};}
 const p=ease((t-j.rearDown)/(j.end-j.rearDown));return {...base,stage:p===1?'恢復完成':'後足接地・恢復',dx:-j.distance,dy:14-9*p,air:1,impactAge:age,impact:age<180};
}
// Reactions are presentation-only and never alter battle state or saved HP.
const reactionModes=['hit','heavy-hit','down','recover'];
function reactionState(mode,ms){
 const t=Math.max(0,ms),base={height:0,dx:0,dy:5,pitch:0,frontLift:0,rearLift:0,air:0,impact:false,impactAge:Infinity,head:0};
 if(mode==='hit'){const p=clamp(t/430,0,1),w=Math.sin(Math.PI*p)**2;return {...base,stage:p===1?'恢復警戒':'輕傷・短暫退縮',dy:5+4*w,pitch:-.055*w,head:-1.4*w};}
 if(mode==='heavy-hit'){const p=clamp(t/900,0,1),w=Math.sin(Math.PI*p)**2;return {...base,stage:p===1?'恢復站姿':'重擊・重心失衡',dy:5+12*w,pitch:-.085*Math.sin(2*Math.PI*p)*Math.sin(Math.PI*p),head:2*w};}
 if(mode==='down'){const p=ease(t/650);return {...base,stage:p===1?'倒地・低伏':'失去支撐・下沉',dy:5+25*p,pitch:-.025*p,head:2*p};}
 const p=ease(t/950);return {...base,stage:p===1?'重新站穩':'支撐四肢・起身',dy:30-25*p,pitch:-.025*(1-p),head:2*(1-p)};
}
function fleeState(ms){
 const duration=turnDuration('flee'),t=Math.max(0,ms-duration),v=speedOf(gaits.run),distance=Math.min(fleeDistance,v*t);
 return {turn:ms<duration,t,phase:(t/gaits.run.period)%1,distance,done:distance>=fleeDistance};
}
function jumpFoot(l,far,state){
 const front=l.id==='front',u=state.air,tuck=Math.sin(Math.PI*u);
 const x=l.foot[0]+(front?footBias.front:0)+(far?farOffset[0]:0)+(front?tuckBias[0]:tuckBias[1])*tuck;
 const y=ground-(far?farOffset[1]:0)-state.height-(front?state.frontLift:state.rearLift);
 return [x,y];
}
function footAt(l,phase,walk,far,g=gaits.walk){
 const p=limbPhase(l,phase,far,g);let x=l.foot[0]+(l.id==='front'?(g===gaits.run?footBias.run:footBias.front):0),y=ground;
 // Four-beat crawl: only one limb swings at a time. During support,
 // local foot motion cancels the body's forward world translation.
 if(walk){if(p<g.stance)x+=-g.stride/2+g.stride*(p/g.stance);else{const t=(p-g.stance)/(1-g.stance);x+=g.stride/2-g.stride*ease(t);y-=g.lift*Math.sin(Math.PI*t)**2;}}
 if(far){x+=farOffset[0];y-=farOffset[1];}return [x,y];
}
function support(l,phase,far,g=gaits.walk){return limbPhase(l,phase,far,g)<g.stance;}
function secondaryMotion(mode,elapsed,phase){
 const cycle=phase*2*Math.PI,breath=Math.sin(elapsed/1000*2*Math.PI/3.4);
 if(reactionModes.includes(mode)){const j=reactionState(mode,elapsed);return {head:j.head,mane:-j.head*.4,tail:j.head*.5,alert:0};}
 if(mode==='run'||mode==='run-in-place'||mode==='flee')return {head:1.8*Math.sin(cycle-.4),mane:1.5*Math.sin(cycle-1.1),tail:2.8*Math.sin(cycle-1),alert:0};
 if(mode==='trot')return {head:1.3*Math.sin(2*cycle-.4),mane:1.1*Math.sin(2*cycle-1.1),tail:2.2*Math.sin(cycle-1),alert:0};
 if(mode==='walk'||mode==='travel')return {head:.85*Math.sin(2*cycle-.4),mane:.65*Math.sin(2*cycle-1.1),tail:1.7*Math.sin(cycle-1.0),alert:0};
 if(mode==='charge'||mode==='pounce'||mode==='slam'){const j=attackState(mode,elapsed),p=ease(elapsed/440),shock=j.impact?Math.sin(j.impactAge/180*Math.PI)*1.1:0;return {head:.9*p-1.8*Math.sin(Math.PI*j.air)+shock,mane:1.3*Math.sin(2*Math.PI*j.air)-shock,tail:2.2*Math.sin(Math.PI*j.air),alert:p};}
 if(mode==='jump'||mode==='jump-up'){const j=jumpState(elapsed);return {head:-1.3*Math.sin(Math.PI*j.air),mane:.9*Math.sin(2*Math.PI*j.air),tail:1.8*Math.sin(Math.PI*j.air),alert:0};}
 if(mode==='rise'){const p=ease(elapsed/850);return {head:-1.5*p*(1-p)*4,mane:.45*Math.sin(Math.PI*p),tail:.8*Math.sin(Math.PI*p),alert:0};}
 if(mode==='alert'){const p=ease(elapsed/500);return {head:-1.8*p,mane:.6*p+.15*breath,tail:-1.3*p+.3*breath,alert:p};}
 return {head:.28*breath,mane:.22*breath,tail:.45*Math.sin(elapsed/1000*2*Math.PI/3.4-.8),alert:0};
}

 return Object.freeze({ground,gaits,speedOf,limbPhase,flightLift,gallopBody,jumpTiming,jumpState,attackProfiles,attackState,reactionModes,reactionState,fleeState,jumpFoot,footAt,support,secondaryMotion,turnDuration});
}
root.DungeonCreatureMotionV1=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);