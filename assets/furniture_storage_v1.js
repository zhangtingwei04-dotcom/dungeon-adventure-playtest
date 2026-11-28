/* Shared furniture storage: a unique item has exactly one location. */
(function(root){'use strict';
const home=(item)=>'container:'+item.container+':'+item.home;
const equip=(item)=>'equipped:'+item.slot;
function create(definitions){return {locations:Object.fromEntries(definitions.map(item=>[item.id,home(item)]))};}
function location(state,id){return state.locations[id]??null;}
function contents(state,definitions,container){return definitions.filter(item=>location(state,item.id)?.startsWith('container:'+container+':'));}
function apply(state,definitions,equipment,commands){
 const next={...state.locations},byId=new Map(definitions.map(item=>[item.id,item]));
 for(const {id,to} of commands){
  const item=byId.get(id);if(!item||!next[id])return {ok:false,reason:'找不到物品。'};
  if(![home(item),'carried',...(item.slot?[equip(item)]:[])].includes(to))return {ok:false,reason:'不適合的收納位置。'};
  if(to.startsWith('equipped:')){
   const other=definitions.find(v=>v.id!==id&&next[v.id]===to);
   if(other)next[other.id]=home(other);
  }
  next[id]=to;
 }
 const exclusive=Object.values(next).filter(v=>v!=='carried');
 if(new Set(exclusive).size!==exclusive.length)return {ok:false,reason:'收納位置已被占用。'};
 state.locations=next;
 for(const slot of new Set(definitions.map(v=>v.slot).filter(Boolean))){
  equipment[slot]=definitions.find(v=>next[v.id]==='equipped:'+slot)?.id??null;
 }
 return {ok:true};
}
root.DungeonFurnitureStorageV1=Object.freeze({version:'1.0.0',create,location,contents,home,equip,apply});
})(window);
