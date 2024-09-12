"use client";

import { useEffect } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import useCanvasWallet from "./components/CanvasWalletProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import Claim from "./components/Claim";
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export default function Home() {
  const { publicKey } = useWallet();
  const { connectWallet, walletAddress, iframe } = useCanvasWallet();

  useEffect(() => {
    if (iframe && !walletAddress) {
      connectWallet();
    }
  }, [iframe, walletAddress, connectWallet]);

  const isWalletConnected = publicKey || walletAddress;

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border rounded p-4">
        {isWalletConnected ? (
          <Claim />
        ) : (
          iframe ? (
            <p>Connecting wallet...</p>
          ) : (
            <WalletMultiButton style={{}} />
          )
        )}
      </div>
    </main>
  );
}