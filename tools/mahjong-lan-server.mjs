import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const staticRoot = resolve(repoRoot, "source", "mahjong");
const defaultPort = Number(process.env.PORT || 8787);
const rooms = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

const tileDefinitions = [
  ...["万", "筒", "条"].flatMap((suit, suitIndex) =>
    Array.from({ length: 9 }, (_, index) => ({
      label: String(index + 1) + suit,
      numberTile: true,
      type: suitIndex * 9 + index
    }))
  ),
  ..."东南西北中发白".split("").map((label, index) => ({
    label,
    numberTile: false,
    type: 27 + index
  }))
];

const variants = {
  sichuan: {
    key: "sichuan",
    label: "川麻",
    tileTypes: Array.from({ length: 27 }, (_, index) => index),
    allowChow: false,
    rules: ["108 张数牌，无风箭字牌", "不能吃牌，可碰、杠、胡", "基础胡牌判定，暂不计定缺、血战与番型"],
    detailedRules: [
      {
        title: "牌组",
        items: ["使用万、筒、条三门数牌，共 108 张。", "不使用东南西北中发白。"]
      },
      {
        title: "操作",
        items: ["不能吃牌。", "可以碰、明杠、暗杠、胡。", "杠后立即补摸一张。"]
      },
      {
        title: "胡牌",
        items: ["本版川麻先使用基础胡牌判定：4 组面子 + 1 对将，或七对子。", "暂不实现定缺、血战到底和完整番型。"]
      }
    ]
  },
  dongbei: {
    key: "dongbei",
    label: "东北麻将",
    tileTypes: Array.from({ length: 34 }, (_, index) => index),
    allowChow: true,
    usesBao: true,
    winRules: {
      requireTerminalOrHonor: true,
      requireAllNumberSuits: true,
      requireExactPair: true
    },
    rules: [
      "136 张，含东南西北中发白",
      "可吃、碰、杠、胡，吃牌仅下家",
      "胡牌需有对子、幺九或字牌，且万筒条不缺门",
      "开局从牌山尾端扣 1 张作宝牌",
      "未上听不可看宝，上听后摸到同名宝牌可摸宝胡"
    ],
    detailedRules: [
      {
        title: "牌组和人数",
        items: [
          "使用 136 张：万、筒、条各 1-9 四张，东南西北中发白各四张。",
          "三人局和四人局都按同一套牌组发牌；三人局只是少一个玩家座位。",
          "庄家起手 14 张，其余玩家起手 13 张。"
        ]
      },
      {
        title: "吃碰杠",
        items: [
          "可以吃、碰、杠；吃牌只能吃上家刚打出的牌。",
          "东南西北和中发白不能吃，只能碰、明杠或暗杠。",
          "风牌杠和箭牌杠都算一组刻子面子；杠后立即从牌山补摸一张。",
          "本版先不单独计算风杠、箭杠、明杠、暗杠的分数，也暂不做抢杠胡。"
        ]
      },
      {
        title: "基础胡牌结构",
        items: [
          "普通胡必须能拆成 4 组面子 + 1 对将；面子可以是顺子、刻子或杠。",
          "东北局必须有对子才能胡；本版要求将牌在整副牌里正好两张，不把刻子拆成将。",
          "七对子作为特殊牌型保留，也必须满足下面的东北附加条件。",
          "对对胡/漂胡属于 4 组刻子或杠 + 1 对将，本版允许胡，但仍要满足幺九/字牌和不缺门。"
        ]
      },
      {
        title: "东北附加胡牌条件",
        items: [
          "胡牌的整副牌必须至少含 1 张幺九或字牌：1、9，或东南西北中发白。",
          "胡牌的整副牌不能缺门：万、筒、条三门都要至少出现一张；字牌不算一门。",
          "这些条件会同时用于上听判断、点炮胡、自摸胡和摸宝胡。"
        ]
      },
      {
        title: "宝牌和上听",
        items: [
          "开局发完牌后，从牌山尾端扣下 1 张作为宝牌。",
          "未上听时只能看到宝牌背面；上听后可以看到具体宝牌。",
          "上听后如果新摸到与宝牌同名的牌，可以点“摸宝胡”。",
          "本版自动判定上听，不做手动报听锁手；换吃、碰、杠后会重新判听。"
        ]
      }
    ]
  }
};

const botNames = ["牌搭子一号", "牌搭子二号", "牌搭子三号", "牌搭子四号"];

function tileName(type) {
  return tileDefinitions[type]?.label || "未知牌";
}

function normalizeVariant(value) {
  return variants[String(value || "").toLowerCase()]?.key || "sichuan";
}

function normalizeSeatCount(value) {
  const count = Number(value);
  return count === 4 ? 4 : 3;
}

function makeConfig(options = {}) {
  const variant = normalizeVariant(options.variant);
  return {
    variant,
    seatCount: normalizeSeatCount(options.seatCount)
  };
}

function variantFor(room) {
  return variants[room.config.variant] || variants.sichuan;
}

function roomSeatCount(room) {
  return normalizeSeatCount(room.config.seatCount);
}

function roomConfigLabel(room) {
  return variantFor(room).label + " · " + roomSeatCount(room) + "人局";
}

