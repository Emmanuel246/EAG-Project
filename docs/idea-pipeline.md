# Idea Pipeline — EAG Global Buildathon Nigeria (Aug 27)

Run per `hackathon-idea-generator` → `hackathon-idea-scoring` SKILL.md contracts.

## Generator Input

```yaml
problem_statement: >
  How might we give everyday Nigerians — traders, families, and savings groups —
  AI agents that move real money safely on Ethereum rails, without requiring
  crypto literacy, trust in middlemen, or exposing their private data?
solution_gaps:
  - "Micro-business owners keep no records, so they are locked out of credit entirely"
  - "Diaspora remittances arrive with zero assurance they fund their intended purpose"
  - "Community savings (ajo/esusu/adashe) depend on trusting one human cash-box keeper"
  - "No agent-payment use case demos real African mass-market utility end-to-end"
track_constraints:
  - "Must select Nigeria Hackathon + best-fit EAG track; blend as many tracks as possible"
  - "Must deploy working contracts to HSK Chain mainnet (chain 177) and show txs on explorer"
  - "Core UX driven by AI agents (LLM) making autonomous onchain executions/payments"
  - "Usable by non-crypto Nigerians through interfaces they already have (chat)"
  - "Demoable end-to-end in <= 3 minutes on stage"
  - "Private/local-first data handling wherever user PII is involved"
team_size: 2
hackathon_duration_hours: 24
tech_stack_preferences:
  ["Next.js", "Tailwind CSS", "shadcn/ui", "TypeScript", "Node.js", "Solidity", "viem", "OpenAI/Gemini/OpenRouter", "Telegram Bot API"]
idea_count: 3
```

## Generator Output

```yaml
ideas:
  - id: "idea-1"
    title: "LedgerMama"
    tagline: "A pidgin-speaking AI bookkeeper that turns market traders' daily sales into an onchain credit passport."
    core_mechanism: >
      Trader chats naturally (text/voice) -> LLM agent extracts structured ledger
      entries -> raw records stay in a local encrypted vault (never leaves device;
      only salted hashes/daily aggregates touch chain) -> periodic aggregate is
      attested on HSK as a portable 'credit passport' a trader can show any lender.
    target_user: "Nigeria's ~40M MSMEs / market traders with zero bookkeeping"
    gaps_addressed:
      - "Micro-business owners keep no records, so locked out of credit"
      - "No agent-payment use case demos real African mass-market utility"
    risk_level: "low"
    wow_factor: "Live pidgin haggling with the bot -> dashboard updates -> credit passport minted, viewable on HSK Blockscout within seconds."

  - id: "idea-2"
    title: "SendAm Safe"
    tagline: "Purpose-locked remittances: diaspora money that can only become school fees, rent, or medicine — with AI verifying every naira."
    core_mechanism: >
      Sender opens a goal vault on HSK escrow funded in stablecoin -> recipient
      submits invoice/receipt photo -> AI vision+LLM checks claim against goal ->
      tranche auto-releases onchain; full audit trail on explorer; mismatches flagged.
    target_user: "Diaspora senders + their families in Nigeria ($20B+/yr corridor)"
    gaps_addressed:
      - "Remittances arrive with zero assurance they fund their intended purpose"
    risk_level: "medium"
    wow_factor: "Snap a school-fee bill -> AI verdict on screen -> USDT releases -> explorer tx in the same breath."

  - id: "idea-3"
    title: "SusuDAO"
    tagline: "Your community ajo, run by an unbribeable AI treasurer inside Telegram."
    core_mechanism: >
      Add agent to a Telegram group -> members contribute USDT to a shared HSK
      vault contract -> agent enforces contribution schedules and rotation order,
      announces payout winners, nags defaulters, posts onchain receipts; group
      builds a collective repayment reputation.
    target_user: "Community savings groups (ajo/esusu/adashe participants, tens of millions)"
    gaps_addressed:
      - "Community savings depend on trusting one human cash-box keeper"
    risk_level: "high"
    wow_factor: "Three phones in one live group chat: contribute -> agent declares the winner -> onchain payout lands mid-pitch."

diversity_axes:
  - axis: "user segment"
    range: "individual trader -> split household (two countries) -> coordinated group"
  - axis: "AI role"
    range: "personal scribe -> adversarial verifier -> authoritarian treasurer"
  - axis: "risk level"
    range: "low (single-user CRUD+attest) -> high (multi-party state machine)"

recommended_skills:
  - "hackathon-idea-scoring"
```

## Scoring Input

