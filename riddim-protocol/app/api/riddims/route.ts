import { NextResponse } from "next/server";

import { createRiddim, listRiddims } from "@/lib/supabase-service";

export async function GET() {
  const riddims = await listRiddims();
  return NextResponse.json({ riddims });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const riddim = await createRiddim(payload);
  return NextResponse.json({ riddim }, { status: 201 });
}
