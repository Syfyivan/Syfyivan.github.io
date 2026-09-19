import { createPlayer, sanitizePlayer } from './rewards.js';
import { parseWords } from './core.js';

export const MAX_PLAYERS = 8;
export const STORAGE_KEY = 'reading-lab-v2';
export const LEGACY_KEY = 'reading-lab-v1';
export const newId = () => crypto.randomUUID();

export function restoreState(raw, fallbackId) {
  const state = { version: 2, words: [], customStory: '', players: [], activePlayerId: '' };
  if (raw && typeof raw === 'object') {
    state.words = parseWords(JSON.stringify({ words: raw.words || [] })).words;
    state.customStory = typeof raw.customStory === 'string' ? raw.customStory.slice(0, 20000) : '';
    if (raw.version === 2 && Array.isArray(raw.players)) {
      const ids = new Set();
      state.players = raw.players.map(sanitizePlayer).filter(player => {
        if (!player || ids.has(player.id) || ids.size >= MAX_PLAYERS) return false;
        ids.add(player.id);
        return true;
      });
    }
    if (!state.players.length) {
      const legacy = createPlayer(fallbackId, '玩家 1');
      legacy.history = Array.isArray(raw.history) ? raw.history : [];
      state.players.push(sanitizePlayer(legacy));
    }
    state.activePlayerId = state.players.some(player => player.id === raw.activePlayerId)
      ? raw.activePlayerId : state.players[0].id;
  }
  if (!state.players.length) {
    state.players.push(createPlayer(fallbackId, '玩家 1'));
    state.activePlayerId = fallbackId;
  }
  return state;
}

// Import as separate profiles; never add an imported wallet to an existing one.
export function importPlayers(state, incoming) {
  let added = 0, skipped = 0;
  const players = (Array.isArray(incoming) ? incoming : []).map(sanitizePlayer);
  const existingIds = new Set(state.players.map(player => player.id));
  const placeholder = state.players.length === 1 ? state.players[0] : null;
  // A fresh browser's empty default must not take a slot from an eight-player backup.
  // Renamed profiles, old practice records and even zero-point sessions are user data.
  if (placeholder?.name === '玩家 1' && placeholder.coins === 0 && placeholder.totalScore === 0 &&
      placeholder.history.length === 0 && placeholder.pets.length === 0 && placeholder.settledSessions.length === 0 &&
      placeholder.stats.sessions === 0 && ['flash', 'read', 'grid'].every(mode => placeholder.stats.best[mode] === 0) &&
      players.some(player => player && !existingIds.has(player.id))) {
    state.players = [];
  }
  for (const player of players) {
    if (!player || existingIds.has(player.id) || state.players.length >= MAX_PLAYERS) {
      skipped++;
      continue;
    }
    state.players.push(player);
    existingIds.add(player.id);
    added++;
  }
  if (!state.players.some(player => player.id === state.activePlayerId)) state.activePlayerId = state.players[0].id;
  return { added, skipped };
}
