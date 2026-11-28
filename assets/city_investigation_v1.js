/* Housing investigation: state and action authority remain in the old game shell. */
(function(root){'use strict';
 const scenes=Object.freeze({'rental-room':['城鎮出租屋','住宅區・二樓私人房間'],'rental-corridor':['二樓公共走廊','住宅區・二樓住宿區'],'rental-street':['城鎮街道','住宅區・街道']});
 function objects(city,scene){return scene==='rental-room'?city.objects:scene==='rental-corridor'?[{id:'return',name:'房門'},{id:'stairs',name:'樓梯'}]:scene==='rental-street'?[{id:'return',name:'住宅入口'},{id:'report-office',name:'燈火會報到（流程測試）'}]:[];}
 function known(actor){return Array.isArray(actor.cityInvestigated?.[actor.scene])?actor.cityInvestigated[actor.scene]:[];}
 function discover(actor,city,clock,events){const found=objects(city,actor.scene).filter(o=>!known(actor).includes(o.id));if(!found.length)return [];
  actor.cityInvestigated??={};actor.cityInvestigated[actor.scene]=[...known(actor),...found.map(o=>o.id)];
  clock.advance(actor,2,{reason:'city-investigation',fromScene:actor.scene,toScene:actor.scene});
  events.appendTravel(actor,'discovery','調查周遭：發現'+found.map(o=>o.name).join('、')+'。','把值得留意的物件記了下來。');return found;
 }
 function visible(actor,city){return objects(city,actor.scene).filter(o=>known(actor).includes(o.id));}
 root.DungeonCityInvestigationV1=Object.freeze({scenes,objects,known,discover,visible});
})(window);
