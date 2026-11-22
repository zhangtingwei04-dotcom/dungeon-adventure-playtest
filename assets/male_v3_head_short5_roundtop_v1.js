/* Surgical correction to the user-selected 5px-shorter male V3 scalp.
 * Original approved V3, 5px scalp, eyebrows, eyes, mouth and hair are untouched.
 * Only rows y18..19 are recontoured, preserving native 64×160 pixel grid:
 * scalp widths on y18/y19/y20/y21 are now 10/16/20/22 (was 6/12/20/22).
 * Every RGBA pixel at y>=20 (including face, ears, jaw and neck) is unchanged.
 * To compare with before rounding: ?male-head=v3-flat5
 * To compare with original height: ?male-head=v3-original
 */
(function(root){
  'use strict';
  const mode=new URLSearchParams(root.location.search).get('male-head');
  if(mode==='v8'||mode==='v9'||mode==='v3-original'||mode==='v3-flat5')return;
  const corrected=root.DungeonMaleV3CorrectedLayers;
  const short5=root.DungeonMaleV3HeadShort5;
  if(!corrected||!short5||corrected.head_base!==short5.adjustedHead)return;
  const rounded='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAYAAAC8LWpcAAAFPElEQVR42u3ZW2wUVRzH8e85s22plFIuDaCA4RIIyKVEiQYqBeUiwRDRp4ZGE4wSQ8RXMchFfSCGGAUTeYEEUkVUNDwQgxJLsBoCDxCIopJKQEoUhdaupbtzOX8fti1ll9ZKu9ui/0+TZnZ3dmb+//ObM7uzoJRSSimllFJKKaX+X0wudzZ6SIlsWTGX8tkTABj7yBIALn51CIDaE3W8/Nk3XGpoNP+ZBmQUPX8RGJPaddvepfWfCBePfJnTZpjcFb7wxu66aEDbExePHM5JI2xOiq949EaR7bpYltb3AOWzJ7BlxVxGDymRfp+AjMLnLWgd6bSRT19OG/32ZZFUGo7WZC0NNmvFPzw/c4RvmYLM0U9PRdu2spEGS9Z1FvXeWr8fNCBz9Cs6RLiTkZcOj6WLJLSu17bN3k5BVhIgXU140s3BT3u/SD9NQProjymfd+sqpbOISydzReYGUtvu3RTYrJ/zIp1PhpK2nJEWyfqckLVJMDOynRT5j1cKshb/7DRA0qP9Dyno1uinr3cHJKDTFPyr5eyOfvbmAOmisG5dBaRbp0Y/T4B08xLXnUul3EkJuLNoA3q6gVcem3TT40RTY68f5JX6pv7bgIo50256PKC45La2EzVf6/w1e/O33z/icSrXrOz7BlSvWiYTFy1n5oxx3ZsWk38hyTj4zeCCVHFhgIRJbH4hYZi85ftGjRoEQOgn+fGXq5QtXoorGtp+DH3SgOpVy6RybRVh/XmmLpyLKR6cKjJxHUk0Iy3NSNCExCzEfKJEHOn47TAMkEQcGyZTF3tj8VyEHyaJpAGKIIrlETkhchAJfL3/AAuWL4AgwU81nwNQubaqR0247QZU7Tpo9m6rZsCwkTjP455Zs2gII17duB0/EceaCMjHJQLkusO0/RmLGNt+l8jgQFyqKcYQC3xMwuIaAmwygWctiV8v8P67u7lvyjjs4GG4MMGSdbu5UPMee7dVU7XroOmTU6Bq10Ez8MFn2PHOh4h/nall08gviGGtBRvDGIOVAEOI7XBnDGPBxAgaGxAxGG68Zj2DsR5WQoyLwEVE4lFSfBfDJ08luHKZozW1XGlq6nHxAF5PJ5EwijYfOVO3qe7sz5SOKOXcpasUFVhGj70XYzp+47NgW0feehgvD5MXw0qUes5YDIKIwxiDaW0i1vL98WPU/nCZsSNL+aL2NE+9Xk3onPn05LnNPT3+Xru5WJjnSeig0DNMHjmUwzvXUTj8bryoBdM64liTSroXA5uPcyEELRgjGJsHrvV0QCCvgNAWYsJGZi56gUvxgOakj2ctfhj1v5uiLUFkgihiyvgxnLv6Jw9VbuT0yVMIEIkg1gIeRgQJQyTwIUiCixDX8e6wI3TgjGH9+q1Mnr+aumst+GFI5MT0ZvG9moB040YUS/3vcZ5f+gAvrVzK+Ollqdk+TGBchMNLXQqNYLx88PLACeISnP7uLJve/oRDZy5QWjQwq78OZe2j8PnfmozvxJyqb2LG029QvmINBz7aT+RCHBGGEHAgghEB47Fnz8dMX/wic57dihQVZ734nKm4f5I8Pme6DPCMFBgjbz05S6Iz+yQ4vlP8b3fIiTefkyLPk0GekbkzJ8oTFWWSq2PLaXcL8vPk2NbVvLZ9H8NLimlMhPhO8P0kG1YtoWLDB/hBmNNj6pN4pd9J7oufxfu0AR2bAPRZ8UoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSinVb/0NqeeNDaA+/VsAAAAASUVORK5CYII=';
  root.DungeonMaleV3RoundTop5=Object.freeze({
    version:'short5-rounded-top-v1',
    heightPx:5,scalpTopY:18,modifiedRows:[18,19],
    originalHead:short5.adjustedHead,roundedHead:rounded
  });
  root.DungeonMaleV3CorrectedLayers=Object.freeze({...corrected,head_base:rounded});
})(window);
