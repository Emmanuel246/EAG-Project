"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Address } from "viem";

import { AppHeader } from "@/components/app-header";
import { fetchJson } from "@/lib/api";
import { hskTestnet, txUrl } from "@/lib/onchain/chain";
import { ACTIVE_CHAIN_ID, isContractConfigured } from "@/lib/onchain/config";
import { getConnectedAccount, registerRiddim } from "@/lib/onchain/wallet";

type Row = { name: string; percent: string; wallet: string };

const emptyRow: Row = { name: "", percent: "", wallet: "" };

export default function RegisterPage() {
  const [title, setTitle] = useState("Lagos Nights");
  const [rows, setRows] = useState<Row[]>([
    { name: "drums", percent: "40", wallet: "" },
    { name: "melody", percent: "60", wallet: "" },
  ]);
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPercent = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.percent) || 0), 0),
    [rows],
  );
  const sumsTo100 = Math.round(totalPercent * 100) === 10000;
  const deployed = isContractConfigured();

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((cur) => cur.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((cur) => [...cur, { ...emptyRow }]);
  const removeRow = (i: number) =>
    setRows((cur) => (cur.length > 1 ? cur.filter((_, idx) => idx !== i) : cur));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTxHash(null);

    if (!title.trim()) return setStatus("A title is required.");
    if (!sumsTo100)
      return setStatus(`Splits must sum to exactly 100% (currently ${totalPercent}%).`);
    if (rows.some((r) => !r.name.trim() || !r.wallet.trim()))
      return setStatus("Every component needs a name and a payout wallet.");

    const components = rows.map((r) => ({
      name: r.name.trim(),
      share: Number(r.percent),
      splitBps: Math.round(Number(r.percent) * 100),
      payoutWallet: r.wallet.trim() as Address,
    }));

    setIsSubmitting(true);
    try {
      if (deployed) {
        setStatus("Confirm the registration in your wallet…");
        const { hash, riddimId } = await registerRiddim(
          title.trim(),
          components.map((c) => ({
            name: c.name,
            splitBps: c.splitBps,
            payoutWallet: c.payoutWallet,
          })),
        );
        setTxHash(hash);
        setStatus(`Registered onchain as riddim #${riddimId ?? "?"}. Saving mirror…`);
        const account = await getConnectedAccount();
        await fetchJson("/api/riddims", {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            producer_wallet: account,
            status: "registered",
            components: components.map((c) => ({
              name: c.name,
              share: c.share,
              wallet: c.payoutWallet,
            })),
            onchainRiddimId: riddimId,
            txHash: hash,
            chainId: ACTIVE_CHAIN_ID,
          }),
        });
        setStatus(`Riddim #${riddimId ?? "?"} registered and mirrored.`);
      } else {
        await fetchJson("/api/riddims", {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            status: "registered",
            components: components.map((c) => ({
              name: c.name,
              share: c.share,
              wallet: c.payoutWallet,
            })),
          }),
        });
        setStatus("Recorded offchain (contract not deployed yet).");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
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
          <div className="sidebar-kicker">REGISTER</div>
          <h1>
            Register the
            <br />
            <em>beat.</em>
          </h1>
          <p>
            Split ownership across components. The contract requires the shares
            to sum to exactly 100% — enforced onchain.
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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lagos Nights"
              />
            </label>

            <div className="mono muted" style={{ marginTop: 4 }}>
              COMPONENTS · OWNERSHIP SPLIT
            </div>
            {rows.map((row, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
              >
                <input
                  style={{ flex: "1 1 120px" }}
                  value={row.name}
                  onChange={(e) => setRow(i, { name: e.target.value })}
                  placeholder="component (e.g. drums)"
                />
                <input
                  style={{ width: 90 }}
                  type="number"
                  value={row.percent}
                  onChange={(e) => setRow(i, { percent: e.target.value })}
                  placeholder="%"
                />
                <input
                  style={{ flex: "2 1 220px" }}
                  value={row.wallet}
                  onChange={(e) => setRow(i, { wallet: e.target.value })}
                  placeholder="0x payout wallet"
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => removeRow(i)}
                  aria-label="Remove component"
                >
                  ✕
                </button>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="ghost-button" onClick={addRow}>
                + Add component
              </button>
              <span
                className="mono"
                style={{ color: sumsTo100 ? "#7CFFB2" : "#f7b7a2" }}
              >
                TOTAL: {totalPercent}% {sumsTo100 ? "✓" : "(must be 100%)"}
              </span>
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting || !sumsTo100}
            >
              {isSubmitting
                ? "Submitting…"
                : deployed
                  ? "Register riddim (sign in wallet)"
                  : "Register riddim (offchain)"}
            </button>
            {status && <div className="mono muted">{status}</div>}
            {txHash && (
              <a
                className="mono"
                href={txUrl(txHash, hskTestnet.id)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#f5a35b" }}
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
