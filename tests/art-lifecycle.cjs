// Art registry gate. Git blob SHA pins approved source bytes; never deletes anything.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const inside=p=>{assert(typeof p==='string'&&p.length>0&&!path.isAbsolute(p)&&!p.split('/').includes('..'),'Unsafe path');const f=path.resolve(root,p);assert(f.startsWith(root+path.sep),'Outside repo');return f;};
const registry=JSON.parse(fs.readFileSync(inside('assets/approved-art-registry.json'),'utf8'));
function validate(r,read,hash){
 assert.equal(r.schema,1);assert.equal(r.policy.approvedOnly,true);assert.equal(r.policy.retainRejectedArt,false);assert.equal(r.policy.automaticDeletion,false);assert.equal(r.policy.requireDependencyAudit,true);
 const ids=new Set(),paths=new Set();
 for(const a of r.assets){
  assert.equal(a.state,'approved');assert(typeof a.evidence==='string'&&a.evidence.trim().length>0);
  assert(!ids.has(a.id)&&!paths.has(a.path),'Duplicate approved asset');ids.add(a.id);paths.add(a.path);
  assert(/^[a-f0-9]{40}$/.test(a.blob),'Invalid baseline hash');
  assert.equal(hash(read(a.path)),a.blob,'Approved source changed: '+a.path+'; review before updating baseline');
  assert(Array.isArray(a.consumers)&&a.consumers.length>0);
  for(const c of a.consumers)assert(read(c).toString().includes(a.path),'Consumer no longer references '+a.path+': '+c);
 }
 return r.assets.length;
}
const gitBlob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const read=p=>fs.readFileSync(inside(p));
const count=validate(registry,read,gitBlob);
console.log('PASS: '+count+' approved source baselines and declared consumer paths');
// Optional candidate audit. Scan text references across tracked-style source files;
// no match is not proof of safety (computed paths, embedded images, other repos).
if(process.argv[2]==='--audit-removal'){
 const candidate=process.argv[3];inside(candidate);
 assert(!registry.assets.some(a=>a.path===candidate||a.consumers.includes(candidate)),'Approved asset or declared consumer: removal blocked');
 const tokens=[candidate,path.basename(candidate),...process.argv.slice(4)].filter(x=>x.length>2);
 const hits=[];
 function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  if(['.git','node_modules','test-results'].includes(ent.name))continue;
  const f=path.join(dir,ent.name);
  if(ent.isDirectory())walk(f);
  else if(ent.isFile()&&/\.(html|js|cjs|mjs|css|json|md|ya?ml|svg|ts|tsx)$/i.test(ent.name)&&f!==inside(candidate)&&f!==__filename){
   const s=fs.readFileSync(f,'utf8');if(tokens.some(t=>s.includes(t)))hits.push(path.relative(root,f));
  }
 }}
 walk(root);console.log(JSON.stringify({candidate,hits,decision:hits.length?'BLOCKED_REFERENCES':'MANUAL_REVIEW_REQUIRED'},null,2));
 if(hits.length)process.exitCode=1;
}


