/* 燈火核心：共用生活動作 V1.0。使用方向專屬頭頸／嘴部極限，無新增位移。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),ease=n=>{n=clamp(n,0,1);return n*n*(3-2*n);},wave=(t,period)=>(1-Math.cos(t*2*Math.PI/period))*.5;
const modes=Object.freeze(['sniff','eat','drink','look','rest']);
function sample(mode,ms){const t=Math.max(0,ms),w=ease(t/420);let head=0,jaw=0,mane=0,tail=0,rest=0;
 switch(mode){
 case 'sniff':head=-.42-.35*wave(t,850);mane=.12*Math.sin(t/240);tail=.08*Math.sin(t/340);break;
 case 'eat':head=-.60-.15*wave(t,1100);jaw=.28*wave(t,430);mane=.08*Math.sin(t/280);break;
 case 'drink':head=-.82-.10*wave(t,1250);jaw=.16*wave(t,650);break;
 case 'look':head=.18+.48*wave(t,1550);mane=.22*Math.sin(t/400);tail=.10*Math.sin(t/550);break;
 case 'rest':head=-.20+.10*Math.sin(t/700);mane=.12*Math.sin(t/700);tail=.06*Math.sin(t/900);rest=(.94+.06*wave(t,2300))*w;break;
 }return {head:head*w,jaw:jaw*w,mane:mane*w,tail:tail*w,rest};
}
function create({blendMs=280}={}){let mode=null,age=0,elapsed=blendMs,from=sample(null,0),current=from;
 function reset(){mode=null;age=0;elapsed=blendMs;from=sample(null,0);current=from;}
 function step(next,dt){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');next=modes.includes(next)?next:null;if(next!==mode){from={...current};elapsed=0;age=0;mode=next;}age+=dt;elapsed+=dt;const target=sample(mode,age),a=ease(elapsed/blendMs);current=Object.fromEntries(Object.keys(target).map(k=>[k,from[k]+(target[k]-from[k])*a]));return {...current,mode};}
 return Object.freeze({step,reset,state:()=>({...current,mode})});
}
function apply(pose,values,limits){if(!pose)return pose;return {...pose,head:clamp((pose.head||0)+values.head*(limits.head||0),-(limits.head||0),limits.head||0),jaw:clamp((pose.jaw||0)+values.jaw*(limits.jaw||0),0,limits.jaw||0),mane:clamp((pose.mane||0)+values.mane*(limits.mane||0),-(limits.mane||0),limits.mane||0),tail:clamp((pose.tail||0)+values.tail*(limits.tail||0),-(limits.tail||0),limits.tail||0)};}
root.DungeonCreatureLifeMotionV1=Object.freeze({modes,sample,create,apply});
})(typeof window==='undefined'?globalThis:window);