function sanitizeName(value) {
  return String(value || "玩家").trim().slice(0, 16) || "玩家";
}

function normalizeRoom(value) {
  const normalized = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return normalized || "ROOM1";
}

function log(room, text) {
  room.events.push(text);
  if (room.events.length > 60) {
    room.events.splice(0, room.events.length - 60);
  }
}

function makeRoom(code, options) {
  return {
    code,
    config: makeConfig(options),
    players: [],
    phase: "lobby",
    round: 0,
    dealerSeat: 0,
    currentSeat: 0,
    turnDrawn: false,
    wall: [],
    bao: null,
    dice: null,
    lastDiscard: null,
    discardHistory: [],
    pending: null,
    botTimer: null,
    result: "",
    events: ["房间已创建"]
  };
}

function makePlayer(id, name, seat, bot = false) {
  return {
    id,
    name,
    seat,
    bot,
    connected: bot,
    ready: bot,
    hand: [],
    melds: [],
    discards: [],
    drawnTileId: null,
    ting: false,
    waitingTypes: [],
    peer: null
  };
}

function isBot(player) {
  return Boolean(player && player.bot);
}

function connectedOrBot(player) {
  return isBot(player) || player.connected;
}

function getRoom(code, options) {
  const roomCode = normalizeRoom(code);
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, makeRoom(roomCode, options));
  }
  return rooms.get(roomCode);
}

function playerBySeat(room, seat) {
  return room.players.find((player) => player.seat === seat);
}

function currentPlayer(room) {
  return playerBySeat(room, room.currentSeat);
}

function nextSeat(room, seat) {
  return (seat + 1) % roomSeatCount(room);
}

function nextPlayer(room, seat) {
  return playerBySeat(room, nextSeat(room, seat));
}

function nextOpenSeat(room) {
  for (let seat = 0; seat < roomSeatCount(room); seat += 1) {
    if (!playerBySeat(room, seat)) {
      return seat;
    }
  }
  return room.players.length;
}

function sortHand(player) {
  player.hand.sort((a, b) => a.type - b.type || String(a.id).localeCompare(String(b.id)));
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = current;
  }
  return items;
}

function buildWall(room) {
  const wall = [];
  let tileId = 0;
  variantFor(room).tileTypes.forEach((type) => {
    for (let copy = 0; copy < 4; copy += 1) {
      tileId += 1;
      wall.push({ id: "r" + room.round + "-t" + tileId, type });
    }
  });
  return shuffle(wall);
}

function countType(hand, type) {
  return hand.reduce((count, tile) => count + (tile.type === type ? 1 : 0), 0);
}

function typeCounts(types) {
  const counts = Array(tileDefinitions.length).fill(0);
  types.forEach((type) => {
    counts[type] += 1;
  });
  return counts;
}

function isTerminalOrHonor(type) {
  return type >= 27 || type % 9 === 0 || type % 9 === 8;
}

function numberSuitIndex(type) {
  return type < 27 ? Math.floor(type / 9) : -1;
}

function allMeldTypes(player) {
  return player.melds.flatMap((meld) => meld.tiles || []);
}

function canFormMelds(counts, meldsNeeded) {
  if (meldsNeeded === 0) {
    return counts.every((count) => count === 0);
  }

  const first = counts.findIndex((count) => count > 0);
  if (first === -1) {
    return false;
  }

  if (counts[first] >= 3) {
    counts[first] -= 3;
    if (canFormMelds(counts, meldsNeeded - 1)) {
      counts[first] += 3;
      return true;
    }
    counts[first] += 3;
  }

  const rank = first % 9;
  const suitStart = first - rank;
  if (first < 27 && rank <= 6 && first + 2 < suitStart + 9 && counts[first + 1] > 0 && counts[first + 2] > 0) {
    counts[first] -= 1;
    counts[first + 1] -= 1;
    counts[first + 2] -= 1;
    if (canFormMelds(counts, meldsNeeded - 1)) {
      counts[first] += 1;
      counts[first + 1] += 1;
      counts[first + 2] += 1;
      return true;
    }
    counts[first] += 1;
    counts[first + 1] += 1;
    counts[first + 2] += 1;
  }

  return false;
}

function isSevenPairs(types) {
  if (types.length !== 14) {
    return false;
  }
  const counts = typeCounts(types);
  return counts.filter((count) => count === 2).length === 7;
}

function winningShape(types, meldCount = 0) {
  const concealedTypes = types.slice().sort((a, b) => a - b);
  const meldsNeeded = 4 - meldCount;
  if (meldsNeeded < 0) {
    return null;
  }
  if (meldCount === 0 && isSevenPairs(concealedTypes)) {
    return { kind: "sevenPairs", pairType: null };
  }
  if (concealedTypes.length !== meldsNeeded * 3 + 2) {
    return null;
  }

  const counts = typeCounts(concealedTypes);
  for (let pair = 0; pair < counts.length; pair += 1) {
    if (counts[pair] < 2) {
      continue;
    }
    counts[pair] -= 2;
    if (canFormMelds(counts, meldsNeeded)) {
      counts[pair] += 2;
      return { kind: "standard", pairType: pair };
    }
    counts[pair] += 2;
  }
  return null;
}

