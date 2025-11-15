# ONE FIT HERO

A virtual fitness × training game Web DApp featuring ONE Championship fighters as "trainers".

## 🎮 Overview

This project is a fitness DApp that uses the Sui blockchain for dynamic NFTs, SBTs, and reward distribution. It features AI coaching functionality that records your movements through a camera and awards scores and tokens based on AI-determined reproduction accuracy.

### ✨ Key Features

#### 🏋️ Training System
- **Video Training**: Watch and copy train alongside ONE Championship fighter workout videos
- **AI Coaching**: Record your movements with a camera and receive real-time AI coaching messages
- **Reproduction Rate Evaluation**: Calculate final calorie consumption and earned tokens based on AI-determined reproduction rate (0-100%)
  - 100% reproduction rate: Earn calories equal to training time as both score and tokens
  - Difficulty-based calorie burn rates: Beginner (8 kcal/min), Intermediate (12 kcal/min), Advanced (18 kcal/min)
- **Calories = Tokens**: A simple system where calories burned are directly converted to earned tokens

#### 👤 Trainer System
- **Trainer NFTs**: Select ONE Championship fighters as trainers and own them as NFTs
- **Trainer Training**: Complete workouts to increase your selected trainer's score
- **Contribution System**: View your contribution score for each trainer and compare in a ranking format
- **Real-time Score Updates**: Trainer cumulative scores update in real-time (every 5 seconds)

#### 🏅 Badge & Reward System
- **Workout Badges (SBT)**: Badges are awarded for each completed workout and recorded on-chain
- **REWARDS Page**: A system to earn various badges
  - Consecutive training days badges (7, 14, 30, 60 days)
  - Weekly ranking badges (1st place, top 3)
  - Total workout count badges (10, 50, 100, 500 workouts)
  - Total score badges (10,000pt, 50,000pt, 100,000pt)
  - Contribution badges (Contribution Hero, Trainer Supporter)
- **Rarity System**: Four tiers of rarity - Common, Rare, Epic, Legendary

#### 📊 Ranking System
- **User Ranking**: Check your ranking position in weekly rankings
- **Real-time Ranking**: Display real-time score rankings by trainer
- **Prize Ticket NFTs**: Lottery ticket NFTs are awarded to top ranking users

#### 🎫 Exchange System (EXCHANGE)
- **Lottery Tickets**: Use tokens to purchase lottery tickets
  - ONE Championship event ticket lottery
  - Backstage pass lottery
  - Official T-shirt lottery
  - Training gloves lottery
  - PPV lottery
- **Goods**: Purchase sponsor discount coupons and ONE Championship official goods
  - Sponsor discount coupons (gyms, supplements, sportswear, training equipment, etc.)
  - ONE Championship official goods (towels, mugs, bottles, sticker sets)

#### 🏠 HOME Page
- **Selected Trainer**: Display currently selected trainer and contribution rate
- **My Records**: Display total training sessions, total score, consecutive training days, etc.
- **Earned Badges List**: Display up to 6 earned badges
- **Real-time Scores**: Trainer scores update in real-time

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Notifications**: React Hot Toast
- **Blockchain**: Sui (TypeScript SDK)
- **Wallet**: @mysten/wallet-kit (Wallet Standard compliant)
- **Move Contracts**: Sui Move (contracts/ directory)

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file and set the following environment variables:

```bash
# Sui Network Configuration
NEXT_PUBLIC_SUI_NETWORK=devnet  # 'devnet' | 'testnet' | 'mainnet'

# Sui Move Contract Package ID (set after deployment)
NEXT_PUBLIC_SUI_PACKAGE_ID=
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## 📁 Project Structure

```
ONE_FIT_HERO/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (includes WalletProvider)
│   ├── page.tsx           # HOME (Dashboard) page
│   ├── workout/           # Workout page
│   ├── trainers/          # Trainer selection page
│   ├── ranking/           # Ranking page
│   ├── rewards/           # Badge & rewards page
│   ├── exchange/          # Token exchange page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AICoaching.tsx     # AI Coaching (camera feature)
│   ├── WalletConnectButton.tsx
│   ├── WalletSelector.tsx
│   ├── WalletProvider.tsx
│   ├── TrainerCard.tsx
│   ├── WorkoutPanel.tsx   # Workout panel
│   ├── WorkoutVideoPlayer.tsx  # Video player
│   ├── RankingList.tsx
│   ├── PrizeTicketCard.tsx
│   ├── ExchangeMarketplace.tsx
│   └── ...
├── store/                 # Zustand store
│   └── useAppStore.ts     # Application state management
├── lib/                   # Libraries & utilities
│   └── sui.ts             # Sui Move contract integration
├── types/                 # TypeScript type definitions
│   └── index.ts
├── contracts/             # Sui Move contracts
│   ├── sources/
│   │   └── one_fit_hero.move
│   └── Move.toml
└── public/                # Static files
    ├── logo.png
    └── ...
