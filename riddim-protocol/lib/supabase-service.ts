import { getSupabaseClient } from "./supabase";

// ---------------------------------------------------------------------------
// Offchain service layer.
//
// The onchain contract is the source of truth; this module mirrors/records the
// same entities in Supabase for fast reads, richer metadata, and reuse
// proposals. Every function degrades gracefully: if Supabase is unconfigured OR
// a specific table is missing/errors, it falls back to an in-memory demo store
// so the app keeps working (offchain/demo mode) instead of crashing.
// ---------------------------------------------------------------------------

const nowIso = () => new Date().toISOString();
const demoId = (prefix: string) =>
  `${prefix}-${Math.floor(Math.random() * 1e9).toString(36)}${Date.now().toString(36)}`;

// ============================ Riddims ======================================

export type RiddimRecord = {
  id?: string;
  title: string;
  producer_wallet?: string;
  status?: "draft" | "registered" | "licensed";
  components?: Array<{ name: string; share: number; wallet: string }>;
  onchain_riddim_id?: number | null;
  tx_hash?: string | null;
  chain_id?: number | null;
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
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

export async function listRiddims() {
  const client = getSupabaseClient();
  if (!client) return demoRiddims;

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
    onchain_riddim_id: payload.onchain_riddim_id ?? null,
    tx_hash: payload.tx_hash ?? null,
    chain_id: payload.chain_id ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  if (!client) {
    const item = { id: demoId("riddim"), ...record };
    demoRiddims.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("riddims")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createRiddim error:", error.message);
    const fallback = { id: demoId("riddim"), ...record };
    demoRiddims.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Tracks =======================================

export type TrackRecord = {
  id?: string;
  title: string;
  artist_wallet?: string;
  riddim_ids?: number[];
  voice_clone_ids?: number[];
  onchain_track_id?: number | null;
  tx_hash?: string | null;
  chain_id?: number | null;
  total_tipped?: number;
  media_url?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

const demoTracks: TrackRecord[] = [];

export async function listTracks() {
  const client = getSupabaseClient();
  if (!client) return demoTracks;

  const { data, error } = await client
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase listTracks error:", error.message);
    return demoTracks;
  }
  return data ?? demoTracks;
}

export async function createTrack(payload: TrackRecord) {
  const client = getSupabaseClient();
  const record = {
    title: payload.title,
    artist_wallet: payload.artist_wallet ?? "0xDemoArtist",
    riddim_ids: payload.riddim_ids ?? [],
    voice_clone_ids: payload.voice_clone_ids ?? [],
    onchain_track_id: payload.onchain_track_id ?? null,
    tx_hash: payload.tx_hash ?? null,
    chain_id: payload.chain_id ?? null,
    total_tipped: payload.total_tipped ?? 0,
    media_url: payload.media_url ?? null,
    status: payload.status ?? "licensed",
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  if (!client) {
    const item = { id: demoId("track"), ...record };
    demoTracks.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("tracks")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createTrack error:", error.message);
    const fallback = { id: demoId("track"), ...record };
    demoTracks.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Voice clones =================================

export type VoiceCloneRecord = {
  id?: string;
  voice_name: string;
  artist_wallet?: string;
  royalty_bps?: number;
  payout_wallet?: string;
  onchain_voice_id?: number | null;
  tx_hash?: string | null;
  chain_id?: number | null;
  active?: boolean;
  created_at?: string;
};

const demoVoiceClones: VoiceCloneRecord[] = [];

export async function listVoiceClones() {
  const client = getSupabaseClient();
  if (!client) return demoVoiceClones;

  const { data, error } = await client
    .from("voice_clones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase listVoiceClones error:", error.message);
    return demoVoiceClones;
  }
  return data ?? demoVoiceClones;
}

export async function createVoiceClone(payload: VoiceCloneRecord) {
  const client = getSupabaseClient();
  const record = {
    voice_name: payload.voice_name,
    artist_wallet: payload.artist_wallet ?? "0xDemoArtist",
    royalty_bps: payload.royalty_bps ?? 0,
    payout_wallet: payload.payout_wallet ?? payload.artist_wallet ?? "0xDemoArtist",
    onchain_voice_id: payload.onchain_voice_id ?? null,
    tx_hash: payload.tx_hash ?? null,
    chain_id: payload.chain_id ?? null,
    active: payload.active ?? true,
    created_at: nowIso(),
  };

  if (!client) {
    const item = { id: demoId("voice"), ...record };
    demoVoiceClones.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("voice_clones")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createVoiceClone error:", error.message);
    const fallback = { id: demoId("voice"), ...record };
    demoVoiceClones.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Licenses =====================================

export type LicenseRecord = {
  id?: string;
  title: string;
  producer?: string;
  similarity?: number;
  status?: string;
  riddim_id?: number | null;
  track_id?: number | null;
  tx_hash?: string | null;
  chain_id?: number | null;
  proposed_by?: "ai" | "human";
  created_at?: string;
};

const demoLicenses: LicenseRecord[] = [
  {
    id: "demo-license-1",
    title: "Afro Vibes Remix",
    producer: "Alice",
    similarity: 97.2,
    status: "approved",
    proposed_by: "human",
    created_at: nowIso(),
  },
];

export async function listLicenses() {
  const client = getSupabaseClient();
  if (!client) return demoLicenses;

  const { data, error } = await client
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase listLicenses error:", error.message);
    return demoLicenses;
  }
  return data ?? demoLicenses;
}

export async function createLicense(payload: LicenseRecord) {
  const client = getSupabaseClient();
  const record = {
    title: payload.title,
    producer: payload.producer ?? "Pending review",
    similarity: payload.similarity ?? 0,
    status: payload.status ?? "approved",
    riddim_id: payload.riddim_id ?? null,
    track_id: payload.track_id ?? null,
    tx_hash: payload.tx_hash ?? null,
    chain_id: payload.chain_id ?? null,
    proposed_by: payload.proposed_by ?? "human",
    created_at: nowIso(),
  };

  if (!client) {
    const item = { id: demoId("license"), ...record };
    demoLicenses.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("licenses")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createLicense error:", error.message);
    const fallback = { id: demoId("license"), ...record };
    demoLicenses.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Tips =========================================

export type TipSplitEntry = { wallet: string; share: number; amount: number };
export type TipRecord = {
  id?: string;
  track_title: string;
  amount?: number;
  split?: TipSplitEntry[];
  track_id?: number | null;
  tipper_wallet?: string | null;
  tx_hash?: string | null;
  chain_id?: number | null;
  created_at?: string;
};

const demoTips: TipRecord[] = [
  {
    id: "demo-tip-1",
    track_title: "Afro Riddim 01",
    amount: 10,
    split: [
      { wallet: "0xAlice", share: 52, amount: 5.2 },
      { wallet: "0xBob", share: 28, amount: 2.8 },
      { wallet: "0xIfe", share: 20, amount: 2 },
    ],
    created_at: nowIso(),
  },
];

export async function listTips() {
  const client = getSupabaseClient();
  if (!client) return demoTips;

  const { data, error } = await client
    .from("tips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase listTips error:", error.message);
    return demoTips;
  }
  return data ?? demoTips;
}

export async function createTip(payload: TipRecord) {
  const client = getSupabaseClient();
  const record = {
    track_title: payload.track_title,
    amount: payload.amount ?? 0,
    split: payload.split ?? [],
    track_id: payload.track_id ?? null,
    tipper_wallet: payload.tipper_wallet ?? null,
    tx_hash: payload.tx_hash ?? null,
    chain_id: payload.chain_id ?? null,
    created_at: nowIso(),
  };

  if (!client) {
    const item = { id: demoId("tip"), ...record };
    demoTips.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("tips")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createTip error:", error.message);
    const fallback = { id: demoId("tip"), ...record };
    demoTips.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Detections (AI proposals) ====================

export type DetectionRecord = {
  id?: string;
  query_title: string;
  matched_riddim_title?: string | null;
  matched_riddim_id?: number | null;
  similarity?: number;
  confidence?: "high" | "medium" | "none";
  recommendation?: string;
  status?: "proposed" | "confirmed" | "dismissed";
  created_at?: string;
};

const demoDetections: DetectionRecord[] = [];

export async function listDetections() {
  const client = getSupabaseClient();
  if (!client) return demoDetections;

  const { data, error } = await client
    .from("detections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase listDetections error:", error.message);
    return demoDetections;
  }
  return data ?? demoDetections;
}

export async function createDetection(payload: DetectionRecord) {
  const client = getSupabaseClient();
  const record = {
    query_title: payload.query_title,
    matched_riddim_title: payload.matched_riddim_title ?? null,
    matched_riddim_id: payload.matched_riddim_id ?? null,
    similarity: payload.similarity ?? 0,
    confidence: payload.confidence ?? "none",
    recommendation: payload.recommendation ?? "no-match",
    status: payload.status ?? "proposed",
    created_at: nowIso(),
  };

  if (!client) {
    const item = { id: demoId("detection"), ...record };
    demoDetections.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("detections")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Supabase createDetection error:", error.message);
    const fallback = { id: demoId("detection"), ...record };
    demoDetections.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Platform records =============================

export type PlatformRecordRow = {
  id?: string;
  platform: string;
  external_track_id: string;
  title: string;
  artist: string;
  rights_owner_wallet?: string | null;
  usage_type?: string;
  license_status?: string;
  source_url?: string | null;
  payout_split?: Array<{ wallet: string; share: number }>;
  last_synced_at?: string;
  created_at?: string;
};

const demoPlatformRecords: PlatformRecordRow[] = [];

export async function listPlatformRecords() {
  const client = getSupabaseClient();
  if (!client) return demoPlatformRecords;

  const { data, error } = await client
    .from("platform_records")
    .select("*")
    .order("last_synced_at", { ascending: false });

  if (error) {
    console.error("Supabase listPlatformRecords error:", error.message);
    return demoPlatformRecords;
  }
  return data ?? demoPlatformRecords;
}

/** Insert or update by (platform, external_track_id). */
export async function upsertPlatformRecord(payload: PlatformRecordRow) {
  const client = getSupabaseClient();
  const record = {
    platform: payload.platform,
    external_track_id: payload.external_track_id,
    title: payload.title,
    artist: payload.artist,
    rights_owner_wallet: payload.rights_owner_wallet ?? null,
    usage_type: payload.usage_type ?? "streaming",
    license_status: payload.license_status ?? "registered",
    source_url: payload.source_url ?? null,
    payout_split: payload.payout_split ?? [],
    last_synced_at: payload.last_synced_at ?? nowIso(),
  };

  if (!client) {
    const idx = demoPlatformRecords.findIndex(
      (r) =>
        r.platform === record.platform &&
        r.external_track_id === record.external_track_id,
    );
    if (idx >= 0) {
      demoPlatformRecords[idx] = { ...demoPlatformRecords[idx], ...record };
      return demoPlatformRecords[idx];
    }
    const item = { id: demoId("platform"), created_at: nowIso(), ...record };
    demoPlatformRecords.unshift(item);
    return item;
  }

  const { data, error } = await client
    .from("platform_records")
    .upsert(record, { onConflict: "platform,external_track_id" })
    .select()
    .single();

  if (error) {
    console.error("Supabase upsertPlatformRecord error:", error.message);
    const fallback = { id: demoId("platform"), created_at: nowIso(), ...record };
    demoPlatformRecords.unshift(fallback);
    return fallback;
  }
  return data;
}

// ============================ Health probe =================================

/** Probe each expected table so /api/health can report real connectivity. */
export async function probeTables() {
  const client = getSupabaseClient();
  const tables = [
    "riddims",
    "tracks",
    "voice_clones",
    "licenses",
    "tips",
    "detections",
    "platform_records",
  ];

  if (!client) {
    return {
      connected: false,
      mode: "demo" as const,
      tables: Object.fromEntries(tables.map((t) => [t, false])),
    };
  }

  const entries = await Promise.all(
    tables.map(async (t) => {
      const { error } = await client
        .from(t)
        .select("id", { count: "exact", head: true });
      return [t, !error] as const;
    }),
  );

  const status = Object.fromEntries(entries);
  const allOk = entries.every(([, ok]) => ok);
  return {
    connected: true,
    mode: allOk ? ("live" as const) : ("partial" as const),
    tables: status,
  };
}
