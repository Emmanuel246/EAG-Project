"use client";

import Link from "next/link";
import { ArrowRight, Music4, Radio, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { fetchJson } from "@/lib/api";

type Adapter = { name: string; label: string; type: string; description: string; icon: typeof Music4 };

const ADAPTERS: Adapter[] = [
  {
    name: "audiomack",
    label: "Audiomack",
    type: "creator metadata sync",
    description: "Ingest artist and track metadata, then map it into a rights-aware license record.",
    icon: Music4,
  },
  {
    name: "spotify",
    label: "Spotify",
    type: "rights verification",
    description: "Normalize track ownership and derivative-use metadata into the protocol registry.",
    icon: Radio,
  },
  {
    name: "boomplay",
    label: "Boomplay",
    type: "payout reconciliation",
    description: "Align revenue and usage events with the split engine for payout reconciliation.",
    icon: ShieldCheck,
  },
];

type PlatformRow = {
  id?: string;
  platform: string;
  external_track_id: string;
  title: string;
  artist: string;
  usage_type?: string;
  license_status?: string;
  source_url?: string | null;
  last_synced_at?: string;
};

export default function IntegrationsPage() {
  const [records, setRecords] = useState<PlatformRow[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchJson<{ records: PlatformRow[] }>("/api/platforms");
      setRecords(res.records ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sync = async (platform: string) => {
    setSyncing(platform);
    setStatus(null);
    try {
      const res = await fetchJson<{ record: PlatformRow }>("/api/platforms", {
        method: "POST",
        body: JSON.stringify({ platform }),
      });
      setStatus(`Synced "${res.record.title}" from ${platform} into the rights registry.`);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setSyncing(null);
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
            {ADAPTERS.map(({ name, label, type, description, icon: Icon }) => (
              <article key={name} className="console-card action-card" style={{ minHeight: 210 }}>
                <div className="card-heading">
                  <div className="icon-tile">
                    <Icon size={18} />
                  </div>
                  <span className="mono muted">{type}</span>
                </div>
                <h3>{label}</h3>
                <p>{description}</p>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => sync(name)}
                  disabled={syncing !== null}
                  style={{ marginTop: "auto" }}
                >
                  {syncing === name ? "Syncing…" : "Sync a track"}
                </button>
              </article>
            ))}
          </div>

          {status && (
            <div className="mono muted" style={{ marginTop: 16 }}>
              {status}
            </div>
          )}

          <div className="console-card panel-card" style={{ marginTop: 20 }}>
            <div className="mono muted">SYNCED RIGHTS RECORDS (canonical schema)</div>
            {records.length === 0 ? (
              <p>
                No records yet. Run a sync above — each adapter maps external
                track metadata into one shared rights record.
              </p>
            ) : (
              <div className="data-list">
                {records.map((rec) => (
                  <div key={rec.id ?? `${rec.platform}-${rec.external_track_id}`} className="data-row">
                    <span>
                      <strong>{rec.title}</strong> — {rec.artist}
                      <br />
                      <span className="mono muted">
                        {rec.platform} · {rec.external_track_id}
                      </span>
                    </span>
                    <span className="mono muted">
                      {rec.usage_type} · {rec.license_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="console-card panel-card" style={{ marginTop: 16 }}>
            <div className="mono muted">ADAPTER PATTERN</div>
            <h3>Normalize every platform into a shared rights model</h3>
            <p>
              Each platform adapter maps track IDs, artist metadata, usage data,
              and royalty terms into one canonical schema. The rights engine then
              decides whether a usage is registered, licensed, or pending review.
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            <Link href="/app" className="button-primary">
              Back to console <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
