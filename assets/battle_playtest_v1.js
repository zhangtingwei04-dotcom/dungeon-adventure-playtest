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

 // Shared combat display: enemy and ally groups never exchange positions.
 function priority(m){
  if(m.hp<=0||m.hp/m.maxHp<=.25)return 0;
  if(m.action==='受到重創')return 1;
  if(['救援','掩護','接應','補位','治療'].includes(m.action))return 2;
  if(['攻擊','防禦','閃避','上場'].includes(m.action))return 3;
  return 4;
 }
 function sortAllies(members,previous=[]){
  const order=new Map(previous.map((id,i)=>[id,i]));
  return members.filter(m=>m.id!==0).slice().sort((a,b)=>priority(a)-priority(b)||(order.get(a.id)??previous.length)-(order.get(b.id)??previous.length));
 }
 function snapshot(host){
  return new Map(Array.from(host.querySelectorAll('[data-combat-ally]'),el=>[el.dataset.combatAlly,el.getBoundingClientRect().top]));
 }
 function renderPanel(host,{enemy,allies=[],feedback='',previous=[],positions=new Map()}){
  const make=(parent,tag,cls,value)=>{const el=document.createElement(tag);el.className=cls;if(value!==undefined)el.textContent=value;parent.append(el);return el;};
  const panel=make(host,'div','combat-status-panel');
  const enemies=make(panel,'section','combat-enemy-zone');
  make(enemies,'h4','combat-zone-title','怪物區');
  function card(parent,m,enemyCard=false){
   const el=make(parent,'article','combat-status-card');
   if(!enemyCard){el.dataset.combatAlly=String(m.id);el.dataset.priority=String(priority(m));}
   const name=make(el,'div','combat-status-name',m.name);
   if(!enemyCard)make(name,'small','combat-hp-label',m.hp+'/'+m.maxHp+' HP');
   const bar=make(el,'div','combat-status-meter');
   const fill=make(bar,'span','combat-status-fill');
   fill.style.width=(Math.max(0,Math.min(1,m.hp/(m.maxHp||1)))*100)+'%';
   make(el,'p','combat-status-line',m.status||'');
   return el;
  }
  card(enemies,enemy,true);
  const sorted=sortAllies(allies,previous);
  if(sorted.length){
   const section=make(panel,'section','combat-ally-zone');
   make(section,'h4','combat-zone-title','隊友區（'+sorted.length+'）');
   const list=make(section,'div','combat-ally-list');
   for(const member of sorted){
    const el=card(list,member);
    const old=positions.get(String(member.id));
    if(old!==undefined&&el.animate&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
     const delta=old-el.getBoundingClientRect().top;
     if(Math.abs(delta)>1)el.animate([{transform:'translateY('+delta+'px)'},{transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
    }
   }
  }
  const log=make(panel,'section','combat-log-zone');
  make(log,'h4','combat-zone-title','即時戰況');
  const report=make(log,'p','combat-status-line',feedback||'等待行動。');report.setAttribute('aria-live','polite');
  return sorted.map(m=>m.id);
 }
 function mount({resolve,intents,distances,sprite}){
  const box=document.createElement('dialog');
  box.className='battle-playtest';
  box.setAttribute('aria-label','測試戰鬥');
  document.body.append(box);
  let total=6,front=3,team,battle,feedback,vacancies,phase='setup',previous=[],lastActions=new Map();
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
   team=setup(total,front);vacancies=0;previous=[];lastActions=new Map();
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
   battle=result.state;lastActions=new Map();
   const reports=[battle.feedback];
   if(out){out.front=false;lastActions.set(out.id,'撤至後方');}
   if(incoming){incoming.front=true;lastActions.set(incoming.id,'上場');}
   if(dispatch)reports[0]=[out&&out.name+'退到後方',incoming&&incoming.name+'上場防禦'].filter(Boolean).join('，')+'。';
   const victim=target?(target===out?incoming||hero:target):hero;
   let hit=result.hit;
   if(hit&&cover&&cover!==incoming&&(out||action==='retreat')){
    hit=Math.max(0,hit-2);lastActions.set(cover.id,'掩護');
    reports.push(cover.name+'出手掩護，減輕這次攻擊。');
   }
   if(hit){
    victim.hp=Math.max(0,victim.hp-hit);lastActions.set(victim.id,hit>=3?'受到重創':'受到攻擊');
    reports.push(victim.name+'受到 '+hit+' 點傷害。');
    if(!victim.hp){victim.front=false;vacancies++;reports.push(victim.name+'倒地。');}
   }
   if(out&&receive&&receive!==incoming){lastActions.set(receive.id,'接應');reports.push(receive.name+'接應了'+out.name+'。');}
   if(hero.hp===0)battle.result='defeat';
   else if(battle.result==='defeat')battle.result=action==='retreat'?'retreat':null;
   if(!battle.result&&battle.distance===0&&!dispatch){
    const striker=team.find(m=>m.id&&m.front&&m.hp>0&&/果斷|膽大/.test(m.style)&&m!==victim);
    if(striker){lastActions.set(striker.id,'攻擊');battle.enemyHp=Math.max(0,battle.enemyHp-2);reports.push(striker.name+'抓到空隙，造成 2 點傷害。');}
    if(battle.enemyHp<=3)battle.result='victory';
   }
   feedback=reports.join(' ');render();
  }
  function render(){
   const positions=snapshot(box);box.replaceChildren();
   const content=add(box,'div','','battle-test-content');
   const footer=add(box,'footer','','battle-test-footer');
   const controls=add(footer,'div','','battle-test-actions');
   const exit=button('離開',()=>box.close());exit.className='battle-test-exit';footer.append(exit);
   if(phase==='setup'){
    add(content,'p','測試使用獨立隊伍與體力。');
    select(content,'出發人數 ',total,6,n=>{total=n;front=Math.min(front,n);});
    select(content,'前線人數 ',front,Math.min(4,total),n=>{front=n;});
    add(content,'p',front+' 人前線 · '+(total-front)+' 人待命');
    controls.append(button('開始戰鬥',start));return;
   }
   const layout=add(content,'div','','battle-test-layout');
   const main=add(layout,'div','','battle-test-main');
   const scene=add(main,'div','','battle-test-scene');
   const monster=add(scene,'img','');monster.src=sprite;monster.alt='苔棘鬃獸';
   add(scene,'strong','苔棘鬃獸');
   const {target,cover,receive}=plan(team,battle);
   const outcomes={victory:'苔棘鬃獸已退走',retreat:'隊伍已撤離',defeat:'主角倒地'};
   const status=add(main,'p',battle.result?outcomes[battle.result]:'第 '+(battle.turn+1)+' 回合 · '+distances[battle.distance]+'。'+intents[battle.intent]+(target?' 牠盯著'+target.name+'。':''));status.className='battle-test-status';status.setAttribute('role','status');
   add(main,'p','主角 · '+team[0].hp+'/'+team[0].maxHp+' HP','battle-test-feedback');
   const side=add(layout,'aside','','battle-test-side');
   const allies=team.filter(m=>m.id!==0).map(m=>{
    const position=m.hp===0?'倒地':m.front?'前線':'後方';
    const action=lastActions.get(m.id)||'';
    const intent=m.hp===0?'需要救援':battle.result?'戰鬥結束':action|| (m===cover?'準備掩護':m===receive?'準備接應':m.front?'等待攻擊機會':'等待指示');
    return {...m,action,status:position+'｜'+intent};
   });
   previous=renderPanel(side,{enemy:{name:'苔棘鬃獸',hp:battle.enemyHp,maxHp:battle.maxEnemyHp,status:battle.result?outcomes[battle.result]:distances[battle.distance]+'｜'+intents[battle.intent]},allies,feedback,previous,positions});
   if(battle.result){controls.append(button('重新配置',()=>{phase='setup';render();}));return;}
   for(const [id,label] of moves){if(id==='attack'&&battle.distance!==0||id==='approach'&&battle.distance===0||id==='backstep'&&battle.distance===2)continue;controls.append(button(label,()=>turn(id)));}
   const ready=team.filter(m=>!m.front&&m.hp>0);
   const active=team.filter(m=>m.id&&m.front&&m.hp>0);
   if(!ready.length&&!active.length)return;
   const details=add(controls,'details','','battle-test-dispatch');
   add(details,'summary','調度');
   const options=add(details,'div','','battle-test-actions battle-test-options');
   add(options,'p','換人或增援消耗一回合。');
   if(active.length<3)for(const incoming of ready){
    options.append(button(incoming.name+(vacancies?'補位（不耗回合）':'增援'),()=>{
     if(!vacancies){turn('dispatch',null,incoming);return;}
     incoming.front=true;vacancies--;lastActions=new Map([[incoming.id,'補位']]);
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
 root.DungeonBattlePlaytestV1=Object.freeze({mount,setup,plan,priority,sortAllies,renderPanel,snapshot});
})(typeof window!=='undefined'?window:globalThis);
