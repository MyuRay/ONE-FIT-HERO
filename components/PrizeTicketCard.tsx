'use client';

import { motion } from 'framer-motion';

export function PrizeTicketCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-600 rounded-lg p-6"
    >
      <div className="flex items-center gap-6">
        <div className="text-6xl">🎫</div>
        <div className="flex-1">
          <h4 className="text-2xl font-bold text-yellow-400 mb-2">Prize Ticket NFT</h4>
          <p className="text-gray-300 mb-4">
            週次ランキング上位入賞により獲得した抽選券です。
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-yellow-600/30 text-yellow-300 text-sm rounded">
              NFT
            </span>
            <span className="px-3 py-1 bg-yellow-600/30 text-yellow-300 text-sm rounded">
              抽選券
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


