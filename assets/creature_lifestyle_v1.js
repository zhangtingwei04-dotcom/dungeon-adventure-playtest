/* 燈火核心：生物生活習性 V1.0。食性、時段、資源、棲地及生活行動。 */
(function(root){'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const times=['day','dawn','dusk','night'];
function profile(opts={}){const p={diet:['fruit','fungus'],habitats:['forest'],activity:{day:.7,dawn:1,dusk:1,night:.65},thirstRate:.007,foodThreshold:.65,waterThreshold:.6,searchRange:85,...opts};p.diet=Object.freeze([...p.diet]);p.habitats=Object.freeze([...p.habitats]);p.activity=Object.freeze({...p.activity});for(const k of times)if(!Number.isFinite(p.activity[k])||p.activity[k]<0||p.activity[k]>1)throw Error('invalid activity');for(const k of ['thirstRate','foodThreshold','waterThreshold','searchRange'])if(!Number.isFinite(p[k])||p[k]<0)throw Error('invalid lifestyle');if(p.foodThreshold>1||p.waterThreshold>1)throw Error('invalid threshold');return Object.freeze(p);}
function createResources(entries=[]){const map=new Map();function register(r){if(!r.id||map.has(r.id)||!['food','water','shelter'].includes(r.type)||![r.x,r.z,r.amount??1].every(Number.isFinite)||(r.amount??1)<0)throw Error('invalid resource');map.set(r.id,{...r,amount:r.amount??1});}entries.forEach(register);
 function list(){return [...map.values()].map(r=>({...r}));}
 function use(id,amount){const r=map.get(id);if(!r||!Number.isFinite(amount)||amount<0)return 0;const used=Math.min(r.amount,amount);if(r.type==='food')r.amount-=used;return used;}
 return Object.freeze({register,list,use});}
function create(species=profile(),resources=createResources(),initial={}){
 let thirst=clamp(initial.thirst??.25),goal=null,actionTime=0;
 function adjust(v){if(!Number.isFinite(v))throw Error('invalid thirst');thirst=clamp(v);}
 function reset(){thirst=clamp(initial.thirst??.25);goal=null;actionTime=0;}
 function step({dt,pos,mode,needs,environment={},habitat='forest',interrupted=false,settled=false,allowedToAct=false}){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');const sec=dt/1000;
 thirst=clamp(thirst+sec*species.thirstRate*(mode==='run'?2:mode==='trot'?1.5:1));const activity=(species.activity[environment.time??'day']??1)*(species.habitats.includes(habitat)?1:.65);
 const all=resources.list().filter(r=>r.amount>0);const want=needs.fatigue>=.82?'shelter':thirst>=species.waterThreshold?'water':needs.hunger>=species.foodThreshold?'food':activity<.4?'shelter':null;
 if(interrupted||!want){goal=null;actionTime=0;return {thirst,activity,intent:null,hungerRelief:0};}
 const valid=r=>r.type===want&&(want!=='food'||species.diet.includes(r.foodKind))&&dist(pos,r)<=species.searchRange;
 let r=all.find(r=>r.id===goal&&valid(r));if(!r){r=all.filter(valid).sort((a,b)=>dist(pos,a)-dist(pos,b)||a.id.localeCompare(b.id))[0];goal=r?.id??null;actionTime=0;}
 if(!r)return {thirst,activity,intent:{kind:'seek-'+want,point:null},hungerRelief:0};
 const close=dist(pos,r)<=7;let relief=0;
 if(close&&settled&&allowedToAct){actionTime+=dt;if(want==='water'){thirst=clamp(thirst-resources.use(r.id,sec*.22));}else if(want==='food'){relief=resources.use(r.id,Math.min(needs.hunger,sec*.18));}}
 else actionTime=0;
 return {thirst,activity,intent:{kind:close?(want==='food'?'eat':want==='water'?'drink':'shelter-rest'):'seek-'+want,point:{x:r.x,z:r.z},id:r.id},hungerRelief:relief};
 }
 return Object.freeze({step,adjust,reset,state:()=>({thirst,goal}),species});
}
root.DungeonCreatureLifestyleV1=Object.freeze({profile,createResources,create});
})(typeof window==='undefined'?globalThis:window);