/* Lantern Core V1: equipment ownership and facial priority adapters. */
(function(root){
 'use strict';
 function equipped(eq,catalog,slot){
  const item=Object.hasOwn(catalog,slot)?catalog[slot]:null;
  return item&&eq?.[slot]===item.id?item:null;
 }
 function change(eq,catalog,slot,equip){
  const item=Object.hasOwn(catalog,slot)?catalog[slot]:null;
  if(!item||!Array.isArray(eq?.owned)||!eq.owned.includes(item.id)||Boolean(equip)===(eq[slot]===item.id))return false;
  eq[slot]=equip?item.id:null;return true;
 }
 function face(frame,{sleep='awake',elapsed=0,effects=[]}={},motion=root.DungeonExpressionMotion){
  if(!effects.includes('unconscious'))motion.applySleepFacePriority(frame,sleep,elapsed);
  motion.applyAbnormalFacePriority(frame,effects);return frame;
 }
 function sleepFace(sleep,elapsed,motion=root.DungeonExpressionMotion){return motion.sleepFace(sleep,Math.max(0,elapsed));}
 root.LanternAppearanceCoreV1=Object.freeze({equipped,change,face,sleepFace});
})(window);
