#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "==> Pulling latest code..."
git pull

echo "==> Installing dependencies..."
bun install

echo "==> Building frontend..."
bun run build

echo "==> Restarting services..."
systemctl restart pbhh.net-server
systemctl restart pbhh.net-frontend

echo "==> Done."
