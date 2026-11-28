// Shared sprite catalog. Placement and interaction identifiers belong to each room.
window.DungeonInteriorFurnitureV1 = Object.freeze(Object.fromEntries(
  ['bed', 'wardrobe', 'desk', 'window', 'mirror', 'door', 'rug'].map(id => [
    id, 'assets/interiors/furniture/' + id + '.png'
  ])
));
