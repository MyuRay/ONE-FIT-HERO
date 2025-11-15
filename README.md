# ONE FIT HERO

ONE Championshipのファイターを「トレーナー」として起用するバーチャルフィットネス × 育成ゲームのWeb DAppです。

## 🎮 概要

このプロジェクトは、Suiブロックチェーンを使用した動的NFT・SBT・報酬配布システムを実装したフィットネスDAppです。AIコーチング機能を搭載し、実際のトレーニング動画を見ながら、カメラで自分の動きを記録し、AI判定による再現度に基づいてスコアとトークンを獲得できます。

### ✨ 主な機能

#### 🏋️ トレーニングシステム
- **動画トレーニング**: ONE Championshipのファイターのトレーニング動画を見ながら、コピートレーニングを実行
- **AIコーチング**: カメラで自分の動きを記録し、リアルタイムでAIコーチングメッセージを受信
- **再現度判定**: AI判定による再現度（0-100%）に基づいて、最終的な消費カロリーと獲得トークンを計算
  - 再現度100%の場合、時間分のカロリーをそのままスコア・トークンとして付与
  - 難易度別カロリー消費率: 初級（8kcal/分）、中級（12kcal/分）、上級（18kcal/分）
- **カロリー = トークン**: 消費カロリーがそのまま獲得トークンに変換されるシンプルなシステム

#### 👤 トレーナーシステム
- **Trainer NFT**: ONE Championshipのファイターをトレーナーとして選択し、NFTとして所有
- **トレーナー育成**: ワークアウトを完了すると、選択中のトレーナーのスコアが向上
- **貢献度システム**: 各トレーナーに対する自分の貢献スコアを表示し、ランキング形式で比較
- **リアルタイムスコア更新**: トレーナーの累積スコアがリアルタイムで更新される（5秒ごと）

#### 🏅 バッジ・報酬システム
- **Workout Badge (SBT)**: ワークアウト完了ごとにバッジが付与され、オンチェーンで記録
- **REWARDSページ**: 多様なバッジを獲得できるシステム
  - 連続トレーニング日数バッジ（7日、14日、30日、60日）
  - 週間ランキングバッジ（1位、3位以内）
  - 累計トレーニング回数バッジ（10回、50回、100回、500回）
  - 累計スコアバッジ（10,000pt、50,000pt、100,000pt）
  - 貢献度バッジ（貢献ヒーロー、トレーナーサポーター）
- **レアリティシステム**: Common、Rare、Epic、Legendaryの4段階のレアリティ

#### 📊 ランキングシステム
- **ユーザーランキング**: 週次ランキングで自分の順位を確認
- **リアルタイムランキング**: トレーナー別のリアルタイムスコアランキングを表示
- **Prize Ticket NFT**: ランキング上位入賞者に抽選券NFTが付与される

#### 🎫 交換システム（EXCHANGE）
- **抽選券**: トークンを消費して抽選券を購入
  - ONE Championship 観戦チケット抽選券
  - バックステージパス抽選券
  - 公式Tシャツ抽選券
  - トレーニンググローブ抽選券
  - PPV抽選券
- **商品**: スポンサー割引券やONE Championship公式グッズを購入
  - スポンサー割引券（ジム、サプリメント、スポーツウェア、トレーニング器具など）
  - ONE Championship公式グッズ（タオル、マグカップ、ボトル、ステッカーセット）

#### 🏠 HOMEページ
- **選択中のトレーナー**: 現在選択中のトレーナーとその貢献度を表示
- **自分の記録**: 累計トレーニング回数、累計スコア、連続トレーニング日数などを表示
- **獲得バッジ一覧**: 獲得したバッジを最大6個まで表示
- **リアルタイムスコア**: トレーナーのスコアがリアルタイムで更新

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, React
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **アニメーション**: Framer Motion
- **通知**: React Hot Toast
- **ブロックチェーン**: Sui (TypeScript SDK)
- **ウォレット**: @mysten/wallet-kit（Wallet Standard準拠）
- **Moveコントラクト**: Sui Move（contracts/ディレクトリ）

## 📦 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成して、以下の環境変数を設定：

