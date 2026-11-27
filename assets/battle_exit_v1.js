/* 燈火戰鬥退場共用核心 V1.0：只決定演出，不改HP、戰利品或存檔。 */
(function(root){'use strict';
const clamp=n=>Math.max(0,Math.min(1,n));
const types=Object.freeze(['none','death','flee','player-retreat','player-defeat']);
function classify(result,{action,disposition=null}={}){
 const s=result?.state;if(!s?.result)return 'none';
 if(s.result==='defeat')return 'player-defeat';
 if(action==='retreat'&&s.result==='retreat')return 'player-retreat';
 // 物種／戰鬥規則必須明確授權死亡；0 HP 本身不代表死亡。
 if(disposition==='death'&&s.enemyHp===0&&s.result==='victory')return 'death';
 if(s.result==='victory'||s.result==='retreat')return 'flee';
 return 'none';
}
function plan(type,{route=[]}={}){
 if(!types.includes(type))throw Error('invalid exit type');
 if(type==='death')return [{mode:'down',duration:650},{mode:'corpse-hold',duration:450},{mode:'corpse-fade',duration:900}];
 if(type==='flee'){if(!route.length)throw Error('missing escape route');return route.map(p=>{if(![p.x,p.y,p.scale].every(Number.isFinite)||p.scale<=0||!Number.isInteger(p.dir)||p.dir<0||p.dir>7||!['walk','run','trot'].includes(p.mode))throw Error('invalid escape waypoint');return {mode:p.mode,dir:p.dir,to:{x:p.x,y:p.y,scale:p.scale}};});}
 if(type==='player-retreat')return [{mode:'player-fade',duration:650}];
 return [];
}
function visual(mode,age,duration){
 const p=duration>0?clamp(age/duration):1;
 if(mode==='corpse-hold'||mode==='corpse-fade')return {pose:'down',time:650,opacity:mode==='corpse-fade'?1-p:1,sceneOpacity:1};
 if(mode==='player-fade')return {pose:'alert',time:0,opacity:1,sceneOpacity:1-p};
 return {pose:mode,time:age,opacity:1,sceneOpacity:1};
}
// Quick lateral RPG exit: accelerate during the first fifth, then keep running.
function sprintDuration(distance,{speed=205,min=450,max=1400}={}){
 if(![distance,speed,min,max].every(Number.isFinite)||distance<0||speed<=0||min<=0||max<min)throw Error('invalid sprint timing');
 return Math.round(Math.max(min,Math.min(max,distance/speed*1000/.9)));
}
function sprintProgress(age,duration){
 if(!Number.isFinite(age)||!Number.isFinite(duration)||duration<=0)throw Error('invalid sprint progress');
 const u=clamp(age/duration),r=.2;
 return u<r?u*u/(2*r*(1-r/2)):(u-r/2)/(1-r/2);
}
root.DungeonBattleExitV1=Object.freeze({types,classify,plan,visual,sprintDuration,sprintProgress});
})(typeof window==='undefined'?globalThis:window);
