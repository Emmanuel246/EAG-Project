// ABI for RiddimRegistry — kept in sync with contracts/src/RiddimRegistry.sol.
// `contracts/scripts/export-abi.js` writes the compiled ABI to abi.json for a
// diff check; this typed const is what the app imports.
export const riddimRegistryAbi = [
  // --- writes ---
  {
    type: "function",
    name: "registerRiddim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "componentNames", type: "string[]" },
      { name: "splitBps", type: "uint256[]" },
      { name: "payoutWallets", type: "address[]" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "licenseRiddim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "trackTitle", type: "string" },
      { name: "riddimId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "registerVoiceClone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "voiceName", type: "string" },
      { name: "royaltyRateBps", type: "uint256" },
      { name: "payoutWallet", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "attachVoiceClone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "trackId", type: "uint256" },
      { name: "voiceCloneId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "tipTrack",
    stateMutability: "payable",
    inputs: [{ name: "trackId", type: "uint256" }],
    outputs: [],
  },
  // --- reads ---
  {
    type: "function",
    name: "getRiddim",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "producer", type: "address" },
          { name: "title", type: "string" },
          {
            name: "components",
            type: "tuple[]",
            components: [
              { name: "name", type: "string" },
              { name: "splitBps", type: "uint256" },
              { name: "payoutWallet", type: "address" },
            ],
          },
          { name: "totalSplitBps", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getTrack",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "artist", type: "address" },
          { name: "title", type: "string" },
          { name: "riddimIds", type: "uint256[]" },
          { name: "totalTipped", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getVoiceClone",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "artist", type: "address" },
          { name: "voiceName", type: "string" },
          { name: "royaltyRateBps", type: "uint256" },
          { name: "payoutWallet", type: "address" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getTrackVoiceClones",
    stateMutability: "view",
    inputs: [{ name: "trackId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "riddimCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "trackCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "voiceCloneCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "MAX_VOICE_ROYALTY_BPS",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // --- events ---
  {
    type: "event",
    name: "RiddimRegistered",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "producer", type: "address", indexed: true },
      { name: "title", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RiddimLicensed",
    inputs: [
      { name: "trackId", type: "uint256", indexed: true },
      { name: "riddimId", type: "uint256", indexed: true },
      { name: "artist", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "VoiceCloneRegistered",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "artist", type: "address", indexed: true },
      { name: "voiceName", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "VoiceCloneAttached",
    inputs: [
      { name: "trackId", type: "uint256", indexed: true },
      { name: "voiceCloneId", type: "uint256", indexed: true },
      { name: "artist", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TipSplit",
    inputs: [
      { name: "trackId", type: "uint256", indexed: true },
      { name: "tipper", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  { type: "receive", stateMutability: "payable" },
] as const;

export type RiddimRegistryAbi = typeof riddimRegistryAbi;