```bash
# Sui Network Configuration
NEXT_PUBLIC_SUI_NETWORK=devnet  # 'devnet' | 'testnet' | 'mainnet'

# Sui Move Contract Package ID（デプロイ後に設定）
NEXT_PUBLIC_SUI_PACKAGE_ID=
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 4. ビルド

```bash
npm run build
```

### 5. 本番環境での起動

```bash
npm start
```

## 📁 プロジェクト構造

```
ONE_FIT_HERO/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト（WalletProvider含む）
│   ├── page.tsx           # HOME（Dashboard）画面
│   ├── workout/           # ワークアウト画面
│   ├── trainers/          # トレーナー選択画面
│   ├── ranking/           # ランキング画面
│   ├── rewards/           # バッジ・報酬画面
│   ├── exchange/          # トークン交換画面
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── AICoaching.tsx     # AIコーチング（カメラ機能）
│   ├── WalletConnectButton.tsx
│   ├── WalletSelector.tsx
│   ├── WalletProvider.tsx
│   ├── TrainerCard.tsx
│   ├── WorkoutPanel.tsx   # ワークアウトパネル
│   ├── WorkoutVideoPlayer.tsx  # 動画プレイヤー
│   ├── RankingList.tsx
│   ├── PrizeTicketCard.tsx
│   ├── ExchangeMarketplace.tsx
│   └── ...
├── store/                 # Zustandストア
│   └── useAppStore.ts     # アプリケーション状態管理
├── lib/                   # ライブラリ・ユーティリティ
│   └── sui.ts             # Sui Moveコントラクトとの連携
├── types/                 # TypeScript型定義
│   └── index.ts
├── contracts/             # Sui Moveコントラクト
│   ├── sources/
│   │   └── one_fit_hero.move
│   └── Move.toml
└── public/                # 静的ファイル
    ├── logo.png
    └── ...
