#!/usr/bin/env bash
set -euo pipefail

# Aksaraku deploy script — run after `wrangler login` from laptop
# Usage: bash deploy.sh

echo "🔐 Checking Cloudflare auth..."
npx wrangler whoami 2>/dev/null | grep -q "Logged" || {
  echo "❌ Not authenticated. Run: npx wrangler login"
  exit 1
}

echo "🏗️ Building..."
NODE_ENV=production bun run build

echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=aksaraku

echo "✅ Done. Check: https://aksaraku.pages.dev"
