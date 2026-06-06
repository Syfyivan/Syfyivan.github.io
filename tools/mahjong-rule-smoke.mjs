import assert from "node:assert/strict";

import { canWinTypes, initialSpecialKongTypes, mahjongTestHooks } from "./mahjong-lan-server.mjs";

function expect(name, actual, expected) {
  assert.equal(actual, expected, name);
  console.log((expected ? "PASS " : "PASS reject ") + name);
}

function dongbei(types) {
  return canWinTypes(types, 0, { variant: "dongbei", allTypes: types });
}

function base(types) {
  return canWinTypes(types);
}

let nextTileId = 0;
function tile(type) {
  nextTileId += 1;
  return { id: "test-tile-" + nextTileId, type };
}

function hand(types) {
  return types.map(tile);
}

function makePlayingRoom(code = "TEST") {
  const room = mahjongTestHooks.makeRoom(code, { variant: "dongbei", seatCount: 3 });
  room.phase = "playing";
  room.round = 1;
  room.currentSeat = 0;
  room.players = [
    mahjongTestHooks.makePlayer("p0", "玩家一", 0),
    mahjongTestHooks.makePlayer("p1", "玩家二", 1),
    mahjongTestHooks.makePlayer("p2", "玩家三", 2)
  ];
  room.players.forEach((player) => {
    player.connected = true;
  });
  return room;
}

function withFixedDice(fn) {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    fn();
  } finally {
    Math.random = originalRandom;
  }
}

expect(
  "dongbei standard win with all suits, terminal/honor, exact pair",
  dongbei([0, 1, 2, 9, 10, 11, 18, 19, 20, 24, 25, 26, 27, 27]),
  true
);

const missingSuit = [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 27, 27];
expect("base still accepts the underlying winning shape", base(missingSuit), true);
expect("dongbei rejects two number suits plus honors", dongbei(missingSuit), false);

expect(
  "dongbei accepts pure flush with terminal tiles",
  dongbei([0, 0, 0, 1, 1, 1, 2, 2, 2, 8, 8, 8, 4, 4]),
  true
);

expect(
  "dongbei accepts mixed flush with honors",
  dongbei([0, 1, 2, 3, 4, 5, 6, 7, 8, 27, 27, 27, 31, 31]),
  true
);

expect(
  "dongbei rejects a hand without terminal or honor tiles",
  dongbei([1, 2, 3, 10, 11, 12, 19, 20, 21, 22, 23, 24, 4, 4]),
  false
);

const noExactPair = [0, 0, 0, 1, 2, 9, 10, 11, 18, 19, 20, 27, 27, 27];
expect("base can decompose a triplet-backed pair shape", base(noExactPair), true);
expect("dongbei rejects wins without a tile that appears exactly twice", dongbei(noExactPair), false);

expect(
  "dongbei accepts seven pairs when extra rules are satisfied",
  dongbei([0, 0, 8, 8, 9, 9, 17, 17, 18, 18, 26, 26, 27, 27]),
  true
);

assert.deepEqual(
  initialSpecialKongTypes([27, 28, 29, 30, 0, 1, 2, 3, 4, 5, 6, 7, 8]),
  ["initial-wind-kong"],
  "initial wind kong requires east, south, west, and north in the dealt hand"
);
console.log("PASS initial wind kong detection");

