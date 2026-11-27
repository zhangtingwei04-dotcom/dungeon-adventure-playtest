/* 燈火格擋／失衡候選 V1.0。純回合規則，不修改正式開局 resolver。 */
(function(root){'use strict';
const max=100,clamp=n=>Math.max(0,Math.min(max,n)),initial=()=>({gp:max,balance:0});
const normalize=v=>({gp:clamp(Number.isFinite(v?.gp)?v.gp:max),balance:clamp(Number.isFinite(v?.balance)?v.balance:0)});
function contact(previous,{guard=false,cost=0,damage=0}={}){
 const s=normalize(previous),spent=guard?Math.min(s.gp,cost):0,broken=guard&&cost>0&&s.gp<=cost;
 const blocked=guard&&!broken&&cost>0;
 return {gp:s.gp-spent,balance:clamp(s.balance+(broken?45+damage*2:blocked?5:damage>0?8+damage*2:0)),spent,broken,blocked};
}
function recover(previous,{gp=12,balance=12}={}){const s=normalize(previous);return {gp:clamp(s.gp+gp),balance:clamp(s.balance-balance)};}
function resolve(previous,hp,action,ground={},technique=null){
 const R=root.DungeonBattleRulesV1,hero=normalize(previous.heroDefense),enemy=normalize(previous.enemyDefense);
 const valid=!previous.result&&['attack','guard','dodge','observe','approach','backstep','retreat'].includes(action)&&!(action==='attack'&&previous.distance!==0);
 if(!valid)return R.resolve(previous,hp,action,ground);
 const baseRaw=action==='attack'?(previous.intent==='exposed'?6:3)+(previous.focused?2:0):0;
 const raw=baseRaw?Math.max(1,baseRaw+(technique?.damageDelta||0)):0;
 // Watch is the candidate's defensive stance; no extra action or RNG.
 const enemyGuard=raw>0&&previous.intent==='watch'&&enemy.gp>0&&enemy.balance<75;
 const enemyCost=raw*5+8+(technique?.guardBonus||0),enemyCanBlock=enemyGuard&&enemy.gp>enemyCost;
 const mitigation=enemyCanBlock?Math.floor(raw*.5):0;
 const result=R.resolve({...previous,enemyHp:previous.enemyHp+baseRaw-raw+mitigation},hp,action,ground);
 if(result.skipped)return result;
 result.damage=Math.max(0,raw-mitigation);
 const enemyContact=result.damage>0?contact(enemy,{guard:enemyGuard,cost:enemyCost,damage:result.damage}):null;
 if(enemyContact&&technique)enemyContact.balance=clamp(enemyContact.balance+Math.round((technique.balanceBonus||0)*(enemyContact.blocked?.35:1)));
 const guardCost=result.enemyAction==='heavy'?34:result.enemyAction==='pounce'?24:0;
 const heroGuard=action==='guard'&&result.hit>0&&guardCost>0;
 const heroBreak=heroGuard&&hero.gp<=guardCost;
 if(heroBreak){result.hit=result.enemyAction==='heavy'?5:4;result.hp=Math.max(0,hp-result.hit);if(result.hp===0)result.state.result='defeat';if(result.enemyAction==='heavy')result.state.intent='watch';}
 const heroContact=result.hit>0?contact(hero,{guard:heroGuard,cost:guardCost,damage:result.hit}):null;
 result.state.heroDefense=heroContact||recover(hero,{gp:action==='guard'?8:12,balance:12});
 result.state.enemyDefense=enemyContact||recover(enemy);
 result.defense={hero:heroContact,enemy:enemyContact};
 // Rebuild damage suffix after mitigation; avoid contradictory legacy heavy guard text.
 let message=result.state.feedback.replace(/ 造成 \d+ 點傷害。/g,'').replace(/ 受到 \d+ 點傷害。/g,'');
 if(heroBreak)message=message.replace(' 你擋下重擊，牠失去平衡。','')+' 你的格擋被擊破。';
 else if(heroContact?.blocked)message+=' 你成功格擋。';
 if(enemyContact?.broken)message+=' 牠的格擋被擊破。';
 else if(enemyContact?.blocked)message+=' 牠擋下部分攻擊。';
 if(technique&&result.damage)message='你使出'+technique.name+'。 '+message;
 if(result.damage)message+=' 造成 '+result.damage+' 點傷害。';
 if(result.hit)message+=' 受到 '+result.hit+' 點傷害。';
 result.state.feedback=message;
 return result;
}
root.DungeonBattleDefenseV1=Object.freeze({max,initial,contact,recover,resolve});
})(typeof window==='undefined'?globalThis:window);
