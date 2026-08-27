import { NextResponse } from "next/server";

import { getCounts, listRiddims } from "@/lib/onchain/registry";
import { isContractConfigured } from "@/lib/onchain/config";

// Live riddims read directly from the contract (source of truth).
export async function GET() {
  if (!isContractConfigured()) {
    return NextResponse.json({ configured: false, riddims: [], counts: null });
  }
  try {
    const [riddims, counts] = await Promise.all([listRiddims(), getCounts()]);
    return NextResponse.json({ configured: true, riddims, counts });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        riddims: [],
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
