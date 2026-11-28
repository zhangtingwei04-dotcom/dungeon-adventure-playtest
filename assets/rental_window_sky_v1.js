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
        if (r < sky[0] + 12 || g < 166 || b < 193 || b + 4 < r || b + 8 < g) continue;
        // Recover the bright cloud as alpha over the sampled sky color.
        const alpha = Math.min(1, (r - sky[0]) / (255 - sky[0]));
        for (let c = 0; c < 3; c++) {
          clouds.data[i + c] = sky[c] + (pixels[i + c] - sky[c]) / alpha;
          pixels[i + c] = sky[c];
        }
        clouds.data[i + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(frame, 0, 0);
    cloudCtx.putImageData(clouds, 0, 0);
    base.className = 'window-sky-base';
    cloud.className = 'window-cloud';
    image.after(base);
    motion.prepend(cloud);
  }

  root.DungeonRentalWindowSkyV1 = Object.freeze({
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
