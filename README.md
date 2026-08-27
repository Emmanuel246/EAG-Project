# EAG Hackathon

This workspace contains the Riddim Protocol demo app and supporting docs for the EAG hackathon.

## What is in this project

- landing page: the product story and pitch surface
- app console: the creator dashboard flow
- registration route: a working demo to register a riddim and preview its split
- license route: a human-confirmed similarity review flow
- tip route: a payment split simulator

## 4-phase build plan

### Phase 1 — Registry foundation

- define the onchain-style metadata model
- register a riddim with component percentages and payout wallets
- validate split parsing and demo payload handling

### Phase 2 — License & detection

- review likely reuse matches
- confirm the proposed license before it is applied

### Phase 3 — Revenue routing

- tip a track and distribute funds according to split percentages
- show each wallet allocation in the UI

### Phase 4 — Demo polish & launch

- ensure the routing and layouts work cleanly
- walk through the full demo story for judges
- verify the build passes before submission

## Run locally

```bash
cd riddim-protocol
npm install
npm test
npm run build
npm run dev
```

## Routes

- / landing page
- /app console dashboard
- /register registration flow
- /license similarity/license review
- /tip tip-and-split flow
