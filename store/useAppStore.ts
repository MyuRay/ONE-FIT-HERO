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
  // ウォレット関連
  setAddress: (address: string | null) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  
  // Trainer関連
  setSelectedTrainer: (trainerId: string) => void;
  increaseTrainerStats: (trainerId: string) => void;
  
  // バッジ関連
  completeWorkout: () => void;
  getTodayBadge: () => WorkoutBadge | null;
  getTotalBadges: () => number;
  checkAchievementBadges: () => void;
  checkBadgeCondition: (badgeId: string) => boolean;
  
  // ランキング関連
  updateRankings: () => void;
  
  // Prize Ticket関連
  checkPrizeTicket: (address: string) => boolean;
  
  // トレーニング関連
  completeWorkoutSession: (
    trainerId: string,
    difficulty: WorkoutDifficulty,
    userScore: number,
    trainerScore: number,
    workoutDurationMinutes: number
  ) => void;
  
  // トークン関連
  getTokenAmount: () => number;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  
  // 交換関連
  exchangeItem: (itemId: string) => boolean;
  getExchangeHistory: () => ExchangeHistory[];
}

// 初期Trainerデータ（モック）
const initialTrainers: Trainer[] = [
  {
    id: 'trainer-1',
    name: 'Rodtang Jitmuangnon',
    power: 85,
    spirit: 90,
    flexibility: 75,
    description: 'ムエタイの王者。パワーとスピリットに優れる。',
    image: '/rodtang.webp',
    userScore: 15230, // モックデータ
    trainerScore: 18500, // モックデータ
  },
  {
    id: 'trainer-2',
    name: 'Angela Lee',
    power: 80,
    spirit: 95,
    flexibility: 85,
    description: '総合格闘技のチャンピオン。バランスの取れた能力を持つ。',
    image: '/angela-lee.jpg',
    userScore: 12850, // モックデータ
    trainerScore: 16200, // モックデータ
  },
  {
    id: 'trainer-3',
    name: 'Chatri Sityodtong',
    power: 75,
    spirit: 100,
    flexibility: 80,
    description: 'ONE Championship創設者。スピリットが極めて高い。',
    image: '/chatri.jpeg',
    userScore: 9800, // モックデータ
    trainerScore: 14500, // モックデータ
  },
];

