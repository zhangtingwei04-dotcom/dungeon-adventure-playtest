/* 燈火戰鬥技藝核心 V1.0：資料與資格判定；戰鬥結算交由格擋核心。 */
(function(root){'use strict';
const freeze=o=>Object.freeze(o);
const categories=freeze(['戰技','身法','守勢','修習']);
const list=freeze([
 freeze({id:'unarmed-basic',name:'普通攻擊',actor:'hero',equipment:'unarmed',style:'徒手',category:'戰技',range:0,damageDelta:0,guardBonus:0,balanceBonus:0,cooldown:0,visual:'basic'}),
 freeze({id:'unarmed-heavy',name:'重拳',actor:'hero',equipment:'unarmed',style:'徒手',category:'戰技',range:0,damageDelta:2,guardBonus:12,balanceBonus:8,cooldown:1,visual:'heavy'}),
 freeze({id:'unarmed-sweep',name:'掃腿',actor:'hero',equipment:'unarmed',style:'徒手',category:'戰技',range:0,damageDelta:-1,guardBonus:3,balanceBonus:24,cooldown:1,visual:'sweep'}),
 freeze({id:'moss-claw',name:'前爪揮擊',actor:'monster',equipment:'natural',style:'苔棘鬃獸',category:'戰技',range:0,visual:'claw'}),
 freeze({id:'moss-pounce',name:'雙爪撲擊',actor:'monster',equipment:'natural',style:'苔棘鬃獸',category:'戰技',range:1,visual:'pounce'}),
 freeze({id:'moss-bite',name:'撕咬',actor:'monster',equipment:'natural',style:'苔棘鬃獸',category:'戰技',range:0,visual:'bite'}),
 freeze({id:'moss-guard',name:'沉身守勢',actor:'monster',equipment:'natural',style:'苔棘鬃獸',category:'守勢',range:0,visual:'guard'})
]);
const byId=id=>list.find(t=>t.id===id)||null;
const available=(actor,equipment)=>list.filter(t=>t.actor===actor&&t.equipment===equipment);
function check(id,{actor='hero',equipment='unarmed',distance=0,turn=0,cooldowns={},learned}={}){
 const t=byId(id);
 if(!t||t.actor!==actor||t.equipment!==equipment)return {ok:false,reason:'裝備或流派不符'};
 if(learned&&!learned.includes(id))return {ok:false,reason:'尚未習得'};
 if(distance>t.range)return {ok:false,reason:'距離不足'};
 const remaining=Math.max(0,(cooldowns[id]||0)-turn);
 return remaining?{ok:false,reason:'恢復中 '+remaining+' 回合',remaining}:{ok:true,technique:t};
}
function used(cooldowns,t,turn){return {...cooldowns,[t.id]:turn+t.cooldown};}
root.DungeonBattleTechniquesV1=freeze({categories,list,byId,available,check,used});
})(typeof window==='undefined'?globalThis:window);
