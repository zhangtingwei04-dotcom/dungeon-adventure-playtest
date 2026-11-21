/* Aligned male head V8b (natural 6px eyebrows): preserve the exact newly generated face and its
 * ORIGINAL new purple eyes (not V7 or female eyes), eyebrows, nose and mouth.
 * Native 64x160 transparent PNG. Nontransparent head bbox x17..47, y16..51
 * is identical to the approved female face alpha bounding box.
 * Brow pixels x24..29 and x35..40 are naturally lengthened (only six new
 * pixels versus V8a). Original new purple eyes and other face pixels unchanged.
 * The image is realigned ONCE at asset build time with nearest-neighbor
 * sampling; no per-frame CSS scaling or runtime eye substitution.
 * Silver-white hair V8 is in a separate removable transparent asset.
 * V5 runtime key is preserved for expression module compatibility.
 */
window.DUNGEON_MALE_SHARED_FACE_V5="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAMAAACL85puAAABIFBMVEUAAAD8zKn80K/ppYQkDRQYBg316urclnXjnHorERgyFSpKJyXzu5n7+PfPiWrooH09GUMnDiJ0OXiGPojwm+ovJCdYOTN8PYORRJKtVj33wJ1ONktzU051XGGPQi6KV0WWbmDDfWfWv8LXwcPypPHhz9Hl09X2498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmWnzDAAAAYHRSTlMA////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9wH6mAAABlElEQVR42u2V2XKDMAxFkSWDbZaQjbTpvv//H9Y4JpCGzsjkVechIczcgyw5OMsEQRAYWKuJdLc4Tw1WFQBgQYviK4QBhckKG+NKqfCNOk1hDZ7SEW8wNkWAOI0HQ4UJeQ1/8mEh/EVQcZXvDfxhNDgjUIAv3AX4Ds7kfR95JRBdtHC8QuZuoKLPnxVwerwKW5I5wiiAqaC/g6iTBOPTh+2YIDjv45hNEayiINQdi18kgGH1qRWYUTD5TBCEMUJXeqLBubLswhgTBIEy5MuhBuarqRcQWfLE4PALG95WtKiePnTraq1DB1517dr9+yNwtzIZyHPdrt13rODLrdt9noMhTg9IQS9wO3dXR0G9XX8+9AJQjBoIVvfoDYfdRLDb+jz6+ywB9m/UPN9sfoZpbA4+H+5zuuBnd4Q5/CFT8roIfrXXIP+12gHOCAw0CedadZU/ph1NxZB7Hi6KtLORdHHx/ILST2g7Ksyi890PtAnxtzJbCmnj/0GU3cJtaUEQBEEQBEEQBEEQBEEQBEEQBEEQ/uMXE7UMaF9ybeEAAAAASUVORK5CYII=";
window.DUNGEON_MALE_FACE_VERSION="v8-new-eyes";
window.dispatchEvent(new Event('dungeon-male-face-ready'));