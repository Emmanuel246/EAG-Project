"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";

import { hskTestnet } from "@/lib/onchain/chain";
import { wagmiConfig } from "@/lib/onchain/wagmi";

// Client-side provider tree for wallet auth. Wraps the whole app so any page can
// read wallet state (wagmi) and open the RainbowKit connect modal.
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={hskTestnet}
          theme={darkTheme({
            accentColor: "#f5a35b",
            accentColorForeground: "#101111",
            borderRadius: "medium",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
