// Shared sprite catalog. Placement and interaction identifiers belong to each room.
window.DungeonInteriorFurnitureV1 = Object.freeze({
  bed: 'assets/interiors/furniture/bed.png',
  wardrobe: 'assets/interiors/furniture/wardrobe.png',
  'wardrobe-open': 'assets/interiors/rental-room/reference/wardrobe-open.webp',
  'chest-open': 'assets/interiors/rental-room/reference/chest-open.webp',
  desk: 'assets/interiors/furniture/desk.png',
  ...Object.fromEntries(
    ['window', 'mirror', 'door', 'rug', 'lamp', 'shelves', 'chest', 'left-shelf', 'wall-map', 'right-wall-map'].map(id => [
      id, 'assets/interiors/rental-room/reference/' + id + '.webp'
    ])
  )
});
