/* Male V3 head height: selected short5 (2026-11-22).
 * Original approved V3 five layers remain immutable in male_approved_v3_layers.js.
 * Generated with EXACT same compressScalp(base,5) geometry as compare preview:
 * original scalp y13 -> y18; only y13..31 adjusted; y>=32 unchanged.
 * Eyes, eyes/lashes, brows, mouth, ears, jaw, neck anchor, hair, animations,
 * outfits and saved data remain at their original coordinates.
 * Roll back using ?male-head=v3-original.
 */
(function(root){
 'use strict';
 const mode=new URLSearchParams(root.location.search).get('male-head');
 if(mode==='v8'||mode==='v9'||mode==='v3-original')return;
 const original=root.DungeonMaleApprovedV3;
 const corrected=root.DungeonMaleV3CorrectedLayers;
 if(!original||!corrected||corrected.head_base!==original.head_base)return;
 const shortened='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAYAAAC8LWpcAAAFKUlEQVR42u3ZWWxUVRjA8f85d6alUkpZGkABwxIIyFKiRAOVgiJIMET0qaHRBKPEEPFVDLKoD8QQo2AiL5BAqoiKhgdiMMQSrIbAAwSiqKQSlBJFobVj6cxdzufDdGPKlEo7bdHv16Q5t3O3b7nn9t4BpZRSSimllFJKKfX/YvrjoGOHFcvWlfMpmzsJgJqTtbzy+Tdcqm8w/9kEZAY9/pGlHQ4v/PLV4X5JhumzgBcubj+cMelxe/zpXyLtCTl6pE8SYvsk+PJH24Ns08VYWrYByuZOYuvK+YwdViwDvgM6Bb5gUUulMyqfOc6ofttYJN0Nx6pz1g02Z8E/vLBzhW/aBZ2rn9kVrfvKRTfY3E8z2Vq9t9YfAAnoXP3yDi2cpfLSYVm66ISW9Vr32dtdkJMOkK4mPOlm8TO2FxmgHZBZ/XFlC24epWRrcckyV3TeQXrfvdsFNufXvEj2yVAyxp26RXI+J+RsEuzcslmCvOWdgpy1f24SIJmtfYsu6Fb1M9e7Azogaxf8q3Fuq5+7OUC6CKxbdwHp1qUxwDtAunmL686tUu6kDrizaAJ6uoNXH59yw3KysaHXT/JKXePATUD5vBk3LA8qKr6t/URN17J/Zm98+v0zkaBi7ar+T0DV6uUy+bEVzJ41oXvTYupvJJUAvwlckA4uDJAwhc0rIAxTN91uzJghAIR+ih9/vUrpkmW4wuFt59AvCahavVwq1lUS1l1g+uL5mKKh6SCT15FkE9LchASNSMxCzCdKJpCOT4dhgCQT2DCVvtkbi+ci/DBFJPVQCFEsTuSEyEEk8PWBgyxasQiCJD9VfwFAxbrKHiXhthNQufuQ2be9ikEjRuM8j3vmzKE+jHht0w78ZAJrIiAPlwyQ6w7T+mMsYmzbWyKDA3HppBhDLPAxSYurD7CpJJ61JH+7yAfv7eG+aROwQ0fgwiRL1+/hYvX77NteReXuQ6ZfLoHK3YfM4AefZee7HyH+daaXziAvP4a1FmwMYwxWAgwhtsObMYwFEyNoqEfEYGj/zHoGYz2shBgXgYuIxKO46C5GTp1OcOUyx6pruNLY2OPgAbyeTiJhFG05erZ2c+25nykZVcL5S1cpzLeMHX8vxnR84rNgWypvPYwXx8RjWInSfzMWgyDiMMZgWpKItXx/4jg1P1xm/OgSvqw5w9NvVBE6Zz47dX5LT8+/114uFsQ9CR0UeIapo4dzZNd6CkbejRc1Y1oqjjXpTvdiYPNwLoSgGWMEY+PgWi4HBOL5hLYAEzYw+7EXuZQIaEr5eNbih9HAeynaHEQmiCKmTRzH+at/8VDFJs6cOo0AkQhiLeBhRJAwRAIfghS4CHEd3w47QgfOGDZs2MbUhWuovdaMH4ZETkxvBt+rHZBpwqgiqfsjwQvLHuDlVcuYOLM0PduHSYyLcHjpW6ERjJcHXhycIC7Jme/OsfmdTzl89iIlhYNz+i1Rzv4VvvB7o/GdmNN1jcx65k3KVq7l4McHiFyII8IQAg5EMCJgPPbu/YSZS15i3nPbkMKinAffZ8rvnyJPzJspgzwj+cbI20/NkejsfglO7BL/251y8q3npdDzZIhnZP7syfJkean01bn1aXbz8+JyfNsaXt+xn5HFRTQkQ3wn+H6KjauXUr7xQ/wg7NNz0q/H++uyaE0C0G/BK6WUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppdSA9Q+sQIcNihyerQAAAABJRU5ErkJggg==';
 root.DungeonMaleV3HeadShort5=Object.freeze({
  version:'short5-2026-11-22',
  shortenPx:5,
  originalHead:original.head_base,
  adjustedHead:shortened,
  originalScalpTopY:13,
  adjustedScalpTopY:18,
  unchangedFromY:32
 });
 root.DungeonMaleV3CorrectedLayers=Object.freeze({...corrected,head_base:shortened});
})(window);
