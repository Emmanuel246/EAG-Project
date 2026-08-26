# LedgerMama — Dedicated Scorecard vs EAG/HSK Judging Criteria

## Concept recap
Pidgin-speaking AI bookkeeper for Nigerian micro-traders: natural-language sales logging →
raw ledger stays in a **local encrypted vault** → only salted daily aggregates are attested
onchain on **HSK mainnet** as a portable **credit passport** traders can show any lender.

---

## 1. Fit per EAG track (1–5)

| Track | Fit | How LedgerMama scores |
|---|---|---|
| 6. Real-World Ethereum Apps | **5** | Credit exclusion of ~40M record-less MSMEs; stablecoin-ready rails; unmistakable Nigeria relevance |
| 2. Local AI, Private AI & User-Owned Data | **5** | Raw books never leave the phone (local vault); only hashes/aggregates onchain; selective disclosure = the product itself |
| 1. AI × Ethereum & Agent Economy | **4** | Autonomous agent parses intent → executes onchain attestation; agent wallet with per-user spend policy pays gas |
| 4. Middleware & Open-Source Tooling | **3** | Passport schema + verification SDK reusable by any lender/app |
| 3. Devices / Hardware | 1 | Not claimed (phone-as-device framing only) |
| 5. Creator Economy | 1 | Not claimed |

**Recommended Devfolio selection:** `Nigeria Hackathon` + primary track **Real-World Ethereum Applications** + also tick **HSK Chain** (payments/stablecoin-adjacent). Mention Track 2 privacy architecture prominently in the pitch/docs — it's our differentiator even under the RW banner.

## 2. HSK Chain judging criteria (the ones that pick winners)

| Criterion | Score | Evidence we present |
|---|---|---|
| Feasibility / real-world implementation potential | **5** | Chat UX Nigerians already use; one tiny contract; zero new infrastructure for users; obvious post-hackathon path (lender integrations) |
| Addresses meaningful user/market problem | **5** | Quantified pain: record-less merchants are structurally locked out of credit |
| Technical & product innovation | **4** | Novel primitive: self-sovereign, privately-computed credit history. Product-level novelty > protocol-level; compensate in docs with the privacy-preserving aggregation design |

## 3. Cross-track focus areas coverage

- ✅ Privacy, security & user agency by design (core)
- ✅ Local AI & user-owned data (core)
- ✅ Real-world use case in emerging region (core)
- ✅ Open-source reusable components (passport SDK/schema)
- ◐ Agent payments (agent autonomously pays attestation gas)
- ❌ Hardware trust · ❌ Creator ownership (don't claim)

## 4. Submission-materials readiness plan
- Working demo: web app (Next.js) + Telegram bot path — both drive same backend
- Repo README: features, install/run, integration approach
- Tech doc: this scorecard's architecture section + roadmap

## 5. Weighted verdict (EAG+HSK blended rubric)
Innovation 4 · Impact 5 · TrackFit 4.7 avg-of-claimed · Feasibility 5 · Wow 4
→ **≈ 4.5 / 5 overall. Strong winner-profile. GO.**

## 6. Top risks & mitigations
| Risk | Mitigation |
|---|---|
| Venue wifi kills live LLM calls | Text-path primary; pre-cached responses fallback; retry queue |
| "Credit passport" sounds like regulated lending | Frame strictly as reputation primitive; lenders verify independently |
| Judges ask "why blockchain?" | Answer: portable, issuer-independent, tamper-evident history + agent-payable attestations — no central database owns the trader's reputation |
| Voice transcription latency | Demo with text first, voice as garnish |

## 7. 3-minute demo script
1. **0:00–0:25** Hook: "40M Nigerian shops keep no records — banks can't trust what doesn't exist."
2. **0:25–1:30** Live pidgin chat: log 3 sales → dashboard updates → toggle airplane mode to prove data is local.
3. **1:30–2:30** Mint credit passport → HSK Blockscout tx on screen → scan QR as a "lender".
4. **2:30–3:00** Roadmap: lender API, group-books, agent-to-agent credit referrals. Close on impact number.
