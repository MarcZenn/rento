#!/bin/bash
# ============================================================================
# SERVER BUILD SCRIPT
# ============================================================================
# Builds the Node.js GraphQL server for production deployment
#
# Usage:
#   ./build-server.sh [--clean]
#
# Options:
#   --clean    Remove dist directory before building
# ============================================================================

set -e  # Exit on error

CLEAN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "🚀 Building Rento Server..."
echo ""

# Clean dist directory if requested
if [ "$CLEAN" = true ]; then
  echo "🧹 Cleaning dist directory..."
  rm -rf dist
fi

# Type check server code
echo "🔍 Type checking server code..."
npx tsc --project tsconfig.json --noEmit

# Compile TypeScript to JavaScript
echo "🔨 Compiling TypeScript..."
npx tsc --project tsconfig.json

# Copy non-TypeScript files (if any)
echo "📦 Copying assets..."
# Add any necessary file copying here
# cp -r config/*.json dist/config/ || true

echo ""
echo "✅ Server build complete!"
echo "📂 Output: ./dist/"
echo ""
echo "To run the server:"
echo "  NODE_ENV=production node dist/index.js"
