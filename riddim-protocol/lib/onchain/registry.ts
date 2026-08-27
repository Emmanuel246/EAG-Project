import { formatEther } from "viem";

import { riddimRegistryAbi } from "./abi";
import { hskTestnet } from "./chain";
import { publicClient } from "./client";
import { CONTRACT_ADDRESS, isContractConfigured } from "./config";

// JSON-safe shapes (bigints stringified) returned to the client.
export type ComponentView = {
  name: string;
  splitBps: number;
  splitPercent: number;
  payoutWallet: string;
};

export type RiddimView = {
  id: number;
  producer: string;
  title: string;
  components: ComponentView[];
  totalSplitBps: number;
  createdAt: number;
  exists: boolean;
};

export type TrackView = {
  id: number;
  artist: string;
  title: string;
  riddimIds: number[];
  totalTipped: string; // wei as string
  totalTippedFormatted: string; // HSK
  createdAt: number;
  exists: boolean;
};

export type VoiceCloneView = {
  id: number;
  artist: string;
  voiceName: string;
  royaltyRateBps: number;
  royaltyPercent: number;
  payoutWallet: string;
  active: boolean;
};

function assertConfigured() {
  if (!isContractConfigured()) {
    throw new Error(
      "Contract not deployed. Set NEXT_PUBLIC_CONTRACT_ADDRESS after running `npm run deploy:hsk` in contracts/.",
    );
  }
}

const base = () =>
  ({ address: CONTRACT_ADDRESS as `0x${string}`, abi: riddimRegistryAbi }) as const;

export async function getChainStatus() {
  const configured = isContractConfigured();
  let blockNumber: string | null = null;
  let reachable = false;
  try {
    blockNumber = (await publicClient.getBlockNumber()).toString();
    reachable = true;
  } catch {
    reachable = false;
  }
  return {
    configured,
    reachable,
    chainId: hskTestnet.id,
    chainName: hskTestnet.name,
    rpcUrl: hskTestnet.rpcUrls.default.http[0],
    explorer: hskTestnet.blockExplorers?.default.url,
    contractAddress: configured ? CONTRACT_ADDRESS : null,
    blockNumber,
  };
}

export async function getCounts() {
  assertConfigured();
  const [riddims, tracks, voiceClones] = await Promise.all([
    publicClient.readContract({ ...base(), functionName: "riddimCount" }),
    publicClient.readContract({ ...base(), functionName: "trackCount" }),
    publicClient.readContract({ ...base(), functionName: "voiceCloneCount" }),
  ]);
  return {
    riddims: Number(riddims),
    tracks: Number(tracks),
    voiceClones: Number(voiceClones),
  };
}

export async function getRiddim(id: number): Promise<RiddimView | null> {
  assertConfigured();
  const r = (await publicClient.readContract({
    ...base(),
    functionName: "getRiddim",
    args: [BigInt(id)],
  })) as any;
  if (!r.exists) return null;
  return {
    id: Number(r.id),
    producer: r.producer,
    title: r.title,
    components: r.components.map((c: any) => ({
      name: c.name,
      splitBps: Number(c.splitBps),
      splitPercent: Number(c.splitBps) / 100,
      payoutWallet: c.payoutWallet,
    })),
    totalSplitBps: Number(r.totalSplitBps),
    createdAt: Number(r.createdAt),
    exists: r.exists,
  };
}

export async function getTrack(id: number): Promise<TrackView | null> {
  assertConfigured();
  const t = (await publicClient.readContract({
    ...base(),
    functionName: "getTrack",
    args: [BigInt(id)],
  })) as any;
  if (!t.exists) return null;
  return {
    id: Number(t.id),
    artist: t.artist,
    title: t.title,
    riddimIds: t.riddimIds.map((x: bigint) => Number(x)),
    totalTipped: t.totalTipped.toString(),
    totalTippedFormatted: formatEther(t.totalTipped),
    createdAt: Number(t.createdAt),
    exists: t.exists,
  };
}

export async function getVoiceClone(id: number): Promise<VoiceCloneView | null> {
  assertConfigured();
  const v = (await publicClient.readContract({
    ...base(),
    functionName: "getVoiceClone",
    args: [BigInt(id)],
  })) as any;
  if (!v.active && Number(v.id) === 0) return null;
  return {
    id: Number(v.id),
    artist: v.artist,
    voiceName: v.voiceName,
    royaltyRateBps: Number(v.royaltyRateBps),
    royaltyPercent: Number(v.royaltyRateBps) / 100,
    payoutWallet: v.payoutWallet,
    active: v.active,
  };
}

export async function getTrackVoiceCloneIds(trackId: number): Promise<number[]> {
  assertConfigured();
  const ids = (await publicClient.readContract({
    ...base(),
    functionName: "getTrackVoiceClones",
    args: [BigInt(trackId)],
  })) as bigint[];
  return ids.map((x) => Number(x));
}

export async function listRiddims(): Promise<RiddimView[]> {
  const { riddims } = await getCounts();
  const out = await Promise.all(
    Array.from({ length: riddims }, (_, i) => getRiddim(i + 1)),
  );
  return out.filter((x): x is RiddimView => x !== null);
}

export async function listVoiceClones(): Promise<VoiceCloneView[]> {
  const { voiceClones } = await getCounts();
  const out = await Promise.all(
    Array.from({ length: voiceClones }, (_, i) => getVoiceClone(i + 1)),
  );
  return out.filter((x): x is VoiceCloneView => x !== null);
}

/** Track + resolved riddims + attached voice clones (for the live dashboard). */
export async function getTrackFull(id: number) {
  const track = await getTrack(id);
  if (!track) return null;
  const [riddims, voiceCloneIds] = await Promise.all([
    Promise.all(track.riddimIds.map((rid) => getRiddim(rid))),
    getTrackVoiceCloneIds(id),
  ]);
  const voiceClones = await Promise.all(
    voiceCloneIds.map((vid) => getVoiceClone(vid)),
  );
  return {
    track,
    riddims: riddims.filter((x): x is RiddimView => x !== null),
    voiceClones: voiceClones.filter((x): x is VoiceCloneView => x !== null),
  };
}

export async function listTracks() {
  const { tracks } = await getCounts();
  const out = await Promise.all(
    Array.from({ length: tracks }, (_, i) => getTrack(i + 1)),
  );
  return out.filter((x): x is TrackView => x !== null);
}
