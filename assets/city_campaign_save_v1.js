/* Separate city campaign slot. Never reads or writes the legacy forest save. */
(function(root){'use strict';
 const key='dungeon_city_campaign_v1',backupKey=key+'_backup';
 const map=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 function valid(a){
  if(!map(a)||!['rental-room','rental-corridor','rental-street'].includes(a.scene)||!Number.isSafeInteger(a.worldMinutes)||a.worldMinutes<0||
   !map(a.flags)||!map(a.flags.furnitureOpen)||!map(a.equipmentV1)||!map(a.storageV1?.locations)||!map(a.reportV1)||
   !['desk','carried','delivered'].includes(a.reportV1.notice)||!Array.isArray(a.items)||!Array.isArray(a.travelLog)||!Array.isArray(a.notes)||!Array.isArray(a.seen))return false;
  const expected={academy_uniform:['chest','hanger-1'],starter_tunic:['chest','hanger-2'],academy_trousers:['legs','hanger-3'],starter_trousers:['legs','hanger-4'],academy_boots:['feet','shelf-1'],starter_boots:['feet','shelf-2']};
  const loc=a.storageV1.locations;
  if(Object.keys(loc).length!==6||!Array.isArray(a.equipmentV1.owned)||a.equipmentV1.owned.length!==6||new Set(a.equipmentV1.owned).size!==6)return false;
  for(const [id,[slot,home]] of Object.entries(expected)){
   if(!a.equipmentV1.owned.includes(id)||!['container:wardrobe:'+home,'carried','equipped:'+slot].includes(loc[id]))return false;
   if((loc[id]==='equipped:'+slot)!==(a.equipmentV1[slot]===id))return false;
  }
  const unique=Object.values(loc).filter(x=>x!=='carried');
  if(new Set(unique).size!==unique.length)return false;
  if(['chest','legs','feet'].some(slot=>a.equipmentV1[slot]!==null&&!Object.hasOwn(expected,a.equipmentV1[slot])))return false;
  if(a.items.filter(x=>x==='academy_report_notice').length!==(a.reportV1.notice==='carried'?1:0))return false;
  const done=a.reportV1.completed;
  if(done!==null&&(!map(done)||!Number.isSafeInteger(done.worldMinute)||done.worldMinute<0||done.worldMinute>a.worldMinutes||typeof done.late!=='boolean'||done.day!==Math.floor(done.worldMinute/1440)+1))return false;
  if((done!==null)!==(a.reportV1.notice==='delivered'))return false;
  return true;
 }
 function parse(raw){try{const d=JSON.parse(raw);return d?.format==='dungeon-city-campaign-v1'&&valid(d.state)?d.state:null;}catch{return null;}}
 function load(storage){try{const raw=storage.getItem(key);if(raw===null)return {status:'empty',state:null};const state=parse(raw);return state?{status:'ok',state}:{status:'invalid',state:null};}catch{return {status:'unavailable',state:null};}}
 function write(storage,state,{replace=false}={}){
  if(!valid(state))return false;
  try{const raw=storage.getItem(key);if(raw!==null&&!parse(raw)&&!replace)return false;
   if(replace&&raw!==null)storage.setItem(backupKey,raw);
   const next=JSON.stringify({format:'dungeon-city-campaign-v1',state});
   if(raw!==next)storage.setItem(key,next);return true;
  }catch{return false;}
 }
 root.DungeonCityCampaignSaveV1=Object.freeze({key,backupKey,valid,load,write});
})(window);
