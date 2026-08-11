(function attachPindouPatternUtils(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PindouPatternUtils = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const DEFAULT_BASE_CODES = ['G1', 'G2'];
  const DEFAULT_SKIN_CODES = ['G1', 'G2', 'F17', 'G4', 'G16'];
  const DEFAULT_NOISE_CODES = ['G4', 'G16'];
  const ORTHOGONAL = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function selectAdaptivePalette(samples, palette, maxColors) {
    if (!Array.isArray(samples) || !samples.length || !Array.isArray(palette) || !palette.length) return [];
    const limit = Math.max(1, Math.min(Math.floor(maxColors) || 1, palette.length));
    const counts = new Map();

    samples.forEach((sample) => {
      const rgb = Array.isArray(sample) ? sample : sample?.rgb;
      if (!rgb || rgb.length < 3) return;
      let nearest = palette[0];
      let nearestDistance = Number.POSITIVE_INFINITY;
      palette.forEach((color) => {
        const distance = colorDistance(rgb, color.rgb);
        if (distance < nearestDistance) {
          nearest = color;
          nearestDistance = distance;
        }
      });
      counts.set(nearest.code, (counts.get(nearest.code) || 0) + 1);
    });

    const entries = palette
      .filter((color) => counts.has(color.code))
      .map((color) => ({ color, count: counts.get(color.code) }))
      .sort((a, b) => b.count - a.count);
    if (entries.length <= limit) return entries.map((entry) => entry.color);

    // Ignore one-pixel compression artefacts while retaining small eyes and garment accents.
    const minimumCount = Math.max(2, Math.floor(samples.length * .0005));
    const eligible = entries.filter((entry) => entry.count >= minimumCount);
    const candidates = eligible.length >= Math.min(limit, 4) ? eligible : entries;
    const selected = [];
    const selectedCodes = new Set();
    const add = (entry) => {
      if (!entry || selectedCodes.has(entry.color.code) || selected.length >= limit) return;
      selected.push(entry.color);
      selectedCodes.add(entry.color.code);
    };

    add(candidates[0]);
    add(candidates.reduce((best, entry) => luminance(entry.color.rgb) < luminance(best.color.rgb) ? entry : best));
    add(candidates.reduce((best, entry) => luminance(entry.color.rgb) > luminance(best.color.rgb) ? entry : best));

    while (selected.length < limit && selected.length < candidates.length) {
      let best = null;
      let bestScore = Number.NEGATIVE_INFINITY;
      candidates.forEach((entry) => {
        if (selectedCodes.has(entry.color.code)) return;
        const separation = selected.reduce((distance, color) => Math.min(distance, colorDistance(entry.color.rgb, color.rgb)), Number.POSITIVE_INFINITY);
        const score = Math.log2(entry.count + 1) * (1 + separation / 65);
        if (score > bestScore) {
          best = entry;
          bestScore = score;
        }
      });
      add(best);
    }

    if (selected.length < limit) entries.forEach(add);
    return selected;
  }

  function cleanSkinToneNoise(cells, colorByCode, options = {}) {
    const height = cells.length;
    const width = height ? cells[0].length : 0;
    if (!height || !width) return { replaced: 0, components: 0 };

    const baseCodes = new Set(options.baseCodes || DEFAULT_BASE_CODES);
    const skinCodes = new Set(options.skinCodes || DEFAULT_SKIN_CODES);
    const noiseCodes = new Set(options.noiseCodes || DEFAULT_NOISE_CODES);
    const maxComponentSize = options.maxComponentSize
      || Math.max(2, Math.round(width * height * .0008));
    const radius = options.radius || 2;
    const passes = options.passes || 2;
    let replaced = 0;
    let cleanedComponents = 0;

    for (let pass = 0; pass < passes; pass += 1) {
      const source = cells.map((row) => row.slice());
      const seen = Array.from({ length: height }, () => new Uint8Array(width));
      let passReplaced = 0;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const code = source[y][x]?.code;
          if (!noiseCodes.has(code) || seen[y][x]) continue;

          const component = [];
          const queue = [[x, y]];
          seen[y][x] = 1;
          for (let index = 0; index < queue.length; index += 1) {
            const [cx, cy] = queue[index];
            component.push([cx, cy]);
            for (const [dx, dy] of ORTHOGONAL) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx < 0 || ny < 0 || nx >= width || ny >= height || seen[ny][nx]) continue;
              if (source[ny][nx]?.code !== code) continue;
              seen[ny][nx] = 1;
              queue.push([nx, ny]);
            }
          }
          if (component.length > maxComponentSize) continue;

          const componentKeys = new Set(component.map(([cx, cy]) => `${cx},${cy}`));
          const neighborKeys = new Set();
          let touchesEmpty = false;
          component.forEach(([cx, cy]) => {
            for (let dy = -radius; dy <= radius; dy += 1) {
              for (let dx = -radius; dx <= radius; dx += 1) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
                  touchesEmpty = true;
                  continue;
                }
                const key = `${nx},${ny}`;
                if (!componentKeys.has(key)) neighborKeys.add(key);
              }
            }
            for (let dy = -1; dy <= 1; dy += 1) {
              for (let dx = -1; dx <= 1; dx += 1) {
                if (dx === 0 && dy === 0) continue;
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || ny < 0 || nx >= width || ny >= height || !source[ny][nx]) touchesEmpty = true;
              }
            }
          });
          if (touchesEmpty) continue;

          const counts = new Map();
          let occupied = 0;
          let skinFamily = 0;
          let baseCount = 0;
          neighborKeys.forEach((key) => {
            const [nx, ny] = key.split(',').map(Number);
            const neighborCode = source[ny][nx]?.code;
            if (!neighborCode) return;
            occupied += 1;
            counts.set(neighborCode, (counts.get(neighborCode) || 0) + 1);
            if (skinCodes.has(neighborCode)) skinFamily += 1;
            if (baseCodes.has(neighborCode)) baseCount += 1;
          });

          if (baseCount < Math.max(4, component.length)) continue;
          if (!occupied || skinFamily / occupied < .62) continue;

          const replacementCode = [...baseCodes]
            .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))[0];
          const replacement = colorByCode(replacementCode);
          if (!replacement) continue;
          component.forEach(([cx, cy]) => { cells[cy][cx] = replacement; });
          passReplaced += component.length;
          cleanedComponents += 1;
        }
      }

      replaced += passReplaced;
      if (passReplaced === 0) break;
    }

    return { replaced, components: cleanedComponents };
  }

  function colorDistance(a, b) {
    const meanRed = (a[0] + b[0]) / 2;
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt((2 + meanRed / 256) * dr * dr + 4 * dg * dg + (2 + (255 - meanRed) / 256) * db * db);
  }

  function luminance(rgb) {
    return rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114;
  }

  return { cleanSkinToneNoise, selectAdaptivePalette };
}));
