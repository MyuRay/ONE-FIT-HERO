'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CoachingMessage {
  time: number; // 秒
  message: string;
  type: 'encouragement' | 'correction' | 'instruction' | 'motivation';
  emoji?: string;
}

// Mock AI coaching messages (time-based)
const coachingMessages: CoachingMessage[] = [
  { time: 0, message: 'Training starts! Are you ready?', type: 'instruction', emoji: '🚀' },
  { time: 5, message: 'Stand straight and firm', type: 'correction', emoji: '👆' },
  { time: 10, message: 'Great! Keep it up!', type: 'encouragement', emoji: '💪' },
  { time: 15, message: 'Focus on breathing, take a deep breath', type: 'instruction', emoji: '🌬️' },
  { time: 20, message: 'Perfect form! Keep going', type: 'encouragement', emoji: '🔥' },
  { time: 30, message: 'Take a short break and hydrate', type: 'instruction', emoji: '💧' },
  { time: 40, message: 'Almost there! Keep pushing!', type: 'motivation', emoji: '⚡' },
  { time: 50, message: 'Perfect form! Continue like this', type: 'encouragement', emoji: '⭐' },
  { time: 60, message: 'Amazing! You\'re halfway through!', type: 'motivation', emoji: '🎉' },
  { time: 90, message: 'Final push! Give it your all!', type: 'motivation', emoji: '💥' },
  { time: 120, message: 'Excellent focus! Almost there!', type: 'encouragement', emoji: '🔥' },
];

const messageTypeColors = {
  encouragement: 'bg-green-600/20 border-green-500 text-green-300',
  correction: 'bg-yellow-600/20 border-yellow-500 text-yellow-300',
  instruction: 'bg-blue-600/20 border-blue-500 text-blue-300',
  motivation: 'bg-purple-600/20 border-purple-500 text-purple-300',
};

interface AICoachingProps {
  workoutTime: number; // 秒
  isActive: boolean;
  onClose?: () => void;
  onReproductionRateChange?: (rate: number) => void; // Notify reproduction rate changes
  onGetReproductionRate?: () => number; // Get current reproduction rate
}

export function AICoaching({ 
  workoutTime, 
  isActive, 
  onClose, 
  onReproductionRateChange,
  onGetReproductionRate 
}: AICoachingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<CoachingMessage | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [reproductionRate, setReproductionRate] = useState<number>(100); // Reproduction rate (0-100%)

  // AI reproduction rate evaluation (mock)
  const calculateReproductionRate = useCallback(() => {
    // Mock implementation: Always returns 100%
    // Actual implementation would analyze camera footage and calculate match rate with trainer's movements
    return 100;
  }, []);

  // Expose reproduction rate to parent component
  useEffect(() => {
    if (isActive) {
      // Set reproduction rate to 100% when training starts (mock)
      const rate = calculateReproductionRate();
      setReproductionRate(rate);
      if (onReproductionRateChange) {
        onReproductionRateChange(rate);
      }
    } else {
      // Reset reproduction rate when training stops
      setReproductionRate(100);
      if (onReproductionRateChange) {
        onReproductionRateChange(100);
      }
    }
  }, [isActive, calculateReproductionRate, onReproductionRateChange]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user', // Front camera
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera');
      toast.error('Unable to access camera', {
        icon: '📷',
        duration: 3000,
      });
      setIsCameraOn(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start/stop camera
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Display coaching messages based on training time
  useEffect(() => {
    if (!isActive) {
      setCurrentMessage(null);
      setShowMessage(false);
      return;
    }

    // Find message closest to current time
    const activeMessage = coachingMessages
      .filter((msg) => workoutTime >= msg.time && workoutTime < msg.time + 5) // Display for 5 seconds
      .sort((a, b) => b.time - a.time)[0];

    if (activeMessage && activeMessage !== currentMessage) {
      setCurrentMessage(activeMessage);
      setShowMessage(true);
      
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else if (!activeMessage) {
      setShowMessage(false);
    }
  }, [workoutTime, isActive, currentMessage]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative bg-gray-900/95 rounded-lg border-2 border-primary overflow-hidden">
      {/* Camera feed */}
      <div className="relative w-full aspect-video bg-gray-800">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-red-400 mb-2">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-sm font-medium transition-colors"
              >
                Retry Camera
              </button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Camera status */}
        {isCameraOn && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-white">Recording</span>
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 transition-colors"
            aria-label="Close camera"
          >
            <span className="text-white text-xl">×</span>
          </button>
        )}
      </div>

      {/* AI coaching message */}
      <AnimatePresence>
        {showMessage && currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-4 left-4 right-4 p-4 rounded-lg border-2 ${messageTypeColors[currentMessage.type]} backdrop-blur-sm shadow-lg`}
          >
            <div className="flex items-start gap-3">
              {currentMessage.emoji && (
                <span className="text-2xl flex-shrink-0">{currentMessage.emoji}</span>
              )}
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">AI Coach</p>
                <p className="text-base leading-relaxed">{currentMessage.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reproduction rate display */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-300">AI Evaluation: Reproduction Rate</p>
            <span className="text-lg font-bold text-green-400 min-w-[4rem] text-right">
              {reproductionRate.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${reproductionRate}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {reproductionRate >= 100 && (
            <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
              <span>✨</span>
              <span>Perfect reproduction rate! Full time-based calories will be awarded</span>
            </p>
          )}
        </div>
      </div>

      {/* Coaching message timeline */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">AI Coaching Messages</p>
          <p className="text-xs text-gray-400">
            {coachingMessages.filter((msg) => msg.time <= workoutTime).length} / {coachingMessages.length}
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {coachingMessages.map((msg, index) => {
            const isActive = msg.time <= workoutTime;
            const isCurrent = currentMessage?.time === msg.time;
            return (
              <div
                key={index}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  isCurrent
                    ? 'bg-primary text-white scale-110'
                    : isActive
                    ? 'bg-green-600/50 text-green-300'
                    : 'bg-gray-700 text-gray-500'
                } transition-all`}
                title={msg.message}
              >
                {msg.emoji || index + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