function satisfiesVariantWinRules(variant, allTypes, shape) {
  const rules = variant.winRules || {};
  if (rules.requireExactPair && shape.kind === "standard" && typeCounts(allTypes)[shape.pairType] !== 2) {
    return false;
  }
  if (rules.requireTerminalOrHonor && !allTypes.some(isTerminalOrHonor)) {
    return false;
  }
  if (rules.requireAllNumberSuits) {
    const suits = new Set(allTypes.map(numberSuitIndex).filter((suit) => suit >= 0));
    if (suits.size < 3) {
      return false;
    }
  }
  return true;
}

export function canWinTypes(types, meldCount = 0, options = {}) {
  const shape = winningShape(types, meldCount);
  if (!shape) {
    return false;
  }
  const variant = variants[options.variant] || null;
  if (variant && !satisfiesVariantWinRules(variant, options.allTypes || types, shape)) {
    return false;
  }
  return true;
}

function winOptions(room, player, extraType) {
  const concealedTypes = player.hand.map((tile) => tile.type);
  if (typeof extraType === "number") {
    concealedTypes.push(extraType);
  }
  return {
    variant: variantFor(room).key,
    allTypes: concealedTypes.concat(allMeldTypes(player))
  };
}

function canWinPlayer(room, player, extraTile) {
  const types = player.hand.map((tile) => tile.type);
  if (extraTile) {
    types.push(extraTile.type);
  }
  return canWinTypes(types, player.melds.length, winOptions(room, player, extraTile?.type));
}

function waitingTypes(room, player) {
  const variant = variantFor(room);
  const types = player.hand.map((tile) => tile.type);
  return variant.tileTypes.filter((type) => {
    if (types.filter((item) => item === type).length >= 4) {
      return false;
    }
    return canWinTypes(types.concat(type), player.melds.length, winOptions(room, player, type));
  });
}

function refreshTing(room, player) {
  if (room.phase !== "playing") {
    player.ting = false;
    player.waitingTypes = [];
    return false;
  }
  const nextWaitingTypes = waitingTypes(room, player);
  const wasTing = player.ting;
  player.waitingTypes = nextWaitingTypes;
  player.ting = nextWaitingTypes.length > 0;
  if (!wasTing && player.ting) {
    log(room, player.name + " 上听");
  }
  if (wasTing && !player.ting) {
    log(room, player.name + " 退听");
  }
  return player.ting;
}

function roomUsesBao(room) {
  return Boolean(variantFor(room).usesBao);
}

function setupBao(room) {
  if (!roomUsesBao(room) || room.wall.length === 0) {
    room.bao = null;
    return;
  }
  const tile = room.wall.pop();
  room.bao = {
    tile,
    type: tile.type
  };
}

function isBaoDraw(room, player) {
  if (!roomUsesBao(room) || !room.bao || !player.ting || !player.drawnTileId) {
    return false;
  }
  const drawnTile = player.hand.find((tile) => tile.id === player.drawnTileId);
  return Boolean(drawnTile && drawnTile.type === room.bao.type);
}

function chowOptions(hand, discardType) {
  if (discardType >= 27) {
    return [];
  }
  const options = [];
  const rank = discardType % 9;
  const suitStart = discardType - rank;
  for (let start = rank - 2; start <= rank; start += 1) {
    if (start < 0 || start > 6) {
      continue;
    }
    const sequence = [suitStart + start, suitStart + start + 1, suitStart + start + 2];
    const needed = sequence.filter((type) => type !== discardType);
    if (needed.every((type) => countType(hand, type) >= 1)) {
      options.push({ tiles: sequence, consume: needed });
    }
  }
  return options;
}

function makeActionId(action, seat, type, index = 0) {
  return [action, seat, type, index].join("-");
}

function buildClaimActions(room, discard) {
  const actionsByPlayer = new Map();
  room.players.forEach((player) => {
    if (player.seat === discard.fromSeat) {
      return;
    }
    const actions = [];
    const type = discard.tile.type;
    if (canWinPlayer(room, player, discard.tile)) {
      actions.push({
        id: makeActionId("hu", player.seat, type),
        action: "hu",
        priority: 4,
        tiles: [type],
        consume: []
      });
    }
    if (countType(player.hand, type) >= 3) {
      actions.push({
        id: makeActionId("kong", player.seat, type),
        action: "kong",
        priority: 3,
        tiles: [type, type, type, type],
        consume: [type, type, type]
      });
    }
    if (countType(player.hand, type) >= 2) {
      actions.push({
        id: makeActionId("pong", player.seat, type),
        action: "pong",
        priority: 2,
        tiles: [type, type, type],
        consume: [type, type]
      });
    }
    if (variantFor(room).allowChow && nextSeat(room, discard.fromSeat) === player.seat) {
      chowOptions(player.hand, type).forEach((option, index) => {
        actions.push({
          id: makeActionId("chow", player.seat, type, index),
          action: "chow",
          priority: 1,
          tiles: option.tiles,
          consume: option.consume
        });
      });
    }
    if (actions.length > 0) {
      actionsByPlayer.set(player.id, actions);
    }
  });
  return actionsByPlayer;
}

