import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { cleanSkinToneNoise, selectAdaptivePalette } = require('../source/pindou-studio/pattern-utils.js');
const mardPalette = require('../source/pindou-studio/mard-221.js').map((item) => ({ ...item, rgb: hexToRgb(item.hex) }));

const color = (code) => ({ code });
const board = (size, code) => Array.from({ length: size }, () => Array.from({ length: size }, () => color(code)));

{
  const cells = board(9, 'G1');
  cells[4][4] = color('G16');
  const result = cleanSkinToneNoise(cells, color);
  assert.equal(cells[4][4].code, 'G1');
  assert.equal(result.replaced, 1);
}

{
  const cells = board(9, 'H7');
  cells[4][4] = color('G16');
  const result = cleanSkinToneNoise(cells, color);
  assert.equal(cells[4][4].code, 'G16');
  assert.equal(result.replaced, 0);
}

{
  const cells = board(15, 'G16');
  for (let y = 5; y <= 9; y += 1) for (let x = 5; x <= 9; x += 1) cells[y][x] = color('G4');
  const result = cleanSkinToneNoise(cells, color);
  assert.equal(cells[7][7].code, 'G4');
  assert.equal(result.replaced, 0);
}

{
  const cells = board(9, 'G1');
  cells[4][4] = color('G4');
  cells[4][5] = color('G4');
  const result = cleanSkinToneNoise(cells, color);
  assert.equal(cells[4][4].code, 'G1');
  assert.equal(cells[4][5].code, 'G1');
  assert.equal(result.replaced, 2);
}

{
  assert.equal(mardPalette.length, 221);
  assert.equal(new Set(mardPalette.map((item) => item.code)).size, 221);
  assert.deepEqual(
    Object.fromEntries([...new Set(mardPalette.map((item) => item.code[0]))].map((series) => [series, mardPalette.filter((item) => item.code.startsWith(series)).length])),
    { A: 26, B: 32, C: 29, D: 26, E: 24, F: 25, G: 21, H: 23, M: 15 },
  );
}

{
  const samples = [
    ...repeatColor('G2', 600),
    ...repeatColor('C16', 280),
    ...repeatColor('F3', 120),
    ...repeatColor('H2', 80),
  ];
  const selected = selectAdaptivePalette(samples, mardPalette, 4).map((item) => item.code);
  assert.deepEqual(new Set(selected), new Set(['G2', 'C16', 'F3', 'H2']));
}

console.log('pindou palette and skin-tone smoke tests passed');

function repeatColor(code, count) {
  const rgb = mardPalette.find((item) => item.code === code).rgb;
  return Array.from({ length: count }, () => rgb);
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
