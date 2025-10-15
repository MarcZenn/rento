#!/bin/bash
# ============================================================================
# GRAPHQL CODE GENERATION SCRIPT
# ============================================================================
# Generates TypeScript types from GraphQL schema and operations
#
# Usage:
#   ./scripts/codegen.sh [--watch]
#
# Options:
#   --watch    Watch for changes and regenerate automatically
# ============================================================================

set -e  # Exit on error

WATCH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --watch)
      WATCH=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "🔧 GraphQL Code Generator"
echo ""

if [ "$WATCH" = true ]; then
  echo "👀 Watching for changes..."
  npm run codegen:watch
else
  echo "🔄 Generating types..."
  npm run codegen
  echo ""
  echo "✅ GraphQL types generated!"
  echo "📂 Output: shared/types/graphql.ts"
fi
