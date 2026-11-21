/* Aligned male head V8c (neutral straight male mouth, head raised 2px): preserve the exact newly generated face and its
 * ORIGINAL new purple eyes (not V7 or female eyes), eyebrows, nose and mouth.
 * Native 64x160 transparent PNG. Nontransparent head bbox x17..47, y14..49
 * is identical to the approved female face alpha bounding box.
 * The neutral mouth is a 4px muted-brown line, replacing the single pixel.
 * Brows/eyes/face translated up 2 native pixels as approved.
 * Brow pixels x24..29 and x35..40 are naturally lengthened (only six new
 * pixels versus V8a). Original new purple eyes and other face pixels unchanged.
 * The image is realigned ONCE at asset build time with nearest-neighbor
 * sampling; no per-frame CSS scaling or runtime eye substitution.
 * Silver-white hair V8 is in a separate removable transparent asset.
 * V5 runtime key is preserved for expression module compatibility.
 */
window.DUNGEON_MALE_SHARED_FACE_V5="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAMAAACL85puAAABIFBMVEUAAAD8zKn80K/ppYQkDRQYBg316urclnXjnHorERgyFSpKJyXzu5n7+PfPiWrooH09GUMnDiJ0OXiGPojwm+ovJCdYOTN8PYORRJKtVj33wJ1ONktzU051XGGPQi6KV0WWbmDDfWfWv8LXwcPypPHhz9Hl09X2498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmWnzDAAAAYHRSTlMA////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9wH6mAAABmklEQVR42u2V2XKDMAxFkSXjhSVkI23aTtL9//+wxphAGh5s8tLO6DwkhJl7kCUHZxnDMP8AYySRbBfnqcayBABUtCi+QhgQmKwwIS6E8N8o0xRGY58OOIM2KQLEadwbSkzIS/iV9wuJXwSpm3xniB9GjTMCAXiKXYDr4Eze9TGuBKKrFo5XGLkbSHX5iwL6xwu/JSNHGAQwFXR3EGWSYHz6sB0TBJd9HLIpglUQ+LpD8YsEMKw+tQI9CiafCQI/RmgLRzBYWxStH2OCwFP4fDHUEPlq6gREhhwhOPzCOm4rGhQv77KxlZS+A2dZ2Wb/9gyxW5k05Lls1vYrVPBp180+z0FTTA9IQCewO/tQBUG1XX88dQIQETUQrB7RGQ67iWC3dXl096ME2L1R83yz+R6msTm4vL8f0wU3uyPM4Q6ZIq6L4FZ7C8a/VlvAGYGGOuFcK2/yx7SjSfWp19PpHAQq7Wwkqa6eryj9hDajQi86391A634dRbYUktr9gyi7h/vSDMMwDMMwDMMwDMMwDMMwDMMwDMP8XX4AJbsMxt9nfnwAAAAASUVORK5CYII=";
window.DUNGEON_MALE_FACE_VERSION="v8-new-eyes";
window.dispatchEvent(new Event('dungeon-male-face-ready'));