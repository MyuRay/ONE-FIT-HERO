'use client';

import { useAppStore } from '@/store/useAppStore';
import { WorkoutDifficulty } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { WorkoutVideoPlayer, VideoState } from './WorkoutVideoPlayer';
import { useWalletKit } from '@mysten/wallet-kit';
import { suiService } from '@/lib/sui';

const difficultyLabels: Record<WorkoutDifficulty, { label: string; emoji: string; color: string }> = {
  beginner: { label: '初級', emoji: '🟢', color: 'green' },
  intermediate: { label: '中級', emoji: '🟡', color: 'yellow' },
  advanced: { label: '上級', emoji: '🔴', color: 'red' },
};

// 難易度別のカロリー消費量（1分あたりのkcal）
const caloriesPerMinute: Record<WorkoutDifficulty, number> = {
  beginner: 8,    // 初級: 1分あたり8kcal
  intermediate: 12, // 中級: 1分あたり12kcal
  advanced: 18,    // 上級: 1分あたり18kcal
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
  const [workoutTime, setWorkoutTime] = useState(0); // 実際の再生時間（秒）
  const [trainerScoreIncrement, setTrainerScoreIncrement] = useState(0); // トレーナースコアの増分
  const [showResults, setShowResults] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const maxWorkoutTime = videoDuration; // 最大トレーニング時間 = 動画時間
  
  const workoutTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedTrainer = trainers.find((t) => t.id === selectedTrainerId);
  const totalBadges = getTotalBadges();
  const tokenAmount = getTokenAmount();

  // あなたのスコア = 消費カロリー（リアルタイム計算）
  const currentUserScore = selectedDifficulty 
    ? Math.floor((workoutTime / 60) * caloriesPerMinute[selectedDifficulty])
    : 0;
  
  // トレーナーのスコア = 既存スコア + 増分
  const currentTrainerScore = selectedTrainer 
    ? selectedTrainer.trainerScore + trainerScoreIncrement
    : 0;

  // トレーニング完了ハンドラ
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

    // トレーニングを停止
    setIsWorkingOut(false);

    // トレーニング時間（分）を計算
    const workoutDurationMinutes = Math.floor(workoutTime / 60);
    
    // あなたのスコア = 消費カロリー
    const finalUserScore = Math.floor(workoutDurationMinutes * caloriesPerMinute[selectedDifficulty]);
    
    // 難易度倍率を適用（トレーナースコアの増分に適用）
    const multipliers = {
      beginner: { scoreMultiplier: 1.0 },
      intermediate: { scoreMultiplier: 1.5 },
      advanced: { scoreMultiplier: 2.0 },
    };
    const mult = multipliers[selectedDifficulty];
    
    // トレーナースコアの増分（難易度倍率適用）
    const adjustedTrainerScore = Math.floor(trainerScoreIncrement * mult.scoreMultiplier);
    
    // 消費カロリー = 獲得トークン
    const caloriesBurned = finalUserScore;
    const tokensEarned = caloriesBurned;

    // オンチェーン実装を試行
    try {
      // Trainer NFTとTokenBalanceを取得
      const trainerNFT = await suiService.getTrainerNFT(address);
      const tokenBalance = await suiService.getTokenBalance(address);

      if (trainerNFT && tokenBalance && signAndExecuteTransactionBlock) {
        // 難易度を数値に変換（beginner: 1, intermediate: 2, advanced: 3）
        const difficultyMap: Record<WorkoutDifficulty, number> = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
        };
        const difficultyValue = difficultyMap[selectedDifficulty];

        // オンチェーンでワークアウトセッションを完了
        const txDigest = await suiService.completeWorkoutSession(
          trainerNFT.id,
          tokenBalance.objectId,
          difficultyValue,
          finalUserScore, // 消費カロリー
          adjustedTrainerScore, // トレーナースコアの増分
          signAndExecuteTransactionBlock
        );

        toast.success('ブロックチェーンに保存しました！', {
          icon: '⛓️',
          duration: 3000,
        });

        // ローカルストアも更新（オフライン表示用）
        completeWorkoutSession(
          selectedTrainer.id,
          selectedDifficulty,
          finalUserScore, // 消費カロリー
          adjustedTrainerScore, // トレーナースコアの増分
          workoutDurationMinutes
        );
      } else {
        // オンチェーンデータが見つからない場合、ローカルのみ保存
        if (!trainerNFT || !tokenBalance) {
          toast.info('オンチェーン保存をスキップ（コントラクト未デプロイまたはNFT未取得）', {
            icon: 'ℹ️',
            duration: 3000,
          });
        }
        // ローカルストアに保存
        completeWorkoutSession(
          selectedTrainer.id,
          selectedDifficulty,
          finalUserScore, // 消費カロリー
          adjustedTrainerScore, // トレーナースコアの増分
          workoutDurationMinutes
        );
      }
    } catch (error: any) {
      console.error('Error saving to blockchain:', error);
      toast.error(`オンチェーン保存に失敗しました: ${error.message || 'Unknown error'}`);
      
      // エラーが発生してもローカルには保存
      completeWorkoutSession(
        selectedTrainer.id,
        selectedDifficulty,
        finalUserScore, // 消費カロリー
        adjustedTrainerScore, // トレーナースコアの増分
        workoutDurationMinutes
      );
    }

    setShowResults(true);

    // アニメーション付きトースト
    toast.success('ワークアウト完了！', {
      icon: '🎉',
      duration: 3000,
    });

    setTimeout(() => {
      toast(`消費カロリー: ${caloriesBurned}kcal = トークン +${tokensEarned} 獲得！`, {
        icon: '🔥',
        duration: 3000,
      });
    }, 500);
  }, [selectedTrainer, selectedDifficulty, todayBadgeCompleted, workoutTime, trainerScoreIncrement, completeWorkoutSession, address, signAndExecuteTransactionBlock]);

  // 動画の状態変更ハンドラ
  const handleVideoStateChange = useCallback((state: VideoState, currentTime: number, duration: number) => {
    // 状態を更新
    setVideoState(state);
    setVideoCurrentTime(currentTime);
    if (duration > 0) {
      setVideoDuration(duration);
    }

    // 動画が終了した場合、自動的にトレーニングを完了
    if (state === 'ended' && isWorkingOut) {
      // 少し遅延させてから完了処理を実行（状態更新を確実にするため）
      setTimeout(() => {
        handleCompleteWorkout();
      }, 100);
    }
  }, [isWorkingOut, handleCompleteWorkout]);

  // 最大トレーニング時間に達したら自動的に完了
  useEffect(() => {
    if (isWorkingOut && videoDuration > 0 && workoutTime >= Math.floor(videoDuration)) {
      handleCompleteWorkout();
    }
  }, [isWorkingOut, videoDuration, workoutTime, handleCompleteWorkout]);

  // トレーニング時間をカウントアップ（動画とは独立して動作）
  useEffect(() => {
    // まず既存のインターバルをクリア
    if (workoutTimeIntervalRef.current) {
      clearInterval(workoutTimeIntervalRef.current);
      workoutTimeIntervalRef.current = null;
    }

    if (isWorkingOut) {
      // トレーニング中は常にカウントアップ
      workoutTimeIntervalRef.current = setInterval(() => {
        setWorkoutTime((prev) => prev + 1); // 1秒ごとに1秒増加
      }, 1000); // 1秒ごとに更新
    } else {
      // トレーニングが停止した場合、インターバルをクリア
      if (workoutTimeIntervalRef.current) {
        clearInterval(workoutTimeIntervalRef.current);
        workoutTimeIntervalRef.current = null;
      }
    }

    return () => {
      if (workoutTimeIntervalRef.current) {
        clearInterval(workoutTimeIntervalRef.current);
        workoutTimeIntervalRef.current = null;
      }
    };
  }, [isWorkingOut]);

  // トレーナースコアの増分計算（動画が再生中の場合のみ）
  useEffect(() => {
    if (videoState === 'playing' && isWorkingOut) {
      scoreIntervalRef.current = setInterval(() => {
        // ランダムにトレーナースコアの増分を増加（実際には動きの認識などで計算）
        setTrainerScoreIncrement((prev) => prev + Math.floor(Math.random() * 5) + 1);
      }, 1000);
    } else {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
        scoreIntervalRef.current = null;
      }
    }

    return () => {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }
    };
  }, [videoState, isWorkingOut]);

  // 動画終了ハンドラ
  const handleVideoEnd = () => {
    if (isWorkingOut) {
      handleCompleteWorkout();
    }
  };

  const handleStartWorkout = () => {
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
  };

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
      {/* Trainer情報 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-2 text-primary">{selectedTrainer.name}</h2>
        <p className="text-gray-400 mb-4">{selectedTrainer.description}</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-400">あなたのスコア</p>
            <p className="text-xl font-bold text-primary">{selectedTrainer.userScore.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">トレーナーのスコア</p>
            <p className="text-xl font-bold text-yellow-400">{selectedTrainer.trainerScore.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 難易度選択 */}
      {!isWorkingOut && !showResults && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">難易度を選択</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['beginner', 'intermediate', 'advanced'] as WorkoutDifficulty[]).map((difficulty) => {
              const info = difficultyLabels[difficulty];
              return (
                <motion.button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDifficulty === difficulty
                      ? `border-${info.color}-500 bg-${info.color}-900/20`
                      : 'border-gray-700 hover:border-gray-600'
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

      {/* 動画プレーヤー - 常に表示 */}
      {selectedDifficulty && (
        <WorkoutVideoPlayer
          difficulty={selectedDifficulty}
          isPlaying={isWorkingOut}
          onVideoEnd={handleVideoEnd}
          onVideoStateChange={handleVideoStateChange}
        />
      )}

      {/* ワークアウトエリア */}
      <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
        <AnimatePresence mode="wait">
          {isWorkingOut ? (
            <motion.div
              key="working"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">コピートレーニング中...</h3>
                <p className="text-gray-400 mb-2">トレーナーの動きを真似しましょう！</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-sm text-gray-400">
                    動画状態: 
                    <span className={`ml-2 font-bold ${
                      videoState === 'playing' ? 'text-green-400' :
                      videoState === 'paused' ? 'text-yellow-400' :
                      videoState === 'ended' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {videoState === 'playing' ? '▶️ 再生中' :
                       videoState === 'paused' ? '⏸️ 一時停止' :
                       videoState === 'ended' ? '⏹️ 終了' :
                       '⏸️ 待機中'}
                    </span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary mb-2">
                  再生時間: {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
                  {maxWorkoutTime > 0 && (
                    <span className="text-xl text-gray-400 ml-2">
                      / {Math.floor(maxWorkoutTime / 60)}:{(maxWorkoutTime % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                {videoDuration > 0 && (
                  <div className="text-sm text-gray-400">
                    動画時間: {Math.floor(videoCurrentTime / 60)}:{(Math.floor(videoCurrentTime) % 60).toString().padStart(2, '0')} / {Math.floor(videoDuration / 60)}:{(Math.floor(videoDuration) % 60).toString().padStart(2, '0')}
                  </div>
                )}
                {maxWorkoutTime > 0 && workoutTime >= maxWorkoutTime && (
                  <div className="mt-2 text-sm text-green-400 font-medium">
                    ✅ 最大トレーニング時間に到達しました
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 mb-4">
                <motion.button
                  onClick={() => {
                    if (confirm('トレーニングを終了しますか？')) {
                      handleCompleteWorkout();
                    }
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  トレーニング終了
                </motion.button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                  {selectedDifficulty && trainerScoreIncrement > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      今回増分: +{Math.floor(trainerScoreIncrement * (selectedDifficulty === 'beginner' ? 1.0 : selectedDifficulty === 'intermediate' ? 1.5 : 2.0)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              {/* 獲得トークン表示 */}
              {selectedDifficulty && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border-2 border-yellow-700/50">
                  <div className="text-center">
                    <p className="text-sm text-gray-300 mb-1">💰 獲得トークン（推定）</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      +{currentUserScore}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      消費カロリー = 獲得トークン（1:1） | 
                      トレーニング時間: {Math.floor(workoutTime / 60)}分 {workoutTime % 60}秒
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold">トレーニング完了！</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-primary/20 rounded-lg p-4 border border-primary">
                  <p className="text-sm text-gray-400 mb-1">あなたのスコア（消費カロリー）</p>
                  <p className="text-3xl font-bold text-primary">
                    {selectedDifficulty ? Math.floor((workoutTime / 60) * caloriesPerMinute[selectedDifficulty]) : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">kcal</p>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600">
                  <p className="text-sm text-gray-400 mb-1">トレーナーのスコア（累積）</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {selectedTrainer ? (selectedTrainer.trainerScore + (selectedDifficulty ? Math.floor(trainerScoreIncrement * (selectedDifficulty === 'beginner' ? 1.0 : selectedDifficulty === 'intermediate' ? 1.5 : 2.0)) : 0)) : 0).toLocaleString()}
                  </p>
                  {selectedDifficulty && trainerScoreIncrement > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      今回増分: +{Math.floor(trainerScoreIncrement * (selectedDifficulty === 'beginner' ? 1.0 : selectedDifficulty === 'intermediate' ? 1.5 : 2.0)).toLocaleString()}
                    </p>
                  )}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="text-6xl mb-4">🏋️</div>
              <h3 className="text-2xl font-bold">ワークアウト準備完了</h3>
              <p className="text-gray-400 mb-6">
                トレーナーと一緒にコピートレーニングを始めましょう！
              </p>
              {todayBadgeCompleted ? (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-green-400 font-medium">
                    ✅ 今日のワークアウトは完了しています
                  </p>
                </div>
              ) : (
                <motion.button
                  onClick={handleStartWorkout}
                  disabled={!selectedDifficulty}
                  className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                    selectedDifficulty
                      ? 'bg-primary hover:bg-primary-dark text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
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

      {/* 今日のバッジ状況とトークン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400">今日のバッジ</p>
          <p className="text-2xl font-bold">
            {todayBadgeCompleted ? '✅ 完了' : '⏳ 未完了'}
          </p>
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
    </div>
  );
}
