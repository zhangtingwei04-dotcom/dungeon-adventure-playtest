/* Scene objects V1: fixed-camera exploration overlays. Original provisional pixel sprites. */
window.DungeonSceneObjectsV1=(function makeSceneObjectEngine(){
 const life=(function lifecycle(){
 const sites=['wreck','trail','clearing','ruin','outskirts'];
 const creatureSlots=[[72,75],[24,72],[55,68]];
 const plantSlots=[[12,88],[44,83],[89,78],[22,79],[68,87],[92,91]];
 function norm(o,s){
  if(!o.creatures||typeof o.creatures!=='object'||Array.isArray(o.creatures))o.creatures={};
  if(!o.plants||typeof o.plants!=='object'||Array.isArray(o.plants))o.plants={};
  const count=s.exploration?.counts?.clearing||0;
  const v=o.creatures.clearing;
  if(!v||typeof v.visible!=='boolean'||!Number.isInteger(v.slot)||v.slot<0||v.slot>=creatureSlots.length||!Number.isFinite(v.last)||!Number.isFinite(v.returnAt)){
   o.creatures.clearing={visible:count>0&&!s.flags?.creatureResolved,slot:0,last:count,returnAt:0};
  }
  if(s.flags?.creatureResolved)o.creatures.clearing.visible=false;
  return o;
 }
 function explore(o,s,random){
  const v=o.creatures.clearing, count=s.exploration?.counts?.clearing||0;
  if(s.scene!=='clearing'||s.flags?.creatureResolved||s.flags?.inBattle||count<=v.last)return [];
  v.last=count;
  if(!v.visible){
   if(count<v.returnAt)return [];
   if(count===1||random()<.55){v.visible=true;v.slot=Math.min(2,Math.floor(random()*3));return ['陌生林地生物'];}
   return [];
  }
  const roll=random();
  if(roll<.25){v.visible=false;v.returnAt=count+2;return [];}
  if(roll<.7)v.slot=(v.slot+1+Math.min(1,Math.floor(random()*2)))%3;
  return [];
 }
 function creature(o,s){
  const v=o.creatures.clearing;
  if(s.scene!=='clearing'||!v.visible||s.flags?.creatureResolved||s.flags?.inBattle)return null;
  const [x,y]=creatureSlots[v.slot];
  return {id:'forest-creature',kind:'creature',x,y,label:'陌生林地生物'};
 }
 function plants(o,s){
  const site=s.scene;if(!sites.includes(site))return [];
  const day=Math.floor(Math.max(0,s.worldMinutes||0)/1440);
  let p=o.plants[site];
  if(!p||!Number.isInteger(p.startDay)||p.startDay>day){p={startDay:day};o.plants[site]=p;}
  const age=day-p.startDay;
  // Six-day cohorts, offset by slot. At most two patches, fixed coordinates,
  // no growth on reload or repeated render within the same game day.
  const group=Math.floor(age/4)%3, phase=age%4;
  const out=[];
  for(let i=0;i<2;i++){
   const slot=group*2+i;
   if(i===1&&phase===0)continue;
   const [x,y]=plantSlots[slot];
   out.push({id:'ambient-plant-'+slot,kind:'ambient-plant',x,y,stage:phase===0?'sprout':phase===1?'growing':phase===2?'mature':i===0?'wilt':'mature',decorative:true});
  }
  return out;
 }
 return {norm,explore,creature,plants};
})();
 const NPC_SITES=['trail','outskirts','street'];
 const specs={
  grass:{label:'草叢',sprite:'grass'},
  wood:{label:'散落木料',sprite:'wood'},
  stone:{label:'碎石',sprite:'stone'},
  wreck:{label:'舊馬車殘骸',sprite:'wreck'},
  npc:{label:'路過的旅人',sprite:'npc'},
  creature:{label:'陌生林地生物',sprite:'creature'}
 };
 function normalize(s){
  if(!s.sceneObjectsV1||typeof s.sceneObjectsV1!=='object'||Array.isArray(s.sceneObjectsV1))s.sceneObjectsV1={};
  const o=s.sceneObjectsV1;
  if(!o.travelers||typeof o.travelers!=='object'||Array.isArray(o.travelers))o.travelers={};
  for(const site of Object.keys(o.travelers)){
   const r=o.travelers[site];
   if(!NPC_SITES.includes(site)||!r||!Number.isFinite(r.day)||!Number.isFinite(r.until))delete o.travelers[site];
  }
  return life.norm(o,s);
 }
 function afterExplore(s,random=Math.random){
  const o=normalize(s),site=s.scene,now=s.worldMinutes,day=Math.floor(now/1440);
  const finds=life.explore(o,s,random);
  if(!NPC_SITES.includes(site)||!s.flags?.rescued||(site==='street'&&!s.flags?.morning))return finds;
  if(o.travelers[site]?.day===day||random()>=.4)return finds;
  o.travelers[site]={day,until:now+60};return [...finds,'路過的旅人'];
 }
 function dismissTraveler(s,site){
  const r=normalize(s).travelers[site];if(r)r.until=Math.min(r.until,s.worldMinutes);
 }
 function objects(s){
  const o=normalize(s),site=s.scene,now=s.worldMinutes,a=[];
  if(site==='trail'&&s.recovery?.found)a.push({id:'old-wreck',kind:'wreck',x:20,y:71,label:s.recovery.looted?'已搜集的舊馬車':'舊馬車殘骸'});
  const npc=o.travelers[site];
  if(npc&&npc.until>now&&s.flags?.rescued)a.push({id:'traveler',kind:'npc',x:52,y:77,label:specs.npc.label});
  const animal=life.creature(o,s);if(animal)a.push(animal);
  a.push(...life.plants(o,s));
  const positions=[[31,91],[82,90],[57,94]];
  const queue=s.exploration?.pending?.[site];
  if(Array.isArray(queue))queue.slice(0,3).forEach((r,i)=>{
   if(!r||typeof r.id!=='string'||typeof r.material!=='string')return;
   const kind=/石/.test(r.material)?'stone':/木/.test(r.material)?'wood':'grass';
   a.push({id:r.id,kind,x:positions[i][0],y:positions[i][1],label:specs[kind].label,material:r.material});
  });
  return a;
 }
 // Original provisional pixel sprites, not final illustration assets.
 function sprite(canvas,kind,stage){
  canvas.width=40;canvas.height=40;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
  const shadow=(x,y,w)=>{r(x+2,y-1,w-4,4,'#17282188');r(x,y,w,2,'#17282188')};
  if(kind==='ambient-plant'){
   const height=stage==='sprout'?5:stage==='growing'?10:14, tint=stage==='wilt'?'#9b9260':'#72945a';
   for(let i=0;i<9;i++){const x=3+i*4,y=34-(i%3);const h=Math.max(3,height-(i*7)%5);r(x,y-h,2,h,'#3e5a36');r(x+1,y-h+1,1,h-1,tint);r(x-2,y-h+3,3,2,tint);}
  }else if(kind==='grass'){
   shadow(3,34,34);
   for(const [x,y,h,col] of [[6,22,12,'#426d39'],[10,15,19,'#547c42'],[15,11,24,'#67964b'],[20,19,16,'#3e6838'],[25,8,27,'#7b9d52'],[31,17,17,'#547d42']]){
    r(x,y,4,h,'#263c2b');r(x+1,y+1,2,h-1,col);r(x-3,y+4,4,3,col);
   }
   r(5,30,29,4,'#3b6837');r(10,28,18,3,'#77964c');r(17,17,2,2,'#c2bd70');
  }else if(kind==='wood'){
   shadow(3,34,34);r(4,26,29,6,'#34291e');r(7,25,25,5,'#956640');r(10,25,18,1,'#c09865');r(13,20,6,11,'#513b2a');r(14,20,3,9,'#ae8053');r(27,30,8,3,'#6e4c32');
  }else if(kind==='stone'){
   shadow(3,34,34);r(7,26,14,8,'#303d37');r(9,23,9,11,'#7b8578');r(11,23,6,3,'#b0b5a1');r(22,27,13,7,'#45534d');r(25,24,7,8,'#92998b');r(25,25,5,2,'#c3bfb1');
  }else if(kind==='npc'){
   shadow(10,37,20);r(11,29,7,8,'#443c32');r(22,29,7,8,'#443c32');r(11,13,18,17,'#344b3e');r(13,15,14,14,'#57715a');r(17,16,3,13,'#b59a60');r(9,16,4,12,'#465e4a');r(27,16,4,12,'#465e4a');r(10,27,4,3,'#d2ae85');r(27,27,4,3,'#d2ae85');r(13,5,14,12,'#372c24');r(15,8,10,9,'#d8b58e');r(13,4,14,5,'#8c6d4d');r(14,7,4,3,'#8c6d4d');r(17,11,2,2,'#35322a');r(23,11,2,2,'#35322a');r(26,20,7,9,'#815a38');r(27,21,5,5,'#ae8150');
  }else if(kind==='creature'){
   shadow(3,35,34);r(9,20,23,11,'#493d30');r(11,18,18,13,'#897b59');r(13,18,13,3,'#b5a37b');r(6,14,13,13,'#60543d');r(6,11,4,7,'#766344');r(15,10,4,7,'#766344');r(7,17,12,9,'#a78e63');r(7,19,2,2,'#e8c46d');r(16,19,2,2,'#292b24');r(7,23,4,2,'#3d3528');r(11,28,4,7,'#64523b');r(26,28,4,7,'#64523b');r(31,19,5,3,'#7a6b4d');
  }else if(kind==='wreck'){
   shadow(0,36,40);r(3,16,33,15,'#423127');r(5,17,29,10,'#835b3e');r(5,20,29,2,'#b08758');r(4,27,31,4,'#4f3729');r(7,9,23,9,'#77765c');r(9,6,13,5,'#9f9675');r(23,11,7,4,'#4b5843');r(9,16,2,11,'#b69a6a');r(27,16,2,11,'#b69a6a');for(const x of [7,26]){r(x,29,8,7,'#2c2a25');r(x+1,30,6,5,'#806448');r(x+3,31,2,3,'#342c22')}r(3,12,4,6,'#65754b');r(29,8,4,5,'#65754b');
  }
 }
 return {normalize,afterExplore,dismissTraveler,objects,sprite,creatureVisible:s=>!!life.creature(normalize(s),s)};
})();
