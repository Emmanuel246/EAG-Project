"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Coins,
  Database,
  Fingerprint,
  Music2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchJson } from "@/lib/api";

const tabs = ["Overview", "Registry", "Licensing", "Tips"] as const;

type TabName = (typeof tabs)[number];

type DashboardOverview = {
  riddims: Array<{
    id: string;
    title: string;
    components?: Array<{ name: string; share: number; wallet: string }>;
  }>;
  licenses: Array<{
    id: string;
    trackTitle: string;
    similarity: number;
    producer: string;
    status: string;
  }>;
  tips: Array<{
    id: string;
    trackTitle: string;
    amount: number;
    split?: Array<{ wallet: string; share: number; amount: number }>;
  }>;
};

const defaultOverview: DashboardOverview = {
  riddims: [
    {
      id: "demo-riddim-1",
      title: "Afro Riddim 01",
      components: [
        { name: "drums", share: 52, wallet: "0xAlice" },
        { name: "melody", share: 28, wallet: "0xBob" },
        { name: "hook", share: 20, wallet: "0xIfe" },
      ],
    },
  ],
  licenses: [
    {
      id: "license-1",
      trackTitle: "Afro Vibes Remix",
      similarity: 97.2,
      producer: "Alice",
      status: "approved",
    },
  ],
  tips: [
    {
      id: "tip-1",
      trackTitle: "Afro Riddim 01",
      amount: 10,
      split: [
        { wallet: "0xAlice", share: 52, amount: 5.2 },
        { wallet: "0xBob", share: 28, amount: 2.8 },
        { wallet: "0xIfe", share: 20, amount: 2 },
      ],
    },
  ],
};

function formatAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function RegistryPreview({ walletAddress }: { walletAddress: string | null }) {
  return (
    <div className="registry-stage" style={{ marginTop: 28, maxWidth: 760 }}>
      <div className="stage-top">
        <span className="stage-status">
          <i /> REGISTERED RIDDIM · #0042
        </span>
        <span className="stage-network">
          VERIFIED <ChevronRight size={13} />
        </span>
      </div>

      <div className="track-row">
        <div className="track-cover">
          <Music2 size={20} />
          <b>AR</b>
          <small>01</small>
        </div>

        <div>
          <span className="mono muted">REGISTERED RIDDIM · #0042</span>
          <h3>Afro Riddim 01</h3>
        </div>
      </div>

      <div className="waveform" aria-label="Audio waveform preview">
        {Array.from({ length: 46 }).map((_, index) => (
          <span
            key={index}
            style={{ height: `${18 + ((index * 17) % 39)}%` }}
          />
        ))}
      </div>

      <div className="split-heading">
        <span>OWNERSHIP SPLIT</span>
        <span>100% ALLOCATED</span>
      </div>

      <div className="split-bars">
        <div style={{ width: "52%" }} />
        <div style={{ width: "28%" }} />
        <div style={{ width: "20%" }} />
      </div>

      <div className="owners">
        <div>
          <i className="dot coral" />
          <span>Drums & percussion</span>
          <b>52%</b>
        </div>
        <div>
          <i className="dot amber" />
          <span>Melody & keys</span>
          <b>28%</b>
        </div>
        <div>
          <i className="dot blue" />
          <span>Vocal hook</span>
          <b>20%</b>
        </div>
      </div>

      <div className="stage-foot">
        <span>
          <Fingerprint size={14} /> IPFS metadata pinned
        </span>
        <span style={{ color: "#7e837b" }}>
          <Wallet size={12} />{" "}
          {walletAddress ? formatAddress(walletAddress) : "Not connected"}
        </span>
      </div>
    </div>
  );
}

