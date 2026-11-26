/* Lantern Core V1: world weather snapshots; presentation never owns persisted exposure. */
(function(root){
 'use strict';
 function create(weather){
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const actual=actor=>Object.freeze({...weather.at(actor.seed,actor.worldMinutes,actor.scene)});
  function presentation(actor,options={}){
   const base=actual(actor),kind=options.kind;
   let view={...base};
   if(kind&&Object.hasOwn(weather.kinds,kind)){
    const k=weather.kinds[kind],climate=weather.climate(actor.seed,actor.worldMinutes,kind),p=weather.profileFor(actor.scene);
    Object.assign(view,k,climate,{kind,temperature:(kind==='blizzard'?-6:kind==='snow'?-2:Math.max(6,climate.temperature))+p.temp,wind:k.wind*p.wind,rain:k.rain*p.rain,snow:(k.snow||0)*p.snow,windDir:-1});
   }
   if(Number.isFinite(options.wind))view.wind=clamp(options.wind,0,5)/5;
   if(Number.isFinite(options.windDir))view.windDir=clamp(options.windDir,-1,1);
   return Object.freeze(view);
  }
  function ecology(actor,options={}){
   const view=presentation(actor,options),shown=weather.environment();
   return Object.freeze({...view,snowCover:Math.max(view.snowCover||0,shown.snowCover||0),wind:view.wind??shown.behaviorWind??0});
  }
  function character(actor,core,indoor){return core.snapshot(actor,actual(actor),indoor);}
  return Object.freeze({actual,presentation,ecology,character});
 }
 root.LanternWorldEnvironmentV1=Object.freeze({create});
})(window);
