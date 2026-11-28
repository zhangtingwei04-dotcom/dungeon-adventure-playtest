/* 城鎮開場獨立原型；沿用世界時計、旅途紀錄及裝備ID，不寫舊存檔。 */
(function(root){'use strict';root.DungeonCityOpeningV1=(function cityCore(clock,events,time){
 const slots=Object.freeze({chest:"starter_tunic",legs:"starter_trousers",feet:"starter_boots",outer:"starter_cloak",hands:"starter_gloves",bag:"enchanted_satchel"});
 const storage=root.DungeonFurnitureStorageV1;
 const wardrobeItems=Object.freeze([{"id":"academy_uniform","name":"軍校制服上衣","slot":"chest","home":"hanger-1","kind":"uniform","color":"#3c4d56","container":"wardrobe","asset":"assets/interiors/wardrobe-items/uniform-v1.svg"},{"id":"starter_tunic","name":"白色布衣","slot":"chest","home":"hanger-2","kind":"tunic","color":"#cfc7ad","container":"wardrobe","asset":"assets/interiors/wardrobe-items/tunic-v1.svg"},{"id":"starter_trousers","name":"旅行長褲","slot":"legs","home":"hanger-3","kind":"trousers","color":"#77715c","container":"wardrobe","asset":"assets/interiors/wardrobe-items/trousers-v1.svg"},{"id":"starter_cloak","name":"深綠披風","slot":"outer","home":"hanger-4","kind":"cloak","color":"#344f3b","container":"wardrobe","asset":"assets/interiors/wardrobe-items/cloak-v1.svg"},{"id":"starter_boots","name":"鞋子","slot":"feet","home":"shelf-1","kind":"boots","color":"#74513a","container":"wardrobe","asset":"assets/interiors/wardrobe-items/boots-v1.svg"},{"id":"spare_indoor_clothes","name":"備用室內衣物","home":"shelf-2","kind":"folded","color":"#c5bca4","container":"wardrobe","asset":"assets/interiors/wardrobe-items/folded-v1.svg"},{"id":"starter_gloves","name":"手套","slot":"hands","home":"shelf-3","kind":"gloves","color":"#8a6b47","container":"wardrobe","asset":"assets/interiors/wardrobe-items/gloves-v1.svg"},{"id":"enchanted_satchel","name":"附魔側包","slot":"bag","home":"shelf-4","kind":"bag","color":"#8f6740","container":"wardrobe","asset":"assets/interiors/wardrobe-items/bag-v1.svg"}].map(Object.freeze));
 const itemById=id=>wardrobeItems.find(item=>item.id===id);
 const itemLocation=(a,id)=>storage.location(a.storageV1,id);
 const wardrobeContents=a=>storage.contents(a.storageV1,wardrobeItems,'wardrobe');
 const moveItems=(a,commands)=>storage.apply(a.storageV1,wardrobeItems,a.equipmentV1,commands);
 const wornNames=a=>wardrobeItems.filter(item=>itemLocation(a,item.id)===storage.equip(item)).map(item=>item.name);
 const objects=Object.freeze([{id:"bed",name:"床",x:20,y:68},{id:"wardrobe",name:"衣櫃",x:13,y:35},{id:"desk",name:"書桌",x:71,y:59},{id:"window",name:"窗戶",x:48,y:26},{id:"mirror",name:"鏡子",x:84,y:31},{id:"door",name:"房門",x:89,y:65},{id:"chest",name:"木箱"},{id:"lamp",name:"吊燈"},{id:"desk-lamp",name:"桌上油燈"}].map(Object.freeze));
 const actions=Object.freeze({bed:[["rest","稍作休息"]],wardrobe:[["dress","換上便服與鞋子"],["undress","換回室內衣著"],["pack","整理外出裝備"]],desk:[["read","閱讀校方通知"]],window:[["look","望向街道"]],mirror:[["mirror","整理儀容"]],door:[["leave","走出房間"]],return:[["return","返回出租屋"]]});
 function create(){const equipmentV1={head:null,chest:null,main:null,legs:null,feet:null,neck:null,outer:null,offhand:null,hands:null,bag:null,owned:wardrobeItems.map(item=>item.id),starterOutfitV2:true};const a={scene:"rental-room",worldMinutes:420,seen:[],notes:[],items:[],flags:{furnitureOpen:{lamp:true,window:true,"desk-lamp":true}},travelLog:[],equipmentV1,storageV1:storage.create(wardrobeItems)};events.appendTravel(a,"daily","在出租屋醒來。","今天該看看校方安排了什麼。",0);return a}
 const ready=a=>[slots.chest,"academy_uniform"].includes(a.equipmentV1.chest)&&a.equipmentV1.legs===slots.legs&&a.equipmentV1.feet===slots.feet;
 const containers=Object.freeze({
  wardrobe:{name:"衣櫃",closed:"衣櫃的門關著。",open:"衣櫃裡的衣物可個別取用。"},
  chest:{name:"木箱",closed:"木箱的蓋子闔著。",open:"木箱蓋已掀起。"}
 });
 const isOpen=(a,id)=>a.flags.furnitureOpen?.[id]===true;
 const curtainState=a=>["open","half","closed"].includes(a.flags.curtainState)?a.flags.curtainState:isOpen(a,"window")?"open":"closed";
 function inspectContainer(a,id){
  const item=containers[id],open=isOpen(a,id);
  const choices=open
   ? [["close","關上"+item.name],...(id==="wardrobe"?[["storage-list","管理衣物"]]:[]),...(actions[id]||[])]
   : [["open","打開"+item.name]];
  return {id,text:open&&id==="wardrobe"?"衣櫃內有 "+wardrobeContents(a).length+" 件物品。":open?item.open:item.closed,actions:choices};
 }
 function inspect(a,id){if(a.scene==="rental-room"&&isOpen(a,"wardrobe")){if(id==="wardrobe-items")return {id,text:"選擇要管理的衣物。",actions:[...wardrobeItems.map(item=>["item:"+item.id,item.name+"（"+({carried:"隨身",equipped:"穿戴中",container:"衣櫃"}[itemLocation(a,item.id)?.split(":")[0]]??"未知")+"）"]),["storage-back","返回衣櫃"]]};if(typeof id==="string"&&id.startsWith("wardrobe-item:")){const item=itemById(id.slice(14));if(!item)return null;const pos=itemLocation(a,item.id),home=storage.home(item),worn=item.slot&&pos===storage.equip(item);return {id,text:item.name+"・"+(worn?"穿戴中":pos===home?"存放於衣櫃":"隨身攜帶"),actions:[...(item.slot&&!worn?[["item-equip","穿戴"]]:[]),...(pos===home?[["item-take","取出"]]:[]),...(pos!==home?[["item-store",worn?"脫下並放回":"放回衣櫃"]]:[]),["storage-list","管理衣物"],["storage-back","返回衣櫃"]]};}}if(a.scene==="rental-corridor"){if(id==="return")return {id,text:"這是自己的房間。",actions:[["return","回到房間"]]};if(id==="stairs")return {id,text:ready(a)?"木造樓梯通往一樓。":"木造樓梯通往一樓。前往街道前，請先回房換好外出衣著與鞋子。",actions:[["downstairs","下樓前往街道"]]};return null;}if(a.scene==="rental-street"){return id==="return"?{id,text:"沿原路上樓，回到二樓走廊。",actions:[["return","返回住宅走廊"]]}:null;}if(a.scene==="rental-room"&&!objects.some(o=>o.id===id)||a.scene==="rental-street"&&id!=="return"||!["rental-room","rental-street"].includes(a.scene))return null;if(Object.hasOwn(containers,id))return inspectContainer(a,id);if(id==="desk-lamp")return {id,text:isOpen(a,id)?"桌上油燈正亮著，暖光照在書桌上。":"桌上油燈已熄滅。",actions:[[isOpen(a,id)?"desk-lamp-off":"desk-lamp-on",isOpen(a,id)?"熄滅桌燈":"點亮桌燈"]]};if(id==="desk")return {id,text:a.flags.noticeRead?"校方通知已閱讀，報到事項尚待確認。":"桌上放著軍校寄來的通知。",actions:[...actions.desk,[isOpen(a,"desk-lamp")?"desk-lamp-off":"desk-lamp-on",isOpen(a,"desk-lamp")?"熄滅桌燈":"點亮桌燈"]]};if(id==="lamp")return {id,text:isOpen(a,id)?"吊燈正亮著。":"吊燈已熄滅。",actions:[[isOpen(a,id)?"switch-off":"switch-on",isOpen(a,id)?"熄滅吊燈":"點亮吊燈"]]};if(id==="window"){const state=curtainState(a);return {id,text:{open:"窗簾已拉開，可以看見城鎮。",half:"窗簾半開，部分自然光進入室內。",closed:"窗簾已拉上，只剩少量透光。"}[state],actions:[...([["curtain-open","拉開窗簾"],["curtain-half","半開窗簾"],["curtain-close","拉上窗簾"]].filter(([key])=>key!==({open:"curtain-open",half:"curtain-half",closed:"curtain-close"}[state]))),...(state!=="closed"?actions.window:[])]};}if(id==="door")return {id,text:isOpen(a,id)?"房門已打開。": "房門關著。",actions:[[isOpen(a,id)?"door-close":"door-open",isOpen(a,id)?"關上房門":"打開房門"],...actions.door]};const descriptions={bed:"一張簡單的木床，床邊放著昨晚整理好的物品。",desk:a.flags.noticeRead?"校方通知已閱讀，報到事項尚待確認。":"桌上放著軍校寄來的通知。",window:"清晨的街道漸漸熱鬧起來。",mirror:"鏡中的自己，正準備開始新的一天。",door:ready(a)?"已經換好外出衣著，可以出門。":"先換好外出衣著，再出門。",return:"沿著街道走回自己的出租屋。"};return {id,text:descriptions[id],actions:actions[id]}}
 function act(a,id,key){
  const view=inspect(a,id);if(!view?.actions.some(x=>x[0]===key))return {ok:false,reason:"無法在目前位置執行此行動。"};
  if(typeof id==="string"&&id.startsWith("wardrobe-item:")&&["item-equip","item-take","item-store"].includes(key)){
   const item=itemById(id.slice(14));const to=key==="item-equip"?storage.equip(item):key==="item-take"?"carried":storage.home(item);
   const result=moveItems(a,[{id:item.id,to}]);if(!result.ok)return result;
   const message=key==="item-equip"?"穿戴了"+item.name+"。":key==="item-take"?"取出了"+item.name+"。":"將"+item.name+"放回衣櫃。";
   clock.advance(a,1,{reason:"storage:"+key});events.appendTravel(a,"daily",message,"");return {ok:true,message,minutes:1};
  }
  if(key==="open"||key==="close"){
   (a.flags.furnitureOpen??={})[id]=key==="open";
   return {ok:true,message:(key==="open"?"打開了":"關上了")+containers[id].name+"。",minutes:0};
  }
  if(key.startsWith("curtain-")){const state={"curtain-open":"open","curtain-half":"half","curtain-close":"closed"}[key];if(state){a.flags.curtainState=state;(a.flags.furnitureOpen??={}).window=state!=="closed";return {ok:true,message:{open:"拉開了窗簾。",half:"將窗簾拉至半開。",closed:"拉上了窗簾。"}[state],minutes:0};}}
  const toggles={"desk-lamp-on":["desk-lamp",true,"點亮了桌上油燈。"],"desk-lamp-off":["desk-lamp",false,"熄滅了桌上油燈。"],"switch-on":["lamp",true,"點亮了吊燈。"],"switch-off":["lamp",false,"熄滅了吊燈。"],"curtain-open":["window",true,"拉開了窗簾。"],"curtain-close":["window",false,"拉上了窗簾。"],"door-open":["door",true,"打開了房門。"],"door-close":["door",false,"關上了房門。"]};
  if(Object.hasOwn(toggles,key)){const [target,on,message]=toggles[key];(a.flags.furnitureOpen??={})[target]=on;return {ok:true,message,minutes:0};}
  if(key==="downstairs"&&!ready(a))return {ok:false,reason:"前往街道前，請先回房換好外出衣著與鞋子。"};
  if(key==="read"&&a.flags.noticeRead)return {ok:true,message:"校方通知已讀：請先在城鎮安頓，後續將另行通知報到事項。",minutes:0};
  let minutes=time.cost("inspect"),message="",thought="",to=a.scene;
  if(key==="rest"){minutes=15;message="在床邊休息了片刻。"}
  else if(key==="dress"){if(a.equipmentV1.chest===slots.chest&&ready(a))return {ok:true,message:"已穿好便服。",minutes:0};const moved=moveItems(a,["chest","legs","feet"].map(slot=>({id:slots[slot],to:"equipped:"+slot})));if(!moved.ok)return moved;message="換上白色布衣、旅行褲與鞋子。";}
  else if(key==="undress"){const worn=wardrobeItems.filter(item=>item.slot&&itemLocation(a,item.id)===storage.equip(item));if(!worn.length)return {ok:true,message:"已是室內衣著。",minutes:0};const moved=moveItems(a,worn.map(item=>({id:item.id,to:storage.home(item)})));if(!moved.ok)return moved;message="換回室內衣著。";}
  else if(key==="pack"){if(a.equipmentV1.bag===slots.bag&&a.equipmentV1.outer===slots.outer&&a.equipmentV1.hands===slots.hands)return {ok:true,message:"外出裝備已整理。",minutes:0};const moved=moveItems(a,["bag","outer","hands"].map(slot=>({id:slots[slot],to:"equipped:"+slot})));if(!moved.ok)return moved;message="整理好披風、手套與附魔側包。";}
  else if(key==="read"){a.flags.noticeRead=true;message="閱讀校方通知。";thought="請先在城鎮安頓，後續將另行通知報到事項。";}
  else if(key==="look"){message="望向逐漸熱鬧的街道。"}
  else if(key==="mirror"){message="整理了自己的儀容。"}
  else if(key==="leave"){(a.flags.furnitureOpen??={}).door=false;minutes=3;to="rental-corridor";message="走出私人房間，隨手關上房門，來到二樓公共走廊。"}
  else if(key==="downstairs"){minutes=3;to="rental-street";message="沿樓梯下樓，走到城鎮街道。"}
  else if(key==="return"){(a.flags.furnitureOpen??={}).door=false;minutes=3;to=a.scene==="rental-street"?"rental-corridor":"rental-room";message=to==="rental-corridor"?"回到二樓公共走廊。":"回到私人房間。"}
  const before=a.scene;clock.advance(a,minutes,{reason:"city-opening:"+key,fromScene:before,toScene:to});a.scene=to;events.appendTravel(a,"daily",message,thought);return {ok:true,message:thought||message,minutes}
 }
 return Object.freeze({version:"1.0.0",objects,slots,create,inspect,act,ready,isOpen,curtainState,wardrobeItems,wardrobeContents,itemLocation,wornNames});
})(root.DungeonGameTimeV1,root.DungeonEventsV1,root.DungeonSceneActionTimeV1);root.DungeonEngineV1.register({id:'city.opening',version:'1.0.0',requires:['engine.time','engine.events'],available:()=>!!root.DungeonSceneActionTimeV1});})(window);
