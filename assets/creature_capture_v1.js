/* Shared capture policy. Uses real HP; additional attributes can be supplied once implemented. */
(function(root){
 'use strict';
 const rules=Object.freeze({beetle:{chance:.78,seconds:2},butterfly:{chance:.40,seconds:3},rabbit:{chance:.28,seconds:3.5},bird:{chance:.16,seconds:4},goldenRabbit:{chance:.09,seconds:4.5}});
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function policy(actor,kind){
  const rule=rules[kind];if(!rule)return null;
  const hp=Number(actor?.hp),max=Number(actor?.maxHp);
  const condition=Number.isFinite(hp)&&Number.isFinite(max)&&max>0?clamp(hp/max,0,1):0;
  return {allowed:condition>0,chance:condition>0?rule.chance*(.3+.7*condition):0,ms:Math.round(rule.seconds*1000*(1+.65*(1-condition)))};
 }
 function resolve(actor,kind,roll=Math.random()){const p=policy(actor,kind);return !!p?.allowed&&roll<p.chance;}
 root.DungeonCreatureCaptureV1=Object.freeze({version:'1.0.0',policy,resolve});
})(window);
