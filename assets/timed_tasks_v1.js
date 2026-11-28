/* Shared scheduled tasks. All times use world minutes, not real time or presentation previews. */
(function(root){'use strict';
function evaluate(config,worldMinute){
 const day=Math.floor(worldMinute/1440)+1,minute=((worldMinute%1440)+1440)%1440;
 const window=config.windows.find(w=>minute>=w.start&&minute<w.end);
 let state=window?.state??'closed';
 if(state==='on-time'&&day>config.day)state='late';
 if(day<config.day&&window?.accept)state='early';
 return {day,minute,state,accept:day>=config.day&&!!window?.accept,late:day>config.day||state==='late',remaining:Math.max(0,(config.day-1)*1440+config.deadline-worldMinute)};
}
function complete(task,config,worldMinute,requirements){
 if(task.completed)return {ok:false,reason:'此事項已完成。'};
 const status=evaluate(config,worldMinute);
 if(!status.accept)return {ok:false,reason:config.messages[status.state]};
 const missing=requirements.filter(r=>!r.ok).map(r=>r.label);
 if(missing.length)return {ok:false,reason:'尚未符合報到條件：'+missing.join('、')+'。'};
 task.completed={worldMinute,day:status.day,late:status.late};
 return {ok:true,record:task.completed};
}
root.DungeonTimedTasksV1=Object.freeze({version:'1.0.0',evaluate,complete});
})(window);
