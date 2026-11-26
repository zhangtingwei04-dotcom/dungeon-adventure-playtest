/* Lantern Core V1: shared scene artwork selection; renderer and assets remain independent. */
(function(root){
 'use strict';
 function select(scene, state={}){
  if(scene==='wreck'&&!state.thumbnail&&state.inBattle&&state.battleReady)return 'battle';
  if(scene==='wreck'){
   if(state.emptyForestReady)return 'empty-forest';
   if(state.cleared)return 'cleared';
   if(state.approvedWreckReady)return 'approved-wreck';
   if(state.wreckPanoramaReady)return 'wreck-panorama';
  }
  if(scene==='trail'){
   if(state.trailForestReady)return 'trail-illustration';
   if(state.wreckPanoramaReady)return 'trail-panorama';
  }
  return 'procedural';
 }
 function illustrated(scene,state={}){return scene==='wreck'&&!!(state.emptyForestReady||state.approvedWreckReady||state.wreckPanoramaReady)||scene==='trail'&&!!(state.trailForestReady||state.wreckPanoramaReady);}
 function byDepth(objects,depth=o=>o.z){return [...objects].sort((a,b)=>(Number(depth(a))||0)-(Number(depth(b))||0));}
 root.LanternSceneCoreV1=Object.freeze({select,illustrated,byDepth});
})(window);
