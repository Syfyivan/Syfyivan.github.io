'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const farm = require('../source/js/farm-core.js');

test('plant, water, mature, harvest once and plant again', () => {
  const state = farm.restore(null, 1000);
  assert.equal(farm.act(state, 0, 1000, 'carrot'), 'planted');
  assert.equal(farm.status(state.plots[0], 100000), 'seed');
  assert.equal(farm.act(state, 0, 2000), 'watered');
  assert.equal(farm.act(state, 0, 2001), 'growing');
  assert.equal(farm.act(state, 0, 14000), 'harvested');
  assert.equal(state.harvest, 1);
  assert.equal(farm.act(state, 0, 14000, 'turnip'), 'planted');
  assert.equal(state.harvest, 1);
  assert.equal(farm.act(state, 99, 14000), 'invalid');
});

test('saved crops mature offline; corrupt or future saves cannot strand a plot', () => {
  const state = farm.restore({ version: 1, plots: [{kind:'carrot', wateredAt:1000}], harvest:4, fish:2 }, 50000);
  assert.equal(farm.status(state.plots[0], 50000), 'ready');
  assert.equal(state.plots.length, 6);
  const bad = farm.restore({ version:1, plots:[{kind:'script',wateredAt:0},{kind:'turnip',wateredAt:1e20}], harvest:-1, fish:'bad' }, 1000);
  assert.equal(bad.plots[0], null);
  assert.equal(farm.status(bad.plots[1], 1000), 'seed');
  assert.equal(bad.harvest, 0);
  assert.equal(bad.fish, 0);
});

test('fishing rejects early or duplicate reels and permits cancellation', () => {
  const rod = farm.rod();
  assert.equal(farm.cast(rod, 100, 2000), true);
  assert.equal(farm.cast(rod, 200, 2000), false);
  assert.equal(farm.reel(rod, 2099), false);
  assert.equal(farm.reel(rod, 2100), true);
  assert.equal(farm.reel(rod, 2101), false);
  farm.cast(rod, 3000, 2000);
  farm.cancel(rod);
  assert.equal(farm.reel(rod, 6000), false);
});

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
