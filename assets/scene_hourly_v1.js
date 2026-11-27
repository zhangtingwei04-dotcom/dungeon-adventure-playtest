/* Scene hourly environment: one update per site and game-clock hour, no time cost or catch-up reward. */
(function(root){'use strict';
const record=x=>x&&typeof x==='object'&&!Array.isArray(x);
function step(actor,site,{materials=[],nativeStock=false,blocked=false,after=null}={}){
 if(blocked||!actor?.exploration||!Number.isFinite(actor.worldMinutes)||actor.scene!==site)return null;
 const e=actor.exploration;if(!record(e.hourlyResourceRefresh))e.hourlyResourceRefresh={};
 const hour=Math.floor(actor.worldMinutes/60),prev=e.hourlyResourceRefresh[site];
 if(prev===hour)return null;
 e.hourlyResourceRefresh[site]=hour;
 if(!record(e.counts))e.counts={};if(!record(e.pending))e.pending={};
 const first=!Number.isFinite(prev),backward=Number.isFinite(prev)&&prev>hour;
 if(backward)return {hour,changed:false,material:null,finds:[]};
 e.counts[site]=(Number.isFinite(e.counts[site])?e.counts[site]:0)+1;
 const queue=Array.isArray(e.pending[site])?e.pending[site]:(e.pending[site]=[]);
 let material=null;
 if(!first&&!nativeStock&&materials.length&&queue.length<3){
  const id=site+'-hour-'+hour;if(!queue.some(x=>x.id===id)){material=materials[hour%materials.length];queue.push({id,material});}
 }
 let h=2166136261;for(const ch of String(actor.seed??0)+'|hour|'+site+'|'+hour)h=Math.imul(h^ch.charCodeAt(0),16777619);
 const random=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};
 const finds=after?.(actor,random)||[];
 return {hour,changed:!first,material,finds};
}
root.DungeonSceneHourlyV1=Object.freeze({step});
})(typeof window==='undefined'?globalThis:window);
