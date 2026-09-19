import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../source/reading-lab/rewards.js', import.meta.url));
const { PETS, createPlayer, calculateReward, awardSession, adoptPet, feedPet, petProgress, sanitizePlayer } = await import(`data:text/javascript;base64,${source.toString('base64')}`);
const playerWithCoins = (coins = 1000) => ({ ...createPlayer('p_test', '小读者'), coins, totalScore: coins });
const flash = (id = 's_one', extra = {}) => ({ id, mode: 'flash', metrics: { total: 10, correct: 8, level: 2, completed: true, ...extra } });

test('flash rewards difficulty and completion, while retries grant one per correct answer', () => {
  for (let level = 1; level <= 4; level++) assert.equal(calculateReward('flash', flash('s', { level }).metrics), 8 * (level + 1) + 5);
  assert.equal(calculateReward('flash', flash('s', { completed: false }).metrics), 24);
  assert.equal(calculateReward('flash', flash('s', { total: 4, correct: 4 }).metrics), 12);
  assert.equal(calculateReward('flash', flash('s', { retry: true }).metrics), 8);
  assert.equal(calculateReward('flash', flash('s', { correct: 0 }).metrics), 5);
});

test('stories require 20 characters of retelling and distinguish quiz from custom stories', () => {
  assert.equal(calculateReward('read', { retellingLength: 19, correct: 3, hasQuiz: true }), 0);
  assert.equal(calculateReward('read', { retellingLength: 20, correct: 3, hasQuiz: true }), 35);
  assert.equal(calculateReward('read', { retellingLength: 20, correct: 0, hasQuiz: true }), 20);
  assert.equal(calculateReward('read', { retellingLength: 20, correct: 0, hasQuiz: false }), 10);
  assert.equal(calculateReward('read', { retellingLength: 20, correct: 1, hasQuiz: false }), 0);
  assert.equal(calculateReward('read', { retellingLength: 20, correct: 3, hasQuiz: true, quizTotal: 2 }), 0);
});

test('grids award completed runs by size with an error penalty and a five-point floor', () => {
  for (const [size, points] of [[3, 15], [4, 25], [5, 40]]) {
    assert.equal(calculateReward('grid', { size, errors: 0, completed: true }), points);
    assert.equal(calculateReward('grid', { size, errors: 2, completed: true }), points - 4);
    assert.equal(calculateReward('grid', { size, errors: 100, completed: true }), 5);
    assert.equal(calculateReward('grid', { size, errors: 0, completed: false }), 0);
  }
});

test('invalid, negative, fractional, coerced and excessive metrics cannot create rewards', () => {
  for (const value of [NaN, Infinity, -1, 0.5, '8', 101, Number.MAX_SAFE_INTEGER]) {
    assert.equal(calculateReward('flash', flash('s', { correct: value }).metrics), 0);
  }
  for (const metrics of [null, [], {}, { total: 1, correct: 1, level: 9 }, flash('s', { completed: 'true' }).metrics, flash('s', { retry: 1 }).metrics]) {
    assert.equal(calculateReward('flash', metrics), 0);
  }
  assert.equal(calculateReward('read', { retellingLength: Infinity, correct: 0, hasQuiz: false }), 0);
  assert.equal(calculateReward('read', { retellingLength: 20, correct: 999, hasQuiz: true }), 0);
  assert.equal(calculateReward('grid', { size: 10, errors: 0, completed: true }), 0);
  assert.equal(calculateReward('grid', { size: 3, errors: -1, completed: true }), 0);
  assert.equal(calculateReward('__proto__', {}), 0);
});

test('session settlement is once-only and does not add history or automatic pet XP', () => {
  const player = playerWithCoins();
  adoptPet(player, 'leaf-cat');
  assert.deepEqual(awardSession(player, flash()), { awarded: 29, duplicate: false });
  const afterFirst = structuredClone(player);
  assert.deepEqual(awardSession(player, flash()), { awarded: 0, duplicate: true });
  assert.deepEqual(player, afterFirst);
  assert.equal(player.coins, 949);
  assert.equal(player.totalScore, 1029);
  assert.equal(player.stats.sessions, 1);
  assert.equal(player.stats.best.flash, 29);
  assert.deepEqual(player.history, []);
  assert.equal(player.pets[0].xp, 0);
});

