"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { fetchJson } from "@/lib/api";
import { parseRiddimRegistration } from "@/lib/riddim";

const seedRiddims = [
  {
    id: 1,
    title: "Afro Vibes",
    components: [
      { name: "drums", share: 40, wallet: "0xAlice" },
      { name: "melody", share: 60, wallet: "0xBob" },
    ],
  },
  {
    id: 2,
    title: "Amapiano Echo",
    components: [
      { name: "kick", share: 35, wallet: "0xSeyi" },
      { name: "keys", share: 45, wallet: "0xMaya" },
      { name: "hook", share: 20, wallet: "0xIfe" },
    ],
  },
];

export default function RegisterPage() {
  const [title, setTitle] = useState("Afro Vibes");
  const [rawInput, setRawInput] = useState(
    "Afro Vibes|drums:40:0xAlice|melody:60:0xBob",
  );
  const [saved, setSaved] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(() => {
    try {
      return parseRiddimRegistration(rawInput);
    } catch {
      return null;
    }
  }, [rawInput]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const registration = preview ?? {
      title: title || "Untitled riddim",
      components: [],
    };
    const item = `${registration.title} (${registration.components.length} components)`;

    setIsSubmitting(true);
    setStatus("Submitting registration...");

    try {
      await fetchJson("/api/riddims", {
        method: "POST",
        body: JSON.stringify({
          title: registration.title,
          producer_wallet: "0xDemoProducer",
          status: "registered",
          components: registration.components,
        }),
      });

      setSaved((current) => [item, ...current].slice(0, 5));
      setStatus("Registration synced successfully.");
    } catch {
      setSaved((current) => [item, ...current].slice(0, 5));
      setStatus("Registration saved in demo mode.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="sidebar-kicker">REGISTER</div>
          <h1>
            Register the
            <br />
            <em>beat.</em>
          </h1>
          <p>
            Submit a riddim title and format component ownership as each
            segment’s wallet and percentage split.
          </p>
        </aside>

        <section className="app-content">
          <div className="app-intro">
            <div>
              <span className="section-label">RIDDIM REGISTRY</span>
              <h2>New registration</h2>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              Riddim title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Afro Vibes"
              />
            </label>

            <label>
              Registration payload
              <textarea
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                rows={6}
                placeholder="Afro Vibes|drums:40:0xAlice|melody:60:0xBob"
              />
            </label>

            <div className="preview-card">
              <div className="mono muted">PREVIEW</div>
              {preview ? (
                <>
                  <strong>{preview.title}</strong>
                  <ul>
                    {preview.components.map((component) => (
                      <li key={`${component.name}-${component.wallet}`}>
                        {component.name}: {component.share}% →{" "}
                        {component.wallet}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>Enter a valid registration string to preview the split.</p>
              )}
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Register riddim"}
            </button>
            {status && <div className="mono muted">{status}</div>}
          </form>

          <div className="console-card panel-card stacked">
            <div className="mono muted">RECENT REGISTRATIONS</div>
            {saved.length === 0 ? (
              <p>No registrations yet. Use the demo payload to see the flow.</p>
            ) : (
              <ul className="saved-list">
                {saved.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="console-grid demo-grid">
            {seedRiddims.map((riddim) => (
              <article key={riddim.id} className="console-card action-card">
                <span className="mono muted">RIDDIM #{riddim.id}</span>
                <h3>{riddim.title}</h3>
                <p>
                  {riddim.components
                    .map((component) => `${component.name} ${component.share}%`)
                    .join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
