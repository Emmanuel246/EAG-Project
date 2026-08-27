import { formatEther, parseEther } from "viem";

// Mirrors RiddimRegistry.tipTrack payout math exactly, for preview + the
// offchain tip record. Voice clones take royaltyRateBps of the FULL tip off the
// top; the remainder is split evenly across riddims, then across each riddim's
// components by splitBps. Integer-division dust stays in the contract.

const TOTAL_BPS = 10000n;

export type SplitComponent = {
  name: string;
  splitBps: number;
  payoutWallet: string;
};
export type SplitRiddim = { title?: string; components: SplitComponent[] };
export type SplitVoice = {
  voiceName: string;
  royaltyRateBps: number;
  payoutWallet: string;
};

export type SplitLine = {
  kind: "voice" | "component";
  label: string;
  wallet: string;
  amountWei: bigint;
  amountHsk: string;
  share: number; // percent of the full tip
};

export type TipSplitPreview = {
  lines: SplitLine[];
  dustWei: bigint;
  dustHsk: string;
};

export function computeTipSplit(
  amountHsk: string,
  riddims: SplitRiddim[],
  voiceClones: SplitVoice[],
): TipSplitPreview {
  let value: bigint;
  try {
    value = parseEther(amountHsk || "0");
  } catch {
    value = 0n;
  }

  const lines: SplitLine[] = [];
  let voiceTotal = 0n;

  for (const vc of voiceClones) {
    const share = (value * BigInt(vc.royaltyRateBps)) / TOTAL_BPS;
    if (share > 0n) {
      voiceTotal += share;
      lines.push({
        kind: "voice",
        label: `${vc.voiceName} (voice royalty)`,
        wallet: vc.payoutWallet,
        amountWei: share,
        amountHsk: formatEther(share),
        share: value > 0n ? Number((share * 10000n) / value) / 100 : 0,
      });
    }
  }

  const remaining = value - voiceTotal;
  const nRiddims = BigInt(riddims.length);
  let distributed = voiceTotal;

  if (nRiddims > 0n && remaining > 0n) {
    const perRiddim = remaining / nRiddims;
    for (const riddim of riddims) {
      for (const c of riddim.components) {
        const share = (perRiddim * BigInt(c.splitBps)) / TOTAL_BPS;
        if (share > 0n) {
          distributed += share;
          lines.push({
            kind: "component",
            label: riddim.title ? `${riddim.title} · ${c.name}` : c.name,
            wallet: c.payoutWallet,
            amountWei: share,
            amountHsk: formatEther(share),
            share: value > 0n ? Number((share * 10000n) / value) / 100 : 0,
          });
        }
      }
    }
  }

  const dustWei = value - distributed;
  return { lines, dustWei, dustHsk: formatEther(dustWei > 0n ? dustWei : 0n) };
}
