window.DungeonForestV4Integration=(function integration(){
 const props={
 wagon:{shadowWidth:93,shadowHeight:10,shadowOpacity:.88,brightness:.91,saturation:.82,contrast:.98,grassLeft:18,grassWidth:24,grassOpacity:.77},
 wheel_flat:{shadowWidth:96,shadowHeight:32,shadowOpacity:.65,brightness:.91,saturation:.84,contrast:.97,grassLeft:5,grassWidth:24,grassOpacity:.57},
 crate_large:{shadowWidth:96,shadowHeight:15,shadowOpacity:.8,brightness:.93,saturation:.86,contrast:.98,grassLeft:8,grassWidth:35,grassOpacity:.68},
 crate_small:{shadowWidth:94,shadowHeight:18,shadowOpacity:.75,brightness:.94,saturation:.88,contrast:.98},
 crate_open:{shadowWidth:95,shadowHeight:15,shadowOpacity:.75,brightness:.91,saturation:.86,contrast:.97},
 barrel:{shadowWidth:89,shadowHeight:13,shadowOpacity:.7,brightness:.92,saturation:.86,contrast:.98},
 sack:{shadowWidth:92,shadowHeight:17,shadowOpacity:.68,brightness:.91,saturation:.83,contrast:.98},
 plank:{shadowWidth:96,shadowHeight:23,shadowOpacity:.62,brightness:.92,saturation:.84,contrast:.98},
 plank_lean:{shadowWidth:30,shadowHeight:5,shadowOpacity:.55,brightness:.92,saturation:.84,contrast:.98},
 rabbit:{shadowWidth:78,shadowHeight:13,shadowOpacity:.73,brightness:.88,saturation:.87,contrast:.96},
 beetle:{shadowWidth:84,shadowHeight:21,shadowOpacity:.55,brightness:.93,saturation:.89,contrast:.98},
 branch:{shadowWidth:91,shadowHeight:27,shadowOpacity:.59,brightness:.94,saturation:.87,contrast:.98},
 log:{shadowWidth:92,shadowHeight:19,shadowOpacity:.7,brightness:.93,saturation:.85,contrast:.97},
 rock_group:{shadowWidth:94,shadowHeight:14,shadowOpacity:.62,brightness:.95,saturation:.86,contrast:.98},
 rock_small:{shadowWidth:95,shadowHeight:16,shadowOpacity:.65,brightness:.94,saturation:.85,contrast:.98}
 };
 function profile(o){
  const k=o.assetId.replace(/^forest4_/,'');
  const isPlant=/^(grass_|.*flower|lavender|yellow_shrub|small_shrub|shrub|fern|mushroom|berries)/.test(k);
  const airborne=['bird','butterfly','vine'].includes(k);
  let p=props[k]||{shadowWidth:85,shadowHeight:10,shadowOpacity:isPlant?.36:.54,brightness:isPlant?.93:.96,saturation:isPlant?.85:.91,contrast:.98};
  if(window.DUNGEON_FOREST_V4_LAYOUT?.layoutVariant==='accident-b'){
   const changes={wagon:{brightness:.89,saturation:.79,contrast:.96,grassWidth:25},wheel_flat:{brightness:.88,saturation:.81,contrast:.96,grassLeft:8,grassWidth:36,grassOpacity:.72},crate_large:{brightness:.91,saturation:.83,contrast:.97},crate_open:{brightness:.90,saturation:.83,contrast:.97},crate_small:{brightness:.92,saturation:.85,contrast:.97},barrel:{brightness:.90,saturation:.83,contrast:.97,shadowWidth:126,shadowHeight:20,shadowLeft:104,shadowBottom:-25},rabbit:{brightness:.86,saturation:.86,contrast:.96}};
   p={...p,...(changes[k]||{})};
   if(o.artVariant==='barrel-side')p={...p,shadowWidth:90,shadowHeight:30,shadowLeft:50,shadowBottom:7,shadowOpacity:.79};
   if(k==='wagon')p={...p,shadowWidth:96,shadowHeight:12,shadowOpacity:.96};
  }
  // Forest floor integration: soft ambient contact, darker contact core and restrained ground fringe.
  const groundBlend={
   wagon:{brightness:.87,saturation:.78,contrast:.94,shadowWidth:94,shadowHeight:17,shadowOpacity:.98,shadowBottom:2,grassLeft:17,grassWidth:20,grassOpacity:.66},
   crate_large:{brightness:.88,saturation:.80,contrast:.95,shadowWidth:99,shadowHeight:23,shadowOpacity:.94,shadowBottom:1,grassLeft:4,grassWidth:22,grassOpacity:.60},
   crate_small:{brightness:.89,saturation:.81,contrast:.95,shadowWidth:96,shadowHeight:25,shadowOpacity:.86,shadowBottom:1},
   crate_open:{brightness:.87,saturation:.80,contrast:.95,shadowWidth:97,shadowHeight:21,shadowOpacity:.88,shadowBottom:1},
   wheel_flat:{brightness:.86,saturation:.77,contrast:.95,shadowWidth:99,shadowHeight:36,shadowOpacity:.91,shadowBottom:2,grassLeft:7,grassWidth:19,grassOpacity:.52},
   plank:{brightness:.89,saturation:.78,contrast:.95,shadowWidth:97,shadowHeight:29,shadowOpacity:.77},
   rock_small:{brightness:.90,saturation:.79,contrast:.94,shadowWidth:97,shadowHeight:23,shadowOpacity:.84,shadowBottom:2},
   rock_group:{brightness:.91,saturation:.80,contrast:.95,shadowWidth:95,shadowHeight:22,shadowOpacity:.84,shadowBottom:1},
   rabbit:{brightness:.84,saturation:.79,contrast:.95,shadowWidth:73,shadowHeight:19,shadowOpacity:.84,shadowBottom:1}
  };
  p={...p,...(groundBlend[k]||{})};
  // Dirt paths should not acquire a large decorative grass tuft.
  if(k==='crate_large'&&o.x>50)p={...p,grassWidth:0};
  if(o.contactGrass===true)p={...p,grassLeft:4,grassWidth:39,grassOpacity:.72};
  // Fallen wheels rest on the existing terrain; never attach a floating grass sprite.
  if(k==='wheel_flat')p={...p,grassWidth:0,grassOpacity:0};
  // Multi-contact shadows for the original wagon sprite; the terrain itself supplies grass.
  if(k==='wagon')p={...p,grassWidth:0,grassOpacity:0,shadowProfile:'wagon-multi-contact'};
  // Tone down the grass on the right of the mounted wheel, not all forest vegetation.
  if(o.id==='v4-grass_b11'&&window.DUNGEON_FOREST_V4_LAYOUT?.revision==='accident-c')p={...p,brightness:.82,saturation:.70,contrast:.92,shadowOpacity:.25};
  // Depth correction is intentionally restrained: only art appearance, never dimensions.
  const depth=Math.max(0,Math.min(1,(70-o.y)/45));
  return {...p,ground:!airborne,brightness:Math.max(.8,Math.min(1,p.brightness+depth*.025)),saturation:Math.max(.65,p.saturation-depth*.045),contrast:p.contrast-depth*.025,angle:k==='wheel_flat'||k==='plank'?o.rotation*.5:0};
 }
 function apply(node,o,assets){
  const p=profile(o);node.dataset.ground=String(p.ground);node.dataset.surfaceKind=o.assetId.replace(/^forest4_/,'');node.dataset.shadowProfile=p.shadowProfile||'standard';
  if(p.shadowProfile==='wagon-multi-contact'){node.style.setProperty('--v4-wagon-angle',(Number(o.rotation)||0)+'deg');node.style.setProperty('--v4-wagon-flip',o.flip?'-1':'1');}
  const vars={'shadow-left':(p.shadowLeft??50)+'%','shadow-bottom':(p.shadowBottom??-1)+'%','shadow-width':p.shadowWidth+'%','shadow-height':p.shadowHeight+'%','shadow-opacity':p.shadowOpacity,'ground-angle':p.angle+'deg','brightness':p.brightness.toFixed(3),'saturation':p.saturation.toFixed(3),'contrast':p.contrast.toFixed(3)};
  for(const [key,value] of Object.entries(vars))node.style.setProperty('--v4-'+key,String(value));
  // Small contact fringe, not a new collectible or authored object.
  // Reuse the existing approved transparent grass art only on selected near-ground props.
  if(p.grassWidth&&assets.forest4_grass_b?.src){
   const fringe=document.createElement('img');fringe.className='forest-v4-contact-grass';fringe.alt='';fringe.draggable=false;fringe.setAttribute('aria-hidden','true');fringe.src=assets.forest4_grass_b.src;
   fringe.style.setProperty('--v4-grass-left',p.grassLeft+'%');fringe.style.setProperty('--v4-grass-width',p.grassWidth+'%');fringe.style.setProperty('--v4-grass-opacity',String(p.grassOpacity));fringe.style.setProperty('--v4-grass-bottom',(o.assetId==='forest4_wagon'?'1%':'0%'));node.appendChild(fringe);
  }
 }
 return {profile,apply};
})();
