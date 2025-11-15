'use client';

import { WorkoutDifficulty } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// 難易度ごとの動画URL（実際の動画URLに置き換えてください）
// ローカル動画ファイルを使用する場合: /videos/beginner-workout.mp4
// 外部URLを使用する場合: https://example.com/videos/beginner-workout.mp4
const workoutVideos: Record<WorkoutDifficulty, string> = {
  beginner: '/videos/beginner-workout.mp4', // 実際の動画URLに置き換え
  intermediate: '/videos/intermediate-workout.mp4', // 実際の動画URLに置き換え
  advanced: '/videos/advanced-workout.mp4', // 実際の動画URLに置き換え
};

// YouTube埋め込み用の動画ID
// YouTube動画のURLから取得: https://www.youtube.com/watch?v=VIDEO_ID
// 例: https://www.youtube.com/watch?v=dQw4w9WgXcQ → 'dQw4w9WgXcQ'
const youtubeVideoIds: Record<WorkoutDifficulty, string> = {
  beginner: 'jNQXAC9IVRw', // 初級トレーニング動画のIDに置き換え
  intermediate: 'jNQXAC9IVRw', // 中級トレーニング動画のIDに置き換え
  advanced: 'jNQXAC9IVRw', // 上級トレーニング動画のIDに置き換え
};

// 難易度ラベル
const difficultyLabels: Record<WorkoutDifficulty, { label: string }> = {
  beginner: { label: '初級' },
  intermediate: { label: '中級' },
  advanced: { label: '上級' },
};

export type VideoState = 'idle' | 'playing' | 'paused' | 'ended';

interface WorkoutVideoPlayerProps {
  difficulty: WorkoutDifficulty | null;
  isPlaying: boolean;
  onVideoEnd?: () => void;
  onVideoStateChange?: (state: VideoState, currentTime: number, duration: number) => void;
}

