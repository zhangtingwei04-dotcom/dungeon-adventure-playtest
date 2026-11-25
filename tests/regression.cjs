// Regression suite: real game files, fresh browser storage, no production data.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'test-results');
fs.mkdirSync(out, { recursive: true });
const browserName = process.env.TEST_BROWSER || 'chromium';
const report = { browser: browserName, checks: [], errors: [] };
async function check(name, fn) {
  try { await fn(); report.checks.push({name, result:'PASS'}); console.log('PASS', name); }
  catch (e) { report.checks.push({name,result:'FAIL',message:String(e.stack||e)}); console.error('FAIL',name,e); }
}
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server = http.createServer((req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(target).pipe(res);
  } catch {res.writeHead(404).end();}
});
async function run(){
 let browser, context, page;
 try {
  await check('All index.html scripts exist and parse',()=>{
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
    let count=0;
    for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
      const src=match[1].match(/\bsrc=["']([^"']+)["']/i);
      if(src){
        assert(!/^https?:/.test(src[1]),'Unexpected external script: '+src[1]);
        const file=path.resolve(root,src[1].split('?')[0]);
        assert(file.startsWith(root+path.sep)&&fs.existsSync(file),'Missing script: '+src[1]);
        const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
        assert.equal(result.status,0,result.stderr||result.error?.message);
      }else new vm.Script(match[2],{filename:'index-inline-'+count+'.js'});
      count++;
    }
    assert(count>10,'Unexpectedly few scripts');
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base='http://127.0.0.1:'+server.address().port;
  assert(['chromium','webkit'].includes(browserName));
  browser=await ({chromium,webkit}[browserName]).launch();
  context=await browser.newContext({viewport:{width:874,height:402},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  page=await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror',err=>report.errors.push({type:'pageerror',message:String(err)}));
  page.on('response',res=>{if(res.status()>=400&&res.url().startsWith(base)&&!res.url().endsWith('/favicon.ico'))report.errors.push({type:'http',message:res.status()+' '+res.url()});});
  await check('Boot, new game, introduction and core registry',async()=>{
    await page.goto(base+'/',{waitUntil:'load',timeout:60000});
    await page.locator('#startBtn').click();
    for(let i=0;i<3;i++) await page.locator('#sceneDialogueNext').click();
    await page.waitForFunction(()=>document.getElementById('startVeil').classList.contains('hidden')&&document.getElementById('sceneDialogue').classList.contains('hidden'));
    const d=await page.evaluate(()=>({registry:window.DungeonEngineV1.diagnostics(),scene:s.scene,clock:s.worldMinutes,save:!!localStorage.getItem(KEY)}));
    assert.equal(d.scene,'wreck');assert.equal(d.clock,960);assert(d.save);
    assert(d.registry.modules.length>=10);
    assert.deepEqual(d.registry.modules.filter(m=>m.state!=='ready'),[]);
    assert.deepEqual(d.registry.faults,[]);
    await page.screenshot({path:path.join(out,browserName+'-start.png')});
  });
  await check('Clock, event dispatch and travel record deduplication',async()=>{
    const r=await page.evaluate(()=>{
      const T=window.DungeonGameTimeV1,E=window.DungeonEventsV1;
      const actor=initial();actor.worldMinutes=1435;
      const event=T.advance(actor,10);const before=actor.worldMinutes;
      T.advance(actor,0);let invalid=false;try{T.advance(actor,-1);}catch{invalid=true;}
      const first=E.appendTravel(actor,'test','regression test'),second=E.appendTravel(actor,'test','regression test');
      const dawn=T.nextMorning(actor);
      return {crossed:event.daysCrossed,before,invalid,first,second,dawn:dawn.after.hour,day:dawn.after.day,errors:E.diagnostics().errors,faults:window.DungeonEngineV1.diagnostics().faults};
    });
    assert.equal(r.crossed,1);assert.equal(r.before,1445);assert(r.invalid&&r.first&&!r.second);assert.equal(r.dawn,8);assert.equal(r.day,3);assert.deepEqual(r.errors,[]);assert.deepEqual(r.faults,[]);
  });
  await check('Weather deterministic, snow accumulation, thaw, water freeze and species rules',async()=>{
    const r=await page.evaluate(()=>{
      const W=window.DungeonWeatherV1;
      const snow=W.snowStep(0,'snow',-2,60),storm=W.snowStep(0,'blizzard',-6,60);
      const ice=W.waterFreezeStep({},-8,180,'snow'),thaw=W.waterFreezeStep(ice,10,180);
      return {stable:JSON.stringify(W.at(123,960))===JSON.stringify(W.at(123,960)),snow,storm,melt:W.snowStep(snow,'clear',15,60),ice,thaw,
       forbidden:['snow','blizzard','storm'].flatMap(kind=>['rabbit','bird','beetle','butterfly'].filter(species=>W.activity(species,{kind,wind:1}))),
       rabbitResidual:W.activity('rabbit',{kind:'clear',snowCover:.2}),rabbitClear:W.activity('rabbit',{kind:'clear',wind:0}),
       bird:W.wildlifeWindMode('bird',.6),beetle:W.wildlifeWindMode('beetle',.6)};
    });
    assert(r.stable);assert(r.storm>r.snow&&r.snow>0&&r.melt<r.snow);
    assert(r.ice.poolIce>r.ice.flowIce&&r.thaw.poolIce<r.ice.poolIce);
    assert.deepEqual(r.forbidden,[]);assert(!r.rabbitResidual&&r.rabbitClear);assert.equal(r.bird,'perch');assert.equal(r.beetle,'ground');
  });
  await check('Character exposure: equipment protection, wetness, indoor drying, unchanged HP',async()=>{
    const r=await page.evaluate(()=>{
      const C=window.DungeonCharacterEnvironmentV1;
      const naked=C.protection({}),cloaked=C.protection({outer:'starter_cloak'});
      const old={wetness:0,comfort:100},rain={kind:'rain',temperature:8,rain:1,wind:.7};
      const a=C.step(old,rain,60,naked),b=C.step(old,rain,60,cloaked),inside=C.step(a,rain,60,naked,true);
      const actor=initial(),hp=actor.hp;C.advance(actor,false,()=>rain);actor.worldMinutes+=60;C.advance(actor,false,()=>rain);
      const first=JSON.stringify(actor.weatherExposure);C.advance(actor,false,()=>rain);
      return {naked,cloaked,a,b,inside,hp,actualHp:actor.hp,stable:first===JSON.stringify(actor.weatherExposure)};
    });
    assert(r.cloaked.warmth>r.naked.warmth&&r.cloaked.waterproof>r.naked.waterproof);
    assert(r.a.wetness>r.b.wetness&&r.inside.wetness<r.a.wetness);assert.equal(r.hp,r.actualHp);assert(r.stable);
  });
  await check('Landscape controls and weather/time previews do not change real game state',async()=>{
    const snapshot=()=>page.evaluate(()=>({minute:s.worldMinutes,hp:s.hp,scene:s.scene,exposure:JSON.stringify(s.weatherExposure),saved:localStorage.getItem(KEY)}));
    const before=await snapshot();
    for(const kind of ['clear','cloudy','fog','drizzle','rain','storm','snow','blizzard']){
      await page.locator('#hudWeatherBtn').click();
      await page.locator('[data-preview-weather="'+kind+'"]').click();
      assert.equal(await page.locator('#app').getAttribute('data-weather'),kind);
      if(['snow','blizzard','storm'].includes(kind)){
        assert.equal(await page.locator('#sceneStage [data-wildlife]').count(),0,'Wildlife remains during '+kind);
      }
    }
    await page.screenshot({path:path.join(out,browserName+'-blizzard.png')});
    for(const period of ['dawn','day','dusk','night']){
      await page.locator('#hudWeatherBtn').click();
      await page.locator('[data-preview-period="'+period+'"]').click();
      assert.equal(await page.locator('#app').getAttribute('data-period'),period);
      assert.equal(await page.locator('#app').getAttribute('data-weather'),'blizzard');
      assert.equal(await page.locator('#sceneStage [data-wildlife]').count(),0,'Wildlife respawned after period change');
    }
    await page.locator('#timePreviewTag').click();
    assert.deepEqual(await snapshot(),before);
    for(const id of ['sceneStage','topGameHud','placeDrawer','travelFeed']){
      const box=await page.locator('#'+id).boundingBox();assert(box&&box.width>0&&box.height>0,id+' missing');
      assert(box.x>=-2&&box.y>=-2&&box.x+box.width<=876&&box.y+box.height<=404,id+' outside landscape');
    }
    for(const tab of ['character','equipment','inventory','locations']){
      await page.locator('[data-info-tab="'+tab+'"]').click();
      assert.equal(await page.locator('[data-info-tab="'+tab+'"]').getAttribute('aria-selected'),'true');
    }
    await page.screenshot({path:path.join(out,browserName+'-landscape.png')});
  });
  await check('Reload resumes save, legacy migration, invalid save protection',async()=>{
    const before=await page.evaluate(()=>({scene:s.scene,minute:s.worldMinutes,hp:s.hp}));
    await page.reload({waitUntil:'load',timeout:60000});
    await page.locator('#continueBtn').click();
    const actual=await page.evaluate(()=>({scene:s.scene,minute:s.worldMinutes,hp:s.hp}));
    assert.deepEqual(actual,before);
    const result=await page.evaluate(()=>{
      const S=window.DungeonSaveV1,actor=initial();delete actor.engineSave;
      const migrated=S.prepare(actor,names);
      const invalid={...actor,hp:'bad'};
      let rejected=false;try{S.prepare(invalid,names);}catch{rejected=true;}
      let raw='{corrupted';const storage={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};
      try{const read=S.read(storage,'fake',names);const wrote=S.write(storage,'fake',actor,names);return {schema:migrated.engineSave.schema,unchanged:!actor.engineSave,rejected,read,wrote,raw,protected:S.diagnostics().writeProtected};}finally{S.allowReplacement();}
    });
    assert.equal(result.schema,1);assert(result.unchanged&&result.rejected&&result.protected);assert.equal(result.read,null);assert.equal(result.wrote,false);assert.equal(result.raw,'{corrupted');
  });
  await check('No uncaught browser errors or missing local resources',()=>assert.deepEqual(report.errors,[]));
 } finally {
  if(page&&report.checks.some(c=>c.result==='FAIL'))await page.screenshot({path:path.join(out,browserName+'-failure.png')}).catch(()=>{});
  if(context)await context.close();
  if(browser)await browser.close();
  if(server.listening)await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(out,browserName+'-report.json'),JSON.stringify(report,null,2));
 }
 if(report.checks.some(c=>c.result==='FAIL'))process.exitCode=1;
}
run().catch(e=>{console.error(e);process.exitCode=1;});
