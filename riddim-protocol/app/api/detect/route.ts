import { NextResponse } from "next/server";

import {
  detectReuse,
  detectReuseByTitle,
  fingerprintSamples,
  proposeLicense,
} from "@/lib/detection";
import { createDetection, listDetections } from "@/lib/supabase-service";

export async function GET() {
  const detections = await listDetections();
  return NextResponse.json({ detections, samples: fingerprintSamples });
}

// Run reuse detection on a candidate track. Returns the match, a confidence
// band, and — for high/medium matches — a license PROPOSAL to pre-fill the
// form. This endpoint NEVER submits a transaction; a human confirms and signs.
export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const title: string = payload.title ?? "Untitled";

  const result = Array.isArray(payload.fingerprint)
    ? detectReuse(payload.fingerprint, title)
    : detectReuseByTitle(title);

  const proposal = proposeLicense(result);

  // Persist the proposal for the dashboard log (status stays "proposed").
  const detection = await createDetection({
    query_title: result.queryTitle,
    matched_riddim_title: result.bestMatch?.title ?? null,
    matched_riddim_id: result.bestMatch?.riddimId ?? null,
    similarity: Math.round(result.similarity * 1000) / 10,
    confidence: result.confidence,
    recommendation: result.recommendation,
    status: "proposed",
  });

  return NextResponse.json({
    result,
    proposal, // null for no-match; { autoSubmit: false, ... } otherwise
    detection,
    // Made explicit for the client: this is advisory only.
    autoSubmitted: false,
  });
}
