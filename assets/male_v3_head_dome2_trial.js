/* Experimental rounded dome V2 for male V3 5px head (not default).
 * User requested a rounded top with the previous little peak moving DOWN
 * by ONE native pixel, rather than making the top row wider in place.
 * Open game with ?male-head=v3-dome2 to preview on real paper doll.
 * Prior ?male-head=v3 stays at the approved roundtop V1; original unaffected.
 *
 * Built exclusively from original 64x160 short5 base. Rows:
 * y18: transparent; y19: 12px; y20: 18px; y21: 22px; y22: 26px.
 * Every RGBA pixel y>=21 and all other expression/hair layers unchanged.
 */
(function(root){
  'use strict';
  if(new URLSearchParams(root.location.search).get('male-head')!=='v3-dome2')return;
  const old=root.DungeonMaleV3HeadShort5;
  const corrected=root.DungeonMaleV3CorrectedLayers;
  if(!old||!corrected?.head_base||!old.adjustedHead)return;
  const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAYAAAC8LWpcAAAFLklEQVR42u3ZW2wUVRjA8f85s22plFIuDaCA4RIIyKVEiYZWSiMXCYaIPjU0mmCUGCK+ikEu6gMxxCiYyAskkCriNTwQI8EUsRoCDxCIopJKQEoUhdbW0t25nM+HbWHZdmGl3bbE79eHndmdOTvfd745p3MWlFJKKaWUUkoppZT6XzF99UVjh5XIlhXlVMydBMD4qsVgOr5ehAt1BwGoP97AK198x8WmZnPXJ6BL0AsWJr+yM/CUBNx4FS4cPtRnyTB9EnjlYx2Bk1UCEJKJ+ObrnCfC5DTw+VXdBNzNNnIjCanbnRVxpC5nibA5C/7RBSmfSsqLpL2fti9p56S0VTF3EltWlDN2WIkMuARkJhm2e+v4AZCArr1fmXZvdxOYpOzLLSqh47jONnu7CnJSASK36EnJsvPTzhcZoBWQ3vvjKuZ3H6VkKnHJMFZ0bSDZdu9Wgc35PS+SeTCUtO0u1SI5HxNyNgh2LdkMQd52piBn5Z+bBEh6ad+mCrLq/fTj7oIKyFgF/2k7t72fuzFAbhFYVrOAZHVrDPAKkCynuGymSrmbKuDuognoaQOvPj7lpv14S3OvX+TlxpaBm4DKeTNu2h9UXHJH7URtVzN/Zm9++v2rtZXqNSv7PwG1q5bJ5EXLmT1rQnbDYuIfJNEKfhu4IBlcGCBhAptfSBgmuj1vzJghAIR+gp9/u0LZ4qW4ouHXr6FfElC7aplUr60hbDzH9IXlmOKhySDj15B4G9LehgQtSMxCzCeKtyKpT4dhgMRbsWEiOdkbi+ci/DBBJE1QBFEsj8gJkYNI4NvP9lO1vAqCOL/UfQlA9dqaHiXhjhNQs+uA2butlkEjRuM8j/vmzKEpjHht43b8eCvWREA+Lh4g1xym889YxNjrq0QGB+KSSTGGWOBj4hbXFGATcTxrif9+ng/e280D0yZgh47AhXGWrNvN+br32butlppdB0y/3AI1uw6YwQ8/y453P0L8a0wvm0F+QQxrLdgYxhisBBhCbMrKGMaCiRE0NyFiMCnLg9YzGOthJcS4CFxEJB4lxfcwcup0gsuXOFJXz+WWlh4HD+D1dBAJo2jz4dMNmxrO/ErpqFLOXrxCUYFl7Pj7MSb1ic+C7eh562G8PExeDCtR8j1jMQgiDmMMpiOJWMuPx45S/9Mlxo8u5WD9KZ5+o5bQOfP5ibObe3r9vba4WJjnSeig0DNMHT2cQzvXUTjyXryoHdPR41iTrHQvBjYf50II2jFGMDYPXMftgEBeAaEtxITNzF70IhdbA9oSPp61+GE08BZF24PIBFHEtInjOHvlbx6p3sipEycRIBJBrAU8jAgShkjgQ5AAFyEudXXYETpwxrB+/VamLlhNw9V2/DAkcmJ6M/herYB0E0YVS+Ofrbyw9CFeXrmUiTPLkqN9GMe4CIeXnAqNYLx88PLACeLinPrhDJve+ZSvTp+ntGhwTn8Yydm/wuf+aDG+E3OysYVZz7xJxYo17P/4MyIX4ogwhIADEYwIGI89ez5h5uKXmPfcVqSoOOfB95nKB6fIE/NmyiDPSIEx8vZTcyQ6vU+CYzvF/36HHH/reSnyPBniGSmfPVmerCyTvrq2Ps1uQX6eHN26mte372NkSTHN8RDfCb6fYMOqJVRu+BA/CPv0mvqlvNJXkvv6F+F+T0BqEoB+C14ppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimlBqx/AS20hQmyYI9/AAAAAElFTkSuQmCC';
  root.DungeonMaleV3DomeTrial=Object.freeze({
    version:'v3-dome2-trial',
    originalScalpTopY:18,
    trialScalpTopY:19,
    changedRows:[18,19,20],
    image,
    rollbackHead:old.adjustedHead
  });
  root.DungeonMaleV3CorrectedLayers=Object.freeze({...corrected,head_base:image});
})(window);
