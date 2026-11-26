(function(root){
 'use strict';
 const fighters=[
  ['主角','',16],['艾岑','果斷老手',12],['米菈','熱心新手',10],
  ['洛文','謹慎老手',12],['芮安','膽大新手',10],['岑露','冷靜老手',11]
 ];
 const moves=[['attack','攻擊'],['guard','防禦'],['dodge','閃避'],['observe','觀察'],['approach','靠近'],['backstep','拉開'],['retreat','撤離']];
 function setup(total,front){
  return fighters.slice(0,total).map(([name,style,maxHp],id)=>({id,name,style,maxHp,hp:maxHp,front:id<front}));
 }
 function plan(team,battle){
  const front=team.filter(m=>m.front&&m.hp>0),rear=team.filter(m=>!m.front&&m.hp>0);
  const danger=battle.intent==='heavy'||battle.intent==='pounce';
  const target=danger&&front.length?front[battle.turn%front.length]:null;
  const cover=danger&&battle.distance<2?rear.find(m=>/老手/.test(m.style)):null;
  const receive=rear.find(m=>m!==cover&&/新手/.test(m.style));
  return {target,cover,receive};
 }
 function mount({resolve,intents,distances,sprite}){
  const box=document.createElement('dialog');
  box.className='battle-playtest';
  box.setAttribute('aria-label','測試戰鬥');
  document.body.append(box);
  let total=6,front=3,team,battle,feedback,vacancies,phase='setup';
  function button(label,act,disabled=false){
   const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;b.onclick=act;return b;
  }
  function add(parent,tag,value,cls){
   const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value;parent.append(el);return el;
  }
  function select(parent,label,value,limit,callback){
   const wrap=add(parent,'label',label);
   const field=add(wrap,'select','');
   for(let n=1;n<=limit;n++){const o=add(field,'option',String(n));o.value=n;}
   field.value=value;
   field.onchange=()=>{callback(Number(field.value));render();};
  }
  function start(){
   team=setup(total,front);vacancies=0;
   battle={enemyHp:16,maxEnemyHp:16,turn:0,intent:'pounce',distance:1,focused:false,braced:false,result:null};
   feedback='苔棘鬃獸從林邊現身。';phase='fight';render();
  }
  function turn(action,out,incoming){
   const {target,cover,receive}=plan(team,battle);
   const dispatch=action==='dispatch';
   if(dispatch&&(out&&(out.id===0||!out.front)||incoming&&(incoming.front||incoming.hp<=0)))return;
   const hero=team[0];
   const result=resolve(battle,hero.hp,dispatch?'guard':action);
   if(result.skipped)return;
   battle=result.state;
   const reports=[battle.feedback];
   if(out)out.front=false;
   if(incoming)incoming.front=true;
   if(dispatch)reports[0]=[out&&out.name+'退到後方',incoming&&incoming.name+'上場防禦'].filter(Boolean).join('，')+'。';
   const victim=target?(target===out?incoming||hero:target):hero;
   let hit=result.hit;
   if(hit&&cover&&cover!==incoming&&(out||action==='retreat')){
    hit=Math.max(0,hit-2);
    reports.push(cover.name+'出手掩護，減輕這次攻擊。');
   }
   if(hit){
    victim.hp=Math.max(0,victim.hp-hit);
    reports.push(victim.name+'受到 '+hit+' 點傷害。');
    if(!victim.hp){victim.front=false;vacancies++;reports.push(victim.name+'倒地。');}
   }
   if(out&&receive&&receive!==incoming)reports.push(receive.name+'接應了'+out.name+'。');
   if(hero.hp===0)battle.result='defeat';
   else if(battle.result==='defeat')battle.result=action==='retreat'?'retreat':null;
   if(!battle.result&&battle.distance===0&&!dispatch){
    const striker=team.find(m=>m.id&&m.front&&m.hp>0&&/果斷|膽大/.test(m.style)&&m!==victim);
    if(striker){battle.enemyHp=Math.max(0,battle.enemyHp-2);reports.push(striker.name+'抓到空隙，造成 2 點傷害。');}
    if(battle.enemyHp<=3)battle.result='victory';
   }
   feedback=reports.join(' ');render();
  }
  function render(){
   box.replaceChildren();
   const head=add(box,'header','','battle-test-header');
   add(head,'h2','測試戰鬥');head.append(button('離開',()=>box.close()));
   const content=add(box,'div','','battle-test-content');
   if(phase==='setup'){
    add(content,'p','測試使用獨立隊伍與體力。');
    select(content,'出發人數 ',total,6,n=>{total=n;front=Math.min(front,n);});
    select(content,'前線人數 ',front,Math.min(4,total),n=>{front=n;});
    add(content,'p',front+' 人前線 · '+(total-front)+' 人待命');
    content.append(button('開始戰鬥',start));return;
   }
   const scene=add(content,'div','','battle-test-scene');
   const monster=add(scene,'img','');monster.src=sprite;monster.alt='苔棘鬃獸';
   add(scene,'strong','苔棘鬃獸 · '+battle.enemyHp+' / '+battle.maxEnemyHp+' HP');
   const {target,cover,receive}=plan(team,battle);
   const outcomes={victory:'苔棘鬃獸已退走',retreat:'隊伍已撤離',defeat:'主角倒地'};
   const status=add(content,'p',battle.result?outcomes[battle.result]:'第 '+(battle.turn+1)+' 回合 · '+distances[battle.distance]+'。'+intents[battle.intent]+(target?' 牠盯著'+target.name+'。':''));status.className='battle-test-status';status.setAttribute('role','status');
   add(content,'p',feedback,'battle-test-feedback');
   const roster=add(content,'ul','','battle-test-roster');
   for(const member of team){
    const position=member.hp===0?'倒地':member.front?'前線':'後方';
    const intent=battle.result||member.hp===0?'':member===cover?'｜你一退，我就掩護。':member===receive?'｜有傷員退下，我來接應。':!member.front?(/新手/.test(member.style)?'｜我等你的指示。':'｜我守著退路。'):member.id?(/果斷|膽大/.test(member.style)?'｜有空隙我就攻擊。':'｜我會留意牠的動作。'):'';
    const row=add(roster,'li',member.name+' '+member.style+' · '+position+' · '+member.hp+'/'+member.maxHp+' HP');
    row.dataset.position=member.hp===0?'down':member.front?'front':'rear';
    if(intent)add(row,'span',intent.slice(1),'battle-test-intent');
   }
   const footer=add(box,'footer','','battle-test-footer');
   const controls=add(footer,'div','','battle-test-actions');
   if(battle.result){controls.append(button('重新配置',()=>{phase='setup';render();}));return;}
   for(const [id,label] of moves)controls.append(button(label,()=>turn(id),id==='attack'&&battle.distance!==0||id==='approach'&&battle.distance===0||id==='backstep'&&battle.distance===2));
   const ready=team.filter(m=>!m.front&&m.hp>0);
   const active=team.filter(m=>m.id&&m.front&&m.hp>0);
   if(!ready.length&&!active.length)return;
   const details=add(footer,'details','','battle-test-dispatch');
   add(details,'summary','調度');
   const options=add(details,'div','','battle-test-actions battle-test-options');
   add(options,'p','換人或增援消耗一回合。');
   if(active.length<3)for(const incoming of ready){
    options.append(button(incoming.name+(vacancies?'補位（不耗回合）':'增援'),()=>{
     if(!vacancies){turn('dispatch',null,incoming);return;}
     incoming.front=true;vacancies--;
     feedback=incoming.name+'補上倒地隊友的位置。';render();
    }));
   }
   for(const out of active){
    options.append(button(out.name+'退到後方',()=>turn('dispatch',out)));
    for(const incoming of ready)options.append(button(out.name+'換成'+incoming.name,()=>turn('dispatch',out,incoming)));
   }
  }
  return ()=>{phase='setup';render();box.showModal();};
 }
 root.DungeonBattlePlaytestV1=Object.freeze({mount,setup,plan});
})(typeof window!=='undefined'?window:globalThis);
