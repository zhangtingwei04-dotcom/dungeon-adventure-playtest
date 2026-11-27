/* 燈火核心：物件互動感知資料庫 V1.0。新增物件只需註冊資料，不改感知演算法。 */
(function(root){'use strict';
const defaults=Object.freeze({noise:0,duration:300,scent:0,scentMs:0});
const initial=[
 {id:'herb',name:'花草／苔蘚',category:'plant',noise:.18,duration:320,scent:.72,scentMs:14000},
 {id:'mushroom',name:'蘑菇',category:'fungus',noise:.24,duration:400,scent:.85,scentMs:16000},
 {id:'branch',name:'樹枝',category:'wood',noise:.56,duration:650,scent:.42,scentMs:10000},
 {id:'stone',name:'石頭',category:'mineral',noise:.72,duration:800,scent:.12,scentMs:5000},
 {id:'crate',name:'木箱／木桶',category:'container',noise:.87,duration:1050,scent:.35,scentMs:11000},
 {id:'carriage',name:'馬車部件',category:'structure',noise:1,duration:1200,scent:.28,scentMs:9000}
];
function create(entries=initial){
 const map=new Map();
 function register(entry){const p={...defaults,...entry};if(typeof p.id!=='string'||!/^[a-z][a-z0-9_-]*$/.test(p.id)||typeof p.name!=='string'||!p.name.trim()||typeof p.category!=='string'||!p.category.trim())throw Error('invalid object stimulus identity');if(map.has(p.id))throw Error('duplicate object stimulus '+p.id);
 if(![p.noise,p.duration,p.scent,p.scentMs].every(Number.isFinite)||p.noise<0||p.noise>1||p.scent<0||p.scent>1||p.duration<=0||p.scentMs<0)throw Error('invalid object stimulus values '+p.id);
 const value=Object.freeze({id:p.id,name:p.name,category:p.category,noise:p.noise,duration:p.duration,scent:p.scent,scentMs:p.scentMs});map.set(p.id,value);return value;}
 function get(id){return map.get(id);}
 function list(category){return [...map.values()].filter(p=>!category||p.category===category);}
 function snapshot(){return Object.freeze(Object.fromEntries(map));}
 entries.forEach(register);
 return Object.freeze({register,get,list,snapshot});
}
const registry=create();
root.DungeonObjectStimulusCatalogV1=Object.freeze({create,registry,defaults});
})(typeof window==='undefined'?globalThis:window);