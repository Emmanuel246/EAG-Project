import { NextResponse } from "next/server";

const demoLicenses = [
  {
    id: "license-1",
    trackTitle: "Afro Vibes Remix",
    status: "approved",
    similarity: 97.2,
    producer: "Alice",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ licenses: demoLicenses });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const license = {
    id: `license-${Date.now()}`,
    trackTitle: payload.trackTitle ?? "New track",
    status: "approved",
    similarity: payload.similarity ?? 96.5,
    producer: payload.producer ?? "Pending review",
    createdAt: new Date().toISOString(),
  };

  demoLicenses.unshift(license);
  return NextResponse.json({ license }, { status: 201 });
}
