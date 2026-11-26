/* Lantern Core V1: shared input policy; no game-state ownership. */
(function(root){
 'use strict';
 const surfaces=['dialogVeil','sceneDialogue','sceneInspection','encounterCue','battleSurface'];
 const areas=['placePrimaryActions','travelFeed','sceneFuturePanel','actions'];
 function create({get,dialogue,clock=Date.now,closeFeedback}){
  let busy=false;const last=new Map();
  function allow(channel='interaction'){const now=clock();if(now-(last.get(channel)??-Infinity)<300)return false;last.set(channel,now);return true;}
  function reset(channel){last.delete(channel);}
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
   if(!allow())return false;
   busy=true;
   try{fn();return true;}finally{busy=false;}
  }
  return Object.freeze({active,sync,run,allow,reset});
 }
 root.LanternActionCoreV1=Object.freeze({create});
})(window);
