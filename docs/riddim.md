# Riddim Protocol — Hackathon Build Guide

> **Event:** EAG Global Buildathon — Nigeria
> **Tracks:** AI-Native Creator Economy & Digital Rights (primary) · Real-World Ethereum Applications (secondary) · AI x Ethereum & Agent Economy (light touch) · Middleware & Open-Source Tooling (SDK framing)
> **Build Window:** 9:30am–1:30pm, Aug 27 (submission closes 2:00pm)
> **Team:** 2 people · 4 hours

---

## 1. What Riddim Protocol Is

An onchain registry where:
- A **producer** registers a riddim as a set of components (drums, melody, vocal hook), each with a preset ownership split and payout wallet.
- An **artist** "licenses" that riddim to build a new track — a simple onchain call, not a legal negotiation.
- Any **revenue** the new track earns (stablecoin tips for the demo) runs through a split function that automatically pays every component owner their percentage — cascading back to the original producer.
- **AI voice-clones** are treated as just another component type — an artist registers consent + a royalty rate for their cloned voice being used in AI covers.
- An **AI agent** autonomously discovers likely riddim reuses or voice clones, and proposes the licensing transaction for the user to confirm.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACES                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Telegram Bot │  │  Next.js UI  │  │  Blockscout  │  │
│  │  (chat UX)   │  │ (dashboard)  │  │  (explorer)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                 │                             │
├─────────┼─────────────────┼─────────────────────────────┤
│         │    AGENT LAYER  │                             │
│         │  ┌──────────────┴───────────────┐             │
│         └──┤  Node.js Agent Server        │             │
│            │  - Telegram Bot API          │             │
│            │  - AI detection (similarity) │             │
│            │  - LLM reasoning (optional)  │             │
│            │  - viem (wallet + contract)  │             │
│            └──────────────┬───────────────┘             │
│                           │                             │
├───────────────────────────┼─────────────────────────────┤
│         CONTRACT LAYER    │                             │
│  ┌────────────────────────┴───────────────┐             │
│  │  RiddimRegistry.sol (HSK Testnet)      │             │
│  │  - registerRiddim()                    │             │
│  │  - licenseRiddim()                     │             │
│  │  - registerVoiceClone()                │             │
│  │  - tipTrack()                          │             │
│  │  - getRiddim() / getTrack()            │             │
│  └────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Smart Contract: RiddimRegistry.sol

### 3.1 Storage Layout

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RiddimRegistry {

    struct Component {
        string name;           // e.g. "drums", "melody", "vocal hook"
        uint256 splitBps;      // basis points (10000 = 100%)
        address payoutWallet;
    }

    struct Riddim {
        uint256 id;
        address producer;
        string title;
        Component[] components;
        uint256 totalSplitBps;
        uint256 createdAt;
        bool exists;
    }

    struct Track {
        uint256 id;
        address artist;
        string title;
        uint256[] riddimIds;          // licensed riddims
        uint256 totalTipped;
        uint256 createdAt;
        bool exists;
    }

    struct VoiceCloneLicense {
        uint256 id;
        address artist;
        string voiceName;
        uint256 royaltyRateBps;       // royalty rate in basis points
        address payoutWallet;
        bool active;
    }

    mapping(uint256 => Riddim) public riddims;
    mapping(uint256 => Track) public tracks;
    mapping(uint256 => VoiceCloneLicense) public voiceClones;
    mapping(uint256 => uint256[]) public trackVoiceClones; // trackId => voiceCloneIds

    uint256 public nextRiddimId = 1;
    uint256 public nextTrackId = 1;
    uint256 public nextVoiceCloneId = 1;

    // --- Events ---
    event RiddimRegistered(uint256 indexed id, address indexed producer, string title);
    event RiddimLicensed(uint256 indexed trackId, uint256 indexed riddimId, address indexed artist);
    event VoiceCloneRegistered(uint256 indexed id, address indexed artist, string voiceName);
    event TipSplit(uint256 indexed trackId, address indexed tipper, uint256 amount);
}
```

### 3.2 Core Functions

```solidity
// --- Register a Riddim ---
function registerRiddim(
    string calldata title,
    string[] calldata componentNames,
    uint256[] calldata splitBps,
    address[] calldata payoutWallets
) external returns (uint256) {
    require(componentNames.length == splitBps.length, "Length mismatch");
    require(componentNames.length == payoutWallets.length, "Length mismatch");

    uint256 totalBps;
    for (uint256 i = 0; i < splitBps.length; i++) {
        totalBps += splitBps[i];
    }
    require(totalBps == 10000, "Splits must sum to 10000 bps");

    uint256 riddimId = nextRiddimId++;
    Riddim storage r = riddims[riddimId];
    r.id = riddimId;
    r.producer = msg.sender;
    r.title = title;
    r.totalSplitBps = totalBps;
    r.createdAt = block.timestamp;
    r.exists = true;

    for (uint256 i = 0; i < componentNames.length; i++) {
        r.components.push(Component({
            name: componentNames[i],
            splitBps: splitBps[i],
            payoutWallet: payoutWallets[i]
        }));
    }

    emit RiddimRegistered(riddimId, msg.sender, title);
    return riddimId;
}