// 交換可能アイテム（抽選券と商品）
const initialExchangeItems: ExchangeItem[] = [
  // 抽選券
  {
    id: 'lottery-1',
    name: 'ONE Championship 観戦チケット 抽選券',
    description: '次回大会の観戦チケット抽選に参加',
    type: 'lottery_ticket',
    tokenCost: 10000,
    available: true,
  },
  {
    id: 'lottery-2',
    name: 'バックステージパス 抽選券',
    description: '選手との交流イベント参加抽選',
    type: 'lottery_ticket',
    tokenCost: 15000,
    available: true,
  },
  {
    id: 'lottery-3',
    name: 'ONE Championship 公式Tシャツ 抽選券',
    description: '限定デザインの公式Tシャツ抽選に参加',
    type: 'lottery_ticket',
    tokenCost: 5000,
    available: true,
  },
  {
    id: 'lottery-4',
    name: 'トレーニンググローブ 抽選券',
    description: 'プロ仕様のトレーニンググローブ抽選に参加',
    type: 'lottery_ticket',
    tokenCost: 3000,
    available: true,
  },
  {
    id: 'lottery-5',
    name: 'PPV 抽選券',
    description: 'PPV参加抽選',
    type: 'lottery_ticket',
    tokenCost: 8000,
    available: true,
  },
  // 商品（スポンサー割引券など）
  {
    id: 'goods-1',
    name: 'スポンサーA ジム利用券 20%OFF',
    description: '指定ジムチェーンで利用可能な20%割引券',
    type: 'goods',
    tokenCost: 8000,
    available: true,
  },
  {
    id: 'goods-2',
    name: 'スポンサーB サプリメント 割引券 15%OFF',
    description: 'プロテイン・サプリメント購入時に15%割引',
    type: 'goods',
    tokenCost: 6000,
    available: true,
  },
  {
    id: 'goods-3',
    name: 'スポンサーC スポーツウェア 割引券 25%OFF',
    description: 'スポーツウェアブランドで25%割引',
    type: 'goods',
    tokenCost: 10000,
    available: true,
  },
  {
    id: 'goods-4',
    name: 'ONE Championship 公式タオル',
    description: 'ONE Championship公式ブランドのプレミアムタオル',
    type: 'goods',
    tokenCost: 3500,
    available: true,
  },
  {
    id: 'goods-5',
    name: 'ONE Championship 公式マグカップ',
    description: '限定デザインのONE Championshipマグカップ',
    type: 'goods',
    tokenCost: 2500,
    available: true,
  },
  {
    id: 'goods-6',
    name: 'スポンサーD トレーニング器具 割引券 30%OFF',
    description: 'フィットネス器具購入時に30%割引',
    type: 'goods',
    tokenCost: 12000,
    available: true,
  },
  {
    id: 'goods-7',
    name: 'ONE Championship 限定ステッカーセット',
    description: 'コレクターズアイテム！限定ステッカー5枚セット',
    type: 'goods',
    tokenCost: 2000,
    available: true,
  },
  {
    id: 'goods-8',
    name: 'スポンサーE 栄養管理アプリ プレミアムプラン',
    description: '3ヶ月間のプレミアムプラン利用権',
    type: 'goods',
    tokenCost: 4500,
    available: true,
  },
  {
    id: 'goods-9',
    name: 'ONE Championship 公式ボトル',
    description: 'ステンレス製の公式ウォーターボトル',
    type: 'goods',
    tokenCost: 4000,
    available: true,
  },
  {
    id: 'goods-10',
    name: 'スポンサーF ヨガスタジオ 体験券',
    description: '指定ヨガスタジオで1回無料体験可能',
    type: 'goods',
    tokenCost: 5000,
    available: true,
  },
];

