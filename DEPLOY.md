# デプロイ手順

## Vercelへのデプロイ

### 1. GitHubリポジトリにプッシュ

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

