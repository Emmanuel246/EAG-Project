import { NextResponse } from "next/server";

import { createLicense, listLicenses } from "@/lib/supabase-service";

export async function GET() {
  const licenses = await listLicenses();
  return NextResponse.json({ licenses });
}

// Record a confirmed license (riddim -> track). This is written only AFTER a
// human has confirmed and, when onchain, signed the licenseRiddim tx in their
// wallet. `proposed_by: "ai"` means an AI detection surfaced it; the human
// still confirmed it.
export async function POST(request: Request) {
  const payload = await request.json();
  const license = await createLicense({
    title: payload.trackTitle ?? payload.title ?? "New track",
    producer: payload.producer,
    similarity: payload.similarity,
    riddim_id: payload.riddimId ?? payload.riddim_id ?? null,
    track_id: payload.trackId ?? payload.track_id ?? null,
    tx_hash: payload.txHash ?? payload.tx_hash ?? null,
    chain_id: payload.chainId ?? payload.chain_id ?? null,
    proposed_by: payload.proposedBy ?? payload.proposed_by ?? "human",
    status: payload.status ?? "approved",
  });
  return NextResponse.json({ license }, { status: 201 });
}
