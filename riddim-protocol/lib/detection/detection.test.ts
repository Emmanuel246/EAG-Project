import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyConfidence,
  cosineSimilarity,
  detectReuse,
  detectReuseByTitle,
  fingerprintSamples,
  generateFingerprint,
  proposeLicense,
} from "./index";

test("cosineSimilarity: identical vectors score 1", () => {
  const v = [0.2, 0.4, 0.6, 0.8];
  assert.equal(Math.round(cosineSimilarity(v, v) * 1e6) / 1e6, 1);
});

test("cosineSimilarity: orthogonal vectors score 0", () => {
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test("cosineSimilarity: rejects mismatched lengths", () => {
  assert.throws(() => cosineSimilarity([1, 2], [1, 2, 3]));
});

test("classifyConfidence maps similarity to the spec bands", () => {
  assert.deepEqual(classifyConfidence(0.97), {
    confidence: "high",
    recommendation: "flag-and-propose",
  });
  assert.deepEqual(classifyConfidence(0.9), {
    confidence: "medium",
    recommendation: "review",
  });
  assert.deepEqual(classifyConfidence(0.5), {
    confidence: "none",
    recommendation: "no-match",
  });
  // boundaries
  assert.equal(classifyConfidence(0.95).confidence, "high");
  assert.equal(classifyConfidence(0.85).confidence, "medium");
  assert.equal(classifyConfidence(0.8499).confidence, "none");
});

test("generateFingerprint is deterministic and 8-dim", () => {
  const a = generateFingerprint("Afro Vibes");
  const b = generateFingerprint("Afro Vibes");
  assert.equal(a.length, 8);
  assert.deepEqual(a, b);
  assert.notDeepEqual(generateFingerprint("x"), generateFingerprint("y"));
});

test("detectReuse: HIGH sample flags Lagos Nights and proposes a license", () => {
  const sample = fingerprintSamples.find((s) => s.title === "Lagos Nights (Refix)")!;
  const result = detectReuse(sample.fingerprint, sample.title);
  assert.equal(result.confidence, "high");
  assert.equal(result.recommendation, "flag-and-propose");
  assert.equal(result.bestMatch?.title, "Lagos Nights");
  assert.ok(result.similarity >= 0.95);
});

test("detectReuse: MEDIUM sample lands in the review band", () => {
  const result = detectReuseByTitle("Sunrise Blend");
  assert.equal(result.confidence, "medium");
  assert.ok(result.similarity >= 0.85 && result.similarity < 0.95);
});

test("detectReuse: NONE sample yields no match", () => {
  const result = detectReuseByTitle("Original Composition");
  assert.equal(result.confidence, "none");
  assert.equal(result.bestMatch, null);
});

test("proposeLicense NEVER auto-submits and requires human confirmation", () => {
  const high = detectReuseByTitle("Lagos Nights (Refix)");
  const proposal = proposeLicense(high);
  assert.ok(proposal, "expected a proposal for a high-confidence match");
  assert.equal(proposal!.autoSubmit, false);
  assert.equal(proposal!.requiresHumanConfirmation, true);
  assert.equal(proposal!.proposedBy, "ai");
  assert.equal(proposal!.riddimId, 1); // Lagos Nights
});

test("proposeLicense returns null for a no-match detection", () => {
  const none = detectReuseByTitle("Original Composition");
  assert.equal(proposeLicense(none), null);
});