export default function AppConsolePage() {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [overviewData, setOverviewData] =
    useState<DashboardOverview>(defaultOverview);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverviewData() {
      try {
        setIsLoadingData(true);
        setDataError(null);

        const [riddimsResult, licensesResult, tipsResult] = await Promise.all([
          fetchJson<{ riddims?: DashboardOverview["riddims"] }>("/api/riddims"),
          fetchJson<{ licenses?: DashboardOverview["licenses"] }>(
            "/api/licenses",
          ),
          fetchJson<{ tips?: DashboardOverview["tips"] }>("/api/tips"),
        ]);

        setOverviewData({
          riddims: riddimsResult.riddims ?? defaultOverview.riddims,
          licenses: licensesResult.licenses ?? defaultOverview.licenses,
          tips: tipsResult.tips ?? defaultOverview.tips,
        });
      } catch (error) {
        setDataError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data from the API.",
        );
        setOverviewData(defaultOverview);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadOverviewData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const provider = (
      window as Window & {
        ethereum?: {
          request: (args: {
            method: string;
            params?: unknown[];
          }) => Promise<string[]>;
        };
      }
    ).ethereum;

    if (!provider) {
      setWalletError(
        "No wallet provider detected. Install MetaMask or another EIP-1193 wallet to connect.",
      );
      return;
    }

    provider
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
        }
      })
      .catch(() => {
        setWalletError(
          "Wallet is available, but account access has not been granted yet.",
        );
      });
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined") return;

    const provider = (
      window as Window & {
        ethereum?: {
          request: (args: {
            method: string;
            params?: unknown[];
          }) => Promise<string[]>;
        };
      }
    ).ethereum;

    if (!provider) {
      setWalletError(
        "No wallet provider detected. Install MetaMask to continue.",
      );
      return;
    }

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
        setWalletError(null);
      }
    } catch {
      setWalletError(
        "Connection request was rejected. Please approve the wallet prompt to continue.",
      );
    }
  };

  const tabContent = useMemo(() => {
    const latestRiddim = overviewData.riddims[0] ?? defaultOverview.riddims[0];
    const latestLicense =
      overviewData.licenses[0] ?? defaultOverview.licenses[0];
    const latestTip = overviewData.tips[0] ?? defaultOverview.tips[0];

    if (activeTab === "Overview") {
      return (
        <>
          {dataError && (
            <div className="status-badge error-badge">{dataError}</div>
          )}

          {isLoadingData && !dataError && (
            <div className="status-badge loading-badge">Loading live data…</div>
          )}

          <RegistryPreview walletAddress={walletAddress} />

          <div
            className="console-grid"
            style={{ marginTop: 22, maxWidth: 760 }}
          >
            <article
              className="console-card action-card"
              style={{ minHeight: 200 }}
            >
              <div className="card-heading">
                <div className="icon-tile">
                  <Database size={20} />
                </div>
                <span className="mono muted">NEW REGISTRATION</span>
              </div>
              <h3>{overviewData.riddims.length} registered riddims</h3>
              <p>
                {latestRiddim
                  ? `${latestRiddim.title} is the newest track in the registry.`
                  : "Add a track, its components, and the wallets that should share future revenue."}
              </p>
              <Link
                href="/register"
                className="button-primary"
                style={{ marginTop: 8 }}
              >
                Register a riddim <ArrowRight size={16} />
              </Link>
            </article>

            <article
              className="console-card action-card"
              style={{ minHeight: 200 }}
            >
              <div className="card-heading">
                <div className="icon-tile">
                  <ShieldCheck size={20} />
                </div>
                <span className="mono muted">AI DETECTION</span>
              </div>
              <h3>{overviewData.licenses.length} active license reviews</h3>
              <p>
                {latestLicense
                  ? `${latestLicense.trackTitle} is showing ${latestLicense.similarity}% similarity.`
                  : "Review likely reuse matches and confirm a license before the split is applied."}
              </p>
              <Link
                href="/license"
                className="button-primary"
                style={{ marginTop: 8 }}
              >
                Check for reuse <ArrowRight size={16} />
              </Link>
            </article>

            <article
              className="console-card action-card"
              style={{ minHeight: 200 }}
            >
              <div className="card-heading">
                <div className="icon-tile">
                  <Coins size={20} />
                </div>
                <span className="mono muted">TIP A TRACK</span>
              </div>
              <h3>{overviewData.tips.length} recent tips</h3>
              <p>
                {latestTip
                  ? `${latestTip.amount} HSK was routed across ${latestTip.split?.length ?? 0} wallets.`
                  : "Fans can send a tip and each wallet receives its share in real time based on the registered split."}
              </p>
              <Link
                href="/tip"
                className="button-primary"
                style={{ marginTop: 8 }}
              >
                Send a tip <ArrowRight size={16} />
              </Link>
            </article>

            <article
              className="console-card action-card"
              style={{ minHeight: 200 }}
            >
              <div className="card-heading">
                <div className="icon-tile">
                  <Sparkles size={20} />
                </div>
                <span className="mono muted">PLATFORM SYNC</span>
              </div>
              <h3>Connect the rights layer.</h3>
              <p>
                Sync licensing data from Audiomack, Spotify, and Boomplay into a
                unified rights registry.
              </p>
              <Link
                href="/integrations"
                className="button-primary"
                style={{ marginTop: 8 }}
              >
                View integrations <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </>
      );
    }

    if (activeTab === "Registry") {
      return (
        <div className="console-grid" style={{ maxWidth: 760 }}>
          {dataError && (
            <div
              className="status-badge error-badge"
              style={{ gridColumn: "1 / -1" }}
            >
              {dataError}
            </div>
          )}

          {isLoadingData && !dataError && (
            <div
              className="status-badge loading-badge"
              style={{ gridColumn: "1 / -1" }}
            >
              Loading registry data…
            </div>
          )}

          <article className="console-card featured">
            <span className="mono muted">REGISTRY STATUS</span>
            <h3>{overviewData.riddims.length} registered riddims</h3>
            <p>
              {latestRiddim
                ? `Latest: ${latestRiddim.title} with ${latestRiddim.components?.length ?? 0} components.`
                : "Use the registration flow to add a title, component names, percentages, and payout wallets."}
            </p>
            <Link
              href="/register"
              className="button-primary"
              style={{ marginTop: 12 }}
            >
              Open registration <ArrowRight size={16} />
            </Link>
          </article>

          <article className="console-card">
            <span className="mono muted">CURRENT SPLIT</span>
            <h3>{latestRiddim?.title ?? "Afro Riddim 01"}</h3>
            <p>
              {latestRiddim?.components
                ?.map((component) => `${component.name} ${component.share}%`)
                .join(" · ") ?? "Drums 52% · Melody 28% · Hook 20%"}
            </p>
          </article>

          <article className="console-card">
            <span className="mono muted">CONNECTED WALLET</span>
            <h3>
              {walletAddress ? formatAddress(walletAddress) : "Not connected"}
            </h3>
            <p>
              {walletAddress
                ? "Your wallet is ready for registry actions."
                : "Connect a wallet to enable registry actions."}
            </p>
          </article>
        </div>
      );
    }

    if (activeTab === "Licensing") {
      return (
        <div className="console-grid" style={{ maxWidth: 760 }}>
          {dataError && (
            <div
              className="status-badge error-badge"
              style={{ gridColumn: "1 / -1" }}
            >
              {dataError}
            </div>
          )}

          {isLoadingData && !dataError && (
            <div
              className="status-badge loading-badge"
              style={{ gridColumn: "1 / -1" }}
            >
              Loading licensing data…
            </div>
          )}

          <article className="console-card featured">
            <span className="mono muted">SIMILARITY REVIEW</span>
            <h3>
              {latestLicense
                ? `${latestLicense.similarity}% match detected`
                : "Possible reuse detected"}
            </h3>
            <p>
              {latestLicense
                ? `${latestLicense.trackTitle} has a ${latestLicense.similarity}% similarity score and is ready for human review.`
                : "97.2% similarity with a prior riddim. This is a human-review checkpoint before a license is confirmed."}
            </p>
            <Link
              href="/license"
              className="button-primary"
              style={{ marginTop: 12 }}
            >
              Review match <ArrowRight size={16} />
            </Link>
          </article>

          <article className="console-card">
            <span className="mono muted">MATCH</span>
            <h3>{latestLicense?.trackTitle ?? "Afro Vibes"}</h3>
            <p>
              {latestLicense
                ? `Producer: ${latestLicense.producer} · Similarity: ${latestLicense.similarity}%`
                : "Producer: Alice · Similarity: 97.2%"}
            </p>
          </article>

          <article className="console-card">
            <span className="mono muted">LICENSE ACTION</span>
            <h3>
              {latestLicense?.status === "approved"
                ? "Approved"
                : "Awaiting approval"}
            </h3>
            <p>
              The proposed license is ready once the creator confirms the reuse
              and the royalty terms.
            </p>
          </article>
        </div>
      );
    }

    return (
      <div className="console-grid" style={{ maxWidth: 760 }}>
        {dataError && (
          <div
            className="status-badge error-badge"
            style={{ gridColumn: "1 / -1" }}
          >
            {dataError}
          </div>
        )}

        {isLoadingData && !dataError && (
          <div
            className="status-badge loading-badge"
            style={{ gridColumn: "1 / -1" }}
          >
            Loading tips data…
          </div>
        )}

        <article className="console-card featured">
          <span className="mono muted">FAN SUPPORT</span>
          <h3>
            {latestTip ? `${latestTip.amount} HSK routed` : "Tip flow ready"}
          </h3>
          <p>
            {latestTip
              ? `Most recent tip for ${latestTip.trackTitle} was split across ${latestTip.split?.length ?? 0} wallets.`
              : "Simulate a tip and see the exact split across each registered wallet."}
          </p>
          <Link
            href="/tip"
            className="button-primary"
            style={{ marginTop: 12 }}
          >
            Open tips <ArrowRight size={16} />
          </Link>
        </article>

        <article className="console-card">
          <span className="mono muted">LAST TIP</span>
          <h3>{latestTip ? `${latestTip.amount} HSK` : "10 HSK"}</h3>
          <p>
            {latestTip?.split
              ? latestTip.split
                  .map((entry) => `${entry.wallet}: ${entry.amount} HSK`)
                  .join(" · ")
              : "Drums 5.2 HSK · Melody 2.8 HSK · Hook 2.0 HSK"}
          </p>
        </article>

        <article className="console-card">
          <span className="mono muted">PAYOUTS</span>
          <h3>Auto-routed</h3>
          <p>
            Distributor logic calculates each wallet share from the component
            percentages and the incoming payment amount.
          </p>
        </article>
      </div>
    );
  }, [activeTab, walletAddress, overviewData, dataError, isLoadingData]);

  return (
    <main
      className="app-shell"
      style={{
        background:
          "radial-gradient(ellipse 60% 45% at 82% 0%, rgba(67, 45, 26, 0.8) 0%, transparent 70%), #0d0f10",
      }}
    >
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

        <button
          type="button"
          className="button-primary"
          onClick={connectWallet}
        >
          <Wallet size={15} />{" "}
          {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
        </button>
      </header>

      <div className="app-layout" style={{ maxWidth: 1180 }}>
        <aside className="app-sidebar" style={{ paddingRight: 48 }}>
          <Link href="/" className="back-link">
            ← Back to protocol
          </Link>
          <div className="sidebar-kicker">CREATOR CONSOLE</div>
          <h1
            style={{
              fontSize: 60,
              lineHeight: 0.9,
              letterSpacing: "-0.08em",
              marginBottom: 18,
            }}
          >
            Make the
            <br />
            <em>rhythm</em>
            <br />
            count.
          </h1>
          <p style={{ maxWidth: 290 }}>
            Register components, confirm AI reuse suggestions, and route support
            to every contributor.
          </p>

          <div className="sidebar-proof" style={{ marginTop: 22 }}>
            <Check size={14} /> Human-confirmed by design
          </div>
        </aside>

        <section className="app-content" style={{ flex: 1 }}>
          <div
            className="app-intro"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div>
              <span className="section-label">RIDDIM REGISTRY</span>
              <h2
                style={{
                  fontSize: 34,
                  letterSpacing: "-0.06em",
                  marginTop: 18,
                  marginBottom: 0,
                }}
              >
                Your music, onchain.
              </h2>
            </div>
            <div className="app-status">
              <i /> Wallet connected
            </div>
          </div>

          <div className="app-tabs" style={{ width: "100%", maxWidth: 760 }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {tabContent}

          {walletError && (
            <div
              style={{
                marginTop: 16,
                color: "#f7b7a2",
                fontSize: 12,
                maxWidth: 760,
              }}
            >
              {walletError}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