```

## 🎯 Main Pages

### 🏠 HOME (Dashboard)
- **Selected Trainer**: Display currently selected trainer information, contribution rate, and ranking position
- **My Records**: 
  - Total training sessions (including training count for the last 7 days)
  - Total score (Your score + Trainer's score)
  - Weekly ranking position
  - Total badge count (REWARDS badges)
  - Consecutive training days (current consecutive days and longest record)
- **Earned Badges List**: Display up to 6 earned badges
- **Quick Actions**: Links to start workout, view ranking, and exchange tokens

### 🏋️ WORKOUT Page
- **Selected Trainer Display**: Display trainer information and image
- **Difficulty Selection**: Select from Beginner, Intermediate, or Advanced (different calorie burn rates)
- **Training Video**: Copy train while watching selected trainer's video
- **AI Coaching**: 
  - Record your movements with a camera
  - Display real-time AI coaching messages
  - Display real-time reproduction rate (100% grants full time-based calories)
- **Score Display**: Display real-time calorie consumption and earned tokens
- **End Workout Dialog**: Custom modal to confirm workout completion

### 👥 TRAINERS Page
- **Trainer List**: Display available trainers (Rodtang, Angela Lee, Chatri Sityodtong)
- **Trainer Card**: 
  - Trainer image
  - Stats (Power, Spirit, Flexibility)
  - Your contribution score
  - Trainer's cumulative score
  - Ranking position
- **Trainer Selection**: Click card to select a trainer

### 📊 RANKING Page
- **User Ranking**: 
  - Display user ranking positions in weekly rankings
  - Display each user's total score and training count
- **Real-time Ranking**: 
  - Real-time score rankings by trainer
  - Display each trainer's contribution score as a bar
  - Display trainer images and ranking positions

### 🏅 REWARDS Page
- **Badge List**: Display various badges that can be earned through different conditions
- **Badge Categories**:
  - Consecutive training days badges
  - Weekly ranking badges
  - Total workout count badges
  - Total score badges
  - Contribution badges
- **Badge Details**: 
  - Color-coding by rarity
  - Progress bar display (when achievement conditions exist)
  - Display earned/unearned status

### 🎫 EXCHANGE Page
- **Token Balance**: Display current token holdings
- **Lottery Tickets**: 
  - Apply for ONE Championship-related lottery tickets
  - Tokens required for application
- **Goods**: 
  - Sponsor discount coupons (gyms, supplements, sportswear, etc.)
  - ONE Championship official goods
  - Tokens required for purchase
- **Exchange History**: View past exchange history

## 🔗 Wallet Connection

This app can connect to actual Sui wallets.

### Prerequisites

1. **Install Sui Wallet**
   - **Sui Wallet**: [Chrome Extension](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)
   - **Slush Wallet**: Install from [official website](https://slushwallet.com)
   - Other Wallet Standard-compliant Sui wallets are automatically detected

2. **Setup Wallet**
   - Open selected wallet and create or import a wallet
   - Prepare Devnet/Testnet/Mainnet account

### Usage

1. Launch the app
2. Click "Connect Wallet" button
3. Select wallet from wallet selection screen
4. Approve connection in wallet extension

After connection, your wallet address will be displayed and all features become available.

### Supported Wallets

- **Sui Wallet**: Official Chrome extension
- **Slush Wallet**: Official wallet
- Other Wallet Standard-compliant Sui wallets (auto-detected)

## 🎮 Gameplay Flow

1. **Connect Wallet**: Connect Sui wallet
2. **Select Trainer**: Select trainer on TRAINERS page
3. **Start Workout**: Select difficulty and start training on WORKOUT page
4. **AI Coaching**: Record your movements with camera and receive AI coaching messages
5. **Reproduction Rate Evaluation**: Earn scores and tokens based on AI-determined reproduction rate
6. **Earn Badges**: Badges are automatically awarded when conditions are met
7. **Check Ranking**: View your ranking position and trainer rankings
8. **Exchange Tokens**: Use earned tokens to purchase lottery tickets or goods

## 📚 Sui Move Contracts

Move contracts for production are located in the `contracts/` directory.

### Implemented Move Functions

```move
// Trainer NFT related
public entry fun mint_trainer_nft(ctx: &mut TxContext, trainer_id: u8, name: vector<u8>): Trainer
public entry fun increase_trainer_stats(trainer: &mut Trainer, power: u64, spirit: u64, flexibility: u64, ctx: &TxContext)
public entry fun update_trainer_scores(trainer: &mut Trainer, user_score: u64, trainer_score: u64, ctx: &TxContext)

