# Riddim Protocol — Product Requirements Document

> **Event:** EAG Global Buildathon — Nigeria
> **Date:** Aug 27, 2026
> **Tracks:** AI-Native Creator Economy & Digital Rights (primary) · Real-World Ethereum Applications (secondary) · AI x Ethereum & Agent Economy (light touch) · Middleware & Open-Source Tooling (SDK framing)

---

## 1. Problem

> **⚠️ As-built note:** This is the original product PRD. The shipped app deviates deliberately — see [`riddim-protocol/README.md`](../riddim-protocol/README.md) for the authoritative description. Notably: **chain 133, not 177**; **the Telegram bot was cut** (the Next.js app is the only interface); **voice clones are a first-class onchain asset**; and **the AI only proposes reuse matches — a human confirms and signs.** Rows mentioning a Telegram interface below describe the earlier plan, not the code.


Nigerian and African music has no functioning mechanical-licensing infrastructure. Collection societies (COSON, MCSN) are widely regarded as dysfunctional, so producers and session contributors have no reliable way to get paid when their work is reused.

This is worsened by two specific, current phenomena:

**Riddim/beat reuse** is standard practice in Afrobeats and Amapiano — a single instrumental is licensed and reused across many different songs by different artists — but the original producer is routinely under-credited and underpaid when the derivative blows up.

**AI voice cloning** of artists is now widespread — AI-generated covers/remixes using cloned artist voices circulate and monetize with zero consent and zero payment to the artist.

Both are the same underlying failure: **no programmable link between "who contributed what" and "who gets paid when it earns money."**

---

## 2. Solution

Riddim Protocol is an onchain registry where:

- A **producer** registers a riddim as a set of components (e.g. drums, melody, vocal hook), each with a preset ownership split and payout wallet.
- An **artist** "licenses" that riddim to build a new track — this is a simple onchain call, not a legal negotiation.
- Any **revenue** the new track earns (modeled as stablecoin tips for the demo) runs through a split function that automatically pays every component owner their percentage — cascading back to the original producer.
- **AI voice-clones** are treated as just another component type — an artist can register consent + a royalty rate for their cloned voice being used in AI covers, using the exact same registry and split logic.
- An **AI agent** autonomously discovers likely riddim reuses or voice clones, and proposes the licensing transaction for the user to confirm.

---

## 3. Target Users

### Primary: Producers / Beatmakers
- Want to be paid automatically when their riddim is reused
- Currently rely on personal relationships or collection societies that don't deliver
- Need: a way to register ownership that is transparent and enforced by code

### Secondary: Artists / Remixers
- Want a fast, transparent way to license a riddim or a voice without legal friction
- Currently either avoid licensing (risk) or negotiate informally (unreliable)
- Need: a simple onchain call that gives them合法 usage rights

### Tertiary: Fans
- Want a simple way to directly support the people behind a track they like
- Currently tip artists with no visibility into how money is distributed
- Need: a way to tip a track and see the money split fairly in real-time

---

## 4. MVP Scope

### In scope (hackathon)
| Feature | What it does | Onchain? |
|---|---|---|
| Register a riddim | Producer registers components with splits | Yes |
| License a riddim | Artist licenses a riddim into a new track | Yes |
| Register voice clone | Artist consents to AI voice usage with royalty | Yes |
| Attach voice to track | Link voice clone consent to a specific track | Yes |
| Tip a track | Fan tips in testnet tokens, auto-splits to owners | Yes |
| AI detect stub | Similarity check proposes licensing | Off-chain |
| Telegram bot | Chat-native interface for all actions | — |
| Dashboard | Live split view with Blockscout links | Reads onchain |

### Explicitly out of scope
- Real audio fingerprinting/MIR (Shazam-style matching) — stubbed only
- Legal enforceability of onchain licenses — flagged as future work
- Mainnet deployment — testnet only for the demo
- Full royalty accounting across real streaming platforms — demo uses direct tips only
- Governance/dispute resolution for contested ownership splits
- Multi-chain or cross-chain support

---

## 5. Track Alignment

| Track | Fit | Score | How Riddim Protocol maps |
|---|---|---|---|
| AI-Native Creator Economy & Digital Rights | **Core** | 5 | Component-level splits, voice-clone consent, producer attribution — all creator economy primitives |
| Real-World Ethereum Applications | **Secondary** | 5 | Solves a real, quantifiable problem in the Nigerian music industry with obvious post-hackathon path |
| AI x Ethereum & Agent Economy | **Light touch** | 5 | Autonomous agent discovers reuse and proposes onchain licensing transaction |
| Middleware & Open-Source Tooling | **SDK framing** | 5 | Registry + split contract reusable by any music platform (Boomplay, Audiomack, Bandcamp) |
| Local AI, Private AI & User-Owned Data | Not claimed | — | Not a core feature |
| Devices / Hardware | Not claimed | — | Not applicable |

---

## 6. User Stories

### As a producer:
> "I register my beat with three components — drums 30%, melody 50%, vocal hook 20%. Each has my collaborators' wallets. When anyone uses this beat, the split is automatic. I don't have to chase anyone for payment."

### As an artist:
> "I find a riddim I want to use. I send one message to the bot: `/license 1 My New Track`. The split is onchain. I have合法 rights. I can prove it."

