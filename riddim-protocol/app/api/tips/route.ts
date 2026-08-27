import { NextResponse } from "next/server";

import { createTip, listTips } from "@/lib/supabase-service";

export async function GET() {
  const tips = await listTips();
  return NextResponse.json({ tips });
}

// Mirror a tip after the onchain split has executed. The contract performs the
// real transfers; the `split` here is the computed breakdown for display,
// passed by the client from the track's onchain component data.
export async function POST(request: Request) {
  const payload = await request.json();
  const tip = await createTip({
    track_title: payload.trackTitle ?? payload.track_title ?? "Untitled track",
    amount: Number(payload.amount ?? 0),
    split: payload.split ?? [],
    track_id: payload.trackId ?? payload.track_id ?? null,
    tipper_wallet: payload.tipper ?? payload.tipper_wallet ?? null,
    tx_hash: payload.txHash ?? payload.tx_hash ?? null,
    chain_id: payload.chainId ?? payload.chain_id ?? null,
  });
  return NextResponse.json({ tip }, { status: 201 });
}
