"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Claim from "./components/Claim";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border hover:border-slate-900 rounded">
        <WalletMultiButton style={{}} />
        <Claim/>
      </div>
    </main>
  );
}