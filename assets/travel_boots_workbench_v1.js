/* 《迷宮盡頭的燈火》 — independent, game-coordinate boot trial V1.
 * Pixel art derived from the user-approved brown buckled leather-boots concept.
 * Source 64x160 male/female body PNGs are used to locate the actual feet;
 * only new transparent boot layers are created, originals never modified.
 * Development-only: no save or production changes.
 */
(function(root){
 'use strict';
 const W=64,H=160;
 const VERSION='brown-leather-boots-native-64x160-v1';
 const palette=Object.freeze({
   edge:'#201719', shadow:'#372423', brown:'#603b30',
   leather:'#85533d', light:'#a46b4d', highlight:'#c1855f',
   stitch:'#d29b70', sole:'#382b2b', soleEdge:'#58433d',
   brass:'#c7a06a', brassHi:'#f3ce88'
 });
 function load(source){
  return new Promise((resolve,reject)=>{
   if(typeof source!=='string'||!source.startsWith('data:image/png;base64,')){
    reject(Error('64x160 source body missing'));return;
   }
   const image=new Image();
   image.onload=()=>resolve(image);
   image.onerror=()=>reject(Error('Unable to decode original body sprite'));
   image.src=source;
  });
 }
 function sourceFeet(body){
  const canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(body,0,0,W,H);
  const data=ctx.getImageData(0,0,W,H).data;
  const result=[];
  for(const side of [0,1]){
   const startX=side===0?2:32,endX=side===0?31:61;
   let bottom=-1;
   for(let y=123;y<=148;y++)for(let x=startX;x<=endX;x++){
    if(data[(y*W+x)*4+3]>80)bottom=Math.max(bottom,y);
   }
   if(bottom<130||bottom>148)bottom=140;
   let sum=0,n=0;
   for(let y=Math.max(129,bottom-7);y<=bottom;y++){
    for(let x=startX;x<=endX;x++){
     if(data[(y*W+x)*4+3]>80){sum+=x;n++}
    }
   }
   const fallback=side===0?24:40;
   const center=n?Math.round(sum/n):fallback;
   // constrain fit: never cross the middle even for stray body pixels.
   result.push({center:Math.max(side===0?12:35,Math.min(side===0?29:52,center)),
    bottom:Math.max(137,Math.min(145,bottom))});
  }
  return result;
 }
 function renderBoot(foot,side,gender){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=false;
  const p=palette,x=Math.round(foot.center),bottom=foot.bottom;
  const narrow=gender==='female',half=narrow?4:5;
  const top=bottom-14;
  const rect=(color,a,b,w,h)=>{ctx.fillStyle=color;ctx.fillRect(a,b,w,h)};
  // Rugged outsole, toe and short boot: 1 logical unit equals one native pixel.
  rect(p.edge,x-half-2,bottom-5,half*2+4,6);
  rect(p.sole,x-half-2,bottom-3,half*2+4,3);
  rect(p.soleEdge,x-half-1,bottom-3,half*2+2,1);
  rect(p.edge,x-half,top,half*2+1,12);
  rect(p.shadow,x-half+1,top+1,half*2-1,10);
  rect(p.brown,x-half+2,top+2,half*2-3,8);
  rect(p.leather,x-half+1,top+2,half*2-1,2);
  rect(p.light,x-half+2,top+2,half*2-3,1);
  // Folded upper cuff (hidden naturally under long trousers where they meet).
  rect(p.edge,x-half-1,top-1,half*2+3,4);
  rect(p.leather,x-half,top,half*2+1,2);
  rect(p.light,x-half,top,half*2+1,1);
  // Diagonal strap and brass buckle mirroring the accepted pair's motif.
  rect(p.edge,x-half+1,top+7,half*2,2);
  rect(p.leather,x-half+1,top+7,half*2,1);
  const buckleX=side===0?x-half+1:x+half-2;
  rect(p.brass,buckleX,top+6,3,3);
  rect(p.edge,buckleX+1,top+7,1,1);
  rect(p.brassHi,buckleX,top+6,1,1);
  // Rounded toe instead of a large square shoe.
  rect(p.edge,x-half-1,bottom-8,half*2+3,6);
  rect(p.brown,x-half,bottom-7,half*2+1,4);
  rect(p.leather,x-half+1,bottom-6,half*2-1,3);
  rect(p.light,x-half+2,bottom-6,half*2-3,1);
  rect(p.highlight,x-half+3,bottom-6,2,1);
  rect(p.soleEdge,x-half-1,bottom-3,half*2+3,1);
  // Pixel stitches, kept above the sole.
  rect(p.stitch,x-half+1,top+3,1,1);
  rect(p.stitch,x+half-1,top+3,1,1);
  return canvas.toDataURL('image/png');
 }
 async function build(sourceImages){
  const [male,female]=await Promise.all([
   load(sourceImages?.maleBody),load(sourceImages?.femaleBody)
  ]);
  const maleFeet=sourceFeet(male),femaleFeet=sourceFeet(female);
  return Object.freeze({
   maleTravelerBootLeft:renderBoot(maleFeet[0],0,'male'),
   maleTravelerBootRight:renderBoot(maleFeet[1],1,'male'),
   femaleTravelerBootLeft:renderBoot(femaleFeet[0],0,'female'),
   femaleTravelerBootRight:renderBoot(femaleFeet[1],1,'female')
  });
 }
 root.DungeonTravelBootsWorkbenchV1=Object.freeze({
  version:VERSION,canvas:Object.freeze({width:W,height:H}),
  independentLayers:2,build
 });
})(window);
