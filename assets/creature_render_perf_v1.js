/* 燈火效能測試：測試場景與物種姿勢由此供應，共享畫格由共用渲染核心管理。 */
(function(root){'use strict';
const map=[['front',false],['quarter',true],['side',true],['rear',true],['back',false],['rear',false],['side',false],['quarter',false]];
const actions=['walk','trot','run','sniff','eat','drink','rest','look'];
function sampleSpec(index,frame){const slot=index%8,phase=Math.floor(frame/2)*2,mode=actions[slot],angle=(slot+Math.floor(frame/120))%8;return {mode,angle,ms:phase*1000/60+(slot%4)*125,key:mode+':'+angle+':'+phase+':'+(slot%4)};}
function layout(count,index){const cols=count<=1?1:count<=5?3:5,rows=Math.ceil(count/cols),row=Math.floor(index/cols),col=index%cols,n=Math.min(cols,count-row*cols);return {x:480+(col-(n-1)/2)*Math.min(180,850/cols),y:rows===1?380:180+row*330/(rows-1),scale:rows===1?1.25:.72+row*.13};}
function createCache(capacity=64){return root.DungeonRenderResourcesV1.frameCache(capacity);}
function create(adapters,art,limits){const LM=root.DungeonCreatureLifeMotionV1,D=root.DungeonCreatureDirectionV1,Shadow=root.DungeonCreatureShadowV1,cache=root.DungeonRenderResourcesV1.sharedFrames({capacity:64});
 function pose(spec){const [key]=map[spec.angle],A=adapters[key],life=LM.modes.includes(spec.mode);let p=A.sample(life&&spec.mode!=='rest'?'stand':spec.mode,spec.ms);if(spec.mode==='rest'){p=LM.blendRest(A.sample('stand',0),p,LM.sample('rest',spec.ms).rest,D.mixPose);}if(life)p=LM.apply(p,LM.sample(spec.mode,spec.ms),limits[key]);return p;}
 function draw(ctx,count,frame,shared){ctx.clearRect(0,0,960,540);ctx.fillStyle='#263b31';ctx.fillRect(0,0,960,540);for(let i=0;i<count;i++){const spec=sampleSpec(i,frame),point=layout(count,i),[key,mirror]=map[spec.angle],A=adapters[key];Shadow.draw(ctx,Shadow.calculate({x:point.x,y:point.y,height:0,width:130*point.scale,depth:10*point.scale}));ctx.save();ctx.translate(point.x,point.y);ctx.scale(point.scale,point.scale);ctx.translate(-112,-153);ctx.imageSmoothingEnabled=false;if(mirror){ctx.translate(224,0);ctx.scale(-1,1);}cache.draw(ctx,{key:'moss-beast-v3:benchmark:'+spec.key,shareable:shared,width:224,height:160,paint:local=>A.draw(local,art[key],pose(spec))});ctx.restore();}}
 return {draw,reset:()=>cache.clear(),stats:()=>cache.stats()};}
root.DungeonCreatureRenderPerfV1=Object.freeze({create,createCache,sampleSpec,layout});
})(typeof window==='undefined'?globalThis:window);