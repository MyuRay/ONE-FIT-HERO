'use client';

import { WorkoutDifficulty } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// Video URLs for each difficulty (replace with actual video URLs)
// For local video files: /videos/beginner-workout.mp4
// For external URLs: https://example.com/videos/beginner-workout.mp4
const workoutVideos: Record<WorkoutDifficulty, string> = {
  beginner: '/videos/beginner-workout.mp4', // Replace with actual video URL
  intermediate: '/videos/intermediate-workout.mp4', // Replace with actual video URL
  advanced: '/videos/advanced-workout.mp4', // Replace with actual video URL
};

// YouTube video IDs for embedding
// Extract from YouTube video URL: https://www.youtube.com/watch?v=VIDEO_ID
// Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ → 'dQw4w9WgXcQ'
const youtubeVideoIds: Record<WorkoutDifficulty, string> = {
  beginner: 'jNQXAC9IVRw', // Replace with beginner training video ID
  intermediate: 'jNQXAC9IVRw', // Replace with intermediate training video ID
  advanced: 'jNQXAC9IVRw', // Replace with advanced training video ID
};

// Difficulty labels
const difficultyLabels: Record<WorkoutDifficulty, { label: string }> = {
  beginner: { label: 'Beginner' },
  intermediate: { label: 'Intermediate' },
  advanced: { label: 'Advanced' },
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
  const [useYouTube, setUseYouTube] = useState(true); // Use YouTube embedding
  const [isMounted, setIsMounted] = useState(false); // Hydration error prevention
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check mount state on client-side (Hydration error prevention)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Monitor video state and notify parent component
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
      // Check actual video state (using paused property)
      const currentState: VideoState = video.ended 
        ? 'ended'
        : video.paused 
        ? 'paused'
        : 'playing';
      
      // Update state
      setVideoState((prevState) => {
        if (prevState !== currentState) {
          return currentState;
        }
        return prevState;
      });

      // Always notify parent component of time (regardless of state)
      if (onVideoStateChange) {
        onVideoStateChange(currentState, video.currentTime, video.duration || 0);
      }
    };

      // Update time periodically after video metadata is loaded
      const handleLoadedMetadata = () => {
        if (onVideoStateChange) {
          const state: VideoState = video.paused ? 'paused' : 'idle';
          onVideoStateChange(state, video.currentTime, video.duration || 0);
        }

        // Update time periodically when video is playing (in case timeupdate event doesn't fire)
        if (timeUpdateInterval) {
          clearInterval(timeUpdateInterval);
        }
        
        // Always set interval (regardless of playback state)
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
        }, 100); // Update every 100ms
      };

    // Set initial state
    const initialState: VideoState = video.paused 
      ? (video.ended ? 'ended' : 'paused')
      : 'idle';
    setVideoState(initialState);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // If metadata is already loaded
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

  // State monitoring for YouTube embedding (using PostMessage API)
  useEffect(() => {
    if (useYouTube && iframeRef.current) {
      let youtubeTime = 0;
      let startTime: number | null = null;
      let pauseTime = 0;

      // For YouTube embedding, simply count elapsed time
      const checkYouTubeState = () => {
        if (isPlaying && onVideoStateChange && startTime !== null) {
          // Calculate elapsed time (in seconds)
          const elapsed = (Date.now() - startTime) / 1000;
          youtubeTime = pauseTime + elapsed;
          onVideoStateChange('playing', youtubeTime, 0);
        } else if (!isPlaying && onVideoStateChange) {
          // Keep current time when paused
          if (startTime !== null) {
            pauseTime = pauseTime + (Date.now() - startTime) / 1000;
            startTime = null;
          }
          onVideoStateChange('paused', youtubeTime, 0);
        }
      };

      if (isPlaying) {
        // When playback starts
        if (startTime === null) {
          startTime = Date.now();
        }
        stateCheckIntervalRef.current = setInterval(checkYouTubeState, 100);
        // Notify state immediately
        if (onVideoStateChange) {
          onVideoStateChange('playing', youtubeTime, 0);
        }
      } else {
        if (stateCheckIntervalRef.current) {
          clearInterval(stateCheckIntervalRef.current);
          stateCheckIntervalRef.current = null;
        }
        // Notify current time when paused
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
      // Reset elapsed time if not YouTube embedding
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

  // Reload iframe when isPlaying changes for YouTube embedding
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
          <p className="text-gray-400">Video will be displayed when difficulty is selected</p>
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
              // YouTube embedding
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
              // HTML5 video player
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                src={videoUrl}
                controls
                onEnded={onVideoEnd}
                playsInline
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Video source switch button (for development) */}
      {isMounted && (
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            Difficulty: <span className="font-medium text-white">{difficultyLabels[difficulty]?.label || difficulty}</span>
          </p>
          <button
            onClick={() => setUseYouTube(!useYouTube)}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700/50"
          >
            {useYouTube ? '📁 Local Video' : '▶️ YouTube'}
          </button>
        </div>
      )}
    </div>
  );
}

