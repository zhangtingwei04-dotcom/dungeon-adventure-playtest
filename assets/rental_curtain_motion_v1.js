/* Independent window-curtain cloth animation. Original window, weather and door remain untouched. */
(function(root){
  'use strict';
  const W=456,H=349, left=3,right=453, top=8,bottom=345,center=228;
  const duration=1650;
  // Hand-traced inner silhouette of the tied curtains on the original 456x349 window.
  const profile=[[8,112,344],[38,110,346],[75,101,355],[115,89,367],[155,72,384],[190,53,403],[214,48,408],[240,54,402],[275,66,390],[315,75,381],[345,78,378]];
  const states=new WeakMap();
  const clamp=(x)=>Math.max(0,Math.min(1,x));
  function edges(y,p){
    let k=1;while(k<profile.length-1&&y>profile[k][0])k++;
    const a=profile[k-1],b=profile[k],t=clamp((y-a[0])/(b[0]-a[0]));
    const l=a[1]+(b[1]-a[1])*t,r=a[2]+(b[2]-a[2])*t;
    return [l+(center-l)*p,r+(center-r)*p];
  }
  function paint(state,p){
    const {canvas,ctx,texture}=state;
    if(!ctx)return;
    ctx.clearRect(0,0,W,H);
    if(p<=0||!texture.complete||!texture.naturalWidth)return;
    // The original tied cloth stays underneath; the expanding opaque cloth
    // covers it without cutting any holes in the glass or swapping the base.
    ctx.globalAlpha=clamp(p/.14);
    const sw=texture.naturalWidth,sh=texture.naturalHeight,half=sw/2;
    for(let y=top;y<bottom;y+=2){
      const [l,r]=edges(y+1,p),height=Math.min(2,bottom-y);
      const sy=(y-top)/(bottom-top)*sh,sourceH=height/(bottom-top)*sh;
      ctx.drawImage(texture,0,sy,half,sourceH,left,y,l-left,height);
      ctx.drawImage(texture,half,sy,half,sourceH,r,y,right-r,height);
    }
    ctx.globalAlpha=1;
  }
  function mount(element){
    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;canvas.className='curtain-motion-canvas';canvas.setAttribute('aria-hidden','true');
    const texture=new Image();
    const state={canvas,ctx:canvas.getContext('2d'),texture,progress:0,target:0,frame:0,initialized:false};
    states.set(element,state);element.append(canvas);
    texture.addEventListener('load',()=>paint(state,state.progress),{once:true});
    texture.src='assets/interiors/furniture/curtain-closed-painted-v3.webp';
  }
  function setOpen(element,open){
    const state=states.get(element);if(!state)return;
    const target=open?0:1;
    if(state.initialized&&state.target===target)return;
    const first=!state.initialized;state.initialized=true;state.target=target;
    if(state.frame)cancelAnimationFrame(state.frame);state.frame=0;
    if(first||matchMedia('(prefers-reduced-motion: reduce)').matches){
      state.progress=target;paint(state,target);return;
    }
    const from=state.progress, distance=Math.abs(target-from),started=performance.now();
    if(distance<.001){state.progress=target;paint(state,target);return}
    const ms=Math.max(100,duration*distance);
    function step(now){
      const t=clamp((now-started)/ms),ease=t*t*(3-2*t);
      state.progress=from+(target-from)*ease;paint(state,state.progress);
      state.frame=t<1?requestAnimationFrame(step):0;
    }
    state.frame=requestAnimationFrame(step);
  }
  root.DungeonRentalCurtainMotionV1=Object.freeze({mount,setOpen});
})(window);