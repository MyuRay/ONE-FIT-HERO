/**
 * Sui Moveコントラクトとの連携用の型定義と実装
 * 
 * 実際のSui Moveコントラクト（contracts/sources/one_fit_hero.move）と連携します。
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// パッケージID（デプロイ後に環境変数から取得または設定）
export const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

// Suiクライアントの初期化（devnet用）
export const getSuiClient = () => {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'devnet';
  return new SuiClient({ url: getFullnodeUrl(network as 'testnet' | 'devnet' | 'mainnet') });
};

/**
 * Trainer NFTの型定義（Move structに対応）
 */
export interface TrainerNFT {
  id: string;
  name: string;
  power: number;
  spirit: number;
  flexibility: number;
  userScore: number;
  trainerScore: number;
}

/**
 * Workout Badge (SBT)の型定義
 */
export interface WorkoutBadgeSBT {
  id: string;
  date: string;
  timestamp: number;
}

/**
 * Prize Ticket NFTの型定義
 */
export interface PrizeTicketNFT {
  id: string;
  week: string;
  rank: number;
}

/**
 * Move関数のインターフェース
 * 
 * 実際のMoveコントラクト（contracts/sources/one_fit_hero.move）で実装されている関数:
 * 
 * - mint_trainer_nft(ctx: &mut TxContext, trainer_id: u8, name: vector<u8>): Trainer
 * - increase_trainer_stats(trainer: &mut Trainer, power: u64, spirit: u64, flexibility: u64, ctx: &TxContext)
 * - update_trainer_scores(trainer: &mut Trainer, user_score: u64, trainer_score: u64, ctx: &TxContext)
 * - mint_workout_badge(difficulty: u8, user_score: u64, trainer_score: u64, ctx: &mut TxContext): WorkoutBadge
 * - init_token_balance(ctx: &mut TxContext): TokenBalance
 * - add_tokens(balance: &mut TokenBalance, amount: u64, ctx: &TxContext)
 * - spend_tokens(balance: &mut TokenBalance, amount: u64, ctx: &TxContext)
 * - mint_prize_ticket(week: vector<u8>, rank: u64, ctx: &mut TxContext): PrizeTicket
 * - exchange_item(balance: &mut TokenBalance, item_id: u8, item_type: u8, item_name: vector<u8>, token_cost: u64, ctx: &mut TxContext): ExchangeItem
 * - complete_workout_session(trainer: &mut Trainer, balance: &mut TokenBalance, difficulty: u8, user_score: u64, trainer_score: u64, ctx: &mut TxContext)
 * 
 * 詳細は contracts/INTEGRATION.md を参照してください。
 */

/**
 * Trainer NFTのパース関数
 */
function parseTrainerNFT(object: any): TrainerNFT {
  const fields = object.content?.fields || object.data?.content?.fields || object.fields || {};
  const nameBytes = fields.name || [];
  // nameはvector<u8>なので、数値配列として扱う
  const name = Array.isArray(nameBytes)
    ? String.fromCharCode(...nameBytes.filter((b: any) => typeof b === 'number' && b > 0 && b < 256))
    : '';
  
  return {
    id: object.objectId || object.data?.objectId || '',
    name,
    power: Number(fields.power || 0),
    spirit: Number(fields.spirit || 0),
    flexibility: Number(fields.flexibility || 0),
    userScore: Number(fields.user_score || 0),
    trainerScore: Number(fields.trainer_score || 0),
  };
}

/**
 * Sui Moveコントラクトとの連携関数
 */
