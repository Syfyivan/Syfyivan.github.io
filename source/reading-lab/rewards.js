// Local player rewards. Backups are user-editable; this is a practice game, not a trusted economy.
export const PETS = Object.freeze([
  Object.freeze({ id: 'leaf-cat', name: '叶叶猫', description: '把每次专注，收进一片新叶子。', cost: 80, color: '#62a68a' }),
  Object.freeze({ id: 'cloud-bunny', name: '云团兔', description: '陪你轻轻跃过，一行又一行故事。', cost: 120, color: '#9e91cc' }),
  Object.freeze({ id: 'star-fox', name: '星星狐', description: '把读懂的世界，点成闪亮的星星。', cost: 180, color: '#d2a04d' })
]);

const MODES = ['flash', 'read', 'grid'];
const MAX_SCORE = 1000000000;
const MAX_SESSIONS = 1000000;
const LEVEL_XP = [0, 30, 80, 150, 240, 350, 480, 630, 800, 990];
const FEED_COST = 15;
const FEED_XP = 20;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const bounded = (value, max) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
const validId = (value, max = 80) => typeof value === 'string' && value.length > 0 && value.length <= max && /^[A-Za-z0-9_-]+$/.test(value);
const validName = value => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 24;
const optionalBoolean = value => value === undefined || typeof value === 'boolean';

export function createPlayer(id, name) {
  if (!validId(id) || !validName(name)) throw new TypeError('玩家编号或昵称不符合要求。');
  return {
    id, name: name.trim(), coins: 0, totalScore: 0, pets: [], activePetId: null,
    history: [], settledSessions: [], stats: { sessions: 0, best: { flash: 0, read: 0, grid: 0 } }
  };
}

function validMetrics(mode, metrics) {
  if (!object(metrics)) return false;
  if (mode === 'flash') {
    return integer(metrics.total, 1, 100) && integer(metrics.correct, 0, metrics.total) &&
      integer(metrics.level, 1, 4) && optionalBoolean(metrics.completed) && optionalBoolean(metrics.retry);
  }
  if (mode === 'read') {
    return integer(metrics.retellingLength, 0, 20000) && integer(metrics.correct, 0, 20) &&
      typeof metrics.hasQuiz === 'boolean' && (metrics.hasQuiz || metrics.correct === 0) &&
      (metrics.quizTotal === undefined || (integer(metrics.quizTotal, 0, 20) && metrics.correct <= metrics.quizTotal));
  }
  if (mode === 'grid') {
    return [3, 4, 5].includes(metrics.size) && integer(metrics.errors, 0, 100000) && optionalBoolean(metrics.completed);
  }
  return false;
}

export function calculateReward(mode, metrics) {
  if (!validMetrics(mode, metrics)) return 0;
  if (mode === 'flash') {
    if (metrics.retry) return metrics.correct;
    return metrics.correct * (metrics.level + 1) + (metrics.completed && metrics.total >= 5 ? 5 : 0);
  }
  if (mode === 'read') return metrics.retellingLength < 20 ? 0 : metrics.hasQuiz ? 20 + metrics.correct * 5 : 10;
  return metrics.completed ? Math.max(5, ({ 3: 15, 4: 25, 5: 40 })[metrics.size] - metrics.errors * 2) : 0;
}

function usablePlayer(player) {
  return object(player) && validId(player.id) && validName(player.name) &&
    integer(player.coins, 0, MAX_SCORE) && integer(player.totalScore, player.coins, MAX_SCORE) &&
    Array.isArray(player.pets) && player.pets.length <= PETS.length &&
    player.pets.every(pet => object(pet) && PETS.some(type => type.id === pet.id) && integer(pet.xp, 0, LEVEL_XP.at(-1))) &&
    new Set(player.pets.map(pet => pet.id)).size === player.pets.length &&
    Array.isArray(player.settledSessions) && player.settledSessions.length <= 1000 &&
    player.settledSessions.every(id => validId(id, 120)) &&
    object(player.stats) && integer(player.stats.sessions, 0, MAX_SESSIONS) && object(player.stats.best) &&
    MODES.every(mode => integer(player.stats.best[mode], 0, MAX_SCORE));
}

export function awardSession(player, session) {
  if (!usablePlayer(player) || !object(session) || !validId(session.id, 120) || !validMetrics(session.mode, session.metrics)) {
    return { awarded: 0, duplicate: false };
  }
  if (player.settledSessions.includes(session.id)) return { awarded: 0, duplicate: true };
  const score = calculateReward(session.mode, session.metrics);
  const awarded = Math.min(score, MAX_SCORE - player.totalScore);
  player.coins += awarded;
  player.totalScore += awarded;
  player.stats.sessions = Math.min(MAX_SESSIONS, player.stats.sessions + 1);
  player.stats.best[session.mode] = Math.max(player.stats.best[session.mode], awarded);
  player.settledSessions.push(session.id);
  player.settledSessions = player.settledSessions.slice(-1000);
  return { awarded, duplicate: false };
}