// --- License a Riddim into a new Track ---
function licenseRiddim(
    string calldata trackTitle,
    uint256 riddimId
) external returns (uint256) {
    require(riddims[riddimId].exists, "Riddim not found");

    uint256 trackId = nextTrackId++;
    Track storage t = tracks[trackId];
    t.id = trackId;
    t.artist = msg.sender;
    t.title = trackTitle;
    t.riddimIds.push(riddimId);
    t.createdAt = block.timestamp;
    t.exists = true;

    emit RiddimLicensed(trackId, riddimId, msg.sender);
    return trackId;
}

// --- Register a Voice Clone License ---
function registerVoiceClone(
    string calldata voiceName,
    uint256 royaltyRateBps,
    address payoutWallet
) external returns (uint256) {
    require(royaltyRateBps <= 5000, "Max 50% royalty");

    uint256 cloneId = nextVoiceCloneId++;
    voiceClones[cloneId] = VoiceCloneLicense({
        id: cloneId,
        artist: msg.sender,
        voiceName: voiceName,
        royaltyRateBps: royaltyRateBps,
        payoutWallet: payoutWallet,
        active: true
    });

    emit VoiceCloneRegistered(cloneId, msg.sender, voiceName);
    return cloneId;
}

// --- Attach a Voice Clone to a Track ---
function attachVoiceClone(uint256 trackId, uint256 voiceCloneId) external {
    require(tracks[trackId].exists, "Track not found");
    require(voiceClones[voiceCloneId].active, "Clone not active");
    require(voiceClones[voiceCloneId].artist == msg.sender, "Not your voice");
    trackVoiceClones[trackId].push(voiceCloneId);
}

// --- Tip a Track (auto-splits to all component + voice owners) ---
function tipTrack(uint256 trackId) external payable {
    require(tracks[trackId].exists, "Track not found");
    require(msg.value > 0, "Must tip something");

    Track storage t = tracks[trackId];
    t.totalTipped += msg.value;

    // Split across all licensed riddims
    uint256 riddimCount = t.riddimIds.length;
    uint256 perRiddim = msg.value / riddimCount;
    uint256 dust = msg.value - (perRiddim * riddimCount); // leftover stays in contract

    for (uint256 i = 0; i < riddimCount; i++) {
        Riddim storage r = riddims[t.riddimIds[i]];
        uint256 componentCount = r.components.length;

        for (uint256 j = 0; j < componentCount; j++) {
            uint256 share = (perRiddim * r.components[j].splitBps) / 10000;
            if (share > 0) {
                payable(r.components[j].payoutWallet).transfer(share);
            }
        }
    }

    // Split across voice clones attached to this track
    uint256[] storage cloneIds = trackVoiceClones[trackId];
    for (uint256 i = 0; i < cloneIds.length; i++) {
        VoiceCloneLicense storage vc = voiceClones[cloneIds[i]];
        uint256 voiceShare = (msg.value * vc.royaltyRateBps) / 10000;
        if (voiceShare > 0) {
            payable(vc.payoutWallet).transfer(voiceShare);
        }
    }

    emit TipSplit(trackId, msg.sender, msg.value);
}

// --- View Functions ---
function getRiddim(uint256 id) external view returns (Riddim memory) {
    return riddims[id];
}

function getTrack(uint256 id) external view returns (Track memory) {
    return tracks[id];
}

