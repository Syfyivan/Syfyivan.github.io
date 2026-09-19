import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Load browser ES modules without changing the Hexo package's CommonJS settings.
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const source = async name => readFile(new URL(`../source/reading-lab/${name}.js`, import.meta.url), 'utf8');
const rewardsUrl = moduleUrl(await source('rewards'));
const coreUrl = moduleUrl(await source('core'));
const storeSource = (await source('player-store'))
  .replace("'./rewards.js'", JSON.stringify(rewardsUrl))
  .replace("'./core.js'", JSON.stringify(coreUrl));
const { restoreState, importPlayers, MAX_PLAYERS } = await import(moduleUrl(storeSource));
const { createPlayer, awardSession, adoptPet, feedPet } = await import(rewardsUrl);

const historyRecord = (at = 1) => ({ mode: 'read', at, summary: '故事复述已完成', retelling: '小狐狸沿着河岸找到了回家的路。' });
const session = id => ({ id, mode: 'flash', metrics: { total: 10, correct: 8, level: 2, completed: true } });
const earnedPlayer = (id, name = id) => {
  const player = createPlayer(id, name);
  awardSession(player, session(`${id}_session`));
  return player;
};

test('legacy migration preserves words, article and history without minting retrospective points', () => {
  const raw = {
    version: 1,
    words: [{ text: '缓存', type: 'zh', category: 'computer' }],
    customStory: '这是一篇留在旧版阅读实验室里的故事。',
    history: [historyRecord(), { mode: 'flash', at: 2, summary: '旧版闪视成绩', score: 500 }]
  };
  const migrated = restoreState(raw, 'legacy_owner');
  assert.equal(migrated.version, 2);
  assert.equal(migrated.activePlayerId, 'legacy_owner');
  assert.equal(migrated.players.length, 1);
  assert.equal(migrated.players[0].name, '玩家 1');
  assert.equal(migrated.players[0].coins, 0);
  assert.equal(migrated.players[0].totalScore, 0);
  assert.deepEqual(migrated.players[0].settledSessions, []);
  assert.equal(migrated.players[0].stats.sessions, 0);
  assert.equal(migrated.players[0].history[0].retelling, raw.history[0].retelling);
  assert.equal(migrated.players[0].history[1].score, 500);
  assert.equal(migrated.words[0].text, '缓存');
  assert.equal(migrated.customStory, raw.customStory);
  migrated.players[0].history[0].retelling = '后续编辑';
  assert.notEqual(raw.history[0].retelling, '后续编辑');
});

test('version two JSON round trips preserve the selected player and each independent wallet', () => {
  const first = earnedPlayer('first', '小林');
  const second = earnedPlayer('second', '小云');
  first.history.push(historyRecord(1));
  second.history.push(historyRecord(2));
  awardSession(first, session('first_second_session'));
  const raw = { version: 2, players: [first, second], activePlayerId: 'second', words: [], customStory: '' };
  const restored = restoreState(JSON.parse(JSON.stringify(raw)), 'unused_fallback');
  assert.equal(restored.activePlayerId, 'second');
  assert.deepEqual(restored.players, raw.players);
  assert.equal(restored.players[0].coins, 58);
  assert.equal(restored.players[1].coins, 29);
  restored.players[0].history[0].retelling = '只修改第一位';
  awardSession(restored.players[0], session('first_third_session'));
  assert.equal(restored.players[1].coins, 29);
  assert.equal(restored.players[1].stats.sessions, 1);
  assert.equal(restored.players[1].history[0].retelling, second.history[0].retelling);
  assert.equal(first.coins, 58);
  assert.notEqual(first.history[0].retelling, '只修改第一位');
});

test('restoring an invalid selected ID falls back to the first surviving profile', () => {
  const raw = { version: 2, activePlayerId: 'missing', players: [null, { id: 'bad id', name: '无效' }, createPlayer('valid', '有效玩家')] };
  const restored = restoreState(raw, 'fallback');
  assert.equal(restored.activePlayerId, 'valid');
  assert.deepEqual(restored.players.map(player => player.id), ['valid']);
  const empty = restoreState({ version: 2, players: [null, {}], activePlayerId: 'missing' }, 'fallback');
  assert.equal(empty.players.length, 1);
  assert.equal(empty.activePlayerId, 'fallback');
});

