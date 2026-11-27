/* 燈火核心：生物自主行為 V1。決策與動畫解耦，所有位移交給碰撞核心。 */
(function(root){'use strict';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),wrap=n=>((n%8)+8)%8;
function create({detect=65,lose=88,attackRange=32,retreatHP=.25,alertMs=850,cooldownMs=2200,restMs=2100,roamMs=3400}={}){
 let state='rest',age=0,cooldown=0,roamDir=6,avoidDir=null,avoidAge=0,seen=false;
 function reset(){state='rest';age=0;cooldown=0;roamDir=6;avoidDir=null;avoidAge=0;seen=false;}
 function enter(s){if(state!==s){state=s;age=0;}}
 function heading(a,b){return wrap(Math.round(Math.atan2(b.x-a.x,b.z-a.z)*4/Math.PI));}
 function choose(pos,desired,sweep,goal,angle){
  let best=null;for(const d of [0,1,-1,2,-2,3,-3,4].map(n=>wrap(desired+n))){
   const q=sweep(pos,d,20);if(q.distance<8)continue;
   const gap=Math.min(wrap(d-desired),wrap(desired-d)),turn=Math.min(wrap(d-angle),wrap(angle-d));
   const score=q.distance-4*gap-1.1*turn+(goal?(dist(pos,goal)-dist(q,goal))*.35:0);
   if(!best||score>best.score)best={direction:d,score};}
  return best?.direction??null;
 }
 function step({dt,pos,angle,target=null,hp=1,busy=false,sweep,perception=null}){
  if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');
  age+=dt;cooldown=Math.max(0,cooldown-dt);avoidAge=Math.max(0,avoidAge-dt);
  const actual=target;if(perception)target=perception.memory;const d=target?dist(pos,target):Infinity;const visible=perception?!!target&&perception.confirmed:!!target&&d<=(seen?lose:detect);
  if(busy)return {state,mode:'pounce',direction:angle,busy:true};
  if(state==='attack'){enter('recover');cooldown=cooldownMs;}
  if(perception&&!visible&&target){seen=false;enter('alert');return {state:'suspect',mode:'alert',direction:heading(pos,target)};}
  if(!visible){seen=false;if(!['rest','roam'].includes(state))enter('rest');}
  else if(hp<=retreatHP){seen=true;enter('retreat');}
  else if(!seen||state==='retreat'){seen=true;enter('alert');}
  else if(state==='alert'&&age>=alertMs)enter('track');
  else if(state==='recover'&&age>=450)enter('track');
  if(state==='rest'&&age>=restMs){enter('roam');roamDir=wrap(roamDir+3);}
  if(state==='roam'&&age>=roamMs)enter('rest');
  const desired=target?heading(pos,target):angle;
  if(state==='track'&&d<=attackRange&&cooldown===0&&angle===desired&&(!perception||perception.attackAllowed)){
   const length=Math.max(0,d-14),q=sweep(pos,desired,length);
   if(!q.hit&&q.distance>=length-1e-7){enter('attack');return {state,mode:'pounce',direction:desired,attackDistance:length};}
  }
  if(state==='rest'||state==='alert'||state==='recover')return {state,mode:state==='rest'?'rest':'alert',direction:visible?desired:angle};
  if(state==='track'&&perception?.investigate&&d<=10){return {state:'search',mode:'alert',direction:wrap(desired+Math.floor(age/600)%3-1)};}
  if(state==='track'&&d<=attackRange&&cooldown>0&&!perception?.investigate)return {state,mode:'alert',direction:desired};
  const want=state==='roam'?roamDir:state==='retreat'?wrap(desired+4):desired;
  let dir=avoidAge>0&&avoidDir!==null&&sweep(pos,avoidDir,12).distance>=8?avoidDir:choose(pos,want,sweep,state==='track'?target:null,angle);
  if(dir===null)return {state:'blocked',mode:'alert',direction:angle};
  if(dir!==want&&dir!==avoidDir){avoidDir=dir;avoidAge=550;}else if(dir===want){avoidDir=null;avoidAge=0;}
  return {state:dir!==want?'avoid':state==='track'&&perception?.investigate?'search':state,mode:state==='roam'||state==='track'&&perception?.investigate?'walk':state==='retreat'?'run':'trot',direction:dir};
 }
 return Object.freeze({reset,step});
}
root.DungeonCreatureBehaviorV1=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);