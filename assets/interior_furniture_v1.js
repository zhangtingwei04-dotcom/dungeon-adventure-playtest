// Shared sprite catalog. Placement and interaction identifiers belong to each room.
window.DungeonInteriorFurnitureV1 = Object.freeze({
  bed: 'assets/interiors/furniture/bed.png',
  wardrobe: 'assets/interiors/furniture/wardrobe.png',
  'wardrobe-open': 'assets/interiors/rental-room/reference/wardrobe-open.webp',
  'chest-open': 'assets/interiors/furniture/chest-front-painted-open.webp',
  chest: 'assets/interiors/furniture/chest-front-painted-closed.webp',
  desk: 'assets/interiors/furniture/desk-without-chair-v1.svg',
  chair: 'assets/interiors/furniture/chair-straight-painted-v3.svg',
  window: 'assets/interiors/rental-room/reference/window.webp',
  ...Object.fromEntries(
    ['mirror', 'door', 'rug', 'lamp', 'shelves', 'left-shelf', 'wall-map', 'right-wall-map'].map(id => [
      id, 'assets/interiors/rental-room/reference/' + id + '.webp'
    ])
  )
});
