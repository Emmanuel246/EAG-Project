import { NextResponse } from "next/server";

import { cloudinaryClient } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    services: {
      supabase: !!supabase,
      cloudinary: !!cloudinaryClient,
      messages: {
        supabase: !!supabase
          ? "Supabase client configured"
          : "Missing SUPABASE env vars",
        cloudinary: !!cloudinaryClient
          ? "Cloudinary configured"
          : "Missing Cloudinary env vars",
      },
    },
  });
}