### As an artist with a cloned voice:
> "I register my voice as a component: `/voice MyVoice 1000 0xMyWallet` — 10% royalty. Now anyone who uses an AI clone of my voice in a track pays me automatically. I control my likeness."

### As a fan:
> "I hear a track I love. I send `/tip 1 500000000000000000` — 0.5 HSK. The money splits live. I can see on Blockscout exactly who got paid. I'm supporting the producer, not just the artist."

### As a judge:
> "The AI agent found an unauthorized remix, flagged it, and proposed the license — all autonomously. That's the agent economy. The split executed onchain. That's real-world Ethereum. The producer got paid. That's impact."

---

## 7. Demo Narrative (3 minutes)

### 0:00–0:25 — Hook
> "Nigerian and African music has no mechanical licensing infrastructure. AI covers of artists' voices go viral with zero consent and zero payment. Producers get no credit when their riddim is reused. Riddim Protocol fixes this — onchain, programmable, autonomous."

### 0:25–1:00 — Register a Riddim
- Open Telegram
- Send: `/register Afro Vibes|drums:40:0xAlice|melody:60:0xBob`
- Bot confirms: "Riddim registered! TX: [link]"
- Open Blockscout: show the transaction, the components, the splits

> "Producer Alice registers her beat with two components. The split is onchain. Transparent. Immutable."

### 1:00–1:30 — AI Detect + License
- Send: `/detect [track data]`
- Agent responds: "Similarity detected! Matched 'Afro Vibes' by Producer Alice. 97.2% similarity. Would you like to license it?"
- Send: `/license 1 Afro Vibes Remix`

> "The AI found an unauthorized reuse and proposed the license. One message to confirm."

### 1:30–2:15 — Tip + Live Split
- Send: `/tip 1 500000000000000000`
- Open Blockscout: show the tip transaction, the split to Alice and Bob's wallets
- Open dashboard: show the split updating in real-time

> "The tip auto-splits — 40% to Alice's drums wallet, 60% to Bob's melody wallet. Live. Onchain. Every naira accounted for."

### 2:15–2:45 — Voice Clone Consent
- Send: `/voice NigerianStar 1000 0xNigerianStar`
- Show: voice registered as a component with 10% royalty

> "Artists can register consent for AI voice usage — same registry, same split logic. The AI economy needs consent primitives. This is how we get there."

### 2:45–3:00 — Roadmap + Close
> "Next: real audio fingerprinting for automatic detection, artist onboarding with identity verification, integration with Boomplay and Audiomack, mainnet deployment. Riddim Protocol — the licensing layer Afrobeats never had."

---

## 8. Success Criteria

| Criterion | How we measure |
|---|---|
| Split payment executes correctly onchain | TX visible on Blockscout with correct wallet balances |
| Judges map project to stated tracks | Creator Economy + RW Apps + Agent Economy all clearly demonstrated |
| AI auto-detect is presented honestly | Explicitly called "proof-of-concept" in pitch — builds credibility |
| Demo completes in 3 minutes | Rehearsed, with fallback for each step |
| At least one "wow moment" | AI agent autonomously proposing the license is the peak |

---

## 9. Risk Flags

| Risk | Mitigation |
|---|---|
| Venue wifi kills live bot/contract calls | Pre-test connectivity; fallback to pre-recorded video |
| Agent auto-detect fails live | Fall back to manual register → license → tip flow |
| Judges ask "why blockchain?" | Answer: portable, issuer-independent, tamper-evident history + agent-payable attestations — no central database owns the producer's reputation |
| "Credit passport" framing sounds regulated | Frame strictly as reputation primitive; lenders verify independently |
| Voice clone consent seems abstract | Demo with a concrete example: "NigerianStar's voice was used in 50 AI covers with zero payment. Now she registers consent and gets 10% of every tip." |
| 4-hour solo build is tight | Contract must be pre-written. Agent detection uses pre-computed fingerprints. Dashboard is a single page. |

---

## 10. Roadmap Beyond the Hackathon

| Phase | What | When |
|---|---|---|
| V1 | Real audio fingerprinting (Chromaprint/AcoustID integration) | Month 1-2 |
| V2 | Artist/producer onboarding with identity verification (KYC lite) | Month 2-3 |
| V3 | Mainnet deployment on HSK | Month 3-4 |
| V4 | Integration with streaming platforms (Boomplay, Audiomack API) | Month 4-6 |
| V5 | Dispute resolution mechanism for contested splits | Month 6+ |
| V6 | Cross-platform licensing SDK for third-party apps | Month 6+ |

---

## 11. Open-Source SDK Framing

Riddim Protocol is designed as a **reusable middleware** that any music platform can integrate:

- **Registry contract** — any platform can register riddims, tracks, and voice clones
- **Split logic** — any platform can execute revenue splits programmatically
- **Detection API** — any platform can check for likely reuse before publishing
- **Telegram bot** — reference implementation for chat-native licensing

This makes Riddim Protocol not just a product, but a **protocol** — an open standard for programmable music licensing on Ethereum.

---

## 12. Pitch One-Liner

> "Riddim Protocol — the licensing layer Afrobeats never had. Register beats, license riddims, get paid automatically. Onchain."
