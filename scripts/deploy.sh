#!/bin/bash
# 7000 Solutions v3.0 — One-shot deployment helper
# Prereqs (run once): vercel login && gh auth login (or provide tokens)
set -e
cd "$(dirname "$0")"

echo "== 1/5 Check auth =="
vercel whoami >/dev/null 2>&1 || { echo "Not logged into Vercel. Run: vercel login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Not logged into GitHub. Run: gh auth login"; exit 1; }

echo "== 2/5 Create GitHub repo =="
if ! gh repo view imthefounder/7000-solutions-v3 >/dev/null 2>&1; then
  gh repo create 7000-solutions-v3 --public --source=. --remote=origin --push
else
  git remote add origin git@github.com:imthefounder/7000-solutions-v3.git 2>/dev/null || true
  git push -u origin main
fi

echo "== 3/5 Link Vercel project =="
vercel link --yes --project 7000-solutions-v3 2>/dev/null || vercel link --yes

echo "== 4/5 Set env vars from .env.local (if present) =="
if [ -f .env.local ]; then
  while IFS='=' read -r key val; do
    case "$key" in
      ""|\#*) continue ;;
      *) vercel env add "$key" production <<< "$val" 2>/dev/null || true ;;
    esac
  done < .env.local
fi

echo "== 5/5 Deploy =="
vercel deploy --prod
echo "Done. App is live."
