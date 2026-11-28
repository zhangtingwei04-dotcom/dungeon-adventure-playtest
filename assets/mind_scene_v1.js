/* 獨立場景結算原型：使用現有物件與耗時核心；不寫正式存檔。 */
(function(root){'use strict';if(!root.DungeonMindFormV1||!root.DungeonObjectInvestigationV1||!root.DungeonSceneActionTimeV1)throw Error('dependencies required');if(root.DungeonMindSceneV1)throw Error('duplicate mind scene');root.DungeonMindSceneV1=(function worldCore(f,o,t){
 const cells=Object.freeze(Array.from({length:12},(_,i)=>Object.freeze({id:"cell-"+i,x:i%4,y:Math.floor(i/4),blocked:i===5})));
 const objects=Object.freeze([{id:"branch",assetId:"forest4_branch",cell:"cell-1"},{id:"mushroom",assetId:"forest4_mushroom",cell:"cell-7"},{id:"rock",assetId:"forest4_rock_group",cell:"cell-4"}].map(Object.freeze));
 const scene="mind-test-forest",animalDef=Object.freeze({id:"rabbit",assetId:"forest4_rabbit",cell:"cell-2"});
 const cell=id=>cells.find(x=>x.id===id),dist=(a,b)=>Math.abs(cell(a).x-cell(b).x)+Math.abs(cell(a).y-cell(b).y);
 const copy=x=>JSON.parse(JSON.stringify(x)),fail=(state,reason)=>({ok:false,state,reason});
 function create(forms){if(!f.valid(forms)||forms.effects.length||forms.life.beasts.length)throw Error("FRESH_FORM_STATE_REQUIRED");return {schema:1,forms,actor:{worldMinutes:0,objectWorld:{scenes:{}},inventory:{}},positions:{},animal:{...animalDef,perception:null},observations:[],used:[]}}
 function valid(s){return !!s&&f.valid(s.forms)&&Number.isSafeInteger(s.actor?.worldMinutes)&&s.actor.worldMinutes>=0&&s.positions&&cell(s.animal?.cell)&&Array.isArray(s.observations)&&Array.isArray(s.used)}
 function requireState(s){if(!valid(s))throw Error("INVALID_WORLD_STATE")}
 function activate(s,p,skillId,formId,options={}){
  requireState(s);const x=f.activate(s.forms,p,skillId,formId,options);if(!x.ok)return fail(s,x.reason);
  return {ok:true,state:{...s,forms:x.state,positions:{...s.positions,[x.entityId]:"cell-0"}},entityId:x.entityId};
 }
 function action(s,id,action,target){
  requireState(s);const q=f.requestAction(s.forms,id,action,target);if(!q.ok)return fail(s,q.reason);
  if(s.used.includes(id))return fail(s,"ALREADY_ACTED");
  const pos=s.positions[id];if(!cell(pos))return fail(s,"NO_POSITION");
  let next={...s},minutes=0,event;
  if(action==="move"||action==="commandMove"){
   const dest=cell(target);if(!dest||dest.blocked||dist(pos,target)!==1)return fail(s,"INVALID_MOVE");
   next.positions={...s.positions,[id]:target};minutes=t.cost("approach");event={kind:"moved",id,to:target};
  }else if(action==="sense"){
   if(target!==s.animal.id||dist(pos,s.animal.cell)>2)return fail(s,"OUT_OF_RANGE_OR_TARGET");
   const info=o.animalInteraction(s.animal.assetId);if(!info)return fail(s,"NO_OBSERVATION");
   next.observations=[...new Set([...s.observations,s.animal.assetId])];minutes=t.cost("observe");event={kind:"observed",id:target,description:info.observe};
  }else if(action==="useTool"||action==="commandInteract"){
   const obj=objects.find(x=>x.id===target);
   if(!obj||dist(pos,obj.cell)>1)return fail(s,"OUT_OF_RANGE_OR_TARGET");
   const actor=copy(s.actor);const material=o.harvest(actor,scene,obj);if(!material)return fail(s,"NOT_HARVESTABLE");
   actor.inventory[material]=(actor.inventory[material]||0)+1;next.actor=actor;minutes=t.cost(obj.assetId==="forest4_mushroom"?"mushroom":"wood");event={kind:"harvested",id:target,material};
  }else if(action==="alterPerception"){
   if(target!==s.animal.id||dist(pos,s.animal.cell)>2)return fail(s,"OUT_OF_RANGE_OR_TARGET");
   next.animal={...s.animal,perception:{source:id,apparentCell:pos}};minutes=t.cost("observe");event={kind:"perceptionChanged",id:target,actualCell:s.animal.cell,apparentCell:pos};
  }else return fail(s,"NOT_IMPLEMENTED");
  if(!Number.isSafeInteger(s.actor.worldMinutes+minutes))return fail(s,"TIME_OVERFLOW");
  next.actor={...next.actor,worldMinutes:s.actor.worldMinutes+minutes};next.used=[...s.used,id];
  return {ok:true,state:next,event,minutes};
 }
 function clean(s,forms){const live=new Set([...forms.effects.map(e=>e.id),...forms.life.beasts.filter(b=>b.status==="active").map(b=>b.id)]);const positions=Object.fromEntries(Object.entries(s.positions).filter(([id])=>live.has(id)));const animal=s.animal.perception&&!live.has(s.animal.perception.source)?{...s.animal,perception:null}:s.animal;return {...s,forms,positions,animal}}
 function advance(s){requireState(s);const x=f.advance(s.forms);return {ok:true,state:{...clean(s,x.state),used:[]},events:x.events}}
 function release(s,id){requireState(s);const x=f.release(s.forms,id);return x.ok?{ok:true,state:clean(s,x.state)}:fail(s,x.reason)}
 function describe(s){requireState(s);return objects.map(x=>({...x,visible:o.visible(s.actor,scene,x),remaining:o.resource(s.actor,scene,x)?.remaining??null,name:o.get(x.assetId).name}))}
 return Object.freeze({version:"1.0.0",cells,objects,scene,create,valid,activate,action,advance,release,describe});
})(root.DungeonMindFormV1,root.DungeonObjectInvestigationV1,root.DungeonSceneActionTimeV1);if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'mind.scene',version:'1.0.0',requires:['mind.form']});})(window);
