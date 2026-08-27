# Supabase setup for Riddim Protocol

Riddim Protocol keeps the **smart contract as the source of truth** and uses Supabase as a fast **offchain mirror / index** of registry state. The app is designed to run with or without Supabase: when credentials (or a specific table) are missing, every data function transparently falls back to an in-memory demo store and the UI labels itself "offchain mode." Nothing crashes.

## 1. Create a Supabase project

1. Sign in to Supabase and create a new project.
2. Copy the project URL, anon key, and service-role key.
3. Add them to `riddim-protocol/.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 2. Apply the schema (required for live mode)

`supabase-js` **cannot run DDL**, so schema creation is a one-time manual step. Open the **SQL editor** in Supabase and run the full contents of:

- `supabase/schema.sql`

The script is **idempotent** (`create table if not exists` + `alter table … add column if not exists`), so it is safe to re-run after updates. It creates:

| Table | Role |
| --- | --- |
| `profiles` | Optional creator profiles. |
| `riddims` | Mirror of registered riddims + components. Onchain link: `onchain_riddim_id`, `tx_hash`, `chain_id`. |
| `tracks` | Mirror of licensed tracks. Onchain link: `onchain_track_id`, `tx_hash`, `chain_id`. |
| `voice_clones` | Mirror of registered voice clones (name, `royalty_bps`, payout, `onchain_voice_id`). |
| `licenses` | Reuse-license records (`riddim_id`, `track_id`, `similarity`, `proposed_by` = `ai`/`human`, `tx_hash`, `chain_id`). |
| `tips` | Tip records with the computed split, `tx_hash`, `chain_id`. |
| `detections` | AI reuse-check log (query title, matched riddim, similarity, confidence band, status). |
| `platform_records` | Canonical rights records from platform adapters. Unique on `(platform, external_track_id)`. |
| `platform_integrations` | Legacy table kept for backward compatibility. |

> **Until you run the script,** any entity whose table is missing simply uses the demo fallback. You can verify what is live at any time via the health endpoint (below).

## 3. Media storage (optional)

Uploaded demo assets go to **Cloudinary** (`NEXT_PUBLIC_CLOUDINARY_*` + `CLOUDINARY_API_SECRET`). No Supabase Storage bucket is required.

## 4. Verify connectivity

With the app running (`npm run dev`), hit:

```
GET /api/health
```

It calls `probeTables()` and reports `mode: "live" | "partial" | "demo"` plus a per-table breakdown, alongside the onchain status (chain 133, reachable, contract address, latest block). This is the fastest way to confirm the offchain layer is actually wired up.

## 5. App behavior summary

- **Supabase reachable + tables present** → live mirror (`mode: live`).
- **Some tables missing** → those entities fall back to demo (`mode: partial`); the rest stay live.
- **No credentials** → full demo store (`mode: demo`); the contract can still be the source of truth if `NEXT_PUBLIC_CONTRACT_ADDRESS` is set.

This is a hackathon prototype: the data layer is real and production-shaped, but the live connection depends on your own Supabase project and running `schema.sql`.