function buildSelfActions(room, player) {
  if (room.phase !== "playing" || room.pending || room.currentSeat !== player.seat || !room.turnDrawn) {
    return [];
  }

  const actions = [];
  if (canWinPlayer(room, player)) {
    actions.push({
      id: "self-hu",
      action: "hu",
      priority: 4,
      tiles: []
    });
  }

  if (isBaoDraw(room, player)) {
    actions.unshift({
      id: "self-bao-hu",
      action: "baoHu",
      priority: 5,
      tiles: [room.bao.type]
    });
  }

  variantFor(room).tileTypes.forEach((type) => {
    if (countType(player.hand, type) === 4) {
      actions.push({
        id: "self-kong-" + type,
        action: "kong",
        priority: 3,
        tiles: [type, type, type, type],
        consume: [type, type, type, type]
      });
    }
  });
  return actions;
}

function removeTilesByTypes(player, types) {
  const removed = [];
  types.forEach((type) => {
    const index = player.hand.findIndex((tile) => tile.type === type);
    if (index === -1) {
      throw new Error("手牌不足");
    }
    removed.push(player.hand.splice(index, 1)[0]);
  });
  return removed;
}

function drawTile(room, player) {
  if (room.wall.length === 0) {
    room.phase = "ended";
    room.result = "流局";
    log(room, "牌山摸空，本局流局");
    return null;
  }
  const tile = room.wall.pop();
  player.hand.push(tile);
  sortHand(player);
  player.drawnTileId = tile.id;
  room.turnDrawn = true;
  return tile;
}

function rollDice() {
  const values = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  return {
    values,
    total: values[0] + values[1]
  };
}

function canStartRound(room) {
  return (
    room.phase !== "playing" &&
    room.players.length === roomSeatCount(room) &&
    room.players.every(connectedOrBot) &&
    (room.players.every((player) => player.ready || isBot(player)) || room.phase === "ended")
  );
}

function nextBotName(room) {
  const usedNames = new Set(room.players.map((player) => player.name));
  return botNames.find((name) => !usedNames.has(name)) || "牌搭子" + (room.players.length + 1);
}

function addBot(room) {
  if (room.phase === "playing" || room.players.length >= roomSeatCount(room)) {
    return false;
  }
  const bot = makePlayer("bot-" + room.code + "-" + randomUUID(), nextBotName(room), nextOpenSeat(room), true);
  room.players.push(bot);
  log(room, bot.name + " 补位入座");
  return true;
}

function roomIsVacant(room) {
  return room.players.length > 0 && !room.players.some((player) => player.connected && !isBot(player));
}

function applyRoomConfig(room, options) {
  room.config = makeConfig(options);
}

function tileKeepScore(hand, tile) {
  const type = tile.type;
  const same = countType(hand, type);
  if (type >= 27) {
    return same * 4;
  }
  const rank = type % 9;
  const suitStart = type - rank;
  let score = same * 3;

  [-2, -1, 1, 2].forEach((offset) => {
    const nextType = type + offset;
    if (nextType >= suitStart && nextType < suitStart + 9) {
      score += countType(hand, nextType);
    }
  });
  if (rank === 0 || rank === 8) {
    score -= 1;
  }
  return score;
}

function chooseBotDiscard(player) {
  return player.hand
    .map((tile) => ({ tile, score: tileKeepScore(player.hand, tile) }))
    .sort((a, b) => a.score - b.score || a.tile.type - b.tile.type)[0].tile;
}

function chooseBotClaimAction(actions) {
  const win = actions.find((action) => action.action === "hu");
  if (win) {
    return win;
  }
  const strong = actions.find((action) => action.action === "kong" || action.action === "pong");
  if (strong && Math.random() < 0.45) {
    return strong;
  }
  const chow = actions.find((action) => action.action === "chow");
  if (chow && Math.random() < 0.25) {
    return chow;
  }
  return null;
}

function startRound(room) {
  if (!canStartRound(room)) {
    return false;
  }

  room.phase = "playing";
  room.result = "";
  room.round += 1;
  room.dealerSeat = (room.round - 1) % roomSeatCount(room);
  room.currentSeat = room.dealerSeat;
  room.turnDrawn = true;
  room.lastDiscard = null;
  room.discardHistory = [];
  room.pending = null;
  room.dice = rollDice();
  room.wall = buildWall(room);
  room.bao = null;
  room.events = [];

  room.players.forEach((player) => {
    player.ready = false;
    player.hand = [];
    player.melds = [];
    player.discards = [];
    player.drawnTileId = null;
    player.ting = false;
    player.waitingTypes = [];
  });

  for (let count = 0; count < 13; count += 1) {
    room.players.forEach((player) => {
      player.hand.push(room.wall.pop());
    });
  }
  const dealer = playerBySeat(room, room.dealerSeat);
  const dealerTile = room.wall.pop();
  dealer.hand.push(dealerTile);
  dealer.drawnTileId = dealerTile.id;
  setupBao(room);
  room.players.forEach(sortHand);
  log(room, "第 " + room.round + " 局开始，" + dealer.name + " 坐庄");
  log(room, "骰子 " + room.dice.values.join(" + ") + " = " + room.dice.total);
  log(room, roomConfigLabel(room) + "，牌组 " + variantFor(room).tileTypes.length * 4 + " 张");
  if (room.bao) {
    log(room, "宝牌已从牌山尾端扣下，上听后可见");
  }
  return true;
}