function getVoiceClone(uint256 id) external view returns (VoiceCloneLicense memory) {
    return voiceClones[id];
}

receive() external payable {}
```

### 3.3 Deployment Config

```javascript
// hardhat.config.js or viem deployment script
const hskTestnet = {
  id: 177,
  name: "HSK Testnet",
  rpcUrl: "https://testnet.hsk.xyz/rpc",  // confirm actual RPC
  currency: { name: "HSK", symbol: "HSK", decimals: 18 },
  blockExplorerUrl: "https://testnet-explorer.hsk.xyz"
};
```

---

## 4. Agent Detection Flow

### 4.1 Pre-seeded Fingerprint Database

Before the build window, create a JSON file with 5-6 pre-seeded "tracks" that have known similarity relationships:

```json
{
  "tracks": [
    {
      "id": "track-a1",
      "title": "Lagos Nights (Original)",
      "producer": "ProducerK",
      "fingerprint": [0.23, 0.87, 0.45, 0.12, 0.91, 0.34, 0.67, 0.88],
      "riddimId": 1
    },
    {
      "id": "track-a2",
      "title": "Lagos Nights Remix (Unauthorized)",
      "artist": "ArtistX",
      "fingerprint": [0.24, 0.85, 0.44, 0.13, 0.90, 0.33, 0.66, 0.87],
      "riddimId": null
    },
    {
      "id": "track-b1",
      "title": "Afro Vibrations (Original)",
      "producer": "BeatSmith",
      "fingerprint": [0.55, 0.33, 0.78, 0.92, 0.11, 0.66, 0.44, 0.77],
      "riddimId": 2
    },
    {
      "id": "track-b2",
      "title": "Afro Vibrations Cover (AI Voice)",
      "artist": "AIClone",
      "fingerprint": [0.54, 0.34, 0.77, 0.91, 0.12, 0.65, 0.43, 0.76],
      "riddimId": null
    }
  ]
}
```

### 4.2 Similarity Detection

```javascript
// cosineSimilarity.js
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function detectReuse(newFingerprint, fingerprintDB, threshold = 0.95) {
  const matches = [];
  for (const track of fingerprintDB) {
    const sim = cosineSimilarity(newFingerprint, track.fingerprint);
    if (sim >= threshold) {
      matches.push({ ...track, similarity: sim });
    }
  }
  return matches.sort((a, b) => b.similarity - a.similarity);
}
```

### 4.3 Pre-fill Licensing Transaction

When a match is found, the agent constructs and presents a licensing transaction:

```javascript
async function proposeLicense(matchedTrack, agentWallet, contractAddress) {
  return {
    action: "LICENSE_RIDDM",
    trackTitle: `Remix of ${matchedTrack.title}`,
    riddimId: matchedTrack.riddimId,
    contractAddress: contractAddress,
    message: `I detected that "${matchedTrack.title}" likely reuses the registered riddim by ${matchedTrack.producer}. Would you like to license it? Click to confirm.`,
    estimatedSplit: "80% to you, 20% to original producer (per riddim split)"
  };
}
```

### 4.4 Agent Server

```javascript
// agent-server.js
const { TelegramBot } = require("telegraf");
const { createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");

// Pre-seeded fingerprint database
const fingerprintDB = require("./fingerprints.json");

// Agent wallet (funded with testnet tokens)
const agentAccount = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY);
const walletClient = createWalletClient({
  account: agentAccount,
  transport: http("https://testnet.hsk.xyz/rpc")
});

// Detect and propose
function handleDetect(input) {
  const inputFingerprint = generateFingerprint(input); // or use precomputed
  const matches = detectReuse(inputFingerprint, fingerprintDB.tracks);

  if (matches.length > 0) {
    return {
      found: true,
      match: matches[0],
      proposal: proposeLicense(matches[0])
    };
  }
  return { found: false };
}

