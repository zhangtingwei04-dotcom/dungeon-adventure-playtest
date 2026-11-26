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
   const start=get('startVeil');if(start&&!start.classList.contains('hidden'))return null;
   for(const id of surfaces){if(id==='sceneDialogue'&&dialogue?.()==='investigation-entry')continue;const el=get(id);if(el&&!el.classList.contains('hidden'))return el;}
   return null;
  }
  function sync(){
   const a=active();get('app').dataset.dialogueLock=String(!!a);
   for(const id of areas){const el=get(id);if(el)el.inert=!!a&&!el.contains(a);}
  }
  function blocks(target,{mapOpen=false,infoAllowed=()=>false}={}){
   if(target?.closest?.('.battle-playtest[open]'))return false;
   const start=get('startVeil');if(start&&!start.classList.contains('hidden'))return !start.contains(target);
   const surface=active();if(!surface)return false;
   const map=get('journalVeil');
   if(mapOpen)return !(map?.contains(target)&&!target?.closest?.('.journal-tab:not(.selected)'));
   return !(surface.contains(target)||infoAllowed(target));
  }
  function run(fn){
   if(busy||active()||typeof fn!=='function')return false;
   if(!allow())return false;
   busy=true;
   try{fn();return true;}finally{busy=false;}
  }
  return Object.freeze({active,sync,run,allow,reset,blocks});
 }
 root.LanternActionCoreV1=Object.freeze({create});
})(window);
