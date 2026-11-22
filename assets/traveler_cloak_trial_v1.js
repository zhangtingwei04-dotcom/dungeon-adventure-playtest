/* 《迷宮盡頭的燈火》 - dark green/gold cloak alignment test V1
 * Small 64x160 transparent native pixel layers, one rear + one front.
 * This is an entirely new, reversible test asset. No old garment atlas used.
 * Existing male/female bodies, eyes, heads, underwear and inventory untouched.
 * Rasterized once to PNG using the browser's Canvas 2D API.
 */
(function(root){
 'use strict';
 const SIZE={w:64,h:160};
 const COLORS=Object.freeze({
  edge:'#17231e',black:'#12211c',shade:'#152f2a',
  deep:'#1b3930',green:'#275044',lit:'#356052',fold:'#102c27',
  gold:'#c49b52',goldLight:'#e8c777',goldDark:'#866b38'
 });
 function make(gender,layer){
  const female=gender==='female',inset=female?1:0;
  const canvas=document.createElement('canvas');
  canvas.width=SIZE.w;canvas.height=SIZE.h;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return null;
  ctx.imageSmoothingEnabled=false;
  const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
  const P=(points,c)=>{
   ctx.fillStyle=c;ctx.beginPath();
   points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
   ctx.closePath();ctx.fill();
  };
  // Integer Bresenham trim ensures the embroidery survives at native size.
  const L=(x0,y0,x1,y1,c)=>{
   x0|=0;y0|=0;x1|=0;y1|=0;
   let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0);
   let sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx+dy;
   for(;;){R(x0,y0,1,1,c);if(x0===x1&&y0===y1)break;
    const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}
   }
  };
  const left=x=>x+inset,right=x=>x-inset;
  if(layer==='back'){
   // Broad back cloak hangs behind the body, away from face/neck.
   P([[left(19),52],[32,50],[right(45),52],[right(54),62],
     [right(57),78],[right(60),105],[right(61),126],
     [right(58),134],[right(53),136],[right(47),132],
     [right(39),135],[32,132],[left(25),135],[left(17),132],
     [left(11),136],[left(6),134],[left(3),126],
     [left(4),104],[left(7),78],[left(10),62]],COLORS.edge);
   P([[left(20),54],[32,53],[right(44),54],[right(51),63],
     [right(54),80],[right(57),107],[right(58),126],
     [right(54),131],[right(48),128],[right(39),132],[32,129],
     [left(25),132],[left(16),128],[left(10),131],
     [left(6),126],[left(7),108],[left(10),81],[left(13),64]],COLORS.deep);
   P([[left(12),65],[left(18),55],[left(26),57],[left(19),91],
     [left(15),115],[left(10),129],[left(7),127],[left(8),105]],COLORS.green);
   P([[right(46),55],[right(52),65],[right(56),103],[right(57),126],
     [right(52),130],[right(46),109],[right(41),86],[right(39),58]],COLORS.shade);
   P([[25,55],[34,57],[36,111],[32,129],[28,114]],COLORS.fold);
   P([[39,62],[42,82],[48,109],[45,129],[39,131]],COLORS.shade);
   L(left(7),127,left(11),132,COLORS.goldDark);
   L(left(11),132,left(16),129,COLORS.gold);
   L(right(57),128,right(53),133,COLORS.goldDark);
   L(right(53),133,right(47),129,COLORS.gold);
   for(const [x,y] of [[left(10),104],[left(11),112],[right(53),104],[right(52),112]]){
    R(x,y,1,2,COLORS.goldDark);
   }
  }else if(layer==='front'){
   // Shoulder mantle, collars and two tapered front flaps.
   // Highest colored pixel is below the approved head's chin.
   P([[left(13),56],[left(18),53],[left(25),54],[32,60],
     [right(39),54],[right(46),53],[right(51),56],
     [right(55),64],[right(54),75],[right(49),83],
     [right(51),96],[right(46),103],[right(39),98],
     [right(42),84],[right(39),73],[right(35),66],
     [32,65],[left(29),66],[left(25),73],
     [left(22),84],[left(25),99],[left(18),103],
     [left(13),96],[left(15),83],[left(10),76],
     [left(9),65]],COLORS.edge);
   P([[left(14),57],[left(20),54],[left(26),57],[32,62],
     [right(38),57],[right(44),54],[right(50),57],
     [right(53),65],[right(51),75],[right(46),83],
     [right(49),96],[right(45),100],[right(41),96],
     [right(44),82],[right(40),68],
     [32,64],[left(24),68],[left(20),82],
     [left(23),96],[left(19),100],[left(15),96],
     [left(18),83],[left(13),75],[left(11),65]],COLORS.deep);
   // Cloth depth and asymmetrical folds, without widening body.
   P([[left(11),65],[left(15),58],[left(20),57],[left(20),73],
     [left(16),85],[left(19),96],[left(16),94],[left(16),84]],COLORS.green);
   P([[right(44),57],[right(50),61],[right(52),68],
     [right(50),75],[right(46),83],[right(47),94],
     [right(45),99],[right(43),94],[right(45),81],[right(42),68]],COLORS.shade);
   // Interior neck/hood fold. Never cover hair or face.
   P([[left(19),54],[left(26),56],[32,61],
     [right(38),56],[right(45),54],[right(40),62],
     [32,65],[left(24),62]],COLORS.black);
   L(left(14),57,left(22),56,COLORS.goldDark);
   L(left(22),56,31,63,COLORS.gold);
   L(33,63,right(42),56,COLORS.gold);
   L(right(42),56,right(50),57,COLORS.goldDark);
   // Gold along mantle edge and front tapers.
   const trim=[
    [left(10),65,left(12),75],[left(12),75,left(18),83],
    [left(18),83,left(15),96],[left(15),96,left(19),100],
    [right(54),65,right(52),75],[right(52),75,right(46),83],
    [right(46),83,right(49),96],[right(49),96,right(45),100]
   ];
   trim.forEach(([a,b,c,d],i)=>L(a,b,c,d,i%3===0?COLORS.goldDark:COLORS.gold));
   // Small compass clasp. Center chest opening remains visible.
   R(31,61,3,3,COLORS.edge);R(32,61,1,3,COLORS.goldLight);
   R(31,62,3,1,COLORS.gold);
   R(32,64,1,2,COLORS.gold);
   // Readable botanical marks, not busy high-resolution texture.
   for(const [x,y,side] of [
    [left(16),74,1],[left(18),92,1],[right(48),74,-1],[right(46),92,-1]
   ]){
    L(x,y,x+side,y+4,COLORS.goldDark);
    R(x+side,y+2,2,1,COLORS.gold);
    R(x-side,y+3,2,1,COLORS.goldDark);
   }
   R(left(19),62,2,1,COLORS.lit);R(right(43),62,2,1,COLORS.lit);
  }
  return canvas.toDataURL('image/png');
 }
 const sprites={
  male:{back:make('male','back'),front:make('male','front')},
  female:{back:make('female','back'),front:make('female','front')}
 };
 root.DungeonTravelerCloakTrialV1=Object.freeze({
  ready:Object.values(sprites).every(a=>a.back&&a.front),
  version:'alignment-trial-20261122-v1',
  width:64,height:160,
  sprites:Object.freeze({
   male:Object.freeze(sprites.male),
   female:Object.freeze(sprites.female)
  }),
  // Fully disabled or absent from paper doll when outerwear is unequipped.
  isEligible:(equipment)=>equipment?.outer==='starter_cloak'
 });
})(window);
