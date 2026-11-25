/* Bounded subsystem fault isolation. Never retries game actions or save writes. */
(function(root){
 'use strict';
 function create({clock=()=>Date.now(),maxSystems=32,maxEvents=40}={}){
  const states=new Map(),events=[];
  function state(id){
   if(!states.has(id)){
    if(states.size>=maxSystems)return null;
    states.set(id,{id,failures:0,consecutive:0,skips:0,recoveries:0,retryAt:0,lastError:null,lastAt:null});
   }return states.get(id);
  }
  function event(id,type){events.push({id,type,at:clock()});if(events.length>maxEvents)events.shift();}
  function fail(id,error,{cooldown=0,threshold=3}={}){
   const s=state(id);if(!s)return;
   s.failures++;s.consecutive++;s.lastAt=clock();
   // Keep error class only: do not retain arbitrary messages, URLs or save content.
   s.lastError=String(error?.name||'Error').slice(0,48);
   if(s.consecutive===1)event(id,'failed');
   if(cooldown>0&&s.consecutive>=threshold){s.retryAt=clock()+cooldown;event(id,'cooldown');}
  }
  function recover(id){
   const s=states.get(id);if(!s||!s.consecutive)return;
   s.consecutive=0;s.retryAt=0;s.recoveries++;event(id,'recovered');
  }
  function run(id,fn,options={}){
   const s=state(id);if(s&&s.retryAt>clock()){s.skips++;return false;}
   try{fn();recover(id);return true;}catch(error){fail(id,error,options);return false;}
  }
  function snapshot(){const now=clock();return {version:1,systems:[...states.values()].map(s=>({...s,state:s.retryAt>now?'cooldown':s.consecutive?'fault':'ready'})),events:events.map(e=>({...e}))};}
  return Object.freeze({run,fail,recover,snapshot});
 }
 root.DungeonFaultIsolationV1=Object.freeze({create});
})(window);
