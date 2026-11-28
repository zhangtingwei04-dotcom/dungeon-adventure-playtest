/* 心火修煉與天資獨立原型；不改正式存檔、時間或戰鬥。 */
(function(root){'use strict';if(!root.DungeonMindCoreV1)throw Error('mind.core required');if(root.DungeonMindGrowthV1)throw Error('duplicate mind growth');root.DungeonMindGrowthV1=(function growth(core){
 const stats=Object.freeze(["capacity","output","recovery","control","stability","perception"]);
 const labels=Object.freeze({capacity:"容量",output:"輸出",recovery:"回復",control:"控制",stability:"穩定",perception:"感知"});
 const cap=Object.freeze([100,300,800,2000,5000,12000,30000]);
 const out=Object.freeze([20,60,180,500,1400,4000,12000]);
 const rec=Object.freeze([1,3,8,20,50,120,300]);
 const rates=Object.freeze({daily:0.5,rest:1,meditate:1.5,sleep:1.25,battle:0.1,unconscious:0.25});
 const training=Object.freeze({meditate:["capacity","stability"],breathing:["recovery"],fundamentals:["control","stability"],burst:["output"],observe:["perception"],practice:["control","output"]});
 const round=n=>Math.round(n*1e6)/1e6;
 const unit=n=>Number.isFinite(n)&&n>=0&&n<=1;
 const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
 const validTalents=t=>!!t&&stats.every(k=>integer(t[k],3,18));
 function roll(previous=null,locked=[],rng=Math.random){
  if(!Array.isArray(locked)||locked.length>3||new Set(locked).size!==locked.length||locked.some(k=>!stats.includes(k))||locked.length&&!validTalents(previous))throw Error("INVALID_LOCKS");
  const dice={},values={};for(const k of stats){if(locked.includes(k)){values[k]=previous[k];dice[k]=null;continue}const d=Array.from({length:3},()=>{const x=rng();if(!Number.isFinite(x)||x<0||x>=1)throw Error("INVALID_RNG");return 1+Math.floor(x*6)});dice[k]=d;values[k]=d.reduce((a,b)=>a+b,0)}
  return {values,dice,locked:[...locked]};
 }
 function rank(n){if(!integer(n,3,18))throw Error("INVALID_TALENT");return n<=5?"低劣":n<=8?"較弱":n<=12?"普通":n<=15?"優秀":n<=17?"卓越":"天才"}
 function limits(realm){if(!integer(realm,0,6))throw Error("INVALID_REALM");return {capacity:cap[realm],output:out[realm],recovery:rec[realm],control:100,stability:100,perception:100}}
 function create(talents){if(!validTalents(talents))throw Error("INVALID_TALENT");return {schema:1,realm:0,innate:{...talents},modifiers:Object.fromEntries(stats.map(k=>[k,0])),abilities:{capacity:30,output:6,recovery:0.2,control:10,stability:10,perception:10},energy:30,trainingMinutes:0}}
 function validate(s){if(!s||!integer(s.realm,0,6)||!validTalents(s.innate)||!Number.isSafeInteger(s.trainingMinutes)||s.trainingMinutes<0)return false;const l=limits(s.realm);return stats.every(k=>Number.isFinite(s.abilities?.[k])&&s.abilities[k]>=0&&s.abilities[k]<=l[k]&&Number.isFinite(s.modifiers?.[k])&&s.modifiers[k]>=0)&&Number.isFinite(s.energy)&&s.energy>=0&&s.energy<=s.abilities.capacity}
 function requireState(s){if(!validate(s))throw Error("INVALID_STATE")}
 function recover(s,minutes,{mode="daily",condition=1}={}){requireState(s);if(!integer(minutes,0,1440)||!Object.hasOwn(rates,mode)||!unit(condition))throw Error("INVALID_RECOVERY");const amount=round(Math.min(s.abilities.capacity-s.energy,minutes*s.abilities.recovery*rates[mode]*condition));return {state:{...s,energy:round(s.energy+amount)},recovered:amount}}
 function train(s,action,minutes,{condition=1,quality=1}={}){
  requireState(s);if(!Object.hasOwn(training,action)||!integer(minutes,1,1440)||!unit(condition)||!unit(quality)||!Number.isSafeInteger(s.trainingMinutes+minutes))throw Error("INVALID_TRAINING");
  const l=limits(s.realm),abilities={...s.abilities},gains={};
  // Prototype: 1% of current realm cap per 60 effective minutes at talent 10.5. Longer blocks taper, no hard daily cap.
  const time=Math.min(minutes,60)+Math.max(0,minutes-60)*0.25;
  for(const k of training[action]){const talent=s.innate[k]+s.modifiers[k];const gain=Math.max(0,Math.min(l[k]-abilities[k],l[k]*0.01*time/60*(talent/10.5)*condition*quality));const next=round(Math.min(l[k],abilities[k]+gain));gains[k]=round(next-abilities[k]);abilities[k]=next}
  return {state:{...s,abilities,trainingMinutes:s.trainingMinutes+minutes},gains};
 }
 // Explicit verified breakthrough event only; no automatic capacity threshold or death reward.
 function breakthrough(s,{approved=false}={}){requireState(s);if(approved!==true||s.realm===6)return {ok:false,state:s};return {ok:true,state:{...s,realm:s.realm+1}}}
 return Object.freeze({version:"1.0.0",stats,labels,cap,out,rec,limits,roll,rank,create,validate,recover,train,breakthrough,training,realms:core.realms});
})(root.DungeonMindCoreV1);if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'mind.growth',version:'1.0.0',requires:['mind.core']});})(window);
