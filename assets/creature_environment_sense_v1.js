/* 燈火核心：環境感知調節 V1.0。環境與物種設定分離，非真實氣象模型。 */
(function(root){'use strict';
const freeze=o=>Object.freeze(o),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const light=freeze({day:1,dawn:.68,dusk:.62,night:.24});
const weather=freeze({clear:freeze({vision:1,hearing:1,scent:1,activity:1,wash:0}),cloudy:freeze({vision:.9,hearing:1,scent:1,activity:1,wash:0}),rain:freeze({vision:.7,hearing:.65,scent:.8,activity:.7,wash:.65}),fog:freeze({vision:.42,hearing:.95,scent:1,activity:.8,wash:0}),snow:freeze({vision:.72,hearing:.8,scent:.65,activity:.7,wash:.25}),storm:freeze({vision:.48,hearing:.38,scent:.65,activity:.4,wash:1.5}),blizzard:freeze({vision:.27,hearing:.45,scent:.4,activity:.25,wash:.85})});
function profile(options={}){const p={nightVision:.5,weatherTolerance:.3,hearingTolerance:.2,scentTolerance:.2,activityTolerance:.25,...options};for(const k of ['nightVision','weatherTolerance','hearingTolerance','scentTolerance','activityTolerance'])if(!Number.isFinite(p[k])||p[k]<0||p[k]>1)throw Error('invalid species tolerance '+k);return freeze(p);}
function sample({time='day',condition='clear',wind=0}={},species=profile()){
 if(!Object.hasOwn(light,time)||!Object.hasOwn(weather,condition)||!Number.isFinite(wind))throw Error('invalid environment');
 const w=weather[condition],adapt=(v,t)=>v+(1-v)*t,windFactor=1-.24*clamp(wind,0,1);
 return freeze({vision:adapt(light[time],species.nightVision)*adapt(w.vision,species.weatherTolerance),hearing:adapt(w.hearing,species.hearingTolerance)*windFactor,scent:adapt(w.scent,species.scentTolerance),activity:adapt(w.activity,species.activityTolerance),wash:w.wash,time,condition});
}
root.DungeonCreatureEnvironmentSenseV1=freeze({profile,sample,light,weather});
})(typeof window==='undefined'?globalThis:window);