function settleWin(room, winners, fromPlayer, tile) {
  room.phase = "ended";
  room.pending = null;
  room.lastDiscard = null;
  const winnerNames = winners.map((player) => player.name).join("、");
  if (fromPlayer && tile) {
    room.result = winnerNames + " 胡 " + fromPlayer.name + " 的 " + tileName(tile.type);
    log(room, room.result);
  } else {
    room.result = winnerNames + " 自摸";
    log(room, room.result);
  }
}

function settleBaoWin(room, player) {
  room.phase = "ended";
  room.pending = null;
  room.lastDiscard = null;
  room.result = player.name + " 摸宝 " + tileName(room.bao.type);
  log(room, room.result);
}

function advanceAfterDiscard(room, discard) {
  const fromPlayer = playerBySeat(room, discard.fromSeat);
  fromPlayer.discards.push(discard.tile);
  fromPlayer.drawnTileId = null;
  refreshTing(room, fromPlayer);
  room.lastDiscard = null;
  room.pending = null;
  room.currentSeat = nextSeat(room, discard.fromSeat);
  room.turnDrawn = false;
}

function recordDiscard(room, discard) {
  room.discardHistory.push({
    tile: discard.tile,
    fromSeat: discard.fromSeat,
    claimedBySeat: null,
    claim: null
  });
}

function markDiscardClaimed(room, discard, player, action) {
  for (let index = room.discardHistory.length - 1; index >= 0; index -= 1) {
    const entry = room.discardHistory[index];
    if (entry.tile.id === discard.tile.id && entry.fromSeat === discard.fromSeat) {
      entry.claimedBySeat = player.seat;
      entry.claim = action;
      return;
    }
  }
}

function startPendingOrAdvance(room, discard) {
  const actionsByPlayer = buildClaimActions(room, discard);
  if (actionsByPlayer.size === 0) {
    advanceAfterDiscard(room, discard);
    return;
  }
  room.pending = {
    discard,
    actionsByPlayer,
    responses: new Map()
  };
}

function hasBotWork(room) {
  if (room.phase !== "playing") {
    return false;
  }
  if (room.pending) {
    return Array.from(room.pending.actionsByPlayer.keys()).some((playerId) => {
      const player = room.players.find((candidate) => candidate.id === playerId);
      return isBot(player) && !room.pending.responses.has(playerId);
    });
  }
  return isBot(currentPlayer(room));
}

function scheduleBotStep(room) {
  if (room.botTimer || !hasBotWork(room)) {
    return;
  }
  room.botTimer = setTimeout(() => {
    room.botTimer = null;
    runBotStep(room);
  }, 650);
}

function runBotStep(room) {
  if (room.phase !== "playing") {
    return;
  }

  if (room.pending) {
    Array.from(room.pending.actionsByPlayer.entries()).forEach(([playerId, actions]) => {
      const player = room.players.find((candidate) => candidate.id === playerId);
      if (!isBot(player) || room.pending.responses.has(playerId)) {
        return;
      }
      room.pending.responses.set(playerId, {
        player,
        action: chooseBotClaimAction(actions)
      });
    });
    resolvePending(room);
    broadcast(room);
    return;
  }

  const player = currentPlayer(room);
  if (!isBot(player)) {
    return;
  }

  if (!room.turnDrawn) {
    const tile = drawTile(room, player);
    if (tile) {
      log(room, player.name + " 摸牌");
    }
    broadcast(room);
    return;
  }

  if (isBaoDraw(room, player)) {
    settleBaoWin(room, player);
    broadcast(room);
    return;
  }

  if (canWinPlayer(room, player)) {
    settleWin(room, [player], null, null);
    broadcast(room);
    return;
  }

  const tile = chooseBotDiscard(player);
  const index = player.hand.findIndex((candidate) => candidate.id === tile.id);
  player.hand.splice(index, 1);
  player.drawnTileId = null;
  room.turnDrawn = false;
  room.lastDiscard = { tile, fromSeat: player.seat };
  recordDiscard(room, room.lastDiscard);
  log(room, player.name + " 打出 " + tileName(tile.type));
  refreshTing(room, player);
  startPendingOrAdvance(room, room.lastDiscard);
  broadcast(room);
}

function responseDistance(room, fromSeat, seat) {
  const count = roomSeatCount(room);
  return (seat - fromSeat + count) % count;
}

