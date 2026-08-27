"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Address } from "viem";

import { AppHeader } from "@/components/app-header";
import { fetchJson } from "@/lib/api";
import { hskTestnet, txUrl } from "@/lib/onchain/chain";
import { ACTIVE_CHAIN_ID, isContractConfigured } from "@/lib/onchain/config";
import {
  attachVoiceClone,
  getConnectedAccount,
  registerVoiceClone,
} from "@/lib/onchain/wallet";

type VoiceRow = {
  id: string;
  voice_name: string;
  royalty_bps: number;
  payout_wallet: string;
  onchain_voice_id: number | null;
};

export default function VoicePage() {
  const deployed = isContractConfigured();

  const [voiceName, setVoiceName] = useState("Layi-voice");
  const [royalty, setRoyalty] = useState("10");
  const [payout, setPayout] = useState("");
  const [regStatus, setRegStatus] = useState<string | null>(null);
  const [regTx, setRegTx] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const [trackId, setTrackId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [attStatus, setAttStatus] = useState<string | null>(null);
  const [attTx, setAttTx] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);

  const [voices, setVoices] = useState<VoiceRow[]>([]);

  const loadVoices = async () => {
    try {
      const res = await fetchJson<{ voiceClones: VoiceRow[] }>("/api/voice-clones");
      setVoices(res.voiceClones ?? []);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    loadVoices();
  }, []);

  const royaltyPct = Number(royalty) || 0;
  const royaltyValid = royaltyPct > 0 && royaltyPct <= 50;

  const submitRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegTx(null);
    if (!voiceName.trim()) return setRegStatus("Voice name is required.");
    if (!royaltyValid) return setRegStatus("Royalty must be between 1% and 50% (onchain cap).");
    if (!payout.trim()) return setRegStatus("A payout wallet is required.");

    const bps = Math.round(royaltyPct * 100);
    setRegistering(true);
    try {
      let hash: string | null = null;
      let onchainVoiceId: number | null = null;
      const account = await (deployed ? getConnectedAccount() : Promise.resolve(null));

      if (deployed) {
        setRegStatus("Confirm voice registration in your wallet…");
        const res = await registerVoiceClone(voiceName.trim(), bps, payout.trim() as Address);
        hash = res.hash;
        onchainVoiceId = res.voiceCloneId;
        setRegTx(hash);
      }

      await fetchJson("/api/voice-clones", {
        method: "POST",
        body: JSON.stringify({
          voice_name: voiceName.trim(),
          artist_wallet: account,
          royalty_bps: bps,
          payout_wallet: payout.trim(),
          onchain_voice_id: onchainVoiceId,
          tx_hash: hash,
          chain_id: deployed ? ACTIVE_CHAIN_ID : null,
        }),
      });
      setRegStatus(
        deployed
          ? `Voice clone #${onchainVoiceId ?? "?"} registered (${royaltyPct}% royalty).`
          : `Recorded offchain (${royaltyPct}% royalty).`,
      );
      loadVoices();
    } catch (e) {
      setRegStatus(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const submitAttach = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttTx(null);
    const tid = Number(trackId);
    const vid = Number(voiceId);
    if (!Number.isInteger(tid) || tid <= 0) return setAttStatus("Valid track id required.");
    if (!Number.isInteger(vid) || vid <= 0) return setAttStatus("Valid voice id required.");
    if (!deployed)
      return setAttStatus("Attaching requires the deployed contract (onchain-only action).");

    setAttaching(true);
    try {
      setAttStatus("Confirm attach in your wallet… (only the voice owner can attach)");
      const res = await attachVoiceClone(tid, vid);
      setAttTx(res.hash);
      setAttStatus(`Voice #${vid} attached to track #${tid}.`);
    } catch (e) {
      // Surfaces the onchain "not your voice" revert to the user.
      setAttStatus(e instanceof Error ? e.message : "Attach failed.");
    } finally {
      setAttaching(false);
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
          <div className="sidebar-kicker">VOICE CLONES</div>
          <h1>
            License the
            <br />
            <em>voice.</em>
          </h1>
          <p>
            A voice clone is a first-class licensed asset. Royalty is capped at
            50% onchain, and only the owner can attach their voice to a track.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">STEP 1 · REGISTER CONSENT</span>
              <h2>Register a voice clone</h2>
            </div>
          </div>

          <form className="register-form" onSubmit={submitRegister}>
            <label>
              Voice name
              <input value={voiceName} onChange={(e) => setVoiceName(e.target.value)} />
            </label>
            <label>
              Royalty rate (% of every tip — max 50%)
              <input
                type="number"
                value={royalty}
                onChange={(e) => setRoyalty(e.target.value)}
              />
            </label>
            <label>
              Payout wallet
              <input
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
                placeholder="0x…"
              />
            </label>
            <span className="mono" style={{ color: royaltyValid ? "#7cffb2" : "#f7b7a2" }}>
              {royaltyValid ? `${royaltyPct}% ✓` : "Royalty must be 1–50%"}
            </span>
            <button type="submit" className="button-primary" disabled={registering || !royaltyValid}>
              {registering ? "Submitting…" : deployed ? "Register voice (sign)" : "Register (offchain)"}
            </button>
            {regStatus && <div className="mono muted">{regStatus}</div>}
            {regTx && (
              <a className="tx-link" href={txUrl(regTx, hskTestnet.id)} target="_blank" rel="noreferrer">
                View transaction ↗
              </a>
            )}
          </form>

          <div className="app-intro" style={{ marginTop: 28 }}>
            <div>
              <span className="section-label">STEP 2 · ATTACH</span>
              <h2>Attach a voice to a track</h2>
            </div>
          </div>

          <form className="register-form" onSubmit={submitAttach}>
            <label>
              Track id
              <input type="number" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
            </label>
            <label>
              Voice clone id
              <input type="number" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} />
            </label>
            <button type="submit" className="button-primary" disabled={attaching}>
              {attaching ? "Submitting…" : "Attach voice (sign)"}
            </button>
            {attStatus && <div className="mono muted">{attStatus}</div>}
            {attTx && (
              <a className="tx-link" href={txUrl(attTx, hskTestnet.id)} target="_blank" rel="noreferrer">
                View transaction ↗
              </a>
            )}
          </form>

          <div className="console-card panel-card" style={{ marginTop: 24 }}>
            <div className="mono muted">REGISTERED VOICE CLONES</div>
            {voices.length === 0 ? (
              <p>No voice clones yet.</p>
            ) : (
              <div className="data-list">
                {voices.map((v) => (
                  <div key={v.id} className="data-row">
                    <span>
                      {v.voice_name}
                      {v.onchain_voice_id ? ` · #${v.onchain_voice_id}` : ""}
                    </span>
                    <span className="mono">{(v.royalty_bps / 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
