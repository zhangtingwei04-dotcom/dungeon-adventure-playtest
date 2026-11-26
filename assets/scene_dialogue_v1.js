window.DungeonSceneDialogueV1 = {
 create({ $, syncDialogueInputLock, endLabels, onComplete }) {
  const flow=window.LanternEventFlowV1.create();
  const sceneDialogueState={lines:[],index:0,open:false,purpose:null,choices:[],generation:0};
  function renderSceneDialogue(){
   const box=$('sceneDialogue');
   if(!sceneDialogueState.open||!sceneDialogueState.lines.length){
    box.classList.add('hidden');$('app').classList.remove('scene-dialogue-active');syncDialogueInputLock();return;
   }
   const line=sceneDialogueState.lines[sceneDialogueState.index];
   const portraitCode=line.portrait||(line.speaker==='你'?'protagonist':null);
   const portraitUrl=line.image||(portraitCode==='protagonist'?window.DUNGEON_PROTAGONIST_PORTRAIT:null);
   const hasPortrait=Boolean(portraitUrl);
   const portrait=$('sceneDialoguePortrait');
   portrait.hidden=!hasPortrait;
   box.classList.toggle('has-speaker-portrait',hasPortrait);
   if(hasPortrait){
    const pic=$('sceneDialoguePortraitImage');
    if(pic.src!==portraitUrl)pic.src=portraitUrl;
   }
   $('sceneDialogueName').textContent=line.speaker;
   $('sceneDialogueText').textContent=line.text;$('sceneDialogueText').scrollTop=0;
   const last=sceneDialogueState.index===sceneDialogueState.lines.length-1;
   $('sceneDialogueNext').textContent=last?(endLabels[sceneDialogueState.purpose]?.[0]||'結束對話'):'點擊繼續';
   $('sceneDialogueNext').setAttribute('aria-label',last?(endLabels[sceneDialogueState.purpose]?.[1]||'結束場景對話'):'下一句');
   const options=$('sceneDialogueChoices');
   options.replaceChildren();
   const choices=last?sceneDialogueState.choices:[];
   options.hidden=!choices.length;
   $('sceneDialogueNext').hidden=!!choices.length;
   for(const choice of choices){
    const button=document.createElement('button');button.type='button';button.textContent=choice.label;
    const generation=sceneDialogueState.generation;
    const eventId=flow.status()?.id;
    button.onclick=()=>{if(!sceneDialogueState.open||sceneDialogueState.generation!==generation||sceneDialogueState.index!==sceneDialogueState.lines.length-1)return;flow.resolve(eventId,()=>{closeSceneDialogue();choice.fn?.();});};
    options.appendChild(button);
   }
   box.classList.remove('hidden');
   $('app').classList.toggle('scene-dialogue-active',sceneDialogueState.purpose!=='dock-feedback');
   syncDialogueInputLock();
  }
  function openSceneDialogue(lines,purpose=null,choices=[]){
   if(!Array.isArray(lines)||!lines.length)return;
   const validLines=lines.filter(line=>line&&typeof line.text==='string'&&line.text.trim()).map(line=>({
    speaker:String(line.speaker||'旁白').slice(0,24),text:line.text,
    portrait:line.portrait==='protagonist'?'protagonist':null,image:line.image||null
   }));
   if(!validLines.length)return;
   flow.begin(purpose);
   sceneDialogueState.generation++;
   sceneDialogueState.lines=validLines;
   sceneDialogueState.index=0;sceneDialogueState.open=true;sceneDialogueState.purpose=purpose;sceneDialogueState.choices=choices;renderSceneDialogue();
  }
  function closeSceneDialogue(){
   flow.cancel();
   sceneDialogueState.generation++;
   sceneDialogueState.open=false;sceneDialogueState.lines=[];sceneDialogueState.index=0;sceneDialogueState.purpose=null;sceneDialogueState.choices=[];
   renderSceneDialogue();
  }
  function nextSceneDialogue(){
   if(!sceneDialogueState.open)return;
   if(sceneDialogueState.index<sceneDialogueState.lines.length-1){
    sceneDialogueState.index++;renderSceneDialogue();
   }else if(!sceneDialogueState.choices.length){const purpose=sceneDialogueState.purpose;flow.resolve(flow.status()?.id,()=>{closeSceneDialogue();onComplete(purpose);});}
  }
  return {sceneDialogueState, openSceneDialogue, closeSceneDialogue, nextSceneDialogue, eventFlow:flow};
 }
};