function resolvePending(room) {
  const pending = room.pending;
  if (!pending) {
    return;
  }

  const eligibleIds = Array.from(pending.actionsByPlayer.keys());
  if (!eligibleIds.every((id) => pending.responses.has(id))) {
    return;
  }

  const responses = Array.from(pending.responses.values()).filter((response) => response.action);
  if (responses.length === 0) {
    advanceAfterDiscard(room, pending.discard);
    return;
  }

  responses.sort((a, b) => {
    if (b.action.priority !== a.action.priority) {
      return b.action.priority - a.action.priority;
    }
    return (
      responseDistance(room, pending.discard.fromSeat, a.player.seat) -
      responseDistance(room, pending.discard.fromSeat, b.player.seat)
    );
  });

  const huResponses = responses.filter((response) => response.action.action === "hu");
  if (huResponses.length > 0) {
    markDiscardClaimed(room, pending.discard, huResponses[0].player, "hu");
    settleWin(
      room,
      huResponses.map((response) => response.player),
      playerBySeat(room, pending.discard.fromSeat),
      pending.discard.tile
    );
    return;
  }

  const winner = responses[0];
  const action = winner.action;
  const player = winner.player;
  markDiscardClaimed(room, pending.discard, player, action.action);
  removeTilesByTypes(player, action.consume);
  player.ting = false;
  player.waitingTypes = [];
  player.melds.push({
    kind: action.action,
    tiles: action.tiles.slice().sort((a, b) => a - b),
    fromSeat: pending.discard.fromSeat
  });
  sortHand(player);
  room.currentSeat = player.seat;
  room.pending = null;
  room.lastDiscard = null;

  if (action.action === "kong") {
    log(room, player.name + " 杠 " + tileName(pending.discard.tile.type));
    drawTile(room, player);
  } else {
    room.turnDrawn = true;
    log(room, player.name + (action.action === "pong" ? " 碰 " : " 吃 ") + tileName(pending.discard.tile.type));
  }
}

function buildView(room, player) {
  const selfActions = buildSelfActions(room, player);
  const claimActions = room.pending ? room.pending.actionsByPlayer.get(player.id) || [] : [];
  const canDiscard = room.phase === "playing" && !room.pending && room.currentSeat === player.seat && room.turnDrawn;
  const canDraw = room.phase === "playing" && !room.pending && room.currentSeat === player.seat && !room.turnDrawn;
  const turn = room.phase === "playing" ? currentPlayer(room) : null;
  const variant = variantFor(room);

  return {
    connected: Boolean(player.connected),
    room: room.code,
    config: {
      variant: variant.key,
      variantLabel: variant.label,
      seatCount: roomSeatCount(room),
      tileCount: variant.tileTypes.length * 4,
      allowChow: variant.allowChow,
      rules: variant.rules.concat([
        roomSeatCount(room) + " 人局：庄家 14 张，其余玩家 13 张",
        "开局掷 2 骰用于桌面提示，本版不按骰子切牌墩"
      ]),
      detailedRules: (variant.detailedRules || []).concat([
        {
          title: "本局发牌",
          items: [
            roomSeatCount(room) + " 人局：庄家 14 张，其余玩家 13 张。",
            "开局掷 2 骰用于桌面提示，本版不按骰子切牌墩。"
          ]
        }
      ])
    },
    bao: roomUsesBao(room) && room.bao
      ? {
          enabled: true,
          revealed: player.ting || room.phase === "ended",
          type: player.ting || room.phase === "ended" ? room.bao.type : null,
          label: player.ting || room.phase === "ended" ? tileName(room.bao.type) : "未上听不可见"
        }
      : null,
    phase: room.phase,
    round: room.round,
    dice: room.dice,
    discardHistory: room.discardHistory,
    wallCount: room.wall.length,
    result: room.result,
    turnName: turn ? turn.name : "",
    player: {
      id: player.id,
      seat: player.seat,
      ready: player.ready,
      drawnTileId: player.drawnTileId,
      ting: player.ting,
      waitingTypes: player.waitingTypes
    },
    players: room.players
      .slice()
      .sort((a, b) => a.seat - b.seat)
      .map((item) => ({
        id: item.id,
        name: item.name,
        seat: item.seat,
        connected: connectedOrBot(item),
        ready: item.ready,
        bot: item.bot,
        handCount: item.hand.length,
        melds: item.melds,
        discards: item.discards,
        ting: item.ting,
        drawnTileId: item.id === player.id ? item.drawnTileId : null,
        isSelf: item.id === player.id
      })),
    hand: player.hand,
    selfMelds: player.melds,
    lastDiscard: room.lastDiscard,
    canStart: canStartRound(room) && player.seat === 0,
    canAddBot: room.phase !== "playing" && room.players.length < roomSeatCount(room) && player.seat === 0,
    canDraw,
    canDiscard,
    selfActions,
    claimActions,
    events: room.events.slice(-12)
  };
}

function sendJson(peer, payload) {
  peer.send(JSON.stringify(payload));
}

function broadcast(room) {
  room.players.forEach((player) => {
    if (player.peer && player.connected) {
      sendJson(player.peer, {
        type: "view",
        view: buildView(room, player)
      });
    }
  });
  scheduleBotStep(room);
}

