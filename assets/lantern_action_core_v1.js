/* Lantern Core V1: shared input policy; no game-state ownership. */
(function(root){
 'use strict';
 const surfaces=['dialogVeil','sceneDialogue','sceneInspection','encounterCue','battleSurface'];
 const areas=['placePrimaryActions','travelFeed','sceneFuturePanel','actions'];
 function create({get,dialogue,clock=Date.now,closeFeedback}){
  let last=-Infinity,busy=false;
  function active(){
   for(const id of surfaces){const el=get(id);if(el&&!el.classList.contains('hidden'))return el;}
   return null;
  }
  function sync(){
   const a=active();get('app').dataset.dialogueLock=String(!!a);
   for(const id of areas){const el=get(id);if(el)el.inert=!!a&&!el.contains(a);}
  }
  function run(fn){
   if(busy||active()||typeof fn!=='function')return false;
   const now=clock();if(now-last<300)return false;
   last=now;busy=true;
   try{fn();return true;}finally{busy=false;}
  }
  return Object.freeze({active,sync,run});
 }
 root.LanternActionCoreV1=Object.freeze({create});
})(window);
