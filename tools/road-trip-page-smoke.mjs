import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'source/road-trip-2026');
const pagePath = path.join(dir, 'index.html');
const html = fs.readFileSync(pagePath, 'utf8');
const roadbook = fs.readFileSync(path.join(dir, 'route-roadbook.html'), 'utf8');
const amapMap = fs.readFileSync(path.join(dir, 'route-map-amap.html'), 'utf8');
const offlineMap = fs.readFileSync(path.join(dir, 'route-map-offline.html'), 'utf8');

// Load the shared data files in order so downstream files can read window.* globals.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'assets/road_trip_days.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(dir, 'assets/route_map_pois.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(dir, 'assets/road_trip_meals.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(dir, 'assets/road_trip_costs.js'), 'utf8'), sandbox);

const daily = sandbox.window.ROAD_TRIP_DAY_DATA;
const food = sandbox.window.ROAD_TRIP_MEAL_DATA;
const costs = sandbox.window.ROAD_TRIP_COST_DATA;
const places = sandbox.window.ROAD_TRIP_POI_DATA;

const mealByDay = new Map(food.meals.map(meal => [meal.day, meal]));
const costByDay = new Map(costs.items.map(item => [item.day, item]));
const stayById = new Map(places.pois.filter(poi => poi.category === 'stay').map(poi => [poi.id, poi]));

// —— price-range helper ——
function assertRange(range, ctx) {
  assert.ok(Array.isArray(range) && range.length === 2, `${ctx}: must be a [min,max] pair`);
  const [lo, hi] = range;
  assert.ok(Number.isFinite(lo) && Number.isFinite(hi), `${ctx}: bounds must be numbers`);
  assert.ok(lo >= 0 && hi >= 0, `${ctx}: prices must not be negative`);
  assert.ok(lo <= hi, `${ctx}: min (${lo}) must not exceed max (${hi})`);
}

// 1. 70 天且编号连续
assert.equal(daily.days.length, 70, 'the route book must keep all 70 days');
assert.deepEqual(
  Array.from(daily.days, day => day.day),
  Array.from({ length: 70 }, (_, i) => i + 1),
  'route-book days must remain sequential',
);
assert.equal(food.meals.length, 70, 'the food plan must cover all 70 days');
assert.deepEqual(
  Array.from(food.meals, meal => meal.day),
  Array.from({ length: 70 }, (_, i) => i + 1),
  'meal-plan days must remain sequential',
);
assert.equal(costs.items.length, 70, 'the cost plan must cover all 70 days');

// 2/3. 每天都有三餐说明 + 餐饮价格区间
for (const day of daily.days) {
  const meal = mealByDay.get(day.day);
  assert.ok(meal, `D${day.day}: missing meal plan`);
  assert.ok(meal.breakfast && meal.breakfast.plan, `D${day.day}: missing breakfast`);
  assert.ok(meal.lunch && meal.lunch.plan, `D${day.day}: missing lunch`);
  assert.ok(meal.dinner && meal.dinner.plan, `D${day.day}: missing dinner`);
  assertRange(meal.breakfast.perPax, `D${day.day} breakfast.perPax`);
  assertRange(meal.lunch.perPax, `D${day.day} lunch.perPax`);
  assertRange(meal.dinner.perPax, `D${day.day} dinner.perPax`);
  assertRange(meal.dinner.party4, `D${day.day} dinner.party4`);
  assertRange(meal.dayTotal4, `D${day.day} dayTotal4`);
}

