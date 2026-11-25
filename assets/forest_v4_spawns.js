window.DUNGEON_FOREST_V4_SPAWNS=[
  {
    "id": "spawn-bird-2",
    "assetId": "forest4_bird",
    "name": "小鳥｜中央樹枝",
    "x": 55,
    "y": 12,
    "width": 3.5,
    "z": 9,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-bird-3",
    "assetId": "forest4_bird",
    "name": "小鳥｜右側枝葉",
    "x": 83,
    "y": 12,
    "width": 3.2,
    "z": 9,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-rabbit-2",
    "assetId": "forest4_rabbit",
    "name": "月紋兔｜左側林緣",
    "x": 15,
    "y": 58,
    "width": 4.5,
    "z": 3,
    "visible": true,
    "flip": false,
    "rotation": 0
},
  {
    "id": "spawn-rabbit-3",
    "assetId": "forest4_rabbit",
    "name": "月紋兔｜右側草地",
    "x": 88,
    "y": 65.8,
    "width": 5,
    "z": 5,
    "visible": true,
    "flip": false,
    "rotation": 0
},
  {
    "id": "spawn-beetle-2",
    "assetId": "forest4_beetle",
    "name": "鏽殼甲蟲｜左前岩石",
    "x": 23,
    "y": 78,
    "width": 2.7,
    "z": 10,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-beetle-3",
    "assetId": "forest4_beetle",
    "name": "鏽殼甲蟲｜右側岩石",
    "x": 85,
    "y": 73,
    "width": 2.5,
    "z": 10,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-butterfly-2",
    "assetId": "forest4_butterfly",
    "name": "蝴蝶｜左側花草",
    "x": 16,
    "y": 45,
    "width": 3,
    "z": 10,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-butterfly-3",
    "assetId": "forest4_butterfly",
    "name": "蝴蝶｜右側花草",
    "x": 88,
    "y": 57,
    "width": 3,
    "z": 10,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-branch-4",
    "assetId": "forest4_branch",
    "name": "樹枝｜中央林地",
    "x": 48,
    "y": 58,
    "width": 3.2,
    "z": 4,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-branch-5",
    "assetId": "forest4_branch",
    "name": "樹枝｜右前草地",
    "x": 78,
    "y": 89,
    "width": 4.5,
    "z": 13,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-grass-6",
    "assetId": "forest4_grass_a",
    "name": "草叢｜左側草地",
    "x": 12,
    "y": 66,
    "width": 5.5,
    "z": 1,
    "visible": true,
    "flip": false,
    "rotation": 0
  },
  {
    "id": "spawn-grass-7",
    "assetId": "forest4_grass_b",
    "name": "草叢｜中央草地",
    "x": 57,
    "y": 74,
    "width": 5,
    "z": 4,
    "visible": true,
    "flip": false,
    "rotation": 0
  }
];
window.DungeonForestV4Life=(function engine(){
 const animalKinds=['bird','rabbit','beetle','butterfly'];
 const periods={bird:['dawn','day','dusk'],rabbit:['dawn','dusk'],beetle:['dusk','night'],butterfly:['dawn','day','dusk']};
 const kind=o=>o.assetId.replace('forest4_','');
 function state(s){if(!s.forestV4Life||typeof s.forestV4Life!=='object'||Array.isArray(s.forestV4Life))s.forestV4Life={last:-1,animals:{}};const v=s.forestV4Life;if(!v.animals||typeof v.animals!=='object')v.animals={};return v;}
 function update(s,base,slots,phase,random=Math.random){
  const v=state(s),count=s.exploration?.counts?.wreck||0;if(s.scene!=='wreck'||v.last===count||s.flags?.inBattle)return;
  v.last=count;
  for(const k of animalKinds){const options=[...base,...slots].filter(o=>o.visible&&kind(o)===k);if(!options.length)continue;
   if(!periods[k].includes(phase)){v.animals[k]=null;continue;}
   const old=Object.hasOwn(v.animals,k)?v.animals[k]:options[0].id;
   const roll=random();if(old===null){v.animals[k]=roll<.5?options[Math.min(options.length-1,Math.floor(random()*options.length))].id:null;}
   else if(roll<.25)v.animals[k]=null;else if(roll<.75){const others=options.filter(o=>o.id!==old);v.animals[k]=others.length?others[Math.min(others.length-1,Math.floor(random()*others.length))].id:old;}else v.animals[k]=old;
  }
 }
 // One stable roll per eligible exploration; reloads and UI renders never reroll.
 function goldenEncounter(s){
  const minute=Math.max(0,Math.floor(Number(s.worldMinutes)||0)),hour=minute%1440/60;
  if(!(hour>=5&&hour<8||hour>=17&&hour<20))return false;
  const day=Math.floor(minute/1440),count=s.exploration?.counts?.wreck||0;
  let h=2166136261;for(const ch of String(s.seed??0)+':gold-rabbit:'+day+':'+count){h=Math.imul(h^ch.charCodeAt(0),16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;
  return (h>>>0)/4294967296<.01;
 }
 function layout(s,base,slots,materialBindings,weather=window.DungeonWeatherV1?.at(s.seed,s.worldMinutes)){ 
  const v=state(s);const out=base.filter(o=>!animalKinds.includes(kind(o)));for(const k of animalKinds){const original=base.find(o=>o.visible&&kind(o)===k);if(!original)continue;
   const id=Object.hasOwn(v.animals,k)?v.animals[k]:original.id;const target=[...base,...slots].find(o=>o.id===id&&o.visible&&kind(o)===k);if(target)out.push(k==='rabbit'&&goldenEncounter(s)?{...target,name:'金紋兔',rabbitVariant:'golden'}:target);}
  for(const o of slots){if(!o.visible)continue;if(kind(o)==='branch'&&materialBindings.has(o.id))out.push(o);if(kind(o).startsWith('grass_')||o.plantSpawn===true){if(window.DungeonWeatherV1&&!window.DungeonWeatherV1.plantSpawnAllowed(weather,o))continue;const day=Math.floor(Math.max(0,s.worldMinutes||0)/1440);const offset=o.id==='spawn-grass-6'?0:2;const phase=(day+offset)%4;if(phase!==0)out.push({...o,width:o.width*(phase===1?.65:phase===2?1:.8)});}}
  return out;
 }
 return {update,layout,goldenEncounter};
})();
