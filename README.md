# EAG Hackathon — Riddim Protocol

Workspace for **Riddim Protocol**, a programmable music-rights app built for the EAG Global Buildathon.

**👉 The authoritative documentation is [`riddim-protocol/README.md`](riddim-protocol/README.md)** — architecture, how it works, what's real vs stubbed, deviations from spec, and full setup. Start there.

## One-liner

Register a beat (a *riddim*) as onchain ownership components, license reuse into tracks (an AI **proposes** matches, a human signs), license AI **voice clones** as first-class assets, and split every fan tip automatically across all rightful owners — enforced by a smart contract on **HSK Testnet (chain 133)**.

## What's here

| Path | What it is |
| --- | --- |
| [`riddim-protocol/`](riddim-protocol/) | The Next.js app (App Router) + `contracts/` (Hardhat, Solidity 0.8.20). The only interface. |
| [`riddim-protocol/README.md`](riddim-protocol/README.md) | **As-built** docs — read this. |
| [`riddim-protocol/SUPABASE_SETUP.md`](riddim-protocol/SUPABASE_SETUP.md) | Offchain mirror setup + schema migration. |
| [`docs/`](docs/) | Original design docs (product PRD, technical PRD, build guide). Each carries an as-built note; they record the *plan*, not the shipped code. |
| `HANDOFF.md` | Running handoff notes. |

## Run locally

```bash
cd riddim-protocol
npm install
cp .env.example .env      # Supabase + Cloudinary; contract address optional (empty = offchain mode)
npm test                  # 16 tests
npm run build             # 22 routes
npm run dev               # http://localhost:3000
```

Contract (optional, enables onchain mode):

```bash
cd riddim-protocol/contracts
npm install && npm test   # 15 tests
npm run deploy:hsk        # then set NEXT_PUBLIC_CONTRACT_ADDRESS in the app .env
```

## The four phases, as built

1. **Contract foundation** — `RiddimRegistry.sol` on HSK Testnet: riddims, licensing, voice clones, atomic tip splits, all safety checks (splits sum to 100%, 50% royalty cap, owner-only attach, no admin keys). 15 tests.
2. **Chain layer (viem + RainbowKit)** — server-side reads + wallet-signed writes (RainbowKit/wagmi, wide range of wallets); deterministic reuse-detection module (no Telegram).
3. **Next.js dashboard** — the only interface, with working forms for register / detect+license / voice / tip and a live console reading onchain state.
4. **Integration, verification & docs** — platform adapters, health/status endpoints, green build + type-check + tests, and this documentation.

## Routes

`/` landing · `/app` live console · `/register` · `/license` (detect → human-signed license) · `/voice` · `/tip` · `/integrations`
