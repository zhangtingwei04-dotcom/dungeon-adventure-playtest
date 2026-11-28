/* 心象核心 V1.0：獨立規則與資料，不自行改寫正式存檔／時間／戰鬥。 */
(function(root){
'use strict';
if(root.DungeonMindCoreV1)throw Error('Duplicate mind core');
root.DungeonMindCoreV1=(function buildCore(){
 const freeze=x=>{if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x)}return x};
 const phases=freeze(["光","熱","餘","影","滅","續"]);
 const branches=freeze({光:["界","透","發"],熱:["衍","煉","變"],餘:["響","痕","殘"],影:["形","幻","映"],滅:["寂","斷","散"],續:["繫","傳","循"]});
 const realms=freeze(["覺心境","凝象境","顯象境","塑象境","化境","展界境","明我境"]);
 const basics=freeze(["燃","守","斂","流"]);
 const advanced=freeze(["聚","護","隱","附","察","衡","湧"]);
 const groups=[
 ["燈","燼武流","燼擊 踏火 鐵身","明心流","澄心 微察 止念","長明流","不熄 長息 定魂"],
 ["光","引光流","導輝 流芒 引星","逐光流","穿星 極閃 破曉","展界流","無垠 界標 光環"],
 ["熱","化焰流","燃變 熾化 赤潮","萬化流","百鍊 鑄心 易質","轉輪流","易象 逆流 輪轉"],
 ["餘","留痕流","刻印 藏燼 封痕","拾憶流","溯痕 尋憶 遺念","殘響流","復鳴 餘震 再燃"],
 ["影","塑象流","造象 凝形 擬物","映心流","心映 留影 復景","幻形流","虛界 迷象 障目"],
 ["滅","歸寂流","靜寂 息火 沉默","斷律流","斷弦 離繫 截脈","無相流","歸無 崩象 化塵"],
 ["續","織律流","千繫 結網 交脈","繫命流","長繫 續息 命環","連心流","共鳴 通感 傳意"]];
 const schools=freeze(groups.flatMap((g,i)=>[0,1,2].map(j=>({id:"school-"+i+"-"+j,phase:g[0],name:g[j*2+1],draftMoves:g[j*2+2].split(" ")}))));
 const validPhase=p=>phases.includes(p);
 const opposite=(a,b)=>validPhase(a)&&validPhase(b)&&Math.abs(phases.indexOf(a)-phases.indexOf(b))===3;
 function efficiency(main,phase){if(phase==="燈")return 100;if(!validPhase(main)||!validPhase(phase))throw Error("INVALID_PHASE");let d=Math.abs(phases.indexOf(main)-phases.indexOf(phase));return [100,75,40,0][Math.min(d,6-d)]}
 function legalPhases(list){return Array.isArray(list)&&list.length<=3&&new Set(list).size===list.length&&list.every((p,i)=>validPhase(p)&&!list.slice(0,i).some(q=>opposite(p,q)))}
 const combinations=freeze(Array.from({length:64},(_,mask)=>phases.filter((p,i)=>mask&(1<<i))).filter(legalPhases));
 const str=x=>typeof x==="string"&&x.trim().length>0;
 function validateProfile(p){
  const errors=[];const school=schools.find(s=>s.id===p?.schoolId);if(!school)errors.push("UNKNOWN_SCHOOL");
  const learned=p?.phases;if(!legalPhases(learned))errors.push("INVALID_LEARNED_PHASES");
  if(p?.main!==null&&!validPhase(p?.main))errors.push("INVALID_MAIN");
  if(Array.isArray(learned)&&((learned.length>0&&!learned.includes(p?.main))||(learned.length===0&&p?.main!==null)))errors.push("MAIN_NOT_LEARNED");
  if(school&&school.phase!=="燈"&&(!Array.isArray(learned)||!learned.includes(school.phase)))errors.push("SCHOOL_PHASE_NOT_LEARNED");
  if(!Array.isArray(p?.observations)||p.observations.some(x=>!str(x))||new Set(p.observations).size!==p.observations.length)errors.push("INVALID_OBSERVATIONS");
  if(!Array.isArray(p?.skills)||p.skills.some(s=>!s||!str(s.id))||new Set(p.skills.map(s=>s?.id)).size!==p.skills.length)errors.push("INVALID_SKILL_LIBRARY");
  return {ok:errors.length===0,errors,school};
 }
 function createProfile({schoolId,main=null,phases:learned=[]}){
  const p={schema:1,schoolId,main,phases:[...learned],observations:[],skills:[]};
  const v=validateProfile(p);if(!v.ok)throw Error(v.errors.join(","));return p;
 }
 function observe(p,id){
  const v=validateProfile(p);if(!v.ok)throw Error(v.errors.join(","));if(!str(id))throw Error("INVALID_OBSERVATION");
  return p.observations.includes(id)?p:{...p,observations:[...p.observations,id]};
 }
 function validateSkill(p,d){
  const profile=validateProfile(p),errors=[...profile.errors],school=profile.school;
  if(!d||!str(d.name)||!str(d.id))errors.push("INVALID_SKILL_ID_OR_NAME");
  const allocations=d?.allocations;let used=[],total=0,effective=0;const breakdown=[];
  if(!Array.isArray(allocations)||!allocations.length)errors.push("INVALID_ALLOCATION");
  else{
   for(const a of allocations){
    if(!a||!(a.phase==="燈"||validPhase(a.phase))||!Number.isFinite(a.share)||a.share<=0){errors.push("INVALID_ALLOCATION");continue}
    if(used.includes(a.phase))errors.push("DUPLICATE_ALLOCATION");used.push(a.phase);total+=a.share;
    if(a.phase!=="燈"&&!p?.phases?.includes?.(a.phase))errors.push("UNLEARNED_PHASE");
    if(a.branch!==undefined&&(!branches[a.phase]?.includes(a.branch)||school?.phase==="燈"))errors.push("BRANCH_NOT_ALLOWED");
    if(a.phase==="燈"||validPhase(p?.main)){let cap=efficiency(p.main,a.phase);if(!cap)errors.push("OPPOSED_PHASE");let value=a.share*cap/100;effective+=value;breakdown.push({phase:a.phase,share:a.share,cap,effective:value})}
   }
   if(Math.abs(total-100)>1e-8)errors.push("ALLOCATION_MUST_TOTAL_100");
   const usedPhases=used.filter(x=>x!=="燈");
   if(!legalPhases(usedPhases))errors.push("ILLEGAL_COMBINATION");
   if(school?.phase==="燈"&&usedPhases.length>1)errors.push("PURE_LAMP_NO_COMBINATION");
   if(school&&school.phase!=="燈"&&usedPhases.length>1&&!usedPhases.includes(school.phase))errors.push("SCHOOL_CORE_REQUIRED");
  }
  const materials=d?.materials;
  if(!Array.isArray(materials)||materials.some(x=>!str(x))||new Set(materials).size!==materials.length)errors.push("INVALID_MATERIALS");
  else if(materials.some(x=>!p?.observations?.includes?.(x)))errors.push("OBSERVATION_REQUIRED");
  if(d?.sourceId!=null&&!p?.skills?.some?.(s=>s.id===d.sourceId))errors.push("SOURCE_NOT_OWNED");
  if(d?.sourceId===d?.id||p?.skills?.some?.(s=>s.id===d?.id))errors.push("DUPLICATE_SKILL_ID");
  return {ok:errors.length===0,errors:[...new Set(errors)],breakdown,effective,loss:100-effective,displayPhases:used.filter(x=>x!=="燈").length?used.filter(x=>x!=="燈"):["燈"]};
 }
 function createSkill(p,d){
  const v=validateSkill(p,d);if(!v.ok)throw Error(v.errors.join(","));
  const skill={id:d.id,name:d.name,schoolId:p.schoolId,allocations:d.allocations.map(a=>({...a})),materials:[...d.materials],sourceId:d.sourceId??null,displayPhases:v.displayPhases,kind:d.sourceId?"adaptation":"original"};
  return {...p,skills:[...p.skills,skill]};
 }
 return freeze({version:"1.0.0",phases,branches,realms,basics,advanced,schools,combinations,opposite,efficiency,legalPhases,validateProfile,createProfile,observe,validateSkill,createSkill});
})();
if(root.DungeonEngineV1)root.DungeonEngineV1.register({id:'mind.core',version:'1.0.0',requires:['engine.registry']});
})(window);
