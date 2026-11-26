/* Lantern Core V1: location catalog and route rules. */
(function(root){
 'use strict';
 function create({names,routes,indoors}){
  const key=(a,b)=>[a,b].sort().join('|');
  const index=new Map(routes.map(r=>[key(r.a,r.b),Object.freeze({...r})]));
  const route=(a,b)=>index.get(key(a,b))||null;
  const carriage=(actor,a,b)=>!!(route(a,b)?.carriage&&actor.flags?.morning);
  function duration(actor,a,b,mode='walk'){const r=route(a,b);if(!r)return mode==='walk'?5:null;return mode==='carriage'?(carriage(actor,a,b)?r.carriage:null):r.walk;}
  function searchable(actor,from,to){if(!route(from,to))return false;if(((from==='gate'&&['street','lobby'].includes(to))||(from==='inn'&&to==='lobby'))&&!actor.flags?.morning)return false;if(to==='home'&&!actor.flags?.houseInvite)return false;return true;}
  return Object.freeze({key,route,carriage,duration,searchable,has:id=>Object.hasOwn(names,id),name:id=>names[id]?.[0]||id,indoor:id=>indoors.has(id)});
 }
 root.LanternLocationCoreV1=Object.freeze({create});
})(window);
