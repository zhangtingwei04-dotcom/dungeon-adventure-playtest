/* 燈火戰鬥核心候選：正式 index.html 既有判定原樣抽出；暫未替換正式入口。 */
(function(root){'use strict';
const BATTLE_INTENTS=Object.freeze({
 pounce:'牠壓低身體，後腿微微繃緊。',
 heavy:'牠抬起前肢，身體向後蓄力。',
 watch:'牠停下腳步，盯著你的動作。',
 exposed:'牠失去平衡，露出了側腹。'
});
const BATTLE_DISTANCES=['近距','中距','遠距'];
function resolveBattleTurn(previous,playerHp,action,ground={}){
 const state={...previous},intent=BATTLE_INTENTS[state.intent]?state.intent:'watch';
 state.distance=Number.isInteger(state.distance)?Math.max(0,Math.min(2,state.distance)):1;
 const hp=Math.max(0,Number(playerHp)||0),slippery=!!ground.slippery;
 if(state.result||!['attack','guard','dodge','observe','retreat','approach','backstep'].includes(action)||(action==='attack'&&state.distance>0)||(action==='approach'&&state.distance===0)||(action==='backstep'&&state.distance===2))return {state,hp,damage:0,hit:0,skipped:true};
 const before=state.distance;
 state.turn++;let damage=0,hit=0,feedback='',next='watch',enemyAction='watch';
 if(action==='approach'){state.distance--;feedback='你向前一步，縮短距離。';}
 if(action==='backstep'){state.distance++;feedback='你後退一步，拉開距離。';}
 if(action==='retreat'){
  hit=intent==='pounce'&&before<2?(state.braced?0:2):intent==='heavy'&&before===0?(state.braced?0:1):0;
  state.result=hp<=hit?'defeat':'retreat';feedback=hit?'你趁機拉開距離，但被擦傷。':'你慢慢退開，牠沒有追上來。';state.distance=2;enemyAction=hit?'pounce':'withdraw';
 }else{
  if(action==='attack'){
   damage=(intent==='exposed'?6:3)+(state.focused?2:0);
   state.focused=false;feedback=intent==='exposed'?'你抓住破綻，擊中牠的側腹。':'你上前攻擊。';
  }else if(action==='guard')feedback='你穩住腳步，護住身體。';
  else if(action==='dodge')feedback='你向側面閃避。';
  else if(action==='observe'){state.focused=true;feedback='你仔細觀察牠的重心與弱點。';}
  state.enemyHp=Math.max(0,state.enemyHp-damage);
  if(state.enemyHp<=3){state.result='victory';state.distance=2;enemyAction='withdraw';feedback+=' 牠退縮了，不再想繼續戰鬥。';}
  else if(intent==='pounce'){
   enemyAction='pounce';
   if(state.distance===2){state.distance=1;next='watch';feedback+=' 牠向前撲近，尚未碰到你。';}
   else if(action==='dodge'){state.distance=0;hit=slippery?1:0;next='exposed';feedback+=' 牠撲空，露出破綻。';}
   else{state.distance=0;hit=action==='guard'?2:action==='observe'?3:4;next=action==='guard'?'heavy':'watch';feedback+=' 牠猛然撲近。';}
  }else if(intent==='heavy'){
   if(state.distance>0){enemyAction='heavy';next='exposed';feedback+=' 重擊落空。';}
   else{enemyAction='heavy';hit=action==='guard'?1:action==='dodge'?(slippery?3:2):action==='observe'?4:5;next=action==='guard'?'exposed':'watch';if(action==='guard')feedback+=' 你擋下重擊，牠失去平衡。';}
  }else if(intent==='exposed'){next=state.distance===0?'watch':'pounce';}
  else{
   if(state.distance>0){state.distance--;enemyAction='approach';feedback+=' 牠慢慢接近。';}
   next=state.distance===0?'heavy':'pounce';
  }
 }
 if(slippery&&action==='dodge'&&hit)feedback+=' 地面有些濕滑。';
 state.braced=action==='guard'||action==='dodge';
 if(state.source==='opening'&&!state.result&&state.turn>=5){state.result='retreat';state.distance=2;enemyAction='withdraw';feedback+=' 遠處傳來聲響，牠轉身逃進森林。';}
 const nextHp=Math.max(0,hp-hit);
 if(nextHp===0)state.result='defeat';
 state.intent=next;state.feedback=feedback+(damage?' 造成 '+damage+' 點傷害。':'')+(hit?' 受到 '+hit+' 點傷害。':'');
 return {state,hp:nextHp,damage,hit,enemyAction};
}
root.DungeonBattleRulesV1=Object.freeze({resolve:resolveBattleTurn,intents:BATTLE_INTENTS,distances:Object.freeze(BATTLE_DISTANCES)});
})(typeof window==='undefined'?globalThis:window);
