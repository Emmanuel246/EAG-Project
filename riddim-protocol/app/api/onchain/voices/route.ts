import { NextResponse } from "next/server";

import { isContractConfigured } from "@/lib/onchain/config";
import { listVoiceClones } from "@/lib/onchain/registry";

// Live voice-clone licenses read directly from the contract.
export async function GET() {
  if (!isContractConfigured()) {
    return NextResponse.json({ configured: false, voiceClones: [] });
  }
  try {
    const voiceClones = await listVoiceClones();
    return NextResponse.json({ configured: true, voiceClones });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        voiceClones: [],
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