test('invalid settlements do not mutate data and the settlement ledger is capped', () => {
  const player = playerWithCoins();
  const before = structuredClone(player);
  for (const session of [null, {}, flash('', {}), flash('bad id', {}), flash('s', { correct: -1 }), { id: 's', mode: 'other', metrics: {} }]) {
    assert.deepEqual(awardSession(player, session), { awarded: 0, duplicate: false });
    assert.deepEqual(player, before);
  }
  for (let i = 0; i < 1005; i++) awardSession(player, flash(`s_${i}`, { correct: 0, completed: false }));
  assert.equal(player.settledSessions.length, 1000);
  assert.equal(player.settledSessions[0], 's_5');
  assert.equal(player.stats.sessions, 1005);
});

test('adoption has exact prices and never spends on failed or repeated requests', () => {
  assert.deepEqual(PETS.map(({ id, cost }) => [id, cost]), [['leaf-cat', 80], ['cloud-bunny', 120], ['star-fox', 180]]);
  const poor = playerWithCoins(79);
  const before = structuredClone(poor);
  assert.equal(adoptPet(poor, 'leaf-cat').ok, false);
  assert.equal(adoptPet(poor, 'unknown').ok, false);
  assert.deepEqual(poor, before);
  const player = playerWithCoins(80);
  assert.equal(adoptPet(player, 'leaf-cat').ok, true);
  assert.equal(player.coins, 0);
  assert.equal(player.totalScore, 80);
  assert.equal(player.activePetId, 'leaf-cat');
  const adopted = structuredClone(player);
  assert.equal(adoptPet(player, 'leaf-cat').ok, false);
  assert.deepEqual(player, adopted);
});

test('feeding costs fifteen and grants twenty XP, stopping at the maximum level', () => {
  const player = playerWithCoins(1000);
  adoptPet(player, 'leaf-cat');
  assert.equal(feedPet(player, 'leaf-cat').ok, true);
  assert.equal(player.coins, 905);
  assert.equal(player.pets[0].xp, 20);
  assert.equal(feedPet(player, 'leaf-cat').ok, true);
  assert.equal(petProgress(player.pets[0].xp).level, 2);
  for (let i = 0; i < 48; i++) assert.equal(feedPet(player, 'leaf-cat').ok, true);
  assert.equal(player.pets[0].xp, 990);
  assert.equal(player.coins, 170);
  assert.equal(player.totalScore, 1000);
  const full = structuredClone(player);
  assert.equal(feedPet(player, 'leaf-cat').ok, false);
  assert.deepEqual(player, full);
  player.coins = 14;
  player.pets[0].xp = 0;
  const poor = structuredClone(player);
  assert.equal(feedPet(player, 'leaf-cat').ok, false);
  assert.equal(feedPet(player, 'star-fox').ok, false);
  assert.deepEqual(player, poor);
});

test('pet progress matches every level threshold and all three growth stages', () => {
  const thresholds = [0, 30, 80, 150, 240, 350, 480, 630, 800, 990];
  thresholds.forEach((xp, i) => {
    const progress = petProgress(xp);
    assert.equal(progress.level, i + 1);
    assert.equal(progress.xp, xp);
    assert.equal(progress.current, 0);
    assert.equal(progress.next, thresholds[i + 1] === undefined ? 0 : thresholds[i + 1] - xp);
    assert.equal(progress.percent, i === 9 ? 100 : 0);
    assert.equal(progress.stage, i < 3 ? '幼崽' : i < 6 ? '伙伴' : '守护者');
    if (xp) assert.equal(petProgress(xp - 1).level, i);
  });
  assert.equal(petProgress(-1).xp, 0);
  assert.equal(petProgress(Infinity).xp, 0);
  assert.equal(petProgress(99999999).xp, 990);
  assert.equal(petProgress(15).percent, 50);
});

