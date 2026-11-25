/* Shared engine foundation V1: explicit module dependencies and one game clock.
   No wall-clock progression, rendering, or persistence inside the clock. */
window.DungeonEngineV1=(function(){
 const modules=new Map(),faults=[],listeners=new Map();
 function fault(id,message){faults.push({id,message:String(message)});if(faults.length>40)faults.shift();}
 function register(def){
  if(!def||typeof def.id!=='string'||!def.id||typeof def.version!=='string')throw Error('Invalid module definition');
  if(modules.has(def.id))throw Error('Duplicate module: '+def.id);
  const entry=Object.freeze({id:def.id,version:def.version,requires:Object.freeze([...(def.requires||[])]),available:typeof def.available==='function'?def.available:()=>true});
  modules.set(entry.id,entry);return entry;
 }
 function status(){
  const resolve=(id,trail=[])=>{
   const m=modules.get(id);if(!m)return 'missing';
   if(trail.includes(id))return 'cycle';
   try{if(!m.available())return 'missing';}catch{return 'error';}
   if(m.requires.some(d=>resolve(d,[...trail,id])!=='ready'))return 'blocked';
   return 'ready';
  };
  return Array.from(modules.values(),m=>({id:m.id,version:m.version,requires:[...m.requires],state:resolve(m.id)}));
 }
 function onTime(id,fn){
  if(!modules.has(id)||typeof fn!=='function'||listeners.has(id))throw Error('Invalid or duplicate time listener: '+id);
  listeners.set(id,fn);
 }
 function dispatch(actor,event){
  const states=new Map(status().map(m=>[m.id,m.state]));
  const done=new Set(),busy=new Set();
  function run(id){
   if(done.has(id)||busy.has(id))return;
   busy.add(id);
   const m=modules.get(id);
   for(const dep of m.requires)if(listeners.has(dep))run(dep);
   busy.delete(id);done.add(id);
   if(states.get(id)!=='ready'){fault(id,'Time update skipped: '+states.get(id));return;}
   try{listeners.get(id)(actor,event);}catch(err){fault(id,err?.message||err);}
  }
  for(const id of listeners.keys())run(id);
 }
 const diagnostics=()=>({modules:status(),timeListeners:[...listeners.keys()],faults:faults.map(x=>({...x}))});
 return Object.freeze({register,status,onTime,dispatch,diagnostics});
})();
window.DungeonGameTimeV1=(function(engine){
 const DAY=1440,START=960;
 const valid=n=>Number.isSafeInteger(n)&&n>=0;
 function normalize(actor){
  let n=Number.isFinite(actor.worldMinutes)?Math.floor(actor.worldMinutes):NaN;
  if(!valid(n))n=actor.flags?.morning?DAY+480:START;
  if(actor.worldMinutes!==n)actor.worldMinutes=n;return n;
 }
 function parts(minutes){
  const m=Number.isFinite(minutes)?Math.max(0,Math.floor(minutes)):0,h=Math.floor(m%DAY/60);
  return {minute:m,day:Math.floor(m/DAY)+1,hour:h,minuteOfHour:m%60,period:h>=5&&h<8?'dawn':h>=8&&h<17?'day':h>=17&&h<20?'dusk':'night'};
 }
 function format(minutes){const p=parts(minutes);return '第'+p.day+'日 '+String(p.hour).padStart(2,'0')+':'+String(p.minuteOfHour).padStart(2,'0');}
 const inProgress=new WeakSet();
 function advance(actor,minutes,context={}){
  if(!valid(minutes))throw RangeError('Invalid elapsed game minutes');
  if(inProgress.has(actor))throw Error('Recursive time advancement');
  const from=normalize(actor),to=from+minutes;if(!valid(to))throw RangeError('Invalid target game time');
  const before=parts(from),after=parts(to),event=Object.freeze({from,to,minutes,reason:context.reason||'action',fromScene:context.fromScene||actor.scene,toScene:context.toScene||actor.scene,daysCrossed:after.day-before.day,before:Object.freeze(before),after:Object.freeze(after)});
  if(!minutes)return event;
  inProgress.add(actor);
  try{actor.worldMinutes=to;engine.dispatch(actor,event);}finally{inProgress.delete(actor);}
  return event;
 }
 function nextMorning(actor,context={}){const from=normalize(actor);return advance(actor,(Math.floor(from/DAY)+1)*DAY+480-from,{...context,reason:'overnight-rest'});}
 return Object.freeze({DAY,normalize,parts,format,advance,nextMorning});
})(window.DungeonEngineV1);
window.DungeonEngineV1.register({id:'engine.registry',version:'1.0.0'});
window.DungeonEngineV1.register({id:'engine.time',version:'1.0.0',requires:['engine.registry']});
