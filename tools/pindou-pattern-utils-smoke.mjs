import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { cleanSkinToneNoise } = require('../source/pindou-studio/pattern-utils.js');

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

console.log('pindou skin-tone cleanup smoke test passed');
