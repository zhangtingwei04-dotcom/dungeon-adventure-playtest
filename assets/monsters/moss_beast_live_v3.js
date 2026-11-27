/* Live V3 single encounter presentation. Rules and saves remain owned by the game. */
(function(root){'use strict';
const urls=Array.from({length:8},(_,i)=>'./assets/monsters/v3/moss_beast_v3_'+String(i*45).padStart(3,'0')+'.png');
const mapping=[['front',false],['quarter',true],['side',true],['rear',true],['back',false],['rear',false],['side',false],['quarter',false]];
const reduce=()=>!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
let cache=null,loading=null;
function load(){if(loading)return loading;loading=(async()=>{
 const A={front:root.DungeonMossBeastV3Axial.front,back:root.DungeonMossBeastV3Axial.back,side:root.DungeonMossBeastV3Adapter,quarter:root.DungeonMossBeastV3QuarterAdapter,rear:root.DungeonMossBeastV3RearAdapter},art={};
 await Promise.all(Object.entries({front:0,back:4,side:6,quarter:7,rear:5}).map(async ([key,i])=>{const im=new Image();im.src=urls[i];await im.decode();art[key]=A[key].split(im);}));
 cache={A,art};return cache;
 })().catch(()=>{loading=null;return null;});return loading;}
function draw(canvas,dir,mode,age,variant='basic',side='left'){
 if(!cache)return;const g=canvas.getContext('2d'),[key,mirror]=mapping[dir],A=cache.A[key],C=root.DungeonCreatureCloseAttackV1,P=root.DungeonPlayerAttackV1;
 let pose=mode==='player-strike'?A.sample(age<P.timing.impact?'stand':variant==='heavy'?'heavy-hit':'hit',Math.max(0,age-P.timing.impact)):C.timings[mode]&&key==='front'?C.sample(mode,age,A.sample('stand',0),root.DungeonMossBeastV3AxialProfiles.front,{side}):A.sample(mode,age);
 const lunge=C.lunge(mode,age),recoil=mode==='player-strike'?P.sample(age).recoil:0;
 g.clearRect(0,0,256,208);g.save();g.translate(128,174+lunge*9-recoil*9);g.scale(1+lunge*.13-recoil*.07,1+lunge*.13-recoil*.07);g.translate(-112,-153);g.imageSmoothingEnabled=false;
 if(mirror){g.translate(224,0);g.scale(-1,1);}A.draw(g,cache.art[key],pose);g.restore();
 if(mode==='player-strike')P.draw(g,age,{x:128,y:104,scale:1,variant});
 if(mode==='claw'&&key==='front'){const sw=root.DungeonBattleImpactV1.swipe(age,C.timings.claw.impact),leg=pose.legs.find(l=>l.key===side);if(sw&&leg){g.save();g.globalAlpha=sw.opacity;g.strokeStyle='#fff0cb';g.lineWidth=2;const d=side==='left'?1:-1,x=leg.foot[0]+16,y=leg.foot[1]+21;for(let i=0;i<3;i++){g.beginPath();g.moveTo(x-d*(25+i*4),y-15-i*3);g.quadraticCurveTo(x-d*3,y-5,x+d*12,y+2-i*3);g.stroke();}g.restore();}}
}
function mount(img,state){load().then(c=>{if(!c||!img.isConnected||img.closest('#battleSurface')?.dataset.v3Animating==='true')return;const canvas=document.createElement('canvas');canvas.width=256;canvas.height=208;canvas.className='battle-creature v3-rig';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',img.alt);draw(canvas,0,state.intent==='heavy'?'charge':state.intent==='pounce'?'alert':'stand',0);img.replaceWith(canvas);}).catch(()=>{});}
function animate(canvas,duration,paint){return new Promise((resolve,reject)=>{let start=null;const frame=now=>{if(!canvas.isConnected){resolve();return;}if(start===null)start=now;const t=Math.min(duration,now-start);try{paint(t);}catch(e){reject(e);return;}if(t<duration)root.requestAnimationFrame(frame);else resolve();};root.requestAnimationFrame(frame);});}
async function play(canvas,host,kind,result,{rest=null}={}){
 const C=root.DungeonCreatureCloseAttackV1,P=root.DungeonPlayerAttackV1,M=root.DungeonCreatureMotionV1.create(),D=root.DungeonCreatureDirectionV1,E=root.DungeonBattleExitV1;
 if(!cache||reduce()||!canvas?.classList.contains('v3-rig'))return false;
 const oldDistance=Number(host.dataset.distance),nextDistance=result.state?.distance??0;
 const spots=[{top:48,w:43,h:49},{top:43,w:32,h:38},{top:38,w:20,h:24}],from=spots[oldDistance]||spots[1],to=spots[nextDistance]||spots[0];
 const position=(p)=>{canvas.style.top=p.top+'%';canvas.style.width=p.w+'%';canvas.style.height=p.h+'%';};
 const interpolate=(a,b,u)=>({top:a.top+(b.top-a.top)*u,w:a.w+(b.w-a.w)*u,h:a.h+(b.h-a.h)*u});
 let current=from;position(current);
 if(result.damage){await animate(canvas,Math.max(P.timing.duration,P.timing.impact+650),t=>draw(canvas,0,'player-strike',t,result.damage>=5?'heavy':'basic'));}
 if(result.enemyAction==='pounce'||result.enemyAction==='heavy'){
  const mode=result.enemyAction==='pounce'?'pounce':oldDistance===0&&nextDistance===0?'claw':'slam',p=M.attackProfiles[mode==='claw'?'slam':mode],duration=mode==='claw'?C.timings.claw.duration:p.end;
  await animate(canvas,duration,t=>{if(mode==='pounce'&&result.state?.result!=='victory'){current=interpolate(from,to,ease((t-p.push)/(p.airEnd-p.push)));position(current);}draw(canvas,0,mode,t,'basic',(result.state?.turn||0)%2?'right':'left');});
 }else if(result.enemyAction==='approach'){await animate(canvas,550,t=>{current=interpolate(from,to,ease(t/550));position(current);draw(canvas,0,'walk',t);});}
 const type=E.classify(result,{action:kind});
 if(type==='flee'){const target=rest||{x:72,y:47,w:13},startX=50,startY=current.top;const dir=(Math.round(Math.atan2(target.x-startX,target.y-startY)/(Math.PI/4))+8)%8;const route=D.plan(0,dir,{speed:'fast'});if(route.duration)await animate(canvas,route.duration,t=>{const q=D.sample(route,t);draw(canvas,q.direction,'walk',q.stepTime);});
 await animate(canvas,900,t=>{const u=E.returnProgress(t,900);canvas.style.left=(startX+(target.x-startX)*u)+'%';position(interpolate(current,{top:target.y-target.w*.38,w:target.w,h:target.w*1.12},u));draw(canvas,dir,'run',t);});await animate(canvas,180,t=>draw(canvas,dir,'stand',0));await animate(canvas,650,t=>{canvas.style.opacity=String(1-ease(t/650));});
 }else if(type==='player-retreat'){await animate(canvas,350,t=>draw(canvas,0,'stand',0));}
 return true;
}
root.DungeonMossBeastLiveV3=Object.freeze({urls,load,mount,play});
})(typeof window==='undefined'?window:globalThis);
