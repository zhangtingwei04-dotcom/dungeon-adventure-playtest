/* Shared character environment V1. The sole owner of weatherExposure.
   All time-based effects use game minutes, never preview/weather animation or wall clock.
   UI, equipment and future expressions consume snapshot(); HP/SP remain untouched. */
window.DungeonCharacterEnvironmentV1=(function(){
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const num=(v,f=0)=>Number.isFinite(v)?v:f;
 const gear=Object.freeze({
  starter_tunic:Object.freeze({warmth:14,waterproof:.08,windproof:.12,breathability:.78,dryRate:.85}),
  starter_trousers:Object.freeze({warmth:10,waterproof:.08,windproof:.12,breathability:.75,dryRate:.80}),
  starter_boots:Object.freeze({warmth:8,waterproof:.30,windproof:.35,breathability:.35,dryRate:.60}),
  starter_cloak:Object.freeze({warmth:22,waterproof:.42,windproof:.55,breathability:.60,dryRate:.75}),
  starter_gloves:Object.freeze({warmth:5,waterproof:.15,windproof:.24,breathability:.45,dryRate:.65})
 });
 const slots=['head','chest','legs','feet','outer','hands','neck'];
 function protection(equipment={}){
  const items=slots.map(k=>gear[equipment?.[k]]).filter(Boolean);
  return {warmth:clamp(8+items.reduce((s,g)=>s+g.warmth,0),0,100),
   waterproof:clamp(1-items.reduce((s,g)=>s*(1-g.waterproof*.65),1),0,.95),
   windproof:clamp(1-items.reduce((s,g)=>s*(1-g.windproof*.65),1),0,.95),
   breathability:items.length?items.reduce((s,g)=>s+g.breathability,0)/items.length:1,
   dryRate:items.length?items.reduce((s,g)=>s+g.dryRate,0)/items.length:1};
 }
 function conditions(weather={},p=protection(),wetness=0,indoor=false){
  const ambient=indoor?20:num(weather.temperature,20),wind=indoor?0:clamp(num(weather.wind),0,1);
  const felt=ambient-Math.max(0,18-ambient)*wind*.42*(1-p.windproof)-wetness*.065+Math.min(12,p.warmth*.16);
  const cold=Math.max(0,16-felt),heat=Math.max(0,felt-29)+(ambient>26?(1-p.breathability)*p.warmth*.055:0);
  return {ambient,felt:Math.round(felt),cold,heat,wind};
 }
 function step(old,weather,minutes,p,indoor=false){
  const dt=Math.max(0,num(minutes)),rain=indoor?0:clamp(num(weather.rain),0,1),snow=!indoor&&['snow','blizzard'].includes(weather.kind);
  const c=conditions(weather,p,num(old.wetness),indoor);
  const drying=(indoor?.65:.14+c.wind*.2+Math.max(0,c.ambient-12)*.012)*p.dryRate;
  const wetness=clamp(num(old.wetness)+dt*(rain*.72*(1-p.waterproof)+(snow?.16*(1-p.waterproof):0)-(!rain&&!snow?drying:0)+c.heat*.012),0,100);
  const stress=c.cold*.026+c.heat*.030+wetness*.0014;
  const comfort=clamp(num(old.comfort,100)+dt*(stress>.035?-stress:(indoor?.42:.22)),0,100);
  return {wetness,comfort};
 }
 function advance(actor,indoor,weatherAt){
  const now=Math.max(0,Math.floor(num(actor.worldMinutes))),old=actor.weatherExposure,p=protection(actor.equipmentV1);
  let value={wetness:clamp(num(old?.wetness),0,100),comfort:clamp(num(old?.comfort,100),0,100)};
  if(old&&Number.isFinite(old.minute)&&old.minute<=now){
   let start=Math.max(old.minute,now-2880);
   const previous=old.protection||p;
   while(start<now){const end=Math.min(now,(Math.floor(start/180)+1)*180);value=step(value,weatherAt(actor.seed,start),end-start,previous,Boolean(old.indoor));start=end;}
  }
  return actor.weatherExposure={version:1,minute:now,...value,indoor:Boolean(indoor),protection:p};
 }
 function snapshot(actor,weather={},indoor=false){
  const p=protection(actor.equipmentV1),old=actor.weatherExposure||{},wetness=clamp(num(old.wetness),0,100),comfort=clamp(num(old.comfort,100),0,100),c=conditions(weather,p,wetness,indoor);
  const thermal=c.cold>=15?'極冷':c.cold>=5?'寒冷':c.heat>=9?'酷熱':c.heat>=3?'炎熱':'舒適';
  return Object.freeze({...p,...c,wetness,comfort,thermal,wetLabel:wetness>=80?'濕透':wetness>=35?'潮濕':wetness>=10?'微濕':'乾燥',effects:Object.freeze({shiver:c.cold>=5,breathMist:!indoor&&c.ambient<=3,sweat:c.heat>=3,drips:wetness>=80})});
 }
 function rows(view){return [['環境氣溫',view.ambient+'°C'],['角色情境體感',view.felt+'°C · '+view.thermal],['衣物潮濕',Math.round(view.wetness)+'% · '+view.wetLabel],['冷熱舒適度',Math.round(view.comfort)+'%'],['裝備保暖',Math.round(view.warmth)+'%'],['裝備防水',Math.round(view.waterproof*100)+'%'],['裝備防風',Math.round(view.windproof*100)+'%']];}
 return Object.freeze({version:1,gear,protection,conditions,step,advance,snapshot,rows});
})();