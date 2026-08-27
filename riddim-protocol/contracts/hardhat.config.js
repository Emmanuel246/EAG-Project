require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Riddim Protocol contract toolchain.
//
// HSK Mainnet (production): RPC https://mainnet.hsk.xyz, chain ID 177 (0xb1).
// HSK Testnet (dry-run):    RPC https://testnet.hsk.xyz, chain ID 133 (0x85).
// Both verified live (Aug 2026). Note the testnet RPC has no ".../rpc" suffix.
const HSK_RPC_URL = process.env.HSK_RPC_URL || "https://testnet.hsk.xyz";
const HSK_MAINNET_RPC_URL =
  process.env.HSK_MAINNET_RPC_URL || "https://mainnet.hsk.xyz";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./src",
  },
  networks: {
    // Production network — real HSK, irreversible transactions.
    hskMainnet: {
      url: HSK_MAINNET_RPC_URL,
      chainId: 177,
      accounts,
    },
    hskTestnet: {
      url: HSK_RPC_URL,
      chainId: 133,
      accounts,
    },
    // Fallback per the demo-day plan: same contract, same flow on Sepolia.
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts,
    },
  },
  // Blockscout verification for HSK Testnet (optional; run `hardhat verify`).
  etherscan: {
    apiKey: {
      hskMainnet: "empty",
      hskTestnet: "empty",
    },
    customChains: [
      {
        network: "hskMainnet",
        chainId: 177,
        urls: {
          apiURL: "https://explorer.hsk.xyz/api",
          browserURL: "https://explorer.hsk.xyz",
        },
      },
      {
        network: "hskTestnet",
        chainId: 133,
        urls: {
          apiURL: "https://testnet-explorer.hsk.xyz/api",
          browserURL: "https://testnet-explorer.hsk.xyz",
        },
      },
    ],
  },
};
