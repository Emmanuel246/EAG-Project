# Riddim Protocol — Technical PRD

> **Version:** 1.0 · Aug 27 2026
> **Event:** EAG Global Buildathon — Nigeria
> **Chain:** HSK Testnet (chain ID 177)

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────┐    ┌──────────────────────────────┐  │
│  │   Telegram Bot     │    │      Next.js Dashboard       │  │
│  │   (Telegraf.js)    │    │   (App Router + Tailwind)    │  │
│  └────────┬───────────┘    └──────────────┬───────────────┘  │
│           │                               │                  │
├───────────┼───────────────────────────────┼──────────────────┤
│           │         AGENT LAYER           │                  │
│  ┌────────┴───────────────────────────────┴───────────────┐  │
│  │              Node.js Agent Server                      │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │  Bot Handler  │  │   Agent     │  │  Contract    │  │  │
│  │  │  (commands)   │  │  Detection  │  │  Client      │  │  │
│  │  │              │  │  (similarity)│  │  (viem)      │  │  │
│  │  └──────────────┘  └─────────────┘  └──────────────┘  │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                                │
├─────────────────────────────┼────────────────────────────────┤
│           CONTRACT LAYER    │                                │
│  ┌──────────────────────────┴─────────────────────────────┐  │
│  │           RiddimRegistry.sol (HSK Testnet)             │  │
│  │  - Riddim storage + component splits                   │  │
│  │  - Track licensing                                     │  │
│  │  - Voice clone consent                                 │  │
│  │  - Tip auto-split                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           HSK Blockscout Explorer                      │  │
│  │  - Transaction verification                            │  │
│  │  - Contract state inspection                           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Smart Contract

### 2.1 Contract Address

Deployed to HSK Testnet. Address recorded after deployment.

### 2.2 ABI

```json
[
  {
    "inputs": [
      {"name": "title", "type": "string"},
      {"name": "componentNames", "type": "string[]"},
      {"name": "splitBps", "type": "uint256[]"},
      {"name": "payoutWallets", "type": "address[]"}
    ],
    "name": "registerRiddim",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "trackTitle", "type": "string"},
      {"name": "riddimId", "type": "uint256"}
    ],
    "name": "licenseRiddim",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "voiceName", "type": "string"},
      {"name": "royaltyRateBps", "type": "uint256"},
      {"name": "payoutWallet", "type": "address"}
    ],
    "name": "registerVoiceClone",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "trackId", "type": "uint256"},
      {"name": "voiceCloneId", "type": "uint256"}
    ],
    "name": "attachVoiceClone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "trackId", "type": "uint256"}],
    "name": "tipTrack",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "uint256"}],
    "name": "getRiddim",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "producer", "type": "address"},
          {"name": "title", "type": "string"},
          {
            "components": [
              {"name": "name", "type": "string"},
              {"name": "splitBps", "type": "uint256"},
              {"name": "payoutWallet", "type": "address"}
            ],
            "name": "components",
            "type": "tuple[]"
          },
          {"name": "totalSplitBps", "type": "uint256"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "exists", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "uint256"}],
    "name": "getTrack",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "artist", "type": "address"},
          {"name": "title", "type": "string"},
          {"name": "riddimIds", "type": "uint256[]"},
          {"name": "totalTipped", "type": "uint256"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "exists", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "uint256"}],
    "name": "getVoiceClone",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "artist", "type": "address"},
          {"name": "voiceName", "type": "string"},
          {"name": "royaltyRateBps", "type": "uint256"},
          {"name": "payoutWallet", "type": "address"},
          {"name": "active", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "uint256"},
      {"indexed": true, "name": "producer", "type": "address"},
      {"indexed": false, "name": "title", "type": "string"}
    ],
    "name": "RiddimRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "trackId", "type": "uint256"},
      {"indexed": true, "name": "riddimId", "type": "uint256"},
      {"indexed": true, "name": "artist", "type": "address"}
    ],
    "name": "RiddimLicensed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "uint256"},
      {"indexed": true, "name": "artist", "type": "address"},
      {"indexed": false, "name": "voiceName", "type": "string"}
    ],
    "name": "VoiceCloneRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "trackId", "type": "uint256"},
      {"indexed": true, "name": "tipper", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TipSplit",
    "type": "event"
  }
]
```

### 2.3 Deployment

```bash
# Install dependencies
npm init -y
npm install hardhat @nomicfoundation/hardhat-toolbox viem

# Initialize Hardhat
npx hardhat init

# Compile
npx hardhat compile

# Deploy to HSK Testnet
npx hardhat run scripts/deploy.js --network hskTestnet
```

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hskTestnet: {
      url: "https://testnet.hsk.xyz/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 177
    }
  }
};
```

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const RiddimRegistry = await hre.ethers.getContractFactory("RiddimRegistry");
  const registry = await RiddimRegistry.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  console.log(`RiddimRegistry deployed to: ${address}`);
  console.log(`Explorer: https://testnet-explorer.hsk.xyz/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 3. Agent Detection Algorithm

### 3.1 Overview

The agent detection system identifies likely unauthorized reuse of registered riddims or voice clones by comparing audio fingerprints using cosine similarity.

### 3.2 Fingerprint Generation (Mock)

For the hackathon, fingerprints are pre-computed vectors (8-dimensional float arrays). In production, these would be generated from actual audio using a perceptual hashing algorithm (e.g., Chromaprint/AcoustID).

```javascript
// fingerprint.js
function generateFingerprint(audioInput) {
  // Mock: in production, use Chromaprint or similar
  // For demo, accept pre-computed vectors or mock from input string
  if (Array.isArray(audioInput)) return audioInput;

  // Deterministic mock from string hash
  let hash = 0;
  const str = String(audioInput);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const rng = (seed) => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: 8 }, (_, i) => rng(hash + i));
}
```

