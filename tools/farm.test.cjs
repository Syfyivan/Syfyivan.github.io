'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const farm = require('../source/js/farm-core.js');

test('wandering changes world position, remains in bounds and survives resize', () => {
  const a = {x:20,y:20,tx:100,ty:50,rest:0,speed:35};
  for(let n=0;n<500;n++) {
    farm.walk(a, 0.04, 120, 80, () => .7);
    assert.ok(a.x>=0 && a.x<=120 && a.y>=0 && a.y<=80);
  }
  assert.notEqual(a.x, 20);
  farm.walk(a, 100, 10, 5, () => .2);
  assert.ok(a.x<=10 && a.y<=5 && a.tx<=10 && a.ty<=5);
});

test('scenery has no game controls, persistence or global input handlers', () => {
 const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../source/js/farm.js'),'utf8');
 assert.doesNotMatch(source, /localStorage|setInterval|keydown|tabindex|<button|<select|role="status"/);
});