export function adoptPet(player, petId) {
  if (!usablePlayer(player)) return { ok: false, message: '玩家数据无法读取，请恢复有效备份。' };
  const type = PETS.find(pet => pet.id === petId);
  if (!type) return { ok: false, message: '这只宠物还没有来到商店。' };
  if (player.pets.some(pet => pet.id === petId)) return { ok: false, message: '你已经有这位伙伴了。' };
  if (player.coins < type.cost) return { ok: false, message: `还差 ${type.cost - player.coins} 积分，继续练习就能带它回家。` };
  player.coins -= type.cost;
  player.pets.push({ id: petId, xp: 0 });
  player.activePetId = petId;
  return { ok: true, message: `${type.name}加入了你的阅读旅程！` };
}

export function feedPet(player, petId) {
  if (!usablePlayer(player)) return { ok: false, message: '玩家数据无法读取，请恢复有效备份。' };
  const pet = player.pets.find(item => item.id === petId);
  if (!pet) return { ok: false, message: '先兑换这位伙伴，再来喂养吧。' };
  if (pet.xp >= LEVEL_XP.at(-1)) return { ok: false, message: '伙伴已经满级啦，积分留给下一位伙伴吧。' };
  if (player.coins < FEED_COST) return { ok: false, message: `喂养需要 ${FEED_COST} 积分，还差 ${FEED_COST - player.coins} 积分。` };
  const before = petProgress(pet.xp).level;
  player.coins -= FEED_COST;
  pet.xp = Math.min(LEVEL_XP.at(-1), pet.xp + FEED_XP);
  const after = petProgress(pet.xp).level;
  return { ok: true, message: after > before ? `伙伴升到 Lv.${after} 了！` : '伙伴吃饱啦，获得了 20 点成长值。' };
}

export function petProgress(value) {
  const xp = bounded(value, LEVEL_XP.at(-1));
  let level = 1;
  while (level < LEVEL_XP.length && xp >= LEVEL_XP[level]) level++;
  const full = level === LEVEL_XP.length;
  const current = full ? 0 : xp - LEVEL_XP[level - 1];
  const next = full ? 0 : LEVEL_XP[level] - LEVEL_XP[level - 1];
  return { level, xp, current, next, percent: full ? 100 : Math.round(current / next * 100), stage: level <= 3 ? '幼崽' : level <= 6 ? '伙伴' : '守护者' };
}

// Explicit field selection prevents imported objects from adding runtime properties.
// History remains a record only: importing or migrating never awards historical points.
export function sanitizePlayer(raw) {
  if (!object(raw) || !validId(raw.id) || typeof raw.name !== 'string' || !raw.name.trim()) return null;
  const player = createPlayer(raw.id, raw.name.trim().slice(0, 24));
  player.totalScore = bounded(raw.totalScore, MAX_SCORE);
  player.coins = Math.min(player.totalScore, bounded(raw.coins, MAX_SCORE));
  const pets = Array.isArray(raw.pets) ? raw.pets.slice(0, 100) : [];
  for (const pet of pets) {
    if (!object(pet) || !PETS.some(type => type.id === pet.id) || player.pets.some(item => item.id === pet.id)) continue;
    player.pets.push({ id: pet.id, xp: bounded(pet.xp, LEVEL_XP.at(-1)) });
  }
  player.activePetId = player.pets.some(pet => pet.id === raw.activePetId) ? raw.activePetId : player.pets[0]?.id || null;
  player.settledSessions = [...new Set(Array.isArray(raw.settledSessions) ? raw.settledSessions.filter(id => validId(id, 120)).slice(-1000) : [])];
  const history = Array.isArray(raw.history) ? raw.history : [];
  player.history = history.filter(item => object(item) && MODES.includes(item.mode) &&
    integer(item.at, 0, 8640000000000000) && typeof item.summary === 'string').slice(0, 100).map(item => {
    const record = {
      mode: item.mode, at: item.at, summary: item.summary.slice(0, 300),
      retelling: typeof item.retelling === 'string' ? item.retelling.slice(0, 20000) : ''
    };
    if (validId(item.id, 120)) record.id = item.id;
    if (item.score !== undefined) record.score = bounded(item.score, MAX_SCORE);
    return record;
  });
  const stats = object(raw.stats) ? raw.stats : {};
  const best = object(stats.best) ? stats.best : {};
  player.stats.sessions = bounded(stats.sessions, MAX_SESSIONS);
  for (const mode of MODES) player.stats.best[mode] = bounded(best[mode], MAX_SCORE);
  return player;
}