test('duplicate profile IDs in a restored backup keep one wallet without adding balances', () => {
  const first = earnedPlayer('same');
  const duplicate = { ...first, name: '副本', coins: 999, totalScore: 999 };
  const restored = restoreState({ version: 2, players: [first, duplicate], activePlayerId: 'same' }, 'fallback');
  assert.equal(restored.players.length, 1);
  assert.equal(restored.players[0].coins, 29);
  assert.equal(restored.players[0].totalScore, 29);
  assert.equal(restored.players[0].name, 'same');
});

test('importing a backup twice preserves existing profiles and cannot duplicate their money', () => {
  const state = restoreState({ version: 2, players: [earnedPlayer('local')], activePlayerId: 'local' }, 'fallback');
  const before = structuredClone(state.players[0]);
  const incoming = [earnedPlayer('local'), earnedPlayer('imported')];
  incoming[0].coins = 999;
  incoming[0].totalScore = 999;
  assert.deepEqual(importPlayers(state, incoming), { added: 1, skipped: 1 });
  assert.deepEqual(state.players[0], before);
  assert.equal(state.players[1].coins, 29);
  assert.equal(state.activePlayerId, 'local');
  assert.deepEqual(importPlayers(state, incoming), { added: 0, skipped: 2 });
  assert.deepEqual(state.players[0], before);
  assert.equal(state.players[1].coins, 29);
  state.players[1].coins = 1;
  assert.equal(incoming[1].coins, 29, 'imported data must not share mutable objects with its input');
});

test('duplicate IDs inside one import are counted as skipped and never merged', () => {
  const state = restoreState(null, 'local');
  state.players[0].name = '本机玩家';
  const person = earnedPlayer('incoming');
  const result = importPlayers(state, [person, { ...person, coins: 500, totalScore: 500 }, null, {}]);
  assert.deepEqual(result, { added: 1, skipped: 3 });
  assert.equal(state.players.length, 2);
  assert.equal(state.players[1].coins, 29);
});

test('restore and import enforce eight players while preserving profiles already present', () => {
  assert.equal(MAX_PLAYERS, 8);
  const incoming = Array.from({ length: 10 }, (_, index) => createPlayer(`p_${index}`, `玩家 ${index}`));
  const restored = restoreState({ version: 2, players: incoming, activePlayerId: 'p_9' }, 'fallback');
  assert.equal(restored.players.length, 8);
  assert.deepEqual(restored.players.map(player => player.id), incoming.slice(0, 8).map(player => player.id));
  assert.equal(restored.activePlayerId, 'p_0');
  const state = restoreState(null, 'local');
  state.players[0].name = '本机玩家';
  assert.deepEqual(importPlayers(state, incoming), { added: 7, skipped: 3 });
  assert.equal(state.players.length, 8);
  assert.equal(state.players[0].id, 'local');
  const before = structuredClone(state);
  assert.deepEqual(importPlayers(state, [createPlayer('ninth', '第九位')]), { added: 0, skipped: 1 });
  assert.deepEqual(state, before);
});

test('a full eight-player backup replaces only the fresh empty placeholder and all players survive', () => {
  const state = restoreState(null, 'fresh_placeholder');
  const incoming = Array.from({ length: 8 }, (_, index) => earnedPlayer(`backup_${index}`, `备份玩家 ${index}`));
  assert.deepEqual(importPlayers(state, incoming), { added: 8, skipped: 0 });
  assert.deepEqual(state.players, incoming);
  assert.equal(state.activePlayerId, 'backup_0');
  assert.equal(state.players.some(player => player.id === 'fresh_placeholder'), false);
  assert.deepEqual(importPlayers(state, incoming), { added: 0, skipped: 8 });
  assert.deepEqual(state.players, incoming);
});

