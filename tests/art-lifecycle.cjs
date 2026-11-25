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
