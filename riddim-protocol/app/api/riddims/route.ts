import { NextResponse } from "next/server";

import { createRiddim, listRiddims } from "@/lib/supabase-service";

export async function GET() {
  const riddims = await listRiddims();
  return NextResponse.json({ riddims });
}

// Mirror a riddim after onchain registration (client passes onchainRiddimId +
// txHash). Works in offchain/demo mode too, where those stay null.
export async function POST(request: Request) {
  const payload = await request.json();
  const riddim = await createRiddim({
    title: payload.title,
    producer_wallet: payload.producer_wallet ?? payload.producerWallet,
    status: payload.status,
    components: payload.components,
    onchain_riddim_id: payload.onchainRiddimId ?? payload.onchain_riddim_id ?? null,
    tx_hash: payload.txHash ?? payload.tx_hash ?? null,
    chain_id: payload.chainId ?? payload.chain_id ?? null,
  });
  return NextResponse.json({ riddim }, { status: 201 });
}
