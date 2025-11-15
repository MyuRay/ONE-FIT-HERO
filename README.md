# ONE FIT HERO

ONE Championshipのファイターを「トレーナー」として起用するバーチャルフィットネス × 育成ゲームのWeb DAppプロトタイプです。

## 概要

このプロジェクトは、Suiブロックチェーンを使用した動的NFT・SBT・報酬配布のデモンストレーションを目的としたMVP（Minimum Viable Product）です。

### 主な機能

- **Trainer NFT（推しトレーナーカード）**: ONE Championshipのファイターをトレーナーとして選択し、成長させることができます
- **Workout Badge（SBT）**: ワークアウト完了ごとにバッジが付与され、オンチェーンで記録されます
- **Trainer成長システム**: ワークアウトを完了すると、選択中のTrainerのステータス（パワー、スピリット、柔軟性）が向上します
- **週次ランキング**: ワークアウト実績に基づくランキング機能
- **Prize Ticket NFT**: ランキング上位入賞者に抽選券NFTが付与されます

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, React
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **アニメーション**: Framer Motion
- **通知**: React Hot Toast
- **ブロックチェーン**: Sui (TypeScript SDK)
- **ウォレット**: Sui Wallet (モック実装)

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 3. ビルド

```bash
npm run build
```

### 4. 本番環境での起動

```bash
npm start
```

## プロジェクト構造

```
ONE_FIT_HERO/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # HOME（Dashboard）画面
│   ├── workout/           # ワークアウト画面
│   ├── trainers/          # トレーナー選択画面
│   ├── ranking/           # ランキング画面
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── WalletConnectButton.tsx
│   ├── TrainerCard.tsx
│   ├── WorkoutPanel.tsx
│   ├── RankingList.tsx
│   ├── PrizeTicketCard.tsx
│   └── WalletProvider.tsx
├── store/                 # Zustandストア
│   └── useAppStore.ts     # アプリケーション状態管理
├── types/                 # TypeScript型定義
│   └── index.ts
└── package.json
```

## 主要画面の説明

### HOME（Dashboard）

- ウォレット接続ボタン
- 接続中のウォレットアドレス表示
- 選択中のTrainerカード表示
- Trainerのステータス（パワー、スピリット、柔軟性）
- 今日のワークアウト状況
- 累計バッジ数
- クイックアクションボタン

### WORKOUT画面

- 選択中のTrainer情報表示
- ワークアウト開始ボタン
- ワークアウトタイマー（デモ用5秒）
- ワークアウト完了ボタン
- 今日のバッジ状況
- 累計バッジ数

### TRAINERS画面

- 利用可能なTrainer一覧（3名）
- Trainerカード（ステータス表示）
- Trainer選択機能
- 選択中のTrainer表示

### RANKING画面

- 週次ランキング表示
- ユーザーの順位表示
- Prize Ticket獲得状況
- 各ユーザーのワークアウト数とスコア

## ウォレット接続について

このアプリは実際のSui Walletに接続できます。

### 必要な準備

1. **Suiウォレットのインストール**
   - **Sui Wallet**: [Chrome拡張機能](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)
   - **Slush Wallet**: [公式サイト](https://slushwallet.com)からインストール
   - その他のWallet Standard準拠のSuiウォレットも自動検出されます
   - ウォレットがインストールされていない場合、アプリが自動的にインストールリンクを表示します

2. **ウォレットのセットアップ**
   - 選択したウォレットを開いてウォレットを作成またはインポート
   - テストネットまたはメインネットのアカウントを準備

### 使用方法

1. アプリを起動
2. 「ウォレット接続」ボタンをクリック
3. ウォレット選択画面で使用するウォレットを選択
   - Sui Wallet
   - Slush Wallet
   - その他のWallet Standard準拠ウォレット
4. ウォレット拡張機能で接続を承認

接続後、ウォレットアドレスが表示され、すべての機能が利用可能になります。

### サポートされているウォレット

- **Sui Wallet**: 公式Chrome拡張機能
- **Slush Wallet**: 公式ウォレット
- その他のWallet Standard準拠のSuiウォレット（自動検出）

## モック実装について

現在の実装は、ハッカソン用のMVPとして、以下の機能をモックで実装しています：

- **Trainer NFT**: オンチェーンではなく、ローカルストアで管理
- **Workout Badge (SBT)**: ローカルストレージで管理（実際のSBTミントは未実装）
- **ランキング**: ダミーデータを使用

**注意**: ウォレット接続は実際のSui Walletと連携していますが、NFTやSBTのミントはまだ実装されていません。

### 実際のSui連携への移行

実際のSui Moveコントラクトと連携する場合は、`lib/sui.ts`のモック関数を実装してください。

#### Moveコントラクト

プロダクト用のMoveコントラクトは `contracts/` ディレクトリに用意されています：

- **contracts/sources/one_fit_hero.move**: メインコントラクト
- **contracts/Move.toml**: Moveプロジェクト設定
- **contracts/INTEGRATION.md**: フロントエンド統合ガイド

#### 実装されているMove関数

```move
// Trainer NFT関連
public entry fun mint_trainer_nft(ctx: &mut TxContext, trainer_id: u8, name: vector<u8>): Trainer
public entry fun increase_trainer_stats(trainer: &mut Trainer, power: u64, spirit: u64, flexibility: u64, ctx: &TxContext)
public entry fun update_trainer_scores(trainer: &mut Trainer, user_score: u64, trainer_score: u64, ctx: &TxContext)

// Workout Badge (SBT)関連
public entry fun mint_workout_badge(difficulty: u8, user_score: u64, trainer_score: u64, ctx: &mut TxContext): WorkoutBadge

// Token関連
public entry fun init_token_balance(ctx: &mut TxContext): TokenBalance
public entry fun add_tokens(balance: &mut TokenBalance, amount: u64, ctx: &TxContext)
public entry fun spend_tokens(balance: &mut TokenBalance, amount: u64, ctx: &TxContext)

// Prize Ticket関連
public entry fun mint_prize_ticket(week: vector<u8>, rank: u64, ctx: &mut TxContext): PrizeTicket

// Exchange関連
public entry fun exchange_item(balance: &mut TokenBalance, item_id: u8, item_type: u8, item_name: vector<u8>, token_cost: u64, ctx: &mut TxContext): ExchangeItem

// 統合関数
public entry fun complete_workout_session(trainer: &mut Trainer, balance: &mut TokenBalance, difficulty: u8, user_score: u64, trainer_score: u64, ctx: &mut TxContext)
```

#### 実装手順

1. Moveコントラクトをデプロイ
   ```bash
   cd contracts
   sui move build
   sui client publish --gas-budget 100000000
   ```

2. パッケージIDを環境変数に設定
   ```bash
   # .env.local
   NEXT_PUBLIC_SUI_PACKAGE_ID=0x...
   ```

3. `lib/sui.ts`のモック関数を実際のSui SDK呼び出しに置き換え
4. `store/useAppStore.ts`の関数を実際のMoveコントラクト呼び出しに置き換え

詳細は `contracts/INTEGRATION.md` を参照してください。

## 開発メモ

- このプロジェクトはデモンストレーション用のプロトタイプです
- 実際の本番環境で使用する場合は、セキュリティとエラーハンドリングを強化してください
- Sui Moveコントラクトの実装は別途必要です

## ライセンス

このプロジェクトはハッカソン用のプロトタイプです。