test('a renamed zero-point player and any default profile with saved progress are never removed', () => {
  const changes = [
    player => { player.name = '我的昵称'; },
    player => { player.history.push(historyRecord()); },
    player => { player.totalScore = 1; },
    player => { player.coins = 1; player.totalScore = 1; },
    player => { player.pets.push({ id: 'leaf-cat', xp: 0 }); player.activePetId = 'leaf-cat'; },
    player => { player.stats.sessions = 1; },
    player => { player.stats.best.flash = 1; },
    player => { player.stats.best.read = 1; },
    player => { player.stats.best.grid = 1; },
    player => { player.settledSessions.push('previous_session'); }
  ];
  for (const change of changes) {
    const state = restoreState(null, 'local');
    change(state.players[0]);
    const original = structuredClone(state.players[0]);
    assert.deepEqual(importPlayers(state, [earnedPlayer('incoming')]), { added: 1, skipped: 0 });
    assert.equal(state.players.length, 2);
    assert.deepEqual(state.players[0], original);
    assert.equal(state.activePlayerId, 'local');
  }
});

test('empty, invalid and same-ID imports cannot remove the fresh placeholder', () => {
  for (const incoming of [[], [null, {}], [earnedPlayer('local')], [null, earnedPlayer('local')]]) {
    const state = restoreState(null, 'local');
    const before = structuredClone(state);
    assert.deepEqual(importPlayers(state, incoming), { added: 0, skipped: incoming.length });
    assert.deepEqual(state, before);
  }
});

test('replacing a placeholder still skips its original ID if a backup also contains a new player', () => {
  const state = restoreState(null, 'local');
  assert.deepEqual(importPlayers(state, [earnedPlayer('local'), earnedPlayer('incoming')]), { added: 1, skipped: 1 });
  assert.deepEqual(state.players.map(player => player.id), ['incoming']);
  assert.equal(state.activePlayerId, 'incoming');
  assert.equal(state.players[0].coins, 29);
});

test('invalid top-level JSON values and malformed fields recover to a usable default', () => {
  for (const raw of [null, undefined, false, true, 0, 3.14, 'text', [], {}, { words: {} }, { version: 2, players: 'wrong type' }]) {
    const state = restoreState(raw, 'fallback');
    assert.deepEqual(state.players, [createPlayer('fallback', '玩家 1')]);
    assert.equal(state.activePlayerId, 'fallback');
    assert.deepEqual(state.words, []);
    assert.equal(state.customStory, '');
  }
  const state = restoreState(null, 'local');
  const before = structuredClone(state);
  for (const raw of [null, undefined, false, 4, 'text', {}]) {
    assert.deepEqual(importPlayers(state, raw), { added: 0, skipped: 0 });
    assert.deepEqual(state, before);
  }
});

test('restoring or importing a settled session retains its once-only reward protection', () => {
  const original = earnedPlayer('owner');
  const restored = restoreState({ version: 2, players: [original] }, 'fallback');
  const player = restored.players[0];
  const before = structuredClone(player);
  assert.deepEqual(awardSession(player, session('owner_session')), { awarded: 0, duplicate: true });
  assert.deepEqual(player, before);
  const importedState = restoreState(null, 'other');
  importPlayers(importedState, [original]);
  const imported = importedState.players.find(player => player.id === 'owner');
  assert.deepEqual(awardSession(imported, session('owner_session')), { awarded: 0, duplicate: true });
  assert.equal(imported.coins, 29);
  assert.equal(imported.totalScore, 29);
});

test('spending and backup restore retain cumulative score, remaining coins and pet growth separately', () => {
  const player = earnedPlayer('owner');
  awardSession(player, session('second'));
  awardSession(player, session('third'));
  assert.equal(player.totalScore, 87);
  assert.equal(adoptPet(player, 'leaf-cat').ok, true);
  assert.equal(player.coins, 7);
  assert.equal(player.totalScore, 87);
  awardSession(player, session('fourth'));
  assert.equal(feedPet(player, 'leaf-cat').ok, true);
  assert.equal(player.coins, 21);
  assert.equal(player.totalScore, 116);
  assert.equal(player.pets[0].xp, 20);
  const restored = restoreState(JSON.parse(JSON.stringify({ version: 2, players: [player], activePlayerId: player.id })), 'fallback');
  assert.deepEqual(restored.players[0], player);
  assert.equal(restored.players[0].coins, 21);
  assert.equal(restored.players[0].totalScore, 116);
  assert.equal(restored.players[0].pets[0].xp, 20);
});
