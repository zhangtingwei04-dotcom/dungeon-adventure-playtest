/* 燈火核心：遭遇動態 V1.0 — scene-space presentation, no save writes.
   Authored ground routes for wreck; same actor nodes persist through encounter. */
(function(root){
 'use strict';
 const slots=[
  {rest:{x:54,y:65,w:12},via:[{x:59,y:71,w:14}],fight:{x:61,y:84,w:23},delay:0},
  {rest:{x:91,y:72,w:14},via:[{x:88,y:76,w:17}],fight:{x:85,y:86,w:21},delay:280},
  {rest:{x:76,y:55,w:9},via:[{x:74,y:62,w:11}],fight:{x:73,y:70,w:15},delay:540},
  {rest:{x:16,y:91,w:16},via:[{x:25,y:92,w:18}],fight:{x:38,y:91,w:20},delay:380}
 ];
 const id=i=>'wreck-trial-monster-'+i;
 function restObjects(count=3){return slots.slice(0,count).map((p,i)=>({id:id(i),kind:'creature',x:p.rest.x,y:p.rest.y,width:p.rest.w,label:'苔棘鬃獸 '+(i+1),trialIndex:i}));}
 function frame(p){return {left:p.x+'%',top:p.y+'%',width:p.w+'%'};}
 function position(node,p){Object.assign(node.style,frame(p));node.style.zIndex=String(10+Math.round(p.y));node._ground={...p};}
 function destination(i,distance){
  const p=slots[i].fight,d=distance===0?1:distance===2?-1:0;
  return {x:p.x+(i===1?-1:i===3?1:0)*d,y:Math.min(93,p.y+3*d),w:p.w*(1+.12*d)};
 }
 function create(host){
  let generation=0,animations=[],wildlife=[],actors=[],started=false;
  const artV2=root.DungeonMossBeastArtV2, clocks=new Map();
  const reduced=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function animate(node,frames,options){if(reduced()||!node.animate)return null;const a=node.animate(frames,options);animations.push(a);return a;}
  function stopFrames(node){const t=clocks.get(node);if(t){clearTimeout(t);clocks.delete(node);}}
  function pose(node,name){stopFrames(node);const img=node.querySelector('img');if(!img||!artV2)return;img.src=artV2[name]||artV2.front;img.style.transform='none';}
  function frames(node,name,duration=Infinity,flip=false,done){
   stopFrames(node);const img=node.querySelector('img'),seq=artV2?.[name];if(!img||!seq)return;
   img.style.transform=flip?'scaleX(-1)':'none';
   const start=Date.now(),token=generation;let last=-1;
   const tick=()=>{if(token!==generation||!node.isConnected){stopFrames(node);return;}const elapsed=Date.now()-start;if(elapsed>=duration){clocks.delete(node);done?.();return;}
    const idx=name==='rise'?Math.min(seq.frames.length-1,Math.floor(elapsed*seq.fps/1000)):Math.floor(elapsed*seq.fps/1000)%seq.frames.length;
    if(idx!==last){img.src=seq.frames[idx];last=idx;}clocks.set(node,setTimeout(tick,1000/seq.fps));};tick();
  }
  function clear(){
   for(const n of clocks.keys())stopFrames(n);
   generation++;for(const a of animations)a.cancel?.();animations=[];
   for(const n of wildlife){delete n.dataset.encounterFled;}
   wildlife=[];actors=[];started=false;
  }
  function bind(count){
   actors=Array.from(host.querySelectorAll('[data-trial-monster]'));
   for(let i=0;i<count;i++){
    if(actors.some(n=>Number(n.dataset.trialMonster)===i))continue;
    const base=actors[0];if(!base)continue;
    const n=base.cloneNode(true);n.dataset.trialMonster=String(i);n.dataset.objectId=id(i);n.setAttribute('aria-label','苔棘鬃獸 '+(i+1));n.querySelector('span').textContent='苔棘鬃獸 '+(i+1);host.append(n);actors.push(n);
   }
   for(const n of actors){const i=Number(n.dataset.trialMonster);n.hidden=i>=count;n.dataset.encounterPose='rest';delete n.dataset.encounterResolved;delete n.dataset.encounterSelected;position(n,slots[i].rest);if(!n.hidden&&artV2){pose(n,'rest');if(!reduced())frames(n,'idle',Infinity,i===1);}}
  }
  function flee(){
   wildlife=Array.from(host.querySelectorAll('.forest-v4-object[data-motion="animal"]')).filter(n=>!n.hidden&&!n.classList.contains('env-leaving'));
   for(const n of wildlife){
    const kind=n.dataset.liveKind||'',x=parseFloat(n.style.left)||50,dir=x<50?-1:1;
    const bird=/bird|butterfly/.test(kind),beetle=/beetle/.test(kind),rect=host.getBoundingClientRect();
    const dx=beetle?dir*rect.width*.08:dir*rect.width*.48,dy=bird?-rect.height*.6:beetle?rect.height*.02:rect.height*.12;
    const a=animate(n,[{translate:'0 0',opacity:1},{translate:dx+'px '+dy+'px',opacity:0}],{duration:beetle?700:900,easing:'ease-in',fill:'forwards'});
    n.dataset.encounterFled='moving';if(a)a.finished.then(()=>{n.dataset.encounterFled='true';}).catch(()=>{});else n.dataset.encounterFled='true';
   }
  }
  async function enter(count){
   clear();bind(count);const token=generation;started=true;flee();
   const jobs=[];
   for(const n of actors){
    const i=Number(n.dataset.trialMonster);if(i>=count)continue;
    const p=slots[i],art=n.querySelector('img');n.dataset.encounterPose='walk';
    const end=destination(i,i===0?1:2);
    if(artV2&&art&&!reduced()){
     stopFrames(n);pose(n,'rest');
     const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
     jobs.push((async()=>{
      await wait(p.delay);if(token!==generation)return;
      n.dataset.encounterPose='rise';frames(n,'rise',1000,i===1);
      await wait(1000);if(token!==generation)return;
      n.dataset.encounterPose='walk';frames(n,'walk',1050,i===1);
      const a=animate(n,[frame(p.rest),...p.via.map(frame),frame(end)],{duration:1050,easing:'linear',fill:'backwards'});
      position(n,end);if(a)await a.finished.catch(()=>{});
      if(token===generation){pose(n,i===0?'front':'threeQuarter');n.dataset.encounterPose='ready';}
     })());
    }else{
     if(artV2)pose(n,i===0?'front':'threeQuarter');
     const a=animate(n,[frame(p.rest),...p.via.map(frame),frame(end)],{duration:1250,delay:p.delay,easing:'ease-in-out',fill:'backwards'});
     position(n,end);if(a)jobs.push(a.finished);
    }
   }
   await Promise.allSettled(jobs);if(token!==generation)return false;
   for(const n of actors){if(!n.hidden){n.dataset.encounterPose='ready';if(artV2)pose(n,Number(n.dataset.trialMonster)===0?'front':'threeQuarter');}}return true;
  }
  function sync(foes,selected){
   if(!started)return;
   for(const n of actors){
    const i=Number(n.dataset.trialMonster),m=foes[i];if(!m)continue;
    n.dataset.encounterSelected=String(i===selected&&!m.result);
    if(m.result==='victory'||m.result==='retreat'){
     if(n.dataset.encounterResolved==='true')continue;
     n.dataset.encounterResolved='true';n.dataset.encounterPose='walk';
     const from=n._ground||slots[i].fight,to=slots[i].rest;
     if(artV2&&!reduced())frames(n,'walk',700,to.x<from.x);
     const a=animate(n,[{...frame(from),opacity:1},{...frame(to),opacity:0}],{duration:700,easing:'ease-in',fill:'forwards'});
     if(!a)n.hidden=true;continue;
    }
    const end=destination(i,m.distance),from=n._ground||end;
    if(Math.abs(from.y-end.y)>.1||Math.abs(from.x-end.x)>.1){
     if(artV2&&!reduced())frames(n,'walk',420,end.x<from.x,()=>pose(n,i===0?'front':'threeQuarter'));
     animate(n,[frame(from),frame(end)],{duration:420,easing:'linear'});position(n,end);
    }else if(artV2&&!clocks.has(n))pose(n,i===0?'front':'threeQuarter');
    n.dataset.encounterPose=m.intent==='pounce'||m.intent==='heavy'?'alert':m.intent==='exposed'?'exposed':'ready';
   }
  }
  return {bind,enter,sync,clear};
 }
 root.DungeonEncounterMotionV1=Object.freeze({slots,restObjects,destination,create});
})(typeof window!=='undefined'?window:globalThis);
