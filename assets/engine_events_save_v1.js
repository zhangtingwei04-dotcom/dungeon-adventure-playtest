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
/* Domain schema V1. Independent revisions, additive metadata, no new gameplay. */
window.DungeonDataSchemaV1=(function(){
 const map=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&!['__proto__','constructor','prototype'].some(k=>Object.hasOwn(x,k));
 function ensureMap(a,k){if(!map(a[k]))a[k]={};return a[k];}
 function wallet(a){
  if(!map(a.wallet))a.wallet={silver:1,copper:12};
  for(const k of ['silver','copper'])if(!Number.isSafeInteger(a.wallet[k])||a.wallet[k]<0)a.wallet[k]=0;
 }
 function exploration(a){
  const e=ensureMap(a,'exploration');
  for(const k of ['counts','routeProgress','pending','daily','last'])ensureMap(e,k);
  // The game owns the material catalog and route-specific validation.
 }
 function forestRare(a){
  const r=ensureMap(a,'forestRare');
  for(const k of ['checkedDays','sighted','hints','ingredients'])ensureMap(r,k);
  if(r.checkedDays.beetle===undefined&&Number.isFinite(r.checkedDays.goblin))r.checkedDays.beetle=r.checkedDays.goblin;
  if(r.sighted.beetle===undefined&&r.sighted.goblin)r.sighted.beetle=true;
  if(r.hints.beetle===undefined&&r.hints.goblin)r.hints.beetle=true;
  r.beetleGearTaken=!!(r.beetleGearTaken||r.goblinGearTaken);
  r.rabbitHerbTaken=!!r.rabbitHerbTaken;
  if(!r.rustBeetleMigrated){
   const rename=x=>typeof x==='string'?x.replaceAll('拾鐵小妖','鏽殼甲蟲'):x;
   if(Array.isArray(a.notes))a.notes=a.notes.map(rename);
   if(Array.isArray(a.travelLog))for(const e of a.travelLog)if(map(e)){e.message=rename(e.message);e.thought=rename(e.thought);}
   if(Array.isArray(a.seen)&&a.seen.includes('rareGoblin')&&!a.seen.includes('rareBeetle'))a.seen.push('rareBeetle');
   r.rustBeetleMigrated=true;
  }
 }
 function objectWorld(a){const w=ensureMap(a,'objectWorld');ensureMap(w,'scenes');}
 const definitions=Object.freeze({objectWorld:Object.freeze({version:1,steps:Object.freeze([objectWorld]),normalize:objectWorld}),wallet:Object.freeze({version:1,steps:Object.freeze([wallet]),normalize:wallet}),exploration:Object.freeze({version:1,steps:Object.freeze([exploration]),normalize:exploration}),forestRare:Object.freeze({version:1,steps:Object.freeze([forestRare]),normalize:forestRare})});
 function migrate(a){
  if(!map(a.engineSave))throw Error('缺少存檔版本資訊');
  const old=a.engineSave.domains;
  if(old!==undefined&&!map(old))throw Error('系統版本資訊不相容');
  const versions={...(old||{})};
  // Preflight every known version before changing any field.
  for(const [id,d] of Object.entries(definitions)){
   const v=Object.hasOwn(versions,id)?versions[id]:0;
   if(!Number.isInteger(v)||v<0||v>d.version)throw Error('系統版本不相容：'+id);
  }
  for(const [id,d] of Object.entries(definitions)){
   let v=versions[id]??0;
   while(v<d.version){const step=d.steps[v];if(!step)throw Error('缺少系統遷移：'+id);step(a);v++;}
   d.normalize(a);versions[id]=v;
  }
  a.engineSave.domains=versions;
  return a;
 }
 function normalize(a,id){if(!Object.hasOwn(definitions,id))throw Error('未知資料系統');definitions[id].normalize(a);return a[id];}
 return Object.freeze({migrate,normalize,versions:()=>Object.fromEntries(Object.entries(definitions).map(([k,d])=>[k,d.version]))});
})();
window.DungeonSaveV1=(function(events){
 const CURRENT=1,PROJECT='dungeon-adventure',migrations=new Map();let last={state:'idle'},writeProtected=false,replacementAllowed=false;
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
  window.DungeonDataSchemaV1.migrate(j);
  if(!Array.isArray(j.travelLog))j.travelLog=[];
  j.travelLog=j.travelLog.filter(e=>record(e)&&typeof e.message==='string').slice(-120);
  if(typeof j.feedCollapsed!=='boolean')j.feedCollapsed=false;
  if(!['compact','expanded'].includes(j.travelHudMode))j.travelHudMode='compact';
  return j;
 }
 // A lightweight corruption check, not authentication or encryption.
 const backupKey=key=>key+'.previous-v1';
 function payload(j){const copy={...j};delete copy.saveIntegrityV1;return JSON.stringify(copy);}
 function checksum(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');}
 function seal(j){delete j.saveIntegrityV1;j.saveIntegrityV1={algorithm:'fnv1a-utf16-v1',value:checksum(payload(j))};return j;}
 function progress(j){const copy={...j};delete copy.savedAt;delete copy.saveIntegrityV1;return JSON.stringify(copy);}
 function parse(raw,scenes){
  const j=JSON.parse(raw);
  if(record(j)&&Object.hasOwn(j,'saveIntegrityV1')){
   const mark=j.saveIntegrityV1;
   if(!safeMap(mark)||mark.algorithm!=='fnv1a-utf16-v1'||mark.value!==checksum(payload(j)))throw Error('存檔完整性檢查失敗');
  }
  return prepare(j,scenes);
 }
 function previous(storage,key,scenes){try{const raw=storage.getItem(backupKey(key));return raw==null?null:parse(raw,scenes);}catch{return null;}}
 function read(storage,key,scenes){
  replacementAllowed=false;writeProtected=false;
  try{const raw=storage.getItem(key);if(raw==null){last={state:'empty'};return null;}const j=parse(raw,scenes);last={state:'loaded',schema:CURRENT,integrity:j.saveIntegrityV1?'verified':'legacy'};return j;}
  catch(err){writeProtected=true;last={state:'read-error',message:String(err?.message||err),previousAvailable:!!previous(storage,key,scenes)};return null;}
 }
 function write(storage,key,actor,scenes){
  if(writeProtected&&!replacementAllowed){last={state:'protected',message:'原始存檔無法讀取；禁止自動覆寫，請確認重新開始或匯入。',previousAvailable:!!previous(storage,key,scenes)};return false;}
  try{
   const candidate=prepare(actor,scenes);candidate.savedAt=Date.now();
   const raw=storage.getItem(key);let prior=null;
   if(raw!=null){try{prior=parse(raw,scenes);}catch(err){if(!replacementAllowed){writeProtected=true;throw err;}}}
   if(prior&&prior.saveIntegrityV1&&progress(JSON.parse(raw))===progress(candidate)){
    actor.engineSave=prior.engineSave;actor.savedAt=prior.savedAt;replacementAllowed=false;writeProtected=false;
    last={state:'saved',schema:CURRENT,integrity:'verified',unchanged:true};return true;
   }
   if(prior&&progress(prior)!==progress(candidate)){
    const previousText=JSON.stringify(seal(prior));
    if(storage.getItem(backupKey(key))!==previousText){
     storage.setItem(backupKey(key),previousText);
     if(storage.getItem(backupKey(key))!==previousText)throw Error('上一版存檔驗證失敗');
    }
   }
   const encoded=JSON.stringify(seal(candidate));storage.setItem(key,encoded);
   if(storage.getItem(key)!==encoded)throw Error('主存檔寫入後驗證失敗');
   parse(encoded,scenes);
   actor.engineSave=candidate.engineSave;actor.savedAt=candidate.savedAt;
   delete actor.saveIntegrityV1;
   replacementAllowed=false;writeProtected=false;last={state:'saved',schema:CURRENT,integrity:'verified'};return true;
  }catch(err){last={state:writeProtected?'protected':'write-error',message:String(err?.message||err)};return false;}
 }
 function exportText(actor,scenes){return JSON.stringify(seal(prepare(actor,scenes)),null,2);}
 return Object.freeze({CURRENT,valid,prepare,parse,read,write,exportText,previous,backupKey,registerMigration,allowReplacement:()=>{replacementAllowed=true;writeProtected=false;},diagnostics:()=>({...last,writeProtected})});
})(window.DungeonEventsV1);
window.DungeonEngineV1.register({id:'engine.events',version:'1.0.0',requires:['engine.registry']});
window.DungeonEngineV1.register({id:'engine.data-schema',version:'1.0.0',requires:['engine.registry']});
window.DungeonEngineV1.register({id:'engine.save',version:'1.3.0',requires:['engine.time','engine.events','engine.data-schema']});
