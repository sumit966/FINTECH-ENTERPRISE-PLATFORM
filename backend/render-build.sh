#!/usr/bin/env bash
set -e

echo "===== Backend standalone build for Render ====="

WORK=/tmp/nexus-backend-build
rm -rf "$WORK"
mkdir -p "$WORK"

# Copy backend source into temp dir
cp -r "$OLDPWD"/* "$WORK/" || true
cp -r "$OLDPWD"/.[!.]* "$WORK/" 2>/dev/null || true

# Copy Prisma schema and scripts one level up from backend
mkdir -p "$WORK/../database/prisma"
mkdir -p "$WORK/../scripts"
cp "$OLDPWD/../database/prisma/schema.prisma" "$WORK/../database/prisma/schema.prisma"
if [ -f "$OLDPWD/../scripts/seed.ts" ]; then
  cp "$OLDPWD/../scripts/seed.ts" "$WORK/../scripts/seed.ts" || true
fi

cd "$WORK"

echo "===== npm install (standalone) ====="
npm install --no-package-lock

echo "===== prisma generate ====="
npx prisma generate --schema=../database/prisma/schema.prisma

echo "===== tsc ====="
npx tsc -p tsconfig.json

echo "===== copy dist back ====="
mkdir -p "$OLDPWD/dist"
cp -r dist/* "$OLDPWD/dist/"

echo "===== build complete ====="