function handleJoin(peer, message) {
  const requestedConfig = makeConfig(message);
  const room = getRoom(message.room, requestedConfig);
  const requestedId = String(message.clientId || randomUUID());
  const name = sanitizeName(message.name);

  if (room.phase !== "playing" && roomIsVacant(room)) {
    room.players = [];
    room.events = ["房间已创建"];
    applyRoomConfig(room, requestedConfig);
  }

  let player = room.players.find((candidate) => candidate.id === requestedId);

  if (!player) {
    if (room.players.length >= roomSeatCount(room)) {
      const replaceable =
        room.phase === "lobby" ? room.players.find((candidate) => isBot(candidate) || !candidate.connected) : null;
      if (!replaceable) {
        sendJson(peer, { type: "error", message: "房间已满" });
        return;
      }
      player = replaceable;
      player.id = requestedId;
      player.bot = false;
      player.ready = false;
      player.hand = [];
      player.melds = [];
      player.discards = [];
      player.drawnTileId = null;
      player.ting = false;
      player.waitingTypes = [];
    } else {
      if (room.players.length === 0) {
        applyRoomConfig(room, requestedConfig);
      }
      player = makePlayer(requestedId, name, nextOpenSeat(room));
      room.players.push(player);
    }
  } else if (
    room.phase !== "playing" &&
    player.seat === 0 &&
    room.players.every((candidate) => candidate.id === requestedId || !connectedOrBot(candidate))
  ) {
    applyRoomConfig(room, requestedConfig);
  }

  if (player.peer && player.peer !== peer) {
    player.peer.close();
  }
  player.name = name;
  player.connected = true;
  player.peer = peer;
  peer.player = player;
  peer.room = room;
  log(room, player.name + " 入座");
  broadcast(room);
}

function requirePlayer(peer) {
  if (!peer.player || !peer.room) {
    sendJson(peer, { type: "error", message: "尚未入座" });
    return false;
  }
  return true;
}

function handleReady(peer) {
  if (!requirePlayer(peer)) {
    return;
  }
  const { room, player } = peer;
  if (room.phase === "playing") {
    sendJson(peer, { type: "error", message: "本局进行中" });
    return;
  }
  player.ready = !player.ready;
  log(room, player.name + (player.ready ? " 已准备" : " 取消准备"));
  broadcast(room);
}

function handleAddBot(peer) {
  if (!requirePlayer(peer)) {
    return;
  }
  const { room, player } = peer;
  if (player.seat !== 0) {
    sendJson(peer, { type: "error", message: "由房主补人机" });
    return;
  }
  if (!addBot(room)) {
    sendJson(peer, { type: "error", message: "现在不能补人机" });
    return;
  }
  broadcast(room);
}

function handleStart(peer) {
  if (!requirePlayer(peer)) {
    return;
  }
  if (peer.player.seat !== 0) {
    sendJson(peer, { type: "error", message: "由房主开局" });
    return;
  }
  if (!startRound(peer.room)) {
    sendJson(peer, { type: "error", message: "需要 " + roomSeatCount(peer.room) + " 人在线并准备" });
    return;
  }
  broadcast(peer.room);
}

function handleDraw(peer) {
  if (!requirePlayer(peer)) {
    return;
  }
  const { room, player } = peer;
  if (room.phase !== "playing" || room.pending || room.currentSeat !== player.seat || room.turnDrawn) {
    sendJson(peer, { type: "error", message: "现在不能摸牌" });
    return;
  }
  const tile = drawTile(room, player);
  if (tile) {
    log(room, player.name + " 摸牌");
  }
  broadcast(room);
}

function handleDiscard(peer, message) {
  if (!requirePlayer(peer)) {
    return;
  }
  const { room, player } = peer;
  if (room.phase !== "playing" || room.pending || room.currentSeat !== player.seat || !room.turnDrawn) {
    sendJson(peer, { type: "error", message: "现在不能打牌" });
    return;
  }
  const index = player.hand.findIndex((tile) => tile.id === message.tileId);
  if (index === -1) {
    sendJson(peer, { type: "error", message: "找不到这张牌" });
    return;
  }
  const tile = player.hand.splice(index, 1)[0];
  player.drawnTileId = null;
  room.turnDrawn = false;
  room.lastDiscard = { tile, fromSeat: player.seat };
  recordDiscard(room, room.lastDiscard);
  log(room, player.name + " 打出 " + tileName(tile.type));
  refreshTing(room, player);
  startPendingOrAdvance(room, room.lastDiscard);
  broadcast(room);
}

function handleSelfAction(peer, message) {
  if (!requirePlayer(peer)) {
    return;
  }
  const { room, player } = peer;
  const action = buildSelfActions(room, player).find((candidate) => candidate.id === message.actionId);
  if (!action) {
    sendJson(peer, { type: "error", message: "现在不能这样操作" });
    return;
  }
  if (action.action === "baoHu") {
    settleBaoWin(room, player);
    broadcast(room);
    return;
  }
  if (action.action === "hu") {
    settleWin(room, [player], null, null);
    broadcast(room);
    return;
  }
  if (action.action === "kong") {
    removeTilesByTypes(player, action.consume);
    player.ting = false;
    player.waitingTypes = [];
    player.melds.push({
      kind: "kong",
      tiles: action.tiles.slice(),
      fromSeat: player.seat
    });
    log(room, player.name + " 暗杠 " + tileName(action.tiles[0]));
    drawTile(room, player);
    sortHand(player);
    broadcast(room);
  }
}