### 3.3 Similarity Calculation

```javascript
// similarity.js
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
```

### 3.4 Detection Thresholds

| Similarity Score | Action |
|---|---|
| >= 0.95 | High confidence — flag as likely reuse, propose licensing |
| 0.85 – 0.94 | Medium confidence — flag as possible reuse, suggest review |
| < 0.85 | No match — clear |

### 3.5 Pre-seeded Database

Before the hackathon, populate `fingerprints.json` with known similarity pairs:

| Original Track | Unauthorized Version | Expected Similarity |
|---|---|---|
| "Lagos Nights" (ProducerK) | "Lagos Nights Remix" (ArtistX) | ~0.99 |
| "Afro Vibrations" (BeatSmith) | "Afro Vibrations AI Cover" (AIClone) | ~0.98 |
| "Pidgin Love" (ProducerK) | "Pidgin Love Extended" (DJBoogie) | ~0.96 |
| "Highlife Morning" (GuitaristN) | "Highlife Morning Revisit" (NewArtist) | ~0.97 |

---

## 4. Telegram Bot API Integration

### 4.1 Setup

1. Message @BotFather on Telegram
2. `/newbot` → name: "Riddim Protocol Bot"
3. Save the bot token
4. Set bot description: "Register beats, license riddims, earn automatically on HSK."

### 4.2 Webhook Configuration

For production, use webhooks. For the hackathon, long-polling is fine:

```javascript
// bot.js
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Long-polling (simpler for hackathon)
bot.launch();
console.log("Bot started with long-polling");
```

### 4.3 Environment Variables

```env
BOT_TOKEN=your-telegram-bot-token
PRIVATE_KEY=your-hsk-wallet-private-key
CONTRACT_ADDRESS=deployed-contract-address
HSK_RPC_URL=https://testnet.hsk.xyz/rpc
```

---

## 5. Data Flow

### 5.1 Register Riddim Flow

```
User sends: /register Afro Vibes|drums:40:0xAlice|melody:60:0xBob
         │
         ▼
   Parse command
   Validate splits sum to 10000
         │
         ▼
   Call registerRiddim() on contract
         │
         ▼
   Transaction sent to HSK testnet
         │
         ▼
   Return TX hash + Blockscout link
         │
         ▼
   Bot replies: "✅ Riddim registered! TX: [link]"
```

### 5.2 Tip + Split Flow

```
User sends: /tip 1 500000000000000000
         │
         ▼
   Fetch track #1 from contract
   Get licensed riddim IDs
         │
         ▼
   Call tipTrack(1) with msg.value
         │
         ▼
   Contract splits tip across components
   ETH transferred to each wallet
         │
         ▼
   Return TX hash
         │
         ▼
   Bot replies: "✅ Tip sent! Split executed. TX: [link]"
```

### 5.3 AI Detect Flow

```
User sends: /detect [track data]
         │
         ▼
   Generate fingerprint from input
   Load pre-seeded database
         │
         ▼
   Calculate cosine similarity against all tracks
         │
         ▼
   If similarity >= 0.95:
     Return match + pre-fill license proposal
   Else:
     Return "No match found"
         │
         ▼
   Bot replies with match details + license prompt
```

---

## 6. Frontend Architecture

### 6.1 Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React hooks (useState, useEffect)
- **Contract:** viem (public client for reads)
- **Deployment:** Vercel or local dev server

### 6.2 Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — live split view, tips, Blockscout links |
| `/riddim/[id]` | Individual riddim detail view |
| `/track/[id]` | Individual track detail view |

### 6.3 Data Fetching

Poll contract events every 2 seconds for live updates:

```typescript
// lib/useTrack.ts
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { hskTestnet } from "./chains";

const client = createPublicClient({ chain: hskTestnet, transport: http() });

export function useTrack(trackId: bigint) {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await client.readContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        abi: [...], // import from riddim.md
        functionName: "getTrack",
        args: [trackId]
      });
      setTrack(data);
    };

    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [trackId]);

  return track;
}
```

---

## 7. HSK Testnet Configuration

| Parameter | Value |
|---|---|
| Chain Name | HSK Testnet |
| Chain ID | 177 |
| RPC URL | `https://testnet.hsk.xyz/rpc` |
| Block Explorer | `https://testnet-explorer.hsk.xyz` |
| Currency | HSK (18 decimals) |
| Faucet | [To be confirmed] |

---

## 8. Dependencies

### Contract Layer
```json
{
  "hardhat": "^2.22.0",
  "@nomicfoundation/hardhat-toolbox": "^5.0.0",
  "@nomicfoundation/hardhat-ethers": "^3.0.0",
  "ethers": "^6.0.0"
}
```

### Agent / Bot Layer
```json
{
  "telegraf": "^4.16.0",
  "viem": "^2.0.0",
  "dotenv": "^16.0.0"
}
```

### Frontend Layer
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "tailwindcss": "^3.0.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "viem": "^2.0.0"
}
```

---

## 9. Security Considerations

1. **Split validation** — contract enforces splits sum to 10000 bps. Revert otherwise.
2. **Max voice royalty** — capped at 50% (5000 bps) to prevent abuse.
3. **Only-owner voice attach** — `attachVoiceClone` requires `msg.sender == voiceClone.artist`.
4. **Reentrancy** — `tipTrack` uses `transfer()` which has a 2300 gas stipend (safe for simple recipients). For production, use Checks-Effects-Interactions pattern.
5. **No admin keys** — contract is fully immutable after deployment (no upgrade, no pause). This is intentional for the hackathon to demonstrate trustlessness.
