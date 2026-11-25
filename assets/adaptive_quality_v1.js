/* Conservative visual-only adaptive quality. No game-time or behavior changes. */
(function(root){
 'use strict';
 const profiles=Object.freeze([
  Object.freeze({name:'full',particleScale:1,thumbnailMs:850}),
  Object.freeze({name:'balanced',particleScale:.78,thumbnailMs:1200}),
  Object.freeze({name:'light',particleScale:.58,thumbnailMs:1600})
 ]);
 function create({fixed=null}={}){
  let level=Number.isInteger(fixed)&&fixed>=0&&fixed<profiles.length?fixed:0;
  const locked=Number.isInteger(fixed)&&fixed>=0&&fixed<profiles.length;
  let since=null,prev=null,count=0,total=0,slow=0,good=0,fps=null;
  function pause(){since=null;prev=null;count=0;total=0;slow=0;good=0;fps=null;}
  function sample(ms){
   if(!Number.isFinite(ms))return;
   if(prev===null||ms<=prev||ms-prev>1000){pause();since=prev=ms;return;}
   total+=ms-prev;count++;prev=ms;
   if(ms-since<2000)return;
   fps=total>0?1000*count/total:null;
   if(!locked&&fps!==null){
    if(fps<24){slow++;good=0;}else if(fps>=34){good++;slow=0;}else{slow=0;good=0;}
    if(slow>=2&&level<2){level++;slow=0;good=0;}
    if(good>=4&&level>0){level--;slow=0;good=0;}
   }
   since=ms;count=0;total=0;
  }
  return Object.freeze({sample,pause,profile:()=>profiles[level],snapshot:()=>({level,locked,fps,...profiles[level]})});
 }
 root.DungeonAdaptiveQualityV1=Object.freeze({create,profiles});
})(window);
