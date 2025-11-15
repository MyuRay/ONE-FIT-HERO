'use client';

import { useWalletKit } from '@mysten/wallet-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSelector({ isOpen, onClose }: WalletSelectorProps) {
  const { wallets, connect } = useWalletKit();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (walletName: string) => {
    try {
      setIsConnecting(true);
      await connect(walletName);
      toast.success('ウォレットに接続しました');
      onClose();
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('ウォレット接続に失敗しました');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">ウォレットを選択</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Suiウォレットが見つかりません
              </p>
              <div className="space-y-2">
                <a
                  href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline"
                >
                  Sui Walletをインストール
                </a>
                <a
                  href="https://slushwallet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline"
                >
                  Slush Walletをインストール
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <motion.button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet.name)}
                  disabled={isConnecting}
                  className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    {wallet.icon && (
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="w-8 h-8"
                      />
                    )}
                    <div>
                      <p className="font-medium text-white">{wallet.name}</p>
                      <p className="text-sm text-gray-400">
                        {wallet.installed ? 'インストール済み' : '未インストール'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

