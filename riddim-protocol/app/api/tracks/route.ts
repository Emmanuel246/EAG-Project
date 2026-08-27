import { NextResponse } from "next/server";

import { createTrack, listTracks } from "@/lib/supabase-service";

export async function GET() {
  const tracks = await listTracks();
  return NextResponse.json({ tracks });
}

// Mirror a track after it has been licensed onchain (client passes tx_hash +
// onchain_track_id). Works in offchain mode too (fields stay null).
export async function POST(request: Request) {
  const payload = await request.json();
  const track = await createTrack(payload);
  return NextResponse.json({ track }, { status: 201 });
}
