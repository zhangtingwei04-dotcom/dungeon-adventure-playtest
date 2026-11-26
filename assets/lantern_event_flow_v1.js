/* Lantern Core: synchronous interaction lifecycle, separate from durable world events. */
(function(root){
 'use strict';
 function create(){
  let serial=0,current=null;const history=[];
  function record(event,state){event.state=state;history.push({id:event.id,purpose:event.purpose,state});if(history.length>60)history.shift();}
  function begin(purpose){cancel();const event={id:++serial,purpose:purpose||'interaction',state:'waiting'};current=event;record(event,'waiting');return event.id;}
  function cancel(){if(!current)return false;const e=current;current=null;record(e,'cancelled');return true;}
  function resolve(id,fn){if(!current||current.id!==id||current.state!=='waiting')return false;const e=current;current=null;record(e,'executing');try{fn?.();record(e,'completed');return true;}catch(error){record(e,'failed');throw error;}}
  return Object.freeze({begin,cancel,resolve,status:()=>current?{...current}:null,history:()=>history.map(x=>({...x}))});
 }
 root.LanternEventFlowV1=Object.freeze({create});
})(window);
