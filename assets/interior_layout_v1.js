// Coordinates and width are percentages of the scene. The anchor is bottom center.
(function (root) {
  'use strict';

  const rentalRoom = Object.freeze([
    { id: 'window', x: 46, y: 51, width: 25, scale: 1, angle: 0, z: 10 },
    { id: 'mirror', x: 84, y: 51, width: 5, scale: 1, angle: 0, z: 11 },
    { id: 'door', x: 69, y: 69, width: 13, scale: 1, angle: 0, z: 12 },
    { id: 'rug', x: 62, y: 98, width: 24, scale: 1, angle: 0, z: 13 },
    { id: 'wardrobe', x: 18, y: 68, width: 15, scale: 1, angle: 0, z: 14 },
    { id: 'desk', x: 51, y: 81, width: 23, scale: 1, angle: 0, z: 15 },
    { id: 'bed', x: 27, y: 93, width: 28, scale: 1, angle: 0, z: 16 }
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
