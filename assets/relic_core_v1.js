/* 遺物核心：獨立原型，真實定義與研究紀錄分離，不改正式遊戲。 */
(function(root){'use strict';if(!root.DungeonMindCoreV1||!root.DungeonMindGrowthV1)throw Error('mind core and growth required');if(root.DungeonRelicCoreV1)throw Error('duplicate relic core');root.DungeonRelicCoreV1=(function relicCore(c,g){
 const freeze=x=>{if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x)}return x};
 const origins=freeze(["自然","人造","意志","異常","生物"]),forms=freeze(["物件","心象造物","地域","能量","附著"]);
 const fields=freeze(["name","origin","form","phases","abilities","energy","constraints","history"]);
 const catalog=freeze([
 {id:"demo-ring",name:"長明之戒",origin:"人造",form:"物件",phases:["續"],abilities:[{kind:"boost",stat:"recovery",amount:0.1}],energy:{capacity:0,source:"none"},constraints:[],history:"測試樣本"},
 {id:"demo-seed",name:"初生之種",origin:"生物",form:"物件",phases:["燈"],abilities:[{kind:"talent",stat:"control",amount:2}],energy:{capacity:0,source:"none"},constraints:["一次性改質"],history:"測試樣本"},
 {id:"demo-crystal",name:"餘燼結晶",origin:"自然",form:"物件",phases:["餘"],abilities:[{kind:"storage"},{kind:"memory"}],energy:{capacity:60,source:"stored"},constraints:["有限儲能"],history:"測試樣本"},
 {id:"demo-core",name:"無眠之核",origin:"人造",form:"物件",phases:["餘","續"],abilities:[{kind:"storage"},{kind:"memory"},{kind:"beastAnchor"}],energy:{capacity:100,source:"external",efficiency:0.8},constraints:["獨立隔離媒介","需外部供能"],history:"測試樣本；對立相分隔，非持有者兼修"},
 {id:"demo-dormant-anchor",name:"不熄之種",origin:"人造",form:"物件",phases:["餘"],abilities:[{kind:"storage"},{kind:"memory"},{kind:"beastAnchor"}],energy:{capacity:60,source:"stored"},constraints:["有限儲能","獨立記憶媒介"],history:"寄宿型燈獸測試樣本"},
 {id:"demo-gate",name:"守望城門",origin:"意志",form:"地域",phases:["餘"],abilities:[{kind:"memory"}],energy:{capacity:0,source:"none"},constraints:["非攜帶型"],history:"死後心象測試樣本"}
 ]);
 const get=id=>catalog.find(x=>x.id===id);
 const whole=n=>Number.isSafeInteger(n)&&n>=0;
 const amount=n=>whole(n)&&n>0;
 const round=n=>Math.round(n*1e6)/1e6;
 const str=x=>typeof x==="string"&&x.trim().length>0;
 function valid(s){
  return !!s&&Array.isArray(s.items)&&new Set(s.items.map(i=>i?.id)).size===s.items.length&&s.items.every(i=>{
   const d=get(i?.defId);return !!d&&str(i.id)&&whole(i.energy)&&i.energy<=d.energy.capacity&&typeof i.consumed==="boolean"&&(!i.consumed||i.energy===0)&&Array.isArray(i.known)&&new Set(i.known).size===i.known.length&&i.known.every(k=>fields.includes(k));
  })&&Array.isArray(s.equipped)&&new Set(s.equipped).size===s.equipped.length&&s.equipped.every(id=>s.items.some(i=>i.id===id&&!i.consumed&&get(i.defId).form==="物件"&&get(i.defId).abilities.some(a=>a.kind==="boost")));
 }
 const create=()=>({schema:1,items:[],equipped:[]});
 function requireState(s){if(!valid(s))throw Error("INVALID_RELIC_STATE")}
 function fail(state,reason,extra={}){return {ok:false,state,reason,...extra}}
 function find(s,id){requireState(s);return s.items.find(i=>i.id===id&&!i.consumed)}
 function change(s,i,patch){return {...s,items:s.items.map(x=>x.id===i.id?{...x,...patch}:x)}}
 function acquire(s,defId,id,initialEnergy=0){requireState(s);const d=get(defId);if(!d||!str(id)||s.items.some(i=>i.id===id)||!whole(initialEnergy)||initialEnergy>d.energy.capacity)throw Error("INVALID_ACQUISITION");return {...s,items:[...s.items,{id,defId,energy:initialEnergy,consumed:false,known:["form"]}]}}
 function research(s,id,keys){const i=find(s,id);if(!i||!Array.isArray(keys)||keys.some(k=>!fields.includes(k)))throw Error("INVALID_RESEARCH");return change(s,i,{known:[...new Set([...i.known,...keys])]})}
 function visible(s,id){const i=find(s,id);if(!i)return null;const d=get(i.defId),result={id,known:[...i.known]};for(const k of i.known)result[k]=k==="energy"?{...d.energy,stored:i.energy}:d[k];return result}
 // Direct personal use only, independent external media handled separately.
 function compatible(profile,d){return c.validateProfile(profile).ok&&d.phases.every(p=>p==="燈"||profile.phases.includes(p))}
 function equip(s,id,p){const i=find(s,id);if(!i)return fail(s,"NOT_OWNED");const d=get(i.defId);if(!d.abilities.some(a=>a.kind==="boost")||d.form!=="物件")return fail(s,"NOT_EQUIPPABLE");if(!compatible(p,d))return fail(s,"INCOMPATIBLE_PHASE");if(s.equipped.includes(id))return {ok:true,state:s};return {ok:true,state:{...s,equipped:[...s.equipped,id]}}}
 function unequip(s,id){requireState(s);return {...s,equipped:s.equipped.filter(x=>x!==id)}}
 function effective(s,p,actor){requireState(s);if(!g.validate(actor))throw Error("INVALID_ACTOR");const bonuses=Object.fromEntries(g.stats.map(k=>[k,0]));for(const id of s.equipped){const d=get(find(s,id).defId);if(compatible(p,d))for(const a of d.abilities)if(a.kind==="boost")bonuses[a.stat]=round(bonuses[a.stat]+a.amount)}return {base:{...actor.abilities},bonuses,values:Object.fromEntries(g.stats.map(k=>[k,round(actor.abilities[k]+bonuses[k])]))}}
 function modify(s,id,p,actor){const i=find(s,id);if(!g.validate(actor))return fail(s,"INVALID_ACTOR",{actor});if(!i)return fail(s,"NOT_OWNED",{actor});const d=get(i.defId),a=d.abilities.find(a=>a.kind==="talent");if(!a||!compatible(p,d))return fail(s,"INCOMPATIBLE_OR_NO_MODIFIER",{actor});const next={...actor,modifiers:{...actor.modifiers,[a.stat]:actor.modifiers[a.stat]+a.amount}};if(!g.validate(next))return fail(s,"INVALID_MODIFIER",{actor});return {ok:true,state:change(s,i,{consumed:true,energy:0}),actor:next}}
 function transfer(s,id,p,actor,units,direction){
  const i=find(s,id);if(!i||!g.validate(actor)||!amount(units))return fail(s,"INVALID_TRANSFER",{actor});const d=get(i.defId);if(!d.abilities.some(a=>a.kind==="storage")||!compatible(p,d))return fail(s,"INCOMPATIBLE_STORAGE",{actor});
  if(direction==="deposit"){if(actor.energy<units||i.energy+units>d.energy.capacity)return fail(s,"INSUFFICIENT_OR_FULL",{actor});return {ok:true,state:change(s,i,{energy:i.energy+units}),actor:{...actor,energy:round(actor.energy-units)}}}
  if(direction==="withdraw"){if(i.energy<units||actor.energy+units>actor.abilities.capacity)return fail(s,"INSUFFICIENT_OR_FULL",{actor});return {ok:true,state:change(s,i,{energy:i.energy-units}),actor:{...actor,energy:round(actor.energy+units)}}}
  return fail(s,"INVALID_DIRECTION",{actor})
 }
 // Caller must own and debit verified external source; this method does not create a source or a clock.
 function receiveExternal(s,id,input){const i=find(s,id);if(!i||!amount(input))return fail(s,"INVALID_INPUT");const d=get(i.defId);if(d.energy.source!=="external")return fail(s,"NO_EXTERNAL_INPUT");const added=Math.min(d.energy.capacity-i.energy,Math.floor(input*d.energy.efficiency));return {ok:true,state:change(s,i,{energy:i.energy+added}),input,added,loss:input-added}}
 function supply(s,id,units){const i=find(s,id);if(!i||!amount(units)||!get(i.defId).abilities.some(a=>a.kind==="beastAnchor")||i.energy<units)return fail(s,"INSUFFICIENT_OR_NO_ANCHOR");return {ok:true,state:change(s,i,{energy:i.energy-units}),supplied:units}}
 return freeze({version:"1.0.0",origins,forms,fields,catalog,create,valid,acquire,research,visible,compatible,equip,unequip,effective,modify,transfer,receiveExternal,supply});
})(root.DungeonMindCoreV1,root.DungeonMindGrowthV1);if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'relic.core',version:'1.0.0',requires:['mind.core','mind.growth']});})(window);
