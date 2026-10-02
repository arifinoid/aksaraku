#!/usr/bin/env bash
set -euo pipefail

# Aksaraku deploy script — Cloudflare Pages
#
# Auth: one of
#   1. `npx wrangler login` (interactive, from a machine with a browser)
#   2. CLOUDFLARE_API_TOKEN env var (headless / CI / remote VM)
#
# Usage:
#   bash deploy.sh              # build + deploy to production
#   SKIP_BUILD=1 bash deploy.sh # deploy existing dist/ without rebuilding

PROJECT_NAME="aksaraku"

echo "🔐 Checking Cloudflare auth..."

AUTH_OK=0
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "   Using CLOUDFLARE_API_TOKEN from environment"
  AUTH_OK=1
else
  if npx wrangler whoami 2>/dev/null | grep -q "Logged"; then
    echo "   Using wrangler OAuth session"
    AUTH_OK=1
  fi
fi

if [[ "$AUTH_OK" -ne 1 ]]; then
  echo "❌ Not authenticated. Choose one:"
  echo "   a) npx wrangler login           # interactive (browser)"
  echo "   b) npx wrangler login --device  # remote SSH / container (visit URL + code)"
  echo "   c) export CLOUDFLARE_API_TOKEN=... && bash deploy.sh"
  exit 1
fi

echo "👤 Authenticated as:"
npx wrangler whoami 2>/dev/null | sed -n '/You are logged in/,/^$/p' || true

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "🏗️  Building..."
  NODE_ENV=production bun run build
else
  echo "⏭️  SKIP_BUILD=1 — using existing dist/"
fi

if [[ ! -f "dist/index.html" ]]; then
  echo "❌ dist/index.html missing. Run the build first."
  exit 1
fi

echo "🚀 Deploying to Cloudflare Pages (project: ${PROJECT_NAME})..."

# Ensure the Pages project exists (first deploy only).
if ! npx wrangler pages project list 2>/dev/null | grep -q "${PROJECT_NAME}"; then
  echo "   Creating Pages project ${PROJECT_NAME} (first deploy)..."
  npx wrangler pages project create "${PROJECT_NAME}" --production-branch=main
fi

npx wrangler pages deploy dist --project-name="${PROJECT_NAME}" --branch=main

echo "✅ Done. Check: https://${PROJECT_NAME}.pages.dev"
