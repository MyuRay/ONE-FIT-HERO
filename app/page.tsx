'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TrainerCard } from "@/components/TrainerCard";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type LiveScoreMap = Record<string, number>;

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

export default function Home() {
  const { 
    address, 
    selectedTrainerId, 
    trainers, 
    todayBadgeCompleted, 
    getTokenAmount, 
    addTokens,
    userRank,
  } = useAppStore();
  const [liveTrainerScores, setLiveTrainerScores] = useState<LiveScoreMap>({});

  // Initialize: Register new trainers to live scores
  useEffect(() => {
    if (!trainers.length) return;
    setLiveTrainerScores((prev) => {
      const next: LiveScoreMap = { ...prev };
      trainers.forEach((trainer) => {
        if (next[trainer.id] === undefined) {
          next[trainer.id] = trainer.trainerScore;
        }
      });
      return next;
    });
  }, [trainers]);

  // Mock real-time updates: Random increment every 5 seconds
  useEffect(() => {
    if (!trainers.length) return;
    const intervalId = setInterval(() => {
      setLiveTrainerScores((prev) => {
        const next: LiveScoreMap = { ...prev };
        trainers.forEach((trainer) => {
          const currentScore = next[trainer.id] ?? trainer.trainerScore;
          const delta = Math.floor(Math.random() * 25) + 5;
          next[trainer.id] = currentScore + delta;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(intervalId);
  }, [trainers]);

  const selectedTrainerBase = trainers.find((t) => t.id === selectedTrainerId);
  const selectedTrainer = useMemo(() => {
    if (!selectedTrainerBase) return null;
    const liveScore = liveTrainerScores[selectedTrainerBase.id] ?? selectedTrainerBase.trainerScore;
    return {
      ...selectedTrainerBase,
      trainerScore: liveScore,
    };
  }, [liveTrainerScores, selectedTrainerBase]);
  const tokenAmount = getTokenAmount();
  
  // Same calculation method as real-time ranking: Sum all trainer scores
  const totalUserScore = useMemo(() => {
    return trainers.reduce((sum, trainer) => sum + trainer.userScore, 0);
  }, [trainers]);
  
  const totalTrainerScore = useMemo(() => {
    return trainers.reduce((sum, trainer) => {
      const liveScore = liveTrainerScores[trainer.id] ?? trainer.trainerScore;
      return sum + liveScore;
    }, 0);
  }, [trainers, liveTrainerScores]);
  
  const totalScore = totalUserScore + totalTrainerScore;
  
  // Mock data: Total workout count and consecutive training days
  const mockTotalWorkouts = 48; // Total workout count
  const mockWeeklyWorkouts = 6; // Workout count in the last 7 days
  const mockCurrentConsecutiveDays = 5; // Current consecutive training days
  const mockMaxConsecutiveDays = 12; // Longest consecutive training days
  
  // Calculate contribution to each trainer (same as REWARDS page)
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

  // REWARDSページと同じバッジ定義
  const rewardBadges: RewardBadge[] = useMemo(() => {
    const badgesList: RewardBadge[] = [
      // Consecutive Days Badges
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
      // Weekly Ranking Badges
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
      // Total Workout Count Badges
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
      // Total Score Badges
      {
        id: 'score-10000',
        name: 'Score Milestone',
        description: 'Achieve 10,000pt total score',
        emoji: '⭐',
        rarity: 'common',
        unlocked: totalScore >= 10000,
        progress: totalScore,
        maxProgress: 10000,
      },
      {
        id: 'score-50000',
        name: 'Score Champion',
        description: 'Achieve 50,000pt total score',
        emoji: '✨',
        rarity: 'rare',
        unlocked: totalScore >= 50000,
        progress: totalScore,
        maxProgress: 50000,
      },
      {
        id: 'score-100000',
        name: 'Score Legend',
        description: 'Achieve 100,000pt total score',
        emoji: '💫',
        rarity: 'epic',
        unlocked: totalScore >= 100000,
        progress: totalScore,
        maxProgress: 100000,
      },
      // Contribution Badges
      {
        id: 'contribution-hero',
        name: 'Contribution Hero',
        description: `Most contribution to fighter support: ${maxContributionTrainer?.name || 'N/A'}`,
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

  // Unlocked badges
  const unlockedBadges = useMemo(() => {
    return rewardBadges.filter((b) => b.unlocked);
  }, [rewardBadges]);

  // Total badge count (same as REWARDS page)
  const totalRewardBadges = unlockedBadges.length;
  
  // Calculate contribution rate of selected trainer
  const calculateContribution = () => {
    if (!selectedTrainer) return 0;
    const totalTrainerScore = selectedTrainer.userScore + selectedTrainer.trainerScore;
    if (totalTrainerScore === 0) return 0;
    return Math.round((selectedTrainer.userScore / totalTrainerScore) * 100);
  };
  
  const contributionPercentage = calculateContribution();
  
  // トレーナーのリアルタイムランキングを計算して順位を取得
  const trainerLeaderboard = useMemo(() => {
    if (!trainers.length) return [];
    return [...trainers]
      .map((trainer) => {
        const liveScore = liveTrainerScores[trainer.id] ?? trainer.trainerScore;
        return {
          ...trainer,
          liveScore,
        };
      })
      .sort((a, b) => b.liveScore - a.liveScore);
  }, [liveTrainerScores, trainers]);
  
  const selectedTrainerRank = useMemo(() => {
    if (!selectedTrainer) return null;
    const index = trainerLeaderboard.findIndex((trainer) => trainer.id === selectedTrainer.id);
    return index >= 0 ? index + 1 : null;
  }, [trainerLeaderboard, selectedTrainer]);

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
              <h1 className="text-2xl font-bold text-primary">
                ONE FIT HERO
              </h1>
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
              className="px-4 py-3 text-sm font-medium text-white border-b-2 border-primary"
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
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!address ? (
          <div className="space-y-8 py-8">
            {/* Game Features Section */}
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
                  Welcome to ONE FIT HERO!
                </h2>
                <p className="text-xl text-gray-300 mb-2">
                  Train together with ONE Championship fighters
                </p>
              </div>

              {/* Game Features Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Training System */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-primary/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🏋️</span>
                    <h3 className="text-2xl font-bold text-primary">Training System</h3>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Copy training while watching ONE Championship fighter videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Real-time feedback with AI coaching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>100% reproduction rate earns full time-based calories as tokens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Difficulty-based calorie burn (Beginner 8/min, Intermediate 12/min, Advanced 18/min)</span>
                    </li>
                  </ul>
                </div>

                {/* Trainer System */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-yellow-400/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">👤</span>
                    <h3 className="text-2xl font-bold text-yellow-400">Trainer System</h3>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Choose from Rodtang, Angela Lee, Chatri, and more</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Own and develop trainer NFTs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Scores reflect your contribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Compete in real-time rankings</span>
                    </li>
                  </ul>
                </div>

                {/* Badge & Reward System */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-purple-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🏅</span>
                    <h3 className="text-2xl font-bold text-purple-400">Badge & Reward System</h3>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Earn badges for consecutive training days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Special badges for top rankings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Achievement badges for total scores and counts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Four-tier rarity: Common/Rare/Epic/Legendary</span>
                    </li>
                  </ul>
                </div>

                {/* Token Exchange System */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-green-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🎫</span>
                    <h3 className="text-2xl font-bold text-green-400">Token Exchange System</h3>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>Purchase lottery tickets with earned tokens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>ONE Championship event ticket lotteries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>Buy sponsor discount coupons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>Participate in official merchandise lotteries</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Game Flow */}
              <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 rounded-lg p-8 border-2 border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-center">🎮 Game Flow</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary">
                      <span className="text-2xl">1️⃣</span>
                    </div>
                    <h4 className="font-bold text-primary mb-2">Connect Wallet</h4>
                    <p className="text-sm text-gray-400">Connect your Sui wallet</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-3 border-2 border-yellow-400">
                      <span className="text-2xl">2️⃣</span>
                    </div>
                    <h4 className="font-bold text-yellow-400 mb-2">Select Trainer</h4>
                    <p className="text-sm text-gray-400">Choose your favorite fighter</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-400/20 flex items-center justify-center mx-auto mb-3 border-2 border-purple-400">
                      <span className="text-2xl">3️⃣</span>
                    </div>
                    <h4 className="font-bold text-purple-400 mb-2">Start Training</h4>
                    <p className="text-sm text-gray-400">Train with AI coaching</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-3 border-2 border-green-400">
                      <span className="text-2xl">4️⃣</span>
                    </div>
                    <h4 className="font-bold text-green-400 mb-2">Exchange Tokens</h4>
                    <p className="text-sm text-gray-400">Purchase lottery tickets and goods</p>
                  </div>
                </div>
              </div>

              {/* Wallet Connect Button */}
              <div className="text-center py-8 bg-gradient-to-r from-primary/10 via-yellow-400/10 to-primary/10 rounded-lg border-2 border-primary/30">
                <h3 className="text-2xl font-bold mb-4">🚀 Let's Get Started!</h3>
                <p className="text-gray-300 mb-6">
                  Connect your Sui wallet and enter the world of ONE FIT HERO!
                </p>
                <WalletConnectButton />
                <p className="text-sm text-gray-500 mt-4">
                  Don't have a wallet?{' '}
                  <a 
                    href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    Install Sui Wallet
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Wallet Address Display */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Connected Wallet</p>
              <p className="text-lg font-mono text-primary">{address}</p>
            </div>

            {/* Trainer Card and My Records in 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Selected Trainer */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Selected Trainer</h2>
                {selectedTrainer ? (
                  <TrainerCard trainer={selectedTrainer} rank={selectedTrainerRank} />
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-center">
                    <p className="text-yellow-400 mb-4">No trainer selected</p>
                    <Link
                      href="/trainers"
                      className="inline-block px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors"
                    >
                      Select Trainer
                    </Link>
                  </div>
                )}
              </div>

              {/* Right: My Records */}
              <div>
                <h2 className="text-2xl font-bold mb-4">My Records</h2>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700">
                  <div className="space-y-4">
                    {/* Total Workout Count */}
                    <div className="pb-4 border-b border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-400 mb-1">Total Workouts</p>
                          <div className="flex items-baseline gap-2">
                            <motion.p
                              key={mockTotalWorkouts}
                              initial={{ scale: 1.2, color: "#FEE2E2" }}
                              animate={{ scale: 1, color: "#DC2626" }}
                              transition={{ duration: 0.3 }}
                              className="text-3xl font-bold text-primary"
                            >
                              {mockTotalWorkouts.toLocaleString()}
                            </motion.p>
                            <span className="text-lg text-gray-400">times</span>
                          </div>
                          {mockTotalWorkouts > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {mockWeeklyWorkouts} times (last 7 days)
                            </p>
                          )}
                        </div>
                        <div className="text-4xl">🏋️</div>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="pb-4 border-b border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Total Score</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Your Score</span>
                          <motion.span
                            key={totalUserScore}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="font-bold text-primary"
                          >
                            {totalUserScore.toLocaleString()}
                          </motion.span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trainer Score</span>
                          <motion.span
                            key={totalTrainerScore}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="font-bold text-yellow-400"
                          >
                            {totalTrainerScore.toLocaleString()}
                          </motion.span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-700">
                          <span className="font-medium">Total Score</span>
                          <motion.span
                            key={totalScore}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-xl font-bold text-white"
                          >
                            {totalScore.toLocaleString()}
                          </motion.span>
                        </div>
                      </div>
                    </div>

                    {/* Ranking Position */}
                    {userRank && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Weekly Ranking</p>
                        <motion.p
                          key={userRank}
                          initial={{ scale: 1.2, color: "#FEF3C7" }}
                          animate={{ scale: 1, color: "#FCD34D" }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl font-bold text-yellow-400"
                        >
                          #{userRank}
                        </motion.p>
                      </div>
                    )}

                    {/* Total Badge Count (same as REWARDS page) */}
                    <div className="pb-4 border-b border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">Total Badges</p>
                      <motion.p
                        key={totalRewardBadges}
                        initial={{ scale: 1.2, color: "#FEE2E2" }}
                        animate={{ scale: 1, color: "#DC2626" }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl font-bold text-primary"
                      >
                        {totalRewardBadges}
                      </motion.p>
                    </div>

                    {/* Consecutive Training Days */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Current Consecutive Days</p>
                        <div className="flex items-baseline gap-2">
                          <motion.p
                            key={mockCurrentConsecutiveDays}
                            initial={{ scale: 1.2, color: "#FEF3C7" }}
                            animate={{ scale: 1, color: "#FCD34D" }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl font-bold text-yellow-400"
                          >
                            {mockCurrentConsecutiveDays}
                          </motion.p>
                          <span className="text-lg text-gray-400">days</span>
                        </div>
                        {mockCurrentConsecutiveDays > 0 ? (
                          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            <span>🔥</span>
                            <span>Currently on streak!</span>
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">No streak record</p>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Longest Consecutive Days</p>
                        <div className="flex items-baseline gap-2">
                          <motion.p
                            key={mockMaxConsecutiveDays}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-2xl font-bold text-yellow-300"
                          >
                            {mockMaxConsecutiveDays}
                          </motion.p>
                          <span className="text-base text-gray-400">days</span>
                        </div>
                        {mockMaxConsecutiveDays > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Best record: {mockMaxConsecutiveDays} days
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Workout Status */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Today's Workout</h2>
              <div className="flex items-center gap-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    todayBadgeCompleted ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
                <p className="text-lg">
                  {todayBadgeCompleted ? "Completed" : "Not Completed"}
                </p>
              </div>
            </div>

            {/* Total Badge Count and Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-2">Total Badges</h2>
                <motion.p
                  key={totalRewardBadges}
                  initial={{ scale: 1.2, color: "#FEE2E2" }}
                  animate={{ scale: 1, color: "#DC2626" }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl font-bold text-primary"
                >
                  {totalRewardBadges}
                </motion.p>
                <p className="text-sm text-gray-400 mt-2">REWARDS badges earned</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-2">Token Balance</h2>
                <motion.p
                  key={tokenAmount}
                  initial={{ scale: 1.2, color: "#FEF3C7" }}
                  animate={{ scale: 1, color: "#FCD34D" }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl font-bold text-yellow-400"
                >
                  {tokenAmount.toLocaleString()}
                </motion.p>
                <p className="text-sm text-gray-400 mt-2">Exchangeable tokens</p>
                {/* Development: Grant 20,000 tokens button */}
                <button
                  onClick={() => {
                    addTokens(20000);
                    toast.success('Granted 20,000 tokens!', {
                      icon: '💰',
                      duration: 3000,
                    });
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  +20,000 Tokens (Dev)
                </button>
              </div>
            </div>

            {/* Earned Badges List */}
            {unlockedBadges.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Earned Badges</h2>
                  <Link
                    href="/rewards"
                    className="text-sm text-primary hover:underline"
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedBadges.slice(0, 6).map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border-2 ${rarityColors[badge.rarity]} shadow-lg`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{badge.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-base font-bold ${rarityTextColors[badge.rarity]} truncate`}>
                              {badge.name}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${rarityColors[badge.rarity]} flex-shrink-0`}>
                              {badge.rarity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{badge.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/workout"
                className="bg-primary hover:bg-primary-dark rounded-lg p-6 text-center font-bold text-lg transition-colors"
              >
                Start Workout
              </Link>
              <Link
                href="/ranking"
                className="bg-secondary hover:bg-secondary-light rounded-lg p-6 text-center font-bold text-lg transition-colors"
              >
                View Ranking
              </Link>
              <Link
                href="/exchange"
                className="bg-yellow-600 hover:bg-yellow-700 rounded-lg p-6 text-center font-bold text-lg transition-colors"
              >
                Exchange Tokens
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

