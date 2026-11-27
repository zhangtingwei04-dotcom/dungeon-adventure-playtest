/* 燈火核心：承重腳世界落點鎖定 V1.0。2.5D 固定鏡頭地面，配合方向專屬 IK。 */
(function(root){'use strict';
function create(world,rig=root.DungeonCreatureRigV1){
 const locks=new Map();let lastKey=null;
 function reset(){locks.clear();lastKey=null;}
 function screen(foot,p,mirror){return {x:p.x+(mirror?-1:1)*(foot[0]-112)*p.scale,y:p.y+(foot[1]-153)*p.scale};}
 function local(q,p,mirror){return [112+(mirror?-1:1)*(q.x-p.x)/p.scale,153+(q.y-p.y)/p.scale];}
 function update(pose,profile,motion,mode,ms,p,mirror,key){
  if(!['walk','trot','run'].includes(mode)){reset();return {pose,locked:0,released:0,anchors:[]};}
  const session=key+':'+mode;if(lastKey!==session){reset();lastKey=session;}
  const gait=motion.gaits[mode],phase=(ms/gait.period)%1,anchors=[];let locked=0,released=0;
  const legs=pose.legs.map(l=>{
   const def=profile.legs.find(q=>q.key===l.key);if(!def)throw Error('unknown foot');
   const support=motion.support(def,phase,def.far,gait);
   if(!support){locks.delete(l.key);return l;}
   let state=locks.get(l.key);
   if(!state){const q=screen(l.foot,p,mirror);state={anchor:world.unprojectGround(q.x,q.y),released:false};locks.set(l.key,state);}
   if(state.released){released++;return l;}
   const q=world.projectGround(state.anchor),foot=local(q,p,mirror),a=rig.len(def.hip,def.knee),b=rig.len(def.knee,def.ankle),ankle=rig.pawPose(def,foot).ankle,d=rig.len(l.hip,ankle);
   // A stretched or inverted leg is worse than a released plant. Wait until next swing to replant.
   if(d>=a+b-.015||d<=Math.abs(a-b)+.015||Math.abs(foot[0]-l.foot[0])>18||Math.abs(foot[1]-l.foot[1])>13){state.released=true;released++;return l;}
   const knee=rig.solve(l.hip,ankle,a,b,def.bend),rows=rig.skinRows(def,l.hip,knee,ankle,foot,def.skin);
   if(rows.some((r,i)=>i&&r.t<=rows[i-1].t)){state.released=true;released++;return l;}
   locked++;anchors.push({key:l.key,x:q.x,y:q.y,world:{...state.anchor}});
   return {...l,foot,ankle,knee,rows,reachError:Math.abs(rig.len(knee,ankle)-b)};
  });return {pose:{...pose,legs},locked,released,anchors};
 }
 return Object.freeze({reset,update,screen,local});
}
root.DungeonCreatureFootLockV1=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);