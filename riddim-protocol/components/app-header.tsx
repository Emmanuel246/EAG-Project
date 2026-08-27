"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { hskTestnet } from "@/lib/onchain/chain";
import { CONTRACT_ADDRESS, isContractConfigured, shortAddress } from "@/lib/onchain/config";

const bannerStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 4px",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 13,
  display: "flex",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
};

/**
 * Shared app header: brand, live network chip, and the RainbowKit connect
 * button (wide range of wallets + built-in wrong-network handling), plus the
 * offchain-mode / contract-address status lines.
 */
export function AppHeader() {
  const deployed = isContractConfigured();

  return (
    <>
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
          <i /> {hskTestnet.name.toUpperCase()} · {hskTestnet.id}
        </div>

        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </header>

      {!deployed && (
        <div style={{ ...bannerStyle, background: "rgba(245,163,91,0.12)", color: "#f5a35b" }}>
          <span>
            <strong>Offchain mode.</strong> No contract address set — actions are
            recorded to the database only. Deploy the contract and set{" "}
            <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> to enable onchain writes.
          </span>
        </div>
      )}

      {deployed && (
        <div style={{ ...bannerStyle, color: "#7e837b", fontSize: 12 }}>
          <span>
            Contract: <code>{shortAddress(CONTRACT_ADDRESS)}</code>
          </span>
        </div>
      )}
    </>
  );
}
