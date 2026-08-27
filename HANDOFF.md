# Handoff Notes

## Project

Riddim Protocol is a hackathon MVP focused on programmable music rights for African music. The product centers around:

- registering a riddim
- reviewing likely reuse with an AI detection stub
- licensing a track
- tipping a track and splitting the revenue across wallet owners

## Current implementation status

### Completed

- Landing page polished and aligned to the product story
- App dashboard route exists and is wired to the main product flow
- Dashboard overview was aligned to the provided reference layout and dark product aesthetic
- Wallet auth uses RainbowKit + wagmi (wide range of wallets: MetaMask, Rainbow, Coinbase, WalletConnect); writes are signed via the connected wallet in lib/onchain/wallet.ts
- Registration page exists and previews a parsed riddim payload
- License page exists and reviews a likely reuse match
- Tip page exists and calculates the split based on component percentages
- Domain logic exists for split calculation and registration parsing
- Tests are passing for the core logic
- Production build succeeds

### Visual reference status

- The overview screen has been matched to the approved mock structure: left-side product summary + right-side registry preview + lower action cards
- No fake CTA copy like “Open Flow” is allowed in overview cards
- The wallet action reads as “Connect Wallet” rather than a fake wallet creation flow

### Important functional truths

- This is a frontend demo/prototype, not a fully deployed on-chain product
- The wallet integration is prototype-level and should be treated accordingly unless a real wallet provider and contract deployment are added
- The app intentionally follows the docs, not a random or speculative product idea

## Current files of interest

- [README.md](README.md)
- [docs/riddim-prd.md](docs/riddim-prd.md)
- [docs/riddim.md](docs/riddim.md)
- [docs/riddim-technical-prd.md](docs/riddim-technical-prd.md)
- [riddim-protocol/app/page.tsx](riddim-protocol/app/page.tsx)
- [riddim-protocol/app/app/page.tsx](riddim-protocol/app/app/page.tsx)
- [riddim-protocol/app/register/page.tsx](riddim-protocol/app/register/page.tsx)
- [riddim-protocol/app/license/page.tsx](riddim-protocol/app/license/page.tsx)
- [riddim-protocol/app/tip/page.tsx](riddim-protocol/app/tip/page.tsx)
- [riddim-protocol/lib/riddim.ts](riddim-protocol/lib/riddim.ts)
- [riddim-protocol/lib/riddim.test.ts](riddim-protocol/lib/riddim.test.ts)
- [riddim-protocol/contracts/RiddimRegistry.sol](riddim-protocol/contracts/RiddimRegistry.sol)

## What remains

### Good next steps

- Connect a real wallet provider to the dashboard if the goal is a real prototype flow
- Add a proper deposit/approval experience around on-chain actions
- Wire the UI to a real contract or mock backend if required for the final demo
- Add better polish and a more premium dashboard view for judge presentation
- Establish the off-chain data layer with Supabase and the media layer with Cloudinary
- Add the platform adapter layer for Audiomack, Spotify, and Boomplay-style metadata sync
- Provide env-backed configuration so Supabase and Cloudinary secrets can be injected without hardcoding

### Not to do without direction

- Do not claim live blockchain deployment if it is not real
- Do not invent wallet addresses or contract state
- Do not add speculative features outside the MVP scope
- Do not remove the docs-based product flow

## Verification status

The app has been checked with:

```bash
cd riddim-protocol
npm test
npm run build
```

This is currently passing.

## Handoff guidance for the next AI agent

- Read AGENTS.md first
- Read the docs before editing the product flow
- Keep the app truthful about demo vs real on-chain features
- If changes are made, verify build and tests before handing off again
- Preserve the core flow: register → review license → tip split
