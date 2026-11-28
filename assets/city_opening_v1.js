/* 城鎮開場獨立原型；沿用世界時計、旅途紀錄及裝備ID，不寫舊存檔。 */
(function(root){'use strict';root.DungeonCityOpeningV1=(function cityCore(clock,events,time){
 const slots=Object.freeze({chest:"starter_tunic",legs:"starter_trousers",feet:"starter_boots"});
 const outfits=Object.freeze({daily:slots,academy:Object.freeze({chest:"academy_uniform",legs:"academy_trousers",feet:"academy_boots"})});
 const timed=root.DungeonTimedTasksV1;
 const reportConfig=Object.freeze({day:1,deadline:660,windows:[
 {start:0,end:540,state:'early',accept:false},{start:540,end:660,state:'on-time',accept:true},{start:660,end:720,state:'late',accept:true},{start:720,end:780,state:'break',accept:false},{start:780,end:1020,state:'late',accept:true},{start:1020,end:1440,state:'closed',accept:false}
 ],messages:{early:'尚未開始受理，請於09:00後再來。', 'on-time':'目前為正常報到時段。',late:'已超過指定時段，可補辦報到。',break:'目前為午休時間，13:00恢復受理。',closed:'事務所已關閉，請隔日09:00後再來。'}});
 const noticeId='academy_report_notice';
 const noticeText='軍校教務處・畢業生派遣公文\\n一、請先完成住宿及生活安頓。\\n二、第1日09:00至11:00前往燈火會事務所報到。\\n三、須穿著完整軍校制服，並攜帶本通知。\\n四、後續考察任務由燈火會安排，須遵守當地規範。\\n五、派遣不代表正式錄取，任用資格依考察結果決定。'.replaceAll('\\n','\n');
 const academyReady=a=>Object.entries(outfits.academy).every(([slot,id])=>a.equipmentV1[slot]===id);
 const reportStatus=a=>{const status=timed.evaluate(reportConfig,a.worldMinutes),task=a.reportV1;
 const requirements=[{label:'完整軍校制服',ok:academyReady(a)},{label:'攜帶報到通知',ok:a.items.includes(noticeId)}];
 return {...status,completed:task.completed,read:!!a.flags.noticeRead,notice:task.notice,requirements,message:task.completed?(task.completed.late?'已補辦報到，留有遲到紀錄。':'已準時完成報到。'):reportConfig.messages[status.state]};};
 const storage=root.DungeonFurnitureStorageV1;
 const wardrobeItems=Object.freeze([{"id":"academy_uniform","name":"軍校制服上衣","slot":"chest","home":"hanger-1","kind":"uniform","color":"#3c4d56","container":"wardrobe","asset":"assets/interiors/wardrobe-items/uniform-painted-v1.webp"},{"id":"starter_tunic","name":"日常布衣","slot":"chest","home":"hanger-2","kind":"tunic","color":"#cfc7ad","container":"wardrobe","asset":"assets/interiors/wardrobe-items/tunic-painted-v1.webp"},{"id":"academy_trousers","name":"軍校制服長褲","slot":"legs","home":"hanger-3","kind":"trousers","color":"#43525e","container":"wardrobe","asset":"assets/interiors/wardrobe-items/academy-trousers-painted-v1.webp"},{"id":"starter_trousers","name":"日常長褲","slot":"legs","home":"hanger-4","kind":"trousers","color":"#77715c","container":"wardrobe","asset":"assets/interiors/wardrobe-items/trousers-painted-v1.webp"},{"id":"academy_boots","name":"軍靴","slot":"feet","home":"shelf-1","kind":"boots","color":"#46392f","container":"wardrobe","asset":"assets/interiors/wardrobe-items/academy-boots-painted-v1.webp"},{"id":"starter_boots","name":"日常便鞋","slot":"feet","home":"shelf-2","kind":"boots","color":"#74513a","container":"wardrobe","asset":"assets/interiors/wardrobe-items/daily-shoes-painted-v1.webp"}].map(Object.freeze));
 const itemById=id=>wardrobeItems.find(item=>item.id===id);
 const itemLocation=(a,id)=>storage.location(a.storageV1,id);
 const wardrobeContents=a=>storage.contents(a.storageV1,wardrobeItems,'wardrobe');
 const moveItems=(a,commands)=>storage.apply(a.storageV1,wardrobeItems,a.equipmentV1,commands);
 const wornNames=a=>wardrobeItems.filter(item=>itemLocation(a,item.id)===storage.equip(item)).map(item=>item.name);
 const objects=Object.freeze([{id:"bed",name:"床",x:20,y:68},{id:"wardrobe",name:"衣櫃",x:13,y:35},{id:"desk",name:"書桌",x:71,y:59},{id:"window",name:"窗戶",x:48,y:26},{id:"mirror",name:"鏡子",x:84,y:31},{id:"door",name:"房門",x:89,y:65},{id:"chest",name:"木箱"},{id:"lamp",name:"吊燈"},{id:"desk-lamp",name:"桌上油燈"}].map(Object.freeze));
 const actions=Object.freeze({bed:[["rest","稍作休息"]],wardrobe:[["dress","換上日常衣物"],["dress-academy","換上軍校制服"],["undress","換回室內衣著"]],desk:[["read","閱讀校方通知"]],window:[["look","望向街道"]],mirror:[["mirror","整理儀容"]],door:[["leave","走出房間"]],return:[["return","返回出租屋"]]});
 function create(){const equipmentV1={head:null,chest:null,main:null,legs:null,feet:null,neck:null,outer:null,offhand:null,hands:null,bag:null,owned:wardrobeItems.map(item=>item.id),starterOutfitV2:true};const a={scene:"rental-room",worldMinutes:420,seen:[],notes:[],items:[],flags:{furnitureOpen:{lamp:true,window:true,"desk-lamp":true}},travelLog:[],equipmentV1,storageV1:storage.create(wardrobeItems),reportV1:{notice:"desk",completed:null}};events.appendTravel(a,"daily","在出租屋醒來。","今天該看看校方寄來的報到通知。",0);return a}
 const ready=a=>["chest","legs","feet"].every(slot=>wardrobeItems.some(item=>item.slot===slot&&item.id===a.equipmentV1[slot]));
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
 function inspect(a,id){if(id==="report-notice"&&(a.scene==="rental-room"||a.items.includes(noticeId)))return {id,text:noticeText,actions:[...(a.scene==="rental-room"?[["notice-back","返回書桌"]]:[["report-back","返回報到選單"]])]};if(a.scene==="rental-street"&&id==="report-office"){const r=reportStatus(a);return {id,text:"燈火會事務所・流程測試（正式場景尚未製作）\n"+r.message,actions:[...(!r.completed?[["report","辦理報到"],["wait-30","等候30分鐘"],["wait-60","等候1小時"]]:[]),...(a.items.includes(noticeId)?[["notice-view","查看報到通知"]]:[]),["report-back","返回街道"]]};}if(a.scene==="rental-room"&&isOpen(a,"wardrobe")){if(id==="wardrobe-items")return {id,text:"選擇要管理的衣物。",actions:[...wardrobeItems.map(item=>["item:"+item.id,item.name+"（"+({carried:"隨身",equipped:"穿戴中",container:"衣櫃"}[itemLocation(a,item.id)?.split(":")[0]]??"未知")+"）"]),["storage-back","返回衣櫃"]]};if(typeof id==="string"&&id.startsWith("wardrobe-item:")){const item=itemById(id.slice(14));if(!item)return null;const pos=itemLocation(a,item.id),home=storage.home(item),worn=item.slot&&pos===storage.equip(item);return {id,text:item.name+"・"+(worn?"穿戴中":pos===home?"存放於衣櫃":"隨身攜帶"),actions:[...(item.slot&&!worn?[["item-equip","穿戴"]]:[]),...(pos===home?[["item-take","取出"]]:[]),...(pos!==home?[["item-store",worn?"脫下並放回":"放回衣櫃"]]:[]),["storage-list","管理衣物"],["storage-back","返回衣櫃"]]};}}if(a.scene==="rental-corridor"){if(id==="return")return {id,text:"這是自己的房間。",actions:[["return","回到房間"]]};if(id==="stairs")return {id,text:ready(a)?"木造樓梯通往一樓。":"木造樓梯通往一樓。前往街道前，請先回房換好外出衣著與鞋子。",actions:[["downstairs","下樓前往街道"]]};return null;}if(a.scene==="rental-street"){return id==="return"?{id,text:"沿原路上樓，回到二樓走廊。",actions:[["return","返回住宅走廊"]]}:null;}if(a.scene==="rental-room"&&!objects.some(o=>o.id===id)||a.scene==="rental-street"&&id!=="return"||!["rental-room","rental-street"].includes(a.scene))return null;if(Object.hasOwn(containers,id))return inspectContainer(a,id);if(id==="desk-lamp")return {id,text:isOpen(a,id)?"桌上油燈正亮著，暖光照在書桌上。":"桌上油燈已熄滅。",actions:[[isOpen(a,id)?"desk-lamp-off":"desk-lamp-on",isOpen(a,id)?"熄滅桌燈":"點亮桌燈"]]};if(id==="desk")return {id,text:a.reportV1.notice==="delivered"?"報到通知已交付。":a.reportV1.notice==="carried"?"報到通知已隨身攜帶。":"桌上放著軍校寄來的報到通知。",actions:[...(a.reportV1.notice!=="delivered"?actions.desk:[]),...(a.reportV1.notice==="desk"?[["notice-take","取走報到通知"]]:a.reportV1.notice==="carried"?[["notice-store","將通知放回書桌"]]:[]),[isOpen(a,"desk-lamp")?"desk-lamp-off":"desk-lamp-on",isOpen(a,"desk-lamp")?"熄滅桌燈":"點亮桌燈"]]};if(id==="lamp")return {id,text:isOpen(a,id)?"吊燈正亮著。":"吊燈已熄滅。",actions:[[isOpen(a,id)?"switch-off":"switch-on",isOpen(a,id)?"熄滅吊燈":"點亮吊燈"]]};if(id==="window"){const state=curtainState(a);return {id,text:{open:"窗簾已拉開，可以看見城鎮。",half:"窗簾半開，部分自然光進入室內。",closed:"窗簾已拉上，只剩少量透光。"}[state],actions:[...([["curtain-open","拉開窗簾"],["curtain-half","半開窗簾"],["curtain-close","拉上窗簾"]].filter(([key])=>key!==({open:"curtain-open",half:"curtain-half",closed:"curtain-close"}[state]))),...(state!=="closed"?actions.window:[])]};}if(id==="door")return {id,text:isOpen(a,id)?"房門已打開。": "房門關著。",actions:[[isOpen(a,id)?"door-close":"door-open",isOpen(a,id)?"關上房門":"打開房門"],...actions.door]};const descriptions={bed:"一張簡單的木床，床邊放著昨晚整理好的物品。",desk:a.flags.noticeRead?"校方通知已閱讀，報到事項尚待確認。":"桌上放著軍校寄來的通知。",window:"清晨的街道漸漸熱鬧起來。",mirror:"鏡中的自己，正準備開始新的一天。",door:ready(a)?"已經換好外出衣著，可以出門。":"先換好外出衣著，再出門。",return:"沿著街道走回自己的出租屋。"};return {id,text:descriptions[id],actions:actions[id]}}
 function act(a,id,key){
  const view=inspect(a,id);if(!view?.actions.some(x=>x[0]===key))return {ok:false,reason:"無法在目前位置執行此行動。"};
  if(key==="notice-take"||key==="notice-store"){const take=key==="notice-take";a.reportV1.notice=take?"carried":"desk";a.items=a.items.filter(v=>v!==noticeId);if(take)a.items.push(noticeId);return {ok:true,message:take?"將報到通知隨身收好。":"將報到通知放回書桌。",minutes:0};}
  if(key==="report"){const r=reportStatus(a),result=timed.complete(a.reportV1,reportConfig,a.worldMinutes,r.requirements);if(!result.ok)return result;a.reportV1.notice="delivered";a.items=a.items.filter(v=>v!==noticeId);const message=result.record.late?"完成補報到，留下遲到紀錄。":"準時完成報到。";clock.advance(a,2,{reason:"report"});events.appendTravel(a,"daily",message,"後續等待燈火會安排考察。");return {ok:true,message,minutes:2};}
  if(key==="wait-30"||key==="wait-60"){const minutes=key==="wait-30"?30:60;clock.advance(a,minutes,{reason:"wait"});return {ok:true,message:"在街道等候了片刻。",minutes};}
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
  if(key==="read"&&a.flags.noticeRead)return {ok:true,message:"再次閱讀報到通知。",minutes:0};
  let minutes=time.cost("inspect"),message="",thought="",to=a.scene;
  if(key==="rest"){minutes=15;message="在床邊休息了片刻。"}
  else if(key==="dress"||key==="dress-academy"){const outfit=outfits[key==="dress"?"daily":"academy"];const name=key==="dress"?"日常衣物":"軍校制服";if(Object.entries(outfit).every(([slot,id])=>a.equipmentV1[slot]===id))return {ok:true,message:"已穿好"+name+"。",minutes:0};const moved=moveItems(a,Object.entries(outfit).map(([slot,id])=>({id,to:"equipped:"+slot})));if(!moved.ok)return moved;message="換上整套"+name+"。";}
  else if(key==="undress"){const worn=wardrobeItems.filter(item=>item.slot&&itemLocation(a,item.id)===storage.equip(item));if(!worn.length)return {ok:true,message:"已是室內衣著。",minutes:0};const moved=moveItems(a,worn.map(item=>({id:item.id,to:storage.home(item)})));if(!moved.ok)return moved;message="換回室內衣著。";}
  else if(key==="read"){a.flags.noticeRead=true;message="閱讀校方通知。";thought="第1日09:00至11:00，穿軍校制服並攜帶通知前往燈火會報到。";}
  else if(key==="look"){message="望向逐漸熱鬧的街道。"}
  else if(key==="mirror"){message="整理了自己的儀容。"}
  else if(key==="leave"){(a.flags.furnitureOpen??={}).door=false;minutes=3;to="rental-corridor";message="走出私人房間，隨手關上房門，來到二樓公共走廊。"}
  else if(key==="downstairs"){minutes=3;to="rental-street";message="沿樓梯下樓，走到城鎮街道。"}
  else if(key==="return"){(a.flags.furnitureOpen??={}).door=false;minutes=3;to=a.scene==="rental-street"?"rental-corridor":"rental-room";message=to==="rental-corridor"?"回到二樓公共走廊。":"回到私人房間。"}
  const before=a.scene;clock.advance(a,minutes,{reason:"city-opening:"+key,fromScene:before,toScene:to});a.scene=to;events.appendTravel(a,"daily",message,thought);return {ok:true,message:thought||message,minutes}
 }
 return Object.freeze({version:"1.0.0",objects,slots,outfits,create,inspect,act,ready,isOpen,curtainState,wardrobeItems,wardrobeContents,itemLocation,wornNames,reportStatus,noticeText,academyReady});
})(root.DungeonGameTimeV1,root.DungeonEventsV1,root.DungeonSceneActionTimeV1);root.DungeonEngineV1.register({id:'city.opening',version:'1.0.0',requires:['engine.time','engine.events'],available:()=>!!root.DungeonSceneActionTimeV1});})(window);
