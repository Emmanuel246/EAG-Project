import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";

import { hskTestnet, sepolia } from "./chain";

// ---------------------------------------------------------------------------
// wagmi + RainbowKit configuration.
//
// RainbowKit gives users a WIDE RANGE of wallets (MetaMask, Rainbow, Coinbase,
// and — via WalletConnect — most mobile wallets) instead of hard-coding a
// single injected provider.
//
// We build the connector list explicitly with `connectorsForWallets` rather
// than `getDefaultConfig`, so we can leave out the Base Account wallet: its
// dependency tree (@base-org/account → @coinbase/cdp-sdk) pulls optional Solana
// modules that aren't installed and break the Next.js build. The wallets below
// cover the same practical range without that baggage.
//
// The WalletConnect Cloud project id enables the WalletConnect/mobile options.
// Injected browser wallets work without it; set a real id (free at
// https://cloud.walletconnect.com) to light up the full list.
// ---------------------------------------------------------------------------

const projectId =
  (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "").trim() ||
  "riddim_protocol_dev";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        injectedWallet,
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
  { appName: "Riddim Protocol", projectId },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [hskTestnet, sepolia],
  transports: {
    [hskTestnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // Next.js App Router renders on the server first.
});
