"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CirclePlay,
  Fingerprint,
  HandCoins,
  Layers3,
  Menu,
  Music2,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";

const steps = [
  {
    icon: Layers3,
    eyebrow: "01 / REGISTER",
    title: "Make every layer visible.",
    body: "Register drums, melody, vocal hooks, and payout wallets with a preset ownership split.",
  },
  {
    icon: ScanSearch,
    eyebrow: "02 / LICENSE",
    title: "Find it. License it.",
    body: "The AI detection stub flags likely reuse and proposes a licensing transaction for you to confirm.",
  },
  {
    icon: HandCoins,
    eyebrow: "03 / SPLIT",
    title: "Let the code pay everyone.",
    body: "Fans tip a track in testnet tokens and the contract routes each contributor their share automatically.",
  },
];

function Mark() {
  return (
    <div className="landing-mark">
      <span>R</span>
      <i />
    </div>
  );
}

function RegistryCard() {
  return (
    <div className="registry-stage">
      <div className="stage-top">
        <span className="stage-status">
          <i /> LIVE REGISTRY PREVIEW
        </span>
        <span className="stage-network">
          HSK TESTNET · 133 <ChevronRight size={13} />
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
          <p>ProducerK · 3 registered components</p>
        </div>
        <span className="verified">
          <ShieldCheck size={15} /> VERIFIED
        </span>
      </div>
      <div className="waveform" aria-label="Audio waveform preview">
        {Array.from({ length: 46 }).map((_, i) => (
          <span key={i} style={{ height: `${18 + ((i * 17) % 39)}%` }} />
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
        <Link className="wallet-link" href="/app">
          <Wallet size={14} /> Open console <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link className="landing-brand" href="/#top">
          <Mark />
          <span>
            RIDDIM<small>PROTOCOL</small>
          </span>
        </Link>
        <div className={`landing-links ${menuOpen ? "open" : ""}`}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#why-riddim" onClick={() => setMenuOpen(false)}>
            Why Riddim
          </a>
          <a href="#registry" onClick={() => setMenuOpen(false)}>
            Registry
          </a>
          <Link
            className="nav-cta"
            href="/app"
            onClick={() => setMenuOpen(false)}
          >
            Open app <ArrowRight size={15} />
          </Link>
        </div>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse" /> OPEN PROTOCOL FOR AFRICAN MUSIC
          </div>
          <h1>
            Every sound has an owner.
            <br />
            <em>Make it count.</em>
          </h1>
          <p className="hero-lede">
            Riddim Protocol gives producers, artists, and fans a transparent way
            to register, license, and support the layers behind African music —
            with every split recorded on HSK Testnet.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/app">
              Explore the registry <ArrowRight size={17} />
            </Link>
            <a className="button-quiet" href="#how-it-works">
              <CirclePlay size={17} /> See how it works
            </a>
          </div>
          <div className="hero-note">
            <Check size={14} /> Built for the people who make the culture
          </div>
        </div>
        <RegistryCard />
      </section>
      <div className="ticker">
        <div>
          <Zap size={14} /> PROGRAMMABLE RIGHTS FOR AFRICAN MUSIC
        </div>
        <div>
          HSK TESTNET · CHAIN 133 <span>●</span>
        </div>
        <div>
          HUMAN-CONFIRMED AI <span>●</span>
        </div>
        <div>
          COMPONENT-LEVEL SPLITS <span>●</span>
        </div>
      </div>
      <section className="intro-section" id="why-riddim">
        <div>
          <span className="section-label">THE PROBLEM</span>
          <h2>
            Music is collaborative.
            <br />
            <em>Rights should be programmable.</em>
          </h2>
        </div>
        <p>
          African music has no reliable mechanical-licensing infrastructure.
          Riddim turns invisible credit into an open, verifiable link between
          who contributed what and who gets paid when it earns.
        </p>
      </section>
      <section className="steps-section" id="how-it-works">
        <div className="section-heading">
          <span className="section-label">THE PROTOCOL</span>
          <h2>
            From first loop
            <br />
            to final split.
          </h2>
        </div>
        <div className="step-grid">
          {steps.map(({ icon: Icon, eyebrow, title, body }) => (
            <article className="step-card" key={eyebrow}>
              <div className="step-icon">
                <Icon size={20} />
              </div>
              <span className="mono step-number">{eyebrow}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <Link href="/app">
                Learn more <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="manifesto">
        <div className="manifesto-mark">
          <Sparkles size={21} />
        </div>
        <blockquote>
          “The future of music rights is not about taking credit. It&apos;s
          about making credit impossible to lose.”
        </blockquote>
        <span className="mono">RIDDIM PROTOCOL / 2026</span>
      </section>
      <section className="launch-section" id="launch">
        <div>
          <span className="section-label">THE HACKATHON MVP</span>
          <h2>
            Put your name
            <br />
            on the rhythm.
          </h2>
          <p>
            Explore the registry on HSK Testnet: register a riddim, license a
            reuse, consent to a voice clone, or tip a track. Real audio
            fingerprinting and mainnet deployment come next.
          </p>
        </div>
        <div className="launch-card">
          <div className="launch-icon">
            <Layers3 size={22} />
          </div>
          <strong>Start with the registry</strong>
          <span>HSK Testnet · chain 133 · testnet tokens</span>
          <Link className="button-primary" href="/app">
            Explore the protocol <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer>
        <Link className="landing-brand" href="/#top">
          <Mark />
          <span>
            RIDDIM<small>PROTOCOL</small>
          </span>
        </Link>
        <span className="mono">THE LICENSING LAYER AFROBEATS NEVER HAD.</span>
        <span className="mono footer-right">© 2026 RIDDIM PROTOCOL</span>
      </footer>
    </main>
  );
}
