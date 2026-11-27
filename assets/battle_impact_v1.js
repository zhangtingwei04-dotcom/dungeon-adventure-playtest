/* 燈火戰鬥命中演出 V1.0；單次、短時、可關閉，不參與傷害計算。 */
(function(root){'use strict';
const clamp=x=>Math.max(0,Math.min(1,x));
function sample(age,{kind='hit',side='left',reduced=false}={}){
 const t=Math.max(0,age),u=clamp(t/220),decay=(1-u)**2,sign=side==='left'?1:-1;
 if(kind==='miss'||kind==='none'||u>=1)return {x:0,y:0,edge:0,guard:0,active:false};
 const blocked=kind==='guard';
 return {x:reduced?0:sign*Math.sin(t/17)*decay*(blocked?2:5),y:reduced?0:-Math.sin(t/22)*decay*2,edge:blocked?0:.22*decay,guard:blocked?.27*decay:0,active:true};
}
function swipe(age,impact){const u=(age-(impact-90))/150;return u<0||u>1?null:{progress:clamp(u),opacity:Math.sin(Math.PI*u)*.85};}
root.DungeonBattleImpactV1=Object.freeze({sample,swipe});
})(typeof window==='undefined'?globalThis:window);
