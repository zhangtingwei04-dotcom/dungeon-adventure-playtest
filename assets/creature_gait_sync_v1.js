/* 燈火核心：距離步態時鐘 V1.1。保留速度及相位的步態轉換。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
function create(referenceGaits,speedCaps,options={}){
 const accelTime=options.accelTime??240,brakeTime=options.brakeTime??200,settleTime=options.settleTime??180,blendTime=options.blendTime??360;
 const specs=Object.freeze(Object.fromEntries(Object.entries(referenceGaits).map(([mode,g])=>{const cycle=g.stride/g.stance;if(!(cycle>0&&g.period>0&&g.stance>0&&g.stance<=1))throw Error('invalid gait');return [mode,Object.freeze({cycle,period:g.period,target:Math.min(cycle*1000/g.period,speedCaps[mode]??Infinity)})];})));
 let speed=0,cycles=0,mode=null,stopping=false,settle=0,transition=null,rate=0,cycleForStep=1;
 function weights(){if(!mode)return {};if(!transition)return {[mode]:1};const a=ease(transition.elapsed/blendTime),out={};for(const [k,v] of Object.entries(transition.from))out[k]=v*(1-a);out[mode]=(out[mode]||0)+a;return Object.fromEntries(Object.entries(out).filter(([,v])=>v>1e-10));}
 function cycleLength(ws=weights()){return Object.entries(ws).reduce((n,[k,v])=>n+v*specs[k].cycle,0)||1;}
 function reset(){speed=0;cycles=0;mode=null;stopping=false;settle=0;transition=null;rate=0;cycleForStep=1;}
 function start(m){if(!specs[m])throw Error('unknown gait');reset();mode=m;rate=specs[m].target/accelTime;cycleForStep=specs[m].cycle;}
 function switchMode(m){if(!specs[m])throw Error('unknown gait');if(!mode){start(m);return;}if(m===mode&&!stopping)return;
 const from=weights();mode=m;stopping=false;settle=0;transition={from,elapsed:0};rate=Math.abs(specs[m].target-speed)/blendTime;}
 function stop(){if(mode&&!stopping){stopping=true;rate=speed/brakeTime;}}
 function integrate(dt){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');if(!mode)return 0;
 const before=cycleLength(),target=stopping?0:specs[mode].target,ramp=rate>0?Math.min(dt,Math.abs(target-speed)/rate):0,end=speed+Math.sign(target-speed)*rate*ramp,d=(speed+end)*.5*ramp/1000+target*(dt-ramp)/1000;
 speed=ramp<dt?target:end;if(transition){transition.elapsed+=dt;if(transition.elapsed>=blendTime)transition=null;}cycleForStep=(before+cycleLength())*.5;
 if(stopping&&speed<=1e-8){speed=0;settle+=dt-ramp;}return d;}
 function moved(distance){if(!mode)return;if(!Number.isFinite(distance)||distance<0)throw Error('invalid distance');cycles+=distance/cycleForStep;}
 function boundary(){speed=0;stopping=true;settle=0;rate=0;}
 function state(){return {mode,speed,cycles,phase:cycles%1,stopping,settle,weights:weights(),blending:!!transition,weight:stopping&&speed===0?1-clamp(settle/settleTime,0,1):1,done:!!mode&&stopping&&speed===0&&settle>=settleTime};}
 function timeFor(gait){return cycles*gait.period;}
 return Object.freeze({start,switchMode,stop,reset,integrate,moved,boundary,state,timeFor,specs});
}
function blendPoses(items,mixPose){let result=null,total=0;for(const {pose,weight} of items){if(weight<=0)continue;if(!result){result=pose;total=weight;continue;}const a=result,b=pose,u=weight/(total+weight);result={...mixPose(a,b,u),mode:'gait-blend',stage:'步態過渡'};for(const k of ['jaw','head','mane','tail'])result[k]=(a[k]||0)*(1-u)+(b[k]||0)*u;total+=weight;}return result;}
root.DungeonCreatureGaitSyncV1=Object.freeze({create,blendPoses});
})(typeof window==='undefined'?globalThis:window);