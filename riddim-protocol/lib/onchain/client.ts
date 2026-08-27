import { createPublicClient, http } from "viem";

import { hskTestnet } from "./chain";

// Server-safe read client. Used by /api/onchain/* routes and the dashboard
// poller. Reads never require a wallet.
export const publicClient = createPublicClient({
  chain: hskTestnet,
  transport: http(),
});
