import { NextResponse } from "next/server";

import {
  normalizePlatformRecord,
  platformAdapters,
  supportedPlatforms,
  type PlatformName,
} from "@/lib/platform-adapters";
import { listPlatformRecords, upsertPlatformRecord } from "@/lib/supabase-service";

function isPlatform(value: unknown): value is PlatformName {
  return typeof value === "string" && supportedPlatforms.includes(value as PlatformName);
}

// GET: adapter registry + everything synced into the rights DB so far.
export async function GET() {
  const records = await listPlatformRecords();
  return NextResponse.json({
    message: "Platform adapter registry ready",
    supportedPlatforms,
    adapters: Object.values(platformAdapters).map((adapter) => ({
      name: adapter.name,
      routes: ["syncTrack", "listTracks"],
    })),
    records,
  });
}

// POST: run a platform adapter, normalize the result into the canonical rights
// schema, and persist it to Supabase (upsert by platform + external track id).
export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const platform: PlatformName = isPlatform(payload.platform)
    ? payload.platform
    : "audiomack";

  const normalized = await platformAdapters[platform].syncTrack(payload);
  const record = normalizePlatformRecord(normalized);

  const saved = await upsertPlatformRecord({
    platform: record.platform,
    external_track_id: record.externalTrackId,
    title: record.title,
    artist: record.artist,
    rights_owner_wallet: record.rightsOwnerWallet ?? null,
    usage_type: record.usageType,
    license_status: record.licenseStatus,
    source_url: record.sourceUrl ?? null,
    payout_split: record.payoutSplit,
    last_synced_at: record.lastSyncedAt,
  });

  return NextResponse.json({ record: saved }, { status: 201 });
}
