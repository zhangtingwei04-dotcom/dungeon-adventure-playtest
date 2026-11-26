/* Lantern Core V1: shared material accounting over existing recovery and exploration save fields. */
(function(root){
 'use strict';
 const DAILY_LIMIT=2;
 function canCollect(daily){return Number.isFinite(daily?.collected)&&daily.collected>=0&&daily.collected<DAILY_LIMIT;}
 function add(parts,material,quantity=1){
  if(!parts||typeof material!=='string'||!material.trim()||['__proto__','constructor','prototype'].includes(material)||!Number.isSafeInteger(quantity)||quantity<=0)return false;
  const previous=Object.hasOwn(parts,material)?parts[material]:0;
  if(!Number.isSafeInteger(previous)||previous<0||!Number.isSafeInteger(previous+quantity))return false;
  parts[material]=previous+quantity;return true;
 }
 function collect(parts,daily,material,{commit=()=>true}={}){
  if(!canCollect(daily)||!parts||typeof material!=='string'||!material.trim()||['__proto__','constructor','prototype'].includes(material))return false;
  const previous=Object.hasOwn(parts,material)?parts[material]:0;
  if(!Number.isSafeInteger(previous)||previous<0||!Number.isSafeInteger(previous+1))return false;
  if(commit()===false)return false;
  if(!add(parts,material))return false;
  daily.collected++;return true;
 }
 root.LanternResourceCoreV1=Object.freeze({DAILY_LIMIT,canCollect,add,collect});
})(window);
