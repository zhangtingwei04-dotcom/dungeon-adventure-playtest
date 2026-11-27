/* 燈火核心候選：近距攻擊姿勢，僅演出，使用既有四足骨架。 */
(function(root){'use strict';
const R=root.DungeonCreatureRigV1;
const timings=Object.freeze({claw:Object.freeze({duration:720,impact:280}),bite:Object.freeze({duration:650,impact:270})});
const ease=R.ease,mix=(a,b,u)=>a+(b-a)*ease(u);
function envelope(ms,keys){if(ms<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){const [t,v]=keys[i], [s,w]=keys[i-1];if(ms<=t)return mix(w,v,(ms-s)/(t-s));}return keys[keys.length-1][1];}
function sample(mode,ms,neutral,profile,{side='left',jawMax=34,headMax=5}={}){
 if(!timings[mode])throw Error('unsupported close attack');
 const t=R.clamp(ms,0,timings[mode].duration),impact=timings[mode].impact;
 const stage=t<impact-90?'預備':t<impact?'出招':t<impact+90?'命中':'收招';
 if(mode==='bite'){
  const jaw=envelope(t,[[0,0],[170,Math.min(22,jawMax)],[230,Math.min(22,jawMax)],[270,0],[650,0]]);
  const head=envelope(t,[[0,0],[170,-Math.min(4,headMax)],[270,Math.min(5,headMax)],[650,0]]);
  return {...neutral,mode:'bite',stage,jaw,head};
 }
 const def=profile.legs.find(l=>l.key===side&&l.id==='front');if(!def)throw Error('missing front claw');
 const dir=side==='left'?1:-1;
 const dx=dir*envelope(t,[[0,0],[190,-12],[280,22],[350,17],[720,0]]);
 const dy=envelope(t,[[0,0],[190,-22],[280,-10],[350,-4],[720,0]]);
 const legs=neutral.legs.map(l=>{if(l.key!==def.key)return l;
  const hip=l.hip,a=R.len(def.hip,def.knee),b=R.len(def.knee,def.ankle);
  for(const f of [1,.8,.6,.4,.2,0]){
   const foot=[l.foot[0]+dx*f,l.foot[1]+dy*f],ankle=R.pawPose(def,foot).ankle,d=R.len(hip,ankle);
   if(d>=a+b-.015||d<=Math.abs(a-b)+.015)continue;
   const knee=R.solve(hip,ankle,a,b,def.bend),rows=R.skinRows(def,hip,knee,ankle,foot,def.skin);
   if(rows.some((r,i)=>i&&r.t<=rows[i-1].t))continue;
   return {...l,foot,ankle,knee,rows,reachError:Math.abs(R.len(knee,ankle)-b)};
  }return l;
 });
 return {...neutral,mode:'claw',stage,legs,head:envelope(t,[[0,0],[190,-3],[280,4],[720,0]])};
}
// Short forward lunge, returning to the same ground anchor. No damage or hit testing.
function lunge(mode,ms){if(!timings[mode])return 0;const p=timings[mode];return envelope(ms,[[0,0],[p.impact-90,-.18],[p.impact,1],[p.impact+65,.85],[p.duration,0]]);}
root.DungeonCreatureCloseAttackV1=Object.freeze({timings,sample,lunge});
})(typeof window==='undefined'?globalThis:window);