// バッジの条件定義（交換不可、条件達成で自動獲得）
const badgeConditions = {
  'badge-master': {
    id: 'badge-master',
    name: 'ONE FIT マスター バッジ',
    description: '100回のトレーニングを達成した証',
    condition: (badges: WorkoutBadge[]) => badges.length >= 100,
  },
  'badge-champion': {
    id: 'badge-champion',
    name: 'チャンピオン バッジ',
    description: '週次ランキング1位獲得記念',
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

// 難易度別のスコア倍率
const difficultyMultipliers = {
  beginner: { scoreMultiplier: 1.0 },
  intermediate: { scoreMultiplier: 1.5 },
  advanced: { scoreMultiplier: 2.0 },
};

// 難易度別のカロリー消費量（1分あたりのkcal）
const caloriesPerMinute = {
  beginner: 8,    // 初級: 1分あたり8kcal
  intermediate: 12, // 中級: 1分あたり12kcal
  advanced: 18,    // 上級: 1分あたり18kcal
};

// 週次ランキング用のヘルパー関数
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
      
      // 通知を表示
      if (typeof window !== 'undefined') {
        newAchievementBadges.forEach((badge) => {
          const condition = badgeConditions[badge.achievementId! as keyof typeof badgeConditions];
          import('react-hot-toast').then(({ default: toast }) => {
            toast.success(`実績バッジ獲得: ${condition.name}`, {
              icon: '🏅',
              duration: 5000,
            });
          });
        });
      }
    }
  },
  
  // ランキング関連（モックデータ）
  updateRankings: () => {
    const { workoutSessions, address, trainers } = get();
    
    // 基本ランキングを生成
    const baseRankings = buildRankingsFromSessions(workoutSessions, address);
    
    // HOMEページと同じ方法で現在のユーザーのスコアを計算
    const activeAddress = address ?? DEFAULT_USER_ADDRESS;
    const mockTotalWorkouts = 48; // HOMEページのモックデータ
    
    // 全トレーナーのスコアの合計（HOMEページと同じ計算）
    const totalUserScore = trainers.reduce((sum, trainer) => sum + trainer.userScore, 0);
    const totalTrainerScore = trainers.reduce((sum, trainer) => sum + trainer.trainerScore, 0);
    const totalScore = totalUserScore + totalTrainerScore;
    
    // 現在のユーザーのランキングエントリを更新または追加
    const userIndex = baseRankings.findIndex((entry) => entry.address === activeAddress);
    let rankings: RankingEntry[];
    
    if (userIndex >= 0) {
      // 既存のエントリを更新
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
      // 新しいエントリを追加
      rankings = [
        ...baseRankings,
        {
          address: activeAddress,
          totalWorkouts: mockTotalWorkouts,
          score: totalScore,
          rank: 0, // 後で再計算
          hasPrizeTicket: false,
        },
      ];
    }
    
    // スコアで再ソートしてランクを再計算
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
  
  // Prize Ticket関連
  checkPrizeTicket: (address) => {
    const { rankings } = get();
    const entry = rankings.find((r) => r.address === address);
    return entry?.hasPrizeTicket || false;
  },
  
  // トレーニング関連
  completeWorkoutSession: (trainerId, difficulty, userScore, trainerScore, workoutDurationMinutes) => {
    const { address, trainers, tokens, workoutSessions, badges } = get();
    const today = new Date().toISOString().split('T')[0];
    
    // userScore = 消費カロリー（既に計算済み）
    const caloriesBurned = userScore;
    
    // trainerScore = トレーナースコアの増分（難易度倍率は既に適用済み）
    const trainerScoreIncrement = trainerScore;
    
    // 消費カロリー = 獲得トークン
    const tokensEarned = caloriesBurned;
    
    // Trainerのスコアを更新
    // userScore（消費カロリー）も累積に加算
    // trainerScore（増分）を累積スコアに加算
    const updatedTrainers = trainers.map((trainer) => {
      if (trainer.id === trainerId) {
        return {
          ...trainer,
          userScore: trainer.userScore + caloriesBurned, // 消費カロリーを累積
          trainerScore: trainer.trainerScore + trainerScoreIncrement, // 増分を累積スコアに加算
        };
      }
      return trainer;
    });
    
    // トレーニングセッションを記録
    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      address: address || DEFAULT_USER_ADDRESS,
      trainerId,
      difficulty,
      userScore: caloriesBurned, // 消費カロリー
      trainerScore: trainerScoreIncrement, // トレーナースコアの増分
      tokensEarned, // 消費カロリー = 獲得トークン
      caloriesBurned, // 消費カロリー（kcal）
      workoutDuration: workoutDurationMinutes, // トレーニング時間（分）
      timestamp: Date.now(),
      date: today,
    };
    
    // 今日のバッジを追加（まだない場合）
    const todayBadge = badges.find((badge) => badge.date === today && badge.type === 'daily');
    if (!todayBadge) {
      const newBadge: WorkoutBadge = {
        id: `badge-daily-${Date.now()}`,
        date: today,
        timestamp: Date.now(),
        type: 'daily',
      };
      set({ badges: [...badges, newBadge], todayBadgeCompleted: true });
      
      // 条件達成バッジをチェック
      get().checkAchievementBadges();
    }
    
    // トークンを追加
    set({
      trainers: updatedTrainers,
      workoutSessions: [...workoutSessions, session],
      tokens: {
        amount: tokens.amount + tokensEarned,
        lastUpdated: Date.now(),
      },
    });
    
    // ランキングを更新
    get().updateRankings();
    
    // ランキング更新後、条件達成バッジをチェック（チャンピオンバッジ用）
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
  
  // 交換関連
  exchangeItem: (itemId) => {
    const { exchangeItems, tokens, exchangeHistory } = get();
    const item = exchangeItems.find((i) => i.id === itemId);
    
    if (!item || !item.available) {
      return false;
    }
    
    if (tokens.amount < item.tokenCost) {
      return false;
    }
    
    // トークンを消費
    if (!get().spendTokens(item.tokenCost)) {
      return false;
    }
    
    // 交換履歴に追加
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