// Workout Badge (SBT) related
public entry fun mint_workout_badge(difficulty: u8, user_score: u64, trainer_score: u64, ctx: &mut TxContext): WorkoutBadge

// Token related
public entry fun init_token_balance(ctx: &mut TxContext): TokenBalance
public entry fun add_tokens(balance: &mut TokenBalance, amount: u64, ctx: &TxContext)
public entry fun spend_tokens(balance: &mut TokenBalance, amount: u64, ctx: &TxContext)

// Prize Ticket related
public entry fun mint_prize_ticket(week: vector<u8>, rank: u64, ctx: &mut TxContext): PrizeTicket

// Exchange related
public entry fun exchange_item(balance: &mut TokenBalance, item_id: u8, item_type: u8, item_name: vector<u8>, token_cost: u64, ctx: &mut TxContext): ExchangeItem

// Integrated function
public entry fun complete_workout_session(trainer: &mut Trainer, balance: &mut TokenBalance, difficulty: u8, user_score: u64, trainer_score: u64, ctx: &mut TxContext)
```

### Deploy Contract

1. Build Move contract
   ```bash
   cd contracts
   sui move build
   ```

2. Deploy contract
   ```bash
   sui client publish --gas-budget 100000000
   ```

3. Set package ID in environment variables
   ```bash
   # .env.local
   NEXT_PUBLIC_SUI_PACKAGE_ID=0x...
   ```

## 🚀 Deployment

This app can be deployed to Vercel.

### Deploy to Vercel

1. Push to GitHub repository
2. Create project on [Vercel](https://vercel.com)
3. Set environment variables (`NEXT_PUBLIC_SUI_NETWORK`, `NEXT_PUBLIC_SUI_PACKAGE_ID`)
4. Deploy

See `DEPLOY.md` for detailed instructions.

## ⚙️ Current Implementation Status

### ✅ Implemented Features

- ✅ Sui Wallet connection (Wallet Standard compliant)
- ✅ Trainer selection system
- ✅ Video training functionality
- ✅ AI Coaching (camera feature, reproduction rate evaluation)
- ✅ Calorie-based token earning system
- ✅ Badge system (REWARDS page)
- ✅ Ranking system (User ranking + Real-time ranking)
- ✅ Token exchange system (EXCHANGE page)
- ✅ Trainer contribution system
- ✅ Sui Move contracts (contracts/ directory)

### 📝 Mock Implementation (In Development)

Currently, some features use mock data:

- **Rankings**: Uses mock data (planned integration with on-chain data)
- **Badge Progress**: Uses mock data from HOME page
- **AI Reproduction Rate Evaluation**: Currently returns 100% mock implementation (actual AI evaluation planned for future implementation)

### 🔄 On-chain Integration

Functions implemented in `lib/sui.ts` integrate with actual Sui Move contracts. Once you deploy the contract and set the `NEXT_PUBLIC_SUI_PACKAGE_ID` environment variable, on-chain features become active.

## 📝 Development Notes

- This project is an MVP (Minimum Viable Product)
- When using in actual production, strengthen security and error handling
- Actual implementation of AI reproduction rate evaluation requires camera image analysis and pose estimation technology

## 📄 License

This project is a prototype for hackathon purposes.

## 🙏 Acknowledgments

- ONE Championship - Fighters featured as trainers
- Sui Foundation - Blockchain infrastructure
- Wallet Standard - Wallet connection standard