function handleClaim(peer, message) {
  if (!requirePlayer(peer)) {
    return;
  }
  const { room, player } = peer;
  if (!room.pending || !room.pending.actionsByPlayer.has(player.id)) {
    sendJson(peer, { type: "error", message: "没有可响应的牌" });
    return;
  }
  if (message.actionId === "pass") {
    room.pending.responses.set(player.id, { player, action: null });
    resolvePending(room);
    broadcast(room);
    return;
  }
  const action = room.pending.actionsByPlayer.get(player.id).find((candidate) => candidate.id === message.actionId);
  if (!action) {
    sendJson(peer, { type: "error", message: "操作已失效" });
    return;
  }
  room.pending.responses.set(player.id, { player, action });
  resolvePending(room);
  broadcast(room);
}

function handleMessage(peer, raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch (error) {
    sendJson(peer, { type: "error", message: "消息格式错误" });
    return;
  }

  if (message.type === "join") {
    handleJoin(peer, message);
    return;
  }
  if (message.type === "ready") {
    handleReady(peer);
    return;
  }
  if (message.type === "addBot") {
    handleAddBot(peer);
    return;
  }
  if (message.type === "startRound" || message.type === "newRound") {
    handleStart(peer);
    return;
  }
  if (message.type === "draw") {
    handleDraw(peer);
    return;
  }
  if (message.type === "discard") {
    handleDiscard(peer, message);
    return;
  }
  if (message.type === "selfAction") {
    handleSelfAction(peer, message);
    return;
  }
  if (message.type === "claim") {
    handleClaim(peer, message);
  }
}

class WebSocketPeer {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.player = null;
    this.room = null;
    socket.on("data", (chunk) => this.receive(chunk));
    socket.on("close", () => this.handleClose());
    socket.on("error", () => this.handleClose());
  }

  send(data) {
    if (!this.socket.destroyed) {
      this.socket.write(encodeFrame(Buffer.from(data), 1));
    }
  }

  close() {
    if (!this.socket.destroyed) {
      this.socket.end();
    }
  }

  receive(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const masked = (second & 0x80) !== 0;
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (this.buffer.length < 4) {
          return;
        }
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) {
          return;
        }
        const bigLength = this.buffer.readBigUInt64BE(2);
        if (bigLength > BigInt(1024 * 1024)) {
          this.close();
          return;
        }
        length = Number(bigLength);
        offset = 10;
      }

      const maskLength = masked ? 4 : 0;
      const frameEnd = offset + maskLength + length;
      if (this.buffer.length < frameEnd) {
        return;
      }

      let payload = this.buffer.subarray(offset + maskLength, frameEnd);
      if (masked) {
        const mask = this.buffer.subarray(offset, offset + 4);
        payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      }
      this.buffer = this.buffer.subarray(frameEnd);

      if (opcode === 8) {
        this.close();
        return;
      }
      if (opcode === 9) {
        this.socket.write(encodeFrame(payload, 10));
        continue;
      }
      if (opcode === 1) {
        handleMessage(this, payload.toString("utf8"));
      }
    }
  }

  handleClose() {
    if (!this.player || !this.room) {
      return;
    }
    const { player, room } = this;
    if (player.peer !== this) {
      return;
    }
    player.connected = false;
    player.peer = null;
    if (room.pending && room.pending.actionsByPlayer.has(player.id) && !room.pending.responses.has(player.id)) {
      room.pending.responses.set(player.id, { player, action: null });
      resolvePending(room);
    }
    log(room, player.name + " 离线");
    broadcast(room);
  }
}

function encodeFrame(payload, opcode) {
  const length = payload.length;
  let header;
  if (length < 126) {
    header = Buffer.from([0x80 | opcode, length]);
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  return Buffer.concat([header, payload]);
}

function handleUpgrade(request, socket) {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname !== "/mahjong/ws") {
    socket.destroy();
    return;
  }
  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      "Sec-WebSocket-Accept: " + accept,
      "",
      ""
    ].join("\r\n")
  );
  new WebSocketPeer(socket);
}

async function serveStatic(request, response) {
  const requestUrl = new URL(request.url, "http://localhost");
  if (requestUrl.pathname === "/") {
    response.writeHead(302, { Location: "/mahjong/" });
    response.end();
    return;
  }
  if (!requestUrl.pathname.startsWith("/mahjong")) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const relativePath = decodeURIComponent(requestUrl.pathname.replace(/^\/mahjong\/?/, "")) || "index.html";
  const filePath = resolve(staticRoot, relativePath);
  if (filePath !== staticRoot && !filePath.startsWith(staticRoot + sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? join(filePath, "index.html") : filePath;
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(finalPath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(finalPath).pipe(response);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

function localAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
}

export function startServer(preferredPort = defaultPort, attempts = 0) {
  const server = createServer((request, response) => {
    serveStatic(request, response);
  });
  server.on("upgrade", handleUpgrade);
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attempts < 20) {
      startServer(preferredPort + 1, attempts + 1);
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });
  server.listen(preferredPort, "0.0.0.0", () => {
    const urls = ["http://localhost:" + preferredPort + "/mahjong/"].concat(
      localAddresses().map((address) => "http://" + address + ":" + preferredPort + "/mahjong/")
    );
    console.log("麻将局已启动：");
    urls.forEach((url) => console.log("  " + url));
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
