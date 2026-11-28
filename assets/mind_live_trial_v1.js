/* Isolated in-game developer trial session; no persisted mind state. */
(function(root){'use strict';if(root.DungeonMindLiveTrialV1)throw Error('duplicate mind live trial');root.DungeonMindLiveTrialV1=(function sessionCore(c,g,r,f,w){
 const sessions=new WeakMap();
 function get(actor){
  if(!actor||typeof actor!=="object")throw Error("INVALID_ACTOR");
  let s=sessions.get(actor);
  if(!s){
   let profile=c.createProfile({schoolId:"school-4-0",main:"影",phases:["影","續"]});
   for(const [id,allocations] of [["trial-beast",[{phase:"影",branch:"形",share:60},{phase:"續",branch:"循",share:40}]],["trial-tool",[{phase:"影",branch:"形",share:100}]]])profile=c.createSkill(profile,{id,name:id==="trial-beast"?"測試燈獸":"測試燈器",allocations,materials:[]});
   s={profile,forms:f.create(g.create(Object.fromEntries(g.stats.map(k=>[k,11]))),r.create()),scene:actor.scene};sessions.set(actor,s);
  }
  s.profile=w.importObservations(actor,s.profile).profile;
  return s;
 }
 function cast(actor,formId){
  if(actor.scene!=="wreck"||actor.flags?.inBattle||!["beast","tool"].includes(formId))return {ok:false,reason:"TRIAL_BLOCKED"};
  const s=get(actor),x=f.activate(s.forms,s.profile,"trial-"+formId,formId);
  if(x.ok)s.forms=x.state;return x;
 }
 function elapsed(actor,event){
  const s=sessions.get(actor);if(!s||!event?.minutes)return;
  if(event.fromScene!==event.toScene||actor.scene!==s.scene){sessions.delete(actor);return}
  s.forms=f.advance(s.forms,{ownerAvailable:!actor.flags?.inBattle}).state;
 }
 function targets(actor,entityId,action,context){
  const s=get(actor);return context.objects.flatMap(obj=>{const q=w.plan(actor,s.forms,{entityId,action,targetId:obj.id},context);return q.ok?[{obj,plan:q.plan}]:[]});
 }
 function confirm(actor,plan,context){const s=get(actor);return w.revalidate(actor,s.forms,plan,context)}
 return Object.freeze({get,cast,elapsed,targets,confirm,reset:actor=>sessions.delete(actor)});
})(root.DungeonMindCoreV1,root.DungeonMindGrowthV1,root.DungeonRelicCoreV1,root.DungeonMindFormV1,root.DungeonMindWorldBridgeV1);root.DungeonEngineV1.register({id:'mind.live-trial',version:'1.0.0',requires:['mind.world-bridge']});root.DungeonEngineV1.onTime('mind.live-trial',root.DungeonMindLiveTrialV1.elapsed);})(window);