export const suiService = {
  /**
   * Trainer NFTをミント
   */
  async mintTrainerNFT(
    trainerId: number,
    name: string,
    signAndExecuteTransactionBlock: (tx: TransactionBlock | any) => Promise<any>
  ): Promise<string> {
    if (!PACKAGE_ID) {
      throw new Error('PACKAGE_IDが設定されていません。コントラクトをデプロイして、.env.localファイルにNEXT_PUBLIC_SUI_PACKAGE_IDを設定してください。');
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::one_fit_hero::mint_trainer_nft`,
      arguments: [
        tx.pure.u8(trainerId),
        tx.pure.string(name),
      ],
    });

    const result = await signAndExecuteTransactionBlock(tx);
    return result.digest;
  },

  /**
   * Trainerのスコアを更新
   */
  async updateTrainerScores(
    trainerObjectId: string,
    userScore: number,
    trainerScore: number,
    signAndExecuteTransactionBlock: (tx: TransactionBlock | any) => Promise<any>
  ): Promise<string> {
    if (!PACKAGE_ID) {
      throw new Error('PACKAGE_ID is not set. Please set NEXT_PUBLIC_SUI_PACKAGE_ID environment variable.');
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::one_fit_hero::update_trainer_scores`,
      arguments: [
        tx.object(trainerObjectId),
        tx.pure.u64(userScore),
        tx.pure.u64(trainerScore),
      ],
    });

    const result = await signAndExecuteTransactionBlock(tx);
    return result.digest;
  },

  /**
   * Trainerのステータスを増加
   */
  async increaseTrainerStats(
    trainerObjectId: string,
    power: number,
    spirit: number,
    flexibility: number,
    signAndExecuteTransactionBlock: (tx: TransactionBlock | any) => Promise<any>
  ): Promise<string> {
    if (!PACKAGE_ID) {
      throw new Error('PACKAGE_ID is not set. Please set NEXT_PUBLIC_SUI_PACKAGE_ID environment variable.');
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::one_fit_hero::increase_trainer_stats`,
      arguments: [
        tx.object(trainerObjectId),
        tx.pure.u64(power),
        tx.pure.u64(spirit),
        tx.pure.u64(flexibility),
      ],
    });

    const result = await signAndExecuteTransactionBlock(tx);
    return result.digest;
  },

  /**
   * Workout Badge (SBT)をミント
   */
  async mintWorkoutBadge(
    difficulty: number,
    userScore: number,
    trainerScore: number,
    signAndExecuteTransactionBlock: (tx: TransactionBlock | any) => Promise<any>
  ): Promise<string> {
    if (!PACKAGE_ID) {
      throw new Error('PACKAGE_ID is not set. Please set NEXT_PUBLIC_SUI_PACKAGE_ID environment variable.');
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::one_fit_hero::mint_workout_badge`,
      arguments: [
        tx.pure.u8(difficulty),
        tx.pure.u64(userScore),
        tx.pure.u64(trainerScore),
      ],
    });

    const result = await signAndExecuteTransactionBlock(tx);
    return result.digest;
  },

  /**
   * ワークアウトセッションを完了（統合関数）
   */
  async completeWorkoutSession(
    trainerObjectId: string,
    tokenBalanceObjectId: string,
    difficulty: number,
    userScore: number,
    trainerScore: number,
    signAndExecuteTransactionBlock: (tx: TransactionBlock | any) => Promise<any>
  ): Promise<string> {
    if (!PACKAGE_ID) {
      throw new Error('PACKAGE_ID is not set. Please set NEXT_PUBLIC_SUI_PACKAGE_ID environment variable.');
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::one_fit_hero::complete_workout_session`,
      arguments: [
        tx.object(trainerObjectId),
        tx.object(tokenBalanceObjectId),
        tx.pure.u8(difficulty),
        tx.pure.u64(userScore),
        tx.pure.u64(trainerScore),
      ],
    });

    const result = await signAndExecuteTransactionBlock(tx);
    return result.digest;
  },

  /**
   * ユーザーのTrainer NFTを取得
   */
  async getTrainerNFT(address: string): Promise<TrainerNFT | null> {
    if (!PACKAGE_ID) {
      console.warn('[Sui Service] PACKAGE_ID is not set. コントラクトをデプロイして、.env.localにNEXT_PUBLIC_SUI_PACKAGE_IDを設定してください。');
      return null;
    }

    const client = getSuiClient();
    try {
      const objects = await client.getOwnedObjects({
        owner: address,
        filter: { 
          StructType: `${PACKAGE_ID}::one_fit_hero::Trainer` 
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (objects.data.length === 0 || !objects.data[0]?.data) return null;

      const objectId = objects.data[0].data.objectId;
      if (!objectId) return null;

      const trainerObject = await client.getObject({
        id: objectId,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!trainerObject.data) return null;
      return parseTrainerNFT(trainerObject.data);
    } catch (error) {
      console.error('Error getting Trainer NFT:', error);
      return null;
    }
  },

  /**
   * ユーザーのWorkout Badgeを取得
   */
  async getWorkoutBadges(address: string): Promise<WorkoutBadgeSBT[]> {
    if (!PACKAGE_ID) {
      console.warn('PACKAGE_ID is not set. Returning empty array.');
      return [];
    }

    const client = getSuiClient();
    try {
      const objects = await client.getOwnedObjects({
        owner: address,
        filter: { 
          StructType: `${PACKAGE_ID}::one_fit_hero::WorkoutBadge` 
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      return objects.data.map((obj: any) => {
        const fields = obj.data?.content?.fields || obj.fields || {};
        return {
          id: obj.data?.objectId || obj.objectId,
          date: new Date(Number(fields.timestamp || 0)).toISOString().split('T')[0],
          timestamp: Number(fields.timestamp || 0),
        };
      });
    } catch (error) {
      console.error('Error getting Workout Badges:', error);
      return [];
    }
  },

  /**
   * ユーザーのTokenBalanceを取得
   */
  async getTokenBalance(address: string): Promise<{ objectId: string; balance: number } | null> {
    if (!PACKAGE_ID) {
      console.warn('PACKAGE_ID is not set. Returning null.');
      return null;
    }

    const client = getSuiClient();
    try {
      const objects = await client.getOwnedObjects({
        owner: address,
        filter: { 
          StructType: `${PACKAGE_ID}::one_fit_hero::TokenBalance` 
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (objects.data.length === 0 || !objects.data[0]?.data) return null;

      const objectId = objects.data[0].data.objectId;
      if (!objectId) return null;

      const balanceObject = await client.getObject({
        id: objectId,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!balanceObject.data) return null;
      const fields = (balanceObject.data as any)?.content?.fields || {};
      return {
        objectId,
        balance: Number(fields.balance || 0),
      };
    } catch (error) {
      console.error('Error getting TokenBalance:', error);
      return null;
    }
  },

  /**
   * TokenBalanceを初期化
   */
  async initTokenBalance(
    signAndExecuteTransactionBlock: (tx: TransactionBlock | any) => Promise<any>
  ): Promise<string> {
    if (!PACKAGE_ID) {
      throw new Error('PACKAGE_ID is not set. Please set NEXT_PUBLIC_SUI_PACKAGE_ID environment variable.');
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::one_fit_hero::init_token_balance`,
    });

    const result = await signAndExecuteTransactionBlock(tx);
    return result.digest;
  },
};

