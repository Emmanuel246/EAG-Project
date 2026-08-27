import { NextResponse } from "next/server";

import { isContractConfigured } from "@/lib/onchain/config";
import { listTracks } from "@/lib/onchain/registry";

// Live tracks read directly from the contract.
export async function GET() {
  if (!isContractConfigured()) {
    return NextResponse.json({ configured: false, tracks: [] });
  }
  try {
    const tracks = await listTracks();
    return NextResponse.json({ configured: true, tracks });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        tracks: [],
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
