/* Lantern Core V1: existing character health and visual preview boundaries. */
(function(root){
 'use strict';
 function health(actor){
  const rawMax=Number(actor?.maxHp),rawHp=Number(actor?.hp);
  const max=Number.isFinite(rawMax)?Math.max(1,rawMax):1;
  const hp=Number.isFinite(rawHp)?Math.max(0,Math.min(max,rawHp)):0;
  const ratio=hp/max;
  return Object.freeze({hp,max,ratio,percent:ratio*100,condition:ratio>.75?'normal':ratio>.5?'tired':ratio>.25?'weak':'critical'});
 }
 function effects(actor,allowed,preview=[]){
  const real=Array.isArray(actor?.physicalStatusEffects)?actor.physicalStatusEffects:[];
  return [...new Set([...real,...preview])].filter(id=>Object.hasOwn(allowed,id));
 }
 root.LanternCharacterCoreV1=Object.freeze({health,effects});
})(window);
