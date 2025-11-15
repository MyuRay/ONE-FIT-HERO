# Deployment Guide

## Deploy to Vercel

### Method 1: Using Vercel Web UI (Recommended)

1. **If GitHub repository is already pushed**
   - The repository is already pushed to GitHub: `https://github.com/MyuRay/ONE-FIT-HERO`

2. **Create Project on Vercel**
   - Access [Vercel](https://vercel.com) and log in (GitHub account integration recommended)
   - Click "Add New Project"
   - Search for and select GitHub repository `MyuRay/ONE-FIT-HERO`
   - Project settings:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `./` (default)
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)
     - **Install Command**: `npm install` (default)

3. **Set Environment Variables**
   - In Vercel project settings > Environment Variables, add the following:
     - `NEXT_PUBLIC_SUI_NETWORK`: `devnet` (or `testnet`, `mainnet`)
     - `NEXT_PUBLIC_SUI_PACKAGE_ID`: Sui Move contract package ID (obtain after deployment)
   - It is recommended to apply environment variables to `Production`, `Preview`, and `Development` environments

4. **Deploy**
   - Click the "Deploy" button to start deployment
   - Once deployment completes, a URL will be generated (e.g., `https://one-fit-hero.vercel.app`)

### Method 2: Using Vercel CLI

1. **Login to Vercel CLI**
   ```bash
   vercel login
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUI_NETWORK
   vercel env add NEXT_PUBLIC_SUI_PACKAGE_ID
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Notes

- After initial deployment, deploy the Sui Move contract and set `NEXT_PUBLIC_SUI_PACKAGE_ID`
- Some features will not work if environment variables are not set

## Push to GitHub Repository (Completed)

The repository has been pushed to GitHub:
- Repository URL: `https://github.com/MyuRay/ONE-FIT-HERO`
- Branch: `main`

## Sui Move Contract Deployment

### 1. Deploy Contract with Sui CLI

```bash
cd contracts
sui client publish --gas-budget 100000000
```

### 2. Get Package ID

After successful deployment, copy the outputted `PackageID` and set it in Vercel's environment variable `NEXT_PUBLIC_SUI_PACKAGE_ID`.

### 3. Required Gas Fees

For Devnet, you can obtain test SUI from the [Sui Faucet](https://discord.com/invite/sui).

## Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUI_NETWORK` | Sui network to connect to | `devnet` |
| `NEXT_PUBLIC_SUI_PACKAGE_ID` | Sui Move contract package ID | `0x...` |

### Setting Environment Variables in Vercel

1. Go to Project Settings > Environment Variables
2. Click "Add New"
3. Enter variable name and value
4. Select environments (Production, Preview, Development)
5. Click "Save"

## Post-Deployment

After deployment:

1. Verify the application is accessible at the generated URL
2. Test wallet connection functionality
3. Deploy Sui Move contract (if not already deployed)
4. Set `NEXT_PUBLIC_SUI_PACKAGE_ID` environment variable
5. Redeploy to apply the new environment variable

## Troubleshooting

### Build Errors

- Ensure all dependencies are properly installed
- Check TypeScript compilation errors
- Verify environment variables are set correctly

### Runtime Errors

- Check browser console for errors
- Verify wallet connection is working
- Ensure Sui network RPC endpoint is accessible

### Contract Integration Issues

- Verify `NEXT_PUBLIC_SUI_PACKAGE_ID` is set correctly
- Check contract is deployed on the correct network
- Ensure wallet is connected to the same network
