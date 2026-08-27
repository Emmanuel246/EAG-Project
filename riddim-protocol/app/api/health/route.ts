import { NextResponse } from "next/server";

import { cloudinaryClient } from "@/lib/cloudinary";
import { getChainStatus } from "@/lib/onchain/registry";
import { probeTables } from "@/lib/supabase-service";

// Deep health check: reports real connectivity for both the offchain DB
// (per-table probe) and the onchain layer (RPC reachability + deployment).
export async function GET() {
  const [db, chain] = await Promise.all([
    probeTables().catch((e) => ({
      connected: false,
      mode: "error" as const,
      error: e instanceof Error ? e.message : String(e),
      tables: {},
    })),
    getChainStatus().catch((e) => ({
      configured: false,
      reachable: false,
      error: e instanceof Error ? e.message : String(e),
    })),
  ]);

  return NextResponse.json({
    status: "ok",
    offchain: {
      supabase: db,
      cloudinary: !!cloudinaryClient,
    },
    onchain: chain,
  });
}
