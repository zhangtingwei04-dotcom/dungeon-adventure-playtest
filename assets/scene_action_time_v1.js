/* Shared game-clock costs for scene interactions; presentation time is separate. */
(function(root){
 'use strict';
 const minutes=Object.freeze({inspect:2,observe:2,approach:3,mushroom:3,wood:2,fiber:4,crate:3,leaf:3,stone:2,default:3,capture:5});
 function cost(kind){return minutes[kind]??minutes.default;}
 function openingExitOnly(actor,opening){return actor?.scene==='wreck'&&!actor.flags?.rescued&&!!opening?.exhausted;}
 root.DungeonSceneActionTimeV1=Object.freeze({version:'1.0.0',cost,openingExitOnly});
})(window);
