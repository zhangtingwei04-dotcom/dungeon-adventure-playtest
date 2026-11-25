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
