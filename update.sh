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
systemctl restart phong-server
systemctl restart phong-frontend

echo "==> Done."
