const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const context=vm.createContext({window:{}});
for(const file of ['character_environment_v1.js','weather_system_v1.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',file),'utf8'),context);
const {DungeonCharacterEnvironmentV1:e,DungeonWeatherV1:w}=context.window;
const rain={kind:'rain',temperature:-6,wind:1,rain:.8},at=()=>rain;
const clothed={seed:1,worldMinutes:0,equipmentV1:{chest:'starter_tunic',legs:'starter_trousers',outer:'starter_cloak',feet:'starter_boots',hands:'starter_gloves'},hp:16};
const bare={seed:1,worldMinutes:0,equipmentV1:{},hp:16};
for(const s of [clothed,bare]){e.advance(s,false,at);s.worldMinutes=60;e.advance(s,false,at);}
const a=e.snapshot(clothed,rain),b=e.snapshot(bare,rain);
assert(a.felt>b.felt&&a.wetness<b.wetness&&a.comfort>b.comfort);
const same=JSON.stringify(clothed.weatherExposure);e.advance(clothed,false,at);assert.equal(JSON.stringify(clothed.weatherExposure),same);
const previous=e.snapshot(clothed,rain);clothed.equipmentV1={};e.advance(clothed,false,at);assert.equal(clothed.weatherExposure.wetness,previous.wetness);assert(e.snapshot(clothed,rain).felt<previous.felt);
e.advance(clothed,true,at);clothed.worldMinutes+=60;e.advance(clothed,true,at);assert(clothed.weatherExposure.wetness<previous.wetness);assert(clothed.weatherExposure.comfort>previous.comfort);assert.equal(clothed.hp,16);
const old={worldMinutes:90,weatherExposure:{minute:90,wetness:33,comfort:71,indoor:false}};e.advance(old,false,at);assert.equal(old.weatherExposure.wetness,33);assert.equal(old.weatherExposure.comfort,71);
const live={seed:2,worldMinutes:960,equipmentV1:{outer:'starter_cloak'},hp:16};w.exposure(live,false);live.worldMinutes+=180;w.exposure(live,false);assert.equal(live.weatherExposure.version,1);
const saved=JSON.stringify(live.weatherExposure);w.exposure(live,false);assert.equal(JSON.stringify(live.weatherExposure),saved);
console.log('Character environment regression tests passed.');
