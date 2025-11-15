'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWalletKit } from '@mysten/wallet-kit';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { WalletSelector } from './WalletSelector';

export function WalletConnectButton() {
  const { address, isConnected, setAddress, disconnectWallet } = useAppStore();
  const { 
    currentWallet, 
    currentAccount, 
    disconnect, 
    isConnected: walletKitConnected,
    wallets 
  } = useWalletKit();
  const [showSelector, setShowSelector] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // クライアントサイドでのマウント状態を確認（Hydrationエラー対策）
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ウォレット接続状態を同期
  useEffect(() => {
    if (walletKitConnected && currentAccount) {
      setAddress(currentAccount.address);
    } else if (!walletKitConnected) {
      disconnectWallet();
    }
  }, [walletKitConnected, currentAccount, setAddress, disconnectWallet]);

  const handleClick = async () => {
    try {
      if (isConnected) {
        await disconnect();
        toast.success('Wallet disconnected');
      } else {
        // Check if wallets are available
        if (wallets.length === 0) {
          toast.error('No Sui wallet found. Please install the Sui Wallet extension.');
          return;
        }

        // If only one wallet, connect directly; if multiple, show selection screen
        if (wallets.length === 1) {
          // Implementation is in WalletSelector
          setShowSelector(true);
        } else {
          setShowSelector(true);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Always show button during server-side rendering (to prevent hydration errors)
  if (!isMounted) {
    return (
      <motion.button
        className="px-6 py-2 rounded-lg font-medium bg-primary hover:bg-primary-dark text-white transition-colors"
        disabled
      >
        Connect Wallet
      </motion.button>
    );
  }

  // Only show on client side when wallet is not available
  if (wallets.length === 0 && !isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <motion.a
          href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 rounded-lg font-medium bg-primary hover:bg-primary-dark text-white transition-colors text-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Install Sui Wallet
        </motion.a>
        <motion.a
          href="https://slushwallet.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors text-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Install Slush Wallet
        </motion.a>
      </div>
    );
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isConnected
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-primary hover:bg-primary-dark text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isConnected ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Disconnect Wallet
          </span>
        ) : (
          'Connect Wallet'
        )}
      </motion.button>
      <WalletSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
      />
    </>
  );
}

