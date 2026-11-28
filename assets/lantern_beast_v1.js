/* 燈獸生命週期原型；共用遺物儲能與心火成長，不改正式遊戲。 */
(function(root){'use strict';if(!root.DungeonRelicCoreV1||!root.DungeonMindGrowthV1||!root.DungeonMindCoreV1)throw Error('dependencies required');root.DungeonLanternBeastV1=(function beastCore(c,g,r){
 const types=Object.freeze(["ordinary","hosted","permanent"]),statuses=Object.freeze(["active","dormant","collapsed","dispersed","destroyed"]);
 const whole=(x,min=0,max=1000000)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
 const str=x=>typeof x==="string"&&x.trim().length>0;
 const def=(relics,id)=>{const i=relics.items.find(x=>x.id===id&&!x.consumed);return i?r.catalog.find(d=>d.id===i.defId):null};
 const lookup=(s,id)=>s.beasts.find(b=>b.id===id);
 function valid(s){return !!s&&g.validate(s.owner)&&r.valid(s.relics)&&whole(s.turn,0,Number.MAX_SAFE_INTEGER)&&Array.isArray(s.beasts)&&new Set(s.beasts.map(b=>b?.id)).size===s.beasts.length&&new Set(s.beasts.filter(b=>b?.anchorId&&b.status!=="destroyed").map(b=>b.anchorId)).size===s.beasts.filter(b=>b?.anchorId&&b.status!=="destroyed").length&&s.beasts.every(b=>b&&str(b.id)&&str(b.name)&&str(b.skillId)&&types.includes(b.type)&&statuses.includes(b.status)&&whole(b.upkeep,1)&&whole(b.body,0,100)&&whole(b.integrity,0,100)&&typeof b.awakened==="boolean"&&typeof b.companion==="boolean"&&(b.type==="ordinary"?b.anchorId===null:str(b.anchorId)&&!!def(s.relics,b.anchorId))&&(b.awakened?g.validate(b.self):b.self===null))}
 function requireState(s){if(!valid(s))throw Error("INVALID_BEAST_STATE")}
 function create(owner,relics){const s={schema:1,owner,relics,turn:0,beasts:[]};requireState(s);return s}
 function fail(state,reason){return {ok:false,state,reason}}
 function change(s,b,patch){return {...s,beasts:s.beasts.map(x=>x.id===b.id?{...x,...patch}:x)}}
 function createBeast(s,profile,{id,name,skillId,type,anchorId=null,upkeep=5,initialCost=5}){
  requireState(s);
  if(!str(id)||!str(name)||!types.includes(type)||!whole(upkeep,1)||!whole(initialCost,1)||lookup(s,id))return fail(s,"INVALID_CREATION");
  const skill=profile?.skills?.find(x=>x.id===skillId);
  if(!skill)return fail(s,"SKILL_NOT_OWNED");
  const v=c.validateSkill({...profile,skills:profile.skills.filter(x=>x.id!==skillId)},skill);
  if(!v.ok||!skill.allocations.some(a=>a.phase==="影"&&a.branch==="形")||!skill.allocations.some(a=>a.phase==="續"&&a.branch==="循"))return fail(s,"REQUIRES_SHAPE_AND_CYCLE");
  if(s.owner.energy<initialCost||s.owner.abilities.output<initialCost)return fail(s,"OWNER_ENERGY_OR_OUTPUT");
  if(type==="ordinary"){if(anchorId!==null)return fail(s,"UNEXPECTED_ANCHOR")}
  else{
   const d=def(s.relics,anchorId);
   if(!d||!d.abilities.some(a=>a.kind==="beastAnchor")||s.beasts.some(b=>b.anchorId===anchorId))return fail(s,"INVALID_OR_BOUND_ANCHOR");
   if(type==="hosted"&&d.energy.source!=="stored"||type==="permanent"&&d.energy.source!=="external")return fail(s,"WRONG_ANCHOR_SOURCE");
  }
  const b={id,name,skillId,type,anchorId,upkeep,body:100,integrity:100,status:"active",awakened:false,self:null,companion:true};
  return {ok:true,state:{...s,owner:{...s.owner,energy:s.owner.energy-initialCost},beasts:[...s.beasts,b]}};
 }
 function tick(s,{ownerAvailable=true,ownerBudget=s.owner.abilities.output}={}){
  requireState(s);if(typeof ownerAvailable!=="boolean"||!Number.isFinite(ownerBudget)||ownerBudget<0||ownerBudget>s.owner.abilities.output||s.turn===Number.MAX_SAFE_INTEGER)throw Error("INVALID_TICK");
  let next={...s,turn:s.turn+1},events=[],budget=ownerBudget;
  for(const b of s.beasts){
   if(b.status!=="active")continue;
   let funded=false;
   if(b.awakened){if(b.self.energy>=b.upkeep){next=change(next,b,{self:{...b.self,energy:b.self.energy-b.upkeep}});funded=true}}
   else if(b.type==="ordinary"){if(ownerAvailable&&next.owner.energy>=b.upkeep&&budget>=b.upkeep){next={...next,owner:{...next.owner,energy:next.owner.energy-b.upkeep}};budget-=b.upkeep;funded=true}}
   else{const x=r.supply(next.relics,b.anchorId,b.upkeep);if(x.ok){next={...next,relics:x.state};funded=true}}
   if(!funded){const status=b.type==="ordinary"&&!b.awakened?"dispersed":"dormant";next=change(next,lookup(next,b.id),{status});events.push({id:b.id,type:status})}
   else events.push({id:b.id,type:"maintained",amount:b.upkeep});
  }
  return {state:next,events};
 }
 function damage(s,id,{body=0,core=0}={}){
  requireState(s);const b=lookup(s,id);if(!b||["destroyed","dispersed"].includes(b.status)||!whole(body,0,100)||!whole(core,0,100)||b.type==="ordinary"&&core)return fail(s,"INVALID_DAMAGE");
  const hp=Math.max(0,b.body-body),integrity=Math.max(0,b.integrity-core);
  const status=integrity===0?"destroyed":hp===0?(b.type==="ordinary"?"dispersed":"collapsed"):b.status;
  return {ok:true,state:change(s,b,{body:hp,integrity,status})};
 }
 function repair(s,id,{body=0,core=0,approved=false}={}){
  requireState(s);const b=lookup(s,id);
  if(!b||["destroyed","dispersed"].includes(b.status)||approved!==true||!whole(body,0,100)||!whole(core,0,100)||b.type==="ordinary"&&core)return fail(s,"REPAIR_NOT_AVAILABLE");
  // Authorization is a test hook; actual materials must be debited by a future world event.
  return {ok:true,state:change(s,b,{body:Math.min(100,b.body+body),integrity:Math.min(100,b.integrity+core),status:b.status==="collapsed"&&b.body+body>0?"dormant":b.status})};
 }
 function wake(s,id){
  requireState(s);const b=lookup(s,id);if(!b||b.status!=="dormant"||!b.body||!b.integrity)return fail(s,"CANNOT_WAKE");
  if(b.awakened?b.self.energy<b.upkeep:s.relics.items.find(x=>x.id===b.anchorId)?.energy<b.upkeep)return fail(s,"NO_ENERGY");
  return {ok:true,state:change(s,b,{status:"active"})};
 }
 function awaken(s,id,{approved=false,talents}={}){
  requireState(s);const b=lookup(s,id);if(!b||b.type!=="permanent"||b.awakened||!["active","dormant"].includes(b.status)||approved!==true)return fail(s,"AWAKENING_NOT_AVAILABLE");
  let self;try{self=g.create(talents)}catch{return fail(s,"INVALID_TALENTS")}
  return {ok:true,state:change(s,b,{awakened:true,self:{...self,energy:0},status:"dormant",companion:true})};
 }
 function recoverSelf(s,id,minutes,options={}){
  requireState(s);const b=lookup(s,id);if(!b?.awakened||["destroyed","dispersed"].includes(b.status))return fail(s,"NO_SELF_HEARTFIRE");
  const x=g.recover(b.self,minutes,options);return {ok:true,state:change(s,b,{self:x.state}),recovered:x.recovered};
 }
 function chooseCompanion(s,id,stay,{approved=false}={}){
  requireState(s);const b=lookup(s,id);if(!b?.awakened||typeof stay!=="boolean"||approved!==true||b.status==="destroyed")return fail(s,"INDEPENDENT_CHOICE_REQUIRED");return {ok:true,state:change(s,b,{companion:stay})}
 }
 function supplyExternal(s,id,input){
  requireState(s);const b=lookup(s,id);if(!b||b.type!=="permanent"||b.status==="destroyed"||b.awakened)return fail(s,"NO_EXTERNAL_ANCHOR");
  const x=r.receiveExternal(s.relics,b.anchorId,input);return x.ok?{...x,state:{...s,relics:x.state}}:fail(s,x.reason);
 }
 return Object.freeze({version:"1.0.0",types,statuses,valid,create,createBeast,tick,damage,repair,wake,awaken,recoverSelf,chooseCompanion,supplyExternal});
})(root.DungeonMindCoreV1,root.DungeonMindGrowthV1,root.DungeonRelicCoreV1);if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'lantern.beast',version:'1.0.0',requires:['mind.core','mind.growth','relic.core']});})(window);
