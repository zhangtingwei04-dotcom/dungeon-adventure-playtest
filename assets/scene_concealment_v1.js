/* Scene concealment core V1.0. One stable occupant per placed cover; persisted in objectWorld. */
(function(root){'use strict';
const profiles=Object.freeze({forest4_grass_a:'grass',forest4_grass_b:'grass',forest4_yellow_shrub:'shrub',forest4_log:'wood',forest4_rock_group:'crevice',forest4_rock_small:'crevice'});
const entries=Object.freeze({
 empty:{kind:'empty',name:'沒有其他東西',clue:'草葉間沒有明顯異常。',detail:'你仔細看了一遍，只發現落葉與泥土。',renew:360},
 sprout:{kind:'material',name:'未辨識嫩芽',clue:'根部露出一點嫩綠。',detail:'葉片下藏著一株小小的嫩芽。',renew:720},
 seed:{kind:'material',name:'未辨識種子',clue:'落葉間有細小顆粒。',detail:'你發現幾粒乾燥種子。',renew:720},
 fungus:{kind:'material',name:'未辨識蘑菇',clue:'陰暗處有淡色菌傘。',detail:'遮蔭處藏著一朵小型蘑菇。',renew:720},
 coin:{kind:'coin',name:'銅幣',clue:'葉片下似乎有微弱反光。',detail:'泥土間夾著一枚遺落的銅幣。',renew:0},
 cloth:{kind:'material',name:'舊布片',clue:'枝葉間纏著異物。',detail:'枝條上掛著一小片舊布。',renew:0},
 tracks:{kind:'trace',name:'細小足跡',clue:'地面留下幾道細小痕跡。',detail:'泥土上有小型生物經過的足跡，無法確認種類。',renew:360},
 beetle:{kind:'animal',name:'鏽殼甲蟲',clue:'根部傳來細微窸窣聲。',detail:'一隻鏽殼甲蟲躲在落葉底下，觸角輕輕探動。',renew:360},
 rabbit:{kind:'animal',name:'月紋兔',clue:'草葉輕輕晃動，似乎有生物躲在裡面。',detail:'一隻月紋兔蜷在草叢深處，豎起長耳。',renew:360}
});
const pools={grass:['empty','empty','empty','sprout','seed','tracks','beetle','rabbit','coin'],shrub:['empty','empty','seed','sprout','tracks','beetle','rabbit','cloth'],wood:['empty','fungus','beetle','tracks','empty'],crevice:['empty','empty','tracks','beetle','fungus','coin']};
const validId=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const map=x=>x&&typeof x==='object'&&!Array.isArray(x);
function supports(o){return !!(o&&validId(o.id)&&!o.previewOnly&&!o.id.startsWith('preview-')&&Object.hasOwn(profiles,o.assetId));}
function minutes(a){return Math.max(0,Math.floor(Number(a.worldMinutes)||0));}
function roll(a,scene,o,cycle){const pool=pools[profiles[o.assetId]],s=String(a.seed??0)+'|'+scene+'|'+o.id+'|'+cycle;let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return pool[(h>>>0)%pool.length];}
function slot(a,scene,o,create=false){
 if(!validId(scene)||!supports(o))return null;
 if(!create)return a.objectWorld?.scenes?.[scene]?.[o.id]||null;
 if(!map(a.objectWorld))a.objectWorld={};if(!map(a.objectWorld.scenes))a.objectWorld.scenes={};
 const ss=a.objectWorld.scenes;if(!map(ss[scene]))ss[scene]={};if(!map(ss[scene][o.id]))ss[scene][o.id]={};return ss[scene][o.id];
}
function ensure(a,scene,o){const r=slot(a,scene,o,true);if(!r)return null;const now=minutes(a);let v=r.concealment;
 if(!map(v)||!Object.hasOwn(entries,v.id)){v={id:roll(a,scene,o,0),cycle:0,stage:'hidden',resolvedAt:null};r.concealment=v;}
 if(v.stage==='resolved'&&entries[v.id].renew>0&&Number.isFinite(v.resolvedAt)&&now>=v.resolvedAt+entries[v.id].renew){const cycle=(Number.isSafeInteger(v.cycle)?v.cycle:0)+1;let id=roll(a,scene,o,cycle);if(entries[id].renew===0)id='empty';v={id,cycle,stage:'hidden',resolvedAt:null};r.concealment=v;}
 return v;
}
function view(a,scene,o){const v=ensure(a,scene,o);if(!v)return null;const e=entries[v.id];return {id:v.id,cycle:v.cycle,stage:v.stage,...e};}
function reveal(a,scene,o){const v=ensure(a,scene,o);if(!v)return null;if(v.stage==='hidden'){v.stage='revealed';if(entries[v.id].kind==='empty'){v.stage='resolved';v.resolvedAt=minutes(a);}}return view(a,scene,o);}
function resolve(a,scene,o,expected,cycle){const v=ensure(a,scene,o);if(!v||v.stage!=='revealed'||v.id!==expected||v.cycle!==cycle)return null;v.stage='resolved';v.resolvedAt=minutes(a);return {...entries[v.id],id:v.id};}
function initialize(a,scene,objects){for(const o of objects)if(o.visible&&supports(o))ensure(a,scene,o);}
root.DungeonSceneConcealmentV1=Object.freeze({supports,initialize,view,reveal,resolve,profiles});
})(typeof window==='undefined'?globalThis:window);