// 4. 所有外地住宿夜都有住宿价格范围（在家夜 stayId 为空，不计）
for (const day of daily.days) {
  if (!day.stayId) continue;
  const stay = stayById.get(day.stayId);
  assert.ok(stay, `D${day.day}: stayId "${day.stayId}" not found in POI data`);
  assert.ok(stay.priceParty4, `D${day.day}: stay "${day.stayId}" missing price range`);
  assertRange(stay.priceParty4, `D${day.day} stay.priceParty4`);
  // 每个外地住宿夜都必须带可点击的下单/比价链接与核价日期
  assert.ok(stay.bookingUrl || stay.sourceUrl, `D${day.day}: stay "${day.stayId}" missing bookingUrl/sourceUrl`);
  assert.ok(stay.priceUpdatedAt, `D${day.day}: stay "${day.stayId}" missing priceUpdatedAt`);
}

// 5. 需要门票/接驳的天都有对应费用，且金额区间合法
for (const item of costs.items) {
  assertRange(item.fuel, `D${item.day} fuel`);
  assertRange(item.toll, `D${item.day} toll`);
  assertRange(item.fuelToll, `D${item.day} fuelToll`);
  for (const ticket of item.tickets) {
    assert.ok(ticket.name && ticket.type, `D${item.day}: ticket entry must have name and type`);
    assertRange(ticket.party4, `D${item.day} ticket "${ticket.name}"`);
  }
  assertRange(item.ticketTotal, `D${item.day} ticketTotal`);
}

// 6. 主攻略页仍然不包含第二套完整日卡；路书作为唯一逐日信息源，正文可多处引用同一份路书
assert.doesNotMatch(html, /class="day-card"|class="roadbook-segment"|id="seg[1-7]"/, 'the main guide must not embed a second D1-D70 road book');
assert.equal((html.match(/id="routePreviewFrame"/g) || []).length, 1, 'overview must use exactly one map iframe');
// 只允许一个 HTML 路书文件；正文/地图可以有多个链接，但必须全部指向它，且版本号一致。
const roadbookRefs = html.match(/route-roadbook\.html(\?v=\d+)?/g) || [];
assert.ok(roadbookRefs.length >= 1, 'the main guide must link to the canonical road book at least once');
for (const ref of roadbookRefs) {
  assert.ok(/route-roadbook\.html\?v=13/.test(ref), `road-book links must use the current cache version (v13), found: ${ref}`);
}

// 7. 地图与路书链接指向唯一 route-roadbook.html
assert.match(amapMap, /route-roadbook\.html/, 'the online map must link to the canonical road book');
assert.match(offlineMap, /route-roadbook\.html/, 'the offline map must link to the canonical road book');
assert.match(roadbook, /<h1>D1—D70 完整路书<\/h1>/, 'the canonical road book must identify itself as the full copy');

// 8. 路书保留按天筛选与 ?day= 定位能力
assert.match(roadbook, /URLSearchParams/, 'the road book must read URL params for day deep-linking');
assert.match(roadbook, /\?day=/, 'day cards must expose ?day= deep links');

// 9. 公开正文不再出现需要清理的过程化措辞
const bannedPhrases = ['新版', '默认执行版', '主菜', '吃掉', '意思一下', '轻轻带过', '不加戏', '不追店', '不追网红', '回收时间', '绑死', '完成度反而', '唯一执行'];
for (const file of [
  { name: 'index.html', text: html },
  { name: 'route-roadbook.html', text: roadbook },
]) {
  for (const phrase of bannedPhrases) {
    assert.ok(!file.text.includes(phrase), `${file.name} must not contain process-oriented phrasing: "${phrase}"`);
  }
}

// 10. 价格性质声明齐备
assert.equal(food.meta.priceNature, '规划估算价', 'meal prices must be labelled as planning estimates');
assert.equal(costs.meta.priceNature, '规划估算价', 'cost prices must be labelled as planning estimates');
assert.ok(costs.meta.updatedAt, 'cost data must carry an updatedAt timestamp');
assert.ok(food.meta.updatedAt, 'meal data must carry an updatedAt timestamp');

// 11. 页面 ID 唯一
const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'page IDs must remain unique');

console.log('road-trip page smoke: 70 sequential days with meals/prices/costs, stay prices for every away night, single canonical road book, clean travel-guide copy, unique IDs');
