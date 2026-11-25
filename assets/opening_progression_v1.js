/* Finite opening investigation, not a global exploration limit. */
(function(root){
 'use strict';
 const MAX_SEARCHES=3;
 function view(actor){
  const active=actor?.scene==='wreck'&&!actor.flags?.rescued;
  const count=Number.isFinite(actor?.exploration?.counts?.wreck)?Math.max(0,Math.floor(actor.exploration.counts.wreck)):0;
  const exhausted=active&&count>=MAX_SEARCHES;
  return {active,count,exhausted,canExplore:!exhausted,needsCue:exhausted&&!actor.flags?.openingDepartureCue};
 }
 function markCue(actor){
  if(!view(actor).needsCue)return false;
  actor.flags.openingDepartureCue=true;return true;
 }
 root.DungeonOpeningProgressionV1=Object.freeze({MAX_SEARCHES,view,markCue});
})(window);
