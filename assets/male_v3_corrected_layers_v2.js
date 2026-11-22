/* Fix V3 mislabelled eyebrows: the old "eyebrows" contained black upper eyelids/lashes,
 * visually forming half the eyes. Merge it into EYES and draw proper separate subtle
 * BROWS above them at y29..30; bangs (drawn last) naturally cover the brows.
 * The approved scalp, original eye pigments, mouth and hair stay byte-for-byte unchanged.
 * Both new sprites have native 64x160 RGBA transparent coordinates.
 */
(function(root){
 'use strict';
 const source=root.DungeonMaleApprovedV3;
 if(!source)return;
 root.DungeonMaleV3CorrectedLayers=Object.freeze({...source,
  eyebrows:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAYAAAC8LWpcAAAAiUlEQVR4nO3PsQmEQBAF0DmwCgMbsIMN7MHMxAKsyAIuMbMHA8FGrMNEwUw42EDuvWw+8wcmAgAAAAAAAOAPfHIe75u03+fvspY5e78och3um7SnutoiIoZxaq/s6Zn7zjh08xk/9gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXusAP5gaOGb/ro0AAAAASUVORK5CYII=',
  eyes:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAYAAAC8LWpcAAAB30lEQVR4nO3UO2sUURjG8efMrDObvWRvbFx2jJgEoxYaDbGQWHgJWAiBSNBKCPsJRL+DXSrFSsTCxsZK7AQrS0H8CKIRUfGyjjObDa9NYhU3suyAxf8HBw4vPIfzvhyOBAAAAAAAAAAAAAAAMISp9qTtVq8Uxnet7+XgeGOo3L/wsjg0TbqSZDvLc84k6Vv83TUr5YHN5Pfl/uR8z7NSENrN5Wl1VlYyG8JI1YoluzIfmSQtHj5jJ6I5i+oty+dCWzo5M7CJQuBbORizo60jthCdtenycXtwa83Kvm9TrXYmAxj5C/iVJnry6p2TpKpNqu6mNdtYUM3qCqqHBmbj3pY7NnFRXlrUmGoKek111h+6ezdWlQv9UV9VUgYDSPp9t7NPN3va7MfKeXltbG24Zy+eu0FZSUq+/FTc76roKgpdIEm6vv7YNavVUV9VUkZ/gCQlSWzzs0tq759R+uOrlqOOpUk88Bn3up/twtwlfYo/6PzpyzpQi9Tfzrx8/WbP4Q0jl8WhkpTPF5wk3bn6yMJTi3rb/ahwu/Y3Qanhzk2s2u1rd+U76en7+3LOZdI4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAf+c3AyZ5+9ofGOMAAAAASUVORK5CYII='
 });
})(window);
