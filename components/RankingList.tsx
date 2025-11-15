'use client';

import { RankingEntry } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

export function RankingList() {
  const { rankings, address, userRank } = useAppStore();

  const formatAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-4">
      {rankings.map((entry, index) => {
        const isUser = entry.address === address;
        return (
          <motion.div
            key={entry.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 rounded-lg p-4 border-2 ${
              isUser
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">
                      {formatAddress(entry.address)}
                    </p>
                    {isUser && (
                      <span className="px-2 py-1 bg-primary text-xs rounded">You</span>
                    )}
                    {entry.hasPrizeTicket && (
                      <span className="px-2 py-1 bg-yellow-600 text-xs rounded flex items-center gap-1">
                        🎫 Prize Ticket
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Workouts: {entry.totalWorkouts} times
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{entry.score}</p>
                <p className="text-xs text-gray-400">Score</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {rankings.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No ranking data</p>
        </div>
      )}
    </div>
  );
}


