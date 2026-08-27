# Riddim Protocol

**Programmable music rights for African music — register a beat, license reuse, license a voice, and split every tip automatically onchain.**

Built for the EAG Global Buildathon. Riddim Protocol turns the informal "who owns this beat / who sampled whom / who gets paid" problem into onchain, enforceable rules: a producer registers a *riddim* (a beat broken into ownership components), an artist licenses it into a *track*, and when a fan tips that track the money splits itself across every rightful owner — including licensed AI **voice clones** — with no middleman.

> **The contract is the source of truth.** The web app reads live state from the contract and mirrors it into an offchain database for fast indexing. The AI similarity check only ever **proposes** a match — a human reviews it and signs the license in their own wallet. The AI can never move funds or submit a transaction.

---

## What it does

| Action | Onchain effect |
| --- | --- |
| **Register a riddim** | Stores a beat with named components (drums, melody, …), each with a payout wallet and a split in basis points. The contract enforces that splits sum to exactly 100%. |
| **Detect reuse** | An offchain similarity check compares a candidate track's fingerprint against registered riddims and returns a confidence band. **Proposal only — never a transaction.** |
| **License a riddim → track** | An artist licenses one or more riddims into a new track. Human-signed. |
| **Register a voice clone** | A voice is a first-class licensed asset with its own royalty rate (capped at 50% onchain). Only the owner can attach it to a track. |
| **Tip a track** | The contract takes voice-clone royalties off the top, then splits the remainder across every riddim component owner — atomically, in one transaction. |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  Next.js App (App Router) — the ONLY user interface            │
│                                                                 │
│  RainbowKit wallet (wide range) ─ signs all writes             │
│         │                                                       │
│         ▼                                                       │
│  lib/onchain/*  (viem)          app/api/*  (server, read-only)  │
│   • wallet.ts  → writes          • /api/onchain/*  → live reads │
│   • registry.ts → reads          • /api/detect     → AI propose │
│   • split.ts   → mirrors the     • /api/platforms  → adapters   │
│     contract's tip math          • /api/{riddims,tracks,tips…}  │
│         │                              │                        │
│         ▼                              ▼                        │
│  RiddimRegistry.sol            Supabase (offchain mirror/index) │
│  (HSK Testnet — source          + Cloudinary (media)            │
│   of truth)                                                     │
└───────────────────────────────────────────────────────────────┘
```

- **Onchain (source of truth):** `contracts/src/RiddimRegistry.sol`, Solidity 0.8.20, deployed to **HSK Testnet (chain 133)**. No admin keys, no upgradeability, no pause. Payouts use `.transfer()`.
- **Chain access:** [viem](https://viem.sh). Reads run server-side ([lib/onchain/registry.ts](lib/onchain/registry.ts)); writes are signed in the browser via **RainbowKit + wagmi** ([lib/onchain/wallet.ts](lib/onchain/wallet.ts)) — users connect with any of a wide range of wallets (MetaMask, Rainbow, Coinbase, and WalletConnect mobile).
- **Offchain (mirror/index):** Supabase holds a queryable copy of registry state with optional `onchain_*_id` / `tx_hash` / `chain_id` linkage. Every service function **degrades gracefully to an in-memory demo store** if Supabase (or a specific table) is unreachable — the app never crashes, it just labels itself "offchain mode."
- **Detection:** cosine similarity over fingerprint vectors ([lib/detection/](lib/detection/)). See *What's real vs stubbed* below.
- **Platform adapters:** [lib/platform-adapters.ts](lib/platform-adapters.ts) normalizes Audiomack / Spotify / Boomplay track metadata into one canonical rights schema.

---

## The AI-proposes / human-confirms guarantee

This is a hard product invariant, enforced structurally — not just by UI copy:

1. **The server holds no private key.** No server route can sign a transaction.
2. `detectReuse` / `proposeLicense` in [lib/detection/index.ts](lib/detection/index.ts) return a proposal object with `autoSubmit: false`, `proposedBy: "ai"`, `requiresHumanConfirmation: true` — or `null` for no match.
3. The `/api/detect` route always responds with `autoSubmitted: false`.
4. Licensing only happens when the human clicks **"Use this proposal →"**, reviews the pre-filled form, and **signs in their own wallet**.

The Detect & License page labels every proposal `🤖 AI PROPOSAL — NOT SUBMITTED` so the guarantee is visible, not just true.

**Confidence bands:** ≥ 0.95 → high (flag + propose license) · 0.85–0.94 → medium (review) · < 0.85 → no match.

---

## Getting started

```bash
cd riddim-protocol
npm install
cp .env.example .env      # fill in Supabase + Cloudinary; contract address optional
npm run dev               # http://localhost:3000
```

**Offchain mode (no contract):** leave `NEXT_PUBLIC_CONTRACT_ADDRESS` empty. Every page works against Supabase/demo data and shows an "offchain mode" banner. This is the default first-run experience.

**Onchain mode:** deploy the contract (below), set `NEXT_PUBLIC_CONTRACT_ADDRESS`, and the app reads live state and enables wallet-signed writes.

### Environment

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Offchain mirror. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md). |
| `NEXT_PUBLIC_CLOUDINARY_*` / `CLOUDINARY_API_SECRET` | Media uploads. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed `RiddimRegistry`. Empty = offchain mode. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | RainbowKit/WalletConnect id ([cloud.walletconnect.com](https://cloud.walletconnect.com)). Optional — injected wallets work without it; set it to enable WalletConnect + mobile wallets. |
| `NEXT_PUBLIC_CHAIN_ID` | `133` (HSK Testnet). |
| `NEXT_PUBLIC_HSK_RPC_URL` | `https://testnet.hsk.xyz` (no `/rpc` suffix). |

---

## Deploy the web app (Vercel)

The Next.js app lives in the **`riddim-protocol/` subdirectory**, not the repo root — so the one setting that makes or breaks the deploy is the **Root Directory**.

1. In Vercel, **Add New… → Project** and import this repo.
2. **Set Root Directory to `riddim-protocol`** (on the import screen, or Settings → General → Root Directory). Without it, Vercel looks for `package.json` at the repo root, finds none, and the build fails — this is the most common cause of a failed deploy here.
3. Framework preset auto-detects as **Next.js**; leave the build & output settings at their defaults.
4. **Add environment variables** (Settings → Environment Variables). `.env` is gitignored, so nothing uploads automatically — add each key from the table above: the Supabase trio, the Cloudinary trio, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_CONTRACT_ADDRESS` (or leave it unset for offchain mode), `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_HSK_RPC_URL`, and `NEXT_PUBLIC_BASE_URL` set to your Vercel URL (e.g. `https://your-app.vercel.app`) — **not** `localhost`.
5. **Never add `PRIVATE_KEY` to Vercel.** It is used only by the Hardhat toolchain in `contracts/` to deploy the contract from your own machine; the web app never reads it.
6. Deploy. `NEXT_PUBLIC_*` values are inlined at **build time**, so after editing any of them you must **redeploy** for the change to take effect.

---

## Smart contract

```bash
cd contracts
npm install
npm test                      # 15 tests
npm run deploy:hsk            # → HSK Testnet (chain 133); needs PRIVATE_KEY in contracts/.env
npm run deploy:hsk-mainnet    # → HSK Mainnet (chain 177); real HSK — see the mainnet note below
npm run export-abi            # regenerate the ABI the app imports
```

Deploying prints the contract address — put it in the app's `NEXT_PUBLIC_CONTRACT_ADDRESS`. `npm run deploy:sepolia` is the demo-day fallback (same contract, same flow).

**Mainnet (optional).** `npm run deploy:hsk-mainnet` deploys the same contract to **HSK Mainnet (chain 177)**. Mainnet runs a flat **500 gwei** base fee, so the deploy costs **~1.1 HSK** (~2.16M gas) and each register / license / tip costs roughly 0.1–0.3 HSK — fund the deployer wallet accordingly. The app is wired to **testnet** by default; repointing it to mainnet also means updating the chain definition in [lib/onchain/chain.ts](riddim-protocol/lib/onchain/chain.ts) to chain 177 and setting `NEXT_PUBLIC_CHAIN_ID` / `NEXT_PUBLIC_HSK_RPC_URL` to the mainnet values.

**Safety properties baked into `RiddimRegistry.sol`:**
- component splits must sum to `10000` bps (100%)
- voice-clone royalty capped at `MAX_VOICE_ROYALTY_BPS = 5000` (50%)
- only the voice owner can `attachVoiceClone`
- no admin keys, no upgradeability, no pause switch
- tips split in a single transaction; rounding dust (< 1 wei per line) stays in the contract

---

## Tests & verification

```bash
npm test          # app: riddim logic, platform adapters, detection (16 tests)
npx tsc --noEmit  # zero type errors
npm run build     # 22 routes compile
cd contracts && npm test   # 15 contract tests
```

A key detection test asserts **`proposeLicense` NEVER auto-submits**, locking in the core guarantee.

---

## What's real vs stubbed

Being honest about the demo boundary:

| Component | Status |
| --- | --- |
| Smart contract (registry, licensing, voice clones, tip split, all safety checks) | **Real.** Full Solidity + 15 passing tests, deployable to HSK/Sepolia. |
| viem read layer + RainbowKit/wagmi write layer | **Real.** Live contract reads; writes signed through the user's connected wallet (RainbowKit), with event-log parsing to recover new IDs. |
| Supabase offchain mirror + graceful demo fallback | **Real** where tables exist; **demo store** fallback otherwise. |
| Tip split math preview | **Real** — [lib/onchain/split.ts](lib/onchain/split.ts) mirrors the contract's arithmetic exactly (voice off the top, then per-component bps). |
| Cloudinary media upload | **Real** when configured. |
| **Audio fingerprinting** | **Stubbed.** Fingerprints are deterministic 8-dim vectors from a fixed library, not real DSP/audio analysis. The similarity *pipeline* (cosine + confidence banding + proposal) is real; the *feature extraction* is mocked. Swapping in a real embedding model is the only change needed for production. |

---

## Deliberate deviations from the original spec

Flagged per the build guardrails ("favor the simplest working implementation and flag simplifications"):

1. **Chain 133, not 177.** The spec listed HSK Testnet as chain 177 with RPC `https://testnet.hsk.xyz/rpc`. That endpoint 404s and **177 is HashKey *mainnet***. The real testnet is **chain 133** at `https://testnet.hsk.xyz` (no `/rpc`). We build against the correct values. See [lib/onchain/chain.ts](lib/onchain/chain.ts).
2. **No Telegram.** Earlier drafts referenced a Telegram bot + a standalone Node agent server. Both are removed. The **Next.js app is the only interface**; viem runs inside it (server for reads, browser wallet for writes) — no separate agent process.
3. **Audio fingerprinting is stubbed** (see above).
4. **DDL is manual.** `supabase-js` can't run schema DDL, so new tables require running `supabase/schema.sql` once in the Supabase SQL editor. Until then those entities transparently use the demo fallback.

---

## Project layout

```
riddim-protocol/
├─ app/
│  ├─ page.tsx            landing / product story
│  ├─ providers.tsx       wagmi + RainbowKit + react-query provider tree
│  ├─ app/page.tsx        live creator console (polls /api/onchain/*)
│  ├─ register/           register a riddim
│  ├─ license/            detect reuse (AI proposes) → license (human signs)
│  ├─ voice/              register + attach voice clones
│  ├─ tip/                tip a track, live split preview
│  ├─ integrations/       platform-adapter sync UI
│  └─ api/                read routes (onchain/*), detect, platforms, mirrors, health
├─ lib/
│  ├─ onchain/            chain.ts, config.ts, registry.ts (reads), wallet.ts (writes), split.ts, wagmi.ts (RainbowKit config)
│  ├─ detection/          index.ts, fingerprints.json, detection.test.ts
│  ├─ platform-adapters.ts
│  └─ supabase-service.ts
├─ components/app-header.tsx   shared header: network chip, RainbowKit ConnectButton, banners
├─ contracts/             isolated Hardhat project (Solidity 0.8.20 + tests + deploy)
└─ supabase/schema.sql    idempotent schema (run once in Supabase)
```

---

## License

Prototype built for the EAG Global Buildathon. Not audited — do not use with real funds.
