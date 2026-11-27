/* 燈火核心：地形與障礙物 V1.0。2.5D 世界圓形碰撞、連續掃掠與緩坡採樣。 */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
function create(world,{radius=18,obstacles=[],height=()=>0}={}){
 if(!Number.isFinite(radius)||radius<0)throw Error('invalid body radius');
 const solids=obstacles.map(o=>{if(![o.x,o.z,o.radius].every(Number.isFinite)||o.radius<=0)throw Error('invalid obstacle');return Object.freeze({...o});});
 function heightAt(p){const n=height(p);return Number.isFinite(n)?n:0;}
 function sweep(start,direction,distance){if(!Number.isFinite(distance)||distance<0)throw Error('invalid distance');
 const v=world.vector(direction),bnd=world.bounds;let allowed=distance,hit=null;
 // Clip on the original ray before checking solids, never clamp its axes independently.
 for(const [k,lo,hi] of [['x',bnd.minX,bnd.maxX],['z',bnd.minZ,bnd.maxZ]]){if(v[k]>1e-10)allowed=Math.min(allowed,(hi-start[k])/v[k]);else if(v[k]<-1e-10)allowed=Math.min(allowed,(lo-start[k])/v[k]);}
 allowed=Math.max(0,allowed);const boundary=allowed<distance-1e-8;
 for(const o of solids){const x=start.x-o.x,z=start.z-o.z,r=o.radius+radius,c=x*x+z*z-r*r,b=x*v.x+z*v.z,disc=b*b-c;
 if(c< -1e-7){if(b<0){allowed=0;hit=o;}continue;}
 if(b>=0||disc<=0)continue;
 const entry=-b-Math.sqrt(disc);if(entry>=-1e-7&&entry<=allowed){allowed=Math.max(0,entry-.02);hit=o;}
 }
 const next=world.advanceDistance(start,direction,allowed);
 return {...next,hit:!!hit||boundary||next.hit,obstacle:hit?.id??null};
 }
 function planJump(start,direction,opts){const q=sweep(start,direction,opts.distance);return {...world.planJump(start,direction,{...opts,distance:q.distance}),requested:opts.distance,obstacle:q.obstacle};}
 function project(pos){const p=world.project(pos);return {...p,y:p.y-heightAt(pos)*p.scale};}
 function footPose(pose,profile,pos,flat,mirror,rig=root.DungeonCreatureRigV1,lockedKeys=[]){
 const center=heightAt(pos),sign=mirror?-1:1,locked=new Set(lockedKeys);let corrected=0,limited=0;
 const legs=pose.legs.map(l=>{if(locked.has(l.key))return l;const def=profile.legs.find(d=>d.key===l.key);const ground=world.unprojectGround(flat.x+sign*(l.foot[0]-112)*flat.scale,flat.y+(def.foot[1]-153)*flat.scale);
 const delta=center-heightAt(ground)*world.projectGround(ground).scale/flat.scale;if(Math.abs(delta)<1e-8)return l;
 const a=rig.len(def.hip,def.knee),b=rig.len(def.knee,def.ankle);
 for(const f of [1,.75,.5,.25]){const foot=[l.foot[0],l.foot[1]+delta*f],ankle=rig.pawPose(def,foot).ankle,d=rig.len(l.hip,ankle);if(d>=a+b-.015||d<=Math.abs(a-b)+.015)continue;
 const knee=rig.solve(l.hip,ankle,a,b,def.bend),rows=rig.skinRows(def,l.hip,knee,ankle,foot,def.skin);if(rows.some((r,i)=>i&&r.t<=rows[i-1].t))continue;
 corrected++;if(f<1)limited++;return {...l,foot,ankle,knee,rows,reachError:Math.abs(rig.len(knee,ankle)-b)};}
 limited++;return l;
 });return {pose:{...pose,mode:corrected&&pose.mode==='stand'?'terrain-stand':pose.mode,legs},corrected,limited};
 }
 return Object.freeze({sweep,planJump,heightAt,project,footPose,obstacles:Object.freeze(solids),radius});
}
function hill({x,z,rx,rz,peak}){if(!(rx>0&&rz>0))throw Error('invalid hill');return p=>peak*(1-ease(Math.hypot((p.x-x)/rx,(p.z-z)/rz)));}
root.DungeonCreatureTerrainV1=Object.freeze({create,hill});
})(typeof window==='undefined'?globalThis:window);