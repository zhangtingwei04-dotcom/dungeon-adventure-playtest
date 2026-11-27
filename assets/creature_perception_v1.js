/* 燈火核心：生物感知 V1.0，視野、遮蔽、聲源與有限記憶。 */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function occluded(a,b,obstacles){const dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;if(len<1e-9)return false;return obstacles.some(o=>{if(o.blocksVision===false)return false;const t=clamp(((o.x-a.x)*dx+(o.z-a.z)*dz)/len,0,1);return t>1e-6&&t<1-1e-6&&Math.hypot(a.x+dx*t-o.x,a.z+dz*t-o.z)<o.radius;});}
function create({visionRange=65,fov=120,hearingRange=48,memoryMs=4200,visualGain=1.9,hearingGain=.95,decay=.32,threshold=.65}={}){
 let suspicion=0,last=null,age=Infinity,confirmed=false;
 function reset(){suspicion=0;last=null;age=Infinity;confirmed=false;}
 function step({dt,pos,angle,target=null,noise=0,obstacles=[],environment={}}){if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');
 const d=target?distance(pos,target):Infinity,rad=angle*Math.PI/4,dot=d>1e-8&&target?((target.x-pos.x)*Math.sin(rad)+(target.z-pos.z)*Math.cos(rad))/d:1;
 const hidden=!!target&&occluded(pos,target,obstacles),visible=!!target&&!hidden&&d<=visionRange*(environment.vision??1)&&dot>=Math.cos(fov*Math.PI/360)-1e-9;
 const loud=clamp(Number(noise)||0,0,1),heard=!!target&&loud>0&&d<=hearingRange*(environment.hearing??1)*loud*(hidden?.65:1);
 const dtS=dt/1000;
 suspicion=clamp(suspicion+dtS*(visible?visualGain:heard?hearingGain:-decay),0,1);
 if(visible||heard){last={x:target.x,z:target.z};age=0;}else age+=dt;
 if(age>memoryMs){last=null;confirmed=false;}if(suspicion>=threshold&&last)confirmed=true;
 if(!last)confirmed=false;
 return {visible,heard,hidden,suspicion,confirmed,memory:last?{...last}:null,memoryAge:last?age:null,attackAllowed:visible&&confirmed,investigate:!!last&&!visible,source:visible?'vision':heard?'hearing':last?'memory':'none'};
 }
 return Object.freeze({step,reset,config:Object.freeze({visionRange,fov,hearingRange,memoryMs,threshold})});
}
root.DungeonCreaturePerceptionV1=Object.freeze({create,occluded});
})(typeof window==='undefined'?globalThis:window);