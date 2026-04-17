#!/usr/bin/env bash
set -euo pipefail

# GitHub Pages static-export build script for Medi Magic HRMS.
# This script:
#   1. Copies the GitHub-safe overlay files over server-only originals
#   2. Strips 'use server' and 'server-only' directives
#   3. Runs `next build` with the static-export config
#
# The output lands in ./out/ (Next.js default for output: 'export').
# !! This script mutates the working tree. Only run it in a disposable CI checkout. !!

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OVERLAY_DIR="$UI_DIR/github-pages"

echo "==> Applying GitHub Pages overlay from $OVERLAY_DIR"

# 1. Replace next.config
cp "$UI_DIR/next.config.github.js" "$UI_DIR/next.config.js"
# Remove the TS version so Next doesn't pick it up instead
rm -f "$UI_DIR/next.config.ts"

# 2. Copy overlay files (replace server-only modules with browser-compatible ones)
cp "$OVERLAY_DIR/middleware.ts" "$UI_DIR/middleware.ts"
cp "$OVERLAY_DIR/src/lib/supabase/server.ts" "$UI_DIR/src/lib/supabase/server.ts"
cp "$OVERLAY_DIR/src/lib/supabase/admin.ts" "$UI_DIR/src/lib/supabase/admin.ts"
cp "$OVERLAY_DIR/src/lib/supabase/middleware.ts" "$UI_DIR/src/lib/supabase/middleware.ts"

# 3. Copy page replacements
cp "$OVERLAY_DIR/app/page.tsx" "$UI_DIR/app/page.tsx"
cp "$OVERLAY_DIR/app/app/layout.tsx" "$UI_DIR/app/app/layout.tsx"
cp "$OVERLAY_DIR/app/app/page.tsx" "$UI_DIR/app/app/page.tsx"

for dir in dashboard people payroll attendance leaves admin inbox onboarding offboarding settings; do
  src="$OVERLAY_DIR/app/app/$dir/page.tsx"
  if [ -f "$src" ]; then
    cp "$src" "$UI_DIR/app/app/$dir/page.tsx"
  fi
done

# 3b. Remove dynamic routes (employee detail accessed via client-side nav only)
rm -rf "$UI_DIR/app/app/people/[id]"

# 4. (No longer deleting overlay dir — type-checking is skipped via next config)

# 5. Strip 'use server' directives from action files so they become normal modules
find "$UI_DIR/app" -name 'actions.ts' -o -name 'document-actions.ts' | while read -r f; do
  sed -i '' "s/^'use server';*$//" "$f" 2>/dev/null || sed -i "s/^'use server';*$//" "$f"
  sed -i '' 's/^"use server";*$//' "$f" 2>/dev/null || sed -i 's/^"use server";*$//' "$f"
done

# 6. Strip 'server-only' imports from any source files
find "$UI_DIR/src" "$UI_DIR/app" -name '*.ts' -o -name '*.tsx' | while read -r f; do
  sed -i '' "s/^import 'server-only';\{0,1\}$//" "$f" 2>/dev/null || sed -i "s/^import 'server-only';\{0,1\}$//" "$f"
  sed -i '' 's/^import "server-only";\{0,1\}$//' "$f" 2>/dev/null || sed -i 's/^import "server-only";\{0,1\}$//' "$f"
done

# 7. Remove revalidatePath / revalidateTag calls (no-op in static export)
find "$UI_DIR/app" -name 'actions.ts' -o -name 'document-actions.ts' | while read -r f; do
  sed -i '' "s/revalidatePath([^)]*)/void 0/g" "$f" 2>/dev/null || sed -i "s/revalidatePath([^)]*)/void 0/g" "$f"
  sed -i '' "s/revalidateTag([^)]*)/void 0/g" "$f" 2>/dev/null || sed -i "s/revalidateTag([^)]*)/void 0/g" "$f"
done

# 8. Remove API routes (not supported in static export)
rm -rf "$UI_DIR/app/api"

echo "==> Overlay applied. Running next build..."

cd "$UI_DIR"
npx next build

# 9. Fix icon/favicon paths that don't get basePath prefixed
BASE_PATH="/medimagic"
find "$UI_DIR/out" -name '*.html' -o -name '*.txt' | while read -r f; do
  sed -i '' "s|href=\"/medi-magic-logo.png\"|href=\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f" 2>/dev/null || \
  sed -i "s|href=\"/medi-magic-logo.png\"|href=\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f"
  sed -i '' "s|\"href\":\"/medi-magic-logo.png\"|\"href\":\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f" 2>/dev/null || \
  sed -i "s|\"href\":\"/medi-magic-logo.png\"|\"href\":\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f"
done

echo "==> Static export complete. Output in $UI_DIR/out/"
