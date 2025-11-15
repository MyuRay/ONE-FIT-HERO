// トレーニング難易度
export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Trainer NFT型定義
export interface Trainer {
  id: string;
  name: string;
  power: number;
  spirit: number;
  flexibility: number;
  image?: string;
  description?: string;
  userScore: number; // ユーザーの累計スコア
  trainerScore: number; // トレーナーの累計スコア
}

// Workout Badge型定義
export interface WorkoutBadge {
  id: string;
  date: string; // YYYY-MM-DD形式
  timestamp: number;
  type?: 'daily' | 'achievement' | 'reward'; // 日次バッジ or 実績バッジ or 報酬バッジ
  achievementId?: string; // 実績バッジの場合のID（badge-master, badge-championなど）
  rewardId?: string; // 報酬バッジの場合のID
  name?: string; // バッジ名
  description?: string; // バッジの説明
  emoji?: string; // バッジの絵文字
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; // バッジのレアリティ
}

// Prize Ticket型定義
export interface PrizeTicket {
  id: string;
  week: string; // YYYY-WW形式
  rank: number;
}

// トレーニングセッション型定義
export interface WorkoutSession {
  id: string;
  address: string; // ウォレットアドレス
  trainerId: string;
  difficulty: WorkoutDifficulty;
  userScore: number;
  trainerScore: number;
  tokensEarned: number; // 消費カロリー = 獲得トークン
  caloriesBurned: number; // 消費カロリー（kcal）
  workoutDuration: number; // トレーニング時間（分）
  timestamp: number;
  date: string; // YYYY-MM-DD形式
}

// トークン型定義
export interface Token {
  amount: number;
  lastUpdated: number;
}

// 交換可能アイテムの種類
export type ExchangeItemType = 'badge' | 'goods' | 'lottery_ticket';

// 交換可能アイテム型定義
export interface ExchangeItem {
  id: string;
  name: string;
  description: string;
  type: ExchangeItemType;
  tokenCost: number;
  image?: string;
  available: boolean;
}

// ユーザーの交換履歴
export interface ExchangeHistory {
  id: string;
  itemId: string;
  itemName: string;
  tokenCost: number;
  timestamp: number;
}

// ランキングエントリ型定義
export interface RankingEntry {
  address: string;
  totalWorkouts: number;
  score: number;
  rank: number;
  hasPrizeTicket: boolean;
}

// アプリの状態型定義
export interface AppState {
  // ウォレット関連
  address: string | null;
  isConnected: boolean;
  
  // Trainer関連
  trainers: Trainer[];
  selectedTrainerId: string | null;
  
  // バッジ関連
  badges: WorkoutBadge[];
  todayBadgeCompleted: boolean;
  
  // ランキング関連
  rankings: RankingEntry[];
  userRank: number | null;
  
  // Prize Ticket関連
  prizeTickets: PrizeTicket[];
  
  // トークン関連
  tokens: Token;
  
  // トレーニングセッション関連
  workoutSessions: WorkoutSession[];
  
  // 交換可能アイテム関連
  exchangeItems: ExchangeItem[];
  exchangeHistory: ExchangeHistory[];
}

