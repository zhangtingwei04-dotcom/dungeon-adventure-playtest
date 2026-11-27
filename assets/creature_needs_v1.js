/* 燈火核心：生物需求與性格 V1.0。需求為個體狀態，性格為可重用物種／個體設定。 */
(function(root){'use strict';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const keys=['courage','curiosity','territoriality','aggression'];
function profile(options={}){
 const p={courage:.55,curiosity:.6,territoriality:.5,aggression:.5,territoryRadius:60,hungerRate:.004,restRecovery:.045,...options};
 for(const k of keys)if(!Number.isFinite(p[k])||p[k]<0||p[k]>1)throw Error('invalid personality '+k);
 for(const k of ['territoryRadius','hungerRate','restRecovery'])if(!Number.isFinite(p[k])||p[k]<0)throw Error('invalid needs '+k);
 return Object.freeze(p);
}
const fatigueRates=Object.freeze({rest:0,stand:0,alert:.005,look:.005,sniff:.004,eat:0,drink:0,walk:.012,trot:.028,run:.065,pounce:.09,jump:.07,'jump-up':.05,slam:.08,'turn-step':.008,charge:.025,hit:.012,'heavy-hit':.018,rise:.012});
function create(species=profile(),initial={}){
 let hunger=0,fatigue=0,restNeeded=false,home={x:0,z:0};
 function reset(values=initial){hunger=clamp(values.hunger??.25);fatigue=clamp(values.fatigue??.15);home={...(values.home??{x:0,z:0})};restNeeded=fatigue>=.82;}
 function adjust(values){if(values.hunger!==undefined){if(!Number.isFinite(values.hunger))throw Error('invalid hunger');hunger=clamp(values.hunger);}if(values.fatigue!==undefined){if(!Number.isFinite(values.fatigue))throw Error('invalid fatigue');fatigue=clamp(values.fatigue);if(fatigue>=.82)restNeeded=true;else if(fatigue<=.35)restNeeded=false;}}
 function step({dt,mode='rest',environment={}}){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');const sec=dt/1000,rate=fatigueRates[mode]??0;
 hunger=clamp(hunger+sec*species.hungerRate*(1+rate*6));const exposure=1+(1-clamp(environment.activity??1))*.6;
 fatigue=clamp(fatigue+sec*(mode==='rest'?-species.restRecovery:mode==='stand'?-species.restRecovery*.3:rate*exposure));
 if(fatigue>=.82)restNeeded=true;else if(fatigue<=.35)restNeeded=false;return state();}
 function state(){return Object.freeze({hunger,fatigue,restNeeded,home:Object.freeze({...home}),species});}
 reset();return Object.freeze({step,state,adjust,reset});
}
function assess(needs,{target=null,hp=1,stimulus=null}={}){
 if(!needs)return null;const s=needs.species,h=needs.hunger,f=needs.fatigue,inside=!!target&&Math.hypot(target.x-needs.home.x,target.z-needs.home.z)<=s.territoryRadius;
 const drive=clamp(s.aggression*.6+s.courage*.18+h*.16+(inside?s.territoriality*.32:0)-f*.35);
 return Object.freeze({inside,drive,retreat:!!target&&(hp<=.25||s.courage<.24||f>=.92),attack:drive>=.45&&f<.78,rest:needs.restNeeded,roamFactor:clamp(1+h*.7-f*.55,.35,1.7),investigate:!!stimulus&&stimulus.investigate&&stimulus.score>=clamp(.64-s.curiosity*.48+f*.12+h*.03,.12,.75)&&!needs.restNeeded,ignore:!!stimulus&&stimulus.score<.08+(1-s.curiosity)*.24,retreatMode:f>=.8?'trot':'run'});
}
root.DungeonCreatureNeedsV1=Object.freeze({profile,create,assess});
})(typeof window==='undefined'?globalThis:window);