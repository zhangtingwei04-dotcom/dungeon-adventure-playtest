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
 function draw(ctx,id,t,w=960,h=540,period='day',source=null){
  const p=profiles[id];if(!p||!Number.isFinite(t))return;
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
   const [dx,dy,dw,dh]=p.cascade||[826,140,66,96],delta=2+frac(t*.65)*8;
   ctx.save();ctx.globalAlpha=.27;
   ctx.drawImage(source,(dx-ox)/fit,(dy-oy)/fit,dw/fit,(dh-delta)/fit,dx,dy+delta,dw,dh-delta);
   ctx.restore();
  }
  // Moving highlights are clipped to the actual cascade, not surrounding rocks.
  ctx.lineCap='round';
  for(let i=0;i<20;i++){
   const [dx,dy,dw,dh]=p.cascade||[826,140,66,96];const x=dx+8+(i*17%(dw-12)),y=dy+2+frac(t*(.72+(i%4)*.12)+i*.173)*(dh-2);
   const len=13+i%4*6;
   const g=ctx.createLinearGradient(x,y,x-1,y+len);
   g.addColorStop(0,'rgba(224,248,255,0)');g.addColorStop(.45,'rgba(220,246,255,.52)');g.addColorStop(1,'rgba(220,246,255,0)');
   ctx.strokeStyle=g;ctx.lineWidth=1.1+(i%3)*.65;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1.6,y+len);ctx.stroke();
  }
  ctx.restore();
  // Subtle spray in the waterfall basin; no opaque white overlay.
  ctx.save();path(ctx,p.waterfall);
  for(let i=0;i<9;i++){const q=frac(t*.92+i*.137),x=838+i*5+Math.sin(t*1.4+i)*5,y=(p.neutral?242:233)-q*15,r=3+q*10;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(213,238,249,'+(.25*(1-q))+')');g.addColorStop(1,'rgba(213,238,249,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.restore();
  // Separate small stream zones avoid painted foreground rocks.
  for(let j=0;j<p.pools.length;j++){ctx.save();path(ctx,p.pools[j]);const poly=p.pools[j],minX=Math.min(...poly.map(v=>v[0])),maxX=Math.max(...poly.map(v=>v[0])),minY=Math.min(...poly.map(v=>v[1])),maxY=Math.max(...poly.map(v=>v[1]));for(let i=0;i<8;i++){const q=frac(t*(.30+i*.025)+i*.31+j*.12),x=minX+q*(maxX-minX),y=minY+((i*.37)%1)*(maxY-minY);const alpha=.38*Math.sin(Math.PI*q);ctx.strokeStyle='rgba(205,240,250,'+alpha+')';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+4,y-.8,x+13+i%3*4,y);ctx.stroke();}ctx.restore();}
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
   if(u<1.2){mode='rest';}
   else if(u<4.2){x=30*ease((u-1.2)/3);mode='crawl';}
   else if(u<5.2){x=30;mode='pause';}
   else if(u<6.2){x=30;face=-dir;mode='turn';}
   else if(u<9.2){x=30*(1-ease((u-6.2)/3));face=-dir;mode='crawl';}
   else if(u<10.2){face=-dir;mode='pause';}
   if(mode==='crawl'){sy=1+.018*Math.sin(u*34);sx=1+.012*Math.cos(u*34);}
  }
  // Original rabbit art faces left; original beetle art faces right.
  return {x:x*dir,lift,sx,sy,flip:face===(rabbit?-1:1)?1:-1,mode};
 }
 function attachWildlife(node,o){
  const kind=String(o.assetId||'').replace(/^forest4_/,'');
  if(kind!=='rabbit'&&kind!=='beetle')return;
  const dir=kind==='rabbit'?-1:(o.x>75?-1:1);
  const hash=Array.from(String(o.id||kind)).reduce((n,ch)=>(n*31+ch.charCodeAt(0))%997,0);
  node.dataset.wildlife=kind;
  wildlife.set(node,{kind,dir,phase:hash/100,start:null});
  if(kind==='rabbit')window.DungeonRabbitArticulation?.attach(node);
  else if(kind==='beetle')window.DungeonBeetleArticulation?.attach(node);
 }
 function tickWildlife(ms,active){
  if(!active){for(const [node] of wildlife)if(!node.isConnected)wildlife.delete(node);return;}
  for(const [node,a] of wildlife){
   if(!node.isConnected){wildlife.delete(node);continue;}
   if(a.start===null)a.start=ms;
   const elapsed=(ms-a.start)/1000+a.phase;
   const v=wildlifeSample(a.kind,elapsed,a.dir);
   if(a.kind==='rabbit')window.DungeonRabbitArticulation?.render(node,v,elapsed,ms);
   else if(a.kind==='beetle')window.DungeonBeetleArticulation?.render(node,v,elapsed,ms);
   node.style.setProperty('--wild-x',v.x.toFixed(2)+'%');
   node.style.setProperty('--wild-lift',(-v.lift).toFixed(2)+'%');
   node.style.setProperty('--wild-sx',(v.flip*v.sx).toFixed(3));
   node.style.setProperty('--wild-sy',v.sy.toFixed(3));
   if(node.dataset.wildState!==v.mode)node.dataset.wildState=v.mode;
  }
 }
 return {profiles,draw,objectProfile,apply,attachWildlife,tickWildlife,wildlifeSample};
})();
