/* Regional weather V2. Deterministic game-time simulation, independent of device clock. */
window.DungeonWeatherV1=(function(){
 const kinds={
 clear:{name:'晴朗',icon:'☀',shade:0,fog:0,rain:0,wind:.15},
 cloudy:{name:'陰天',icon:'☁',shade:.15,fog:.025,rain:0,wind:.35},
 drizzle:{name:'細雨',icon:'☂',shade:.16,fog:.055,rain:.32,wind:.35},
 rain:{name:'降雨',icon:'☂',shade:.25,fog:.095,rain:.82,wind:.65},
 storm:{name:'雷雨',icon:'ϟ',shade:.31,fog:.12,rain:1,wind:.95},
 fog:{name:'薄霧',icon:'≋',shade:.06,fog:.31,rain:0,wind:.08},
 };
 const next={clear:[['clear',.50],['cloudy',.35],['fog',.15]],cloudy:[['clear',.23],['cloudy',.35],['drizzle',.27],['fog',.15]],drizzle:[['cloudy',.30],['drizzle',.40],['rain',.30]],rain:[['rain',.31],['drizzle',.43],['cloudy',.15],['storm',.11]],storm:[['rain',.65],['drizzle',.25],['storm',.10]],fog:[['fog',.24],['cloudy',.41],['clear',.35]]};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function hash(seed,n){let h=2166136261;for(const ch of String(seed)+':'+n){h=Math.imul(h^ch.charCodeAt(0),16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return(h>>>0)/4294967296;}
 const seasons=[{name:'春季',temp:19,wet:1.2},{name:'夏季',temp:28,wet:1.3},{name:'秋季',temp:18,wet:.78},{name:'冬季',temp:9,wet:.7}];
 function season(minutes){const day=Math.floor(Math.max(0,Number(minutes)||0)/1440);return {...seasons[Math.floor(day/30)%4],day:day%30+1};}
 function climate(seed,minutes,kind){
  const s=season(minutes),hour=(minutes%1440)/60;
  const temp=Math.round(s.temp+5*Math.cos((hour-14)*Math.PI/12)+(kind==='clear'?1:kind==='storm'?-4:kind==='rain'?-3:kind==='fog'?-2:0));
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
  const kind=history[index];let wet=0;
  for(let j=Math.max(0,index-5);j<=index;j++){const r=kinds[history[j]].rain;wet=clamp(wet*.57+r*.55,0,1);}
  return {kind,...kinds[kind],...climate(seed,minutes,kind),wet,block};
 }
 let canvas=null,ctx=null,shown={shade:0,fog:0,rain:0,wind:0,wet:0},target=kinds.clear,last=0,hidden=true,reduced=false;
 const W=640,H=360,particles=Array.from({length:102},(_,i)=>({x:hash('x',i)*W,y:hash('y',i)*H,speed:150+hash('s',i)*190,len:7+hash('l',i)*11}));
 function bind(el){canvas=el;ctx=el?.getContext('2d');if(canvas){canvas.width=W;canvas.height=H;}}
 function set(weather,indoor,reduce=false){
  hidden=Boolean(indoor);reduced=reduce;target=hidden?{...kinds.clear,wet:0}:{...weather,wet:weather.wet??weather.rain*.8};
  if(canvas)canvas.hidden=hidden;
  if(hidden&&ctx)ctx.clearRect(0,0,W,H);
 }
 function draw(ms){
  if(!ctx||hidden)return;
  const dt=last?Math.min(.1,(ms-last)/1000):.05;last=ms;
  for(const k of Object.keys(shown))shown[k]+=(target[k]-shown[k])*(1-Math.exp(-dt*3.0));
  ctx.clearRect(0,0,W,H);
  if(shown.shade>.003){ctx.fillStyle='rgba(38,55,62,'+shown.shade.toFixed(3)+')';ctx.fillRect(0,0,W,H);}
  if(shown.fog>.003){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(194,209,202,'+(shown.fog*.36)+')');g.addColorStop(.35,'rgba(190,207,201,'+(shown.fog*.82)+')');g.addColorStop(.68,'rgba(185,203,198,'+(shown.fog*.56)+')');g.addColorStop(1,'rgba(181,200,193,'+(shown.fog*.13)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  // Ground glints are deliberately restricted to the lower foreground, no opaque puddles.
  if(shown.wet>.12){ctx.fillStyle='rgba(112,143,151,'+(shown.wet*.055)+')';ctx.fillRect(0,H*.72,W,H*.28);}
  if(target===null)return;
  if(target.rain>=.99&&!reduced){const cycle=(ms/1000)%17.7,flash=Math.max(0,1-Math.abs(cycle-5.1)/.24);if(flash>0){ctx.fillStyle='rgba(224,234,241,'+(flash*.12)+')';ctx.fillRect(0,0,W,H);}}
  if(shown.rain>.008&&!reduced){
   const t=ms/1000,amount=Math.ceil(particles.length*shown.rain);
   ctx.lineCap='round';ctx.lineWidth=.75;ctx.strokeStyle='rgba(209,228,239,'+(.26+shown.rain*.16)+')';ctx.beginPath();
   for(let i=0;i<amount;i++){const p=particles[i],y=(p.y+t*p.speed)% (H+24)-12,x=((p.x+t*35*shown.wind)% (W+40))-20;ctx.moveTo(x,y);ctx.lineTo(x+1+shown.wind*3,y+p.len);}
   ctx.stroke();
   // Tiny ground-level splashes; never mask the stream or foreground objects.
   ctx.strokeStyle='rgba(200,220,224,'+(shown.rain*.20)+')';ctx.beginPath();
   for(let i=0;i<12*shown.rain;i++){const q=(t*2.3+hash('splash',i))%1,x=hash('splash-x',i)*W,y=H*(.79+hash('splash-y',i)*.19);ctx.moveTo(x-2*q,y-q);ctx.lineTo(x+2*q,y-q);}
   ctx.stroke();
  }
 }
 function exposure(s,indoor){
  const now=Math.max(0,Math.floor(Number(s.worldMinutes)||0)),old=s.weatherExposure;
  if(!old||!Number.isFinite(old.minute)||old.minute>now){s.weatherExposure={minute:now,wetness:0,indoor:Boolean(indoor)};return s.weatherExposure;}
  let value=clamp(Number(old.wetness)||0,0,100),start=Math.max(old.minute,now-1440*2);
  while(start<now){const end=Math.min(now,(Math.floor(start/180)+1)*180),weather=at(s.seed,start),dt=end-start;
   value=clamp(value+(old.indoor?-.65:weather.rain>.05?weather.rain*.72:-(.12+weather.wind*.18))*dt,0,100);start=end;
  }
  return s.weatherExposure={minute:now,wetness:value,indoor:Boolean(indoor)};
 }
 function activity(kind,weather){if(weather==='storm')return false;if(weather==='rain')return kind==='beetle'||kind==='rabbit';if(weather==='drizzle')return kind!=='butterfly';return true;}
 return {kinds,at,bind,set,draw,season,climate,exposure,activity};
})();