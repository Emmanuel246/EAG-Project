import { NextResponse } from "next/server";

import { platformAdapters, supportedPlatforms } from "@/lib/platform-adapters";

export async function GET() {
  return NextResponse.json({
    message: "Platform adapter registry ready",
    supportedPlatforms,
    platforms: Object.values(platformAdapters).map((adapter) => ({
      name: adapter.name,
      status: "demo-adapter",
      routes: ["syncTrack", "listTracks"],
    })),
  });
}
