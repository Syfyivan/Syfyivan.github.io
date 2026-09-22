const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../source/js/farm-world-core.js');
test('saved discoveries reject malformed and future data and normalize duplicates', () => {
  for (const raw of [null, '', '{', 'null', '{"version":2,"found":["fish"]}', '{"version":1,"found":{}}']) assert.deepEqual(core.restore(raw), []);
  assert.deepEqual(core.restore('{"version":1,"found":["fish","fish","unknown","berry"]}'), ['berry', 'fish']);
});
test('discoveries are optional, idempotent and never mutate the prior state', () => {
  const initial = ['fish'];
  assert.deepEqual(core.collect(initial, 'fish'), ['fish']);
  assert.deepEqual(core.collect(initial, 'unknown'), ['fish']);
  assert.deepEqual(core.collect(initial, 'berry'), ['fish', 'berry']);
  assert.deepEqual(initial, ['fish']);
});
test('blocked storage does not prevent collecting or reading', () => {
  assert.equal(core.save({setItem() { throw new Error('blocked'); }}, ['fish']), false);
  let saved;
  assert.equal(core.save({setItem(k,v) { saved=v; }}, ['berry']), true);
  assert.deepEqual(core.restore(saved), ['berry']);
});
test('all destinations and discoveries fit the map, with unique identities', () => {
  const items = core.places.concat(core.discoveries);
  assert.equal(new Set(items.map(x=>x.id)).size, items.length);
  for (const item of items) { assert.ok(item.x>0&&item.x<100); assert.ok(item.y>0&&item.y<100); }
  for (const place of core.places) assert.ok(place.href.startsWith('/') && !place.href.startsWith('//'));
});