module.exports = { handleDetect };
```

---

## 5. Telegram Bot

### 5.1 Commands

| Command | What it does | Example |
|---|---|---|
| `/start` | Welcome message + instructions | — |
| `/register` | Register a riddim with components | `/register Afro Beats\|drums:40:0x123...\|melody:60:0x456...` |
| `/license` | License a riddim to a new track | `/license 1 My New Song` |
| `/voice` | Register a voice clone consent | `/voice MyVoice 1000 0x789...` |
| `/tip` | Tip a track (auto-splits) | `/tip 1 500` |
| `/detect` | Run similarity detection | `/detect [fingerprint or track data]` |
| `/status` | Show your registered riddims/tracks | — |

### 5.2 Bot Implementation

```javascript
// bot.js
const { Telegraf } = require("telegraf");
const { handleDetect } = require("./agent-server");
const { registerRiddim, licenseRiddim, tipTrack, registerVoiceClone } = require("./contract");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "🎵 Riddim Protocol\n\n" +
    "Register beats, license riddims, earn automatically.\n\n" +
    "Commands:\n" +
    "/register - Register a riddim\n" +
    "/license - License a riddim\n" +
    "/voice - Register voice clone consent\n" +
    "/tip - Tip a track\n" +
    "/detect - Check for unauthorized reuse\n" +
    "/status - Your portfolio"
  );
});

bot.command("register", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ");
  // Parse: "Title|component1:splitBps:wallet|component2:splitBps:wallet"
  const [title, ...componentStrs] = args.split("|");
  const components = componentStrs.map((c) => {
    const [name, splitBps, wallet] = c.split(":");
    return { name, splitBps: parseInt(splitBps), payoutWallet: wallet };
  });

  const totalBps = components.reduce((sum, c) => sum + c.splitBps, 0);
  if (totalBps !== 10000) {
    return ctx.reply(`❌ Splits must sum to 10000 (currently ${totalBps})`);
  }

  try {
    const txHash = await registerRiddim(
      title.trim(),
      components.map((c) => c.name),
      components.map((c) => c.splitBps),
      components.map((c) => c.payoutWallet)
    );
    ctx.reply(`✅ Riddim registered!\nTX: https://testnet-explorer.hsk.xyz/tx/${txHash}`);
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("license", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const riddimId = parseInt(args[0]);
  const trackTitle = args.slice(1).join(" ");

  if (!riddimId || !trackTitle) {
    return ctx.reply("Usage: /license [riddimId] [track title]");
  }

  try {
    const txHash = await licenseRiddim(riddimId, trackTitle);
    ctx.reply(`✅ Track licensed!\nTX: https://testnet-explorer.hsk.xyz/tx/${txHash}`);
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("voice", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const voiceName = args[0];
  const royaltyBps = parseInt(args[1]);
  const wallet = args[2];

  if (!voiceName || !royaltyBps || !wallet) {
    return ctx.reply("Usage: /voice [name] [royaltyBps] [wallet]");
  }

  try {
    const txHash = await registerVoiceClone(voiceName, royaltyBps, wallet);
    ctx.reply(`✅ Voice clone registered!\nTX: https://testnet-explorer.hsk.xyz/tx/${txHash}`);
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("tip", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const trackId = parseInt(args[0]);
  const amountWei = args[1]; // in wei or use parseEther

  if (!trackId || !amountWei) {
    return ctx.reply("Usage: /tip [trackId] [amount in wei]");
  }

  try {
    const txHash = await tipTrack(trackId, amountWei);
    ctx.reply(`✅ Tip sent! Split executed.\nTX: https://testnet-explorer.hsk.xyz/tx/${txHash}`);
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command("detect", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ");
  const result = handleDetect(args);

  if (result.found) {
    ctx.reply(
      `🔍 Similarity detected!\n\n` +
      `Matched: "${result.match.title}" by ${result.match.producer}\n` +
      `Similarity: ${(result.match.similarity * 100).toFixed(1)}%\n\n` +
      `📋 Proposed licensing:\n${result.proposal.message}\n\n` +
      `Type /license ${result.match.riddimId} [your track title] to license.`
    );
  } else {
    ctx.reply("✅ No similar registered riddims found. You're clear!");
  }
});

bot.launch();
```

### 5.3 Contract Interaction Layer (viem)

```javascript
// contract.js
const { createWalletClient, http, parseAbi } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { hskTestnet } = require("./chains");

const abi = parseAbi([
  "function registerRiddim(string title, string[] componentNames, uint256[] splitBps, address[] payoutWallets) returns (uint256)",
  "function licenseRiddim(string trackTitle, uint256 riddimId) returns (uint256)",
  "function registerVoiceClone(string voiceName, uint256 royaltyRateBps, address payoutWallet) returns (uint256)",
  "function tipTrack(uint256 trackId) payable",
  "function getRiddim(uint256 id) view returns (tuple)",
  "function getTrack(uint256 id) view returns (tuple)"
]);

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const client = createWalletClient({ account, chain: hskTestnet, transport: http() });
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function registerRiddim(title, names, splits, wallets) {
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "registerRiddim",
    args: [title, names, splits, wallets]
  });
  return hash;
}

async function licenseRiddim(riddimId, trackTitle) {
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "licenseRiddim",
    args: [trackTitle, BigInt(riddimId)]
  });
  return hash;
}

async function registerVoiceClone(name, royaltyBps, wallet) {
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "registerVoiceClone",
    args: [name, BigInt(royaltyBps), wallet]
  });
  return hash;
}

async function tipTrack(trackId, valueInWei) {
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "tipTrack",
    args: [BigInt(trackId)],
    value: BigInt(valueInWei)
  });
  return hash;
}

