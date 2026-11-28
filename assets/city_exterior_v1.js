/* Shared exterior core: location identity, camera direction, clock, weather and light. */
(function(root){
'use strict';
const area=Object.freeze({id:'residential-quarter',weatherSeed:'city-opening-v1',weatherScene:'home',style:'timber-stone-medieval',calendarMode:'fixed-daylight',streetId:'rental-street',corridorId:'rental-corridor',roomFloor:2});
// Relative directions are provisional until the town map is authored.
const views=Object.freeze({
 window:Object.freeze({id:'rental-window',area:area.id,direction:'rear',distance:'town-skyline',asset:'assets/interiors/rental-room/reference/window-clean-v1.svg'}),
 door:Object.freeze({id:'rental-door',area:area.id,direction:'right',distance:'interior-near',destination:area.corridorId,presentation:'shadow-only'}),
 corridor:Object.freeze({id:area.corridorId,area:area.id,floor:2,asset:'assets/interiors/rental-room/corridor-v1.svg',assetStatus:'layout-prototype',returnsTo:'rental-room',stairsTo:area.streetId}),
 street:Object.freeze({id:area.streetId,area:area.id,direction:'street-level',distance:'street-full',returnsTo:area.corridorId,assetStatus:'placeholder'})
});
  function ambient(worldMinutes, kind) {
    const hour = ((worldMinutes % 1440 + 1440) % 1440) / 60;
    const keys = [
      [0, .025, [55,65,84]], [5, .025, [55,65,84]],
      [6, .12, [156,126,103]], [8, .25, [235,207,163]],
      [12, .32, [244,225,188]], [16, .26, [236,207,160]],
      [18, .14, [194,132,89]], [19, .05, [91,99,126]],
      [21, .025, [55,65,84]], [24, .025, [55,65,84]]
    ];
    let i=1;while(i<keys.length-1&&hour>keys[i][0])i++;
    const a=keys[i-1],b=keys[i],t=(hour-a[0])/(b[0]-a[0]);
    const factor=({clear:1,cloudy:.65,fog:.58,drizzle:.52,rain:.43,storm:.27,snow:.72,blizzard:.4})[kind]??.65;
    const strength=(a[1]+(b[1]-a[1])*t)*factor;
    const color=a[2].map((v,j)=>Math.round((v+(b[2][j]-v)*t)*(.52+.48*factor)));
    const daylight=Math.max(0,Math.min(1,((a[1]+(b[1]-a[1])*t)-.025)/.295));
    return {strength,color,edge:color.map(v=>Math.round(v*.46)),
      outsideBrightness:.10+.98*Math.sqrt(daylight)*factor,
      outsideOpacity:1,
      outsideSaturation:.40+.55*Math.sqrt(daylight),
      outsideBlur:kind==='fog'||kind==='blizzard'?.65:kind==='storm'||kind==='rain'?.2:0
    };
  }

function sample(weather,worldMinutes,preview='auto'){
 const actual=weather.at(area.weatherSeed,worldMinutes,area.weatherScene);
 const visible=preview==='auto'||!weather.kinds[preview]?actual:{...actual,snow:0,overcast:0,...weather.kinds[preview],kind:preview};
 const light=ambient(worldMinutes,visible.kind);
 const hour=((worldMinutes%1440+1440)%1440)/60;
 const darkness=Math.max(0,1-(light.outsideBrightness-.1)/.98);
 return {area:area.id,worldMinutes,hour,actual,visible,light,
   windowShade:Math.max(0,Math.min(.78,darkness*.78)),
   streetBrightness:Math.max(.14,light.outsideBrightness)};
}
root.DungeonCityExteriorV1=Object.freeze({version:'1.2.0',area,views,ambient,sample});
})(window);
