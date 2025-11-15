'use client';

import { useAppStore } from '@/store/useAppStore';
import { ExchangeItem, ExchangeHistory } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';

const typeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  badge: { label: 'Badge', emoji: '🏅', color: 'yellow' },
  goods: { label: 'Goods', emoji: '🎁', color: 'blue' },
  lottery_ticket: { label: 'Lottery Ticket', emoji: '🎫', color: 'purple' },
};

export function ExchangeMarketplace() {
  const {
    exchangeItems,
    exchangeHistory,
    getTokenAmount,
    exchangeItem,
  } = useAppStore();

  const [selectedTab, setSelectedTab] = useState<'marketplace' | 'history'>('marketplace');
  const tokenAmount = getTokenAmount();

  const handleExchange = (item: ExchangeItem) => {
    if (tokenAmount < item.tokenCost) {
      toast.error('Insufficient tokens');
      return;
    }

    if (exchangeItem(item.id)) {
      const isGoods = item.type === 'goods';
      const message = isGoods ? `Purchased ${item.name}!` : `Applied for ${item.name}!`;
      toast.success(message, {
        icon: isGoods ? '🎁' : '🎉',
        duration: 3000,
      });
    } else {
      const errorMessage = item.type === 'goods' ? 'Purchase failed' : 'Application failed';
      toast.error(errorMessage);
    }
  };

  const groupedItems = exchangeItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ExchangeItem[]>);

  return (
    <div className="space-y-6">
      {/* Token balance */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-600 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Token Balance</p>
            <p className="text-4xl font-bold text-yellow-400">{tokenAmount.toLocaleString()}</p>
          </div>
          <div className="text-6xl">💰</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setSelectedTab('marketplace')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedTab === 'marketplace'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Exchange History ({exchangeHistory.length})
        </button>
      </div>

      {/* Marketplace */}
      {selectedTab === 'marketplace' && (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([type, items]) => {
            const typeInfo = typeLabels[type];
            return (
              <div key={type} className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">{typeInfo.emoji}</span>
                  {typeInfo.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gray-800/50 rounded-lg p-6 border-2 ${
                        tokenAmount >= item.tokenCost
                          ? 'border-gray-700 hover:border-primary'
                          : 'border-gray-800 opacity-60'
                      } transition-colors`}
                    >
                      <div className="text-4xl mb-3">{typeInfo.emoji}</div>
                      <h4 className="text-lg font-bold mb-2">{item.name}</h4>
                      <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-400">Required Tokens</span>
                        <span className="text-xl font-bold text-yellow-400">
                          {item.tokenCost.toLocaleString()}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => handleExchange(item)}
                        disabled={tokenAmount < item.tokenCost || !item.available}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          tokenAmount >= item.tokenCost && item.available
                            ? 'bg-primary hover:bg-primary-dark text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                        whileHover={
                          tokenAmount >= item.tokenCost && item.available
                            ? { scale: 1.02 }
                            : {}
                        }
                        whileTap={
                          tokenAmount >= item.tokenCost && item.available
                            ? { scale: 0.98 }
                            : {}
                        }
                      >
                        {tokenAmount < item.tokenCost
                          ? 'Insufficient Tokens'
                          : item.available
                          ? item.type === 'goods' ? 'Purchase' : 'Apply'
                          : 'Out of Stock'}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exchange history */}
      {selectedTab === 'history' && (
        <div className="space-y-4">
          {exchangeHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">No exchange history</p>
              <p className="text-sm">Exchange items in the marketplace</p>
            </div>
          ) : (
            exchangeHistory
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((history, index) => (
                <motion.div
                  key={history.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{history.itemName}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(history.timestamp).toLocaleString('en-US')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Tokens Spent</p>
                      <p className="text-xl font-bold text-yellow-400">
                        -{history.tokenCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </div>
      )}
    </div>
  );
}


