/* Shared render resource helpers: bounded image cache, one-shot deferred loads. */
(function(root){
 'use strict';
 function onceLoad(start){
  let started=false;
  return function(){if(started)return false;started=true;start();return true;};
 }
 function imageCache(limit=24,create=()=>new Image()){
  const cache=new Map();limit=Math.max(1,Math.floor(limit)||1);
  return Object.freeze({
   get(src){if(!src)return null;let img=cache.get(src);
    if(img){cache.delete(src);cache.set(src,img);}
    else{img=create();img.decoding='async';img.src=src;cache.set(src,img);
     while(cache.size>limit)cache.delete(cache.keys().next().value);}
    return img.complete&&img.naturalWidth?img:null;
   },
   clear(){cache.clear();},size(){return cache.size;}
  });
 }
 // Shared frame cache: scene-owned; only callers with an exact visual key may opt in.
 // No creature state, scene time, shadows or world transforms are stored here.
 function frameCache(capacity=64){
  if(!Number.isInteger(capacity)||capacity<1||capacity>64)throw RangeError('invalid frame capacity');
  const cache=new Map();let hits=0,misses=0;
  function get(key,make){
   if(typeof key!=='string'||!key||typeof make!=='function')throw TypeError('invalid frame key or factory');
   if(cache.has(key)){const value=cache.get(key);cache.delete(key);cache.set(key,value);hits++;return value;}
   misses++;const value=make();
   if(value==null)throw Error('frame factory returned no value');
   cache.set(key,value);while(cache.size>capacity)cache.delete(cache.keys().next().value);
   return value;
  }
  return Object.freeze({get,clear(){cache.clear();hits=0;misses=0;},stats(){return {hits,misses,size:cache.size,capacity};}});
 }
 // A caller supplies an exact local-pose key and a verified bounding rectangle.
 // Unshareable poses (IK, blends, instance-specific effects) draw directly.
 function sharedFrames({capacity=64,createCanvas=()=>document.createElement('canvas')}={}){
  const cache=frameCache(capacity);
  function draw(ctx,{key,shareable=false,width,height,offsetX=0,offsetY=0,paint}){
   if(typeof paint!=='function')throw TypeError('missing painter');
   const safe=shareable===true&&typeof key==='string'&&key.length>0&&Number.isInteger(width)&&Number.isInteger(height)&&width>0&&height>0&&width*height<=224*160&&Number.isFinite(offsetX)&&Number.isFinite(offsetY);
   if(!safe){paint(ctx);return 'direct';}
   const frame=cache.get(JSON.stringify([key,width,height,offsetX,offsetY]),()=>{
    const canvas=createCanvas();canvas.width=width;canvas.height=height;
    const local=canvas.getContext('2d');if(!local)throw Error('missing frame context');
    local.imageSmoothingEnabled=false;local.translate(-offsetX,-offsetY);paint(local);return canvas;
   });
   ctx.drawImage(frame,offsetX,offsetY);return 'shared';
  }
  return Object.freeze({draw,clear:cache.clear,stats:cache.stats});
 }
 root.DungeonRenderResourcesV1=Object.freeze({onceLoad,imageCache,frameCache,sharedFrames});
})(window);
