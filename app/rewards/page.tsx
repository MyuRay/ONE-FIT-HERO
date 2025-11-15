'use client';

import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface RewardBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
}

const rarityColors = {
  common: 'bg-gray-600 border-gray-500',
  rare: 'bg-blue-600 border-blue-500',
  epic: 'bg-purple-600 border-purple-500',
  legendary: 'bg-yellow-600 border-yellow-500',
};

const rarityTextColors = {
  common: 'text-gray-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
  legendary: 'text-yellow-300',
};

export default function RewardsPage() {
  const { 
    address, 
    trainers, 
    rankings, 
    userRank 
  } = useAppStore();

  // Use same mock data as HOME page
  const mockTotalWorkouts = 48; // Total workout count
  const mockCurrentConsecutiveDays = 5; // Current consecutive training days
  const mockMaxConsecutiveDays = 12; // Longest consecutive training days
  
  // Total score (sum of all trainer scores)
  const totalUserScore = useMemo(() => {
    return trainers.reduce((sum, trainer) => sum + trainer.userScore, 0);
  }, [trainers]);
  
  const totalTrainerScore = useMemo(() => {
    return trainers.reduce((sum, trainer) => sum + trainer.trainerScore, 0);
  }, [trainers]);
  
  const totalScore = totalUserScore + totalTrainerScore;

  // Calculate contribution to each trainer (aligned with HOME page data)
  const trainerContributions = useMemo(() => {
    const contributions = new Map<string, number>();
    trainers.forEach((trainer) => {
      contributions.set(trainer.id, trainer.userScore);
    });
    return contributions;
  }, [trainers]);

  // Get trainer with maximum contribution
  const maxContributionTrainer = useMemo(() => {
    if (trainerContributions.size === 0) return null;
    let maxTrainerId = '';
    let maxContribution = 0;
    trainerContributions.forEach((contribution, trainerId) => {
      if (contribution > maxContribution) {
        maxContribution = contribution;
        maxTrainerId = trainerId;
      }
    });
    return trainers.find((t) => t.id === maxTrainerId) || null;
  }, [trainerContributions, trainers]);

  // Badge definitions
  const rewardBadges: RewardBadge[] = useMemo(() => {
    const badgesList: RewardBadge[] = [
      // Consecutive days badges (using HOME page mock data)
      {
        id: 'consecutive-7',
        name: '7-Day Streak Challenge',
        description: 'Complete training for 7 consecutive days',
        emoji: '🔥',
        rarity: 'common',
        unlocked: mockCurrentConsecutiveDays >= 7,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 7,
      },
      {
        id: 'consecutive-14',
        name: '14-Day Streak Master',
        description: 'Complete training for 14 consecutive days',
        emoji: '⚡',
        rarity: 'rare',
        unlocked: mockCurrentConsecutiveDays >= 14,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 14,
      },
      {
        id: 'consecutive-30',
        name: '30-Day Streak King',
        description: 'Complete training for 30 consecutive days',
        emoji: '👑',
        rarity: 'epic',
        unlocked: mockCurrentConsecutiveDays >= 30,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 30,
      },
      {
        id: 'consecutive-60',
        name: '60-Day Streak Legend',
        description: 'Complete training for 60 consecutive days',
        emoji: '🏆',
        rarity: 'legendary',
        unlocked: mockCurrentConsecutiveDays >= 60,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 60,
      },
      // Weekly ranking badges
      {
        id: 'weekly-champion',
        name: 'Weekly Champion',
        description: 'Achieve 1st place in weekly ranking',
        emoji: '🥇',
        rarity: 'epic',
        unlocked: userRank === 1,
      },
      {
        id: 'weekly-top3',
        name: 'Weekly Top 3',
        description: 'Rank within top 3 in weekly ranking',
        emoji: '🥉',
        rarity: 'rare',
        unlocked: userRank !== null && userRank <= 3,
      },
      // Total workout count badges (using HOME page mock data)
      {
        id: 'workouts-10',
        name: 'Training Novice',
        description: 'Complete 10 total workouts',
        emoji: '💪',
        rarity: 'common',
        unlocked: mockTotalWorkouts >= 10,
        progress: mockTotalWorkouts,
        maxProgress: 10,
      },
      {
        id: 'workouts-50',
        name: 'Training Advanced',
        description: 'Complete 50 total workouts',
        emoji: '💥',
        rarity: 'rare',
        unlocked: mockTotalWorkouts >= 50,
        progress: mockTotalWorkouts,
        maxProgress: 50,
      },
      {
        id: 'workouts-100',
        name: 'Training Master',
        description: 'Complete 100 total workouts',
        emoji: '🎯',
        rarity: 'epic',
        unlocked: mockTotalWorkouts >= 100,
        progress: mockTotalWorkouts,
        maxProgress: 100,
      },
      {
        id: 'workouts-500',
        name: 'Training Legend',
        description: 'Complete 500 total workouts',
        emoji: '🌟',
        rarity: 'legendary',
        unlocked: mockTotalWorkouts >= 500,
        progress: mockTotalWorkouts,
        maxProgress: 500,
      },
      // Total score badges
      {
        id: 'score-10000',
        name: 'Score Milestone',
        description: 'Achieve total score of 10,000pt',
        emoji: '⭐',
        rarity: 'common',
        unlocked: totalScore >= 10000,
        progress: totalScore,
        maxProgress: 10000,
      },
      {
        id: 'score-50000',
        name: 'Score Champion',
        description: 'Achieve total score of 50,000pt',
        emoji: '✨',
        rarity: 'rare',
        unlocked: totalScore >= 50000,
        progress: totalScore,
        maxProgress: 50000,
      },
      {
        id: 'score-100000',
        name: 'Score Legend',
        description: 'Achieve total score of 100,000pt',
        emoji: '💫',
        rarity: 'epic',
        unlocked: totalScore >= 100000,
        progress: totalScore,
        maxProgress: 100000,
      },
      // Contribution badges
      {
        id: 'contribution-hero',
        name: 'Contribution Hero',
        description: `Contribute most to trainer support: ${maxContributionTrainer?.name || 'N/A'}`,
        emoji: '🦸',
        rarity: 'epic',
        unlocked: maxContributionTrainer !== null && (trainerContributions.get(maxContributionTrainer.id) || 0) > 0,
      },
      {
        id: 'trainer-supporter',
        name: 'Trainer Supporter',
        description: 'Contribute to all trainers',
        emoji: '🤝',
        rarity: 'rare',
        unlocked: trainerContributions.size >= trainers.length && trainers.length > 0,
      },
    ];

    return badgesList;
  }, [mockCurrentConsecutiveDays, mockTotalWorkouts, userRank, totalScore, maxContributionTrainer, trainerContributions, trainers.length]);

  const unlockedBadges = rewardBadges.filter((b) => b.unlocked);
  const lockedBadges = rewardBadges.filter((b) => !b.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="/logo.png"
                alt="ONE FIT HERO"
                className="h-16 w-auto"
              />
              <h1 className="text-2xl font-bold text-primary">ONE FIT HERO</h1>
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/workout"
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              WORKOUT
            </Link>
            <Link
              href="/trainers"
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              TRAINERS
            </Link>
            <Link
              href="/ranking"
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              RANKING
            </Link>
            <Link
              href="/rewards"
              className="px-4 py-3 text-sm font-medium text-white border-b-2 border-primary"
            >
              REWARDS
            </Link>
            <Link
              href="/exchange"
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              EXCHANGE
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">REWARDS</h2>

        {!address ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-8">
              Please connect your wallet to view REWARDS
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Unlocked Badges</p>
                <p className="text-2xl font-bold text-primary">
                  {unlockedBadges.length}/{rewardBadges.length}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Consecutive Days</p>
                <p className="text-2xl font-bold text-yellow-400">{mockCurrentConsecutiveDays} days</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Total Workouts</p>
                <p className="text-2xl font-bold text-green-400">{mockTotalWorkouts} times</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Total Score</p>
                <p className="text-2xl font-bold text-blue-400">{totalScore.toLocaleString()}</p>
              </div>
            </div>

            {/* Unlocked badges */}
            {unlockedBadges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Unlocked Badges ({unlockedBadges.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 ${rarityColors[badge.rarity]} shadow-lg`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{badge.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`text-lg font-bold ${rarityTextColors[badge.rarity]}`}>
                              {badge.name}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${rarityColors[badge.rarity]}`}>
                              {badge.rarity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
                          {badge.progress !== undefined && badge.maxProgress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{badge.progress} / {badge.maxProgress}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((badge.progress / badge.maxProgress) * 100, 100)}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="bg-green-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked badges */}
            {lockedBadges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Locked Badges ({lockedBadges.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/30 rounded-lg p-6 border-2 border-gray-700 opacity-60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-5xl filter grayscale">{badge.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-500">
                              {badge.name}
                            </h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-400">
                              {badge.rarity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                          {badge.progress !== undefined && badge.maxProgress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{badge.progress} / {badge.maxProgress}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gray-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((badge.progress / badge.maxProgress) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