// Keep the shared dependency index synchronized with core pages.
const dependencyIndex=JSON.parse(read('assets/asset-dependency-index.json').toString());
function directAssets(s){
 return [...new Set([...s.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),...s.matchAll(/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1].split(/[?#]/)[0].replace(/^\.\//,'')).filter(p=>p.startsWith('assets/')))].sort();
}
assert.equal(dependencyIndex.schema,1);
const directEdges=[];
for(const [page,expected] of Object.entries(dependencyIndex.pages)){
 const actual=directAssets(read(page).toString());
 assert.deepEqual(actual,expected,'Dependency index stale: '+page);
 for(const asset of actual){assert(fs.statSync(inside(asset)).isFile(),'Missing dependency '+asset);directEdges.push({page,asset});}
}
for(const rule of dependencyIndex.retiredLoads){
 assert(Object.hasOwn(dependencyIndex.pages,rule.page));
 for(const asset of rule.paths)assert(!dependencyIndex.pages[rule.page].includes(asset),'Retired dependency loaded: '+rule.page+' '+asset);
}
const assetCount=new Set(directEdges.map(e=>e.asset)).size;
console.log('PASS: '+assetCount+' direct assets; '+directEdges.length+' page references');
const vm=require('node:vm');
const w={};new vm.Script(read('assets/wreck_current_layout_v1.js').toString()).runInNewContext({window:w});
const scene=w.DUNGEON_WRECK_CURRENT_LAYOUT;
assert.equal(scene.revision,'accident-c');
const layoutIds=new Set();
for(const o of scene.scenes.wreck){
 assert(!layoutIds.has(o.id),'Duplicate scene object id '+o.id);layoutIds.add(o.id);
 assert([o.x,o.y,o.width,o.z].every(Number.isFinite),'Invalid scene coordinates '+o.id);
}
const artwork={};
for(const f of ['forest_v4_assets_1','forest_v4_assets_2','forest_v4_assets_3','forest_v4_assets_4'])new vm.Script(read('assets/'+f+'.js').toString()).runInNewContext({window:artwork});
for(const o of scene.scenes.wreck)assert(artwork.DUNGEON_FOREST_V4_ASSETS?.[o.assetId]?.src,'Missing scene artwork '+o.assetId);
console.log('PASS: '+layoutIds.size+' current forest objects resolve to artwork');


const resources={};new vm.Script(read('assets/render_resources_v1.js').toString()).runInNewContext({window:resources});
const R=resources.DungeonRenderResourcesV1;
let loadCount=0;const load=R.onceLoad(()=>loadCount++);
assert.equal(load(),true);assert.equal(load(),false);assert.equal(loadCount,1);
let created=0;
const cache=R.imageCache(2,()=>({complete:true,naturalWidth:1,id:++created}));
const first=cache.get('a');cache.get('b');assert.equal(cache.get('a'),first);
cache.get('c');assert.equal(cache.size(),2);assert.equal(cache.get('b').id,4);
cache.clear();assert.equal(cache.size(),0);
const pending=R.imageCache(2,()=>({complete:false,naturalWidth:0}));
assert.equal(pending.get('pending'),null);assert.equal(pending.size(),1);
console.log('PASS: render resource once-load, LRU, pending-image and clear checks');


const aq={};new vm.Script(read('assets/adaptive_quality_v1.js').toString()).runInNewContext({window:aq});
const quality=aq.DungeonAdaptiveQualityV1.create();
let qms=0;function feedQuality(n,dt){for(let i=0;i<n;i++){qms+=dt;quality.sample(qms)}}
feedQuality(180,16);assert.equal(quality.profile().name,'full');
feedQuality(180,60);assert.equal(quality.profile().name,'light');
feedQuality(1100,16);assert.equal(quality.profile().name,'full');
quality.pause();assert.equal(quality.snapshot().fps,null);
const fixedQualityTest=aq.DungeonAdaptiveQualityV1.create({fixed:0});
for(let i=0;i<500;i++)fixedQualityTest.sample(i*100);
assert.equal(fixedQualityTest.profile().name,'full');
console.log('PASS: adaptive visual quality hysteresis, recovery, pause and fixed mode');


const faultsWindow={};new vm.Script(read('assets/fault_isolation_v1.js').toString()).runInNewContext({window:faultsWindow});
let faultClock=0,faultCalls=0;
const isolator=faultsWindow.DungeonFaultIsolationV1.create({clock:()=>faultClock});
for(let i=0;i<3;i++)assert.equal(isolator.run('thumbnail',()=>{faultCalls++;throw Error('private-data')},{cooldown:3000}),false);
assert.equal(isolator.run('thumbnail',()=>faultCalls++),false);
assert.equal(faultCalls,3);
assert.equal(isolator.run('weather',()=>faultCalls++),true);
faultClock=3001;assert.equal(isolator.run('thumbnail',()=>faultCalls++),true);
assert.equal(isolator.snapshot().systems.find(x=>x.id==='thumbnail').recoveries,1);
assert(!JSON.stringify(isolator.snapshot()).includes('private-data'));
for(let i=0;i<100;i++){isolator.fail('weather',Error('test'));isolator.recover('weather');}
assert.equal(isolator.snapshot().events.length,40);
console.log('PASS: runtime isolation, cooldown, recovery, bounded diagnostics and redaction');


const saveWindow={};
for(const file of ['engine_foundation_v1','engine_events_save_v1'])new vm.Script(read('assets/'+file+'.js').toString()).runInNewContext({window:saveWindow});
const secureSave=saveWindow.DungeonSaveV1,saveScenes={wreck:[],trail:[]};
const saveActor={v:1,scene:'wreck',hp:16,maxHp:16,party:[0,1,2,3],seen:[],notes:[],items:[],flags:{},visits:{wreck:1},worldMinutes:960};
const saveMap=new Map(),saveStorage={getItem:k=>saveMap.get(k)??null,setItem:(k,v)=>saveMap.set(k,v)};
assert(secureSave.write(saveStorage,'game',saveActor,saveScenes));
const firstSave=saveMap.get('game');
assert(secureSave.write(saveStorage,'game',saveActor,saveScenes));
assert.equal(saveMap.get('game'),firstSave);
assert(!saveMap.has(secureSave.backupKey('game')));
saveActor.worldMinutes=990;
assert(secureSave.write(saveStorage,'game',saveActor,saveScenes));
assert.equal(secureSave.previous(saveStorage,'game',saveScenes).worldMinutes,960);
const tampered=JSON.parse(saveMap.get('game'));tampered.hp=2;
saveMap.set('game',JSON.stringify(tampered));
const damaged=saveMap.get('game');
assert.equal(secureSave.read(saveStorage,'game',saveScenes),null);
assert(secureSave.diagnostics().writeProtected);
assert(!secureSave.write(saveStorage,'game',saveActor,saveScenes));
assert.equal(saveMap.get('game'),damaged);
secureSave.allowReplacement();
assert(secureSave.write(saveStorage,'game',secureSave.previous(saveStorage,'game',saveScenes),saveScenes));
assert.equal(secureSave.read(saveStorage,'game',saveScenes).worldMinutes,960);
assert.equal(secureSave.parse(JSON.stringify(saveActor),saveScenes).worldMinutes,990);
assert(secureSave.write(saveStorage,'test',saveActor,saveScenes));
assert.equal(secureSave.previous(saveStorage,'test',saveScenes),null);
const beforeQuota=saveMap.get('game');saveActor.worldMinutes=1200;
const quotaStorage={getItem:k=>saveMap.get(k)??null,setItem:(k,v)=>{if(k==='game.previous-v1')throw Error('quota');saveMap.set(k,v);}};
assert(!secureSave.write(quotaStorage,'game',saveActor,saveScenes));
assert.equal(saveMap.get('game'),beforeQuota);
console.log('PASS: verified writes, integrity checks, previous recovery, legacy compatibility, separate slots and quota safety');


const legacyActor={v:1,scene:'wreck',hp:16,maxHp:16,party:[0,1,2,3],seen:['rareGoblin'],notes:['拾鐵小妖'],items:['x'],flags:{},visits:{wreck:1},worldMinutes:960,wallet:{silver:8,copper:19},forestRare:{checkedDays:{goblin:3},sighted:{goblin:true},hints:{},ingredients:{x:2},goblinGearTaken:true},extra:{future:1},travelLog:[{message:'拾鐵小妖'}]};
const originalLegacy=JSON.stringify(legacyActor);
const migratedDomain=secureSave.prepare(legacyActor,saveScenes);
assert.equal(JSON.stringify(legacyActor),originalLegacy);
assert.equal(migratedDomain.engineSave.schema,1);
assert.equal(migratedDomain.engineSave.domains.forestRare,1);
assert.equal(migratedDomain.wallet.silver,8);
assert.equal(migratedDomain.items[0],'x');
assert.equal(migratedDomain.extra.future,1);
assert.equal(migratedDomain.forestRare.checkedDays.beetle,3);
assert.equal(migratedDomain.forestRare.ingredients.x,2);
assert(migratedDomain.forestRare.beetleGearTaken);
assert.equal(migratedDomain.notes[0],'鏽殼甲蟲');
assert(migratedDomain.seen.includes('rareGoblin')&&migratedDomain.seen.includes('rareBeetle'));
assert(!Object.hasOwn(migratedDomain,'routeDiscovery'),'Legacy route availability must be handled by live route migration');
assert.equal(JSON.stringify(secureSave.prepare(migratedDomain,saveScenes)),JSON.stringify(migratedDomain));
assert.equal(secureSave.parse(secureSave.exportText(migratedDomain,saveScenes),saveScenes).wallet.copper,19);
const futureDomain=JSON.parse(JSON.stringify(migratedDomain));futureDomain.engineSave.domains.wallet=2;
assert.throws(()=>secureSave.prepare(futureDomain,saveScenes),/系統版本不相容/);
console.log('PASS: domain migration preserves progress, old route semantics, unknown fields and rejects unsupported known versions');


const objectWindow={};for(const f of ['object_investigation_v1','wreck_current_layout_v1','forest_v4_spawns'])new vm.Script(read('assets/'+f+'.js').toString()).runInNewContext({window:objectWindow});
const investigation=objectWindow.DungeonObjectInvestigationV1;
const forestObjects=[...objectWindow.DUNGEON_WRECK_CURRENT_LAYOUT.scenes.wreck,...objectWindow.DUNGEON_FOREST_V4_SPAWNS];
for(const o of forestObjects){assert(investigation.describe(o),'Missing investigation '+o.id);assert.equal(investigation.describe(o).collectible,false);}
const wagonObject=forestObjects.find(o=>o.assetId==='forest4_wagon');
assert.equal(investigation.describe(wagonObject,[{id:'sample'}]).visualState,'resource-available');
assert.equal(investigation.describe(wagonObject,[]).visualState,'normal');
assert.equal(investigation.describe(wagonObject,[]).type,'container');
console.log('PASS: investigation coverage and resource-state separation');


const lifeCore=objectWindow.DungeonObjectInvestigationV1,lifeActor=JSON.parse(JSON.stringify(legacyActor));
const liveFlower=forestObjects.find(o=>o.assetId==='forest4_white_flower'),liveRock=forestObjects.find(o=>o.assetId==='forest4_rock_group');
assert(lifeCore.inspect(lifeActor,'wreck',wagonObject));
assert(!lifeCore.inspect(lifeActor,'wreck',wagonObject));
assert(lifeCore.collect(lifeActor,'wreck',wagonObject)&&lifeCore.visible(lifeActor,'wreck',wagonObject));
const cleanupEvent={id:'cleanup-1',scene:'wreck',kind:'cleanup',targets:[wagonObject.id]};
assert(lifeCore.applyWorldEvent(lifeActor,cleanupEvent,forestObjects));
assert(!lifeCore.visible(lifeActor,'wreck',wagonObject)&&lifeCore.visible(lifeActor,'trail',wagonObject));
const decayEvent={id:'decay-1',scene:'wreck',kind:'decay',targets:[liveFlower.id]};
const growthEvent={id:'grow-1',scene:'wreck',kind:'regrowth',targets:[liveFlower.id]};
assert(lifeCore.applyWorldEvent(lifeActor,decayEvent,forestObjects)&&!lifeCore.visible(lifeActor,'wreck',liveFlower));
assert(lifeCore.applyWorldEvent(lifeActor,growthEvent,forestObjects)&&lifeCore.visible(lifeActor,'wreck',liveFlower));
assert(!lifeCore.applyWorldEvent(lifeActor,decayEvent,forestObjects));
assert(!lifeCore.applyWorldEvent(lifeActor,{id:'bad',scene:'wreck',kind:'cleanup',targets:[liveRock.id]},forestObjects));
const loadedWorld=secureSave.parse(secureSave.exportText(lifeActor,saveScenes),saveScenes);
assert.equal(loadedWorld.engineSave.domains.objectWorld,1);
assert(!lifeCore.visible(loadedWorld,'wreck',wagonObject)&&lifeCore.visible(loadedWorld,'wreck',liveFlower));
assert(!lifeCore.applyWorldEvent(loadedWorld,cleanupEvent,forestObjects));
console.log('PASS: object world state, event replay safety, scene scope and save roundtrip');


const openingWindow={};new vm.Script(read('assets/opening_progression_v1.js').toString()).runInNewContext({window:openingWindow});
const opening=openingWindow.DungeonOpeningProgressionV1;
const openingActor={scene:'wreck',flags:{},worldMinutes:960,exploration:{counts:{wreck:0}}};
for(let i=0;i<1000;i++){
 if(opening.view(openingActor).canExplore){openingActor.worldMinutes+=10;openingActor.exploration.counts.wreck++;}
}
assert.equal(openingActor.worldMinutes,990);assert.equal(openingActor.exploration.counts.wreck,3);
assert(opening.markCue(openingActor));assert(!opening.markCue(openingActor));
openingActor.scene='trail';assert(opening.view(openingActor).canExplore);
openingActor.scene='wreck';assert(!opening.view(openingActor).canExplore);
openingActor.flags.rescued=true;assert(opening.view(openingActor).canExplore);
assert(opening.view({scene:'wreck',flags:{}}).canExplore);
console.log('PASS: opening investigation exhausts without time drift; cue once; post-rescue exploration remains available');


const openingDeadlineActor={scene:'wreck',flags:{},worldMinutes:996,exploration:{counts:{wreck:0}},visits:{wreck:1}};
assert(opening.view(openingDeadlineActor,13).canExplore);
openingDeadlineActor.worldMinutes=997;assert(!opening.view(openingDeadlineActor,13).canExplore);
assert.equal(opening.view(openingDeadlineActor,13).latestDeparture,1006);
assert(opening.markCue(openingDeadlineActor,13));
const reloadedOpening=JSON.parse(JSON.stringify(openingDeadlineActor));
assert(opening.view(reloadedOpening,13).needsCue,'Departure dialogue must remain resumable');
assert(!opening.markCue(reloadedOpening,13),'Do not duplicate travel log cue');
assert(opening.finish(reloadedOpening));
assert(!opening.view(reloadedOpening,13).needsCue);
reloadedOpening.scene='trail';assert(opening.view(reloadedOpening,13).canExplore);
const oldLateOpening={scene:'wreck',worldMinutes:1500,flags:{},exploration:{counts:{wreck:0}}};
assert(!opening.view(oldLateOpening,13).canExplore);assert.equal(oldLateOpening.worldMinutes,1500);
assert(990+13<opening.FIRST_DUSK);
console.log('PASS: first-dusk deadline, travel reserve, resumable departure cue and no legacy time rewind');
