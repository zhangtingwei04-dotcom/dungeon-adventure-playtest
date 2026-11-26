const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function element(){return {classList:{add(){},remove(){},toggle(){}},children:[],setAttribute(){},replaceChildren(){this.children=[]},appendChild(x){this.children.push(x)}}}
const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)};
const window={};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/scene_dialogue_v1.js'),'utf8'),{window,document:{createElement:element}});
let count=0,completed=0;
const d=window.DungeonSceneDialogueV1.create({$,syncDialogueInputLock(){},endLabels:{},onComplete(){completed++}});
const lines=[{text:'first'},{text:'second'}];
d.openSceneDialogue(lines,'test',[{label:'choose',fn(){count++}}]);
assert.equal($('sceneDialogueChoices').children.length,0);
d.nextSceneDialogue();
const old=$('sceneDialogueChoices').children[0];
d.openSceneDialogue([{text:'new'}],'test',[{label:'choose',fn(){count++}}]);
old.onclick();assert.equal(count,0);assert.equal(d.sceneDialogueState.open,true);
const current=$('sceneDialogueChoices').children[0];
current.onclick();current.onclick();assert.equal(count,1);assert.equal(d.sceneDialogueState.open,false);
d.openSceneDialogue([{text:'finish'}]);d.nextSceneDialogue();d.nextSceneDialogue();assert.equal(completed,1);
console.log('Scene dialogue lifecycle passed');