```yaml
evaluation_axes:
  - {axis: "Innovation & Uniqueness", weight: 1.5}
  - {axis: "Real-World Impact & Market Need", weight: 1.5}
  - {axis: "Track Coverage & HSK Fit", weight: 1.25}
  - {axis: "Feasibility (24h, team of 2)", weight: 1.25}
  - {axis: "Demo Wow Factor", weight: 1.0}
team_skills: ["Next.js/React", "Tailwind/shadcn", "Node.js", "Solidity (basic)", "viem", "LLM APIs (OpenAI/Gemini/OpenRouter)", "Telegram Bot API"]
hackathon_duration_hours: 24
team_size: 2
```

## Scoring Output

```yaml
scored_ideas:
  - id: "idea-1"
    title: "LedgerMama"
    scores:
      - {axis: "Innovation & Uniqueness", score: 4, notes: "Bookkeeping bots exist, but local-private-ledger + onchain credit passport is a fresh primitive; low collision risk"}
      - {axis: "Real-World Impact & Market Need", score: 5, notes: "Tens of millions of record-less MSMEs; credit exclusion is acute and quantifiable"}
      - {axis: "Track Coverage & HSK Fit", score: 4, notes: "Strong on Local-AI/privacy (2), Real-world (6), Agents (1), HSK stablecoin/RWA; weak on devices/creator"}
      - {axis: "Feasibility (24h, team of 2)", score: 4, notes: "Single-user flow, one small attestation contract, chat UX the team already knows"}
      - {axis: "Demo Wow Factor", score: 4, notes: "Pidgin convo -> live mint is memorable though less theatrical than group demos"}
    penalties: []
    total_score: 27.5

  - id: "idea-2"
    title: "SendAm Safe"
    scores:
      - {axis: "Innovation & Uniqueness", score: 4, notes: "Conditional cash exists in fintech; AI-verified escrow release onchain is novel packaging"}
      - {axis: "Real-World Impact & Market Need", score: 5, notes: "$20B+/yr corridor, deeply felt trust pain, emotionally resonant pitch"}
      - {axis: "Track Coverage & HSK Fit", score: 4, notes: "Payments/PayFi (HSK), AI onchain execution (1), Real-world (6)"}
      - {axis: "Feasibility (24h, team of 2)", score: 3, notes: "Two-sided UX + vision verification edge cases; mitigated by pre-tested demo receipts"}
      - {axis: "Demo Wow Factor", score: 4, notes: "Receipt->verdict->release chain is dramatic"}
    penalties: []
    total_score: 26.25

  - id: "idea-3"
    title: "SusuDAO"
    scores:
      - {axis: "Innovation & Uniqueness", score: 3, notes: "Onchain esusu has prior art; the AI-treasurer-in-Telegram layer is the new part"}
      - {axis: "Real-World Impact & Market Need", score: 5, notes: "Massive participation culture-wide; theft/mismanagement stories resonate"}
      - {axis: "Track Coverage & HSK Fit", score: 5, notes: "Agents (1), Middleware SDK (4), Community coordination (6), HSK payments/stablecoins"}
      - {axis: "Feasibility (24h, team of 2)", score: 2, notes: "Multi-wallet Telegram identity binding + rotation state machine + defaulter edges in 24h is heavy"}
      - {axis: "Demo Wow Factor", score: 5, notes: "Live multi-phone group payout is the most theatrical possible"}
    penalties:
      - {type: "time", value: 1.0}
    total_score: 24.25

ranking:
  - {rank: 1, id: "idea-1", total_score: 27.5}
  - {rank: 2, id: "idea-2", total_score: 26.25}
  - {rank: 3, id: "idea-3", total_score: 24.25}

top_recommendation:
  id: "idea-1"
  title: "LedgerMama"
  rationale: >
    Highest adjusted score with zero penalties: best feasibility-to-wow ratio,
    a privacy story judges reward (local-first data, selective disclosure),
    a crisp 3-minute single-threaded demo arc, and a genuinely under-explored
    primitive (self-sovereign credit history) that grows beyond the hackathon.

risk_flags:
  - id: "idea-1"
    risks:
      - "Passport value depends on framing: position as reputation primitive, not regulated lending"
      - "Voice-note transcription latency on venue wifi — keep text path primary, pre-record audio fallback"
      - "Local vault must demonstrably stay local: show offline toggle during demo"
  - id: "idea-2"
    risks:
      - "Vision model false-positive mid-demo — rehearse with fixed receipt assets"
      - "Two-sided onboarding burns pitch minutes"
  - id: "idea-3"
    risks:
      - "Telegram multi-user <-> wallet mapping complexity likely exceeds 24h budget"
      - "Rotation contract defaulter-edge under-tested"

recommended_skills:
  - "hackathon-scope-cutter (not installed)"
  - "improve-codebase-architecture (post-build)"
```
