import { NextResponse } from "next/server";

import { createVoiceClone, listVoiceClones } from "@/lib/supabase-service";

export async function GET() {
  const voiceClones = await listVoiceClones();
  return NextResponse.json({ voiceClones });
}

// Mirror a voice-clone license after onchain registration. The 50% royalty cap
// is enforced by the contract; we mirror whatever the chain accepted.
export async function POST(request: Request) {
  const payload = await request.json();
  const voiceClone = await createVoiceClone(payload);
  return NextResponse.json({ voiceClone }, { status: 201 });
}
