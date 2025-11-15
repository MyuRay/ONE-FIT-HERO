import { create } from 'zustand';
import { 
  Trainer, 
  WorkoutBadge, 
  PrizeTicket, 
  RankingEntry, 
  AppState,
  WorkoutDifficulty,
  WorkoutSession,
  Token,
  ExchangeItem,
  ExchangeHistory,
} from '@/types';

export const DEFAULT_USER_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

interface AppStore extends AppState {
  // Wallet related
  setAddress: (address: string | null) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  
  // Trainer related
  setSelectedTrainer: (trainerId: string) => void;
  increaseTrainerStats: (trainerId: string) => void;
  
  // Badge related
  completeWorkout: () => void;
  getTodayBadge: () => WorkoutBadge | null;
  getTotalBadges: () => number;
  checkAchievementBadges: () => void;
  checkBadgeCondition: (badgeId: string) => boolean;
  
  // Ranking related
  updateRankings: () => void;
  
  // Prize Ticket related
  checkPrizeTicket: (address: string) => boolean;
  
  // Training related
  completeWorkoutSession: (
    trainerId: string,
    difficulty: WorkoutDifficulty,
    userScore: number,
    trainerScore: number,
    workoutDurationMinutes: number
  ) => void;
  
  // Token related
  getTokenAmount: () => number;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  
  // Exchange related
  exchangeItem: (itemId: string) => boolean;
  getExchangeHistory: () => ExchangeHistory[];
}

// Initial Trainer data (mock)
const initialTrainers: Trainer[] = [
  {
    id: 'trainer-1',
    name: 'Rodtang Jitmuangnon',
    power: 85,
    spirit: 90,
    flexibility: 75,
    description: 'Muay Thai champion. Excels in power and spirit.',
    image: '/rodtang.webp',
    userScore: 15230, // Mock data
    trainerScore: 18500, // Mock data
  },
  {
    id: 'trainer-2',
    name: 'Angela Lee',
    power: 80,
    spirit: 95,
    flexibility: 85,
    description: 'MMA champion. Has well-balanced abilities.',
    image: '/angela-lee.jpg',
    userScore: 12850, // Mock data
    trainerScore: 16200, // Mock data
  },
  {
    id: 'trainer-3',
    name: 'Chatri Sityodtong',
    power: 75,
    spirit: 100,
    flexibility: 80,
    description: 'Founder of ONE Championship. Has extremely high spirit.',
    image: '/chatri.jpeg',
    userScore: 9800, // Mock data
    trainerScore: 14500, // Mock data
  },
];

// Exchangeable items (lottery tickets and goods)
const initialExchangeItems: ExchangeItem[] = [
  // Lottery tickets
  {
    id: 'lottery-1',
    name: 'ONE Championship Event Ticket Lottery',
    description: 'Participate in the lottery for the next event ticket',
    type: 'lottery_ticket',
    tokenCost: 10000,
    available: true,
  },
  {
    id: 'lottery-2',
    name: 'Backstage Pass Lottery',
    description: 'Participate in the lottery for athlete meet & greet event',
    type: 'lottery_ticket',
    tokenCost: 15000,
    available: true,
  },
  {
    id: 'lottery-3',
    name: 'ONE Championship Official T-shirt Lottery',
    description: 'Participate in the lottery for limited edition official T-shirt',
    type: 'lottery_ticket',
    tokenCost: 5000,
    available: true,
  },
  {
    id: 'lottery-4',
    name: 'Training Gloves Lottery',
    description: 'Participate in the lottery for professional training gloves',
    type: 'lottery_ticket',
    tokenCost: 3000,
    available: true,
  },
  {
    id: 'lottery-5',
    name: 'PPV Lottery',
    description: 'Participate in the lottery for PPV access',
    type: 'lottery_ticket',
    tokenCost: 8000,
    available: true,
  },
  // Goods (sponsor discount coupons, etc.)
  {
    id: 'goods-1',
    name: 'Sponsor A Gym Pass 20% OFF',
    description: '20% discount coupon valid at designated gym chains',
    type: 'goods',
    tokenCost: 8000,
    available: true,
  },
  {
    id: 'goods-2',
    name: 'Sponsor B Supplement Discount 15% OFF',
    description: '15% discount on protein and supplement purchases',
    type: 'goods',
    tokenCost: 6000,
    available: true,
  },
  {
    id: 'goods-3',
    name: 'Sponsor C Sportswear Discount 25% OFF',
    description: '25% discount at sportswear brand stores',
    type: 'goods',
    tokenCost: 10000,
    available: true,
  },
  {
    id: 'goods-4',
    name: 'ONE Championship Official Towel',
    description: 'Premium towel from ONE Championship official brand',
    type: 'goods',
    tokenCost: 3500,
    available: true,
  },
  {
    id: 'goods-5',
    name: 'ONE Championship Official Mug',
    description: 'Limited edition ONE Championship mug',
    type: 'goods',
    tokenCost: 2500,
    available: true,
  },
  {
    id: 'goods-6',
    name: 'Sponsor D Training Equipment Discount 30% OFF',
    description: '30% discount on fitness equipment purchases',
    type: 'goods',
    tokenCost: 12000,
    available: true,
  },
  {
    id: 'goods-7',
    name: 'ONE Championship Limited Sticker Set',
    description: 'Collector\'s item! Limited edition 5-piece sticker set',
    type: 'goods',
    tokenCost: 2000,
    available: true,
  },
  {
    id: 'goods-8',
    name: 'Sponsor E Nutrition App Premium Plan',
    description: '3-month premium plan access',
    type: 'goods',
    tokenCost: 4500,
    available: true,
  },
  {
    id: 'goods-9',
    name: 'ONE Championship Official Bottle',
    description: 'Stainless steel official water bottle',
    type: 'goods',
    tokenCost: 4000,
    available: true,
  },
  {
    id: 'goods-10',
    name: 'Sponsor F Yoga Studio Trial Pass',
    description: 'One free trial session at designated yoga studio',
    type: 'goods',
    tokenCost: 5000,
    available: true,
  },
];

