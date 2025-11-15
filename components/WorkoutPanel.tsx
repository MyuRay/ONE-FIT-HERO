'use client';

import { useAppStore } from '@/store/useAppStore';
import { WorkoutDifficulty } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { WorkoutVideoPlayer, VideoState } from './WorkoutVideoPlayer';
import { useWalletKit } from '@mysten/wallet-kit';
import { suiService } from '@/lib/sui';
import { AICoaching } from './AICoaching';

const difficultyLabels: Record<WorkoutDifficulty, { label: string; emoji: string; color: string }> = {
  beginner: { label: 'Beginner', emoji: '🟢', color: 'green' },
  intermediate: { label: 'Intermediate', emoji: '🟡', color: 'yellow' },
  advanced: { label: 'Advanced', emoji: '🔴', color: 'red' },
};

const caloriesPerMinute: Record<WorkoutDifficulty, number> = {
  beginner: 8,
  intermediate: 12,
  advanced: 18,
};

const difficultyMultipliers: Record<WorkoutDifficulty, number> = {
  beginner: 1,
  intermediate: 1.5,
  advanced: 2,
};

const difficultyNumeric: Record<WorkoutDifficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function WorkoutPanel() {
  const {
    selectedTrainerId,
    trainers,
    todayBadgeCompleted,
    completeWorkoutSession,
    getTotalBadges,
    getTokenAmount,
    address,
  } = useAppStore();
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const [selectedDifficulty, setSelectedDifficulty] = useState<WorkoutDifficulty | null>(null);
  const [isWorkingOut, setIsWorkingOut] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [trainerScoreIncrement, setTrainerScoreIncrement] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [liveTrainerScore, setLiveTrainerScore] = useState(0);
  const [reproductionRate, setReproductionRate] = useState<number>(100); // AI-determined reproduction rate (0-100%)
  const [showEndWorkoutDialog, setShowEndWorkoutDialog] = useState(false); // End workout confirmation dialog

  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trainerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => trainer.id === selectedTrainerId) || null,
    [trainers, selectedTrainerId]
  );

  const totalBadges = getTotalBadges();
  const tokenAmount = getTokenAmount();

  const currentUserScore = useMemo(() => {
    if (!selectedDifficulty) return 0;
    return Math.floor((workoutTime / 60) * caloriesPerMinute[selectedDifficulty]);
  }, [selectedDifficulty, workoutTime]);

  const currentTrainerScore = useMemo(() => {
    return liveTrainerScore + (isWorkingOut ? trainerScoreIncrement : 0);
  }, [isWorkingOut, liveTrainerScore, trainerScoreIncrement]);

  useEffect(() => {
    if (!selectedTrainer) {
      setLiveTrainerScore(0);
      return;
    }
    setLiveTrainerScore(selectedTrainer.trainerScore);
  }, [selectedTrainer]);

  useEffect(() => {
    if (!selectedTrainer) return;
    const intervalId = setInterval(() => {
      setLiveTrainerScore((prev) => prev + Math.floor(Math.random() * 25) + 5);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [selectedTrainer]);

  const handleCompleteWorkout = useCallback(async () => {
    if (!selectedTrainer || !selectedDifficulty) return;

    if (todayBadgeCompleted) {
      toast.error('Today\'s workout is already completed');
      return;
    }

    if (!address) {
      toast.error('Wallet is not connected');
      return;
    }

    setIsWorkingOut(false);

    // Get AI reproduction rate evaluation
    const finalReproductionRate = reproductionRate;
    
    // If reproduction rate is 100%, award calories equal to time as score and tokens
    const workoutMinutes = workoutTime / 60; // Minutes (including decimals)
    let finalUserScore = 0;
    
    if (finalReproductionRate >= 100) {
      // 100% reproduction rate: Award calories equal to time
      finalUserScore = Math.floor(workoutMinutes * caloriesPerMinute[selectedDifficulty]);
    } else {
      // If reproduction rate is less than 100%, adjust based on reproduction rate
      finalUserScore = Math.floor(
        (workoutMinutes * caloriesPerMinute[selectedDifficulty]) * (finalReproductionRate / 100)
      );
    }
    
    // Set minimum value to 1
    finalUserScore = Math.max(1, finalUserScore);
    
    const adjustedTrainerScore = Math.max(
      1,
      Math.floor(trainerScoreIncrement * difficultyMultipliers[selectedDifficulty])
    );

    try {
      const trainerNFT = await suiService.getTrainerNFT(address);
      const tokenBalance = await suiService.getTokenBalance(address);

      if (trainerNFT && tokenBalance && signAndExecuteTransactionBlock) {
        await suiService.completeWorkoutSession(
          trainerNFT.id,
          tokenBalance.objectId,
          difficultyNumeric[selectedDifficulty],
          finalUserScore,
          adjustedTrainerScore,
          signAndExecuteTransactionBlock
        );

        toast.success('Saved to blockchain!', { icon: '⛓️', duration: 3000 });
      } else {
        toast('On-chain save skipped (NFT not obtained or not configured)', { icon: 'ℹ️', duration: 3000 });
      }
    } catch (error: any) {
      toast.error(`Failed to save on-chain: ${error?.message ?? 'Unknown error'}`);
    } finally {
      completeWorkoutSession(
        selectedTrainer.id,
        selectedDifficulty,
        finalUserScore,
        adjustedTrainerScore,
        workoutMinutes
      );
    }

    setShowResults(true);
    toast.success('Workout Complete!', { icon: '🎉', duration: 3000 });
    setTimeout(() => {
      const reproductionText = finalReproductionRate >= 100
        ? 'Reproduction Rate: 100%!' 
        : `Reproduction Rate: ${finalReproductionRate}%`;
      toast(`AI Evaluation: ${reproductionText}\nCalories Burned: ${finalUserScore}kcal = Tokens +${finalUserScore}`, {
        icon: finalReproductionRate >= 100 ? '✨' : '🔥',
        duration: 4000,
      });
    }, 500);
  }, [
    address,
    completeWorkoutSession,
    selectedDifficulty,
    selectedTrainer,
    signAndExecuteTransactionBlock,
    todayBadgeCompleted,
    trainerScoreIncrement,
    workoutTime,
    reproductionRate,
  ]);

  const handleVideoStateChange = useCallback(
    (state: VideoState, currentTime: number, duration: number) => {
      setVideoState(state);
      setVideoCurrentTime(currentTime);
      if (duration > 0) {
        setVideoDuration(duration);
      }

      if (state === 'ended' && isWorkingOut) {
        setTimeout(() => handleCompleteWorkout(), 100);
      }
    },
    [handleCompleteWorkout, isWorkingOut]
  );

  useEffect(() => {
    if (!isWorkingOut) {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
        workoutTimerRef.current = null;
      }
      return;
    }

    workoutTimerRef.current = setInterval(() => {
      setWorkoutTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
        workoutTimerRef.current = null;
      }
    };
  }, [isWorkingOut]);

  useEffect(() => {
    if (!isWorkingOut || videoState !== 'playing') {
      if (trainerTimerRef.current) {
        clearInterval(trainerTimerRef.current);
        trainerTimerRef.current = null;
      }
      return;
    }

    trainerTimerRef.current = setInterval(() => {
      setTrainerScoreIncrement((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 1000);

    return () => {
      if (trainerTimerRef.current) {
        clearInterval(trainerTimerRef.current);
        trainerTimerRef.current = null;
      }
    };
  }, [isWorkingOut, videoState]);

  useEffect(() => {
    if (isWorkingOut && videoDuration > 0 && workoutTime >= Math.floor(videoDuration)) {
      handleCompleteWorkout();
    }
  }, [handleCompleteWorkout, isWorkingOut, videoDuration, workoutTime]);

  const handleVideoEnd = useCallback(() => {
    if (isWorkingOut) {
      handleCompleteWorkout();
    }
  }, [handleCompleteWorkout, isWorkingOut]);

  const handleStartWorkout = useCallback(() => {
    if (!selectedTrainer) {
      toast.error('Please select a trainer');
      return;
    }

    if (!selectedDifficulty) {
      toast.error('Please select a difficulty');
      return;
    }

    if (todayBadgeCompleted) {
      toast.error('Today\'s workout is already completed');
      return;
    }

    setIsWorkingOut(true);
    setWorkoutTime(0);
    setTrainerScoreIncrement(0);
    setShowResults(false);
    setVideoState('idle');

    toast.success('Training started! Please play the video', {
      icon: '🎬',
      duration: 3000,
    });
  }, [selectedDifficulty, selectedTrainer, todayBadgeCompleted]);

  if (!selectedTrainer) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-center">
        <p className="text-yellow-400 mb-4">No trainer selected</p>
        <a
          href="/trainers"
          className="inline-block px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors"
        >
          Select Trainer
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start gap-4">
          {/* Trainer Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-gray-700/50">
              {selectedTrainer.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedTrainer.image}
                  alt={selectedTrainer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🥊</span>
              )}
            </div>
          </div>
          
          {/* Trainer Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-primary">{selectedTrainer.name}</h2>
            {selectedTrainer.description && (
              <p className="text-gray-400 mb-4">{selectedTrainer.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-400">Your Score</p>
                <p className="text-xl font-bold text-primary">
                  {selectedTrainer.userScore.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trainer Score</p>
                <p className="text-xl font-bold text-yellow-400">
                  {currentTrainerScore.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isWorkingOut && !showResults && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Select Difficulty</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['beginner', 'intermediate', 'advanced'] as WorkoutDifficulty[]).map((difficulty) => {
              const info = difficultyLabels[difficulty];
              const isActive = selectedDifficulty === difficulty;
              return (
                <motion.button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive ? `border-${info.color}-500 bg-${info.color}-900/20` : 'border-gray-700 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">{info.emoji}</div>
                  <p className="font-bold">{info.label}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {difficulty === 'beginner' && '8kcal/min'}
                    {difficulty === 'intermediate' && '12kcal/min'}
                    {difficulty === 'advanced' && '18kcal/min'}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Training Video and Camera Side-by-Side */}
      {selectedDifficulty && isWorkingOut && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Coaching Video */}
          <div>
            <WorkoutVideoPlayer
              difficulty={selectedDifficulty}
              isPlaying={isWorkingOut}
              onVideoEnd={handleVideoEnd}
              onVideoStateChange={handleVideoStateChange}
            />
          </div>
          
          {/* Right: Your Camera and AI Coaching */}
          <div>
            <AICoaching 
              workoutTime={workoutTime} 
              isActive={isWorkingOut}
              onReproductionRateChange={setReproductionRate}
            />
          </div>
        </div>
      )}

      {/* Before training starts, show video only */}
      {selectedDifficulty && !isWorkingOut && (
        <WorkoutVideoPlayer
          difficulty={selectedDifficulty}
          isPlaying={isWorkingOut}
          onVideoEnd={handleVideoEnd}
          onVideoStateChange={handleVideoStateChange}
        />
      )}

      <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
        <AnimatePresence mode="wait">
          {isWorkingOut ? (
            <motion.div
              key="working"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Copy Training in Progress...</h3>
                <p className="text-gray-400">Follow the trainer's movements!</p>
                <div className="text-sm text-gray-400">
                  Video Status:
                  <span className={`ml-2 font-bold ${
                    videoState === 'playing'
                      ? 'text-green-400'
                      : videoState === 'paused'
                      ? 'text-yellow-400'
                      : videoState === 'ended'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}>
                    {videoState === 'playing'
                      ? '▶️ Playing'
                      : videoState === 'paused'
                      ? '⏸️ Paused'
                      : videoState === 'ended'
                      ? '⏹️ Ended'
                      : '⏸️ Idle'}
                  </span>
                </div>
                <div className="text-4xl font-bold text-primary">
                  Playback Time: {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
                  {videoDuration > 0 && (
                    <span className="text-xl text-gray-400 ml-2">
                      / {Math.floor(videoDuration / 60)}:{(Math.floor(videoDuration) % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <motion.button
                  onClick={() => setShowEndWorkoutDialog(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  End Workout
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Your Score (Calories Burned)</p>
                  <motion.p
                    key={currentUserScore}
                    initial={{ scale: 1.2, color: '#FEE2E2' }}
                    animate={{ scale: 1, color: '#DC2626' }}
                    className="text-3xl font-bold text-primary"
                  >
                    {currentUserScore}
                  </motion.p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDifficulty && `${caloriesPerMinute[selectedDifficulty]}kcal/min`}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Trainer Score (Cumulative)</p>
                  <motion.p
                    key={currentTrainerScore}
                    initial={{ scale: 1.2, color: '#FEF3C7' }}
                    animate={{ scale: 1, color: '#FCD34D' }}
                    className="text-3xl font-bold text-yellow-400"
                  >
                    {currentTrainerScore.toLocaleString()}
                  </motion.p>
                  {trainerScoreIncrement > 0 && selectedDifficulty && (
                    <p className="text-xs text-gray-500 mt-1">
                      This Session: +
                      {Math.floor(trainerScoreIncrement * difficultyMultipliers[selectedDifficulty]).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {selectedDifficulty && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-700/50">
                  <p className="text-sm text-gray-300 mb-1">💰 Tokens Earned (Estimated)</p>
                  <p className="text-3xl font-bold text-yellow-400">+{currentUserScore}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Calories Burned = Tokens Earned (1:1) | Training Time: {Math.floor(workoutTime / 60)}min {workoutTime % 60}sec
                  </p>
                </div>
              )}
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold">Training Complete!</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-primary/20 rounded-lg p-4 border border-primary">
                  <p className="text-sm text-gray-400 mb-1">Your Score (Calories Burned)</p>
                  <p className="text-3xl font-bold text-primary">{currentUserScore}</p>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600">
                  <p className="text-sm text-gray-400 mb-1">Trainer Score (Cumulative)</p>
                  <p className="text-3xl font-bold text-yellow-400">{currentTrainerScore.toLocaleString()}</p>
                </div>
              </div>
              <motion.button
                onClick={() => {
                  setShowResults(false);
                  setSelectedDifficulty(null);
                }}
                className="mt-4 px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Train Again
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4 text-center"
            >
              <div className="text-6xl mb-4">🏋️</div>
              <h3 className="text-2xl font-bold">Ready to Workout</h3>
              <p className="text-gray-400">Let's start copy training with the trainer!</p>
              {todayBadgeCompleted ? (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-green-400 font-medium">✅ Today's workout is completed</p>
                </div>
              ) : (
                <motion.button
                  onClick={handleStartWorkout}
                  disabled={!selectedDifficulty}
                  className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                    selectedDifficulty ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={selectedDifficulty ? { scale: 1.05 } : {}}
                  whileTap={selectedDifficulty ? { scale: 0.95 } : {}}
                >
                  Start Workout
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">Today's Badge</p>
          <p className="text-2xl font-bold">{todayBadgeCompleted ? '✅ Completed' : '⏳ Not Completed'}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">Total Badges</p>
          <p className="text-2xl font-bold text-primary">{totalBadges}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">Token Balance</p>
          <p className="text-2xl font-bold text-yellow-400">{tokenAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* End Workout Confirmation Dialog */}
      <AnimatePresence>
        {showEndWorkoutDialog && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEndWorkoutDialog(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 p-6 max-w-md w-full shadow-2xl"
              >
                <div className="text-center space-y-4">
                  {/* Icon */}
                  <div className="text-6xl mb-4">🏋️</div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    End Training?
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 mb-6">
                    Current training time and score will be recorded.
                    <br />
                    You can check the results after finishing.
                  </p>

                  {/* Current Score Display */}
                  {selectedDifficulty && (
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Training Time</p>
                          <p className="text-lg font-bold text-primary">
                            {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Estimated Calories</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {currentUserScore}kcal
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">AI Evaluation: Reproduction Rate</p>
                        <p className="text-xl font-bold text-green-400">
                          {reproductionRate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowEndWorkoutDialog(false)}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowEndWorkoutDialog(false);
                        handleCompleteWorkout();
                      }}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      End
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
