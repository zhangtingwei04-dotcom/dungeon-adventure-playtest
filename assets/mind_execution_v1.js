/* Independent mind effect execution prototype; no live battle or save mutation. */
(function(root){'use strict';if(!root.DungeonMindCoreV1)throw Error('mind.core required');if(root.DungeonMindExecutionV1)throw Error('duplicate mind execution');root.DungeonMindExecutionV1=(function makeExecution(c){
 'use strict';
 const templates=Object.freeze([
  Object.freeze({id:"reinforce",name:"自身強化",mode:"instant",requires:["燈"],target:"self"}),
  Object.freeze({id:"release",name:"外展衝擊",mode:"instant",requires:["光"],target:"other"}),
  Object.freeze({id:"transform",name:"能量轉化",mode:"instant",requires:["熱"],target:"other"}),
  Object.freeze({id:"residue",name:"殘留印記",mode:"finite",requires:["餘"],target:"other"}),
  Object.freeze({id:"construct",name:"短暫形體",mode:"finite",requires:["影"],target:"self"}),
  Object.freeze({id:"suppress",name:"力量抑制",mode:"finite",requires:["滅"],target:"other"}),
  Object.freeze({id:"link",name:"維持連結",mode:"sustain",requires:["續"],target:"other"}),
  Object.freeze({id:"beast",name:"燈獸形體",mode:"sustain",requires:["影","續"],target:"self"})
 ]);
 const byId=id=>templates.find(t=>t.id===id);
 const positive=n=>Number.isFinite(n)&&n>0&&n<=1e6;
 const validState=s=>s&&Number.isFinite(s.energy)&&s.energy>=0&&s.energy<=s.capacity&&positive(s.capacity)&&Number.isSafeInteger(s.turn)&&s.turn>=0&&Number.isSafeInteger(s.nextId)&&s.nextId>0&&Array.isArray(s.active);
 const round=n=>Math.round(n*1e8)/1e8;
 function createState(capacity=100){if(!positive(capacity))throw Error("INVALID_CAPACITY");return {capacity,energy:capacity,turn:0,nextId:1,active:[]}}
 function inspect(profile,skillId,templateId){
  const t=byId(templateId),s=profile?.skills?.find(x=>x.id===skillId);
  if(!s||!t)return {ok:false,reason:!s?"SKILL_NOT_OWNED":"UNKNOWN_EFFECT"};
  const v=c.validateSkill({...profile,skills:profile.skills.filter(x=>x.id!==s.id)},s);
  if(!v.ok)return {ok:false,reason:"INVALID_SKILL",errors:v.errors};
  if(!t.requires.every(p=>v.breakdown.some(a=>a.phase===p&&a.effective>0)))return {ok:false,reason:"MISSING_EFFECT_PHASE"};
  return {ok:true,template:t,skill:s,validation:v};
 }
 function compatible(profile,skillId){return templates.filter(t=>inspect(profile,skillId,t.id).ok)}
 function power(v,template,cost){return round(Math.min(...template.requires.map(p=>v.breakdown.find(a=>a.phase===p).effective))*cost/100)}
 function activate(state,profile,skillId,templateId,{cost=20,upkeep=5,duration=3}={}){
  if(!validState(state))return {ok:false,reason:"INVALID_STATE",state};
  const q=inspect(profile,skillId,templateId);if(!q.ok)return {...q,state};
  const t=q.template;
  if(!positive(cost)||cost>state.energy)return {ok:false,reason:"INSUFFICIENT_OR_INVALID_ENERGY",state};
  if(t.mode==="sustain"&&!positive(upkeep))return {ok:false,reason:"INVALID_UPKEEP",state};
  if(t.mode==="finite"&&(!Number.isSafeInteger(duration)||duration<1||duration>100))return {ok:false,reason:"INVALID_DURATION",state};
  if(state.active.some(a=>a.skillId===skillId&&a.templateId===templateId))return {ok:false,reason:"ALREADY_ACTIVE",state};
  const amount=power(q.validation,t,cost);
  if(amount<=0)return {ok:false,reason:"INSUFFICIENT_EFFECT_POWER",state};
  const effect={id:"effect-"+state.nextId,skillId,templateId,mode:t.mode,power:amount,remaining:t.mode==="finite"?duration:null,upkeep:t.mode==="sustain"?upkeep:0,ratios:t.requires.map(p=>({phase:p,effective:q.validation.breakdown.find(a=>a.phase===p).effective}))};
  return {ok:true,state:{...state,energy:round(state.energy-cost),nextId:state.nextId+1,active:t.mode==="instant"?[...state.active]:[...state.active,effect]},events:[{type:"activated",effect}],effect};
 }
 function advance(state){
  if(!validState(state)||state.turn===Number.MAX_SAFE_INTEGER)throw Error("INVALID_STATE");
  let energy=state.energy;const active=[],events=[];
  for(const a of state.active){
   if(a.mode==="sustain"){
    if(energy<a.upkeep){events.push({type:"ended",id:a.id,reason:"ENERGY_DEPLETED"});continue}
    energy=round(energy-a.upkeep);active.push({...a});events.push({type:"maintained",id:a.id,cost:a.upkeep,power:round(Math.min(...a.ratios.map(x=>x.effective))*a.upkeep/100)});
   }else if(a.mode==="finite"){
    if(a.remaining<=1)events.push({type:"ended",id:a.id,reason:"EXPIRED"});else active.push({...a,remaining:a.remaining-1});
   }
  }
  return {state:{...state,energy,turn:state.turn+1,active},events};
 }
 function release(state,id){
  if(!validState(state))throw Error("INVALID_STATE");
  if(!state.active.some(x=>x.id===id))return {ok:false,reason:"NOT_ACTIVE",state};
  return {ok:true,state:{...state,active:state.active.filter(x=>x.id!==id)},events:[{type:"ended",id,reason:"RELEASED"}]};
 }
 return Object.freeze({version:"1.0.0",templates,createState,inspect,compatible,activate,advance,release});
})(root.DungeonMindCoreV1);if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'mind.execution',version:'1.0.0',requires:['mind.core']});})(window);