assert.deepEqual(
  initialSpecialKongTypes([31, 32, 33, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  ["initial-dragon-kong"],
  "initial dragon kong requires red, green, and white dragons in the dealt hand"
);
console.log("PASS initial dragon kong detection");

assert.deepEqual(
  initialSpecialKongTypes([27, 28, 30, 31, 32, 0, 1, 2, 3, 4, 5, 6, 7]),
  [],
  "special initial kong detection rejects incomplete honor sets"
);
console.log("PASS reject incomplete special kong detection");

withFixedDice(() => {
  const room = makePlayingRoom("BAO1");
  const player = room.players[0];
  player.hand = hand([0, 0, 0, 1, 1, 1, 2, 2, 2, 8, 8, 8, 4]);
  room.wall = [tile(4), tile(0)];
  mahjongTestHooks.refreshTing(room, player);
  assert.equal(room.bao.type, 4, "first listener reveals treasure by dice");
  assert.equal(room.phase, "ended", "matching treasure wait settles dui bao immediately");
  assert.match(room.result, /对宝 5万/);
  console.log("PASS first listening player can win by dui bao");
});

withFixedDice(() => {
  const room = makePlayingRoom("BAO2");
  const first = room.players[0];
  const second = room.players[1];
  first.hand = hand([0, 0, 0, 1, 1, 1, 2, 2, 2, 8, 8, 8, 4]);
  second.hand = hand([0, 0, 0, 1, 1, 1, 2, 2, 2, 8, 8, 8, 5]);
  room.wall = [tile(5), tile(0)];
  mahjongTestHooks.refreshTing(room, first);
  assert.equal(room.phase, "playing");
  assert.equal(room.bao.type, 5);
  mahjongTestHooks.refreshTing(room, second);
  assert.equal(room.phase, "ended", "later listener sees current treasure and can dui bao");
  assert.match(room.result, /玩家二 对宝 6万/);
  console.log("PASS later listening player sees current treasure");
});

withFixedDice(() => {
  const room = makePlayingRoom("BAO3");
  room.bao = { tile: tile(0), type: 0, dice: { values: [1, 1], total: 2 } };
  room.wall = [tile(2), tile(1)];
  room.discardHistory = [
    { tile: tile(0), fromSeat: 0, claimedBySeat: null, claim: null },
    { tile: tile(0), fromSeat: 1, claimedBySeat: null, claim: null },
    { tile: tile(0), fromSeat: 2, claimedBySeat: null, claim: null }
  ];
  mahjongTestHooks.maybeChangeBao(room);
  assert.equal(room.bao.type, 1, "three public treasure tiles force a new treasure");
  console.log("PASS three public treasure tiles change treasure");
});

{
  const room = makePlayingRoom("KONG1");
  const player = room.players[0];
  player.hand = hand([27, 28, 29, 30, 0, 0, 0, 1, 1, 1, 2, 2, 2]);
  room.wall = [tile(3)];
  mahjongTestHooks.applyInitialSpecialKongs(room, player);
  assert.equal(player.melds.length, 1);
  assert.equal(player.melds[0].kind, "initial-wind-kong");
  assert.equal(player.hand.length, 10, "wind special kong receives one supplement tile");
  assert.equal(player.hand.some((item) => [27, 28, 29, 30].includes(item.type)), false);
  console.log("PASS initial wind kong is exposed once at deal");
}

{
  const room = makePlayingRoom("KONG2");
  const player = room.players[0];
  player.hand = hand([31, 32, 33, 0, 0, 0, 1, 1, 1, 2, 2, 2, 8]);
  mahjongTestHooks.applyInitialSpecialKongs(room, player);
  assert.equal(player.melds.length, 1);
  assert.equal(player.melds[0].kind, "initial-dragon-kong");
  assert.equal(player.hand.length, 10);
  assert.equal(player.hand.some((item) => [31, 32, 33].includes(item.type)), false);
  console.log("PASS initial dragon kong is exposed once at deal");
}

{
  const room = mahjongTestHooks.makeRoom("START1", { variant: "dongbei", seatCount: 3 });
  room.players = [
    mahjongTestHooks.makePlayer("p0", "庄家", 0),
    mahjongTestHooks.makePlayer("p1", "闲家一", 1),
    mahjongTestHooks.makePlayer("p2", "闲家二", 2)
  ];
  room.players.forEach((player) => {
    player.connected = true;
    player.ready = true;
  });
  assert.equal(mahjongTestHooks.startRound(room), true);
  const dealer = room.players[0];
  const view = mahjongTestHooks.buildView(room, dealer);
  assert.equal(dealer.drawnTileId, null, "opening dealer tile is not displayed as a fresh draw");
  assert.equal(view.player.drawnTileId, null);
  assert.equal(view.canDiscard, true, "dealer can discard immediately after the opening deal");
  assert.equal(view.hand.length > 0, true);
  console.log("PASS opening deal does not mark a drawn tile but still allows discard");
}