```

## 🎯 主要画面の説明

### 🏠 HOME（Dashboard）
- **選択中のトレーナー**: 現在選択中のトレーナー情報、貢献度、ランキング順位を表示
- **自分の記録**: 
  - 累計トレーニング回数（直近7日間のトレーニング回数も表示）
  - 累計スコア（あなたのスコア + トレーナーのスコア）
  - 週次ランキング順位
  - 累計バッジ数（REWARDSバッジ）
  - 連続トレーニング日数（現在の連続日数と最長記録）
- **獲得バッジ一覧**: 獲得したバッジを最大6個まで表示
- **クイックアクション**: ワークアウト開始、ランキング確認、トークン交換へのリンク

### 🏋️ WORKOUT画面
- **選択中のトレーナー表示**: トレーナー情報と画像を表示
- **難易度選択**: 初級・中級・上級から選択（カロリー消費率が異なる）
- **トレーニング動画**: 選択したトレーナーの動画を見ながらコピートレーニング
- **AIコーチング**: 
  - カメラで自分の動きを記録
  - リアルタイムでAIコーチングメッセージを表示
  - 再現度をリアルタイムで表示（100%の場合、時間分のカロリーをそのまま付与）
- **スコア表示**: リアルタイムで消費カロリーと獲得トークンを表示
- **トレーニング終了ダイアログ**: カスタムモーダルでトレーニング終了を確認

### 👥 TRAINERS画面
- **トレーナー一覧**: 利用可能なトレーナーを表示（Rodtang、Angela Lee、Chatri Sityodtong）
- **トレーナーカード**: 
  - トレーナー画像
  - ステータス（パワー、スピリット、柔軟性）
  - あなたの貢献スコア
  - トレーナーの累積スコア
  - ランキング順位
- **トレーナー選択**: カードをクリックしてトレーナーを選択

### 📊 RANKING画面
- **ユーザーランキング**: 
  - 週次ランキングでユーザーの順位を表示
  - 各ユーザーの総スコアとトレーニング回数を表示
- **リアルタイムランキング**: 
  - トレーナー別のリアルタイムスコアランキング
  - 各トレーナーの貢献スコアをバーで表示
  - トレーナー画像とランキング順位を表示

### 🏅 REWARDS画面
- **バッジ一覧**: 様々な条件で獲得できるバッジを表示
- **バッジカテゴリ**:
  - 連続トレーニング日数バッジ
  - 週間ランキングバッジ
  - 累計トレーニング回数バッジ
  - 累計スコアバッジ
  - 貢献度バッジ
- **バッジ詳細**: 
  - レアリティ別のカラーリング
  - 進捗バー表示（達成条件がある場合）
  - 獲得済み/未獲得の表示

### 🎫 EXCHANGE画面
- **トークン残高**: 現在所持しているトークン数を表示
- **抽選券**: 
  - ONE Championship関連の抽選券を応募
  - 応募にはトークンが必要
- **商品**: 
  - スポンサー割引券（ジム、サプリメント、スポーツウェアなど）
  - ONE Championship公式グッズ
  - 購入にはトークンが必要
- **交換履歴**: 過去の交換履歴を確認

## 🔗 ウォレット接続について

このアプリは実際のSui Walletに接続できます。

### 必要な準備

1. **Suiウォレットのインストール**
   - **Sui Wallet**: [Chrome拡張機能](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)
   - **Slush Wallet**: [公式サイト](https://slushwallet.com)からインストール
   - その他のWallet Standard準拠のSuiウォレットも自動検出されます

2. **ウォレットのセットアップ**
   - 選択したウォレットを開いてウォレットを作成またはインポート
   - Devnet/Testnet/Mainnetのアカウントを準備

### 使用方法

1. アプリを起動
2. 「ウォレット接続」ボタンをクリック
3. ウォレット選択画面で使用するウォレットを選択
4. ウォレット拡張機能で接続を承認

接続後、ウォレットアドレスが表示され、すべての機能が利用可能になります。

### サポートされているウォレット

- **Sui Wallet**: 公式Chrome拡張機能
- **Slush Wallet**: 公式ウォレット
- その他のWallet Standard準拠のSuiウォレット（自動検出）

## 🎮 ゲームプレイの流れ

1. **ウォレット接続**: Suiウォレットを接続
2. **トレーナー選択**: TRAINERS画面でトレーナーを選択
3. **ワークアウト開始**: WORKOUT画面で難易度を選択してトレーニングを開始
4. **AIコーチング**: カメラで自分の動きを記録し、AIコーチングメッセージを受信
5. **再現度判定**: AI判定による再現度に基づいてスコアとトークンを獲得
6. **バッジ獲得**: 条件を満たすとバッジが自動的に付与される
7. **ランキング確認**: 自分の順位とトレーナーのランキングを確認
8. **トークン交換**: 獲得したトークンで抽選券や商品を購入

## 📚 Sui Moveコントラクト

プロダクト用のMoveコントラクトは `contracts/` ディレクトリに用意されています。

### 実装されているMove関数

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

### コントラクトのデプロイ

1. Moveコントラクトをビルド
   ```bash
   cd contracts
   sui move build
   ```

2. コントラクトをデプロイ
   ```bash
   sui client publish --gas-budget 100000000
   ```

3. パッケージIDを環境変数に設定
   ```bash
   # .env.local
   NEXT_PUBLIC_SUI_PACKAGE_ID=0x...
   ```

詳細は `DEPLOY.md` を参照してください。

## 🚀 デプロイ

このアプリはVercelにデプロイできます。

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトを作成
3. 環境変数を設定（`NEXT_PUBLIC_SUI_NETWORK`、`NEXT_PUBLIC_SUI_PACKAGE_ID`）
4. デプロイ

詳細は `DEPLOY.md` を参照してください。

## ⚙️ 現在の実装状況

### ✅ 実装済み機能

- ✅ Sui Wallet接続（Wallet Standard準拠）
- ✅ トレーナー選択システム
- ✅ 動画トレーニング機能
- ✅ AIコーチング（カメラ機能、再現度判定）
- ✅ カロリーベースのトークン獲得システム
- ✅ バッジシステム（REWARDSページ）
- ✅ ランキングシステム（ユーザーランキング + リアルタイムランキング）
- ✅ トークン交換システム（EXCHANGEページ）
- ✅ トレーナー貢献度システム
- ✅ Sui Moveコントラクト（contracts/ディレクトリ）

### 📝 モック実装（開発中）

現在、一部の機能はモックデータを使用しています：

- **ランキング**: モックデータを使用（オンチェーンデータと結合予定）
- **バッジ進捗**: HOMEページのモックデータを使用
- **AI再現度判定**: 現在は常に100%を返すモック実装（実際のAI判定は今後の実装）

### 🔄 オンチェーン統合

`lib/sui.ts`に実装されている関数が、実際のSui Moveコントラクトと連携します。コントラクトをデプロイし、`NEXT_PUBLIC_SUI_PACKAGE_ID`環境変数を設定すると、オンチェーン機能が有効になります。

## 📝 開発メモ

- このプロジェクトはMVP（Minimum Viable Product）です
- 実際の本番環境で使用する場合は、セキュリティとエラーハンドリングを強化してください
- AI再現度判定の実際の実装は、カメラ映像解析と姿勢推定技術を使用する必要があります

## 📄 ライセンス

このプロジェクトはハッカソン用のプロトタイプです。

## 🙏 謝辞

- ONE Championship - トレーナーとして起用しているファイター
- Sui Foundation - ブロックチェーンインフラストラクチャ
- Wallet Standard - ウォレット接続標準
