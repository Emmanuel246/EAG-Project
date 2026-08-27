# AGENTS.md

This repository is the Riddim Protocol hackathon prototype. Use this file as the source of truth for the product intent, technical boundaries, and working rules.

## Project purpose

Riddim Protocol is a demo app for programmable music rights in African music. The product is designed around a simple flow:

1. Register a riddim with component-level splits and payout wallets
2. Review AI-detected reuse and confirm a license
3. Tip a track and distribute the revenue automatically by split percentages

This is a hackathon MVP and prototype, not a production on-chain product. It should feel polished, but it must remain honest about what is demo logic vs real blockchain integration.

## Product truth

Use the docs in this repository as the primary specification source:

- [README.md](README.md)
- [docs/riddim-prd.md](docs/riddim-prd.md)
- [docs/riddim.md](docs/riddim.md)
- [docs/riddim-technical-prd.md](docs/riddim-technical-prd.md)

If a decision conflicts with those docs, the docs win.

## Core product flow

The app should support this journey:

- Landing page introduces the protocol
- App console acts as the creator dashboard
- /register lets a user register a riddim and preview the split
- /license lets a user review a likely reuse and approve the license
- /tip shows a fan tip and how the payment is split

## UI rules

- Keep the landing page polished and product-first.
- Keep the app dashboard simple, clean, and focused on the actual flow.
- Do not add fake CTA wording like “Open Flow” when the card is only a summary.
- The overview should remain readable and not feel like a debugging screen.
- Use clear product language. Do not invent features that are not in the docs.
- When the user provides a visual reference, match that structure and spacing before iterating on improvements.
- Do not show duplicate wallet states or multiple independent wallet lists. Keep one connected-wallet state and one wallet action.

## Wallet rules

- Wallet interactions should be described as prototype or demo wallet logic unless a real provider is actually wired.
- Wallet auth is wired with RainbowKit + wagmi (config in lib/onchain/wagmi.ts, provider tree in app/providers.tsx). The header uses RainbowKit's `<ConnectButton />`; writes go through wagmi's wallet client in lib/onchain/wallet.ts, and reads use a viem public client.
- Do not imply a successful real wallet connection unless the code actually requests and receives accounts.
- The app must not show duplicate wallet states or fabricated wallet counts.
- Use a single connected-wallet state instead of multiple independent wallet lists.

## Contract and blockchain rules

- The project is not a real production contract deployment by default.
- Any Solidity contract file is a prototype/reference contract, not proof of active deployment.
- If a contract is included, frame it as a demo contract or a future-onchain version.
- Do not claim that a contract is deployed unless it is actually deployed and recorded.

## Build and verification rules

Before claiming work is done, verify with the project scripts:

```bash
cd riddim-protocol
npm test
npm run build
```

If a feature cannot be tested through the app or script, do not claim it works.

## Hallucination prevention

These are mandatory guardrails:

- Do not claim features exist if they are not in the UI or in the repo.
- Do not invent wallet addresses, deployed contracts, or chain results.
- Do not add “Open Flow” or fake action labels unless they reflect real navigation.
- Do not claim a route works without verifying it builds and is accessible.
- If the project is a demo, say so clearly.

## Engineering boundaries

- Prefer the docs over memory.
- Keep the implementation aligned with the hackathon MVP scope.
- Maintain a clean separation between product UI, demo logic, and future on-chain integration.
- Prefer simple demo-ready logic over speculative features.

## Suggested workflow for future agents

1. Read README and the docs before changing the app.
2. Check the existing route structure and current UI before writing code.
3. Fix the smallest root cause instead of layering guesses.
4. Validate the build and tests before declaring completion.
5. Keep the app honest: prototype UX, demo logic, and on-chain future work should be clearly separated.

## Definition of done

A task is only considered complete when:

- the relevant app flow is working in the repo
- the UI matches the docs and product intent
- the code does not contain fake or misleading claims
- tests/build pass
- the work is documented clearly for the next agent
