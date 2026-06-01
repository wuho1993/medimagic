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
  if [ -d "$OVERLAY_DIR/app/app/$dir" ]; then
    src="$OVERLAY_DIR/app/app/$dir/page.tsx"
    if [ -f "$src" ]; then
      cp "$src" "$UI_DIR/app/app/$dir/page.tsx"
    fi
    # Copy action overlays if they exist
    src_actions="$OVERLAY_DIR/app/app/$dir/actions.ts"
    if [ -f "$src_actions" ]; then
      cp "$src_actions" "$UI_DIR/app/app/$dir/actions.ts"
    fi
    # Copy any additional overlay components (e.g. ClientUserManagementPanel.tsx)
    find "$OVERLAY_DIR/app/app/$dir" -maxdepth 1 \( -name '*.tsx' -o -name '*.ts' \) 2>/dev/null | while read -r extra; do
      basename_f="$(basename "$extra")"
      if [ "$basename_f" != "page.tsx" ] && [ "$basename_f" != "actions.ts" ]; then
        cp "$extra" "$UI_DIR/app/app/$dir/$basename_f"
      fi
    done
  fi
done

# Copy nested static-export page overlays.
if [ -f "$OVERLAY_DIR/app/app/payroll/average-wages/page.tsx" ]; then
  mkdir -p "$UI_DIR/app/app/payroll/average-wages"
  cp "$OVERLAY_DIR/app/app/payroll/average-wages/page.tsx" "$UI_DIR/app/app/payroll/average-wages/page.tsx"
fi

# 3b. Remove dynamic routes (using query params instead for static export)
rm -rf "$UI_DIR/app/app/people/[employeeCode]"
rm -rf "$UI_DIR/app/app/people/[id]"

# 3c. Rewrite employee profile links: /app/people/${code} → /app/people?id=${code}
# Dynamic routes don't work in static export, so we use query params instead.
find "$UI_DIR/src" -name '*.tsx' -o -name '*.ts' | while read -r f; do
  sed -i '' 's|/app/people/\${|/app/people?id=\${|g' "$f" 2>/dev/null || \
  sed -i 's|/app/people/\${|/app/people?id=\${|g' "$f"
done

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
  # Also remove the import line (dead import can cause issues in static export)
  sed -i '' "/^import { revalidatePath } from/d" "$f" 2>/dev/null || sed -i "/^import { revalidatePath } from/d" "$f"
  sed -i '' "/^import { revalidateTag } from/d" "$f" 2>/dev/null || sed -i "/^import { revalidateTag } from/d" "$f"
  sed -i '' "/^import { revalidatePath, revalidateTag } from/d" "$f" 2>/dev/null || sed -i "/^import { revalidatePath, revalidateTag } from/d" "$f"
done

# 8. Remove API routes (not supported in static export)
rm -rf "$UI_DIR/app/api"

# 8b. Fix payroll actions — remove Node-only fs/path imports and stub exportPayslipWorkbook
PAYROLL_ACTIONS="$UI_DIR/app/app/payroll/actions.ts"
if [ -f "$PAYROLL_ACTIONS" ]; then
  sed -i '' "s|^import { promises as fs } from 'fs';||" "$PAYROLL_ACTIONS" 2>/dev/null || \
  sed -i "s|^import { promises as fs } from 'fs';||" "$PAYROLL_ACTIONS"
  sed -i '' "s|^import \* as path from 'path';||" "$PAYROLL_ACTIONS" 2>/dev/null || \
  sed -i "s|^import \* as path from 'path';||" "$PAYROLL_ACTIONS"
  sed -i '' "s|^import { Workbook } from 'exceljs';|const Workbook = null;|" "$PAYROLL_ACTIONS" 2>/dev/null || \
  sed -i "s|^import { Workbook } from 'exceljs';|const Workbook = null;|" "$PAYROLL_ACTIONS"
fi

# 8c. Fix metadata icon paths — prefix basePath BEFORE build so RSC payload is correct
BASE_PATH="/medimagic"
APP_VERSION="1.10"
BUILD_VERSION="${APP_VERSION}"
export NEXT_PUBLIC_BUILD_VERSION="$BUILD_VERSION"
mkdir -p "$UI_DIR/public"
printf '{"version":"%s","commit":"%s"}\n' "$BUILD_VERSION" "${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || date +%s)}" > "$UI_DIR/public/build-version.json"

LAYOUT_FILE="$UI_DIR/app/layout.tsx"
if [ -f "$LAYOUT_FILE" ]; then
  sed -i '' "s|'/medi-magic-logo.png'|'${BASE_PATH}/medi-magic-logo.png'|g" "$LAYOUT_FILE" 2>/dev/null || \
  sed -i "s|'/medi-magic-logo.png'|'${BASE_PATH}/medi-magic-logo.png'|g" "$LAYOUT_FILE"
fi

echo "==> Overlay applied. Running next build..."

cd "$UI_DIR"
npx next build

# 9. Fix any remaining icon/favicon paths in HTML that weren't caught by pre-build fix
find "$UI_DIR/out" -name '*.html' -o -name '*.txt' | while read -r f; do
  sed -i '' "s|href=\"/medi-magic-logo.png\"|href=\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f" 2>/dev/null || \
  sed -i "s|href=\"/medi-magic-logo.png\"|href=\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f"
  # Fix escaped JSON in RSC payload: \"href\":\"/medi-magic-logo.png\"
  sed -i '' 's|\\\"href\\\":\\\"/medi-magic-logo.png\\\"|\\\"href\\\":\\\"'"${BASE_PATH}"'/medi-magic-logo.png\\\"|g' "$f" 2>/dev/null || \
  sed -i 's|\\\"href\\\":\\\"/medi-magic-logo.png\\\"|\\\"href\\\":\\\"'"${BASE_PATH}"'/medi-magic-logo.png\\\"|g' "$f"
done

# 9b. Fix logo src in JS bundles — next/image with unoptimized doesn't always prefix basePath
find "$UI_DIR/out/_next" -name '*.js' | while read -r f; do
  sed -i '' "s|\"/medi-magic-logo.png\"|\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f" 2>/dev/null || \
  sed -i "s|\"/medi-magic-logo.png\"|\"${BASE_PATH}/medi-magic-logo.png\"|g" "$f"
done

# 9c. Keep a legacy alias for the payroll page chunk.
# Some browser/intranet caches still request the old chunk filename.
PAYROLL_CHUNK_DIR="$UI_DIR/out/_next/static/chunks/app/app/payroll"
if [ -d "$PAYROLL_CHUNK_DIR" ]; then
  latest_payroll_chunk="$(ls -t "$PAYROLL_CHUNK_DIR"/page-*.js 2>/dev/null | head -n 1 || true)"
  if [ -n "$latest_payroll_chunk" ]; then
    cp "$latest_payroll_chunk" "$PAYROLL_CHUNK_DIR/page-6e32ac77bd35c291.js"
  fi
fi

# 10. Create 404.html for SPA-style client-side routing on GitHub Pages
# When a user navigates directly to a dynamic route (e.g. /app/people/SF001),
# GitHub Pages serves 404.html which loads the app shell, then client-side
# routing takes over.
if [ -f "$UI_DIR/out/index.html" ]; then
  cp "$UI_DIR/out/index.html" "$UI_DIR/out/404.html"
  echo "==> Created 404.html for SPA fallback routing"
fi

echo "==> Static export complete. Output in $UI_DIR/out/"
