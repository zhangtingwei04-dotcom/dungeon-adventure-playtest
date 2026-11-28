(function (root) {
  'use strict';

  // Pixel bounds refer to the 456 × 349 rental-room window sprite.
  // Keep the tree, roof peak, mullions, curtains and hanging plant out of the sky pass.
  function paneAt(x, y) {
    if (y < 50 || y > 135) return null;
    if (x >= 98 && x <= 222 && x >= 216 - (y - 50) * 1.52) return 0;
    if (x < 248 || x > 348 + (y - 50) * 0.17) return null;
    if (x >= 293 && x <= 314 && y < 72) return null;
    if (y >= 88 && Math.abs(x - 328) < 3 + (y - 88) * 0.26) return null;
    return 1;
  }

  function canvas(width, height) {
    const layer = document.createElement('canvas');
    layer.width = width;
    layer.height = height;
    layer.setAttribute('aria-hidden', 'true');
    return layer;
  }

  function separate(image, motion) {
    const width = 456;
    const height = 349;
    if (image.naturalWidth !== width || image.naturalHeight !== height) return;
    const base = canvas(width, height);
    const cloud = canvas(width, height);
    const ctx = base.getContext('2d', { willReadFrequently: true });
    const cloudCtx = cloud.getContext('2d');
    if (!ctx || !cloudCtx) return;

    ctx.drawImage(image, 0, 0);
    const frame = ctx.getImageData(0, 0, width, height);
    const clouds = cloudCtx.createImageData(width, height);
    const pixels = frame.data;

    for (let y = 50; y <= 135; y++) {
      const samples = [[], []];
      for (let x = 98; x <= 363; x++) {
        const pane = paneAt(x, y);
        if (pane === null) continue;
        const i = (y * width + x) * 4;
        const [r, g, b] = pixels.subarray(i, i + 3);
        if (g > r + 18 && b > g + 8) samples[pane].push(i);
      }
      const background = samples.map(row => {
        row.sort((a, b) => pixels[a] - pixels[b]);
        const i = row[Math.floor(row.length * 0.25)];
        return i === undefined ? null : [...pixels.subarray(i, i + 3)];
      });

      for (let x = 98; x <= 363; x++) {
        const pane = paneAt(x, y);
        const sky = pane === null ? null : background[pane];
        if (!sky) continue;
        const i = (y * width + x) * 4;
        const [r, g, b] = pixels.subarray(i, i + 3);
        if (r <= sky[0] + 4 || g < 166 || b < 193 || b + 4 < r || b + 8 < g) continue;
        // Feather a single cloud bank before it moves away from the painted window.
        const edge = Math.max(0, Math.min(1, (x - 270) / 15, (357 - x) / 12,
          (y - 50) / 8, (89 - y) / 10));
        const amount = Math.max(0, Math.min(1, (r - sky[0] - 4) / 13));
        const alpha = Math.min(1, (r - sky[0]) / (255 - sky[0]));
        for (let c = 0; c < 3; c++) {
          clouds.data[i + c] = sky[c] + (pixels[i + c] - sky[c]) / alpha;
          pixels[i + c] += (sky[c] - pixels[i + c]) * amount;
        }
        clouds.data[i + 3] = Math.round(alpha * amount * edge * 255);
      }
    }

    ctx.putImageData(frame, 0, 0);
    cloudCtx.putImageData(clouds, 0, 0);
    base.className = 'window-sky-base';
    cloud.className = 'window-cloud';
    image.after(base);
    motion.prepend(cloud);
  }

  function createRoofSnow() {
    const layer = canvas(456, 349);
    layer.className = 'window-roof-snow';
    const ctx = layer.getContext('2d');
    // Roof planes in the painted town, excluding the window bars and walls.
    const roofs = [
      [[119,174],[135,152],[148,170],[138,176],[133,174],[128,180]],
      [[132,190],[142,174],[154,190],[147,193],[142,190],[138,195]],
      [[166,183],[180,156],[194,183],[187,184],[180,178],[174,185]],
      [[171,205],[184,184],[199,204],[191,206],[184,201],[179,208]],
      [[199,213],[211,194],[222,207],[222,214],[211,208],[206,215]],
      [[308,188],[329,154],[347,183],[361,184],[361,190],[332,183],[320,190]],
      [[273,214],[291,190],[311,212],[304,217],[292,209],[285,218]],
      [[311,218],[328,193],[350,212],[340,217],[329,212],[322,219]],
      [[288,259],[303,241],[318,256],[310,262],[302,256],[296,262]],
      [[322,258],[342,239],[359,252],[359,259],[343,252],[332,260]]
    ];
    if (ctx) {
      for (const roof of roofs) {
        ctx.beginPath();
        roof.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath();
        ctx.fillStyle = '#eaf2f8';
        ctx.fill();
        ctx.strokeStyle = '#a3bfdb';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    layer.style.opacity = '0';
    return layer;
  }

  root.DungeonRentalWindowSkyV1 = Object.freeze({
    createRoofSnow,
    mount(image, motion) {
      function load() {
        try {
          separate(image, motion);
        } catch {
          // Keep the original window sprite if canvas pixel access is unavailable.
        }
      }
      if (image.complete && image.naturalWidth) load();
      else image.addEventListener('load', load, { once: true });
    }
  });
})(window);
