import { getSupabaseClient } from "./supabase";

export type RiddimRecord = {
  id?: string;
  title: string;
  producer_wallet?: string;
  status?: "draft" | "registered" | "licensed";
  components?: Array<{ name: string; share: number; wallet: string }>;
  created_at?: string;
  updated_at?: string;
};

const demoRiddims: RiddimRecord[] = [
  {
    id: "demo-riddim-1",
    title: "Afro Vibes",
    producer_wallet: "0xProducerA",
    status: "registered",
    components: [
      { name: "drums", share: 40, wallet: "0xAlice" },
      { name: "melody", share: 60, wallet: "0xBob" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function listRiddims() {
  const client = getSupabaseClient();

  if (!client) {
    return demoRiddims;
  }

  const { data, error } = await client
    .from("riddims")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase listRiddims error:", error.message);
    return demoRiddims;
  }

  return data ?? demoRiddims;
}

export async function createRiddim(payload: RiddimRecord) {
  const client = getSupabaseClient();

  const record = {
    title: payload.title,
    producer_wallet: payload.producer_wallet ?? "0xDemoProducer",
    status: payload.status ?? "registered",
    components: payload.components ?? [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!client) {
    const newItem = {
      id: `demo-riddim-${Date.now()}`,
      ...record,
    };
    demoRiddims.unshift(newItem);
    return newItem;
  }

  const { data, error } = await client
    .from("riddims")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createRiddim error:", error.message);
    const fallback = {
      id: `demo-riddim-${Date.now()}`,
      ...record,
    };
    demoRiddims.unshift(fallback);
    return fallback;
  }

  return data;
}
