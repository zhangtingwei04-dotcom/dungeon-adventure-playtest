/* Regional weather V3. Deterministic game-time simulation, independent of device clock. */
window.DungeonWeatherV1=(function(){
 const kinds={
 clear:{name:'晴朗',icon:'☀',shade:0,fog:0,rain:0,wind:.15},
 cloudy:{name:'陰天',icon:'☁',shade:.20,fog:.035,rain:0,wind:.35,overcast:1},
 drizzle:{name:'細雨',icon:'☂',shade:.16,fog:.055,rain:.32,wind:.35},
 rain:{name:'降雨',icon:'☂',shade:.25,fog:.095,rain:.82,wind:.65},
 storm:{name:'雷雨',icon:'ϟ',shade:.31,fog:.12,rain:1,wind:.95},
 snow:{name:'降雪',icon:'❄',shade:.12,fog:.17,rain:0,wind:.38,snow:.78,snowSpeed:1,snowDrift:12},
 blizzard:{name:'暴風雪',icon:'❄',shade:.29,fog:.49,rain:0,wind:1,snow:1,snowSpeed:3.6,snowDrift:112},
 fog:{name:'薄霧',icon:'≋',shade:.06,fog:.31,rain:0,wind:.08},
 };
 const next={clear:[['clear',.50],['cloudy',.35],['fog',.15]],cloudy:[['clear',.23],['cloudy',.35],['drizzle',.27],['fog',.15]],drizzle:[['cloudy',.30],['drizzle',.40],['rain',.30]],rain:[['rain',.31],['drizzle',.43],['cloudy',.15],['storm',.11]],storm:[['rain',.65],['drizzle',.25],['storm',.10]],fog:[['fog',.24],['cloudy',.41],['clear',.35]]};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function hash(seed,n){let h=2166136261;for(const ch of String(seed)+':'+n){h=Math.imul(h^ch.charCodeAt(0),16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return(h>>>0)/4294967296;}
 const seasons=[{name:'春季',temp:19,wet:1.2},{name:'夏季',temp:28,wet:1.3},{name:'秋季',temp:18,wet:.78},{name:'冬季',temp:9,wet:.7}];
 function season(minutes){const day=Math.floor(Math.max(0,Number(minutes)||0)/1440);return {...seasons[Math.floor(day/30)%4],day:day%30+1};}
 function climate(seed,minutes,kind){
  const s=season(minutes),hour=(minutes%1440)/60;
  const cold=s.name==='冬季'?Math.max(0,(hash(seed,Math.floor(minutes/1440))-.55)*19):0;
  const temp=Math.round(s.temp-cold+5*Math.cos((hour-14)*Math.PI/12)+(kind==='clear'?1:kind==='storm'?-4:kind==='rain'?-3:kind==='fog'?-2:kind==='snow'?-3:kind==='blizzard'?-5:0));
  return {season:s.name,seasonDay:s.day,temperature:temp};
 }
 const histories=new Map();
 function at(seed,minutes){
  const block=Math.floor(Math.max(0,Number(minutes)||0)/180);
  const key=String(seed??'world');let history=histories.get(key);
  if(!history){history=['clear'];if(histories.size>8)histories.clear();histories.set(key,history);}
  // Normal saves use a modest number of blocks; bound pathological imported dates.
  const index=Math.min(block,80000);
  for(let i=history.length;i<=index;i++){
   let q=hash(key,i),kind=history[i-1],options=next[kind].map(([id,p])=>[id,p*(['rain','drizzle','storm'].includes(id)?season(i*180).wet:1)]);
   q*=options.reduce((sum,o)=>sum+o[1],0);
   for(const [id,p] of options){q-=p;if(q<=0){kind=id;break;}}
   history.push(kind);
  }
  const actual=j=>{const k=history[j];return kinds[k].rain>.05&&season(j*180).name==='冬季'&&climate(seed,j*180+90,k).temperature<=1?(k==='storm'?'blizzard':'snow'):k;};
  const kind=actual(index);let wet=0,snowCover=0;
  for(let j=Math.max(0,index-7);j<=index;j++){const k=actual(j),snowing=k==='snow'||k==='blizzard',temp=climate(seed,j*180+90,k).temperature,previous=snowCover;
   snowCover=clamp(snowCover*(snowing?.96:temp<=0?.97:temp<=5?.80:.48)+(snowing?(k==='blizzard'?.48:.28):0),0,1);
   wet=clamp(wet*.68+kinds[k].rain*.48+Math.max(0,previous-snowCover)*.8,0,1);}
  return {kind,...kinds[kind],snow:kinds[kind].snow||0,...climate(seed,minutes,kind),wet,snowCover,block};
 }
 let canvas=null,ctx=null,shown={shade:0,fog:0,rain:0,wind:0,wet:0,snow:0,snowCover:0,overcast:0,snowSpeed:0,snowDrift:0},target=kinds.clear,last=0,hidden=true,reduced=false;
 const W=640,H=360,particles=Array.from({length:102},(_,i)=>({x:hash('x',i)*W,y:hash('y',i)*H,speed:150+hash('s',i)*190,len:7+hash('l',i)*11}));
 const snowParticles=particles.map(p=>({x:p.x,y:p.y}));
 function snowVelocity(i,speed,drift){return {x:drift*(.8+(i%7)*.07),y:(13+i%12)*speed};}
 function bind(el){canvas=el;ctx=el?.getContext('2d');if(canvas){canvas.width=W;canvas.height=H;}}
 let scene='wreck',sound=false,audio=null,lastThunder=-1,sceneHost=null;
 function unlockAudio(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audio)audio=new AC();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
 function thunder(){if(!sound||!audio||audio.state!=='running')return;try{const rate=audio.sampleRate,buf=audio.createBuffer(1,Math.floor(rate*2.7),rate),d=buf.getChannelData(0);let low=0;for(let i=0;i<d.length;i++){low=.94*low+.06*(Math.random()*2-1);d[i]=low;}const src=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain(),now=audio.currentTime;src.buffer=buf;f.type='lowpass';f.frequency.value=170;g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(.19,now+.24);g.gain.exponentialRampToValueAtTime(.001,now+2.6);src.connect(f);f.connect(g);g.connect(audio.destination);src.start(now);src.stop(now+2.7);}catch{}}
 function set(weather,indoor,reduce=false,options={}){
  scene=options.scene||'wreck';sound=Boolean(options.sound);sceneHost=options.sceneHost||sceneHost;
  hidden=Boolean(indoor);reduced=reduce;target=hidden?{...kinds.clear,wet:0,snow:0,snowCover:0}:{...weather,wet:weather.wet??weather.rain*.8,snow:weather.snow||0,snowCover:weather.snowCover||0};
  if(canvas)canvas.hidden=hidden;
  if(hidden&&ctx)ctx.clearRect(0,0,W,H);if(hidden&&sceneHost)sceneHost.style.setProperty('--snow-cover','0');
 }
 function draw(ms){
  if(!ctx||hidden)return;
  const dt=last?clamp((ms-last)/1000,0,.1):.05;last=ms;
  for(const k of Object.keys(shown))shown[k]+=((target[k]||0)-shown[k])*(1-Math.exp(-dt*3.0));
  ctx.clearRect(0,0,W,H);
  if(shown.shade>.003){ctx.fillStyle='rgba(38,55,62,'+shown.shade.toFixed(3)+')';ctx.fillRect(0,0,W,H);}
  if(shown.overcast>.003){const a=shown.overcast,g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(130,150,158,'+(a*.15)+')');g.addColorStop(.6,'rgba(107,130,137,'+(a*.075)+')');g.addColorStop(1,'rgba(94,112,115,'+(a*.025)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  if(shown.fog>.003){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(194,209,202,'+(shown.fog*.36)+')');g.addColorStop(.35,'rgba(190,207,201,'+(shown.fog*.82)+')');g.addColorStop(.68,'rgba(185,203,198,'+(shown.fog*.56)+')');g.addColorStop(1,'rgba(181,200,193,'+(shown.fog*.13)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  // Ground glints are deliberately restricted to the lower foreground, no opaque puddles.
  if(shown.wet>.12){ctx.fillStyle='rgba(112,143,151,'+(shown.wet*.055)+')';ctx.fillRect(0,H*.72,W,H*.28);}
  if(sceneHost)sceneHost.style.setProperty('--snow-cover',String(clamp(shown.snowCover,0,1)));
  if(shown.snow>.01&&!reduced){
   const t=ms/1000,storm=clamp((shown.snowSpeed-1)/2.6,0,1);
   const amount=Math.min(snowParticles.length,Math.ceil((75+27*storm)*shown.snow));
   ctx.fillStyle='rgba(235,244,246,'+(.42+shown.snow*.22)+')';ctx.beginPath();
   for(let i=0;i<amount;i++){const p=snowParticles[i],v=snowVelocity(i,shown.snowSpeed,shown.snowDrift);
    p.x=((p.x+(v.x+Math.sin(t*1.4+i)*(5+13*storm))*dt)%W+W)%W;p.y=(p.y+v.y*dt)%H;
    const r=.65+(i%4)*.25;ctx.moveTo(p.x+r,p.y);ctx.arc(p.x,p.y,r,0,Math.PI*2);
   }ctx.fill();
  }
  if(target.rain>=.99){const clock=ms/1000,cycle=clock%17.7,flash=Math.max(0,1-Math.abs(cycle-5.1)/.24);
   if(flash>0&&!reduced){ctx.fillStyle='rgba(224,234,241,'+(flash*.12)+')';ctx.fillRect(0,0,W,H);}
   const id=Math.floor(clock/17.7);if(cycle>=6.2&&cycle<7.2&&id!==lastThunder){lastThunder=id;thunder();}
  }
  if(shown.rain>.008&&!reduced){
   const t=ms/1000,amount=Math.min(particles.length,Math.ceil(particles.length*shown.rain));
   ctx.lineCap='round';ctx.lineWidth=.75;ctx.strokeStyle='rgba(209,228,239,'+(.26+shown.rain*.16)+')';ctx.beginPath();
   for(let i=0;i<amount;i++){const p=particles[i],y=(p.y+t*p.speed)% (H+24)-12,x=((p.x+t*35*shown.wind)% (W+40))-20;ctx.moveTo(x,y);ctx.lineTo(x+1+shown.wind*3,y+p.len);}
   ctx.stroke();
   // Tiny ground-level splashes; never mask the stream or foreground objects.
   ctx.strokeStyle='rgba(200,220,224,'+(shown.rain*.20)+')';ctx.beginPath();
   for(let i=0;i<12*shown.rain;i++){const q=(t*2.3+hash('splash',i))%1,x=hash('splash-x',i)*W,y=H*(.79+hash('splash-y',i)*.19);ctx.moveTo(x-2*q,y-q);ctx.lineTo(x+2*q,y-q);}
   ctx.stroke();
  }
 }
 // Draw on the background before DOM props, so water lies on the road.
 // Coordinates calibrated against the approved V5 1280x720 neutral forest.
 const pools=[
  {x:367,y:310,rx:31,ry:7,seed:1},
  {x:393,y:283,rx:24,ry:5.2,seed:2},
  {x:345,y:338,rx:22,ry:5.4,seed:3},
  {x:284,y:233,rx:22,ry:4.2,seed:4}
 ];
 function puddleLevel(wet,rain){return clamp(Math.max((wet-.10)/.65,rain*.62),0,1);}
 function drawGround(g,t,width,height,enabled=true){
  if(hidden||scene!=='wreck'||!enabled||!g)return;
  window.DungeonWinterV1?.ground(g,shown.snowCover,width,height);
  const amount=puddleLevel(shown.wet,shown.rain)*(1-shown.snowCover*.7);if(amount<.035)return;
  g.save();g.scale(width/W,height/H);
  for(const p of pools){
   const {x,y,rx,ry,seed}=p;
   const size=.48+.52*amount,alpha=Math.min(1,amount*1.35);
   const shape=()=>{
    g.beginPath();for(let i=0;i<20;i++){const a=i/20*Math.PI*2,f=.82+.12*Math.sin(i*2.3+seed)+.09*Math.cos(i*1.7+seed);
     const px=x+Math.cos(a)*rx*size*f,py=y+Math.sin(a)*ry*size*f;
     if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}
    g.closePath();
   };
   // Dark wet soil rim and restrained reflections of the cloudy sky.
   shape();g.fillStyle='rgba(47,43,31,'+(alpha*.74)+')';g.fill();g.strokeStyle='rgba(62,53,38,'+(alpha*.65)+')';g.lineWidth=1.5;g.stroke();
   g.save();shape();g.clip();
   const grad=g.createLinearGradient(x,y-ry,x,y+ry);
   grad.addColorStop(0,'rgba(57,79,72,'+(alpha*.88)+')');
   grad.addColorStop(.40,'rgba(119,151,151,'+(alpha*.80)+')');
   grad.addColorStop(.62,'rgba(158,181,179,'+(alpha*.72)+')');
   grad.addColorStop(1,'rgba(74,91,76,'+(alpha*.87)+')');
   g.fillStyle=grad;g.fillRect(x-rx-2,y-ry-2,rx*2+4,ry*2+4);
   g.strokeStyle='rgba(194,217,213,'+(alpha*.54)+')';g.lineWidth=.8;
   g.beginPath();g.moveTo(x-rx*.55*size,y+ry*.38*size);g.quadraticCurveTo(x,y+ry*.64*size,x+rx*.52*size,y+ry*.27*size);g.stroke();
   if(shown.rain>.08&&!reduced){
    for(let j=0;j<3;j++){const q=(t*(.9+j*.19)+seed*.27+j*.32)%1;
     const cx=x+(j-1)*rx*.34*size,cy=y+(j%2-.5)*ry*.55;
     g.beginPath();g.ellipse(cx,cy,.6+q*rx*.42*size,.25+q*ry*.55*size,0,0,Math.PI*2);
     g.strokeStyle='rgba(218,237,232,'+((1-q)*alpha*.68)+')';g.lineWidth=.75;g.stroke();
    }
   }
   g.restore();
  }
  g.restore();
 }
 function exposure(s,indoor){
  const now=Math.max(0,Math.floor(Number(s.worldMinutes)||0)),old=s.weatherExposure;
  if(!old||!Number.isFinite(old.minute)||old.minute>now){s.weatherExposure={minute:now,wetness:0,comfort:100,indoor:Boolean(indoor)};return s.weatherExposure;}
  let value=clamp(Number(old.wetness)||0,0,100),comfort=clamp(Number.isFinite(old.comfort)?old.comfort:100,0,100),start=Math.max(old.minute,now-1440*2);
  while(start<now){const end=Math.min(now,(Math.floor(start/180)+1)*180),weather=at(s.seed,start),dt=end-start;
   value=clamp(value+(old.indoor?-.65:weather.rain>.05?weather.rain*.72:(weather.kind==='snow'||weather.kind==='blizzard')?.16:-(.12+weather.wind*.18))*dt,0,100);
   const stress=old.indoor?0:Math.max(0,12-weather.temperature)*.035+Math.max(0,weather.temperature-30)*.025+value*.0014;
   comfort=clamp(comfort+(stress>0?-stress:.22)*dt,0,100);start=end;
  }
  return s.weatherExposure={minute:now,wetness:value,comfort,indoor:Boolean(indoor)};
 }
 function activity(kind,weather){if(weather==='storm'||weather==='blizzard')return false;if(weather==='snow')return kind==='rabbit';if(weather==='rain')return kind==='beetle'||kind==='rabbit';if(weather==='drizzle')return kind!=='butterfly';return true;}
 return {kinds,at,bind,set,draw,drawGround,puddleLevel,season,climate,exposure,activity,unlockAudio,snowVelocity};
})();