export function WorkoutVideoPlayer({ 
  difficulty, 
  isPlaying, 
  onVideoEnd,
  onVideoStateChange 
}: WorkoutVideoPlayerProps) {
  const [useYouTube, setUseYouTube] = useState(true); // YouTube埋め込みを使用するか
  const [isMounted, setIsMounted] = useState(false); // Hydrationエラー対策
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // クライアントサイドでのマウント状態を確認（Hydrationエラー対策）
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 動画の状態を監視して親コンポーネントに通知
  useEffect(() => {
    if (!videoRef.current || useYouTube) return;

    const video = videoRef.current;
    let timeUpdateInterval: NodeJS.Timeout | null = null;

    const handlePlay = () => {
      const newState: VideoState = 'playing';
      setVideoState(newState);
      if (onVideoStateChange) {
        onVideoStateChange(newState, video.currentTime, video.duration || 0);
      }
    };

    const handlePause = () => {
      const newState: VideoState = 'paused';
      setVideoState(newState);
      if (onVideoStateChange) {
        onVideoStateChange(newState, video.currentTime, video.duration || 0);
      }
    };

    const handleEnded = () => {
      const newState: VideoState = 'ended';
      setVideoState(newState);
      if (onVideoStateChange) {
        onVideoStateChange(newState, video.currentTime, video.duration || 0);
      }
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    const handleTimeUpdate = () => {
      // 動画の実際の状態を確認（pausedプロパティを使用）
      const currentState: VideoState = video.ended 
        ? 'ended'
        : video.paused 
        ? 'paused'
        : 'playing';
      
      // 状態を更新
      setVideoState((prevState) => {
        if (prevState !== currentState) {
          return currentState;
        }
        return prevState;
      });

      // 時間を常に親コンポーネントに通知（状態に関係なく）
      if (onVideoStateChange) {
        onVideoStateChange(currentState, video.currentTime, video.duration || 0);
      }
    };

      // 動画のメタデータが読み込まれた後に、定期的に時間を更新
      const handleLoadedMetadata = () => {
        if (onVideoStateChange) {
          const state: VideoState = video.paused ? 'paused' : 'idle';
          onVideoStateChange(state, video.currentTime, video.duration || 0);
        }

        // 動画が再生中の場合、定期的に時間を更新（timeupdateイベントが発火しない場合に備える）
        if (timeUpdateInterval) {
          clearInterval(timeUpdateInterval);
        }
        
        // 常にインターバルを設定（再生状態に関係なく）
        timeUpdateInterval = setInterval(() => {
          if (video && !isNaN(video.currentTime)) {
            const currentState: VideoState = video.ended 
              ? 'ended'
              : video.paused 
              ? 'paused'
              : 'playing';
            
            if (onVideoStateChange) {
              onVideoStateChange(currentState, video.currentTime, video.duration || 0);
            }
          }
        }, 100); // 100msごとに更新
      };

    // 初期状態を設定
    const initialState: VideoState = video.paused 
      ? (video.ended ? 'ended' : 'paused')
      : 'idle';
    setVideoState(initialState);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // 既にメタデータが読み込まれている場合
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
    };
  }, [useYouTube, onVideoStateChange, onVideoEnd]);

  // YouTube埋め込みの場合の状態監視（PostMessage APIを使用）
  useEffect(() => {
    if (useYouTube && iframeRef.current) {
      let youtubeTime = 0;
      let startTime: number | null = null;
      let pauseTime = 0;

      // YouTube埋め込みの場合は、簡易的に経過時間をカウント
      const checkYouTubeState = () => {
        if (isPlaying && onVideoStateChange && startTime !== null) {
          // 経過時間を計算（秒単位）
          const elapsed = (Date.now() - startTime) / 1000;
          youtubeTime = pauseTime + elapsed;
          onVideoStateChange('playing', youtubeTime, 0);
        } else if (!isPlaying && onVideoStateChange) {
          // 一時停止時は現在の時間を保持
          if (startTime !== null) {
            pauseTime = pauseTime + (Date.now() - startTime) / 1000;
            startTime = null;
          }
          onVideoStateChange('paused', youtubeTime, 0);
        }
      };

      if (isPlaying) {
        // 再生開始時
        if (startTime === null) {
          startTime = Date.now();
        }
        stateCheckIntervalRef.current = setInterval(checkYouTubeState, 100);
        // 即座に状態を通知
        if (onVideoStateChange) {
          onVideoStateChange('playing', youtubeTime, 0);
        }
      } else {
        if (stateCheckIntervalRef.current) {
          clearInterval(stateCheckIntervalRef.current);
          stateCheckIntervalRef.current = null;
        }
        // 一時停止時に現在の時間を通知
        if (onVideoStateChange) {
          if (startTime !== null) {
            pauseTime = pauseTime + (Date.now() - startTime) / 1000;
            startTime = null;
          }
          onVideoStateChange('paused', youtubeTime, 0);
        }
      }

      return () => {
        if (stateCheckIntervalRef.current) {
          clearInterval(stateCheckIntervalRef.current);
        }
      };
    } else {
      // YouTube埋め込みでない場合、経過時間をリセット
      if (stateCheckIntervalRef.current) {
        clearInterval(stateCheckIntervalRef.current);
        stateCheckIntervalRef.current = null;
      }
    }
  }, [useYouTube, isPlaying, onVideoStateChange]);

  useEffect(() => {
    if (videoRef.current && isPlaying && !useYouTube) {
      videoRef.current.play().catch(console.error);
    } else if (videoRef.current && !isPlaying && !useYouTube) {
      videoRef.current.pause();
    }
  }, [isPlaying, useYouTube]);

  // YouTube埋め込みの場合、isPlayingが変更されたらiframeを再読み込み
  useEffect(() => {
    if (useYouTube && iframeRef.current && difficulty) {
      const youtubeId = youtubeVideoIds[difficulty];
      const newSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&controls=1&rel=0&modestbranding=1&loop=0`;
      if (iframeRef.current.src !== newSrc) {
        iframeRef.current.src = newSrc;
      }
    }
  }, [isPlaying, difficulty, useYouTube]);

  if (!difficulty) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-gray-400">難易度を選択すると動画が表示されます</p>
        </div>
      </div>
    );
  }

  const videoUrl = workoutVideos[difficulty];
  const youtubeId = youtubeVideoIds[difficulty];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 overflow-hidden">
      <div className="aspect-video w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={difficulty}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {useYouTube ? (
              // YouTube埋め込み
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&controls=1&rel=0&modestbranding=1&loop=0`}
                  title={`${difficulty} workout video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              // HTML5動画プレーヤー
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                src={videoUrl}
                controls
                onEnded={onVideoEnd}
                playsInline
                preload="metadata"
              >
                お使いのブラウザは動画再生をサポートしていません。
              </video>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* 動画ソース切り替えボタン（開発用） */}
      {isMounted && (
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            難易度: <span className="font-medium text-white">{difficultyLabels[difficulty]?.label || difficulty}</span>
          </p>
          <button
            onClick={() => setUseYouTube(!useYouTube)}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700/50"
          >
            {useYouTube ? '📁 ローカル動画' : '▶️ YouTube'}
          </button>
        </div>
      )}
    </div>
  );
}

