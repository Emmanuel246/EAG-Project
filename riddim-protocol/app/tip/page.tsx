"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { fetchJson } from "@/lib/api";
import { hskTestnet, txUrl } from "@/lib/onchain/chain";
import { ACTIVE_CHAIN_ID, isContractConfigured } from "@/lib/onchain/config";
import { computeTipSplit } from "@/lib/onchain/split";
import { getConnectedAccount, tipTrack } from "@/lib/onchain/wallet";

type TrackFull = {
  track: { id: number; title: string; artist: string; totalTippedFormatted: string };
  riddims: Array<{
    title: string;
    components: Array<{ name: string; splitBps: number; payoutWallet: string }>;
  }>;
  voiceClones: Array<{ voiceName: string; royaltyRateBps: number; payoutWallet: string }>;
};

export default function TipPage() {
  const deployed = isContractConfigured();

  const [trackId, setTrackId] = useState("1");
  const [amount, setAmount] = useState("1");
  const [track, setTrack] = useState<TrackFull | null>(null);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadTrack = async () => {
    setTrack(null);
    setLoadStatus(null);
    const tid = Number(trackId);
    if (!Number.isInteger(tid) || tid <= 0) return setLoadStatus("Enter a valid track id.");
    if (!deployed) return setLoadStatus("Contract not deployed — load requires onchain data.");
    try {
      const res = await fetchJson<{ configured: boolean } & Partial<TrackFull>>(
        `/api/onchain/track/${tid}`,
      );
      if (!res.track) return setLoadStatus(`Track #${tid} not found onchain.`);
      setTrack(res as TrackFull);
    } catch (e) {
      setLoadStatus(e instanceof Error ? e.message : "Failed to load track.");
    }
  };

  const preview = useMemo(() => {
    if (!track) return null;
    return computeTipSplit(
      amount,
      track.riddims.map((r) => ({
        title: r.title,
        components: r.components.map((c) => ({
          name: c.name,
          splitBps: c.splitBps,
          payoutWallet: c.payoutWallet,
        })),
      })),
      track.voiceClones.map((v) => ({
        voiceName: v.voiceName,
        royaltyRateBps: v.royaltyRateBps,
        payoutWallet: v.payoutWallet,
      })),
    );
  }, [track, amount]);

  const sendTip = async () => {
    setTxHash(null);
    const tid = Number(trackId);
    if (!Number.isInteger(tid) || tid <= 0) return setStatus("Enter a valid track id.");
    if (!(Number(amount) > 0)) return setStatus("Tip amount must be greater than 0.");
    if (!deployed) return setStatus("Tipping requires the deployed contract (onchain-only).");

    setSending(true);
    try {
      setStatus("Confirm the tip in your wallet… the split executes onchain.");
      const res = await tipTrack(tid, amount);
      setTxHash(res.hash);
      const account = await getConnectedAccount();
      await fetchJson("/api/tips", {
        method: "POST",
        body: JSON.stringify({
          trackTitle: track?.track.title ?? `Track #${tid}`,
          trackId: tid,
          amount: Number(amount),
          tipper: account,
          split:
            preview?.lines.map((l) => ({
              wallet: l.wallet,
              share: l.share,
              amount: Number(l.amountHsk),
            })) ?? [],
          txHash: res.hash,
          chainId: ACTIVE_CHAIN_ID,
        }),
      });
      setStatus(`Tip sent and split across ${preview?.lines.length ?? 0} wallets.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Tip failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="app-layout narrow">
        <aside className="app-sidebar">
          <Link href="/app" className="back-link">
            ← Back to console
          </Link>
          <div className="sidebar-kicker">TIP</div>
          <h1>
            Send support.
            <br />
            <em>See it split.</em>
          </h1>
          <p>
            The contract splits your tip onchain: voice-clone royalties come off
            the top, then the remainder flows to every riddim component owner.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">FAN SUPPORT</span>
              <h2>Tip a track</h2>
            </div>
          </div>

          <div className="console-card panel-card">
            <label className="mono muted">TRACK ID</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
              <button type="button" className="ghost-button" onClick={loadTrack}>
                Load
              </button>
            </div>
            {loadStatus && (
              <div className="mono muted" style={{ marginTop: 10 }}>
                {loadStatus}
              </div>
            )}
            {track && (
              <div style={{ marginTop: 12 }}>
                <h3>{track.track.title}</h3>
                <p className="mono muted">
                  {track.riddims.length} riddim(s) · {track.voiceClones.length} voice
                  clone(s) · {track.track.totalTippedFormatted} HSK tipped so far
                </p>
              </div>
            )}
          </div>

          <div className="console-card panel-card" style={{ marginTop: 16 }}>
            <label className="mono muted">TIP AMOUNT (HSK)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="button"
              className="button-primary"
              style={{ marginTop: 12 }}
              onClick={sendTip}
              disabled={sending}
            >
              {sending ? "Sending…" : "Send tip (sign in wallet)"}
            </button>
            {status && (
              <div className="mono muted" style={{ marginTop: 12 }}>
                {status}
              </div>
            )}
            {txHash && (
              <a
                className="tx-link"
                href={txUrl(txHash, hskTestnet.id)}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", marginTop: 8 }}
              >
                View transaction ↗
              </a>
            )}
          </div>

          {preview && (
            <div className="console-card panel-card" style={{ marginTop: 16 }}>
              <div className="mono muted">SPLIT PREVIEW (mirrors the contract)</div>
              <div className="data-list">
                {preview.lines.map((l, i) => (
                  <div key={i} className="data-row">
                    <span>
                      {l.kind === "voice" ? "🎤 " : ""}
                      {l.label}
                      <br />
                      <span className="mono muted">{l.wallet}</span>
                    </span>
                    <span className="mono">
                      {l.amountHsk} HSK · {l.share}%
                    </span>
                  </div>
                ))}
              </div>
              {Number(preview.dustHsk) > 0 && (
                <div className="mono muted" style={{ marginTop: 10 }}>
                  Rounding dust retained by contract: {preview.dustHsk} HSK
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
