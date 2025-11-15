'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { RankingList } from "@/components/RankingList";
import { useAppStore } from "@/store/useAppStore";
import { PrizeTicketCard } from "@/components/PrizeTicketCard";

type LiveScoreMap = Record<string, number>;

export default function RankingPage() {
  const { address, rankings, userRank, checkPrizeTicket, trainers } = useAppStore();
  const hasPrizeTicket = address ? checkPrizeTicket(address) : false;
  const [liveTrainerScores, setLiveTrainerScores] = useState<LiveScoreMap>({});

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

  useEffect(() => {
    if (!trainers.length) return;
    const intervalId = setInterval(() => {
      setLiveTrainerScores((prev) => {
        const next: LiveScoreMap = { ...prev };
        trainers.forEach((trainer) => {
          const current = next[trainer.id] ?? trainer.trainerScore;
          const delta = Math.floor(Math.random() * 25) + 5;
          next[trainer.id] = current + delta;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(intervalId);
  }, [trainers]);

  const trainerLeaderboard = useMemo(() => {
    if (!trainers.length) return [];
    return [...trainers]
      .map((trainer) => {
        const liveScore = liveTrainerScores[trainer.id] ?? trainer.trainerScore;
        const userContributionPercent =
          liveScore === 0 ? 0 : Math.round((trainer.userScore / liveScore) * 100);
        return {
          ...trainer,
          liveScore,
          userContributionPercent,
        };
      })
      .sort((a, b) => b.liveScore - a.liveScore);
  }, [liveTrainerScores, trainers]);

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
              className="px-4 py-3 text-sm font-medium text-white border-b-2 border-primary"
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

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Weekly Ranking</h2>

        {!address ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-8">
              Please connect your wallet to view the ranking
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-8">
            {/* User ranking information */}
            {userRank && (
              <div className="bg-primary/20 border-2 border-primary rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Your Rank</h3>
                <p className="text-4xl font-bold text-primary">#{userRank}</p>
                {hasPrizeTicket && (
                  <div className="mt-4">
                    <p className="text-green-400 font-medium">
                      🎉 Congratulations! You earned a Prize Ticket!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Prize Ticket display */}
            {hasPrizeTicket && (
              <div>
                <h3 className="text-xl font-bold mb-4">Earned Prize Ticket</h3>
                <PrizeTicketCard />
              </div>
            )}

            {/* Ranking section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">User Ranking</h3>
                <RankingList />
              </div>
              {trainerLeaderboard.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Player Real-time Ranking</h3>
                    <p className="text-sm text-gray-400">Updates every 5 seconds</p>
                  </div>
                  <div className="space-y-4">
                    {trainerLeaderboard.map((trainer, index) => (
                      <motion.div
                        key={trainer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-gray-700/50">
                              {trainer.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={trainer.image}
                                  alt={trainer.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl">🥊</span>
                              )}
                            </div>
                            <span className="absolute -top-2 -left-2 bg-primary/80 text-xs font-bold px-2 py-0.5 rounded-full">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-bold text-white flex items-center gap-2">
                                  {trainer.name}
                                  <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                                    LIVE
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  Your Score: {trainer.userScore.toLocaleString()}pt
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {trainer.liveScore.toLocaleString()}pt
                                </p>
                                <p className="text-xs text-gray-400">Total Score</p>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Contribution</span>
                                <span>{trainer.userContributionPercent}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                  key={`bar-${trainer.id}-${trainer.userContributionPercent}`}
                                  className="bg-primary h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${trainer.userContributionPercent}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


