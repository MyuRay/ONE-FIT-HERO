'use client';

import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TrainerCard } from "@/components/TrainerCard";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function TrainersPage() {
  const { trainers, selectedTrainerId, setSelectedTrainer, address } = useAppStore();

  const handleSelectTrainer = (trainerId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }
    setSelectedTrainer(trainerId);
    toast.success('Trainer selected!', { icon: '✅' });
  };

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
              className="px-4 py-3 text-sm font-medium text-white border-b-2 border-primary"
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

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Select Trainer</h2>
        
        {!address ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-8">
              Please connect your wallet to select a trainer
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer, index) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrainerCard
                  trainer={trainer}
                  onClick={() => handleSelectTrainer(trainer.id)}
                />
                {selectedTrainerId === trainer.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-center"
                  >
                    <span className="px-3 py-1 bg-primary text-sm rounded-full">
                      Selected
                    </span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

