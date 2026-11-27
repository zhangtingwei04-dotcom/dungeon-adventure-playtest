/* 燈火核心：場景互動刺激 V1.1。物件聲響、氣味殘留與風向。 */
(function(root){'use strict';
const registry=root.DungeonObjectStimulusCatalogV1?.registry;if(!registry)throw Error('load object stimulus catalog first');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function scentAt(e,pos,clock,wind,range){
 const life=e.scentUntil-e.at,age=clock-e.at+(e.washAge||0);if(life<=0||age>=life||e.scent<=0)return 0;
 const strength=e.scent*(1-age/life),dx=pos.x-e.position.x,dz=pos.z-e.position.z,d=Math.hypot(dx,dz),speed=clamp(wind?.speed||0,0,1),a=(wind?.direction||0)*Math.PI/4;
 const along=dx*Math.sin(a)+dz*Math.cos(a),cross=Math.abs(dx*Math.cos(a)-dz*Math.sin(a)),radius=range*strength;
 const travel=radius*(1+1.1*speed),back=radius*(1-.72*speed),width=radius*(1-.45*speed);
 const u=Math.hypot(along/(along>=0?travel:back),cross/width);if(u>=1)return 0;
 return strength*(1-.8*u);
}
function create({hearingRange=48,scentRange=34,memoryMs=7200,occluded=()=>false,catalog=registry}={}){
 let clock=0,serial=0,events=[],memory=null;
 function reset(){clock=0;events=[];memory=null;}
 function emit({kind,position,objectId=null,noise,duration,scent,scentMs}){const p=catalog.get(kind);if(!p||![position?.x,position?.z].every(Number.isFinite))throw Error('invalid stimulus');const strength=clamp(noise??p.noise,0,1),life=duration??p.duration,odor=clamp(scent??p.scent,0,1),odorLife=scentMs??p.scentMs;if(![strength,life,odor,odorLife].every(Number.isFinite)||life<=0||odorLife<0)throw Error('invalid intensity');const e={id:++serial,objectId,kind,position:{...position},strength,until:clock+life,scent:odor,scentUntil:clock+odorLife,at:clock};events.push(e);if(events.length>32)events.shift();return e.id;}
 function step({dt,pos,obstacles=[],wind={direction:0,speed:0},environment={}}){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');clock+=dt;for(const e of events)e.washAge=(e.washAge||0)+dt*(environment.wash??0);events=events.filter(e=>Math.max(e.until,e.scentUntil)>=clock);if(memory&&clock-memory.at>memoryMs)memory=null;
 let best=null;for(const e of events){const hidden=occluded(pos,e.position,obstacles),d=Math.hypot(pos.x-e.position.x,pos.z-e.position.z),range=hearingRange*(environment.hearing??1)*e.strength*(hidden?.65:1);
 const sound=clock<=e.until&&range>0&&d<=range?e.strength*(1-.55*d/range)*(hidden?.8:1):0;
 const scent=scentAt(e,pos,clock,wind,scentRange*(environment.scent??1))*(hidden?.85:1);
 const score=Math.max(sound,scent);if(score<.08)continue;const source=sound>=scent?'sound':'scent';
 if(!best||score>best.score)best={...e,score,hidden,source,sound,scent};}
 if(best&&(!memory||best.id===memory.id||best.score>=memory.score||clock-memory.at>1000)){memory={id:best.id,kind:best.kind,position:{...best.position},score:best.score,hidden:best.hidden,at:clock,source:best.source,investigate:best.score>=.32||(memory?.id===best.id&&memory.investigate)};}
 return memory?{...memory,position:{...memory.position},age:clock-memory.at,heard:!!best&&best.sound>=.08,smelled:!!best&&best.scent>=.08,attackAllowed:false}:null;
 }
 return Object.freeze({emit,step,reset});
}
root.DungeonCreatureStimulusV1=Object.freeze({create,get profiles(){return registry.snapshot();},scentAt});
})(typeof window==='undefined'?globalThis:window);