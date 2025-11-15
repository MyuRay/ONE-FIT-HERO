# デプロイ手順

## Vercelへのデプロイ

### 方法1: Vercel Web UIを使用（推奨）

1. **GitHubリポジトリにプッシュ済みの場合**
   - リポジトリは既にGitHubにプッシュされています: `https://github.com/MyuRay/ONE-FIT-HERO`

2. **Vercelでプロジェクトを作成**
   - [Vercel](https://vercel.com)にアクセスしてログイン（GitHubアカウントで連携推奨）
   - "Add New Project"をクリック
   - GitHubリポジトリ `MyuRay/ONE-FIT-HERO` を検索して選択
   - プロジェクト設定：
     - **Framework Preset**: Next.js（自動検出されます）
     - **Root Directory**: `./`（デフォルト）
     - **Build Command**: `npm run build`（デフォルト）
     - **Output Directory**: `.next`（デフォルト）
     - **Install Command**: `npm install`（デフォルト）

3. **環境変数を設定**
   - Vercelのプロジェクト設定 > Environment Variables で以下を追加：
     - `NEXT_PUBLIC_SUI_NETWORK`: `devnet`（または`testnet`、`mainnet`）
     - `NEXT_PUBLIC_SUI_PACKAGE_ID`: Sui MoveコントラクトのパッケージID（デプロイ後に取得）
   - 環境変数は `Production`、`Preview`、`Development` すべてに適用することを推奨

4. **デプロイ**
   - "Deploy"ボタンをクリックしてデプロイを開始
   - デプロイが完了すると、URLが生成されます（例: `https://one-fit-hero.vercel.app`）

### 方法2: Vercel CLIを使用

1. **Vercel CLIでログイン**
   ```bash
   vercel login
   ```

2. **プロジェクトをリンク**
   ```bash
   vercel link
   ```

3. **環境変数を設定**
   ```bash
   vercel env add NEXT_PUBLIC_SUI_NETWORK
   vercel env add NEXT_PUBLIC_SUI_PACKAGE_ID
   ```

4. **プロダクション環境にデプロイ**
   ```bash
   vercel --prod
   ```

### 注意事項

- 初回デプロイ後、Sui Moveコントラクトをデプロイして`NEXT_PUBLIC_SUI_PACKAGE_ID`を設定してください
- 環境変数を設定しない場合、一部の機能が動作しません

## GitHubリポジトリへのプッシュ（完了済み）

```bash
# リモートリポジトリを追加（GitHubでリポジトリを作成後）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Vercelでプロジェクトを作成

1. [Vercel](https://vercel.com)にログイン
2. "Add New Project"をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`（デフォルト）

### 3. 環境変数を設定

Vercelのプロジェクト設定 > Environment Variables で以下を追加：

- `NEXT_PUBLIC_SUI_NETWORK`: `devnet`（または`testnet`、`mainnet`）
- `NEXT_PUBLIC_SUI_PACKAGE_ID`: Sui MoveコントラクトのパッケージID（デプロイ後に取得）

### 4. デプロイ

環境変数を設定後、"Deploy"ボタンをクリックしてデプロイを開始します。

## Sui Moveコントラクトのデプロイ

### 1. Sui CLIでコントラクトをデプロイ

```bash
cd contracts
sui client publish --gas-budget 100000000
```

### 2. パッケージIDを取得

デプロイ成功後、出力された`PackageID`をコピーして、Vercelの環境変数`NEXT_PUBLIC_SUI_PACKAGE_ID`に設定してください。

### 3. 必要なガス代

Devnetの場合は、[Sui Faucet](https://discord.com/invite/sui)からテスト用SUIを取得できます。

