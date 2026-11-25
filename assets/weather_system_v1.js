/* Regional weather V1. Deterministic game-time simulation, independent of device clock. */
window.DungeonWeatherV1=(function(){
 const kinds={
 clear:{name:'晴朗',icon:'☀',shade:0,fog:0,rain:0,wind:.15},
 cloudy:{name:'陰天',icon:'☁',shade:.15,fog:.025,rain:0,wind:.35},
 drizzle:{name:'細雨',icon:'☂',shade:.16,fog:.055,rain:.32,wind:.35},
 rain:{name:'降雨',icon:'☂',shade:.25,fog:.095,rain:.82,wind:.65},
 fog:{name:'薄霧',icon:'≋',shade:.06,fog:.31,rain:0,wind:.08},
 };
 const next={clear:[['clear',.50],['cloudy',.35],['fog',.15]],cloudy:[['clear',.23],['cloudy',.35],['drizzle',.27],['fog',.15]],drizzle:[['cloudy',.30],['drizzle',.40],['rain',.30]],rain:[['rain',.35],['drizzle',.50],['cloudy',.15]],fog:[['fog',.24],['cloudy',.41],['clear',.35]]};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function hash(seed,n){let h=2166136261;for(const ch of String(seed)+':'+n){h=Math.imul(h^ch.charCodeAt(0),16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return(h>>>0)/4294967296;}
 const histories=new Map();
 function at(seed,minutes){
  const block=Math.floor(Math.max(0,Number(minutes)||0)/180);
  const key=String(seed??'world');let history=histories.get(key);
  if(!history){history=['clear'];if(histories.size>8)histories.clear();histories.set(key,history);}
  // Normal saves use a modest number of blocks; bound pathological imported dates.
  const index=Math.min(block,80000);
  for(let i=history.length;i<=index;i++){
   let q=hash(key,i),kind=history[i-1],options=next[kind];
   for(const [id,p] of options){q-=p;if(q<=0){kind=id;break;}}
   history.push(kind);
  }
  const kind=history[index];return {kind,...kinds[kind],block};
 }
 let canvas=null,ctx=null,shown={shade:0,fog:0,rain:0,wind:0},target=kinds.clear,last=0,hidden=true,reduced=false;
 const W=640,H=360,particles=Array.from({length:102},(_,i)=>({x:hash('x',i)*W,y:hash('y',i)*H,speed:150+hash('s',i)*190,len:7+hash('l',i)*11}));
 function bind(el){canvas=el;ctx=el?.getContext('2d');if(canvas){canvas.width=W;canvas.height=H;}}
 function set(weather,indoor,reduce=false){
  hidden=Boolean(indoor);reduced=reduce;target=hidden?kinds.clear:weather;
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
  if(shown.rain>.008&&!reduced){
   const t=ms/1000,amount=Math.ceil(particles.length*shown.rain);
   ctx.lineCap='round';ctx.lineWidth=.75;ctx.strokeStyle='rgba(209,228,239,'+(.26+shown.rain*.16)+')';ctx.beginPath();
   for(let i=0;i<amount;i++){const p=particles[i],y=(p.y+t*p.speed)% (H+24)-12,x=((p.x+t*35*shown.wind)% (W+40))-20;ctx.moveTo(x,y);ctx.lineTo(x-2-shown.wind*5,y+p.len);}
   ctx.stroke();
  }
 }
 return {kinds,at,bind,set,draw};
})();