// Headless integration checks against production modules and selected real inline functions.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const modules=['engine_foundation_v1','engine_events_save_v1','character_environment_v1','weather_system_v1','lantern_world_environment_v1','forest_v4_spawns','forest_v4_layout','scene_objects_v1','scene_spatial_motion_v1','scene_environment_v1','winter_surfaces_v1'];
const window={};
for(const m of modules)new Function('window',read('assets/'+m+'.js'))(window);
const html=read('index.html');
const {DungeonEngineV1:R,DungeonGameTimeV1:T,DungeonEventsV1:E,DungeonSaveV1:S,DungeonWeatherV1:W,DungeonCharacterEnvironmentV1:C,DungeonSceneObjectsV1:O,DungeonSceneEnvironmentV1:V,DungeonForestV4Life:L,DungeonWinterV1:Winter}=window;
const names={wreck:[],trail:[],inn:[],clearing:[]};
const fresh=()=>({v:1,seed:123,scene:'wreck',worldMinutes:960,hp:16,maxHp:16,party:[0,1,2,3],seen:[],notes:[],items:[],flags:{},visits:{wreck:1},equipmentV1:{outer:'starter_cloak'},exploration:{counts:{wreck:0,clearing:1},pending:{}}});
function extract(start,end){const i=html.indexOf(start),j=html.indexOf(end,i);assert(i>=0&&j>i,'Production source boundary changed: '+start);return html.slice(i,j);}
const actorHelpers=new Function('window','s','INDOOR_SCENES','const lanternWorldEnvironment=window.LanternWorldEnvironmentV1.create(window.DungeonWeatherV1);'+extract('function characterEnvironmentView(){','function syncWeather(){')+extract('function advanceGameTime(','function travelRoute(')+'return {characterEnvironmentView,advanceGameTime,advanceToNextMorning};');
const indoors=new Set(['inn','lobby','guild','home']);
// Real time callback as registered by production HTML, with independent actor and no UI.
const registration=html.match(/engine\.onTime\('world\.weather',[^\n]+/)[0];
R.register({id:'world.weather',version:'test',requires:['engine.time']});
new Function('engine','window','INDOOR_SCENES',registration)(R,window,indoors);
R.onTime('engine.events',(a,e)=>E.emit('time.advanced',a,e));
const checks=[];
function check(name,fn){try{const detail=fn();checks.push({name,result:'PASS',detail});console.log('PASS',name);}catch(e){checks.push({name,result:'FAIL',message:String(e.stack||e)});console.error('FAIL',name,e);}}
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' != '+b);
check('Actual time adapter -> weather exposure -> event -> save/reload',()=>{
 const a=fresh(),H=actorHelpers(window,a,indoors),events=[];
 const stop=E.on('time.advanced','integration-capture',(actor,event)=>{if(actor===a)events.push(event);});
 try{
  H.advanceGameTime(13,'travel:walk','trail');a.scene='trail';W.exposure(a,false);
  assert.equal(a.worldMinutes,973);assert.equal(a.weatherExposure.minute,973);assert.equal(events.length,1);
  const raw=S.exportText(a,names),loaded=S.parse(raw,names);assert.deepEqual(loaded.weatherExposure,a.weatherExposure);
  assert.equal(loaded.scene,'trail');assert.equal(loaded.hp,16);
  const before=JSON.stringify(loaded.weatherExposure);W.exposure(loaded,false);assert.equal(JSON.stringify(loaded.weatherExposure),before);
 }finally{stop();}
});
check('Outdoor -> indoor time exposure uses previous scene, then indoor recovery',()=>{
 const a=fresh(),H=actorHelpers(window,a,indoors);
 W.exposure(a,false);a.weatherExposure.wetness=80;a.weatherExposure.comfort=30;
 H.advanceGameTime(8,'travel:walk','inn');assert.equal(a.weatherExposure.indoor,false);
 a.scene='inn';W.exposure(a,true);const before=a.weatherExposure.wetness;
 H.advanceGameTime(60,'rest');assert.equal(a.weatherExposure.indoor,true);assert(a.weatherExposure.wetness<before);
 assert.equal(H.characterEnvironmentView().ambient,20);assert.equal(a.hp,16);
});
check('Production forest selection and final wildlife filter across weather, time and debug previews',()=>{
 const prefix=extract('function renderForestV4(el){',' window.DungeonSceneEnvironmentV1?.setActionMap');
 const run=new Function('window','s','location','URLSearchParams','document','forestEnvironmentActive','forestV4MaterialBindings','plantSpawnWeather','DEV_PREVIEW_MODE','previewWind','currentWeather',prefix+'return live; } return renderForestV4({querySelector:()=>null});');
 window.DUNGEON_FOREST_V4_ASSETS={};const doc={createElement:()=>({classList:{add(){}},children:[]})};
 let combinations=0;
 for(const minute of [330,720,1050,1320])for(const kind of ['snow','blizzard','storm'])for(const query of ['', '?wildlife=golden-rabbit','?wildlife=bird','?wildlife=beetle']){
  const a=fresh();a.worldMinutes=minute;const env={kind,wind:1,snowCover:kind==='storm'?0:.3};
  const live=run(window,a,{search:query},URLSearchParams,doc,()=>true,()=>new Set(),()=>env,true,null,env);
  assert(Array.isArray(live));assert(!live.some(o=>/forest4_(rabbit|bird|beetle|butterfly)$/.test(o.assetId)));
  combinations++;
 }
 const a=fresh(),env={kind:'clear',wind:0,snowCover:0};
 const live=run(window,a,{search:'?wildlife=golden-rabbit'},URLSearchParams,doc,()=>true,()=>new Set(),()=>env,true,null,env);
 assert(live.some(o=>o.rabbitVariant==='golden'),'positive control: golden rabbit not selected');
 return {combinations};
});
check('Ambient vegetation weather rule shared across locations',()=>{
 for(const scene of ['wreck','trail','clearing','ruin','outskirts']){
  const a=fresh();a.scene=scene;
  assert(O.objects(a,{kind:'clear'}).some(o=>o.kind==='ambient-plant'),scene+' clear');
  assert(!O.objects(a,{kind:'snow'}).some(o=>o.kind==='ambient-plant'),scene+' snow');
  assert(!O.objects(a,{kind:'clear',snowCover:.2}).some(o=>o.kind==='ambient-plant'),scene+' residual snow');
 }
});
check('Weather water state drives waterfall speed and pond ice',()=>{
 const ice=W.waterFreezeStep({},-8,360,'snow'),warm=W.waterFreezeStep(ice,12,360,'clear');
 const frozen=V.waterProfile(ice),liquid=V.waterProfile(warm);
 assert(frozen.speed<liquid.speed);assert(frozen.poolIce>frozen.flowIce);near(liquid.poolIce,0);
 return {frozenSpeed:frozen.speed,liquidSpeed:liquid.speed};
});
check('Rabbit behavior and spatial food selection under winter weather',()=>{
 const b=V.rabbitBrain(.2,false);const choice=V.rabbitDecision(b,{kind:'blizzard',wind:1});assert(['shelter','shelter-hop'].includes(choice.mode));
 const M=window.DungeonSpatialMotion,anchor={id:'v4-rabbit16',x:50,y:65,width:5,z:5};
 const map={solids:[],food:[{id:'plant',x:52,y:65,width:2,z:5}],shelter:[]};
 assert(M.actionPoints(anchor,map,anchor,{kind:'clear'}).some(p=>p.type==='food'));
 assert(!M.actionPoints(anchor,map,anchor,{kind:'snow',snowCover:.2}).some(p=>p.type==='food'));
});
check('120 game days, multiple seeds, save boundaries and all environment ranges',()=>{
 let steps=0;const keys=['snowCover','soil','plantWet','puddles','frost','wet','poolIce','edgeIce','flowIce','iceSnow'];
 for(const seed of [123,456,789]){
  let a=fresh();a.seed=seed;a.worldMinutes=0;W.exposure(a,false);
  for(let day=0;day<120;day++){
   T.advance(a,1440);const weather=W.at(seed,a.worldMinutes);
   for(const k of keys)assert(Number.isFinite(weather[k])&&weather[k]>=0&&weather[k]<=1,k);
   for(const k of ['wetness','comfort'])assert(Number.isFinite(a.weatherExposure[k])&&a.weatherExposure[k]>=0&&a.weatherExposure[k]<=100,k);
   assert.equal(a.weatherExposure.minute,a.worldMinutes);assert.equal(a.hp,16);
   if(day%10===0)a=S.parse(S.exportText(a,names),names);
   steps++;
  }
 }
 assert.deepEqual(R.diagnostics().faults,[]);assert.deepEqual(E.diagnostics().errors,[]);
 return {steps};
});
// Motion regression uses production samplers, not approximated equations.
new Function('window',read('assets/bird_motion_live_v1.js'))(window);
const B=window.DungeonBirdMotion;
const finite=o=>Object.values(o).filter(x=>typeof x==='number').every(Number.isFinite);
check('Bird flight, landing, hopping and wing joints: 10,800 samples',()=>{
 let n=0;
 for(const id of Object.keys(B.routes)){
  const modes=new Set();
  for(let i=0;i<2700;i++){
   const v=B.sample({id,x:55,y:12,width:3.5,z:9},i/100);
   assert(finite(v)&&v.x>=0&&v.x<=100&&v.visibleY>=0&&v.visibleY<=100&&v.h>=0&&v.width>0);
   assert(finite(B.wingPose(i/100,v.open,v.brake)));
   modes.add(v.mode);n++;
  }
  for(const mode of ['perch','fly','land','hop','forage'])assert(modes.has(mode),mode);
 }
 return {samples:n};
});
check('Beetle ground-only mode: 10,900 samples',()=>{
 const modes=new Set();
 for(let i=0;i<10900;i++){
  const v=V.wildlifeSample('beetle',i/100,-1,true);
  assert(finite(v)&&v.lift===0&&!['fly','unfold','fold'].includes(v.mode));
  modes.add(V.wildlifeSample('beetle',i/100,-1,false).mode);
 }
 assert(modes.has('fly')&&modes.has('crawl'));
 return {samples:10900};
});
check('Rabbit mixed weather: 6,000 ticks',()=>{
 const b=V.rabbitBrain(.3,false),modes=new Set();
 for(let i=0;i<6000;i++){
  const kind=['clear','rain','blizzard'][Math.floor(i/1000)%3];
  const v=V.rabbitTick(b,.1,{kind,wind:kind==='clear'?0:1});
  assert(finite(v)&&b.hunger>=0&&b.hunger<=1&&b.energy>=0&&b.energy<=1&&b.q>=0&&b.q<=1);
  modes.add(v.behavior);
 }
 assert(modes.has('shelter')&&modes.has('shelter-hop'));
 return {samples:6000};
});
const report={checks,passed:checks.filter(c=>c.result==='PASS').length,failed:checks.filter(c=>c.result==='FAIL').length};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results','integration-report.json'),JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
