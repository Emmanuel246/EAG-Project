import fingerprintData from "./fingerprints.json";

// ---------------------------------------------------------------------------
// Reuse detection (STUB).
//
// This module estimates how similar a candidate track is to riddims already in
// the registry, using cosine similarity over fingerprint vectors. The
// fingerprints here are hand-authored 8-dim vectors (see fingerprints.json); a
// production build would swap `generateFingerprint` for a real audio embedding
// model and keep everything below unchanged.
//
// GUARANTEE: nothing in this file signs or submits a transaction. `detectReuse`
// and `proposeLicense` only return data. A high-confidence match yields a
// *proposal* that pre-fills the license form — a human still clicks "License"
// in their wallet. The AI proposes; the human confirms.
// ---------------------------------------------------------------------------

export type Fingerprint = number[];

export type LibraryEntry = {
  riddimId: number;
  title: string;
  artist: string;
  fingerprint: Fingerprint;
};

export type Confidence = "high" | "medium" | "none";
export type Recommendation = "flag-and-propose" | "review" | "no-match";

// Thresholds (from the build spec):
//   >= 0.95  high   -> flag and propose a license
//   0.85..0.94 medium -> surface for human review
//   < 0.85   none   -> no match
export const HIGH_CONFIDENCE_THRESHOLD = 0.95;
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.85;

export const fingerprintLibrary = fingerprintData.library as LibraryEntry[];
export const fingerprintSamples = fingerprintData.samples as Array<{
  title: string;
  note: string;
  fingerprint: Fingerprint;
}>;

/** Cosine similarity in [-1, 1]; 1 = identical direction. */
export function cosineSimilarity(a: Fingerprint, b: Fingerprint): number {
  if (a.length !== b.length || a.length === 0) {
    throw new Error("Fingerprints must be non-empty and equal length.");
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Deterministic pseudo-fingerprint from a seed string. STUB stand-in for an
 * audio embedding — same seed always yields the same vector, so the demo and
 * its tests are reproducible. No randomness (would break determinism).
 */
export function generateFingerprint(seed: string, dims = 8): Fingerprint {
  const v = new Array(dims).fill(0);
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    // Spread each character across dimensions with a couple of mixing constants.
    v[i % dims] += ((code * 31 + i * 17) % 97) / 97;
    v[(i * 7 + 3) % dims] += ((code * 13 + 5) % 89) / 89;
  }
  // Guarantee a non-zero vector so cosine is defined.
  if (v.every((x) => x === 0)) v[0] = 1;
  return v;
}

export function classifyConfidence(similarity: number): {
  confidence: Confidence;
  recommendation: Recommendation;
} {
  if (similarity >= HIGH_CONFIDENCE_THRESHOLD) {
    return { confidence: "high", recommendation: "flag-and-propose" };
  }
  if (similarity >= MEDIUM_CONFIDENCE_THRESHOLD) {
    return { confidence: "medium", recommendation: "review" };
  }
  return { confidence: "none", recommendation: "no-match" };
}

export type DetectionMatch = {
  riddimId: number;
  title: string;
  artist: string;
  similarity: number;
};

export type DetectionResult = {
  queryTitle: string;
  bestMatch: DetectionMatch | null;
  similarity: number;
  confidence: Confidence;
  recommendation: Recommendation;
  ranked: DetectionMatch[];
};

/** Compare a fingerprint against the library and classify the top match. */
export function detectReuse(
  queryFingerprint: Fingerprint,
  queryTitle = "Untitled",
  library: LibraryEntry[] = fingerprintLibrary,
): DetectionResult {
  const ranked: DetectionMatch[] = library
    .map((entry) => ({
      riddimId: entry.riddimId,
      title: entry.title,
      artist: entry.artist,
      similarity: cosineSimilarity(queryFingerprint, entry.fingerprint),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  const top = ranked[0] ?? null;
  const similarity = top ? top.similarity : 0;
  const { confidence, recommendation } = classifyConfidence(similarity);

  return {
    queryTitle,
    bestMatch: confidence === "none" ? null : top,
    similarity,
    confidence,
    recommendation,
    ranked,
  };
}

/**
 * Resolve a detection by track title. If the title matches a seeded demo
 * sample, its authored fingerprint is used; otherwise a deterministic
 * fingerprint is generated from the title. Convenience for the dashboard/API.
 */
export function detectReuseByTitle(
  title: string,
  library: LibraryEntry[] = fingerprintLibrary,
): DetectionResult {
  const sample = fingerprintSamples.find(
    (s) => s.title.toLowerCase() === title.trim().toLowerCase(),
  );
  const fp = sample ? sample.fingerprint : generateFingerprint(title);
  return detectReuse(fp, title, library);
}

export type LicenseProposal = {
  // What the human is being asked to confirm. This is form pre-fill data, NOT
  // a transaction. `autoSubmit` is always false by construction.
  autoSubmit: false;
  proposedBy: "ai";
  requiresHumanConfirmation: true;
  riddimId: number;
  matchedTitle: string;
  similarity: number;
  similarityPercent: number;
  confidence: Confidence;
  message: string;
};

/**
 * Turn a high/medium-confidence detection into a license proposal. Returns null
 * for no-match. NEVER submits a transaction — the returned object pre-fills the
 * license form so a human can review and sign it in their wallet.
 */
export function proposeLicense(
  detection: DetectionResult,
): LicenseProposal | null {
  if (!detection.bestMatch || detection.confidence === "none") return null;

  const { bestMatch, similarity, confidence } = detection;
  const pct = Math.round(similarity * 1000) / 10;
  const message =
    confidence === "high"
      ? `High-confidence reuse of "${bestMatch.title}" (${pct}%). Proposed license pre-filled — review and confirm in your wallet.`
      : `Possible reuse of "${bestMatch.title}" (${pct}%). Flagged for human review before any license is created.`;

  return {
    autoSubmit: false,
    proposedBy: "ai",
    requiresHumanConfirmation: true,
    riddimId: bestMatch.riddimId,
    matchedTitle: bestMatch.title,
    similarity,
    similarityPercent: pct,
    confidence,
    message,
  };
}
