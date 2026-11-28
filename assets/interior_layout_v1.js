// Coordinates and width are percentages of the scene. The anchor is bottom center.
(function (root) {
  'use strict';

  const rentalRoom = Object.freeze([
    { id: 'window', x: 47.5, y: 56, width: 29, scale: 1, angle: 0, z: 10 },
    { id: 'mirror', x: 90, y: 63, width: 5.5, scale: 1, angle: 0, z: 11 },
    { id: 'door', x: 96.7, y: 93, width: 6.6, scale: 1, angle: 0, z: 12 },
    { id: 'rug', x: 49, y: 99, width: 62, scale: 1, angle: 0, z: 13 },
    { id: 'shelves', x: 72.5, y: 43, width: 17, scale: 1, angle: 0, z: 14 },
    { id: 'wardrobe', x: 21.5, y: 72, width: 19, scale: 1, angle: 0, z: 15 },
    { id: 'desk', x: 72, y: 75, width: 24, scale: 1, angle: 0, z: 16 },
    { id: 'bed', x: 10, y: 100, width: 30, scale: 1, angle: 0, z: 17 },
    { id: 'chest', x: 87, y: 86, width: 12.5, scale: 1, angle: 0, z: 18 },
    { id: 'lamp', x: 50, y: 15.5, width: 6, scale: 1, angle: 0, z: 19 }
  ].map(Object.freeze));

  const fields = Object.freeze({
    x: { label: '位置 X (%)', min: 0, max: 100, step: 0.5 },
    y: { label: '位置 Y (%)', min: 0, max: 100, step: 0.5 },
    scale: { label: '大小 (倍)', min: 0.2, max: 3, step: 0.05 },
    angle: { label: '角度 (°)', min: -180, max: 180, step: 1 },
    z: { label: '圖層', min: 1, max: 100, step: 1 }
  });

  function applyOverrides(defaults, overrides) {
    return defaults.map(item => {
      const adjusted = { ...item };
      for (const [key, field] of Object.entries(fields)) {
        const value = overrides?.[item.id]?.[key];
        if (Number.isFinite(value)) {
          adjusted[key] = Math.max(field.min, Math.min(value, field.max));
        }
      }
      return adjusted;
    });
  }

  function position(element, item) {
    Object.assign(element.style, {
      left: item.x + '%',
      top: item.y + '%',
      width: (item.width * item.scale) + '%',
      transform: 'translate(-50%, -100%) rotate(' + item.angle + 'deg)',
      zIndex: String(item.z)
    });
  }

  root.DungeonInteriorLayoutV1 = Object.freeze({ rentalRoom, fields, applyOverrides, position });
})(window);
