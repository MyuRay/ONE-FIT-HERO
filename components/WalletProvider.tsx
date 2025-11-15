'use client';

import { ReactNode } from 'react';
import { WalletKitProvider } from '@mysten/wallet-kit';

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WalletKitProvider
      // デフォルトで利用可能なウォレットを自動検出
      // Sui Wallet、Slush Wallet、その他のWallet Standard準拠ウォレットを自動検出
      disableAutoConnect={true}
      // 優先ウォレットの順序を指定（オプション）
      // preferredWallets={['Sui Wallet', 'Slush Wallet']}
    >
      {children}
    </WalletKitProvider>
  );
}

