/* Shared event and save services. Preserve V1 gameplay payload; version metadata is additive. */
window.DungeonEventsV1=(function(){
 const handlers=new Map(),errors=[],history=[];let serial=0,depth=0;
 function on(type,id,fn){
  if(typeof type!=='string'||typeof id!=='string'||typeof fn!=='function')throw Error('Invalid event subscription');
  if(!handlers.has(type))handlers.set(type,new Map());const set=handlers.get(type);
  if(set.has(id))throw Error('Duplicate event subscriber: '+type+'/'+id);
  set.set(id,fn);return ()=>set.delete(id);
 }
 function emit(type,actor,data={}){
  if(depth>=12){errors.push({type,id:'dispatch',message:'Recursive event limit'});if(errors.length>40)errors.shift();return null;}
  const event=Object.freeze({id:++serial,type,minute:Number.isFinite(actor?.worldMinutes)?actor.worldMinutes:null,scene:actor?.scene||null,data:Object.freeze({...data})});
  history.push({id:event.id,type,minute:event.minute});if(history.length>60)history.shift();
  depth++;
  try{for(const [id,fn] of [...(handlers.get(type)||[])]){try{fn(actor,event);}catch(err){errors.push({type,id,message:String(err?.message||err)});if(errors.length>40)errors.shift();}}}finally{depth--;}
  return event;
 }
 function appendTravel(actor,type,message,thought='',stamp=Date.now()){
  if(!Array.isArray(actor.travelLog))actor.travelLog=[];
  const last=actor.travelLog.at(-1);
  if(last&&last.message===message&&last.scene===actor.scene)return false;
  const entry={type,message,thought,scene:actor.scene,time:stamp};
  actor.travelLog.push(entry);if(actor.travelLog.length>120)actor.travelLog.splice(0,actor.travelLog.length-120);
  emit('travel.recorded',actor,{type,message,thought});return true;
 }
 function updateTravel(actor,patch){
  if(!Array.isArray(actor.travelLog)||!actor.travelLog.length)return false;
  const last=actor.travelLog.at(-1);actor.travelLog[actor.travelLog.length-1]={...last,...patch};
  emit('travel.updated',actor,{type:last.type});return true;
 }
 function discovery(actor,id,message,thought=''){
  if(!Array.isArray(actor.seen))actor.seen=[];
  if(!Array.isArray(actor.notes))actor.notes=[];
  const first=!actor.seen.includes(id);
  if(first)actor.seen.push(id);if(!actor.notes.includes(message))actor.notes.push(message);
  if(first){appendTravel(actor,'discovery',message,thought);emit('discovery.recorded',actor,{id,message});}
  return first;
 }
 return Object.freeze({on,emit,appendTravel,updateTravel,discovery,diagnostics:()=>({subscriptions:[...handlers].map(([type,set])=>({type,ids:[...set.keys()]})),history:history.slice(),errors:errors.slice()})});
})();
window.DungeonSaveV1=(function(events){
 const CURRENT=1,PROJECT='dungeon-adventure',migrations=new Map();let last={state:'idle'},writeProtected=false;
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const safeMap=x=>record(x)&&!Object.hasOwn(x,'__proto__')&&!Object.hasOwn(x,'constructor')&&!Object.hasOwn(x,'prototype');
 function valid(j,scenes){
  return Boolean(safeMap(j)&&j.v===1&&Object.hasOwn(scenes,j.scene)&&Number.isFinite(j.hp)&&Number.isFinite(j.maxHp)&&j.maxHp>0&&Array.isArray(j.party)&&j.party.length===4&&new Set(j.party).size===4&&j.party.every(i=>Number.isInteger(i)&&i>=0&&i<6)&&Array.isArray(j.seen)&&Array.isArray(j.notes)&&Array.isArray(j.items)&&safeMap(j.flags)&&safeMap(j.visits));
 }
 function registerMigration(from,fn){if(!Number.isInteger(from)||from<0||typeof fn!=='function'||migrations.has(from))throw Error('Invalid migration');migrations.set(from,fn);}
 registerMigration(0,j=>{j.engineSave={project:PROJECT,schema:1};return j;});
 function prepare(input,scenes){
  if(!valid(input,scenes))throw Error('格式不相容');
  let j=JSON.parse(JSON.stringify(input)),meta=j.engineSave;
  if(meta!==undefined&&(!safeMap(meta)||meta.project!==PROJECT||!Number.isInteger(meta.schema)||meta.schema<0||meta.schema>CURRENT))throw Error('存檔版本不相容');
  let version=meta?.schema??0;
  while(version<CURRENT){const migrate=migrations.get(version);if(!migrate)throw Error('缺少存檔遷移');j=migrate(j);version++;if(j.engineSave?.schema!==version)throw Error('遷移版本錯誤');}
  if(!valid(j,scenes))throw Error('遷移後存檔不相容');
  window.DungeonGameTimeV1.normalize(j);
  if(!Array.isArray(j.travelLog))j.travelLog=[];
  j.travelLog=j.travelLog.filter(e=>record(e)&&typeof e.message==='string').slice(-120);
  if(typeof j.feedCollapsed!=='boolean')j.feedCollapsed=false;
  if(!['compact','expanded'].includes(j.travelHudMode))j.travelHudMode='compact';
  return j;
 }
 function parse(raw,scenes){return prepare(JSON.parse(raw),scenes);}
 function read(storage,key,scenes){
  try{const raw=storage.getItem(key);if(raw==null){last={state:'empty'};return null;}const j=parse(raw,scenes);last={state:'loaded',schema:CURRENT};return j;}catch(err){writeProtected=true;last={state:'read-error',message:String(err?.message||err)};return null;}
 }
 function write(storage,key,actor,scenes){
  if(writeProtected){last={state:'protected',message:'原始存檔無法讀取；禁止自動覆寫，請確認重新開始或匯入。'};return false;}
  try{
   const candidate=prepare(actor,scenes);candidate.savedAt=Date.now();
   const encoded=JSON.stringify(candidate);storage.setItem(key,encoded);
   actor.engineSave=candidate.engineSave;actor.savedAt=candidate.savedAt;
   last={state:'saved',schema:CURRENT};return true;
  }catch(err){last={state:'write-error',message:String(err?.message||err)};return false;}
 }
 function exportText(actor,scenes){return JSON.stringify(prepare(actor,scenes),null,2);}
 return Object.freeze({CURRENT,valid,prepare,parse,read,write,exportText,registerMigration,allowReplacement:()=>{writeProtected=false;},diagnostics:()=>({...last,writeProtected})});
})(window.DungeonEventsV1);
window.DungeonEngineV1.register({id:'engine.events',version:'1.0.0',requires:['engine.registry']});
window.DungeonEngineV1.register({id:'engine.save',version:'1.0.0',requires:['engine.time','engine.events']});
