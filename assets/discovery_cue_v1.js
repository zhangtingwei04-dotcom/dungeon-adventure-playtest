/* Discovery cues derive from existing gameplay state. No independent rewards. */
(function(root){
 'use strict';
 const styles=Object.freeze({
 material:Object.freeze({symbol:'✦',label:'可調查',kind:'material'}),
 route:Object.freeze({symbol:'➜',label:'新道路',kind:'route'}),
 clue:Object.freeze({symbol:'◇',label:'新發現',kind:'clue'}),
 rare:Object.freeze({symbol:'✧',label:'不尋常的生物',kind:'rare'})
 });
 function object({pending=0,rare=false,observed=false,clue=false}={}){
  if(pending>0)return styles.material;
  if(rare&&!observed)return styles.rare;
  if(clue&&!observed)return styles.clue;
  return null;
 }
 function route(known,visited){return known&&!visited?styles.route:null;}
 function summary({routeName='',wreck=false,materials=0,encounters=[]}={}){
  const parts=[];
  if(routeName)parts.push('發現道路：'+routeName);
  if(wreck)parts.push('發現舊馬車殘骸');
  if(materials>0)parts.push('發現 '+materials+' 處可調查材料');
  for(const label of encounters.slice(0,2))parts.push('發現'+label);
  return parts.slice(0,3);
 }
 root.DungeonDiscoveryCueV1=Object.freeze({object,route,summary});
})(window);
