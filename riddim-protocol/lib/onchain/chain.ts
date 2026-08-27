import { defineChain } from "viem";
import { sepolia } from "viem/chains";

// HSK Testnet — verified live values (Aug 2026).
// NOTE: the original spec said chain 177 + https://testnet.hsk.xyz/rpc, but that
// endpoint 404s and 177 is HashKey *mainnet*. The real testnet is chain 133 at
// https://testnet.hsk.xyz (no /rpc suffix). We build against the correct values.
export const HSK_RPC_URL =
  process.env.NEXT_PUBLIC_HSK_RPC_URL || "https://testnet.hsk.xyz";

export const HSK_EXPLORER_URL = "https://testnet-explorer.hsk.xyz";

export const hskTestnet = defineChain({
  id: 133,
  name: "HSK Testnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: [HSK_RPC_URL] },
    public: { http: [HSK_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "HSK Blockscout", url: HSK_EXPLORER_URL },
  },
  testnet: true,
});

// Sepolia is the demo-day fallback (same contract, same flow).
export { sepolia };

export const SUPPORTED_CHAINS = [hskTestnet, sepolia] as const;

/** Build a Blockscout/Etherscan tx link for the active chain. */
export function txUrl(hash: string, chainId: number = hskTestnet.id): string {
  if (chainId === sepolia.id) return `https://sepolia.etherscan.io/tx/${hash}`;
  return `${HSK_EXPLORER_URL}/tx/${hash}`;
}

export function addressUrl(
  address: string,
  chainId: number = hskTestnet.id,
): string {
  if (chainId === sepolia.id)
    return `https://sepolia.etherscan.io/address/${address}`;
  return `${HSK_EXPLORER_URL}/address/${address}`;
}
