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

  // 初期化: 新しいトレーナーが追加されたらライブスコアに登録
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

  // モックのリアルタイム更新: 5秒ごとにランダム増加
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
  
  // リアルタイムランキングと同じ計算方法: 全トレーナーのスコアを合計
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
  
  // モックデータ: 累計トレーニング回数と連続トレーニング日数
  const mockTotalWorkouts = 48; // 累計トレーニング回数
  const mockWeeklyWorkouts = 6; // 直近7日間のトレーニング回数
  const mockCurrentConsecutiveDays = 5; // 現在の連続トレーニング日数
  const mockMaxConsecutiveDays = 12; // 最長連続トレーニング日数
  
  // 各トレーナーへの貢献度を計算（REWARDSページと同じ）
  const trainerContributions = useMemo(() => {
    const contributions = new Map<string, number>();
    trainers.forEach((trainer) => {
      contributions.set(trainer.id, trainer.userScore);
    });
    return contributions;
  }, [trainers]);

  // 最大貢献度のトレーナーを取得
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
      // 連続日数バッジ
      {
        id: 'consecutive-7',
        name: '7日間連続チャレンジ',
        description: '7日間連続でトレーニングを完了',
        emoji: '🔥',
        rarity: 'common',
        unlocked: mockCurrentConsecutiveDays >= 7,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 7,
      },
      {
        id: 'consecutive-14',
        name: '14日間連続マスター',
        description: '14日間連続でトレーニングを完了',
        emoji: '⚡',
        rarity: 'rare',
        unlocked: mockCurrentConsecutiveDays >= 14,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 14,
      },
      {
        id: 'consecutive-30',
        name: '30日間連続キング',
        description: '30日間連続でトレーニングを完了',
        emoji: '👑',
        rarity: 'epic',
        unlocked: mockCurrentConsecutiveDays >= 30,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 30,
      },
      {
        id: 'consecutive-60',
        name: '60日間連続レジェンド',
        description: '60日間連続でトレーニングを完了',
        emoji: '🏆',
        rarity: 'legendary',
        unlocked: mockCurrentConsecutiveDays >= 60,
        progress: mockCurrentConsecutiveDays,
        maxProgress: 60,
      },
      // 週間1位バッジ
      {
        id: 'weekly-champion',
        name: '週間チャンピオン',
        description: '週次ランキングで1位を獲得',
        emoji: '🥇',
        rarity: 'epic',
        unlocked: userRank === 1,
      },
      {
        id: 'weekly-top3',
        name: '週間トップ3',
        description: '週次ランキングで3位以内に入る',
        emoji: '🥉',
        rarity: 'rare',
        unlocked: userRank !== null && userRank <= 3,
      },
      // 累計トレーニング回数バッジ
      {
        id: 'workouts-10',
        name: 'トレーニング初心者',
        description: '累計10回のトレーニングを完了',
        emoji: '💪',
        rarity: 'common',
        unlocked: mockTotalWorkouts >= 10,
        progress: mockTotalWorkouts,
        maxProgress: 10,
      },
      {
        id: 'workouts-50',
        name: 'トレーニング上級者',
        description: '累計50回のトレーニングを完了',
        emoji: '💥',
        rarity: 'rare',
        unlocked: mockTotalWorkouts >= 50,
        progress: mockTotalWorkouts,
        maxProgress: 50,
      },
      {
        id: 'workouts-100',
        name: 'トレーニングマスター',
        description: '累計100回のトレーニングを完了',
        emoji: '🎯',
        rarity: 'epic',
        unlocked: mockTotalWorkouts >= 100,
        progress: mockTotalWorkouts,
        maxProgress: 100,
      },
      {
        id: 'workouts-500',
        name: 'トレーニングレジェンド',
        description: '累計500回のトレーニングを完了',
        emoji: '🌟',
        rarity: 'legendary',
        unlocked: mockTotalWorkouts >= 500,
        progress: mockTotalWorkouts,
        maxProgress: 500,
      },
      // 累計スコアバッジ
      {
        id: 'score-10000',
        name: 'スコアマイルストーン',
        description: '累計スコア10,000pt達成',
        emoji: '⭐',
        rarity: 'common',
        unlocked: totalScore >= 10000,
        progress: totalScore,
        maxProgress: 10000,
      },
      {
        id: 'score-50000',
        name: 'スコアチャンピオン',
        description: '累計スコア50,000pt達成',
        emoji: '✨',
        rarity: 'rare',
        unlocked: totalScore >= 50000,
        progress: totalScore,
        maxProgress: 50000,
      },
      {
        id: 'score-100000',
        name: 'スコアレジェンド',
        description: '累計スコア100,000pt達成',
        emoji: '💫',
        rarity: 'epic',
        unlocked: totalScore >= 100000,
        progress: totalScore,
        maxProgress: 100000,
      },
      // 貢献度バッジ
      {
        id: 'contribution-hero',
        name: '貢献ヒーロー',
        description: `最も選手の応援度に貢献: ${maxContributionTrainer?.name || 'N/A'}`,
        emoji: '🦸',
        rarity: 'epic',
        unlocked: maxContributionTrainer !== null && (trainerContributions.get(maxContributionTrainer.id) || 0) > 0,
      },
      {
        id: 'trainer-supporter',
        name: 'トレーナーサポーター',
        description: 'すべてのトレーナーに貢献',
        emoji: '🤝',
        rarity: 'rare',
        unlocked: trainerContributions.size >= trainers.length && trainers.length > 0,
      },
    ];

    return badgesList;
  }, [mockCurrentConsecutiveDays, mockTotalWorkouts, userRank, totalScore, maxContributionTrainer, trainerContributions, trainers.length]);

  // 獲得済みバッジ
  const unlockedBadges = useMemo(() => {
    return rewardBadges.filter((b) => b.unlocked);
  }, [rewardBadges]);

  // 累計バッジ数（REWARDSページと同じ）
  const totalRewardBadges = unlockedBadges.length;
  
  // 選択中のトレーナーの貢献度を計算
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
      {/* ヘッダー */}
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

      {/* ナビゲーション */}
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

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {!address ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">ウォレットを接続してください</h2>
            <p className="text-gray-400 mb-8">
              Suiウォレットを接続して、トレーニングを始めましょう！
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-8">
            {/* ウォレットアドレス表示 */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">接続中のウォレット</p>
              <p className="text-lg font-mono text-primary">{address}</p>
            </div>

            {/* Trainerカードと自分の記録を2列で表示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左側: 選択中のトレーナー */}
              <div>
                <h2 className="text-2xl font-bold mb-4">選択中のトレーナー</h2>
                {selectedTrainer ? (
                  <TrainerCard trainer={selectedTrainer} rank={selectedTrainerRank} />
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-center">
                    <p className="text-yellow-400 mb-4">トレーナーが選択されていません</p>
                    <Link
                      href="/trainers"
                      className="inline-block px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors"
                    >
                      トレーナーを選択
                    </Link>
                  </div>
                )}
              </div>

              {/* 右側: 自分の記録 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">自分の記録</h2>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700">
                  <div className="space-y-4">
                    {/* 累計トレーニング回数 */}
                    <div className="pb-4 border-b border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-400 mb-1">累計トレーニング回数</p>
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
                            <span className="text-lg text-gray-400">回</span>
                          </div>
                          {mockTotalWorkouts > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {mockWeeklyWorkouts}回（直近7日間）
                            </p>
                          )}
                        </div>
                        <div className="text-4xl">🏋️</div>
                      </div>
                    </div>

                    {/* 累計スコア */}
                    <div className="pb-4 border-b border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">累計スコア</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">あなたのスコア</span>
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
                          <span className="text-gray-400">トレーナーのスコア</span>
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
                          <span className="font-medium">合計スコア</span>
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

                    {/* ランキング順位 */}
                    {userRank && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">週次ランキング</p>
                        <motion.p
                          key={userRank}
                          initial={{ scale: 1.2, color: "#FEF3C7" }}
                          animate={{ scale: 1, color: "#FCD34D" }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl font-bold text-yellow-400"
                        >
                          #{userRank}位
                        </motion.p>
                      </div>
                    )}

                    {/* 累計バッジ数（REWARDSページと同じ） */}
                    <div className="pb-4 border-b border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">累計バッジ数</p>
                      <motion.p
                        key={totalRewardBadges}
                        initial={{ scale: 1.2, color: "#FEE2E2" }}
                        animate={{ scale: 1, color: "#DC2626" }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl font-bold text-primary"
                      >
                        {totalRewardBadges}個
                      </motion.p>
                    </div>

                    {/* 連続トレーニング日数 */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">現在の連続トレーニング</p>
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
                          <span className="text-lg text-gray-400">日</span>
                        </div>
                        {mockCurrentConsecutiveDays > 0 ? (
                          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            <span>🔥</span>
                            <span>現在連続中！</span>
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">連続記録なし</p>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">最長連続トレーニング</p>
                        <div className="flex items-baseline gap-2">
                          <motion.p
                            key={mockMaxConsecutiveDays}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-2xl font-bold text-yellow-300"
                          >
                            {mockMaxConsecutiveDays}
                          </motion.p>
                          <span className="text-base text-gray-400">日</span>
                        </div>
                        {mockMaxConsecutiveDays > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            最高記録: {mockMaxConsecutiveDays}日間
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 今日のワークアウト状況 */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">今日のワークアウト</h2>
              <div className="flex items-center gap-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    todayBadgeCompleted ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
                <p className="text-lg">
                  {todayBadgeCompleted ? "完了" : "未完了"}
                </p>
              </div>
            </div>

            {/* 累計バッジ数とトークン */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-2">累計バッジ数</h2>
                <motion.p
                  key={totalRewardBadges}
                  initial={{ scale: 1.2, color: "#FEE2E2" }}
                  animate={{ scale: 1, color: "#DC2626" }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl font-bold text-primary"
                >
                  {totalRewardBadges}
                </motion.p>
                <p className="text-sm text-gray-400 mt-2">REWARDSバッジ獲得数</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-2">所持トークン</h2>
                <motion.p
                  key={tokenAmount}
                  initial={{ scale: 1.2, color: "#FEF3C7" }}
                  animate={{ scale: 1, color: "#FCD34D" }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl font-bold text-yellow-400"
                >
                  {tokenAmount.toLocaleString()}
                </motion.p>
                <p className="text-sm text-gray-400 mt-2">交換可能なトークン</p>
                {/* 開発用: 20,000トークン付与ボタン */}
                <button
                  onClick={() => {
                    addTokens(20000);
                    toast.success('20,000トークンを付与しました！', {
                      icon: '💰',
                      duration: 3000,
                    });
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  +20,000トークン付与（開発用）
                </button>
              </div>
            </div>

            {/* 獲得したバッジ一覧 */}
            {unlockedBadges.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">獲得したバッジ</h2>
                  <Link
                    href="/rewards"
                    className="text-sm text-primary hover:underline"
                  >
                    すべて見る →
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

            {/* クイックアクション */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/workout"
                className="bg-primary hover:bg-primary-dark rounded-lg p-6 text-center font-bold text-lg transition-colors"
              >
                ワークアウトを開始
              </Link>
              <Link
                href="/ranking"
                className="bg-secondary hover:bg-secondary-light rounded-lg p-6 text-center font-bold text-lg transition-colors"
              >
                ランキングを見る
              </Link>
              <Link
                href="/exchange"
                className="bg-yellow-600 hover:bg-yellow-700 rounded-lg p-6 text-center font-bold text-lg transition-colors"
              >
                トークン交換
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