// Badge condition definitions (non-exchangeable, automatically awarded when conditions are met)
const badgeConditions = {
  'badge-master': {
    id: 'badge-master',
    name: 'ONE FIT Master Badge',
    description: 'Awarded for completing 100 workouts',
    condition: (badges: WorkoutBadge[]) => badges.length >= 100,
  },
  'badge-champion': {
    id: 'badge-champion',
    name: 'Champion Badge',
    description: 'Commemorative badge for achieving 1st place in weekly ranking',
    condition: (badges: WorkoutBadge[], userRank: number | null) => userRank === 1,
  },
};

const initialWorkoutSessions: WorkoutSession[] = [
  {
    id: 'session-1',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    trainerId: 'trainer-1',
    difficulty: 'beginner',
    userScore: 2500,
    trainerScore: 3000,
    tokensEarned: 120,
    caloriesBurned: 120,
    workoutDuration: 15,
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'session-2',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    trainerId: 'trainer-2',
    difficulty: 'intermediate',
    userScore: 3750,
    trainerScore: 4500,
    tokensEarned: 180,
    caloriesBurned: 180,
    workoutDuration: 15,
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'session-3',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    trainerId: 'trainer-1',
    difficulty: 'advanced',
    userScore: 5000,
    trainerScore: 6000,
    tokensEarned: 270,
    caloriesBurned: 270,
    workoutDuration: 15,
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'session-4',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    trainerId: 'trainer-3',
    difficulty: 'beginner',
    userScore: 2200,
    trainerScore: 2800,
    tokensEarned: 96,
    caloriesBurned: 96,
    workoutDuration: 12,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'session-5',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    trainerId: 'trainer-2',
    difficulty: 'intermediate',
    userScore: 3600,
    trainerScore: 4200,
    tokensEarned: 144,
    caloriesBurned: 144,
    workoutDuration: 12,
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'session-6',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    trainerId: 'trainer-1',
    difficulty: 'advanced',
    userScore: 4800,
    trainerScore: 5800,
    tokensEarned: 216,
    caloriesBurned: 216,
    workoutDuration: 12,
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

// Score multipliers by difficulty
const difficultyMultipliers = {
  beginner: { scoreMultiplier: 1.0 },
  intermediate: { scoreMultiplier: 1.5 },
  advanced: { scoreMultiplier: 2.0 },
};

// Calorie consumption per minute by difficulty (kcal/min)
const caloriesPerMinute = {
  beginner: 8,    // Beginner: 8kcal per minute
  intermediate: 12, // Intermediate: 12kcal per minute
  advanced: 18,    // Advanced: 18kcal per minute
};

// Helper functions for weekly ranking
const getWeekString = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const baseRankingMocks: Array<{ address: string; totalWorkouts: number; score: number }> = [
  { address: '0xabcdef1234567890abcdef1234567890abcdef12', totalWorkouts: 28, score: 54200 },
  { address: '0x9876543210fedcba9876543210fedcba98765432', totalWorkouts: 25, score: 48900 },
  { address: '0xfedcba0987654321fedcba0987654321fedcba09', totalWorkouts: 22, score: 42100 },
  { address: '0x1111222233334444555566667777888899990000', totalWorkouts: 19, score: 38500 },
  { address: '0xaaaaaaaabbbbbbbbccccccccddddddddeeeeeeee', totalWorkouts: 16, score: 34800 },
  { address: '0xffffffffeeeeeeeeddddddddccccccccbbbbbbbb', totalWorkouts: 14, score: 31200 },
  { address: '0x9999888877776666555544443333222211110000', totalWorkouts: 12, score: 27800 },
];

const buildRankingsFromSessions = (sessions: WorkoutSession[], currentAddress: string | null): RankingEntry[] => {
  const aggregate = new Map<string, { score: number; totalWorkouts: number }>();

  sessions.forEach((session) => {
    const entry = aggregate.get(session.address) || { score: 0, totalWorkouts: 0 };
    entry.score += session.userScore + session.trainerScore;
    entry.totalWorkouts += 1;
    aggregate.set(session.address, entry);
  });

  baseRankingMocks.forEach((mock) => {
    if (!aggregate.has(mock.address)) {
      aggregate.set(mock.address, { score: mock.score, totalWorkouts: mock.totalWorkouts });
    }
  });

  const activeAddress = currentAddress ?? DEFAULT_USER_ADDRESS;
  if (!aggregate.has(activeAddress)) {
    aggregate.set(activeAddress, { score: 0, totalWorkouts: 0 });
  }

  return Array.from(aggregate.entries())
    .map(([address, data]) => ({ address, ...data }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      hasPrizeTicket: index < 3,
    }));
};

const initialRankings = buildRankingsFromSessions(initialWorkoutSessions, null);
const initialUserRank =
  initialRankings.find((entry) => entry.address === DEFAULT_USER_ADDRESS)?.rank ?? null;

export const useAppStore = create<AppStore>((set, get) => ({
  // 初期状態
  address: null,
  isConnected: false,
  trainers: initialTrainers,
  selectedTrainerId: null,
  badges: [
    // モックデータ: 過去7日間のバッジ
    { id: 'badge-1', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, type: 'daily' },
    { id: 'badge-2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, type: 'daily' },
    { id: 'badge-3', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, type: 'daily' },
    { id: 'badge-4', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, type: 'daily' },
    { id: 'badge-5', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, type: 'daily' },
    { id: 'badge-6', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, type: 'daily' },
  ],
  todayBadgeCompleted: false,
  rankings: initialRankings,
  userRank: initialUserRank,
  prizeTickets: [],
  tokens: { amount: 25000, lastUpdated: Date.now() },
  workoutSessions: initialWorkoutSessions,
  exchangeItems: initialExchangeItems,
  exchangeHistory: [],
  
  // ウォレット関連
  setAddress: (address) => {
    const isConnected = address !== null;
    set({ address, isConnected });
    get().updateRankings();
  },
  
  connectWallet: async () => {
    // この関数は現在使用されていません
    // WalletConnectButtonコンポーネントで直接useWalletKitを使用しています
    // 後方互換性のため残しています
    console.warn('connectWallet is deprecated. Use WalletConnectButton component instead.');
  },
  
  disconnectWallet: () => {
    set({ address: null, isConnected: false });
    get().updateRankings();
  },
  
  // Trainer関連
  setSelectedTrainer: (trainerId) => {
    set({ selectedTrainerId: trainerId });
  },
  
  increaseTrainerStats: (trainerId) => {
    const { trainers } = get();
    const updatedTrainers = trainers.map((trainer) => {
      if (trainer.id === trainerId) {
        return {
          ...trainer,
          power: trainer.power + 1,
          spirit: trainer.spirit + 1,
          flexibility: trainer.flexibility + 1,
        };
      }
      return trainer;
    });
    set({ trainers: updatedTrainers });
  },
  
  // バッジ関連
  completeWorkout: () => {
    const { badges, selectedTrainerId } = get();
    const today = new Date().toISOString().split('T')[0];
    
    // 今日のバッジが既に存在するかチェック
    const todayBadge = badges.find((badge) => badge.date === today && badge.type === 'daily');
    
    if (!todayBadge) {
      const newBadge: WorkoutBadge = {
        id: `badge-daily-${Date.now()}`,
        date: today,
        timestamp: Date.now(),
        type: 'daily',
      };
      
      set({
        badges: [...badges, newBadge],
        todayBadgeCompleted: true,
      });
      
      // Trainerのステータスを増加
      if (selectedTrainerId) {
        get().increaseTrainerStats(selectedTrainerId);
      }
      
      // 条件達成バッジをチェック
      get().checkAchievementBadges();
    }
  },
  
  getTodayBadge: () => {
    const { badges } = get();
    const today = new Date().toISOString().split('T')[0];
    return badges.find((badge) => badge.date === today && badge.type === 'daily') || null;
  },
  
  getTotalBadges: () => {
    const { badges } = get();
    // 日次バッジのみをカウント
    return badges.filter((badge) => badge.type === 'daily' || !badge.type).length;
  },
  
  getAchievementBadges: () => {
    const { badges } = get();
    return badges.filter((badge) => badge.type === 'achievement');
  },
  
  checkBadgeCondition: (badgeId: string) => {
    const { badges, userRank } = get();
    const condition = badgeConditions[badgeId as keyof typeof badgeConditions];
    
    if (!condition) return false;
    
    if (badgeId === 'badge-master') {
      const dailyBadges = badges.filter((badge) => badge.type === 'daily' || !badge.type);
      // badge-masterのconditionは1つの引数のみを受け取る
      return (condition.condition as (badges: WorkoutBadge[]) => boolean)(dailyBadges);
    } else if (badgeId === 'badge-champion') {
      // badge-championのconditionは2つの引数を受け取る
      return (condition.condition as (badges: WorkoutBadge[], userRank: number | null) => boolean)(badges, userRank);
    }
    
    return false;
  },
  
  // 条件達成バッジをチェックして付与
  checkAchievementBadges: () => {
    const { badges } = get();
    const newAchievementBadges: WorkoutBadge[] = [];
    
    // 各条件をチェック
    Object.keys(badgeConditions).forEach((badgeId) => {
      // 既に取得済みかチェック
      const alreadyHave = badges.some(
        (badge) => badge.achievementId === badgeId && badge.type === 'achievement'
      );
      
      if (!alreadyHave && get().checkBadgeCondition(badgeId)) {
        const condition = badgeConditions[badgeId as keyof typeof badgeConditions];
        const newBadge: WorkoutBadge = {
          id: `badge-achievement-${badgeId}-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          type: 'achievement',
          achievementId: badgeId,
        };
        newAchievementBadges.push(newBadge);
      }
    });
    
    // 新しい実績バッジがあれば追加
    if (newAchievementBadges.length > 0) {
      set({
        badges: [...badges, ...newAchievementBadges],
      });
      
      // Show notification
      if (typeof window !== 'undefined') {
        newAchievementBadges.forEach((badge) => {
          const condition = badgeConditions[badge.achievementId! as keyof typeof badgeConditions];
          import('react-hot-toast').then(({ default: toast }) => {
            toast.success(`Achievement Badge Earned: ${condition.name}`, {
              icon: '🏅',
              duration: 5000,
            });
          });
        });
      }
    }
  },
  
  // Ranking related (mock data)
  updateRankings: () => {
    const { workoutSessions, address, trainers } = get();
    
    // Generate base rankings
    const baseRankings = buildRankingsFromSessions(workoutSessions, address);
    
    // Calculate current user's score using the same method as HOME page
    const activeAddress = address ?? DEFAULT_USER_ADDRESS;
    const mockTotalWorkouts = 48; // Mock data from HOME page
    
    // Sum of all trainer scores (same calculation as HOME page)
    const totalUserScore = trainers.reduce((sum, trainer) => sum + trainer.userScore, 0);
    const totalTrainerScore = trainers.reduce((sum, trainer) => sum + trainer.trainerScore, 0);
    const totalScore = totalUserScore + totalTrainerScore;
    
    // Update or add current user's ranking entry
    const userIndex = baseRankings.findIndex((entry) => entry.address === activeAddress);
    let rankings: RankingEntry[];
    
    if (userIndex >= 0) {
      // Update existing entry
      rankings = baseRankings.map((entry, index) => {
        if (entry.address === activeAddress) {
          return {
            ...entry,
            totalWorkouts: mockTotalWorkouts,
            score: totalScore,
          };
        }
        return entry;
      });
    } else {
      // Add new entry
      rankings = [
        ...baseRankings,
        {
          address: activeAddress,
          totalWorkouts: mockTotalWorkouts,
          score: totalScore,
          rank: 0, // Recalculated later
          hasPrizeTicket: false,
        },
      ];
    }
    
    // Re-sort by score and recalculate ranks
    rankings = rankings
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        hasPrizeTicket: index < 3,
      }));
    
    const userRank = rankings.find((entry) => entry.address === activeAddress)?.rank ?? null;
    
    set({ rankings, userRank });
    get().checkAchievementBadges();
  },
  
  // Prize Ticket related
  checkPrizeTicket: (address) => {
    const { rankings } = get();
    const entry = rankings.find((r) => r.address === address);
    return entry?.hasPrizeTicket || false;
  },
  
  // Training related
  completeWorkoutSession: (trainerId, difficulty, userScore, trainerScore, workoutDurationMinutes) => {
    const { address, trainers, tokens, workoutSessions, badges } = get();
    const today = new Date().toISOString().split('T')[0];
    
    // userScore = calories burned (already calculated)
    const caloriesBurned = userScore;
    
    // trainerScore = trainer score increment (difficulty multiplier already applied)
    const trainerScoreIncrement = trainerScore;
    
    // Calories burned = Tokens earned
    const tokensEarned = caloriesBurned;
    
    // Update trainer scores
    // Add userScore (calories burned) to cumulative total
    // Add trainerScore (increment) to cumulative score
    const updatedTrainers = trainers.map((trainer) => {
      if (trainer.id === trainerId) {
        return {
          ...trainer,
          userScore: trainer.userScore + caloriesBurned, // Accumulate calories burned
          trainerScore: trainer.trainerScore + trainerScoreIncrement, // Add increment to cumulative score
        };
      }
      return trainer;
    });
    
    // Record training session
    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      address: address || DEFAULT_USER_ADDRESS,
      trainerId,
      difficulty,
      userScore: caloriesBurned, // Calories burned
      trainerScore: trainerScoreIncrement, // Trainer score increment
      tokensEarned, // Calories burned = Tokens earned
      caloriesBurned, // Calories burned (kcal)
      workoutDuration: workoutDurationMinutes, // Training duration (minutes)
      timestamp: Date.now(),
      date: today,
    };
    
    // Add today's badge (if not already exists)
    const todayBadge = badges.find((badge) => badge.date === today && badge.type === 'daily');
    if (!todayBadge) {
      const newBadge: WorkoutBadge = {
        id: `badge-daily-${Date.now()}`,
        date: today,
        timestamp: Date.now(),
        type: 'daily',
      };
      set({ badges: [...badges, newBadge], todayBadgeCompleted: true });
      
      // Check achievement badges
      get().checkAchievementBadges();
    }
    
    // Add tokens
    set({
      trainers: updatedTrainers,
      workoutSessions: [...workoutSessions, session],
      tokens: {
        amount: tokens.amount + tokensEarned,
        lastUpdated: Date.now(),
      },
    });
    
    // Update rankings
    get().updateRankings();
    
    // After ranking update, check achievement badges (for champion badge)
    get().checkAchievementBadges();
  },
  
  // トークン関連
  getTokenAmount: () => {
    return get().tokens.amount;
  },
  
  addTokens: (amount) => {
    const { tokens } = get();
    set({
      tokens: {
        amount: tokens.amount + amount,
        lastUpdated: Date.now(),
      },
    });
  },
  
  spendTokens: (amount) => {
    const { tokens } = get();
    if (tokens.amount >= amount) {
      set({
        tokens: {
          amount: tokens.amount - amount,
          lastUpdated: Date.now(),
        },
      });
      return true;
    }
    return false;
  },
  
  // Exchange related
  exchangeItem: (itemId) => {
    const { exchangeItems, tokens, exchangeHistory } = get();
    const item = exchangeItems.find((i) => i.id === itemId);
    
    if (!item || !item.available) {
      return false;
    }
    
    if (tokens.amount < item.tokenCost) {
      return false;
    }
    
    // Spend tokens
    if (!get().spendTokens(item.tokenCost)) {
      return false;
    }
    
    // Add to exchange history
    const history: ExchangeHistory = {
      id: `exchange-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      tokenCost: item.tokenCost,
      timestamp: Date.now(),
    };
    
    set({
      exchangeHistory: [...exchangeHistory, history],
    });
    
    return true;
  },
  
  getExchangeHistory: () => {
    return get().exchangeHistory;
  },
}));

