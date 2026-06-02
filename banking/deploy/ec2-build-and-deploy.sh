#!/usr/bin/env bash
set -euo pipefail

APP_ROOT=${APP_ROOT:-/opt/erpnext-develop}
BANKING_DIR="$APP_ROOT/banking"
PUBLIC_DIR="$APP_ROOT/erpnext/public/banking"
WWW_ENTRY="$APP_ROOT/erpnext/www/banking.html"

if [[ ! -d "$BANKING_DIR" ]]; then
  echo "banking directory not found: $BANKING_DIR"
  exit 1
fi

cd "$BANKING_DIR"

if [[ ! -d node_modules ]]; then
  npm ci
fi

npm run build

if [[ ! -f "$PUBLIC_DIR/index.html" ]]; then
  echo "Build output missing: $PUBLIC_DIR/index.html"
  exit 1
fi

if [[ ! -f "$WWW_ENTRY" ]]; then
  echo "Warning: $WWW_ENTRY not found after build."
fi

echo "Banking frontend is built and deployed into ERPNext public assets."
