/* Housing animation orchestration. Visual snapshots never mutate the live actor. */
(function(root){'use strict';
 function create({core,wait,show,commit,valid=()=>true}){
  let busy=false;
  const snapshot=(actor,door)=>{const next=JSON.parse(JSON.stringify(actor));next.flags.furnitureOpen.door=door;return next;};
  async function door(actor,id,key){
   if(busy||!core.inspect(actor,id)?.actions.some(x=>x[0]===key))return {ok:false,reason:'目前無法移動。'};
   busy=true;
   const exit=actor.scene==='rental-room'&&key==='leave',enter=actor.scene==='rental-corridor'&&key==='return';
   try{
    if(exit){try{if(!core.isOpen(actor,'door')){show(snapshot(actor,true),'打開房門……');await wait(760);}if(!valid(actor))return {ok:false,reason:'移動已取消。'};
     show(snapshot(actor,true),'走出房間……');await wait(240);show(snapshot(actor,false),'隨手關上房門……');await wait(760);}catch(error){console.warn('Door visual fallback',error);}}
    if(!valid(actor))return {ok:false,reason:'移動已取消。'};
    const result=commit(actor,id,key);
    if(result.ok&&enter){try{show(snapshot(actor,true),'走進房間……');await wait(240);show(snapshot(actor,false),'隨手關上房門……');await wait(760);}catch(error){console.warn('Door visual fallback',error);}}
    return result;
   }finally{busy=false;}
  }
  return Object.freeze({door,busy:()=>busy});
 }
 root.DungeonCityTransitionsV1=Object.freeze({create});
})(window);
