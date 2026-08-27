import { NextResponse } from "next/server";

import { getChainStatus } from "@/lib/onchain/registry";

// Chain + deployment status for banners (not-deployed / wrong-network / RPC).
export async function GET() {
  const status = await getChainStatus();
  return NextResponse.json(status);
}
