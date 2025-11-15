/// Module: one_fit_hero
/// ONE FIT HERO - Trainer NFT, Workout Badge (SBT), and Reward System
module contracts::one_fit_hero;

use sui::object::UID;
use sui::tx_context::TxContext;
use sui::transfer;

// ============================================================================
// Structs
// ============================================================================

/// Trainer NFT - トレーナーカード（動的NFT）
public struct Trainer has key, store {
    id: UID,
    trainer_id: u8,
    name: vector<u8>,
    power: u64,
    spirit: u64,
    flexibility: u64,
    user_score: u64,
    trainer_score: u64,
}

/// Workout Badge (SBT) - ワークアウト完了バッジ
public struct WorkoutBadge has key {
    id: UID,
    difficulty: u8,
    user_score: u64,
    trainer_score: u64,
    timestamp: u64,
}

/// Token Balance - ゲーム内トークン残高
public struct TokenBalance has key {
    id: UID,
    balance: u64,
}

/// Prize Ticket NFT - ランキング報酬チケット
public struct PrizeTicket has key, store {
    id: UID,
    week: vector<u8>,
    rank: u64,
}

/// Exchange Item - 交換アイテム
public struct ExchangeItem has key, store {
    id: UID,
    item_id: u8,
    item_type: u8,
    item_name: vector<u8>,
}

// ============================================================================
// Trainer NFT Functions
// ============================================================================

/// Trainer NFTをミント
public entry fun mint_trainer_nft(
    trainer_id: u8,
    name: vector<u8>,
    ctx: &mut TxContext
) {
    let trainer = Trainer {
        id: sui::object::new(ctx),
        trainer_id,
        name,
        power: 0,
        spirit: 0,
        flexibility: 0,
        user_score: 0,
        trainer_score: 0,
    };
    transfer::transfer(trainer, tx_context::sender(ctx));
}

/// Trainerのステータスを増加
public entry fun increase_trainer_stats(
    trainer: &mut Trainer,
    power: u64,
    spirit: u64,
    flexibility: u64,
    _ctx: &TxContext
) {
    trainer.power = trainer.power + power;
    trainer.spirit = trainer.spirit + spirit;
    trainer.flexibility = trainer.flexibility + flexibility;
}

/// Trainerのスコアを更新
public entry fun update_trainer_scores(
    trainer: &mut Trainer,
    user_score: u64,
    trainer_score: u64,
    _ctx: &TxContext
) {
    trainer.user_score = trainer.user_score + user_score;
    trainer.trainer_score = trainer.trainer_score + trainer_score;
}

// ============================================================================
// Workout Badge (SBT) Functions
// ============================================================================

/// Workout Badgeをミント（SBTなのでtransfer不可）
public entry fun mint_workout_badge(
    difficulty: u8,
    user_score: u64,
    trainer_score: u64,
    ctx: &mut TxContext
) {
    let badge = WorkoutBadge {
        id: sui::object::new(ctx),
        difficulty,
        user_score,
        trainer_score,
        timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
    };
    transfer::transfer(badge, tx_context::sender(ctx));
}

// ============================================================================
// Token Balance Functions
// ============================================================================

/// Token Balanceを初期化
public entry fun init_token_balance(
    ctx: &mut TxContext
) {
    let balance = TokenBalance {
        id: sui::object::new(ctx),
        balance: 0,
    };
    transfer::transfer(balance, tx_context::sender(ctx));
}

/// トークンを追加
public entry fun add_tokens(
    balance: &mut TokenBalance,
    amount: u64,
    _ctx: &TxContext
) {
    balance.balance = balance.balance + amount;
}

/// トークンを消費
public entry fun spend_tokens(
    balance: &mut TokenBalance,
    amount: u64,
    _ctx: &TxContext
) {
    assert!(balance.balance >= amount, 0);
    balance.balance = balance.balance - amount;
}

// ============================================================================
// Prize Ticket Functions
// ============================================================================

/// Prize Ticket NFTをミント
public entry fun mint_prize_ticket(
    week: vector<u8>,
    rank: u64,
    ctx: &mut TxContext
) {
    let ticket = PrizeTicket {
        id: sui::object::new(ctx),
        week,
        rank,
    };
    transfer::transfer(ticket, tx_context::sender(ctx));
}

// ============================================================================
// Exchange Functions
// ============================================================================

/// アイテムを交換
public entry fun exchange_item(
    balance: &mut TokenBalance,
    item_id: u8,
    item_type: u8,
    item_name: vector<u8>,
    token_cost: u64,
    ctx: &mut TxContext
) {
    spend_tokens(balance, token_cost, ctx);
    
    let item = ExchangeItem {
        id: sui::object::new(ctx),
        item_id,
        item_type,
        item_name,
    };
    transfer::transfer(item, tx_context::sender(ctx));
}

// ============================================================================
// Integrated Functions
// ============================================================================

/// ワークアウトセッションを完了（統合関数）
public entry fun complete_workout_session(
    trainer: &mut Trainer,
    balance: &mut TokenBalance,
    difficulty: u8,
    user_score: u64,
    trainer_score: u64,
    ctx: &mut TxContext
) {
    // スコアを更新
    update_trainer_scores(trainer, user_score, trainer_score, ctx);
    
    // 難易度に応じてステータスを増加
    let power_gain = (difficulty as u64) * 10;
    let spirit_gain = (difficulty as u64) * 8;
    let flexibility_gain = (difficulty as u64) * 6;
    increase_trainer_stats(trainer, power_gain, spirit_gain, flexibility_gain, ctx);
    
    // トークンを報酬として追加（難易度 * 100）
    let reward = (difficulty as u64) * 100;
    add_tokens(balance, reward, ctx);
    
    // Workout Badgeをミント（呼び出し元が受け取る）
    mint_workout_badge(difficulty, user_score, trainer_score, ctx);
}

