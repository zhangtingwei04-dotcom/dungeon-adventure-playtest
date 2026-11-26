/* 燈火核心系統：調查與物件卡片 V1.0.0
 * Presentation and encounter records only. The caller owns game actions and inventory.
 */
(function(window,document){
 'use strict';
 function create({ $, inspectInScene, runSceneAction, renderPlaceDrawer, toast }){
// Reuse exact sprite where possible. Background-only investigation points use a real scene crop.
function investigationSceneCrop(node){
 const source=$('view'),cv=document.createElement('canvas');cv.width=68;cv.height=56;
 const g=cv.getContext('2d');if(!source?.width||!source?.height||!g)return cv;
 const bounds=source.getBoundingClientRect(),rect=node?.getBoundingClientRect?.();
 let x=.5,y=.5;
 if(rect?.width&&bounds.width&&bounds.height){x=(rect.left+rect.width/2-bounds.left)/bounds.width;y=(rect.top+rect.height/2-bounds.top)/bounds.height;}
 const local=!!rect?.width,w=local?source.width*.32:source.width,h=local?source.height*.40:source.height;
 const sx=Math.max(0,Math.min(source.width-w,x*source.width-w/2)),sy=Math.max(0,Math.min(source.height-h,y*source.height-h/2));
 g.imageSmoothingEnabled=false;const fit=Math.min(cv.width/w,cv.height/h);
 g.drawImage(source,sx,sy,w,h,(cv.width-w*fit)/2,(cv.height-h*fit)/2,w*fit,h*fit);
 cv.setAttribute('aria-hidden','true');cv.title=local?'場景局部預覽':'目前場景預覽';return cv;
}
function sceneObjectThumbnail(node){
 const kind=node?.dataset.liveKind||'';
 const original=node?.querySelector('.forest-v4-art img, :scope > img');
 const asset=kind?window.DUNGEON_FOREST_V4_ASSETS?.['forest4_'+kind]?.src:null;
 const src=original?.getAttribute('src')||asset;
 const fallback=()=>{if(kind==='branch'&&window.DungeonSceneObjectsV1){const cv=document.createElement('canvas');window.DungeonSceneObjectsV1.sprite(cv,'wood');return cv;}return investigationSceneCrop(node);};
 if(src){
  const image=document.createElement('img');image.src=src;image.alt='';image.draggable=false;
  image.onerror=()=>{if(asset&&image.getAttribute('src')!==asset){image.src=asset;return;}image.replaceWith(fallback());};
  // Thin branches can become nearly invisible in a 34px slot; crop transparent padding.
  if(kind==='branch'){
   const cv=document.createElement('canvas');cv.width=68;cv.height=56;cv.setAttribute('aria-hidden','true');
   const draw=()=>{try{
    const work=document.createElement('canvas');work.width=image.naturalWidth;work.height=image.naturalHeight;
    const g=work.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
    const pixels=g.getImageData(0,0,work.width,work.height).data;let x0=work.width,y0=work.height,x1=-1,y1=-1;
    for(let y=0;y<work.height;y++)for(let x=0;x<work.width;x++)if(pixels[(y*work.width+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(x1<x0)throw Error('empty branch');const w=x1-x0+1,h=y1-y0+1,fit=Math.min(66/w,54/h),out=cv.getContext('2d');out.clearRect(0,0,68,56);out.imageSmoothingEnabled=false;out.drawImage(work,x0,y0,w,h,(68-w*fit)/2,(56-h*fit)/2,w*fit,h*fit);
   }catch{cv.replaceWith(fallback());}};
   image.onload=draw;image.onerror=()=>cv.replaceWith(fallback());
   if(image.complete&&image.naturalWidth)draw();
   return cv;
  }
  return image;
 }
 const source=node?.querySelector(':scope > canvas');
 if(source){const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;canvas.getContext('2d').drawImage(source,0,0);canvas.setAttribute('aria-hidden','true');return canvas;}
 return fallback();
}
function investigationCardData(node){
 const kind=node.dataset.liveKind||node.dataset.kind||'';
 const label=node.dataset.objectName||node.getAttribute('aria-label')||node.title||'';
 const name=label.split('：')[0].split('｜')[0].trim();
 const state=node.dataset.objectVisualState;
 const collectible=node.dataset.objectCollectible==='true'||!!node.dataset.material;
 const status=collectible?'可採集':node.dataset.motion==='animal'||['npc','creature'].includes(kind)?'可互動':state==='resource-taken'?'已收取':state==='inspected'?'已調查':'可調查';
 const action=collectible?'查看／採集':node.dataset.motion==='animal'||['npc','creature'].includes(kind)?'互動':'調查';
 return {node,kind,name,status,action};
}
// Last confirmed encounter, saved separately from live spawn state.
function rememberDepartedAnimal(actor,o,info,reason){
 if(!actor||!o||o.previewOnly||String(o.id).startsWith('preview-')||!info||info.type!=='living')return;
 const world=actor.objectWorld||(actor.objectWorld={scenes:{}});
 if(!world.animalEncounters||typeof world.animalEncounters!=='object'||Array.isArray(world.animalEncounters))world.animalEncounters={};
 const key=actor.scene+':'+o.assetId+(o.rabbitVariant==='golden'?':golden':'');
 world.animalEncounters[key]={scene:actor.scene,assetId:o.assetId,variant:o.rabbitVariant==='golden'?'golden':'',name:info.name,description:reason,minute:actor.worldMinutes};
}
function departedAnimalCards(actor,live){
 const records=Object.values(actor.objectWorld?.animalEncounters||{});
 return records.filter(r=>r&&r.scene===actor.scene&&typeof r.name==='string'&&typeof r.description==='string'&&window.DungeonObjectInvestigationV1.get(r.assetId)?.type==='living'&&!live.some(item=>item.kind===r.assetId.replace('forest4_','')&&item.name===r.name)).map(r=>({record:r,kind:r.assetId.replace('forest4_',''),name:r.name,status:'已離開',action:'查看紀錄'}));
}
function appendInvestigationCards(parent,items,append){
 if(!items.length)return;
 const grid=document.createElement('div');grid.className='scene-action-tiles scene-object-card-grid';parent.appendChild(grid);
 for(const item of items){
  const same=items.filter(o=>o.name===item.name);
  const name=same.length>1?item.name+' '+(same.indexOf(item)+1):item.name;
  const button=append('',()=>{
   if(item.record){inspectInScene(item.record.description+' 目前牠已離開這裡。',[{label:'關閉',fn:()=>{}}]);return;}
   if(item.entry){runSceneAction(item.entry.fn);return;}
   const node=item.node,id=node.dataset.objectId;
   const live=id?Array.from($('hotspots').querySelectorAll('button[data-object-id]:not(.env-leaving):not([disabled])')).find(el=>el.dataset.objectId===id):node.isConnected?node:null;
   if(live)live.onclick?.();else{renderPlaceDrawer();toast('物件已不在目前場景。');}
  },grid);
  button.classList.add('scene-object-card');button.title=name+' · '+item.status+' · '+item.action;button.setAttribute('aria-label',name+'，'+item.status+'，'+item.action);
  const thumb=document.createElement('span');thumb.className='scene-object-thumbnail';
  let art;
  if(item.record){const src=window.DUNGEON_FOREST_V4_ASSETS?.[item.record.assetId]?.src;if(src){art=document.createElement('img');art.src=src;art.alt='';art.draggable=false;}button.classList.add('scene-object-departed');}
  else if(item.entry)art=investigationSceneCrop(item.node);
  else art=sceneObjectThumbnail(item.node);
  if(!art)art=investigationSceneCrop(item.node);
  thumb.appendChild(art);button.appendChild(thumb);
  const title=document.createElement('span');title.className='scene-object-name';title.textContent=name;
  const status=document.createElement('span');status.className='scene-object-status';status.textContent=item.status;
  const action=document.createElement('span');action.className='scene-object-verb';action.textContent=item.action;
  button.append(title,status,action);
 }
}

 return Object.freeze({investigationSceneCrop,sceneObjectThumbnail,investigationCardData,rememberDepartedAnimal,departedAnimalCards,appendInvestigationCards});
 }
 window.DungeonInvestigationCardsV1=Object.freeze({version:'1.0.0',create});
})(window,document);
