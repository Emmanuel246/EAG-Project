require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Riddim Protocol contract toolchain.
//
// HSK Testnet real values (verified live, Aug 2026): the RPC is
// https://testnet.hsk.xyz (NOT ".../rpc") and the chain ID is 133 (0x85).
// The original spec said 177, but 177 is HashKey *mainnet* — 133 is testnet.
const HSK_RPC_URL = process.env.HSK_RPC_URL || "https://testnet.hsk.xyz";
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
      hskTestnet: "empty",
    },
    customChains: [
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
