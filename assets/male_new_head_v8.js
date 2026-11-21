/* Aligned male head V8a: preserve the exact newly generated face and its
 * ORIGINAL new purple eyes (not V7 or female eyes), eyebrows, nose and mouth.
 * Native 64x160 transparent PNG. Nontransparent head bbox x17..47, y16..51
 * is identical to the approved female face alpha bounding box.
 * The image is realigned ONCE at asset build time with nearest-neighbor
 * sampling; no per-frame CSS scaling or runtime eye substitution.
 * Silver-white hair V8 is in a separate removable transparent asset.
 * V5 runtime key is preserved for expression module compatibility.
 */
window.DUNGEON_MALE_SHARED_FACE_V5="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAMAAACL85puAAABIFBMVEUAAAD8zKn80K/ppYQkDRQYBg316urclnXjnHorERgyFSpKJyXzu5n7+PfPiWrooH09GUMnDiJ0OXiGPojwm+ovJCdYOTN8PYORRJKtVj33wJ1ONktzU051XGGPQi6KV0WWbmDDfWfWv8LXwcPypPHhz9Hl09X2498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmWnzDAAAAYHRSTlMA////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9wH6mAAABkklEQVR42u2V2XKDMAxFkSXjBULI3qb7/v9/WNuxA2nojE1edR4Swsw9yLKCq4phGCYDYySR3M/OU4dtCwCoaFZ8iZAQWKwwMS6ECN8oyxRG4ykdcQZtSgSI43gwtFiQl/AnHxaSvwhSV3lvyN+MDicEAvAldwGugxN518e8EoguWjhcYeY0kPL5swJOjxdhJDO3MApgLPB3EGWRYHh6GscCwXmOY7ZEsIyCUHcsfpYA0upLK9CDYPRZIAjb6GmaaLC2PQlUmcApQr5JNWS+mryAyJAjBtMv7PJG0aB4+pC9XUgZOvAqF7bfvT9C7iiThrqW/cp+xwq+7Krf1TVoyukBCfACu7V3iyhYbFafD14AIqMGguU9OsNhOxJsNy6P7n6WAP0bta7X65+0G+uDy4f7OV1we3eEKdwwNHldBLfaazD/tboHnBBo6ArOtfYqfyw7mlTKPacLVXY2klQXz1dUfkKbQaFnne9uQ7sQf2uquZDU7h9E1S3clmYYhmEYhmEYhmEYhmEYhmEYhmEY5j9+ATyhDCET6qdUAAAAAElFTkSuQmCC";
window.DUNGEON_MALE_FACE_VERSION="v8-new-eyes";
window.dispatchEvent(new Event('dungeon-male-face-ready'));