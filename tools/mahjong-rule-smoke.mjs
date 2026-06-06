import assert from "node:assert/strict";

import { canWinTypes } from "./mahjong-lan-server.mjs";

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

expect(
  "dongbei standard win with all suits, terminal/honor, exact pair",
  dongbei([0, 1, 2, 9, 10, 11, 18, 19, 20, 24, 25, 26, 27, 27]),
  true
);

const missingSuit = [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 27, 27];
expect("base still accepts the underlying winning shape", base(missingSuit), true);
expect("dongbei rejects a missing bamboo suit", dongbei(missingSuit), false);

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
