"use client";

import { useAppKit } from '@/app/config/config';
import Claim from "./components/Claim";
import { Coins } from 'lucide-react';

export default function Home() {
  useAppKit();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Coins className="w-10 h-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              LostSols
            </h1>
          </div>
          <p className="text-gray-600 max-w-xl mx-auto">
            Recover your SOL from empty token accounts with a single click
          </p>
        </div>

        {/* Main Component */}
        <div className="flex justify-center">
          <Claim />
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Recovery</h3>
            <p className="text-gray-600 text-sm">
              Simple one-click process to reclaim your SOL
            </p>
          </div>
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe & Secure</h3>
            <p className="text-gray-600 text-sm">
              Transparent and secure token account closure
            </p>
          </div>
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Waste</h3>
            <p className="text-gray-600 text-sm">
              Reclaim SOL from unused token accounts
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-1">
            Built by{" "}
            <a
              href="https://twitter.com/YOUR_TWITTER_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              @arkade_dev
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}