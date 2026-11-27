/* 燈火核心：測試玩家可視化。獨立像素替身，非正式紙娃娃。 */
(function(root){'use strict';
function project(world,terrain,pos){return terrain?terrain.project(pos):world.project(pos);}
function draw(ctx,p){ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));ctx.scale(p.scale,p.scale);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#14241c88';ctx.beginPath();ctx.ellipse(0,0,10,3,0,0,Math.PI*2);ctx.fill();
 // Each character rectangle is on the same local pixel grid.
 const rect=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 rect('#242a25',-8,-31,16,23);rect('#293b32',-10,-22,20,16);rect('#394a37',-7,-24,14,18);
 rect('#242820',-6,-9,5,9);rect('#242820',1,-9,5,9);rect('#584638',-8,-3,7,3);rect('#584638',1,-3,7,3);
 rect('#384d36',-9,-26,4,13);rect('#384d36',5,-26,4,13);rect('#9b8051',-8,-14,16,2);
 rect('#ded0ae',-4,-25,8,11);rect('#72654b',-4,-15,8,2);rect('#263629',-9,-32,18,7);rect('#263629',-6,-38,12,13);
 rect('#756547',-5,-35,10,9);rect('#d1a578',-5,-32,10,7);rect('#40352c',-5,-34,10,3);rect('#302a26',-3,-29,1,2);rect('#302a26',2,-29,1,2);
 rect('#baa265',-8,-23,1,12);rect('#baa265',7,-23,1,12);rect('#6e5035',6,-16,5,9);rect('#9b7851',7,-15,3,6);
 ctx.restore();}
function marker(ctx,p){ctx.save();const x=Math.max(20,Math.min(460,p.x)),y=Math.max(15,p.y-43*p.scale);ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='#17251f';ctx.fillStyle='#f4d898';ctx.strokeText('玩家',x,y);ctx.fillText('玩家',x,y);ctx.beginPath();ctx.moveTo(p.x-4,y+8);ctx.lineTo(p.x+4,y+8);ctx.lineTo(p.x,y+13);ctx.closePath();ctx.fill();ctx.restore();}
root.DungeonCreatureTestPlayerV1=Object.freeze({project,draw,marker});
})(typeof window==='undefined'?globalThis:window);