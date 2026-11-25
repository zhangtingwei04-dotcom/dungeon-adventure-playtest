/* Reusable scene environment renderer: authored zones, fixed anchors, low-cost motion. */
window.DungeonSceneEnvironmentV1=(function(){
 const profiles={
  forestV4:{
   waterfall:[[837,146],[890,140],[885,162],[883,188],[881,212],[889,229],[876,236],[826,233],[833,216],[831,189]],
   pools:[[[798,240],[828,237],[849,239],[851,245],[827,250],[805,248]],[[878,239],[898,240],[910,247],[932,249],[960,251],[960,262],[927,259],[901,251],[878,248]],[[823,258],[850,257],[878,261],[899,265],[917,272],[899,276],[865,267],[834,266]],[[932,266],[960,265],[960,277],[945,278]]],
   light:{x:52,y:9,spread:63}
  },
  forestV5:{
   waterfall:[[836,149],[893,141],[889,165],[887,189],[884,218],[890,238],[878,244],[827,244],[830,226],[833,188]],
   pools:[[[795,247],[827,245],[844,247],[844,252],[817,256],[799,253]],[[870,244],[894,244],[905,248],[929,251],[960,253],[960,260],[928,258],[899,253],[870,251]],[[822,260],[842,258],[854,261],[875,264],[898,268],[903,273],[875,272],[844,265],[827,266]],[[932,265],[960,264],[960,276],[948,276]]],
   cascade:[827,141,66,103],light:{x:52,y:9,spread:63},neutral:true
  }
 };
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const frac=v=>v-Math.floor(v);
 function path(ctx,poly){ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();}
 function waterProfile(env={}){
  const soil=clamp(env.soil||0,0,1),rain=clamp(env.rain||0,0,1),puddles=clamp(env.puddles||0,0,1),frost=clamp(env.frost||0,0,1);
  const volume=clamp(.85+soil*.38+puddles*.22+rain*.13,.85,1.55);
  const ice=clamp((frost-.20)/.80,0,1)*.68;
  return {volume,ice,speed:volume*(1-ice*.55)};
 }
 const waterClocks=new Map();
 function waterTime(id,t,speed){
  let clock=waterClocks.get(id);
  if(!clock){clock={last:t,phase:0};waterClocks.set(id,clock);}
  const delta=clamp(t-clock.last,0,.12);clock.last=t;clock.phase+=delta*speed;
  return clock.phase;
 }
 function draw(ctx,id,t,w=960,h=540,period='day',source=null){
  const p=profiles[id];if(!p||!Number.isFinite(t))return;
  const water=waterProfile(window.DungeonWeatherV1?.environment?.()||{});
  const flowTime=waterTime(id,t,water.speed);
  ctx.save();ctx.scale(w/960,h/540);
  // The source has baked sunlight. Suppress it locally at dusk/night, rather than adding another beam.
  const dim=p.neutral?0:period==='night'?.48:period==='dusk'?.29:period==='dawn'?.12:0;
  if(dim){
   ctx.save();ctx.globalCompositeOperation='multiply';
   const g=ctx.createRadialGradient(455,37,8,455,37,290);
   g.addColorStop(0,'rgba(104,126,151,'+dim+')');g.addColorStop(.47,'rgba(121,135,153,'+(dim*.7)+')');g.addColorStop(1,'rgba(121,135,153,0)');
   ctx.fillStyle=g;ctx.fillRect(120,0,680,330);ctx.restore();
  }
  ctx.save();path(ctx,p.waterfall);
  // Re-use the real painted water texture, gently advecting it down the cascade.
  if(source?.naturalWidth&&source?.naturalHeight){
   const sw=source.naturalWidth,sh=source.naturalHeight,fit=Math.max(960/sw,540/sh),ox=(960-sw*fit)/2,oy=(540-sh*fit)/2;
   const [dx,dy,dw,dh]=p.cascade||[826,140,66,96],delta=2+frac(flowTime*.65)*8;
   ctx.save();ctx.globalAlpha=.27*(1-water.ice*.35);
   ctx.drawImage(source,(dx-ox)/fit,(dy-oy)/fit,dw/fit,(dh-delta)/fit,dx,dy+delta,dw,dh-delta);
   ctx.restore();
  }
  // Moving highlights are clipped to the actual cascade, not surrounding rocks.
  ctx.lineCap='round';
  for(let i=0;i<Math.round(20*water.volume*(1-water.ice*.35));i++){
   const [dx,dy,dw,dh]=p.cascade||[826,140,66,96];const x=dx+8+(i*17%(dw-12)),y=dy+2+frac(flowTime*(.72+(i%4)*.12)+i*.173)*(dh-2);
   const len=(13+i%4*6)*water.volume;
   const g=ctx.createLinearGradient(x,y,x-1,y+len);
   g.addColorStop(0,'rgba(224,248,255,0)');g.addColorStop(.45,'rgba(220,246,255,.52)');g.addColorStop(1,'rgba(220,246,255,0)');
   ctx.strokeStyle=g;ctx.lineWidth=1.1+(i%3)*.65;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1.6,y+len);ctx.stroke();
  }
  ctx.restore();
  // Subtle spray in the waterfall basin; no opaque white overlay.
  ctx.save();path(ctx,p.waterfall);
  for(let i=0;i<Math.round(9*water.volume*(1-water.ice*.6));i++){const q=frac(flowTime*.92+i*.137),x=838+i*5+Math.sin(t*1.4+i)*5,y=(p.neutral?242:233)-q*15,r=3+q*10;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(213,238,249,'+(.25*(1-q)*(1-water.ice*.5))+')');g.addColorStop(1,'rgba(213,238,249,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.restore();
  // Separate small stream zones avoid painted foreground rocks.
  for(let j=0;j<p.pools.length;j++){ctx.save();path(ctx,p.pools[j]);const poly=p.pools[j],minX=Math.min(...poly.map(v=>v[0])),maxX=Math.max(...poly.map(v=>v[0])),minY=Math.min(...poly.map(v=>v[1])),maxY=Math.max(...poly.map(v=>v[1]));for(let i=0;i<8;i++){const q=frac(flowTime*(.30+i*.025)+i*.31+j*.12),x=minX+q*(maxX-minX),y=minY+((i*.37)%1)*(maxY-minY);const alpha=.38*Math.sin(Math.PI*q)*(1-water.ice*.65);ctx.strokeStyle='rgba(205,240,250,'+alpha+')';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+4,y-.8,x+13+i%3*4,y);ctx.stroke();}ctx.restore();}
  // Cold buildup is restricted to the real water margins. The central cascade keeps flowing.
  if(water.ice>.02){
   ctx.save();path(ctx,p.waterfall);
   const [dx,dy,dw,dh]=p.cascade||[826,140,66,96];
   for(const side of [-1,1]){
    const x=side<0?dx+3:dx+dw-3;
    const g=ctx.createLinearGradient(x,0,x-side*15,0);
    g.addColorStop(0,'rgba(207,235,242,'+(water.ice*.85)+')');g.addColorStop(1,'rgba(207,235,242,0)');
    ctx.fillStyle=g;ctx.fillRect(side<0?x:x-15,dy,15,dh);
    ctx.fillStyle='rgba(184,219,232,'+(water.ice*.8)+')';
    for(let i=0;i<5;i++){const xx=x-side*i*2,yy=dy+4+i%3*5;ctx.beginPath();ctx.moveTo(xx-1.2,yy);ctx.lineTo(xx+1.4,yy);ctx.lineTo(xx,yy+(7+i%3*5)*water.ice);ctx.closePath();ctx.fill();}
   }ctx.restore();
  }
  ctx.restore();
 }
 function objectProfile(o,id='forestV4'){
  const p=profiles[id];if(!p)return null;
  const k=String(o.assetId||'').replace(/^forest4_/,'');
  const weathered=/^(crate_|wheel_flat$|chassis$|wagon$|plank)/.test(k);
  const phase=((o.id||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%31)/10;
  const distance=Math.hypot((o.x-p.light.x)*.85,(o.y-p.light.y)*.6);
  return {kind:k,weathered,phase,light:clamp(1-distance/p.light.spread,.12,.83),shade:k==='wagon'?.17:weathered?.13:.075};
 }
 function apply(node,art,img,o,id='forestV4'){
  const p=objectProfile(o,id);if(!p)return;
  node.dataset.envKind=p.kind;node.dataset.envWeathered=String(p.weathered);
  node.style.setProperty('--env-delay',(-p.phase)+'s');node.style.setProperty('--env-light',p.light.toFixed(3));node.style.setProperty('--env-shade',p.shade);
  // Alpha-masked gradients affect only visible artwork, never its transparent bounding box.
  const src=img.getAttribute('src');if(src&&/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(src)){
   art.style.setProperty('--env-art-mask','url("'+src+'")');art.classList.add('env-lit-art');
  }
 }
 // Local wildlife motion uses the authored spawn as a ground anchor.
 // The node follows the ground; only the art rises during a hop.
 const wildlife=new Map();
 const ease=q=>q*q*(3-2*q);
 function wildlifeSample(kind,t,dir=-1){
  const rabbit=kind==='rabbit',period=rabbit?13.7:10.9;
  const u=((t%period)+period)%period;
  let x=0,lift=0,sx=1,sy=1,face=dir,mode='rest';
  if(rabbit){
   const hop=(start,from,to,duration)=>{
    const q=clamp((u-start)/duration,0,1);
    x=from+(to-from)*ease(q);lift=17*Math.sin(Math.PI*q);
    sx=1+.045*Math.sin(Math.PI*q);sy=1-.055*Math.sin(Math.PI*q);
    mode='hop';
   };
   if(u<2.4){sy=1-.012*(.5+.5*Math.sin(u*3));}
   else if(u<2.65){sy=.94;sx=1.04;mode='crouch';}
   else if(u<3.12){hop(2.65,0,26,.47);}
   else if(u<3.3){x=26;sy=.94;sx=1.035;mode='land';}
   else if(u<3.79){hop(3.3,26,54,.49);}
   else if(u<4.02){x=54;sy=.95;sx=1.03;mode='land';}
   else if(u<8.3){x=54;sy=1-.025*(.5+.5*Math.sin((u-4.02)*2.5));mode='pause';}
   else if(u<8.65){x=54;face=-dir;sy=.95;mode='turn';}
   else if(u<9.15){face=-dir;hop(8.65,54,26,.5);}
   else if(u<9.34){x=26;face=-dir;sy=.95;mode='land';}
   else if(u<9.84){face=-dir;hop(9.34,26,0,.5);}
   else if(u<11.3){face=-dir;sy=1-.012*(.5+.5*Math.sin(u*3));}
   else{sy=1-.01*(.5+.5*Math.sin(u*3));}
  }else{
   const flightCycle=Math.floor(t/10.9)%2===1;
   let wingOpen=0;
   if(u<1.2){mode='rest';}
   else if(u<4.2){x=30*ease((u-1.2)/3);mode='crawl';}
   else if(u<5.2){x=30;mode='pause';}
   else if(u<6.2){x=30;face=-dir;mode=flightCycle&&u>=5.45?'unfold':'turn';if(mode==='unfold')wingOpen=ease(clamp((u-5.45)/.75,0,1));}
   else if(u<9.2){const q=clamp((u-6.2)/3,0,1);x=30*(1-ease(q));face=-dir;mode=flightCycle?'fly':'crawl';
    if(flightCycle){wingOpen=1;lift=235*Math.pow(Math.sin(Math.PI*q),1.3)*(1+.035*Math.sin(q*Math.PI*6));}
   }
   else if(u<10.2){face=-dir;mode=flightCycle&&u<9.85?'fold':'pause';if(mode==='fold')wingOpen=1-ease(clamp((u-9.2)/.65,0,1));}
   if(flightCycle&&mode==='fly'){sx=1;sy=1;}
   if(mode==='crawl'){sy=1+.018*Math.sin(u*34);sx=1+.012*Math.cos(u*34);}
   return {x:x*dir,lift,sx,sy,flip:face===1?1:-1,mode,wingOpen};
  }
  // Original rabbit art faces left; original beetle art faces right.
  return {x:x*dir,lift,sx,sy,flip:face===(rabbit?-1:1)?1:-1,mode};
 }
 // Rabbit decisions use the existing authored local ground route (no unverified cross-scene path).
 function rabbitBrain(seed=0,golden=false){
  return {q:0,face:-1,mode:'sniff',age:0,duration:1.4,from:0,to:0,hunger:.48,energy:.85,alert:.25,comfort:1,serial:Math.floor(seed*997),golden};
 }
 function rabbitDecision(b,env={}){
  const kind=env.kind||'clear',rain=env.rain||0,snow=env.snowCover||0;
  const dangerous=kind==='storm'||kind==='blizzard',wet=dangerous||kind==='rain'||rain>.65;
  if(wet)return b.q<.98?{mode:'shelter-hop',to:1}:{mode:'shelter',duration:3.8};
  if(b.mode==='shelter'&&b.q>.02)return {mode:'hop',to:0};
  if(b.energy<.35)return {mode:'rest',duration:4.5};
  if(b.alert>.6)return {mode:'alert',duration:2.1};
  if(b.hunger>.52&&snow<.15&&kind!=='snow')return {mode:'graze',duration:3.1};
  const roll=((Math.imul(++b.serial,1664525)+1013904223)>>>0)/4294967296;
  if(roll<.37)return {mode:'hop',to:b.q>.5?0:1};
  if(roll<.58)return {mode:'sniff',duration:1.8};
  if(roll<.76)return {mode:'groom',duration:2.7};
  return {mode:'rest',duration:2.4+(b.golden?.8:0)};
 }
 function rabbitTick(b,dt,env={}){
  dt=clamp(dt,0,.12);const bad=env.kind==='storm'||env.kind==='blizzard'||env.kind==='rain';
  b.hunger=clamp(b.hunger+dt*(b.mode==='graze'?-.11:.014),0,1);
  b.energy=clamp(b.energy+dt*(b.mode==='rest'||b.mode==='shelter'?.09:b.mode.includes('hop')?-.045:-.008),0,1);
  b.alert=clamp(b.alert+dt*(bad?.16:-.12),0,1);
  b.comfort=clamp(b.comfort+dt*(bad&&b.mode!=='shelter'?-.08:.05),0,1);
  b.age+=dt;
  const moving=b.mode==='hop'||b.mode==='shelter-hop';
  // Finish a hop before responding to weather; never teleport on a weather change.
  if(b.age>=b.duration||(bad&&!moving&&b.mode!=='shelter')){
   if(moving)b.q=b.to;
   const next=rabbitDecision(b,env);b.mode=next.mode;b.age=0;b.from=b.q;b.to=next.to??b.q;
   b.duration=next.duration??(b.golden?.65:.58)*Math.max(1,Math.ceil(Math.abs(b.to-b.from)*3));
   if(b.to!==b.from)b.face=b.to>b.from?-1:1;
  }
  let lift=0,sx=1,sy=1,mode=b.mode;
  if(mode==='hop'||mode==='shelter-hop'){
   const q=clamp(b.age/b.duration,0,1),n=Math.max(1,Math.ceil(Math.abs(b.to-b.from)*3)),step=q*n,k=Math.min(n-1,Math.floor(step)),f=clamp(step-k,0,1);
   b.q=b.from+(b.to-b.from)*(k+ease(f))/n;lift=17*Math.sin(Math.PI*f);
   sx=1+.045*Math.sin(Math.PI*f);sy=1-.055*Math.sin(Math.PI*f);mode='hop';
  }else if(mode==='shelter'||mode==='rest'){sy=1-.026*(.5+.5*Math.sin(b.age*2));}
  else if(mode==='graze'){sy=1-.025*(.5+.5*Math.sin(b.age*3));}
  return {x:-54*b.q,lift,sx,sy,flip:b.face===-1?1:-1,mode,behavior:b.mode};
 }
 function attachWildlife(node,o){
  const kind=String(o.assetId||'').replace(/^forest4_/,'');
  if(kind==='bird'){
   if(!window.DungeonBirdMotion)return;
   const anchor={id:o.id,x:o.x,y:o.y,width:o.width,z:o.z};
   node.dataset.birdMotion='true';
   for(const [key,value] of Object.entries({x:o.x+'%',y:o.y+'%',width:o.width+'%',z:String(10+o.z)})){
    node.style.setProperty('--bird-anchor-'+key,value);node.style.setProperty('--bird-'+key,value);
   }
   wildlife.set(node,{kind,anchor,phase:1.8,start:null});
   window.DungeonBirdMotion.attach(node);
   return;
  }
  if(kind!=='rabbit'&&kind!=='beetle')return;
  const dir=kind==='rabbit'?-1:(o.x>75?-1:1);
  const hash=Array.from(String(o.id||kind)).reduce((n,ch)=>(n*31+ch.charCodeAt(0))%997,0);
  const phase=kind==='beetle'?15.0+(hash%100)/200:hash/100;
  node.dataset.wildlife=kind;
  const anchor={id:o.id,x:o.x,y:o.y,width:o.width,z:o.z,artAspect:kind==='rabbit'?114/121:145/89};
  node.style.setProperty('--wild-anchor-x',o.x+'%');
  node.style.setProperty('--wild-anchor-y',o.y+'%');
  node.style.setProperty('--wild-anchor-width',o.width+'%');
  wildlife.set(node,{kind,dir,phase,start:null,anchor,brain:kind==='rabbit'?rabbitBrain(hash/997,node.dataset.rabbitVariant==='golden'):null,lastTick:null});
  if(kind==='rabbit')window.DungeonRabbitArticulation?.attach(node);
  else if(kind==='beetle')window.DungeonBeetleArticulation?.attach(node);
 }
 function tickWildlife(ms,active,weatherKind='clear'){
  if(!active){for(const [node] of wildlife)if(!node.isConnected)wildlife.delete(node);return;}
  for(const [node,a] of wildlife){
   if(!node.isConnected){wildlife.delete(node);continue;}
   if(a.start===null)a.start=ms;
   const elapsed=(ms-a.start)/1000+a.phase;
   if(a.kind==='bird'){
    const v=window.DungeonBirdMotion.sample(a.anchor,elapsed);
    try{window.DungeonBirdMotion.render(node,v,elapsed,ms);}catch(err){node.removeAttribute('data-bird-rig');}
    node.style.setProperty('--bird-x',v.x.toFixed(3)+'%');
    node.style.setProperty('--bird-y',v.visibleY.toFixed(3)+'%');
    node.style.setProperty('--bird-width',v.width.toFixed(3)+'%');
    node.style.setProperty('--bird-z',String(10+v.z));
    node.style.setProperty('--bird-face',String(v.face));
    node.style.setProperty('--bird-shadow',v.shadow.toFixed(3));
    node.style.setProperty('--bird-shadow-offset',(100*v.h/(v.width*(16/9)/(119/95))).toFixed(2)+'%');
    node.dataset.birdState=v.mode;
    continue;
   }
   const dt=a.lastTick===null?0:(ms-a.lastTick)/1000;a.lastTick=ms;
   const env=a.brain?{...window.DungeonWeatherV1?.environment?.(),kind:weatherKind}:null;
   const v=a.brain?rabbitTick(a.brain,dt,env):wildlifeSample(a.kind,elapsed,a.dir);
   if(a.brain)node.dataset.wildBehavior=v.behavior;
   try{
    if(a.kind==='rabbit')window.DungeonRabbitArticulation?.render(node,v,elapsed,ms);
    else if(a.kind==='beetle')window.DungeonBeetleArticulation?.render(node,v,elapsed,ms);
   }catch(err){node.removeAttribute(a.kind==='rabbit'?'data-rabbit-rig':'data-beetle-rig');}
   const spatial=window.DungeonSpatialMotion?.sample(a.anchor,v,a.kind);
   if(spatial){
    node.dataset.spatialMotion='true';
    node.style.setProperty('--wild-world-x',spatial.x.toFixed(3)+'%');
    node.style.setProperty('--wild-world-y',spatial.y.toFixed(3)+'%');
    node.style.setProperty('--wild-world-width',spatial.width.toFixed(3)+'%');
    node.style.setProperty('--wild-world-z',String(10+spatial.z));
    node.style.setProperty('--wild-shadow',spatial.shadow.toFixed(3));
   }
   node.style.setProperty('--wild-x',(spatial?0:v.x).toFixed(2)+'%');
   node.style.setProperty('--wild-lift',(-(spatial?spatial.lift:v.lift)).toFixed(2)+'%');
   node.style.setProperty('--wild-sx',(v.flip*v.sx).toFixed(3));
   node.style.setProperty('--wild-sy',v.sy.toFixed(3));
   if(node.dataset.wildState!==v.mode)node.dataset.wildState=v.mode;
  }
 }
 return {profiles,draw,objectProfile,apply,attachWildlife,tickWildlife,wildlifeSample,waterProfile,rabbitBrain,rabbitTick,rabbitDecision};
})();
