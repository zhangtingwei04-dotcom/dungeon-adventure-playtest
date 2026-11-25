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
 root.DungeonRenderResourcesV1=Object.freeze({onceLoad,imageCache});
})(window);
