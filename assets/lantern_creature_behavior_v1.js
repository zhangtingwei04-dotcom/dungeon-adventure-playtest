/* Lantern Core V1: bounded visual wildlife needs; no persisted resource mutation. */
(function(root){
 'use strict';
 const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
 function windMode(kind,env={}){return root.DungeonWeatherV1?.wildlifeWindMode(kind,env.behaviorWind??env.wind??0)||'normal';}
 function rabbitEnvironment(env={},spatial=false){
  const wind=windMode('rabbit',env),dangerous=['storm','blizzard'].includes(env.kind)||['shelter','hide'].includes(wind);
  return {wind,dangerous,bad:dangerous||env.kind==='rain'||(spatial&&(env.rain||0)>.65),foodAllowed:(env.snowCover||0)<.15&&env.kind!=='snow'};
 }
 function rabbitNeeds(b,dt,{bad=false,spatial=false,foodAvailable=true}={}){
  dt=clamp(dt,0,.12);
  const resting=spatial?['rest','shelter','hunker'].includes(b.mode):['rest','shelter'].includes(b.mode);
  const moving=spatial?b.mode==='point-hop':b.mode.includes('hop');
  b.hunger=clamp(b.hunger+dt*(b.mode==='graze'&&foodAvailable?-.11:.014));
  b.energy=clamp(b.energy+dt*(resting?.09:moving?-.045:-.008));
  b.alert=clamp(b.alert+dt*(bad?.16:-.12));
  b.comfort=clamp(b.comfort+dt*(bad&&b.mode!=='shelter'?-.08:.05));
  b.age+=dt;
  return b;
 }
 root.LanternCreatureBehaviorV1=Object.freeze({windMode,rabbitEnvironment,rabbitNeeds});
})(window);
