import { NextResponse } from "next/server";

const demoTips = [
  {
    id: "tip-1",
    trackTitle: "Afro Riddim 01",
    amount: 10,
    split: [
      { wallet: "0xAlice", share: 52, amount: 5.2 },
      { wallet: "0xBob", share: 28, amount: 2.8 },
      { wallet: "0xIfe", share: 20, amount: 2 },
    ],
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ tips: demoTips });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const amount = Number(payload.amount ?? 0);
  const split = [
    {
      wallet: "0xAlice",
      share: 52,
      amount: Number((amount * 0.52).toFixed(2)),
    },
    { wallet: "0xBob", share: 28, amount: Number((amount * 0.28).toFixed(2)) },
    { wallet: "0xIfe", share: 20, amount: Number((amount * 0.2).toFixed(2)) },
  ];

  const item = {
    id: `tip-${Date.now()}`,
    trackTitle: payload.trackTitle ?? "Afro Riddim 01",
    amount,
    split,
    createdAt: new Date().toISOString(),
  };

  demoTips.unshift(item);
  return NextResponse.json({ tip: item }, { status: 201 });
}
