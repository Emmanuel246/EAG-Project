import { hskTestnet } from "./chain";

// Contract address is injected after deployment. Until then the app runs in
// "offchain mode" (Supabase-backed) and onchain reads/writes are disabled with
// a clear banner rather than crashing.
export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
).trim() as `0x${string}` | "";

export const ACTIVE_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || hskTestnet.id,
);

export function isContractConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);
}

/** Bps (10000 = 100%) → percentage number. */
export function bpsToPercent(bps: number | bigint): number {
  return Number(bps) / 100;
}

export function shortAddress(value?: string | null): string {
  if (!value) return "—";
  if (value.length < 10) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