test('player data is independent, including nested records and pets', () => {
  const first = playerWithCoins(100);
  const second = createPlayer('p_second', '第二位');
  awardSession(first, flash());
  adoptPet(first, 'leaf-cat');
  first.history.push({ mode: 'flash', at: 1, summary: '完成' });
  assert.deepEqual(second, createPlayer('p_second', '第二位'));
  assert.equal(first.stats.sessions, 1);
  assert.equal(second.stats.sessions, 0);
});

test('sanitization filters malformed imports, bounds numbers, and selects explicit fields', () => {
  const raw = JSON.parse('{"id":"p_one","name":"  小读者  ","coins":-30,"totalScore":1e100,"pets":[{"id":"leaf-cat","xp":1e100},{"id":"leaf-cat","xp":3},{"id":"oops","xp":5}],"activePetId":"oops","settledSessions":["good","good",7,"bad id"],"stats":{"sessions":1e100,"best":{"flash":-1,"read":"100","grid":null}},"__proto__":{"polluted":true}}');
  const clean = sanitizePlayer(raw);
  assert.equal(clean.name, '小读者');
  assert.equal(clean.coins, 0);
  assert.equal(clean.totalScore, 1000000000);
  assert.deepEqual(clean.pets, [{ id: 'leaf-cat', xp: 990 }]);
  assert.equal(clean.activePetId, 'leaf-cat');
  assert.deepEqual(clean.settledSessions, ['good']);
  assert.deepEqual(clean.stats, { sessions: 1000000, best: { flash: 0, read: 0, grid: 0 } });
  assert.equal(Object.hasOwn(clean, '__proto__'), false);
  assert.equal({}.polluted, undefined);
  clean.pets[0].xp = 10;
  assert.notEqual(raw.pets[0].xp, 10);
  for (const bad of [null, [], {}, { id: 'bad id', name: '读者' }, { id: 'p_one', name: '' }, { id: 'p_one', name: 1 }]) assert.equal(sanitizePlayer(bad), null);
});

test('imported history retains scores without granting any retrospective points', () => {
  const history = [
    { mode: 'flash', at: 1, summary: '旧训练', retelling: '原记录' },
    { mode: 'read', at: 2, summary: '故事', retelling: '复述', id: 's_2', score: 35, unexpected: 'discard' },
    { mode: 'grid', at: 3, summary: '查找', score: -5 },
    { mode: 'bad', at: 4, summary: '无效' },
    { mode: 'flash', at: NaN, summary: '无效' },
    { mode: 'read', at: 5, summary: '字'.repeat(400), retelling: '字'.repeat(21000), score: NaN }
  ];
  const result = sanitizePlayer({ id: 'p_one', name: '读者', history });
  assert.equal(result.coins, 0);
  assert.equal(result.totalScore, 0);
  assert.equal(result.history.length, 4);
  assert.equal(Object.hasOwn(result.history[0], 'score'), false);
  assert.deepEqual(result.history[1], { mode: 'read', at: 2, summary: '故事', retelling: '复述', id: 's_2', score: 35 });
  assert.equal(result.history[2].score, 0);
  assert.equal(result.history[3].summary.length, 300);
  assert.equal(result.history[3].retelling.length, 20000);
  assert.equal(result.history[3].score, 0);
});

test('balances cannot overflow and malformed live wallets cannot be spent', () => {
  const player = playerWithCoins(999999999);
  assert.deepEqual(awardSession(player, flash()), { awarded: 1, duplicate: false });
  assert.equal(player.coins, 1000000000);
  assert.equal(player.totalScore, 1000000000);
  for (const invalid of [NaN, -1, Infinity, '100', 1e50]) {
    player.coins = invalid;
    const before = structuredClone(player);
    assert.equal(adoptPet(player, 'leaf-cat').ok, false);
    assert.equal(feedPet(player, 'leaf-cat').ok, false);
    assert.deepEqual(awardSession(player, flash('s_bad')), { awarded: 0, duplicate: false });
    assert.deepEqual(player, before);
  }
  assert.equal(sanitizePlayer({ id: 'p_one', name: '读者', coins: 100, totalScore: 20 }).coins, 20);
});
