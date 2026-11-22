/* Male V3 approved height adjustment: shorten only upper scalp 3 native px.
 * Original 2026-11-21 V3 five-layer PNGs are immutable.
 * Exact pixels as the user's selected "3px" in v3-bald-height-preview.html.
 * Preview geometry y13..31 compressed; pixels y>=32 unchanged, including
 * eyes, mouth, ears, jaw and neck anchor. Hair remains original unscaled art.
 * Roll back by opening ?male-head=v3-original (no save changes).
 */
(function(root){
 'use strict';
 const mode=new URLSearchParams(root.location.search).get('male-head');
 if(mode==='v8'||mode==='v9'||mode==='v3-original')return;
 const original=root.DungeonMaleApprovedV3;
 const corrected=root.DungeonMaleV3CorrectedLayers;
 if(!original||!corrected||corrected.head_base!==original.head_base)return;
 const shortened='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAYAAAC8LWpcAAAFSUlEQVR42u3aW2wUZRTA8f/5ZttSKaUiRFDAgAQiyi1KNIAUUECiIaJPxEYTjBJDxFcxKKA+EEOMoom+QAKp4t3wQAze8IKGwIMG4pUgAYEoCq2tpbtz+Y4PuyXbssVCO23R82vS7ezMfDPnfGe+b3a2YIwxxhhjjDHGmP8b6YuDjry8Rtcvmcms6dcCsHvfIR5//yuONTTKfzYBHYMePW9h0eGVo5/u7JNkSK8HPnd+4bBSHH/hl3J010e9mgjplaBrbysKWEAKh217VS161bMJOfr5J6knw6Ue/Ox5xd3c/m8tfvvc9W37zpp+LeuXzGTk5TXarxNwbvBzS2+oXXyvqI20kuBSC/7WOaV7/Jye7rBcoiLa2kojCY7U6b93c7e27wcJOLf3azsMbiUC06JlPU8lFLZra7OnqyCVClA9T09qFzu/w/6q/bQCOvb+qFmzS0fZ6WjfyexQooF82z1bBemPAaqdX9/a2cBYat9+PAZc8CB2AdNg2oOiSyt+1RKlrqXK/t+3UdXUJoWULoHO5vaOm2gX1qc7Jbpeu/zPW86dB5r2MJDOGHCe+/uuTYPahbvIfl8B2sU5viv3CnopVcClxRLQ3QaeuGN8u+VsU2OPn+TJ4039NwG1M25otzyguuai2klaTne+zrV/EPRnczNLV9zX9wmoX3anjpu/mCmTx3RtWMz9jeaaIWwBH+WDiyM0zuHKK4njXMn9RowYBEAc5vjp11NMXbAIXzXk7Dn0SQLql92pS1fWER8/zMTbZyLVg/NBZs+g2Ra0tQWNmtCMg0xIkm1uf0cXR2i2GRfn8pO9OAKfEMY5Em2AKkgyZSReSTwkCl++u525i+dClOXnXR8AsHRlXbeScNEJqNu8Q7ZtrGfAFcPxQcDV06bRECc8ueYlwmwzThKgHJ+N0DMeafsRh4o7+0BU8KA+nxQRMlGIZB2+IcLlsgTOkf3tCK+9vIXrrxuDG3wFPs6ycNUWjux6hW0b66nbvEP65BKo27xDBt78AK+++AYanmHi1Bsor8jgnAOXQURwGiHEuKKHwYgDyRA1NqAq+YfkhXUuEMQFOI0Rn4BPSDSgpvoyhk6YSHTyBF/s2s3JpqZuBw8QdHcQiZNk3WcHDq099MMvDLtyGAePnaKqwjFy9DWIFH/kdeAKPe8CJChDyjI4TfLviUNQVD0ighSSiHN8v3cPu388wejhw/hw937ufaae2Ht575uD67p7/j32nL2yLNDYQ2UgTBg+hI83raJy6FUESStS6HGc5Cs9yIArx/sYolZEFHFl4AuXAwplFcSuEokbmTL/EY41R7TkQgLnCOOkx867x26EWqNEoiThurGjOHjqL25Zuob933yLAokq6hwQIKpoHKNRCFEOfIL6oq+I1BN78CKsXr2BCXOWc+h0K2Eck3iVngy+RyugozFXVuvxP5p5eNFNPHbfIsZOmpof7eMs4hM8QX4qFEWCcgjKwCvqs+z/7gfWvvAOOw8cYVjVwFS/HkvtVvjw700SepVvjzcx+f5nmbVkBdvfepfEx3gShBjwoIqoggRs3fo2kxY8yowHN6BV1akH32tqbxyvd82YpAMC0QoRff6eaZoceFOjvZs0/PpV3ffcQ1oVBDooEJ05ZZzeXTtVe+vcejW7FeVlumfDcp5+6U2G1lTTmI0JvRKGOZ5atpDap14njOJePSf7B4m+uizakgD0WfDGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYY02/9A4/wjA0OE0skAAAAAElFTkSuQmCC';
 root.DungeonMaleV3HeadShort3=Object.freeze({
  version:'short3-2026-11-22',
  shortenPx:3,
  originalHead:original.head_base,
  adjustedHead:shortened,
  originalScalpTopY:13,
  adjustedScalpTopY:16,
  unchangedFromY:32
 });
 root.DungeonMaleV3CorrectedLayers=Object.freeze({...corrected,head_base:shortened});
})(window);