module.exports = { registerRiddim, licenseRiddim, registerVoiceClone, tipTrack };
```

---

## 6. Dashboard (Next.js)

### 6.1 Single Page: `app/page.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [track, setTrack] = useState(null);
  const [tips, setTips] = useState([]);

  // Fetch track data from contract (viem public client)
  useEffect(() => {
    // Poll contract for latest TrackRegistered / TipSplit events
    const interval = setInterval(async () => {
      const res = await fetch("/api/track/1"); // hardcoded for demo
      const data = await res.json();
      setTrack(data);
      setTips(data.tips || []);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">🎵 Riddim Protocol</h1>

      {track && (
        <div className="mb-12">
          <h2 className="text-2xl mb-4">{track.title}</h2>
          <p className="text-gray-400 mb-2">
            Artist: {track.artist} · Licensed from Riddim #{track.riddimIds?.[0]}
          </p>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg mb-4">Split Breakdown</h3>
            {track.components?.map((c, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>{c.name}</span>
                <span>{(c.splitBps / 100).toFixed(1)}% → {c.payoutWallet?.slice(0, 10)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-12">
        <h3 className="text-xl mb-4">Live Tips</h3>
        {tips.length === 0 ? (
          <p className="text-gray-500">No tips yet. Send /tip in Telegram!</p>
        ) : (
          tips.map((tip, i) => (
            <div key={i} className="bg-gray-900 rounded p-4 mb-2">
              <span className="text-green-400">{tip.amount} wei</span>
              <span className="text-gray-500 ml-4">from {tip.from?.slice(0, 10)}...</span>
              <a
                href={`https://testnet-explorer.hsk.xyz/tx/${tip.txHash}`}
                target="_blank"
                className="text-blue-400 ml-4"
              >
                View on Explorer ↗
              </a>
            </div>
          ))
        )}
      </div>

      <div className="text-center text-gray-600 mt-16">
        <p>Powered by Riddim Protocol · HSK Testnet</p>
      </div>
    </div>
  );
}
```

### 6.2 API Route: `app/api/track/[id]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { hskTestnet } from "@/lib/chains";

const client = createPublicClient({ chain: hskTestnet, transport: http() });
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const trackId = BigInt(params.id);

  // Read track from contract
  const track = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: [...], // same ABI as contract.js
    functionName: "getTrack",
    args: [trackId]
  });

  return NextResponse.json(track);
}
```

---

## 7. Build Order

### Pre-build (before 9:30am)
- [ ] Contract compiled and tested locally (Hardhat or forge)
- [ ] Telegram bot token ready (BotFather)
- [ ] HSK testnet RPC confirmed and funded (agent wallet + test tokens)
- [ ] Fingerprint database JSON created with 4-6 tracks
- [ ] Next.js project scaffolded (create-next-app + tailwind + shadcn)
- [ ] viem installed, chains.ts configured for HSK testnet
- [ ] Demo script printed/ memorized

### Hour 1 (9:30–10:30): Contract + Deploy
- [ ] Deploy RiddimRegistry.sol to HSK testnet
- [ ] Register 2 demo riddims with splits via contract call
- [ ] Verify contract on Blockscout (if auto-verify available)
- [ ] Record contract address

### Hour 2 (10:30–11:30): Telegram Bot
- [ ] Implement bot.js with all commands
- [ ] Test /register, /license, /tip against deployed contract
- [ ] Fund bot wallet with testnet tokens for tips
- [ ] Test full flow: register → license → tip → check explorer

### Hour 3 (11:30–12:30): Agent Detection + Dashboard
- [ ] Implement similarity detection (cosine similarity on fingerprints)
- [ ] Wire detect command to agent server
- [ ] Build dashboard page (live split view)
- [ ] Test agent detects unauthorized remix and proposes license

### Hour 4 (12:30–1:30): Integration + Polish
- [ ] Full end-to-end test: register → detect → license → tip → dashboard
- [ ] Rehearse demo script
- [ ] Prepare fallback (pre-recorded video if bot fails)
- [ ] Commit, push, submit

---

## 8. Demo Script (3 minutes)

### 0:00–0:25 — Hook
> "Nigerian and African music has no mechanical licensing infrastructure. AI covers of artists' voices go viral with zero consent and zero payment. Producers get no credit when their riddim is reused. Riddim Protocol fixes this."

### 0:25–1:00 — Register a Riddim (Telegram)
> Open Telegram. Send: `/register Afro Vibes|drums:40:0xAlice|melody:60:0xBob`
>
> "Producer Alice registers her beat with two components — 40% drums, 60% melody — each with their own payout wallet."
>
> Show the TX on Blockscout. "The split is onchain. Transparent. Immutable."

### 1:00–1:30 — License + AI Detect
> Send: `/detect [fingerprint or track name]`
>
> Agent responds: "Similarity detected! Matched 'Afro Vibes' by Producer Alice. 97.2% similarity."
>
> Send: `/license 1 Afro Vibes Remix`
>
> "The AI found an unauthorized reuse and proposed the license. One message to confirm."

### 1:30–2:15 — Tip + Live Split
> Send: `/tip 1 500000000000000000` (0.5 HSK in wei)
>
> Show Blockscout: "The tip auto-splits — 40% to Alice's drums wallet, 60% to Bob's melody wallet. Live. Onchain."
>
> Open dashboard: "The split is visible in real-time."

### 2:15–2:45 — Voice Clone
> Send: `/voice NigerianStar 1000 0xNigerianStar` (10% royalty)
>
> "Artists can register consent for AI voice usage — same registry, same split logic. The AI economy needs consent primitives."

### 2:45–3:00 — Roadmap + Close
> "Next: real audio fingerprinting, artist onboarding, integration with Boomplay and Audiomack. Riddim Protocol — the licensing layer Afrobeats never had."

---

## 9. Fallback Plan

| If this fails... | Do this instead |
|---|---|
| Agent detect doesn't work live | Pre-record the detection response, play it as a video clip |
| Telegram bot has latency | Run the demo through the Next.js UI directly |
| Contract deploy fails | Use a local Hardhat node, show the same flow on localhost |
| HSK testnet is down | Switch to Sepolia, same contract, same demo |
| Tip transaction reverts | Pre-fund a wallet with the split already executed, show the Blockscout result |

---

## 10. Tech Stack

| Layer | Tool |
|---|---|
| Smart contract | Solidity 0.8.20, Hardhat or Forge |
| Wallet / contract interaction | viem |
| Agent server | Node.js, viem |
| AI detection | Cosine similarity (no external API needed) |
| Telegram bot | Telegraf.js |
| Frontend | Next.js 14+, Tailwind CSS, shadcn/ui |
| LLM (optional) | OpenAI / Gemini / OpenRouter (for agent reasoning) |
| Chain | HSK Testnet (chain ID 177) |
| Explorer | HSK Blockscout |

---

## 11. Key Reminders

1. **Contract must be pre-written and tested before 9:30am.** Do not start from scratch in the build window.
2. **The agent detection is a labeled proof-of-concept.** Say this explicitly in the pitch — it builds credibility.
3. **The demo arc is: register → detect → license → tip → split on explorer.** Every step must work. Rehearse the fallback for each.
4. **Frame as open-source SDK.** Any music platform can integrate the registry + split logic. This adds the Middleware track.
5. **Voice clone consent is the differentiator.** It's the same registry, same split, new component type. Emphasize this in the pitch.
6. **Blockscout links are the proof.** Every onchain action must be shown on the explorer. This is what makes it real to judges.
