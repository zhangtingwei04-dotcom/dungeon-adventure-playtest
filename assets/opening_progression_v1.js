/* Opening departure V2: actual game clock, concrete route actions, no search-count budget. */
(function(root){
 'use strict';
 const FIRST_DUSK=17*60,TRACK_INSPECT_MINUTES=2,FOLLOW_TRACK_MINUTES=10,SAFETY_MINUTES=5;
 function view(actor,walkMinutes=13){
  const departed=!!actor?.flags?.openingDepartureDone||Number(actor?.visits?.trail)>0;
  const active=actor?.scene==='wreck'&&!actor.flags?.rescued&&!departed;
  const minute=Number.isFinite(actor?.worldMinutes)?actor.worldMinutes:960;
  const walk=Number.isFinite(walkMinutes)&&walkMinutes>=0?walkMinutes:13;
  const routeKnown=Array.isArray(actor?.routeDiscovery?.known)&&actor.routeDiscovery.known.includes('trail|wreck');
  const tracksKnown=routeKnown||!!actor?.flags?.openingTracks;
  const remainingClueMinutes=routeKnown?0:FOLLOW_TRACK_MINUTES+(tracksKnown?0:TRACK_INSPECT_MINUTES);
  const latestDeparture=FIRST_DUSK-walk-1;
  const focusAt=latestDeparture-remainingClueMinutes-SAFETY_MINUTES;
  const deadline=active&&minute>=focusAt;
  return {active,exhausted:deadline,departed,deadline,canExplore:!deadline,needsCue:deadline,latestDeparture,focusAt,remainingClueMinutes,remainingMinutes:Math.max(0,latestDeparture-minute),routeKnown,tracksKnown};
 }
 function markCue(actor,walkMinutes){
  if(!view(actor,walkMinutes).needsCue||actor.flags?.openingDepartureCue)return false;
  actor.flags.openingDepartureCue=true;return true;
 }
 function finish(actor){if(actor?.scene!=='wreck'||actor.flags?.rescued)return false;actor.flags.openingDepartureDone=true;return true;}
 root.DungeonOpeningProgressionV1=Object.freeze({FIRST_DUSK,TRACK_INSPECT_MINUTES,FOLLOW_TRACK_MINUTES,SAFETY_MINUTES,view,markCue,finish});
})(window);
