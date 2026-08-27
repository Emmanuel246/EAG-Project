# Riddim Protocol — Pitch

> Programmable music rights for African music. Register a beat, license reuse, license a voice — and split every tip automatically, onchain.

---

## 🎤 The 15-second hook

> **In Afrobeats, one *riddim* (beat) becomes ten songs. Everyone reuses everyone — but nobody gets paid cleanly.**
> Riddim Protocol makes the beat itself programmable: it knows who owns it, who's allowed to use it, and it pays every owner automatically the moment money comes in.

---

## The problem

African music runs on **shared beats**. A single riddim gets flipped into dozens of tracks across Audiomack, Spotify, Boomplay, TikTok. That collaboration is the culture — but the money isn't:

- **Ownership is a WhatsApp screenshot.** "Drums are mine, melody is his" lives in DMs, not anywhere enforceable.
- **Reuse is invisible.** When someone samples your beat, you find out from a fan, not a ledger.
- **Payouts are manual and late.** Someone eventually Venmos someone. Splits get "sorted later." Later rarely comes.
- **Now AI voice clones make it worse.** Anyone can clone a star's voice. Who consented? Who's owed? Today: nobody knows.

**The value is real and growing. The rights layer underneath it doesn't exist.**

---

## The solution

Riddim Protocol turns "who owns this / who can use it / who gets paid" into **code enforced by a smart contract**.

1. **Register a riddim.** A producer splits the beat into components — `drums 40%`, `melody 60%` — each with a payout wallet. The contract refuses anything that doesn't sum to exactly 100%.
2. **License reuse.** An artist wants to use the beat. An AI similarity check **flags the match and proposes a license** — but it can't sign anything. The human reviews and signs in their own wallet.
3. **License a voice.** An AI voice clone is a first-class, consented asset with its own royalty rate (capped at 50%). Only the owner can attach their voice to a track.
4. **Tip, and it splits itself.** A fan tips a track 10 HSK. In **one transaction**, the contract takes the voice-clone royalty off the top, then splits the rest across every beat-component owner. No middleman, no "later."

**One tip in → everyone paid, instantly, provably.**

---

## Show me the money (the "aha")

A fan tips **10 HSK** on a track that licensed *Lagos Nights* (drums 40% / melody 60%) with a 10% voice clone attached:

```
10 HSK tip
├─ 1.0 HSK → 🎤 voice clone owner        (10% off the top)
└─ 9.0 HSK → split across the riddim
   ├─ 3.6 HSK → drums wallet             (40%)
   └─ 5.4 HSK → melody wallet            (60%)
```

Every line is a real onchain transfer in a single transaction. Change the tip, the preview recomputes live — because the app mirrors the contract's exact math.

---

## Why it's different

- **The contract is the source of truth — not a database.** No admin keys, no pause switch, no "trust us." Rules are enforced onchain.
- **AI proposes, humans decide.** The AI similarity check *never* moves money or signs a transaction. The server literally holds no key. It flags reuse; a person confirms. This is the responsible pattern for AI in a rights system — and it's structural, not a promise.
- **Voice clones are treated as consent, not theft.** We turn the scariest part of AI music into a licensable, revenue-sharing asset.
- **Platform-agnostic.** Adapters normalize Audiomack / Spotify / Boomplay metadata into one rights registry, so the same beat is tracked wherever it travels.

---

## Live demo (90 seconds)

1. **Register** *Lagos Nights* — drums 40% / melody 60%. Watch the contract reject 90%, accept 100%. → onchain tx.
2. **Detect** "Lagos Nights (Refix)" on the Detect page → **95%+ match, HIGH confidence**, an AI proposal card appears labeled **"🤖 AI PROPOSAL — NOT SUBMITTED."**
3. Click **"Use this proposal →"**, review, **sign in the wallet.** *This* is the human confirming — the AI never could. → onchain tx.
4. **Tip** the new track 10 HSK → the split preview shows every wallet's cut → sign → done. → onchain tx.
5. Open the **console**: live registry state read straight from the contract, with explorer links.

Fallback: with no contract deployed, the whole flow still runs in "offchain mode" against the database — nothing crashes, and the UI says so honestly.

---

## What's actually built (not vaporware)

- ✅ **Smart contract** — Solidity 0.8.20, all rights logic + safety rules, **15 passing tests**, deployable to HSK Testnet (chain 133).
- ✅ **Real chain integration** — viem reads live contract state; writes are signed by the user's own wallet via **RainbowKit** (MetaMask, Rainbow, Coinbase, WalletConnect mobile — a wide range of wallets).
- ✅ **Real offchain layer** — Supabase mirror/index with graceful demo fallback and a health endpoint that reports what's live.
- ✅ **Working dashboard** — every action has a real form; the console polls live onchain state.
- ✅ **16 app tests + clean type-check + green production build (22 routes).**
- ⚠️ **Honest boundary:** audio fingerprinting is stubbed (deterministic vectors). The similarity + confidence + proposal *pipeline* is real; swapping in a real audio-embedding model is the only change for production.

---

## The vision

Start with the tip split — the smallest loop that proves the model. Then the same rights registry becomes the settlement layer for **streaming royalties, sync licensing, and AI-generated music** across African music and beyond.

**Riddim Protocol is the missing rights layer for the world's most collaborative music culture.**

*Register the beat. License the voice. Split the money. Onchain.*
