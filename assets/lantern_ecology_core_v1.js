/* Lantern Core V1: shared wildlife eligibility; weather service owns weather thresholds. */
(function(root){
 'use strict';
 const periods=Object.freeze({bird:Object.freeze(['dawn','day','dusk']),rabbit:Object.freeze(['dawn','dusk']),beetle:Object.freeze(['dusk','night']),butterfly:Object.freeze(['dawn','day','dusk'])});
 const kinds=Object.freeze(Object.keys(periods));
 function activePeriod(kind,phase){return !Object.hasOwn(periods,kind)||periods[kind].includes(phase);}
 function weatherAllowed(kind,environment){return !kinds.includes(kind)||!root.DungeonWeatherV1||root.DungeonWeatherV1.activity(kind,environment);}
 function visible(kind,phase,environment,{preview=false}={}){return (preview||activePeriod(kind,phase))&&weatherAllowed(kind,environment);}
 root.LanternEcologyCoreV1=Object.freeze({periods,kinds,activePeriod,weatherAllowed,visible});
})(window);
