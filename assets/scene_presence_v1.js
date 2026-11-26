/* Scene presence: presentation-only, no gameplay or save mutations. */
window.DungeonScenePresenceV1 = (function buildPresence(root, doc) {
  'use strict';
  let stage=null, shadow=null, fx=null, active=false, scene=null, generation=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function policy(v={}) {
    if(!v.enabled||v.indoor||v.battle||v.scene!=='wreck'||v.period==='night'||v.weather!=='clear')return {visible:false};
    const low=v.period==='dawn'||v.period==='dusk';
    if(!low&&v.period!=='day')return {visible:false};
    return {visible:true,height:low?'40%':'26%',opacity:low?.18:.13,mirror:v.period==='dawn'?-1:1};
  }
  function ensure(){
    const host=doc.getElementById('sceneStage');
    if(!host)return false;
    if(stage===host&&shadow?.isConnected&&fx?.isConnected)return true;
    stage=host;
    shadow=doc.createElement('div');
    shadow.id='playerPresenceShadowV1';shadow.setAttribute('aria-hidden','true');
    shadow.style.cssText='position:absolute;bottom:-1%;left:40%;width:22%;height:26%;z-index:2;pointer-events:none;opacity:0;overflow:hidden;transform-origin:50% 100%;';
    shadow.innerHTML='<svg viewBox="0 0 90 110" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="#0a1411" d="M55 110 45 110 46 80 39 66 29 51 22 46 18 34 22 25 30 22 39 24 45 31 44 40 38 46 51 51 61 66 68 83 61 86 49 69 56 89 68 110 58 110 51 94Z"/></svg>';
    fx=doc.createElement('div');fx.id='playerPresenceFxV1';fx.setAttribute('aria-hidden','true');
    fx.style.cssText='position:absolute;inset:0;overflow:hidden;z-index:5;pointer-events:none;';
    host.append(shadow,fx);
    return true;
  }
  function clear(){generation++;fx?.replaceChildren();}
  function sync(v){
    if(!ensure())return;
    const next=Boolean(v.enabled&&!v.indoor&&!v.battle&&v.scene==='wreck');
    if(scene!==v.scene||!next)clear();
    scene=v.scene;active=next;
    const p=policy(v);
    shadow.style.opacity=p.visible?String(p.opacity):'0';
    if(p.visible){shadow.style.height=p.height;shadow.style.transform='scaleX('+p.mirror+')';}
  }
  function collect(actor,event){
    if(!active||scene!==event.scene||event.scene!=='wreck'||actor?.flags?.inBattle||!ensure())return;
    const target=event.data?.target;
    if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))return;
    if(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
    clear();
    const token=generation;
    const hand=doc.createElement('div');
    hand.style.cssText='position:absolute;bottom:-3%;left:'+clamp(target.x,28,72)+'%;width:12%;height:30%;transform-origin:50% 100%;opacity:0;pointer-events:none;';
    // Small neutral sleeve/glove silhouette; does not represent equipped gear.
    hand.innerHTML='<svg width="100%" height="100%" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><path fill="#17231d" d="M8 34V21H6V15H4V11H6V9H8V4H10V2H12V4H14V6H16V9H18V13H20V18H18V25H19V34Z"/><path fill="#514738" d="M9 19H8V15H6V11H8V13H10V5H12V8H14V10H16V13H18V18H16V22H10Z"/><path fill="#71634c" d="M10 6H11V13H10ZM12 10H14V14H12ZM8 15H11V17H8Z"/><path fill="#344737" d="M9 23H17V34H10Z"/><path fill="#60705a" d="M10 23H17V25H10Z"/></svg>';
    fx.append(hand);
    if(typeof hand.animate!=='function'){clear();return;}
    const dir=target.x<50?-1:1;
    const animation=hand.animate([
      {opacity:0,transform:'translate(-50%,88%) rotate('+(-dir*12)+'deg)'},
      {opacity:.85,transform:'translate(-50%,-5%) rotate('+(dir*12)+'deg)',offset:.35},
      {opacity:.85,transform:'translate(-50%,2%) rotate('+(dir*6)+'deg)',offset:.53},
      {opacity:0,transform:'translate(-50%,90%) rotate(0deg)'}
    ],{duration:680,easing:'ease-in-out',fill:'forwards'});
    animation.onfinish=()=>{if(generation===token)clear();};
    animation.oncancel=()=>{if(generation===token)clear();};
  }
  return Object.freeze({version:'1.0.0',policy,sync,collect,clear});
})(window, document);
