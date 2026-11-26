/* Scene object investigation catalog. Type is a lifecycle policy, not permission to collect. */
(function(root){
 'use strict';
 const entries={
  "forest4_wagon": {
    "name": "破損馬車",
    "type": "container",
    "description": "車篷和底盤早已損壞，車架仍留在事故現場。",
    "visualPolicy": "車架保留；可取得的零件與繩纖維另外管理。"
  },
  "forest4_crate_large": {
    "name": "大型貨箱",
    "type": "container",
    "description": "厚木板被撞歪，接縫間夾著潮濕的布料與木屑。",
    "visualPolicy": "箱體保留，內容與開合另行管理。"
  },
  "forest4_crate_small": {
    "name": "小型貨箱",
    "type": "container",
    "description": "小貨箱的角落有撞擊痕跡，木蓋仍遮住箱內。",
    "visualPolicy": "箱體保留，內容另行管理。"
  },
  "forest4_crate_open": {
    "name": "翻倒貨箱",
    "type": "container",
    "description": "箱口朝向地面，裡面的東西可能早已散落。",
    "visualPolicy": "空箱仍留在原處。"
  },
  "forest4_barrel": {
    "name": "木桶",
    "type": "container",
    "description": "桶身木片有受潮痕跡，金屬箍仍扣著木片。",
    "visualPolicy": "木桶保留，內容另行管理。"
  },
  "forest4_sack": {
    "name": "布袋",
    "type": "container",
    "description": "沾泥的布袋有幾處磨損，袋口皺成一團。",
    "visualPolicy": "袋身保留，內容另行管理。"
  },
  "forest4_wheel_flat": {
    "name": "掉落車輪",
    "type": "persistent",
    "description": "輪緣破裂，旁邊的木板留下深刻痕跡。",
    "visualPolicy": "車輪保留；如日後允許拆卸，需獨立確認。"
  },
  "forest4_plank": {
    "name": "木板",
    "type": "persistent",
    "description": "斷裂木板的邊緣粗糙，似乎從車身脫落。",
    "visualPolicy": "目前只供調查，未開放整片拿取。"
  },
  "forest4_plank_lean": {
    "name": "斜木板",
    "type": "persistent",
    "description": "木板斜靠在殘骸旁，表面有剝落的木屑。",
    "visualPolicy": "目前只供調查。"
  },
  "forest4_branch": {
    "name": "樹枝",
    "type": "removable",
    "description": "掉落的枝條帶著樹皮，有些部分可以作為普通材料。",
    "visualPolicy": "生成的枝條在對應材料收完後消失；固定背景枝條不受影響。"
  },
  "forest4_grass_a": {
    "name": "草叢",
    "type": "renewable",
    "description": "細長草葉貼近地面，葉尖隨林風輕輕晃動。",
    "visualPolicy": "保留草叢；未來採集後可使用稀疏外觀。"
  },
  "forest4_grass_b": {
    "name": "草叢",
    "type": "renewable",
    "description": "草葉密集，根部藏著落葉與細小碎屑。",
    "visualPolicy": "保留草叢；未來採集後可使用稀疏外觀。"
  },
  "forest4_purple_flower": {
    "name": "紫花",
    "type": "renewable",
    "description": "幾朵紫色小花長在林地，花瓣完整，暫時無法辨認種類。",
    "visualPolicy": "目前只供觀察。"
  },
  "forest4_white_flower": {
    "name": "白花",
    "type": "renewable",
    "description": "白色花瓣聚在細莖頂端，與周圍深色草葉形成對比。",
    "visualPolicy": "目前只供觀察。"
  },
  "forest4_lavender": {
    "name": "薰衣草",
    "type": "renewable",
    "description": "細長花穗略帶紫色，枝葉聚成一小叢。",
    "visualPolicy": "目前只供觀察。"
  },
  "forest4_vine": {
    "name": "藤蔓",
    "type": "renewable",
    "description": "藤莖沿著周圍物件伸展，葉片攀附在表面。",
    "visualPolicy": "攀附的植株保留，未開放採集。"
  },
  "forest4_yellow_shrub": {
    "name": "黃綠灌木",
    "type": "renewable",
    "description": "低矮的灌木帶著黃綠色葉片，內部枝條交錯。",
    "visualPolicy": "目前只供觀察。"
  },
  "forest4_mushroom": {
    "name": "蘑菇",
    "type": "renewable",
    "description": "菌傘從潮濕地面冒出，尚無法判斷是否適合食用。",
    "visualPolicy": "採集後從原位移除，取得的樣本可在背包查看。",
    "harvest": "未辨識蘑菇"
  },
  "forest4_log": {
    "name": "苔木",
    "type": "persistent",
    "description": "倒下的木頭覆著苔蘚，表面逐漸分解。",
    "visualPolicy": "木頭保留，附生物另行管理。"
  },
  "forest4_rock_group": {
    "name": "苔石群",
    "type": "persistent",
    "description": "石縫間覆著一層苔蘚，石塊大半嵌在泥土中。",
    "visualPolicy": "石群保留。"
  },
  "forest4_rock_small": {
    "name": "小石群",
    "type": "persistent",
    "description": "幾塊大小不一的石頭散落在土壤表面。",
    "visualPolicy": "目前只供調查。"
  },
  "forest4_bird": {
    "name": "小鳥",
    "type": "living",
    "description": "小鳥在枝葉間短暫停留，警覺地轉動頭部。",
    "visualPolicy": "依生物行為出現或離開，不視為可拾取物。"
  },
  "forest4_rabbit": {
    "name": "月紋兔",
    "type": "living",
    "description": "長耳生物留意周圍聲響，側身有月牙般的紋路。",
    "visualPolicy": "依生物行為出現或離開。"
  },
  "forest4_beetle": {
    "name": "鏽殼甲蟲",
    "type": "living",
    "description": "甲蟲的背殼帶著像鏽斑一樣的色澤，正在附近活動。",
    "visualPolicy": "依生物行為出現或離開。"
  },
  "forest4_butterfly": {
    "name": "蝴蝶",
    "type": "living",
    "description": "蝴蝶在花草間停留，翅膀不時輕輕拍動。",
    "visualPolicy": "依生物行為出現或離開。"
  }
};
 for(const v of Object.values(entries))Object.freeze(v);
 Object.freeze(entries);
 function get(assetId){return Object.hasOwn(entries,assetId)?entries[assetId]:null;}
 // Stable scene/object IDs, independent of shared artwork.
 const safeId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id)&&!['constructor','prototype','__proto__'].includes(id);
 const record=x=>x&&typeof x==='object'&&!Array.isArray(x);
 function read(actor,scene,id){
  if(!safeId(scene)||!safeId(id))return null;
  const r=actor?.objectWorld?.scenes?.[scene]?.[id];
  return record(r)?r:null;
 }
 function state(actor,scene,id){
  if(!safeId(scene)||!safeId(id))throw Error('Invalid scene object identity');
  if(!record(actor.objectWorld))actor.objectWorld={scenes:{}};
  const w=actor.objectWorld;if(!record(w.scenes))w.scenes={};
  if(!Object.hasOwn(w.scenes,scene)||!record(w.scenes[scene]))w.scenes[scene]={};
  const objects=w.scenes[scene];if(!Object.hasOwn(objects,id)||!record(objects[id]))objects[id]={};
  return objects[id];
 }
 // Each placed object has an independent stock. Renewable resources recover by elapsed game time.
 const resourceRules=Object.freeze({
  forest4_branch:{material:'枯枝',max:1,hours:2,hide:true},
  forest4_wagon:{material:'舊繩纖維',max:1,hours:0},
  forest4_plank:{material:'破損木板',max:1,hours:0,hide:true},
  forest4_plank_lean:{material:'破損木板',max:1,hours:0,hide:true},
  forest4_grass_a:{material:'草纖維',max:2,hours:6,scale:.75},
  forest4_grass_b:{material:'草纖維',max:2,hours:6,scale:.75},
  forest4_purple_flower:{material:'未辨識紫花',max:1,hours:24,scale:.65},
  forest4_white_flower:{material:'未辨識白花',max:1,hours:24,scale:.65},
  forest4_lavender:{material:'薰衣草',max:1,hours:24,scale:.65},
  forest4_vine:{material:'藤條',max:2,hours:12,scale:.75},
  forest4_yellow_shrub:{material:'未辨識嫩葉',max:2,hours:12,scale:.8},
  forest4_mushroom:{material:'未辨識蘑菇',max:1,hours:12,hide:true},
  forest4_log:{material:'苔蘚',max:2,hours:24},
  forest4_rock_small:{material:'小石頭',max:2,hours:0,scale:.7}
 });
 function resource(actor,scene,obj){
  const rule=resourceRules[obj?.assetId];if(!rule)return null;
  const r=read(actor,scene,obj.id),now=Math.max(0,Number(actor?.worldMinutes)||0);
  if(r?.removed&&r.lastWorldEventKind!=='regrowth'&&r.lastWorldEvent)return {...rule,remaining:0,permanent:true};
  const legacy=r?.removed&&Number.isFinite(r.lastCollectedAt)?0:rule.max;
  let stock=Number.isFinite(r?.resourceStock)?Math.max(0,Math.min(rule.max,r.resourceStock)):legacy;
  const last=Number.isFinite(r?.resourceAt)?r.resourceAt:r?.lastCollectedAt;
  if(rule.hours&&Number.isFinite(last)&&now>=last+rule.hours*60)stock=rule.max;
  return {...rule,remaining:stock,permanent:!!(r?.removed&&!Number.isFinite(last))};
 }
 function visible(actor,scene,obj){
  const r=read(actor,scene,obj.id),v=resource(actor,scene,obj);
  if(r?.removed&&(!v||v.permanent||r.lastWorldEvent&&r.lastWorldEventKind!=='regrowth'))return false;
  return !(v?.hide&&v.remaining<=0);
 }
 function harvest(actor,scene,obj){
  const v=resource(actor,scene,obj);
  if(!v||v.permanent||v.remaining<=0||obj.previewOnly||!visible(actor,scene,obj))return null;
  const r=state(actor,scene,obj.id);
  r.resourceStock=v.remaining-1;r.resourceAt=actor.worldMinutes;r.lastCollectedAt=actor.worldMinutes;
  r.collected=(Number.isSafeInteger(r.collected)&&r.collected>=0?r.collected:0)+1;
  r.removed=false;
  return v.material;
 }
 function resourceScale(actor,scene,obj){const v=resource(actor,scene,obj);return v?.scale&&v.remaining<v.max?1-(1-v.scale)*(1-v.remaining/v.max):1;}
 function inspect(actor,scene,obj){
  const d=get(obj?.assetId);if(!d||d.type==='living'||obj.previewOnly||!visible(actor,scene,obj))return false;
  if(read(actor,scene,obj.id)?.inspected===true)return false;
  const r=state(actor,scene,obj.id);r.inspected=true;r.firstInspectedAt=actor.worldMinutes;return true;
 }
 function collect(actor,scene,obj){
  const d=get(obj?.assetId);if(!d||d.type==='living'||obj.previewOnly||!visible(actor,scene,obj))return false;
  if(resourceRules[obj.assetId])return !!harvest(actor,scene,obj);
  const r=state(actor,scene,obj.id);
  r.collected=(Number.isSafeInteger(r.collected)&&r.collected>=0?r.collected:0)+1;
  r.lastCollectedAt=actor.worldMinutes;
  return true;
 }
 // Future quest/ecology handlers call this explicitly after an authored event resolves.
 // No wall-clock or automatic cleanup is enabled. Validate all targets before mutation.
 function applyWorldEvent(actor,event,objects){
  if(!safeId(event?.id)||!safeId(event?.scene)||!['cleanup','decay','regrowth'].includes(event?.kind)||!Array.isArray(event.targets)||!event.targets.length||new Set(event.targets).size!==event.targets.length)return false;
  const targets=event.targets.map(id=>objects.find(o=>o.id===id));
  if(targets.some(o=>!o||!safeId(o.id)||!get(o.assetId)||o.previewOnly||get(o.assetId).type==='living'))return false;
  if(event.kind==='regrowth'&&targets.some(o=>get(o.assetId).type!=='renewable'))return false;
  if(event.kind==='decay'&&targets.some(o=>!['renewable','removable'].includes(get(o.assetId).type)&&o.assetId!=='forest4_log'))return false;
  if(event.kind==='cleanup'&&targets.some(o=>!['container','removable','persistent'].includes(get(o.assetId).type)||o.assetId.startsWith('forest4_rock')))return false;
  const eventKey=event.scene+':'+event.id;
  if(Object.hasOwn(actor.objectWorld?.appliedEvents||{},eventKey))return false;
  if(targets.every(o=>read(actor,event.scene,o.id)?.lastWorldEvent===event.id))return false;
  for(const o of targets){
   const r=state(actor,event.scene,o.id);if(r.lastWorldEvent===event.id)continue;
   r.removed=event.kind!=='regrowth';r.lastWorldEvent=event.id;r.lastWorldEventKind=event.kind;r.changedAt=actor.worldMinutes;
  }
  if(!record(actor.objectWorld.appliedEvents))actor.objectWorld.appliedEvents={};
  actor.objectWorld.appliedEvents[eventKey]=true;
  return true;
 }
 const animalInteractions=Object.freeze({
  forest4_rabbit:Object.freeze({observe:'牠豎起長耳，留意著周圍的聲響。',approach:'牠察覺你的靠近，迅速退進草叢。',leave:true}),
  forest4_bird:Object.freeze({observe:'牠轉動頭部，偶爾低頭啄食。',approach:'小鳥拍動翅膀，飛向林木深處。',leave:true}),
  forest4_butterfly:Object.freeze({observe:'牠在花葉間停留，輕輕開合翅膀。',approach:'蝴蝶飛離花草，消失在林間。',leave:true}),
  forest4_beetle:Object.freeze({observe:'牠緩慢爬過地面，觸角不時探向前方。',approach:'你俯身查看，牠仍在附近緩慢爬行。',leave:false})
 });
 function animalInteraction(assetId){return animalInteractions[assetId]||null;}
 function describe(obj,finds=[],actor=null,scene='wreck'){
  const def=get(obj?.assetId);if(!def)return null;
  const r=read(actor,scene,obj.id),pending=Array.isArray(finds)?finds.length:0;
  const golden=obj.rabbitVariant==='golden';
  const stock=resource(actor,scene,obj),available=stock&&!stock.permanent&&stock.remaining>0;
  const visualState=!visible(actor,scene,obj)?'removed':(pending||available)?'resource-available':r?.collected>0?'resource-taken':r?.inspected?'inspected':'normal';
  return {name:golden?'金紋兔':def.name,type:def.type,description:golden?'一隻金黃色的長耳兔停在附近，側身仍有熟悉的月牙紋路。':def.description,visualPolicy:def.visualPolicy,visualState,collectible:!obj.previewOnly&&visible(actor,scene,obj)&&(stock?available:pending>0)};
 }
 root.DungeonObjectInvestigationV1=Object.freeze({get,describe,read,visible,inspect,collect,harvest,resource,resourceScale,applyWorldEvent,animalInteraction,ids:()=>Object.keys(entries)});
})(window);
