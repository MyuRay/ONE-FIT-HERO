'use client';

import { Trainer } from '@/types';
import { motion } from 'framer-motion';

interface TrainerCardProps {
  trainer: Trainer;
  onClick?: () => void;
  showStats?: boolean;
  rank?: number | null;
}

export function TrainerCard({ trainer, onClick, showStats = false, rank }: TrainerCardProps) {
  const contributionPercentage =
    trainer.userScore + trainer.trainerScore === 0
      ? 0
      : Math.round((trainer.userScore / (trainer.userScore + trainer.trainerScore)) * 100);

  return (
    <motion.div
      onClick={onClick}
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700 ${
        onClick ? 'cursor-pointer hover:border-primary transition-colors' : ''
      }`}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="flex items-start gap-6">
        {/* Trainer image area */}
        {trainer.image ? (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
            <img
              src={trainer.image}
              alt={trainer.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary flex-shrink-0">
            <span className="text-4xl">🥊</span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-bold text-primary">{trainer.name}</h3>
            {rank !== null && rank !== undefined && (
              <span className="text-sm font-semibold text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                #{rank}
              </span>
            )}
          </div>
          {trainer.description && (
            <p className="text-gray-400 text-sm">{trainer.description}</p>
          )}

          {/* Total score display (always shown) */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm font-medium text-gray-300 mb-3">Total Score</p>
            <div className="space-y-2">
              {/* Your contribution (percentage) */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Your Score (this trainer)</span>
                <div className="text-right">
                  <motion.span
                    key={`score-${trainer.userScore}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-base font-bold text-primary block"
                  >
                    {trainer.userScore.toLocaleString()}
                  </motion.span>
                  <motion.span
                    key={`percent-${contributionPercentage}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-semibold text-primary/70"
                  >
                    {contributionPercentage}%
                  </motion.span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Trainer Score</span>
                <motion.span
                  key={trainer.trainerScore}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-yellow-400"
                >
                  {trainer.trainerScore.toLocaleString()}
                </motion.span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-sm font-medium text-gray-300">Total Score</span>
                <motion.span
                  key={trainer.userScore + trainer.trainerScore}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold text-white"
                >
                  {(trainer.userScore + trainer.trainerScore).toLocaleString()}
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
}

function StatBar({ label, value, max }: StatBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, color: "#FEE2E2" }}
          animate={{ scale: 1, color: "#DC2626" }}
          transition={{ duration: 0.3 }}
          className="font-bold text-primary"
        >
          {value}
        </motion.span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          key={value}
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

