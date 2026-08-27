"use client";

import Link from "next/link";
import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { fetchJson } from "@/lib/api";
import { hskTestnet, txUrl } from "@/lib/onchain/chain";
import { ACTIVE_CHAIN_ID, isContractConfigured } from "@/lib/onchain/config";
import { getConnectedAccount, licenseRiddim } from "@/lib/onchain/wallet";

type DetectResponse = {
  result: {
    queryTitle: string;
    similarity: number;
    confidence: "high" | "medium" | "none";
    recommendation: string;
    bestMatch: { riddimId: number; title: string; artist: string; similarity: number } | null;
    ranked: Array<{ riddimId: number; title: string; similarity: number }>;
  };
  proposal: {
    autoSubmit: false;
    riddimId: number;
    matchedTitle: string;
    similarityPercent: number;
    confidence: string;
    message: string;
  } | null;
  autoSubmitted: boolean;
};

const samples = ["Lagos Nights (Refix)", "Sunrise Blend", "Original Composition"];

export default function LicensePage() {
  const deployed = isContractConfigured();

  // --- detection state ---
  const [query, setQuery] = useState("Lagos Nights (Refix)");
  const [detecting, setDetecting] = useState(false);
  const [detection, setDetection] = useState<DetectResponse | null>(null);

  // --- license form state ---
  const [trackTitle, setTrackTitle] = useState("");
  const [riddimId, setRiddimId] = useState("");
  const [fromProposal, setFromProposal] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [licensing, setLicensing] = useState(false);

  const runDetection = async () => {
    setDetecting(true);
    setDetection(null);
    try {
      const res = await fetchJson<DetectResponse>("/api/detect", {
        method: "POST",
        body: JSON.stringify({ title: query }),
      });
      setDetection(res);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Detection failed.");
    } finally {
      setDetecting(false);
    }
  };

  const useProposal = () => {
    if (!detection?.proposal) return;
    setRiddimId(String(detection.proposal.riddimId));
    setTrackTitle(`${detection.proposal.matchedTitle} (licensed)`);
    setFromProposal(true);
    setStatus("Proposal loaded into the form. Review, then confirm in your wallet.");
  };

  const submitLicense = async (event: React.FormEvent) => {
    event.preventDefault();
    setTxHash(null);
    const rid = Number(riddimId);
    if (!trackTitle.trim()) return setStatus("Track title is required.");
    if (!Number.isInteger(rid) || rid <= 0)
      return setStatus("A valid riddim id is required.");

    setLicensing(true);
    try {
      let hash: string | null = null;
      let trackId: number | null = null;

      if (deployed) {
        setStatus("Confirm the license in your wallet…");
        const res = await licenseRiddim(trackTitle.trim(), rid);
        hash = res.hash;
        trackId = res.trackId;
        setTxHash(hash);
        const account = await getConnectedAccount();
        await fetchJson("/api/tracks", {
          method: "POST",
          body: JSON.stringify({
            title: trackTitle.trim(),
            artist_wallet: account,
            riddim_ids: [rid],
            onchain_track_id: trackId,
            txHash: hash,
            chainId: ACTIVE_CHAIN_ID,
          }),
        });
      }

      await fetchJson("/api/licenses", {
        method: "POST",
        body: JSON.stringify({
          trackTitle: trackTitle.trim(),
          riddimId: rid,
          trackId,
          similarity: detection?.result.similarity
            ? Math.round(detection.result.similarity * 1000) / 10
            : undefined,
          proposedBy: fromProposal ? "ai" : "human",
          txHash: hash,
          chainId: deployed ? ACTIVE_CHAIN_ID : undefined,
        }),
      });

      setStatus(
        deployed
          ? `Track #${trackId ?? "?"} licensed onchain and recorded.`
          : "License recorded offchain (contract not deployed yet).",
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Licensing failed.");
    } finally {
      setLicensing(false);
    }
  };

  const r = detection?.result;

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="app-layout narrow">
        <aside className="app-sidebar">
          <Link href="/app" className="back-link">
            ← Back to console
          </Link>
          <div className="sidebar-kicker">DETECT · LICENSE</div>
          <h1>
            Confirm the
            <br />
            <em>reuse.</em>
          </h1>
          <p>
            The AI similarity check <strong>proposes</strong> a match. It never
            licenses anything — you review the proposal and sign the license in
            your own wallet.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">STEP 1 · AI DETECTION</span>
              <h2>Similarity check</h2>
            </div>
          </div>

          <div className="console-card panel-card">
            <label className="mono muted">CANDIDATE TRACK TITLE</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {samples.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="ghost-button"
                  onClick={() => setQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="button-primary"
              style={{ marginTop: 14 }}
              onClick={runDetection}
              disabled={detecting}
            >
              {detecting ? "Analyzing…" : "Run reuse check"}
            </button>
          </div>

          {r && (
            <div className="console-card panel-card" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono muted">DETECTION RESULT · ADVISORY ONLY</span>
                <span className={`confidence-badge confidence-${r.confidence}`}>
                  {r.confidence} · {Math.round(r.similarity * 1000) / 10}%
                </span>
              </div>
              <h3 style={{ marginTop: 10 }}>
                {r.bestMatch
                  ? `Closest match: ${r.bestMatch.title}`
                  : "No confident match found"}
              </h3>
              <p>
                {r.bestMatch
                  ? `Riddim #${r.bestMatch.riddimId} by ${r.bestMatch.artist}.`
                  : "This track does not resemble any registered riddim above the review threshold."}
              </p>

              {detection?.proposal && (
                <div className="proposal-card">
                  <span className="proposal-tag">🤖 AI PROPOSAL — NOT SUBMITTED</span>
                  <p style={{ margin: "6px 0 12px" }}>{detection.proposal.message}</p>
                  <button type="button" className="button-primary" onClick={useProposal}>
                    Use this proposal →
                  </button>
                  <div className="mono muted" style={{ marginTop: 10 }}>
                    Loads the form below. You still confirm and sign.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="app-intro" style={{ marginTop: 28 }}>
            <div>
              <span className="section-label">STEP 2 · HUMAN-CONFIRMED LICENSE</span>
              <h2>License riddim into a track</h2>
            </div>
          </div>

          <form className="register-form" onSubmit={submitLicense}>
            {fromProposal && (
              <div className="mono" style={{ color: "#f5a35b" }}>
                ✓ Pre-filled from an AI proposal — you are confirming it.
              </div>
            )}
            <label>
              New track title
              <input
                value={trackTitle}
                onChange={(e) => {
                  setTrackTitle(e.target.value);
                  setFromProposal(false);
                }}
                placeholder="Lagos Nights (licensed)"
              />
            </label>
            <label>
              Riddim id to license
              <input
                type="number"
                value={riddimId}
                onChange={(e) => {
                  setRiddimId(e.target.value);
                  setFromProposal(false);
                }}
                placeholder="1"
              />
            </label>
            <button type="submit" className="button-primary" disabled={licensing}>
              {licensing
                ? "Submitting…"
                : deployed
                  ? "License in wallet (sign)"
                  : "License (offchain)"}
            </button>
            {status && <div className="mono muted">{status}</div>}
            {txHash && (
              <a
                className="tx-link"
                href={txUrl(txHash, hskTestnet.id)}
                target="_blank"
                rel="noreferrer"
              >
                View transaction ↗
              </a>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
