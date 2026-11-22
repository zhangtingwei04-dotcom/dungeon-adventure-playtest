/* Aligned male head V8d (V8c art moved DOWN 1 native pixel): preserve the exact newly generated face and its
 * ORIGINAL new purple eyes (not V7 or female eyes), eyebrows, nose and mouth.
 * Native 64x160 transparent PNG. Nontransparent head bbox x17..47, y15..50
 * follows the approved V8c head +1px downward without resizing.
 * The neutral mouth is a 4px muted-brown line, replacing the single pixel.
 * Brows/eyes/mouth move together: net 1px above the female anchor.
 * Brow pixels x24..29 and x35..40 are naturally lengthened (only six new
 * pixels versus V8a). Original new purple eyes and other face pixels unchanged.
 * The image is realigned ONCE at asset build time with nearest-neighbor
 * sampling; no per-frame CSS scaling or runtime eye substitution.
 * Silver-white hair V8 is in a separate removable transparent asset.
 * V5 runtime key is preserved for expression module compatibility.
 */
window.DUNGEON_MALE_SHARED_FACE_V5="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAMAAACL85puAAABIFBMVEUAAAD8zKn80K/ppYQkDRQYBg316urclnXjnHorERgyFSpKJyXzu5n7+PfPiWrooH09GUMnDiJ0OXiGPojwm+ovJCdYOTN8PYORRJKtVj33wJ1ONktzU051XGGPQi6KV0WWbmDDfWfWv8LXwcPypPHhz9Hl09X2498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmWnzDAAAAYHRSTlMA////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9wH6mAAABmUlEQVR42u2V2XKDMAxFkSXjhSVkI23aTtL9//+wxphAGh5sMn2qzkNCmLkHWXJwljEM8x8wRhLJdnGeaixLAEBFi+IrhAGByQoT4kII/40yTWE09umAM2iTIkCcxr2hxIS8hF95v5D4RZC6yXeG+GHUOCMQgKfYBbgOzuRdH+NKILpq4XiFkbuBVJe/KKB/vPBbMnKEQQBTQXcHUSYJxqcP2zFBcNnHIZsiWAWBrzsUv0gAw+pTK9CjYPKZIPBjhLZwBIO1RdH6MSYIPIXPF0MNka+mTkBkyBGCwy+s47aiQfHyLhtbSek7cJaVbfZvzxC7lUlDnstmbb9CBZ923ezzHDTF9IAEdAK7sw9VEFTb9cdTJwARUQPB6hGd4bCbCHZbl0d3P0qA3Rs1zzeb72Eam4PL+/sxXXCzO8Ic7pAp4roIbrW3YPxrtQWcEWioE8618iZ/TDuaVJ96PZ3OQaDSzkaS6ur5itJPaDMq9KLz3Q207tdRZEshqd0/iLJ7uC/NMAzDMAzDMAzDMAzDMAzDMAzDMMyf8QPnegzGm+Uv4QAAAABJRU5ErkJggg==";
window.DUNGEON_MALE_FACE_VERSION="v8-new-eyes";
window.dispatchEvent(new Event('dungeon-male-face-ready'));