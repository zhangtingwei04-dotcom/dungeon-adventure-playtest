/* 燈火核心：生物狀態表現 V1.0。需求與感知轉為受限姿態、呼吸及步態速度。 */
(function(root){'use strict';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),unit=n=>Number.isFinite(n)?clamp(n):0,above=(x,t)=>clamp((unit(x)-t)/(1-t));
function profile(opts={}){const p={fatigueSensitivity:1,hungerSensitivity:.65,thirstSensitivity:.8,injurySensitivity:1,fearSensitivity:.8,minSpeed:.42,...opts};for(const k of ['fatigueSensitivity','hungerSensitivity','thirstSensitivity','injurySensitivity','fearSensitivity','minSpeed'])if(!Number.isFinite(p[k])||p[k]<0||p[k]>1)throw Error('invalid expression profile '+k);return Object.freeze(p);}
function assess({fatigue=0,hunger=0,thirst=0,hp=1,suspicion=0,stimulus=0,courage=.6,mode='stand'}={},p=profile()){
 const f=above(fatigue,.35)*p.fatigueSensitivity,h=above(hunger,.55)*p.hungerSensitivity,t=above(thirst,.5)*p.thirstSensitivity,i=above(1-unit(hp),.12)*p.injurySensitivity,alert=Math.max(unit(suspicion),unit(stimulus)),fear=alert*(1-unit(courage))*p.fearSensitivity;
 const exertion=mode==='run'?.25:mode==='trot'?.12:0,stress=clamp(f*.55+t*.35+i*.3+fear*.25+exertion);
 return {fatigue:f,hunger:h,thirst:t,injury:i,alert,fear,stress,speed:clamp(1-.30*f-.12*h-.18*t-.32*i,p.minSpeed,1),breathHz:.36+.9*stress};
}
function create(p=profile()){let current=assess({},p),phase=0;
 function step(input,dt){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');const next=assess(input,p),a=1-Math.exp(-dt/300);for(const k of Object.keys(next))current[k]+=(next[k]-current[k])*a;phase=(phase+dt/1000*current.breathHz*2*Math.PI)%(2*Math.PI);return state();}
 function state(){return {...current,phase};}
 function reset(){current=assess({},p);phase=0;}
 return Object.freeze({step,state,reset});
}
function apply(pose,s,limits,mode){if(!pose||!['stand','walk','trot','run','rest','sniff','look'].includes(mode))return pose;
 const quiet=mode==='rest'?.55:1,headMax=limits.head||0,jawMax=limits.jaw||0,maneMax=limits.mane||0,tailMax=limits.tail||0,breath=(1-Math.cos(s.phase))*.5;
 const head=-.34*s.fatigue-.20*s.injury-.12*s.hunger+.26*s.alert-.18*s.fear+.07*s.stress*Math.sin(s.phase);
 const pant=(.30*s.stress*breath+.13*s.thirst*breath)*quiet;
 return {...pose,head:clamp((pose.head||0)+head*headMax,-headMax,headMax),jaw:clamp((pose.jaw||0)+pant*jawMax,0,jawMax),mane:clamp((pose.mane||0)+(.15*s.alert+.12*s.fear)*Math.sin(s.phase)*maneMax,-maneMax,maneMax),tail:clamp((pose.tail||0)+.14*s.fear*Math.sin(s.phase*2)*tailMax,-tailMax,tailMax)};
}
root.DungeonCreatureStatusMotionV1=Object.freeze({profile,assess,create,apply});
})(typeof window==='undefined'?globalThis:window);