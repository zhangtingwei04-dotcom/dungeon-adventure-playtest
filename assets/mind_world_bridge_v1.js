/* Read-only bridge to existing game scene, time and observation data. No live mutation. */
(function(root){'use strict';if(root.DungeonMindWorldBridgeV1)throw Error('duplicate mind bridge');root.DungeonMindWorldBridgeV1=(function bridge(c,f,o,t,clock){
 const safe=x=>typeof x==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(x)&&!["constructor","prototype","__proto__"].includes(x);
 const observed=Object.freeze({"observed-wreck-forest4_rabbit":"forest4_rabbit","observed-wreck-forest4_beetle":"forest4_beetle","observed-wreck-forest4_bird":"forest4_bird","observed-wreck-forest4_butterfly":"forest4_butterfly","observed-wreck-goldenRabbit":"goldenRabbit"});
 const fail=reason=>({ok:false,reason});
 const clockView=actor=>Number.isSafeInteger(actor?.worldMinutes)&&actor.worldMinutes>=0?{...clock.parts(actor.worldMinutes),label:clock.format(actor.worldMinutes)}:null;
 function importObservations(actor,profile){
  if(!c.validateProfile(profile).ok)throw Error("INVALID_PROFILE");
  let result=profile;const added=[];
  for(const key of Array.isArray(actor?.seen)?actor.seen:[]){if(!Object.hasOwn(observed,key))continue;const id=observed[key];if(!result.observations.includes(id)){result=c.observe(result,id);added.push(id)}}
  return {profile:result,added};
 }
 function plan(actor,forms,{entityId,action,targetId},{objects=[],present,canReach,exitOnly}={}){
  if(!clockView(actor)||!safe(actor.scene)||actor.scene!=="wreck"||actor.flags?.inBattle||exitOnly!==false)return fail("SCENE_ACTION_BLOCKED");
  if(!f.valid(forms)||!safe(targetId)||!Array.isArray(objects)||typeof present!=="function"||typeof canReach!=="function")return fail("INVALID_CONTEXT");
  const q=f.requestAction(forms,entityId,action,targetId);if(!q.ok)return fail(q.reason);
  if(!["sense","useTool","commandInteract"].includes(action))return fail("UNSUPPORTED_WORLD_ACTION");
  const matches=objects.filter(x=>x?.id===targetId);
  if(matches.length!==1)return fail("TARGET_NOT_UNIQUE");
  const obj=matches[0];if(!safe(obj.id)||!safe(obj.assetId)||obj.previewOnly||obj.visible!==true||!o.visible(actor,actor.scene,obj)||present(obj)!==true||canReach(entityId,obj)!==true)return fail("TARGET_UNAVAILABLE");
  const d=o.get(obj.assetId);if(!d)return fail("UNKNOWN_OBJECT");
  let material=null,minutes,observationKey=null;
  if(action==="sense"){
   if(d.type!=="living"||!o.animalInteraction(obj.assetId))return fail("NOT_OBSERVABLE");
   observationKey="observed-wreck-"+(obj.rabbitVariant==="golden"&&obj.assetId==="forest4_rabbit"?"goldenRabbit":obj.assetId);
   if(!Object.hasOwn(observed,observationKey))return fail("UNSUPPORTED_OBSERVATION");
   minutes=t.cost("observe");
  }else{
   // Only straightforward renewable/removable field resources; do not bypass wagon/container quests.
   if(!["forest4_branch","forest4_mushroom"].includes(obj.assetId))return fail("HARVEST_NOT_ADMITTED");
   const stock=o.resource(actor,actor.scene,obj);
   if(!stock||stock.permanent||stock.remaining<1)return fail("RESOURCE_UNAVAILABLE");
   material=stock.material;minutes=t.cost(obj.assetId==="forest4_mushroom"?"mushroom":"wood");
  }
  return {ok:true,plan:Object.freeze({scene:actor.scene,minute:actor.worldMinutes,turn:forms.life.turn,entityId,action,targetId,assetId:obj.assetId,variant:obj.rabbitVariant||null,minutes,material,observationKey})};
 }
 function revalidate(actor,forms,previous,context){
  if(!previous||previous.scene!==actor?.scene||previous.minute!==actor?.worldMinutes||previous.turn!==forms?.life?.turn)return fail("STALE_ACTION");
  const x=plan(actor,forms,previous,context);if(!x.ok)return x;
  if(Object.keys(x.plan).some(k=>x.plan[k]!==previous[k]))return fail("TARGET_CHANGED");
  return x;
 }
 return Object.freeze({version:"1.0.0",clockView,importObservations,plan,revalidate});
})(root.DungeonMindCoreV1,root.DungeonMindFormV1,root.DungeonObjectInvestigationV1,root.DungeonSceneActionTimeV1,root.DungeonGameTimeV1);root.DungeonEngineV1.register({id:'mind.world-bridge',version:'1.0.0',requires:['mind.form','engine.time','engine.events','engine.save'],available:()=>!!root.DungeonObjectInvestigationV1&&!!root.DungeonSceneActionTimeV1});})(window);
