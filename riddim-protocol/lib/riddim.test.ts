import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateSplit,
  normalizeComponentSplits,
  parseRiddimRegistration,
} from "./riddim";

test("normalizeComponentSplits keeps total at 100%", () => {
  const result = normalizeComponentSplits([
    { name: "drums", share: 40 },
    { name: "melody", share: 35 },
    { name: "vocal", share: 25 },
  ]);

  assert.equal(result.total, 100);
  assert.deepEqual(
    result.components.map((item) => item.share),
    [40, 35, 25],
  );
});

test("calculateSplit distributes a tip across contributors", () => {
  const result = calculateSplit(100, [
    { wallet: "0x111", share: 50 },
    { wallet: "0x222", share: 30 },
    { wallet: "0x333", share: 20 },
  ]);

  assert.deepEqual(result, [
    { wallet: "0x111", share: 50, amount: 50 },
    { wallet: "0x222", share: 30, amount: 30 },
    { wallet: "0x333", share: 20, amount: 20 },
  ]);
});

test("parseRiddimRegistration accepts a pipe-delimited demo string", () => {
  const result = parseRiddimRegistration(
    "Afro Vibes|drums:40:0x111|melody:60:0x222",
  );

  assert.equal(result.title, "Afro Vibes");
  assert.equal(result.components.length, 2);
  assert.equal(result.components[0].wallet, "0x111");
  assert.equal(result.components[1].share, 60);
});
