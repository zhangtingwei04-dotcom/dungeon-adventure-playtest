/* Shared pixel-art facial motion controller (player and future NPCs).
 * Pure state machine: no sprite ownership, DOM calls, or per-actor timers.
 * Each character gets its own controller; the renderer supplies artwork.
 */
(function(root){
  'use strict';
  const POSES=Object.freeze({
    original:Object.freeze({brows:'original',eyes:'original',mouth:'original'}),
    smile:Object.freeze({brows:'original',eyes:'original',mouth:'smile'}),
    happy:Object.freeze({brows:'original',eyes:'original',mouth:'smile'}),
    surprised:Object.freeze({brows:'surprised',eyes:'surprised',mouth:'surprised'}),
    angry:Object.freeze({brows:'angry',eyes:'angry',mouth:'angry'}),
    shy:Object.freeze({brows:'shy',eyes:'original',mouth:'shy'}),
    eyesClosed:Object.freeze({brows:'original',eyes:'eyesClosed',mouth:'original'})
  });
  const clock=()=>root.performance&&typeof root.performance.now==='function'?root.performance.now():Date.now();
  const valid=value=>Object.prototype.hasOwnProperty.call(POSES,value)?value:'original';
  function createActor(options){
    const opts=options||{};
    let expression=valid(opts.expression||'original');
    let previous=expression;
    let changedAt=-1000;
    let enabled=opts.enabled!==false;
    let allowBlink=opts.blink!==false;
    let nextBlinkAt=clock()+2800+Math.random()*2400;
    let blinkUntil=-1;
    let secondBlinkAt=-1;
    function setExpression(value,at){
      const desired=valid(value);
      if(desired===expression)return false;
      previous=expression;
      expression=desired;
      changedAt=Number.isFinite(at)?at:clock();
      return true;
    }
    function setEnabled(value){
      enabled=!!value;
      if(!enabled){blinkUntil=-1;secondBlinkAt=-1;}
      else nextBlinkAt=clock()+1200+Math.random()*2300;
    }
    function sample(at){
      const time=Number.isFinite(at)?at:clock();
      if(enabled&&allowBlink&&expression!=='eyesClosed'){
        if(time>=secondBlinkAt&&secondBlinkAt>=0){
          blinkUntil=time+125;secondBlinkAt=-1;
        }else if(time>=nextBlinkAt){
          blinkUntil=time+125;
          secondBlinkAt=Math.random()<0.10?time+230:-1;
          nextBlinkAt=time+3200+Math.random()*3700;
        }
      }
      const next=POSES[expression],prior=POSES[previous];
      // Mouth settles first; eyebrows follow one pixel-art beat later.
      const brows=enabled&&time-changedAt<85?prior.brows:next.brows;
      const blinking=enabled&&allowBlink&&time<blinkUntil&&expression!=='eyesClosed';
      return {
        expression,
        blink:blinking,
        parts:{brows,eyes:blinking?'eyesClosed':next.eyes,mouth:next.mouth}
      };
    }
    return Object.freeze({
      id:String(opts.id||'actor'),
      setExpression,
      setEnabled,
      setBlink(value){allowBlink=!!value;if(!allowBlink)blinkUntil=-1;},
      sample,
      get expression(){return expression;},
      get enabled(){return enabled;}
    });
  }
  root.DungeonExpressionMotion=Object.freeze({version:'1.0.0',poses:POSES,createActor});
})(window);
