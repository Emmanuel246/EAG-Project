# Idea Pipeline ROUND 2 — beating 27.5 (mass-attraction focus)

Same rubric & constraints as Round 1 (`docs/idea-pipeline.md`). Baseline included for honest ranking.

## Generator Output (challengers)

```yaml
problem_statement: >
  How might we give everyday Nigerians an AI money agent that beats their
  single biggest financial fear — the naira melting — while solving a real,
  felt problem so obviously useful that adoption spreads by word of mouth?

ideas:
  - id: "idea-4"
    title: "NairaShield"
    tagline: "Your money — but it doesn't melt. An AI agent that auto-converts savings to stablecoins and pays your bills straight from dollars."
    core_mechanism: >
      Chat-native agent (Telegram/web): user sets rules in plain language/pidgin
      ('save $2 worth every morning', 'whenever alert pay enter, keep 10%') ->
      agent executes scheduled/triggered swaps into a personal USDT vault on
      HSK mainnet -> enforces ONCHAIN spending policy (whitelisted bill
      addresses, daily caps) -> pays rent/school-fees bills directly from the
      vault without converting back -> dashboard shows purchasing-power saved
      vs leaving it in naira.
    target_user: "Every salaried Nigerian + small traders holding cash (universal inflation anxiety)"
    gaps_addressed:
      - "Naira purchasing power collapse makes saving locally feel pointless"
      - "Crypto saving apps are too complex for non-crypto users"
    risk_level: "low"
    wow_factor: "Side-by-side shock visual: '₦100k in the bank in January buys ₦63k of goods today' vs the vault that held its value — then LIVE bill-payment from the dollar vault on HSK mainnet."

  - id: "idea-5"
    title: "SchoolAm"
    tagline: "School fees that can't disappear: parents pay onchain, bursars can't pocket it, agents automate every term."
    core_mechanism: >
      Parent funds a fee wallet -> pays school's onchain invoice in stablecoin ->
      school dashboard confirms instantly, tamper-proof NFT receipt issued ->
      agent handles termly reminders, installments, sibling splitting ->
      end-of-term audit trail kills the classic 'cash fee vanished' dispute.
    target_user: "Parents + private schools (fee season = national stress season)"
    gaps_addressed:
      - "Fee embezzlement/payment disputes between parents and schools"
    risk_level: "medium"
    wow_factor: "Live fee payment + instant verifiable receipt; less theatrical than others."

  - id: "idea-6"
    title: "SabiOS"
    tagline: "The financial operating system for the informal economy: books, shield, credit — one pidgin-speaking agent."
    core_mechanism: >
      LedgerMama + NairaShield fused: agent books sales, auto-sweeps surplus
      into stablecoin vault, mints credit passport from verified history.
    target_user: "Micro-traders (same as LedgerMama)"
    gaps_addressed: ["Records", "inflation", "credit exclusion in one product"]
    risk_level: "high"
    wow_factor: "Full lifecycle story in one demo; but three products in 24h."

diversity_axes:
  - axis: "emotional hook"
    range: "survival (inflation) -> family duty (fees) -> ambition (credit)"
  - axis: "product breadth"
    range: "laser-single-purpose -> suite"

recommended_skills: ["hackathon-idea-scoring"]
```

## Scoring Output (Round 2 — includes Round-1 winner as baseline)

```yaml
scored_ideas:
  - id: "idea-4"
    title: "NairaShield"
    scores:
      - {axis: "Innovation & Uniqueness", score: 4, notes: "DCA bots exist in crypto-native circles; chat-first naira-denominated UX + onchain spending policy + bill-pay-from-vault for non-crypto users is genuinely fresh packaging"}
      - {axis: "Real-World Impact & Market Need", score: 5, notes: "Inflation is Nigeria's #1 daily pain — universally felt, zero explanation needed to any judge"}
      - {axis: "Track Coverage & HSK Fit", score: 5, notes: "HSK stablecoins/payments CORE; T1 agent spending policies; T4 auto-save rules SDK; T6 PayFi emerging markets; T2 local-private settings"}
      - {axis: "Feasibility (24h, team of 2)", score: 5, notes: "Single-user flows, one vault+policy contract, mock fiat ramp (settlement itself REAL on HSK), perfect stack fit"}
      - {axis: "Demo Wow Factor", score: 4, notes: "Purchasing-power visual is a gut-punch; live onchain bill-pay seals it"}
    penalties: []
    total_score: 30.0

  - id: "idea-5"
    title: "SchoolAm"
    scores:
      - {axis: "Innovation & Uniqueness", score: 3, notes: "Payment rails exist; verifiable receipts + installment agent incremental"}
      - {axis: "Real-World Impact & Market Need", score: 5, notes: "Every family, every term; fraud stories resonate"}
      - {axis: "Track Coverage & HSK Fit", score: 4, notes: "Payments/RW strong; thin on privacy/middleware"}
      - {axis: "Feasibility (24h, team of 2)", score: 3, notes: "Two-sided: parent app + school dashboard"}
      - {axis: "Demo Wow Factor", score: 3, notes: "Standard payment confirmation visuals"}
    penalties: []
    total_score: 23.75

  - id: "idea-6"
    title: "SabiOS (hybrid)"
    scores:
      - {axis: "Innovation & Uniqueness", score: 4, notes: "Suite framing novel but composed of scored parts"}
      - {axis: "Real-World Impact & Market Need", score: 5, notes: "Compound value prop"}
      - {axis: "Track Coverage & HSK Fit", score: 5, notes: "Broadest coverage of all candidates"}
      - {axis: "Feasibility (24h, team of 2)", score: 3, notes: "Three modules sharing plumbing — scope-cutting pressure cooker"}
      - {axis: "Demo Wow Factor", score: 5, notes: "Full lifecycle arc is the best story IF it works"}
    penalties:
      - {type: "feasibility", value: 0.5}
    total_score: 28.0

  - id: "idea-1"
    title: "LedgerMama (Round-1 winner, baseline)"
    scores: [{axis: "aggregate", score: 0, notes: "see round 1"}]
    penalties: []
    total_score: 27.5

ranking:
  - {rank: 1, id: "idea-4", total_score: 30.0}
  - {rank: 2, id: "idea-6", total_score: 28.0}
  - {rank: 3, id: "idea-1", total_score: 27.5}
  - {rank: 4, id: "idea-5", total_score: 23.75}

top_recommendation:
  id: "idea-4"
  title: "NairaShield"
  rationale: >
    Highest adjusted score (30.0/32.5 ceiling): zero-penalty feasibility,
    the most universally-felt problem in the country, HSK-core stablecoin
    settlement in every demo action, and a one-sentence pitch anyone repeats:
    'your money doesn't have to melt.'

risk_flags:
  - id: "idea-4"
    risks:
      - "Fiat ramp is mocked — label it honestly; ALL onchain settlement stays real on HSK mainnet"
      - "'Why not just use Binance?' — answer: no seed-phrase juggling, onchain-enforced spending policy, chat UX, bill-pay rails"
      - "Rate-source dependency for naira pricing — hardcode fallback rates offline"

recommended_skills: ["hackathon-scope-cutter (not installed)", "improve-codebase-architecture (post-build)"]
```
