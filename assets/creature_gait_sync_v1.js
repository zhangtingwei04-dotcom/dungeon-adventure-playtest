/* 燈火核心：步幅、速度與距離步態時鐘 V1。以實際位移而非牆鐘推進步態。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function create(referenceGaits,speedCaps,options={}){
 const accelTime=options.accelTime??240,brakeTime=options.brakeTime??200,settleTime=options.settleTime??180;
 const specs=Object.freeze(Object.fromEntries(Object.entries(referenceGaits).map(([mode,g])=>{const cycle=g.stride/g.stance;if(!(cycle>0&&g.period>0&&g.stance>0&&g.stance<=1))throw Error('invalid gait');return [mode,Object.freeze({cycle,period:g.period,target:Math.min(cycle*1000/g.period,speedCaps[mode]??Infinity)})];})));
 let speed=0,cycles=0,mode=null,stopping=false,settle=0;
 function reset(){speed=0;cycles=0;mode=null;stopping=false;settle=0;}
 function start(m){if(!specs[m])throw Error('unknown gait');reset();mode=m;}
 function stop(){if(mode)stopping=true;}
 function integrate(dt){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');if(!mode)return 0;const target=stopping?0:specs[mode].target,rate=specs[mode].target/(stopping?brakeTime:accelTime),ramp=Math.min(dt,Math.abs(target-speed)/rate),end=speed+Math.sign(target-speed)*rate*ramp,d=(speed+end)*.5*ramp/1000+target*(dt-ramp)/1000;speed=ramp<dt?target:end;if(stopping&&speed<=1e-8){speed=0;settle+=dt-ramp;}return d;}
 function moved(distance){if(!mode)return;if(!Number.isFinite(distance)||distance<0)throw Error('invalid distance');cycles+=distance/specs[mode].cycle;}
 function boundary(){speed=0;stopping=true;settle=0;}
 function state(){return {mode,speed,cycles,phase:cycles%1,stopping,settle,weight:stopping&&speed===0?1-clamp(settle/settleTime,0,1):1,done:!!mode&&stopping&&speed===0&&settle>=settleTime};}
 function timeFor(gait){return cycles*gait.period;}
 return Object.freeze({start,stop,reset,integrate,moved,boundary,state,timeFor,specs});
}
root.DungeonCreatureGaitSyncV1=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);