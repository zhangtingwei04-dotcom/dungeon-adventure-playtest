const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const window={};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/lantern_action_core_v1.js'),'utf8'),{window});
const nodes=new Map();function get(id){if(!nodes.has(id))nodes.set(id,{hidden:true,dataset:{},classList:{contains(){return nodes.get(id).hidden}},contains(a){return a===this}});return nodes.get(id)}
let now=0,count=0;const core=window.LanternActionCoreV1.create({get,clock:()=>now});
assert.equal(core.run(()=>{count++;assert.equal(core.run(()=>count++),false)}),true);
assert.equal(core.run(()=>count++),false);now=301;
get('sceneDialogue').hidden=false;core.sync();assert.equal(get('actions').inert,true);assert.equal(core.run(()=>count++),false);
get('sceneDialogue').hidden=true;core.sync();assert.equal(get('actions').inert,false);
assert.equal(core.run(()=>count++),true);assert.equal(count,2);
now=700;assert.throws(()=>core.run(()=>{throw Error('test')}));now=1100;assert.equal(core.run(()=>count++),true);
console.log('Lantern action core passed');
