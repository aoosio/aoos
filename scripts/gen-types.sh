#!/usr/bin/env bash
# scripts/gen-types.sh
# Usage:
#   1) export SUPABASE_ACCESS_TOKEN="YOUR_PAT"
#   2) ./scripts/gen-types.sh <PROJECT_REF>  [optional schemas] [output file]
#      e.g. ./scripts/gen-types.sh pcbbbb123 public,auth,storage lib/database.types.ts

set -euo pipefail

PROJECT_REF="${1:-}"
SCHEMAS="${2:-public,auth,storage}"
OUT_FILE="${3:-lib/database.types.ts}"

if [[ -z "$PROJECT_REF" ]]; then
  echo "Usage: $0 <PROJECT_REF> [schemas] [out_file]"
  echo "Find Project reference in Supabase → Project Settings → General."
  exit 1
fi

# Ensure token present (from env or prompt securely)
if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  read -s -p "Paste your Supabase Personal Access Token: " SUPABASE_ACCESS_TOKEN
  echo
fi

mkdir -p "$(dirname "$OUT_FILE")"

# Generate types
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
npx --yes supabase@latest gen types typescript \
  --project-id "$PROJECT_REF" \
  --schema "$SCHEMAS" > "$OUT_FILE"

echo "✓ Types written to $OUT_FILE (project=$PROJECT_REF, schemas=$SCHEMAS)"
