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
  beginner: { label: '初級', emoji: '🟢', color: 'green' },
  intermediate: { label: '中級', emoji: '🟡', color: 'yellow' },
  advanced: { label: '上級', emoji: '🔴', color: 'red' },
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
  const [reproductionRate, setReproductionRate] = useState<number>(100); // AI判定による再現度（0-100%）
  const [showEndWorkoutDialog, setShowEndWorkoutDialog] = useState(false); // トレーニング終了確認ダイアログ

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
      toast.error('今日のワークアウトは既に完了しています');
      return;
    }

    if (!address) {
      toast.error('ウォレットが接続されていません');
      return;
    }

    setIsWorkingOut(false);

    // AIによる再現度判定を取得
    const finalReproductionRate = reproductionRate;
    
    // 再現度が100%の場合、時間分のカロリーをそのままスコア・トークンとして付与
    const workoutMinutes = workoutTime / 60; // 分単位（小数点を含む）
    let finalUserScore = 0;
    
    if (finalReproductionRate >= 100) {
      // 再現度100%: 時間分のカロリーをそのまま付与
      finalUserScore = Math.floor(workoutMinutes * caloriesPerMinute[selectedDifficulty]);
    } else {
      // 再現度が100%未満の場合、再現度に応じて調整
      finalUserScore = Math.floor(
        (workoutMinutes * caloriesPerMinute[selectedDifficulty]) * (finalReproductionRate / 100)
      );
    }
    
    // 最小値を1に設定
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

        toast.success('ブロックチェーンに保存しました！', { icon: '⛓️', duration: 3000 });
      } else {
        toast.info('オンチェーン保存をスキップ（NFT未取得または未設定）', { icon: 'ℹ️', duration: 3000 });
      }
    } catch (error: any) {
      toast.error(`オンチェーン保存に失敗しました: ${error?.message ?? 'Unknown error'}`);
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
    toast.success('ワークアウト完了！', { icon: '🎉', duration: 3000 });
    setTimeout(() => {
      const reproductionText = finalReproductionRate >= 100 
        ? '再現度100%！' 
        : `再現度${finalReproductionRate}%`;
      toast(`AI判定: ${reproductionText}\n消費カロリー: ${finalUserScore}kcal = トークン +${finalUserScore}`, {
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
      toast.error('トレーナーを選択してください');
      return;
    }

    if (!selectedDifficulty) {
      toast.error('難易度を選択してください');
      return;
    }

    if (todayBadgeCompleted) {
      toast.error('今日のワークアウトは既に完了しています');
      return;
    }

    setIsWorkingOut(true);
    setWorkoutTime(0);
    setTrainerScoreIncrement(0);
    setShowResults(false);
    setVideoState('idle');

    toast.success('トレーニングを開始しました！動画を再生してください', {
      icon: '🎬',
      duration: 3000,
    });
  }, [selectedDifficulty, selectedTrainer, todayBadgeCompleted]);

  if (!selectedTrainer) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-center">
        <p className="text-yellow-400 mb-4">トレーナーが選択されていません</p>
        <a
          href="/trainers"
          className="inline-block px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors"
        >
          トレーナーを選択
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start gap-4">
          {/* トレーナー画像 */}
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
          
          {/* トレーナー情報 */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-primary">{selectedTrainer.name}</h2>
            {selectedTrainer.description && (
              <p className="text-gray-400 mb-4">{selectedTrainer.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-400">あなたのスコア</p>
                <p className="text-xl font-bold text-primary">
                  {selectedTrainer.userScore.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">トレーナーのスコア</p>
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
          <h3 className="text-xl font-bold mb-4">難易度を選択</h3>
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
                    {difficulty === 'beginner' && '8kcal/分'}
                    {difficulty === 'intermediate' && '12kcal/分'}
                    {difficulty === 'advanced' && '18kcal/分'}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* トレーニング動画とカメラを横並び表示 */}
      {selectedDifficulty && isWorkingOut && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左側: コーチング動画 */}
          <div>
            <WorkoutVideoPlayer
              difficulty={selectedDifficulty}
              isPlaying={isWorkingOut}
              onVideoEnd={handleVideoEnd}
              onVideoStateChange={handleVideoStateChange}
            />
          </div>
          
          {/* 右側: 自分のカメラ画面とAIコーチング */}
          <div>
            <AICoaching 
              workoutTime={workoutTime} 
              isActive={isWorkingOut}
              onReproductionRateChange={setReproductionRate}
            />
          </div>
        </div>
      )}

      {/* トレーニング開始前は動画のみ表示 */}
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
                <h3 className="text-2xl font-bold">コピートレーニング中...</h3>
                <p className="text-gray-400">トレーナーの動きを真似しましょう！</p>
                <div className="text-sm text-gray-400">
                  動画状態:
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
                      ? '▶️ 再生中'
                      : videoState === 'paused'
                      ? '⏸️ 一時停止'
                      : videoState === 'ended'
                      ? '⏹️ 終了'
                      : '⏸️ 待機中'}
                  </span>
                </div>
                <div className="text-4xl font-bold text-primary">
                  再生時間: {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
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
                  トレーニング終了
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">あなたのスコア（消費カロリー）</p>
                  <motion.p
                    key={currentUserScore}
                    initial={{ scale: 1.2, color: '#FEE2E2' }}
                    animate={{ scale: 1, color: '#DC2626' }}
                    className="text-3xl font-bold text-primary"
                  >
                    {currentUserScore}
                  </motion.p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDifficulty && `${caloriesPerMinute[selectedDifficulty]}kcal/分`}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">トレーナーのスコア（累積）</p>
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
                      今回増分: +
                      {Math.floor(trainerScoreIncrement * difficultyMultipliers[selectedDifficulty]).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {selectedDifficulty && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-700/50">
                  <p className="text-sm text-gray-300 mb-1">💰 獲得トークン（推定）</p>
                  <p className="text-3xl font-bold text-yellow-400">+{currentUserScore}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    消費カロリー = 獲得トークン（1:1） | トレーニング時間: {Math.floor(workoutTime / 60)}分 {workoutTime % 60}秒
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
              <h3 className="text-2xl font-bold">トレーニング完了！</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-primary/20 rounded-lg p-4 border border-primary">
                  <p className="text-sm text-gray-400 mb-1">あなたのスコア（消費カロリー）</p>
                  <p className="text-3xl font-bold text-primary">{currentUserScore}</p>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600">
                  <p className="text-sm text-gray-400 mb-1">トレーナーのスコア（累積）</p>
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
                もう一度トレーニング
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
              <h3 className="text-2xl font-bold">ワークアウト準備完了</h3>
              <p className="text-gray-400">トレーナーと一緒にコピートレーニングを始めましょう！</p>
              {todayBadgeCompleted ? (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-green-400 font-medium">✅ 今日のワークアウトは完了しています</p>
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
                  ワークアウト開始
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">今日のバッジ</p>
          <p className="text-2xl font-bold">{todayBadgeCompleted ? '✅ 完了' : '⏳ 未完了'}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">累計バッジ数</p>
          <p className="text-2xl font-bold text-primary">{totalBadges}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">所持トークン</p>
          <p className="text-2xl font-bold text-yellow-400">{tokenAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* トレーニング終了確認ダイアログ */}
      <AnimatePresence>
        {showEndWorkoutDialog && (
          <>
            {/* オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEndWorkoutDialog(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* ダイアログ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 p-6 max-w-md w-full shadow-2xl"
              >
                <div className="text-center space-y-4">
                  {/* アイコン */}
                  <div className="text-6xl mb-4">🏋️</div>
                  
                  {/* タイトル */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    トレーニングを終了しますか？
                  </h3>
                  
                  {/* 説明 */}
                  <p className="text-gray-400 mb-6">
                    現在のトレーニング時間とスコアが記録されます。
                    <br />
                    終了後は結果を確認できます。
                  </p>

                  {/* 現在のスコア表示 */}
                  {selectedDifficulty && (
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">トレーニング時間</p>
                          <p className="text-lg font-bold text-primary">
                            {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">推定カロリー</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {currentUserScore}kcal
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">AI判定: 再現度</p>
                        <p className="text-xl font-bold text-green-400">
                          {reproductionRate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ボタン */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowEndWorkoutDialog(false)}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      キャンセル
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
                      終了する
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
