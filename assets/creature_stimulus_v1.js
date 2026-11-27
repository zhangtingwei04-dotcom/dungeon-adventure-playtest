/* 燈火核心：場景互動刺激 V1.0。事件座標是物件，不是玩家位置。 */
(function(root){'use strict';
const profiles=Object.freeze({herb:{noise:.18,duration:320},mushroom:{noise:.24,duration:400},branch:{noise:.56,duration:650},stone:{noise:.72,duration:800},crate:{noise:.87,duration:1050},carriage:{noise:1,duration:1200}});
function create({hearingRange=48,memoryMs=7200,occluded=()=>false}={}){
 let clock=0,serial=0,events=[],memory=null;
 function reset(){clock=0;events=[];memory=null;}
 function emit({kind,position,objectId=null,noise,duration}){const p=profiles[kind];if(!p||![position?.x,position?.z].every(Number.isFinite))throw Error('invalid stimulus');const strength=Math.max(0,Math.min(1,noise??p.noise)),life=duration??p.duration;if(!Number.isFinite(strength)||!Number.isFinite(life)||life<=0)throw Error('invalid intensity');const e={id:++serial,objectId,kind,position:{...position},strength,until:clock+life};events.push(e);if(events.length>32)events.shift();return e.id;}
 function step({dt,pos,obstacles=[]}){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');clock+=dt;events=events.filter(e=>e.until>=clock);if(memory&&clock-memory.at>memoryMs)memory=null;
 let best=null;for(const e of events){const hidden=occluded(pos,e.position,obstacles),d=Math.hypot(pos.x-e.position.x,pos.z-e.position.z),range=hearingRange*e.strength*(hidden?.65:1);if(d>range||range<=0)continue;const score=e.strength*(1-.55*d/range)*(hidden?.8:1);if(!best||score>best.score)best={...e,score,hidden};}
 if(best&&(!memory||best.id===memory.id||best.score>=memory.score||clock-memory.at>1000)){memory={id:best.id,kind:best.kind,position:{...best.position},score:best.score,hidden:best.hidden,at:clock,investigate:best.score>=.32};}
 return memory?{...memory,position:{...memory.position},age:clock-memory.at,heard:!!best,attackAllowed:false}:null;
 }
 return Object.freeze({emit,step,reset});
}
root.DungeonCreatureStimulusV1=Object.freeze({create,profiles});
})(typeof window==='undefined'?globalThis:window);