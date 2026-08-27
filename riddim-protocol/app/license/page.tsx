"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { fetchJson } from "@/lib/api";

const matches = [
  { id: 1, title: "Afro Vibes", producer: "Alice", similarity: 97.2 },
  { id: 2, title: "Amapiano Echo", producer: "Seyi", similarity: 92.5 },
];

export default function LicensePage() {
  const [selectedId, setSelectedId] = useState<number>(matches[0].id);
  const [approved, setApproved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(
    () => matches.find((match) => match.id === selectedId) ?? matches[0],
    [selectedId],
  );

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
          <div className="sidebar-kicker">LICENSE</div>
          <h1>
            Confirm the
            <br />
            <em>reuse.</em>
          </h1>
          <p>
            AI suggests likely matches; the license action is explicit and
            human-approved before any split is applied.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">AI DETECTION</span>
              <h2>Similarity review</h2>
            </div>
          </div>

          <div className="console-grid demo-grid">
            {matches.map((match) => (
              <button
                key={match.id}
                className={`console-card action-card ${selectedId === match.id ? "selected" : ""}`}
                onClick={() => setSelectedId(match.id)}
              >
                <span className="mono muted">MATCH #{match.id}</span>
                <h3>{match.title}</h3>
                <p>Producer: {match.producer}</p>
                <strong>{match.similarity}% similarity</strong>
              </button>
            ))}
          </div>

          <div className="console-card panel-card">
            <div className="mono muted">PROPOSED LICENSE</div>
            <h3>
              {selected.title} by {selected.producer}
            </h3>
            <p>Similarity score: {selected.similarity}%</p>
            <p>
              Suggested action: license this riddim into a new track and trigger
              a standard creator split.
            </p>
            <button
              className="button-primary"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setStatus("Approving license...");

                try {
                  await fetchJson("/api/licenses", {
                    method: "POST",
                    body: JSON.stringify({
                      trackTitle: `${selected.title} Remix`,
                      producer: selected.producer,
                      similarity: selected.similarity,
                    }),
                  });

                  setApproved(true);
                  setStatus("License approved and synced.");
                } catch {
                  setApproved(true);
                  setStatus("License approved in demo mode.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {approved
                ? "License approved"
                : isSubmitting
                  ? "Approving..."
                  : "Approve license"}
            </button>
            {status && (
              <div className="mono muted" style={{ marginTop: 12 }}>
                {status}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
