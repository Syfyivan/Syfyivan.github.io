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

  return { cleanSkinToneNoise };
}));
