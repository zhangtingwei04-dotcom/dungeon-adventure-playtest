/* Opening departure before the first dusk; no wall-clock progression or rewind. */
(function(root){
 'use strict';
 const MAX_SEARCHES=3,SEARCH_MINUTES=10,FIRST_DUSK=17*60;
 function view(actor,walkMinutes=13){
  const active=actor?.scene==='wreck'&&!actor.flags?.rescued;
  const departed=!!actor?.flags?.openingDepartureDone||Number(actor?.visits?.trail)>0;
  const count=Number.isFinite(actor?.exploration?.counts?.wreck)?Math.max(0,Math.floor(actor.exploration.counts.wreck)):0;
  const minute=Number.isFinite(actor?.worldMinutes)?actor.worldMinutes:960;
  const walk=Number.isFinite(walkMinutes)&&walkMinutes>=0?walkMinutes:13;
  const deadline=active&&!departed&&minute+SEARCH_MINUTES+walk>=FIRST_DUSK;
  const exhausted=active&&(count>=MAX_SEARCHES||deadline);
  return {active,count,exhausted,departed,deadline,canExplore:!exhausted,needsCue:exhausted&&!departed,latestDeparture:FIRST_DUSK-walk-1};
 }
 function markCue(actor,walkMinutes){
  if(!view(actor,walkMinutes).needsCue||actor.flags?.openingDepartureCue)return false;
  actor.flags.openingDepartureCue=true;return true;
 }
 function finish(actor){if(actor?.scene!=='wreck'||actor.flags?.rescued)return false;actor.flags.openingDepartureDone=true;return true;}
 root.DungeonOpeningProgressionV1=Object.freeze({MAX_SEARCHES,SEARCH_MINUTES,FIRST_DUSK,view,markCue,finish});
})(window);
