import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = path.join(root, 'source/road-trip-2026/index.html');
const dataPath = path.join(root, 'source/road-trip-2026/assets/road_trip_days.js');
const mealPath = path.join(root, 'source/road-trip-2026/assets/road_trip_meals.js');
const html = fs.readFileSync(pagePath, 'utf8');
const offlineRoadbook = fs.readFileSync(path.join(root, 'source/road-trip-2026/route-roadbook.html'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(mealPath, 'utf8'), sandbox);

const daily = sandbox.window.ROAD_TRIP_DAY_DATA;
const food = sandbox.window.ROAD_TRIP_MEAL_DATA;
assert.equal(daily.days.length, 70, 'the route book must keep all 70 days');
assert.deepEqual(
  Array.from(daily.days, day => day.day),
  Array.from({ length: 70 }, (_, index) => index + 1),
  'route-book days must remain sequential',
);
assert.equal(food.meals.length, 70, 'the food plan must cover all 70 days');
assert.deepEqual(
  Array.from(food.meals, meal => meal.day),
  Array.from({ length: 70 }, (_, index) => index + 1),
  'meal-plan days must remain sequential',
);
assert.deepEqual(
  Object.assign({}, food.dinnerCounts),
  { restaurant: 30, nearby: 9, lodging: 26, cook: 3, home: 2 },
  'dinner modes must keep the decided 30/35/3/2 rhythm',
);
assert.deepEqual(Array.from(food.meta.kitchenNights), [6, 55, 56, 63, 64, 65, 66], 'only verified-kitchen nights may be treated as cookable');
assert.ok(food.meta.plannedCookDinners.every(day => food.meta.kitchenNights.includes(day)), 'every cook dinner must have a verified kitchen');

const coveredDays = new Set();
for (const match of html.matchAll(/<span class="day-num">D(\d+)(?:-D?(\d+))?/g)) {
  const from = Number(match[1]);
  const to = Number(match[2] || match[1]);
  for (let day = from; day <= to; day += 1) coveredDays.add(day);
}
assert.deepEqual(
  Array.from(coveredDays).sort((a, b) => a - b),
  Array.from({ length: 70 }, (_, index) => index + 1),
  'the detailed main-page route book must cover D1-D70',
);

for (let segment = 1; segment <= 7; segment += 1) {
  assert.match(html, new RegExp(`id="seg${segment}"`), `segment ${segment} must remain addressable`);
}
assert.equal((html.match(/id="routePreviewFrame"/g) || []).length, 1, 'overview must use one map iframe');
assert.match(html, /href="#roadbook">逐日路书<\/a>/, 'top navigation must point to the single route-book section');
assert.match(html, /href="#food-plan">吃饭安排<\/a>/, 'top navigation must expose the meal plan');
assert.equal((html.match(/class="roadbook-segment"/g) || []).length, 7, 'all seven route segments must be collapsible');
assert.equal((html.match(/class="roadbook-segment" open/g) || []).length, 1, 'only the first route segment should open by default');
assert.doesNotMatch(html, /id="time-chart"|id="booking"|class="timeline"/, 'removed duplicate overview sections must stay removed');
assert.doesNotMatch(
  html.match(/<div id="route-map"[\s\S]*?<\/div>\s*<details class="static-map-fallback">/)?.[0] || '',
  /route-roadbook\.html/,
  'the map toolbar must not compete with the route-book entry',
);
assert.match(html, /assets\/route_map_pois\.js/, 'the main route book must load stay details');
assert.match(html, /assets\/road_trip_days\.js/, 'the main route book must load daily execution gates');
assert.match(html, /assets\/road_trip_meals\.js/, 'the main route book must load the D1-D70 meal plan');
assert.match(offlineRoadbook, /assets\/road_trip_meals\.js/, 'the offline road book must include meal plans');
assert.doesNotMatch(html, /35-45天具备自炊条件/, 'the page must not claim unverified kitchens');
assert.match(html, /<td><strong>餐饮<\/strong><\/td><td>26,000<\/td><td>6,500<\/td>/, 'the budget must fund the decided restaurant rhythm');
assert.match(offlineRoadbook, /document\.createElement\('details'\)/, 'offline route-book days must be collapsible');
assert.match(offlineRoadbook, /id="expandBtn"/, 'offline route book must support expand all');
assert.match(offlineRoadbook, /id="collapseBtn"/, 'offline route book must support collapse all');

const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'page IDs must remain unique');

console.log('road-trip page smoke: one map, one foldable D1-D70 route book, 70 meal plans, 7 segments, unique IDs');
