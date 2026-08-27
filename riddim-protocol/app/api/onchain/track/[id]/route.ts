import { NextResponse } from "next/server";

import { isContractConfigured } from "@/lib/onchain/config";
import { getTrackFull } from "@/lib/onchain/registry";

// A single track resolved with its riddims (+ components) and attached voice
// clones — the shape the tip preview and live view need.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trackId = Number(id);
  if (!Number.isInteger(trackId) || trackId <= 0) {
    return NextResponse.json({ error: "Invalid track id" }, { status: 400 });
  }
  if (!isContractConfigured()) {
    return NextResponse.json({ configured: false, track: null });
  }
  try {
    const full = await getTrackFull(trackId);
    if (!full) {
      return NextResponse.json({ configured: true, track: null }, { status: 404 });
    }
    return NextResponse.json({ configured: true, ...full });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        track: null,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
