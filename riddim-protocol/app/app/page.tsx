"use client";

import Link from "next/link";
import { ArrowRight, Coins, Database, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { fetchJson } from "@/lib/api";
import { addressUrl, txUrl } from "@/lib/onchain/chain";
import { CONTRACT_ADDRESS, isContractConfigured, shortAddress } from "@/lib/onchain/config";

type RiddimView = {
  id: number;
  title: string;
  producer: string;
  components: Array<{ name: string; splitPercent: number }>;
};
type TrackView = { id: number; title: string; artist: string; totalTippedFormatted: string };
type VoiceView = { id: number; voiceName: string; royaltyPercent: number };
type Detection = {
  id: string;
  query_title: string;
  matched_riddim_title: string | null;
  similarity: number;
  confidence: "high" | "medium" | "none";
  status: string;
};
type Tip = {
  id: string;
  track_title: string;
  amount: number;
  tx_hash: string | null;
};

const REFRESH_MS = 15000;

export default function DashboardPage() {
  const deployed = isContractConfigured();
  const [riddims, setRiddims] = useState<RiddimView[]>([]);
  const [tracks, setTracks] = useState<TrackView[]>([]);
  const [voices, setVoices] = useState<VoiceView[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [r, t, v, d, tp] = await Promise.allSettled([
      fetchJson<{ riddims: RiddimView[] }>("/api/onchain/riddims"),
      fetchJson<{ tracks: TrackView[] }>("/api/onchain/tracks"),
      fetchJson<{ voiceClones: VoiceView[] }>("/api/onchain/voices"),
      fetchJson<{ detections: Detection[] }>("/api/detect"),
      fetchJson<{ tips: Tip[] }>("/api/tips"),
    ]);
    if (r.status === "fulfilled") setRiddims(r.value.riddims ?? []);
    if (t.status === "fulfilled") setTracks(t.value.tracks ?? []);
    if (v.status === "fulfilled") setVoices(v.value.voiceClones ?? []);
    if (d.status === "fulfilled") setDetections(d.value.detections ?? []);
    if (tp.status === "fulfilled") setTips(tp.value.tips ?? []);
    setUpdatedAt(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="app-layout" style={{ maxWidth: 1180 }}>
        <aside className="app-sidebar" style={{ paddingRight: 48 }}>
          <Link href="/" className="back-link">
            ← Back to protocol
          </Link>
          <div className="sidebar-kicker">CREATOR CONSOLE</div>
          <h1 style={{ fontSize: 54, lineHeight: 0.9, letterSpacing: "-0.08em", marginBottom: 18 }}>
            Make the
            <br />
            <em>rhythm</em>
            <br />
            count.
          </h1>
          <p style={{ maxWidth: 290 }}>
            Live registry state, read straight from the contract. The AI proposes
            reuse matches; every write is human-signed.
          </p>
          <div className="sidebar-proof" style={{ marginTop: 22 }}>
            {deployed ? "● Onchain · reading contract" : "● Offchain mode · DB only"}
          </div>
          {updatedAt && (
            <div className="mono muted" style={{ marginTop: 8 }}>
              Updated {updatedAt} · auto every 15s
            </div>
          )}
        </aside>

        <section className="app-content" style={{ flex: 1 }}>
          {/* action launcher */}
          <div className="console-grid" style={{ maxWidth: 900 }}>
            {[
              { href: "/register", icon: Database, label: "REGISTER RIDDIM", desc: `${riddims.length} registered` },
              { href: "/license", icon: ShieldCheck, label: "DETECT & LICENSE", desc: `${detections.length} AI proposals` },
              { href: "/voice", icon: Sparkles, label: "VOICE CLONES", desc: `${voices.length} registered` },
              { href: "/tip", icon: Coins, label: "TIP A TRACK", desc: `${tracks.length} tracks` },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="console-card action-card" style={{ minHeight: 130 }}>
                <div className="card-heading">
                  <div className="icon-tile">
                    <Icon size={18} />
                  </div>
                  <span className="mono muted">{label}</span>
                </div>
                <h3 style={{ fontSize: 18 }}>{desc}</h3>
                <span className="mono" style={{ color: "#f5a35b" }}>
                  Open <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>

          {/* riddims */}
          <div className="console-card panel-card" style={{ marginTop: 22, maxWidth: 900 }}>
            <div className="mono muted">REGISTERED RIDDIMS (onchain)</div>
            {riddims.length === 0 ? (
              <p>{deployed ? "No riddims registered yet." : "Deploy the contract to read onchain riddims."}</p>
            ) : (
              <div className="data-list">
                {riddims.map((r) => (
                  <div key={r.id} className="data-row">
                    <span>
                      <strong>#{r.id} {r.title}</strong>
                      <br />
                      <span className="mono muted">
                        {r.components.map((c) => `${c.name} ${c.splitPercent}%`).join(" · ")}
                      </span>
                    </span>
                    <span className="mono muted">{shortAddress(r.producer)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* tracks + voices side by side */}
          <div className="console-grid" style={{ marginTop: 16, maxWidth: 900 }}>
            <div className="console-card panel-card">
              <div className="mono muted">TRACKS (onchain)</div>
              {tracks.length === 0 ? (
                <p>No tracks licensed yet.</p>
              ) : (
                <div className="data-list">
                  {tracks.map((t) => (
                    <div key={t.id} className="data-row">
                      <span>#{t.id} {t.title}</span>
                      <span className="mono">{t.totalTippedFormatted} HSK</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="console-card panel-card">
              <div className="mono muted">VOICE CLONES (onchain)</div>
              {voices.length === 0 ? (
                <p>No voice clones yet.</p>
              ) : (
                <div className="data-list">
                  {voices.map((v) => (
                    <div key={v.id} className="data-row">
                      <span>#{v.id} {v.voiceName}</span>
                      <span className="mono">{v.royaltyPercent}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI detection log */}
          <div className="console-card panel-card" style={{ marginTop: 16, maxWidth: 900 }}>
            <div className="mono muted">AI DETECTION LOG · PROPOSALS ONLY (human confirms)</div>
            {detections.length === 0 ? (
              <p>No reuse checks run yet. Try one on the Detect &amp; License page.</p>
            ) : (
              <div className="data-list">
                {detections.slice(0, 6).map((d) => (
                  <div key={d.id} className="data-row">
                    <span>
                      {d.query_title}
                      {d.matched_riddim_title ? ` → ${d.matched_riddim_title}` : ""}
                    </span>
                    <span className={`confidence-badge confidence-${d.confidence}`}>
                      {d.confidence} · {d.similarity}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* recent tips */}
          <div className="console-card panel-card" style={{ marginTop: 16, maxWidth: 900 }}>
            <div className="mono muted">RECENT TIPS</div>
            {tips.length === 0 ? (
              <p>No tips yet.</p>
            ) : (
              <div className="data-list">
                {tips.slice(0, 6).map((t) => (
                  <div key={t.id} className="data-row">
                    <span>{t.track_title}</span>
                    <span className="mono">
                      {t.amount} HSK
                      {t.tx_hash && (
                        <>
                          {" · "}
                          <a className="tx-link" href={txUrl(t.tx_hash)} target="_blank" rel="noreferrer">
                            tx ↗
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {deployed && (
            <div className="mono muted" style={{ marginTop: 16, maxWidth: 900 }}>
              Contract{" "}
              <a className="tx-link" href={addressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer">
                {shortAddress(CONTRACT_ADDRESS)} ↗
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
