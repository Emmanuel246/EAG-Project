"use client";

import Link from "next/link";
import { ArrowRight, Music4, Radio, ShieldCheck, Sparkles } from "lucide-react";

const integrations = [
  {
    name: "Audiomack",
    type: "creator metadata sync",
    status: "ready",
    description:
      "Ingest artist and track metadata, then map it into a rights-aware license record.",
    icon: Music4,
  },
  {
    name: "Spotify",
    type: "rights verification",
    status: "adapter ready",
    description:
      "Normalize track ownership and derivative-use metadata into the protocol registry.",
    icon: Radio,
  },
  {
    name: "Boomplay",
    type: "payout reconciliation",
    status: "demo sync",
    description:
      "Align revenue and usage events with the split engine for payout reconciliation.",
    icon: ShieldCheck,
  },
];

export default function IntegrationsPage() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <Link href="/" className="landing-brand">
          <span className="landing-mark">
            <span>R</span>
            <i />
          </span>
          <span>
            RIDDIM<small>PROTOCOL</small>
          </span>
        </Link>
        <div className="app-network">
          <i /> HSK TESTNET · 177
        </div>
      </header>

      <div className="app-layout narrow">
        <aside className="app-sidebar">
          <Link href="/app" className="back-link">
            ← Back to console
          </Link>
          <div className="sidebar-kicker">INTEGRATIONS</div>
          <h1>
            Connect the <em>ecosystem.</em>
          </h1>
          <p>
            Platform adapters normalize provider data into one rights registry
            so every music service speaks the same language.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">EXTERNAL PLATFORMS</span>
              <h2>Music distribution adapters</h2>
            </div>
          </div>

          <div className="console-grid" style={{ maxWidth: 760 }}>
            {integrations.map(
              ({ name, type, status, description, icon: Icon }) => (
                <article
                  key={name}
                  className="console-card action-card"
                  style={{ minHeight: 220 }}
                >
                  <div className="card-heading">
                    <div className="icon-tile">
                      <Icon size={18} />
                    </div>
                    <span className="mono muted">{type}</span>
                  </div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <span className="mono muted">STATUS: {status}</span>
                </article>
              ),
            )}
          </div>

          <div className="console-card panel-card">
            <div className="mono muted">ADAPTER PATTERN</div>
            <h3>Normalize every platform into a shared rights model</h3>
            <p>
              Each platform adapter maps track IDs, artist metadata, usage data,
              and royalty terms into one canonical schema. The rights engine
              then decides whether a usage is registered, licensed, or pending
              review.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                color: "#f5a35b",
              }}
            >
              <Sparkles size={13} /> Reuse detection, licensing, and payout
              routing can all attach to that normalized record.
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Link href="/app" className="button-primary">
              Back to console <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
