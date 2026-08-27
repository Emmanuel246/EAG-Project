"use client";

import {
  parseEther,
  parseEventLogs,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { getAccount, getWalletClient, switchChain } from "@wagmi/core";

import { riddimRegistryAbi } from "./abi";
import { hskTestnet } from "./chain";
import { publicClient } from "./client";
import { CONTRACT_ADDRESS, isContractConfigured } from "./config";
import { wagmiConfig } from "./wagmi";

// ---------------------------------------------------------------------------
// Wallet write layer (RainbowKit + wagmi).
//
// Every state-changing call originates HERE, from an explicit user click that
// pops the connected wallet's own confirm dialog. Connection itself is handled
// by RainbowKit's <ConnectButton /> — users can pick from a wide range of
// wallets (MetaMask, Rainbow, Coinbase, WalletConnect mobile, …).
//
// Nothing in this app — including the AI similarity check — can submit a
// transaction without the human approving it in their wallet. That guarantee is
// structural: server code has no private key, and these functions require a
// live wallet client obtained from the user's own connector.
// ---------------------------------------------------------------------------

// The concrete wallet client type wagmi hands back from the active connector.
type ConnectedWalletClient = NonNullable<
  Awaited<ReturnType<typeof getWalletClient>>
>;

function assertConfigured() {
  if (!isContractConfigured()) {
    throw new Error(
      "Contract address is not set. Deploy the contract (contracts/ → npm run deploy:hsk) and set NEXT_PUBLIC_CONTRACT_ADDRESS.",
    );
  }
}

/** Address of the wallet currently connected via RainbowKit, or null. */
export async function getConnectedAccount(): Promise<Address | null> {
  return getAccount(wagmiConfig).address ?? null;
}

/** Ensure the connected wallet is on HSK Testnet (prompts a switch if not). */
export async function ensureHskNetwork(): Promise<void> {
  const { chainId } = getAccount(wagmiConfig);
  if (chainId === hskTestnet.id) return;
  await switchChain(wagmiConfig, { chainId: hskTestnet.id });
}

// Resolve a signing client from the connected wallet, on the right network.
async function walletClient(): Promise<{
  client: ConnectedWalletClient;
  account: Address;
}> {
  assertConfigured();
  const { address, isConnected } = getAccount(wagmiConfig);
  if (!isConnected || !address) {
    throw new Error(
      "Connect a wallet first — use “Connect Wallet” in the top-right.",
    );
  }
  await ensureHskNetwork();
  const client = await getWalletClient(wagmiConfig, {
    account: address,
    chainId: hskTestnet.id,
  });
  return { client, account: address };
}

const contract = {
  address: CONTRACT_ADDRESS as Address,
  abi: riddimRegistryAbi,
} as const;

/** Submit a write, wait for the receipt, and return { hash, receipt }. */
async function submit(
  fn: (client: ConnectedWalletClient, account: Address) => Promise<Hex>,
) {
  const { client, account } = await walletClient();
  const hash = await fn(client, account);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

/** Read the id emitted by a registry event in a receipt (ids are sequential). */
function extractEventId(
  receipt: TransactionReceipt,
  eventName: string,
  argName: string,
): number | null {
  try {
    const logs = parseEventLogs({
      abi: riddimRegistryAbi,
      eventName: eventName as never,
      logs: receipt.logs,
    });
    const args = (logs[0] as { args?: Record<string, unknown> } | undefined)?.args;
    const value = args?.[argName];
    return value != null ? Number(value as bigint) : null;
  } catch {
    return null;
  }
}

export type ComponentInput = {
  name: string;
  splitBps: number;
  payoutWallet: Address;
};

export async function registerRiddim(title: string, components: ComponentInput[]) {
  const { hash, receipt } = await submit((client, account) =>
    client.writeContract({
      ...contract,
      account,
      chain: hskTestnet,
      functionName: "registerRiddim",
      args: [
        title,
        components.map((c) => c.name),
        components.map((c) => BigInt(c.splitBps)),
        components.map((c) => c.payoutWallet),
      ],
    }),
  );
  const riddimId = extractEventId(receipt, "RiddimRegistered", "id");
  return { hash, receipt, riddimId };
}

export async function licenseRiddim(trackTitle: string, riddimId: number) {
  const { hash, receipt } = await submit((client, account) =>
    client.writeContract({
      ...contract,
      account,
      chain: hskTestnet,
      functionName: "licenseRiddim",
      args: [trackTitle, BigInt(riddimId)],
    }),
  );
  const trackId = extractEventId(receipt, "RiddimLicensed", "trackId");
  return { hash, receipt, trackId };
}

export async function registerVoiceClone(
  voiceName: string,
  royaltyRateBps: number,
  payoutWallet: Address,
) {
  const { hash, receipt } = await submit((client, account) =>
    client.writeContract({
      ...contract,
      account,
      chain: hskTestnet,
      functionName: "registerVoiceClone",
      args: [voiceName, BigInt(royaltyRateBps), payoutWallet],
    }),
  );
  const voiceCloneId = extractEventId(receipt, "VoiceCloneRegistered", "id");
  return { hash, receipt, voiceCloneId };
}

export async function attachVoiceClone(trackId: number, voiceCloneId: number) {
  return submit((client, account) =>
    client.writeContract({
      ...contract,
      account,
      chain: hskTestnet,
      functionName: "attachVoiceClone",
      args: [BigInt(trackId), BigInt(voiceCloneId)],
    }),
  );
}

export async function tipTrack(trackId: number, amountHsk: string) {
  return submit((client, account) =>
    client.writeContract({
      ...contract,
      account,
      chain: hskTestnet,
      functionName: "tipTrack",
      args: [BigInt(trackId)],
      value: parseEther(amountHsk),
    }),
  );
}
