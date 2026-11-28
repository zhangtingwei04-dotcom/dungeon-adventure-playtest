/* 技能形態執行契約：統一角色能源及燈獸實體，不改正式場景。 */
(function(root){'use strict';if(!root.DungeonLanternBeastV1||!root.DungeonMindCoreV1||!root.DungeonMindGrowthV1)throw Error('dependencies required');if(root.DungeonMindFormV1)throw Error('duplicate mind form');root.DungeonMindFormV1=(function formCore(c,g,b){
 const freeze=x=>{if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x)}return x};
 const forms=freeze([
 {id:"beast",name:"燈獸",requires:[["影","形"],["續","循"]],mode:"entity",actions:["move","sense","attack"],cost:5,upkeep:5},
 {id:"tool",name:"燈器",requires:[["影","形"]],mode:"finite",actions:["useTool"],cost:5,duration:3},
 {id:"zone",name:"燈域",requires:[["光","界"]],mode:"finite",actions:["markArea"],cost:5,duration:3},
 {id:"illusion",name:"幻象",requires:[["影","幻"]],mode:"finite",actions:["alterPerception"],cost:4,duration:2},
 {id:"link",name:"燈鏈",requires:[["續","繫"]],mode:"sustain",actions:["maintainLink"],cost:4,upkeep:2},
 {id:"puppet",name:"燈偶",requires:[["影","形"],["續","繫"]],mode:"sustain",actions:["commandMove","commandInteract"],cost:5,upkeep:3}
 ]);
 const form=id=>forms.find(x=>x.id===id);
 const str=x=>typeof x==="string"&&x.trim().length>0&&x.length<=200;
 const round=n=>Math.round(n*1e6)/1e6;
 const fail=(state,reason)=>({ok:false,state,reason});
 const valid=s=>!!s&&b.valid(s.life)&&Array.isArray(s.effects)&&new Set(s.effects.map(e=>e?.id)).size===s.effects.length&&s.effects.every(e=>{const f=form(e?.formId);return !!f&&f.mode!=="entity"&&str(e.id)&&str(e.skillId)&&str(e.target)&&Number.isFinite(e.power)&&e.power>0&&(f.mode==="finite"?Number.isInteger(e.remaining)&&e.remaining>0&&e.remaining<=f.duration:e.remaining===null)})&&Number.isSafeInteger(s.nextId)&&s.nextId>0;
 function requireState(s){if(!valid(s))throw Error("INVALID_FORM_STATE")}
 function create(owner,relics){return {schema:1,life:b.create(owner,relics),effects:[],nextId:1}}
 function inspect(p,skillId,formId){
  const f=form(formId),s=p?.skills?.find(x=>x.id===skillId);if(!f||!s)return {ok:false,reason:!f?"UNKNOWN_FORM":"SKILL_NOT_OWNED"};
  const v=c.validateSkill({...p,skills:p.skills.filter(x=>x.id!==skillId)},s);
  if(!v.ok)return {ok:false,reason:"INVALID_SKILL",errors:v.errors};
  if(!f.requires.every(([phase,branch])=>s.allocations.some(a=>a.phase===phase&&a.branch===branch)))return {ok:false,reason:"WRONG_BRANCH"};
  return {ok:true,form:f,power:round(f.cost*Math.min(...f.requires.map(([phase])=>v.breakdown.find(x=>x.phase===phase).effective))/100)};
 }
 function activate(s,p,skillId,formId,{target="self",type="ordinary",anchorId=null,name}={}){
  requireState(s);const q=inspect(p,skillId,formId);if(!q.ok)return fail(s,q.reason);
  const f=q.form,owner=s.life.owner;if(!str(target)||q.power<=0||s.nextId===Number.MAX_SAFE_INTEGER)return fail(s,"INVALID_TARGET_OR_POWER");
  if(owner.energy<f.cost||owner.abilities.output<f.cost)return fail(s,"ENERGY_OR_OUTPUT");
  const id="form-"+s.nextId;
  if(f.mode==="entity"){
   const x=b.createBeast(s.life,p,{id,name:name||"燈獸",skillId,type,anchorId,upkeep:f.upkeep,initialCost:f.cost});
   return x.ok?{ok:true,state:{...s,life:x.state,nextId:s.nextId+1},entityId:id,power:q.power}:fail(s,x.reason);
  }
  if(s.effects.some(e=>e.skillId===skillId&&e.formId===formId&&e.target===target))return fail(s,"ALREADY_ACTIVE");
  const e={id,skillId,formId,target,power:q.power,remaining:f.mode==="finite"?f.duration:null};
  return {ok:true,state:{...s,life:{...s.life,owner:{...owner,energy:round(owner.energy-f.cost)}},effects:[...s.effects,e],nextId:s.nextId+1},entityId:id,power:q.power};
 }
 function advance(s,{ownerAvailable=true}={}){
  requireState(s);if(typeof ownerAvailable!=="boolean")throw Error("INVALID_OWNER_AVAILABILITY");
  let budget=ownerAvailable?s.life.owner.abilities.output:0,energy=s.life.owner.energy;const effects=[],events=[];
  // Deterministic provisional priority: existing sustained forms, then beasts in creation order.
  for(const e of s.effects){const f=form(e.formId);
   if(f.mode==="finite"){if(e.remaining>1)effects.push({...e,remaining:e.remaining-1});else events.push({id:e.id,type:"expired"});continue}
   if(budget<f.upkeep||energy<f.upkeep){events.push({id:e.id,type:"ended"});continue}
   budget=round(budget-f.upkeep);energy=round(energy-f.upkeep);effects.push(e);events.push({id:e.id,type:"maintained",cost:f.upkeep});
  }
  const x=b.tick({...s.life,owner:{...s.life.owner,energy}},{ownerAvailable,ownerBudget:budget});
  return {state:{...s,life:x.state,effects},events:[...events,...x.events]};
 }
 function requestAction(s,id,action,target){
  requireState(s);if(!str(target))return fail(s,"INVALID_TARGET");
  const e=s.effects.find(x=>x.id===id),beast=s.life.beasts.find(x=>x.id===id),f=e?form(e.formId):beast?form("beast"):null;
  if(!f||!f.actions.includes(action)||beast&&beast.status!=="active")return fail(s,"ACTION_NOT_AVAILABLE");
  if(beast?.awakened)return fail(s,"INDEPENDENT_CHOICE_REQUIRED");
  // Non-mutating proposal; world adapter must validate targets, range, ownership, action cost and effect.
  return {ok:true,state:s,intent:{entityId:id,formId:f.id,action,target,kind:f.id==="illusion"?"perception":"worldRequest",power:e?.power??null}};
 }
 function release(s,id){requireState(s);if(!s.effects.some(e=>e.id===id))return fail(s,"NOT_ACTIVE_FORM");return {ok:true,state:{...s,effects:s.effects.filter(e=>e.id!==id)}}}
 return freeze({version:"1.0.0",forms,valid,create,inspect,activate,advance,requestAction,release});
})(root.DungeonMindCoreV1,root.DungeonMindGrowthV1,root.DungeonLanternBeastV1);if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'mind.form',version:'1.0.0',requires:['mind.core','mind.growth','lantern.beast']});})(window);
