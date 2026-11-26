/* Five fixed opening-wreck components. Contents are one-time and independent of ecology refresh. */
(function(root){
 'use strict';
 const parts=Object.freeze([
  Object.freeze({id:'v4-wagon0',assetId:'forest4_wagon',name:'破損馬車',event:true}),
  Object.freeze({id:'v4-wheel_flat7',assetId:'forest4_wheel_flat',name:'掉落車輪',event:true}),
  Object.freeze({id:'v4-crate_large1',assetId:'forest4_crate_large',name:'大型貨箱',material:'舊布片'}),
  Object.freeze({id:'v4-sack6',assetId:'forest4_sack',name:'布袋',material:'銅幣',quantity:8,wallet:'copper'}),
  Object.freeze({id:'v4-plank8',assetId:'forest4_plank',name:'木板',material:'破損木板'})
 ]);
 function get(id){return parts.find(p=>p.id===id)||null;}
 function taken(actor,id){
  const p=get(id);if(!p||p.event)return false;
  if(id==='v4-crate_large1'&&actor.flags?.openingClothTaken)return true;
  if(id==='v4-plank8'){const r=root.DungeonObjectInvestigationV1?.read(actor,'wreck',id);if(r?.collected>0||r?.resourceStock===0)return true;}
  return actor.flags?.openingComponentLoot?.[id]===true;
 }
 function take(actor,id){
  const p=get(id);if(!p||p.event||taken(actor,id)||actor.scene!=='wreck'||actor.flags?.rescued)return null;
  actor.flags=actor.flags||{};
  if(!actor.flags.openingComponentLoot||typeof actor.flags.openingComponentLoot!=='object')actor.flags.openingComponentLoot={};
  actor.flags.openingComponentLoot[id]=true;
  if(id==='v4-crate_large1')actor.flags.openingClothTaken=true;
  return p.material;
 }
 root.DungeonWreckComponentsV1=Object.freeze({version:'1.1.0',parts,get,taken,take});
})(window);
