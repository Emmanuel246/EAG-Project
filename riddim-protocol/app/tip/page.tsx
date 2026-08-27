"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { fetchJson } from "@/lib/api";
import { calculateSplit } from "@/lib/riddim";

const track = {
  id: 1,
  title: "Afro Riddim 01",
  contributors: [
    { wallet: "0xAlice", share: 52 },
    { wallet: "0xBob", share: 28 },
    { wallet: "0xIfe", share: 20 },
  ],
};

export default function TipPage() {
  const [amount, setAmount] = useState(10);
  const [tipSent, setTipSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const split = useMemo(
    () => calculateSplit(amount, track.contributors),
    [amount],
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
          <div className="sidebar-kicker">TIP</div>
          <h1>
            Send support.
            <br />
            <em>See it split.</em>
          </h1>
          <p>
            Fans tip a track and the revenue is routed according to the
            registered component distribution.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">FAN SUPPORT</span>
              <h2>{track.title}</h2>
            </div>
          </div>

          <div className="console-card panel-card">
            <div className="mono muted">TIP AMOUNT</div>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value) || 0)}
            />
            <button
              className="button-primary"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setStatus("Sending tip...");

                try {
                  await fetchJson("/api/tips", {
                    method: "POST",
                    body: JSON.stringify({
                      trackTitle: track.title,
                      amount,
                    }),
                  });

                  setTipSent(true);
                  setStatus("Tip processed and split synced.");
                } catch {
                  setTipSent(true);
                  setStatus("Tip processed in demo mode.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {tipSent ? "Tip sent" : isSubmitting ? "Sending..." : "Send tip"}
            </button>
            {status && (
              <div className="mono muted" style={{ marginTop: 12 }}>
                {status}
              </div>
            )}
          </div>

          <div className="console-card panel-card">
            <div className="mono muted">AUTO-SPLIT</div>
            <ul className="saved-list">
              {split.map((entry) => (
                <li key={entry.wallet}>
                  {entry.wallet}: {entry.share}% → {entry.amount} HSK
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
