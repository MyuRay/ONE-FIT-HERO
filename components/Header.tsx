'use client';

import { WalletConnectButton } from './WalletConnectButton';

export function Header() {
  return (
    <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">ONE FIT HERO</h1>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}


