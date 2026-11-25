/* Developer-only bounded render telemetry. No player state or external traffic. */
(function(root){
 'use strict';
 function create({enabled=false,clock=()=>performance.now(),limit=120}={}){
  if(!enabled)return null;
  limit=Math.max(8,Math.min(600,Math.floor(limit)||120));
  const frames=[],draws=[],costs=new Map(),loads=new Map(),starts=new Map();
  let previous=null,lastDraw=null;
  function append(a,n){if(!Number.isFinite(n)||n<0)return;a.push(n);if(a.length>limit)a.shift();}
  function summarize(a){if(!a.length)return null;const sorted=[...a].sort((x,y)=>x-y),avg=a.reduce((s,v)=>s+v,0)/a.length;return {count:a.length,avg,p95:sorted[Math.ceil(.95*a.length)-1],max:sorted[sorted.length-1]};}
  function frame(ms){if(previous!==null&&ms>previous)append(frames,ms-previous);previous=ms;}
  function draw(ms){if(lastDraw!==null&&ms>lastDraw)append(draws,ms-lastDraw);lastDraw=ms;}
  function pause(){previous=null;lastDraw=null;frames.length=0;draws.length=0;costs.clear();}
  function measure(name,fn){const t=clock();try{return fn();}finally{if(!costs.has(name)&&costs.size<16)costs.set(name,[]);const a=costs.get(name);if(a)append(a,clock()-t);}}
  function start(name){if(starts.size<24)starts.set(name,clock());}
  function finish(name,ok){if(!starts.has(name))return;const ms=clock()-starts.get(name);starts.delete(name);if(loads.size<24||loads.has(name))loads.set(name,{ms,ok:!!ok});}
  function snapshot(extra={}){const f=summarize(frames),d=summarize(draws);return {version:1,frameRate:f&&f.avg>0?1000/f.avg:null,drawRate:d&&d.avg>0?1000/d.avg:null,frameMs:f,drawIntervalMs:d,costs:Object.fromEntries([...costs].map(([k,a])=>[k,summarize(a)])),loads:Object.fromEntries(loads),...extra};}
  return Object.freeze({frame,draw,pause,measure,start,finish,snapshot});
 }
 root.DungeonPerformanceV1=Object.freeze({create});
})(window);
