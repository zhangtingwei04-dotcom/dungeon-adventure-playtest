/* Regional weather V3. Deterministic game-time simulation, independent of device clock. */
window.DungeonWeatherV1=(function(){
 const kinds={
 clear:{name:'晴朗',icon:'☀',shade:0,fog:0,rain:0,wind:.15},
 cloudy:{name:'陰天',icon:'☁',shade:.20,fog:.035,rain:0,wind:.35,overcast:1},
 drizzle:{name:'細雨',icon:'☂',shade:.16,fog:.055,rain:.32,wind:.35},
 rain:{name:'降雨',icon:'☂',shade:.25,fog:.095,rain:.82,wind:.65},
 storm:{name:'雷雨',icon:'ϟ',shade:.31,fog:.12,rain:1,wind:.95},
 snow:{name:'降雪',icon:'❄',shade:.12,fog:.17,rain:0,wind:.38,snow:.78,snowSpeed:1,snowDrift:12},
 blizzard:{name:'暴風雪',icon:'❄',shade:.16,fog:.28,rain:0,wind:1,snow:1,snowSpeed:4.2,snowDrift:145},
 fog:{name:'薄霧',icon:'≋',shade:.06,fog:.31,rain:0,wind:.08},
 };
 const next={clear:[['clear',.50],['cloudy',.35],['fog',.15]],cloudy:[['clear',.23],['cloudy',.35],['drizzle',.27],['fog',.15]],drizzle:[['cloudy',.30],['drizzle',.40],['rain',.30]],rain:[['rain',.31],['drizzle',.43],['cloudy',.15],['storm',.11]],storm:[['rain',.65],['drizzle',.25],['storm',.10]],fog:[['fog',.24],['cloudy',.41],['clear',.35]]};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function hash(seed,n){let h=2166136261;for(const ch of String(seed)+':'+n){h=Math.imul(h^ch.charCodeAt(0),16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return(h>>>0)/4294967296;}
 const windNames=['無風','微風','輕風','強風','烈風','暴風'];
 const windRanges={clear:[0,.6],cloudy:[0,.6],fog:[0,.2],drizzle:[0,.4],rain:[.2,.8],storm:[.4,1],snow:[0,.6],blizzard:[.8,1]};
 function windLevel(w){return Math.round(clamp(w||0,0,1)*5);}
 function windLabel(w,dir){const n=windLevel(w);return windNames[n]+(n===0?'':dir<-.15?' ←':dir>.15?' →':' · 轉向');}
 function windAt(seed,minutes,kind){
  const t=Math.max(0,Number(minutes)||0)/60,i=Math.floor(t),q=t-i,e=q*q*(3-2*q),range=windRanges[kind]||windRanges.clear;
  const mix=(a,b)=>a+(b-a)*e;
  const strength=mix(hash(seed,'wind:'+i),hash(seed,'wind:'+(i+1)));
  // Direction is a signed screen-space component, smoothly crossing zero.
  const d=hash(seed,'direction:'+Math.floor(t/4)),next=hash(seed,'direction:'+(Math.floor(t/4)+1)),f=t/4-Math.floor(t/4),s=f*f*(3-2*f);
  return {wind:range[0]+(range[1]-range[0])*strength,windDir:clamp((d+(next-d)*s-.5)*3,-1,1)};
 }
 // Strong wind uses a nonlinear visual response; calm and light breeze stay restrained.
 function windVisual(w,dir=1){
  w=clamp(w||0,0,1);const strength=Math.pow(w,1.55);
  return {angle:(3*w+32*strength)*dir,duration:7.4-5.95*Math.pow(w,.9),strength,lean:strength*.22};
 }
 function gustAt(base,t){
  base=clamp(base||0,0,1);if(base<.025)return 0;
  const pulse=Math.pow(Math.max(0,Math.sin(t*.57+Math.sin(t*.17))),4);
  return clamp(base+(Math.sin(t*1.11)*.045+pulse*.32)*base,0,1);
 }
 const seasons=[{name:'春季',temp:19,wet:1.2},{name:'夏季',temp:28,wet:1.3},{name:'秋季',temp:18,wet:.78},{name:'冬季',temp:9,wet:.7}];
 function season(minutes){const day=Math.floor(Math.max(0,Number(minutes)||0)/1440);return {...seasons[Math.floor(day/30)%4],day:day%30+1};}
 function climate(seed,minutes,kind){
  const s=season(minutes),hour=(minutes%1440)/60;
  const cold=s.name==='冬季'?Math.max(0,(hash(seed,Math.floor(minutes/1440))-.55)*19):0;
  const temp=Math.round(s.temp-cold+5*Math.cos((hour-14)*Math.PI/12)+(kind==='clear'?1:kind==='storm'?-4:kind==='rain'?-3:kind==='fog'?-2:kind==='snow'?-3:kind==='blizzard'?-5:0));
  return {season:s.name,seasonDay:s.day,temperature:temp};
 }
 const histories=new Map(),environmentHistory=new WeakMap();
 function snowStep(cover,kind,temp,minutes){
  const hours=Math.max(0,minutes)/60;
  const delta=kind==='blizzard'?hours/3:kind==='snow'?hours/6:-hours*(temp<=0?0:temp<=5?.045:temp<=12?.105:.19);
  return clamp(cover+delta,0,1);
 }
 // Water accumulates cold independently of ground frost.
 function waterFreezeStep(previous,temp,minutes,kind='clear'){
  const h=Math.max(0,minutes)/60,cold=clamp(-temp/8,0,1.7),warm=Math.max(0,temp);
  const change=(old,rate,thaw,threshold=0)=>clamp((old||0)+h*(temp<0?Math.max(0,cold-threshold)*rate:-warm*thaw),0,1);
  const poolIce=change(previous.poolIce,.27,.065),edgeIce=change(previous.edgeIce,.16,.045,.05),flowIce=change(previous.flowIce,.075,.055,.40);
  const snowRate=kind==='blizzard'?.36:kind==='snow'?.18:0;
  const iceSnow=clamp((previous.iceSnow||0)+h*(temp<0&&poolIce>.35?snowRate*poolIce:-warm*.08),0,poolIce);
  return {poolIce,edgeIce,flowIce,iceSnow};
 }
 function waterIceLabel(env={}){
  const p=env.poolIce||0,e=env.edgeIce||0,f=env.flowIce||0;
  return f>=.65&&p>=.85?'深度凍結':p>=.55||e>=.5?'局部凍結':p>=.15||e>=.12?'薄冰':Math.max(p,e)>.025?'初霜':'流動';
 }
 // Independent surface states; all transitions use elapsed game time.
 function environmentStep(previous,kind,temp,minutes){
  const h=Math.max(0,minutes)/60,k=kinds[kind]||kinds.clear;
  const snowCover=snowStep(previous.snowCover||0,kind,temp,minutes);
  const melt=Math.max(0,(previous.snowCover||0)-snowCover);
  const rain=k.rain||0, dry=kind==='clear'?.19:kind==='cloudy'?.065:kind==='fog'?.025:.045;
  const warmth=clamp((temp+5)/20,.18,1.5),evap=dry*warmth*(.8+k.wind*.45);
  const soil=clamp((previous.soil||0)+h*(rain*.32-evap*.38)+melt*.68,0,1);
  const plantWet=clamp((previous.plantWet||0)+h*(rain*.56+(kind==='fog'?.075:0)-evap*.84)+melt*.32,0,1);
  const puddles=clamp((previous.puddles||0)+h*(rain*.30*(.35+.65*soil)-evap*.72-.025)+melt*.63,0,1);
  const frost=clamp((previous.frost||0)+h*(temp<=0?.14*(.35+.65*plantWet)+(k.snow||0)*.08:-(.055+temp*.018)),0,1);
  return {snowCover,soil,plantWet,puddles,frost,wet:clamp(soil*.7+puddles*.3,0,1),...waterFreezeStep(previous,temp,minutes,kind)};
 }
 const emptyEnvironment=()=>({snowCover:0,soil:0,plantWet:0,puddles:0,frost:0,wet:0,poolIce:0,edgeIce:0,flowIce:0,iceSnow:0});
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
  const kind=actual(index);
  let states=environmentHistory.get(history);if(!states){states=[emptyEnvironment()];environmentHistory.set(history,states);}
  for(let j=states.length-1;j<index;j++){const k=actual(j);states.push(environmentStep(states[j],k,climate(seed,j*180+90,k).temperature,180));}
  const elapsed=clamp((Number(minutes)||0)-index*180,0,180);
  const env=environmentStep(states[index],kind,climate(seed,index*180+90,kind).temperature,elapsed);
  return {kind,...kinds[kind],snow:kinds[kind].snow||0,...climate(seed,minutes,kind),...env,...windAt(key,minutes,kind),block};
 }
 let canvas=null,ctx=null,shown={shade:0,fog:0,rain:0,wind:0,wet:0,snow:0,snowCover:0,overcast:0,snowSpeed:0,snowDrift:0,soil:0,plantWet:0,puddles:0,frost:0,poolIce:0,edgeIce:0,flowIce:0,iceSnow:0,windDir:1},target=kinds.clear,last=0,hidden=true,reduced=false;
 const W=640,H=360,particles=Array.from({length:102},(_,i)=>({x:hash('x',i)*W,y:hash('y',i)*H,speed:150+hash('s',i)*190,len:7+hash('l',i)*11}));
 const snowParticles=Array.from({length:170},(_,i)=>({x:hash('snow-x',i)*W,y:hash('snow-y',i)*H}));
 const windDebris=Array.from({length:24},(_,i)=>({x:hash('wind-x',i)*W,y:H*(.36+hash('wind-y',i)*.59),size:1.4+hash('wind-size',i)*2.6,phase:hash('wind-phase',i)*6.28}));
 function snowVelocity(i,speed,drift){return {x:drift*(.8+(i%7)*.07),y:(13+i%12)*speed};}
 function bind(el){canvas=el;ctx=el?.getContext('2d');if(canvas){canvas.width=W;canvas.height=H;}}
 let scene='wreck',sound=false,audio=null,lastThunder=-1,sceneHost=null,snowPreview=false,weatherPreview=false,previewEnv=emptyEnvironment(),lastEnvironmentLabel=0,plantWindow=null,onPlantWindowChanged=null,windOverride=null,windDirectionOverride=null;
 function unlockAudio(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audio)audio=new AC();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
 function thunder(){if(!sound||!audio||audio.state!=='running')return;try{const rate=audio.sampleRate,buf=audio.createBuffer(1,Math.floor(rate*2.7),rate),d=buf.getChannelData(0);let low=0;for(let i=0;i<d.length;i++){low=.94*low+.06*(Math.random()*2-1);d[i]=low;}const src=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain(),now=audio.currentTime;src.buffer=buf;f.type='lowpass';f.frequency.value=170;g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(.19,now+.24);g.gain.exponentialRampToValueAtTime(.001,now+2.6);src.connect(f);f.connect(g);g.connect(audio.destination);src.start(now);src.stop(now+2.7);}catch{}}
 function set(weather,indoor,reduce=false,options={}){
  scene=options.scene||'wreck';sound=Boolean(options.sound);sceneHost=options.sceneHost||sceneHost;onPlantWindowChanged=options.onPlantWindowChanged||null;windOverride=Number.isFinite(options.windOverride)?clamp(options.windOverride,0,5)/5:null;windDirectionOverride=Number.isFinite(options.windDirectionOverride)?clamp(options.windDirectionOverride,-1,1):null;
  const nextPreview=Boolean(options.snowPreview),nextWeatherPreview=Boolean(options.weatherPreview)||nextPreview;if(nextWeatherPreview&&!weatherPreview){previewEnv=emptyEnvironment();for(const key of Object.keys(previewEnv))previewEnv[key]=clamp(shown[key]||0,0,1);if(nextPreview)previewEnv.snowCover=Math.max(previewEnv.snowCover,options.previewStart??.04);}if(!nextWeatherPreview)previewEnv=emptyEnvironment();snowPreview=nextPreview;weatherPreview=nextWeatherPreview;
  hidden=Boolean(indoor);reduced=reduce;target=hidden?{...kinds.clear,wet:0,snow:0,snowCover:0}:{...weather,wet:weather.wet??weather.rain*.8,snow:weather.snow||0,snowCover:weather.snowCover||0,windDir:weather.windDir??(weatherPreview?-1:1)};
  if(canvas)canvas.hidden=hidden;
  if(hidden&&ctx)ctx.clearRect(0,0,W,H);if(hidden&&sceneHost){for(const key of ['snow-cover','plant-wet','frost','soil-wet','puddle-level'])sceneHost.style.setProperty('--'+key,'0');}
 }
 function draw(ms){
  if(!ctx||hidden)return;
  const dt=last?clamp((ms-last)/1000,0,.1):.05;last=ms;
  if(weatherPreview){previewEnv=environmentStep(previewEnv,target.kind,target.temperature??(snowPreview?-3:12),dt*18);Object.assign(target,previewEnv);}
  for(const k of Object.keys(shown)){
   const value=k==='wind'?gustAt(windOverride??target.wind,ms/1000):k==='windDir'?(windDirectionOverride??target.windDir??1):(target[k]||0);
   shown[k]+=(value-shown[k])*(1-Math.exp(-dt*(k==='windDir'?1.25:3)));
  }
  const spawnWeather={kind:target.kind,snowCover:weatherPreview?shown.snowCover:target.snowCover};
  const wildlifeWeather={kind:target.kind,snowCover:Math.max(shown.snowCover,spawnWeather.snowCover||0),wind:windOverride??target.wind??0};
  const allowed=[plantSpawnAllowed(spawnWeather),...['rabbit','bird','beetle','butterfly'].map(k=>activity(k,wildlifeWeather))].join(':');
  if(plantWindow!==allowed){const before=plantWindow;plantWindow=allowed;if(before!==null)onPlantWindowChanged?.();}
  ctx.clearRect(0,0,W,H);
  if(shown.shade>.003){ctx.fillStyle='rgba(38,55,62,'+shown.shade.toFixed(3)+')';ctx.fillRect(0,0,W,H);}
  if(shown.overcast>.003){const a=shown.overcast,g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(130,150,158,'+(a*.15)+')');g.addColorStop(.6,'rgba(107,130,137,'+(a*.075)+')');g.addColorStop(1,'rgba(94,112,115,'+(a*.025)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  if(shown.fog>.003){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(194,209,202,'+(shown.fog*.36)+')');g.addColorStop(.35,'rgba(190,207,201,'+(shown.fog*.82)+')');g.addColorStop(.68,'rgba(185,203,198,'+(shown.fog*.56)+')');g.addColorStop(1,'rgba(181,200,193,'+(shown.fog*.13)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  // Ground glints are deliberately restricted to the lower foreground, no opaque puddles.
  if(shown.soil>.12){ctx.fillStyle='rgba(68,83,83,'+(shown.soil*.075)+')';ctx.fillRect(0,H*.72,W,H*.28);}
  if(sceneHost){
   const vars={'snow-cover':shown.snowCover,'plant-wet':shown.plantWet,'frost':shown.frost,'soil-wet':shown.soil,'puddle-level':shown.puddles};
   for(const [key,value] of Object.entries(vars))sceneHost.style.setProperty('--'+key,clamp(value,0,1).toFixed(3));
   const windMotion=windVisual(shown.wind,shown.windDir);
   sceneHost.style.setProperty('--weather-wind-angle',windMotion.angle.toFixed(2)+'deg');
   sceneHost.style.setProperty('--weather-wind-duration',windMotion.duration.toFixed(2)+'s');
   sceneHost.style.setProperty('--weather-wind-lean',windMotion.lean.toFixed(3));
   sceneHost.style.setProperty('--weather-wind',shown.wind.toFixed(3));
   if(ms-lastEnvironmentLabel>=350||ms<lastEnvironmentLabel){
    lastEnvironmentLabel=ms;
    const label=sceneHost.querySelector?.('.location-weather-info[data-weather-prefix]');
    if(label){const state=shown.snowCover>.85?'厚雪':shown.snowCover>.15?'薄雪':shown.puddles>.25?'積水':shown.soil>.15?'濕潤':shown.frost>.15?'覆霜':'偏乾';const next=label.dataset.weatherPrefix+state+' · '+windLabel(shown.wind,shown.windDir)+(label.dataset.waterStatus==='true'?' · 水域'+waterIceLabel(shown):'');if(label.textContent!==next)label.textContent=next;}
   }
  }
  // A few moving leaves or drifting loose snow show wind even without falling rain/snow.
  if(!reduced&&shown.wind>.30&&Math.abs(shown.windDir)>.08){
   const t=ms/1000,strong=clamp((shown.wind-.30)/.70,0,1),count=Math.ceil(24*strong),pow=windVisual(shown.wind).strength;
   const snowy=shown.snowCover>.18||shown.snow>.15;
   ctx.save();ctx.lineCap='round';
   for(let i=0;i<count;i++){
    const p=windDebris[i],vx=(35+210*pow)*(0.65+(i%5)*.12)*shown.windDir;
    p.x+=vx*dt;p.y+=Math.sin(t*2.4+p.phase)*dt*(3+pow*20);
    const left=-12,right=W+12;if(p.x<left||p.x>right){p.x=p.x<left?right:left;p.y=H*(.36+hash('wind-reset:'+i,Math.floor(t*3))*.59);}
    const q=Math.sin(t*(4+pow*3)+p.phase);
    if(snowy){ctx.strokeStyle='rgba(230,241,244,'+(.13+strong*.24)+')';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-shown.windDir*(3+pow*8),p.y+q*1.4);ctx.stroke();}
    else if(shown.rain<.45){ctx.fillStyle=i%3===0?'rgba(148,151,92,'+(.26+strong*.3)+')':'rgba(100,116,68,'+(.26+strong*.3)+')';ctx.beginPath();ctx.ellipse(p.x,p.y,p.size*(.45+.55*Math.abs(q)),.75,q*1.8,0,Math.PI*2);ctx.fill();}
   }ctx.restore();
  }
  if(shown.snow>.01&&!reduced){
   const t=ms/1000,storm=clamp((shown.snowSpeed-1)/3.2,0,1);
   const amount=Math.min(snowParticles.length,Math.ceil((75+85*storm)*shown.snow));
   ctx.fillStyle='rgba(235,244,246,'+(.42+shown.snow*.22)+')';ctx.beginPath();
   for(let i=0;i<amount;i++){const p=snowParticles[i],v=snowVelocity(i,shown.snowSpeed,(40*shown.wind+235*Math.pow(shown.wind,1.5))*shown.windDir);
    p.x=((p.x+(v.x+Math.sin(t*1.4+i)*(2+18*shown.wind))*dt)%W+W)%W;p.y=(p.y+v.y*dt)%H;
    const r=.55+(i%4)*.24;if(shown.wind>.55&&i%3===0){const dx=shown.windDir*(2+shown.wind*4),dy=1+storm*1.8;ctx.moveTo(p.x-r,p.y-r);ctx.lineTo(p.x+dx,p.y+dy);ctx.lineTo(p.x+r,p.y+r);ctx.closePath();}else{ctx.moveTo(p.x+r,p.y);ctx.arc(p.x,p.y,r,0,Math.PI*2);}
   }ctx.fill();
  }
  if(target.rain>=.99){const clock=ms/1000,cycle=clock%17.7,flash=Math.max(0,1-Math.abs(cycle-5.1)/.24);
   if(flash>0&&!reduced){ctx.fillStyle='rgba(224,234,241,'+(flash*.12)+')';ctx.fillRect(0,0,W,H);}
   const id=Math.floor(clock/17.7);if(cycle>=6.2&&cycle<7.2&&id!==lastThunder){lastThunder=id;thunder();}
  }
  if(shown.rain>.008&&!reduced){
   const t=ms/1000,amount=Math.min(particles.length,Math.ceil(particles.length*shown.rain));
   ctx.lineCap='round';ctx.lineWidth=.75;ctx.strokeStyle='rgba(209,228,239,'+(.26+shown.rain*.16)+')';ctx.beginPath();
   for(let i=0;i<amount;i++){const p=particles[i];p.x=((p.x+dt*(25*shown.wind+155*Math.pow(shown.wind,1.5))*shown.windDir)%(W+40)+W+40)%(W+40);p.y=(p.y+dt*p.speed)%(H+24);const x=p.x-20,y=p.y-12;ctx.moveTo(x,y);ctx.lineTo(x+(shown.wind*3+Math.pow(shown.wind,1.5)*11)*shown.windDir,y+p.len);}
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
 function drawGround(g,t,width,height,enabled=true,source=null){
  if(hidden||scene!=='wreck'||!enabled||!g)return;
  window.DungeonWinterV1?.ground(g,shown.snowCover,width,height,source,shown.frost);
  const amount=shown.puddles*(1-shown.snowCover*.85);if(amount<.035)return;
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
   const stress=old.indoor?0:Math.max(0,12-weather.temperature)*.035*(1+weather.wind*.7)+Math.max(0,weather.temperature-30)*.025+value*.0014;
   comfort=clamp(comfort+(stress>0?-stress:.22)*dt,0,100);start=end;
  }
  return s.weatherExposure={minute:now,wetness:value,comfort,indoor:Boolean(indoor)};
 }
 // Existing fixed scenery is not subject to spawning rules. Future species may opt into snow.
 function plantSpawnAllowed(weather,plant={}){
  const kind=typeof weather==='string'?weather:weather?.kind;
  const cover=typeof weather==='object'?(weather?.snowCover||0):0;
  const winter=kind==='snow'||kind==='blizzard'||cover>=.15;
  if(Array.isArray(plant.allowedWeather)&&!plant.allowedWeather.includes(kind))return false;
  return !winter||plant.winterHardy===true;
 }
 // Gameplay thresholds use sustained wind, never momentary visual gusts.
 function wildlifeWindMode(kind,wind=0){
  const level=windLevel(wind);
  if(kind==='rabbit')return level>=5?'hide':level>=4?'shelter':level>=3?'alert':'normal';
  if(kind==='bird')return level>=4?'hide':level>=3?'perch':'normal';
  if(kind==='beetle')return level>=5?'hide':level>=3?'ground':'normal';
  if(kind==='butterfly')return level>=3?'hide':level>=2?'shelter':'normal';
  return 'normal';
 }
 function activity(kind,weather){
  const type=typeof weather==='string'?weather:weather?.kind,cover=typeof weather==='object'?(weather?.snowCover||0):0;
  const wind=typeof weather==='object'?(weather?.wind||0):0;
  if(kind==='rabbit'&&(type==='snow'||type==='blizzard'||cover>=.15))return false;
  if(type==='storm'||type==='blizzard'||type==='snow')return false;
  const mode=wildlifeWindMode(kind,wind);if(mode==='hide'||(kind==='butterfly'&&mode==='shelter'))return false;
  if(type==='rain')return kind==='beetle'||kind==='rabbit';
  if(type==='drizzle')return kind!=='butterfly';return true;
 }
 return {kinds,at,bind,set,draw,drawGround,puddleLevel,season,climate,exposure,activity,wildlifeWindMode,unlockAudio,snowVelocity,snowStep,environmentStep,plantSpawnAllowed,windAt,windLevel,windLabel,gustAt,windVisual,waterFreezeStep,waterIceLabel,environment:()=>({...shown,behaviorWind:windOverride??target.wind??0})};
})();