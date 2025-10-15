#!/bin/bash
# ============================================================================
# CLIENT BUILD SCRIPT
# ============================================================================
# Builds the React Native client application for production
#
# IMPORTANT: This project uses custom native code (react-native-unistyles)
# so Expo Go is NOT supported. We use development builds or EAS Build.
#
# Usage:
#   ./scripts/build-client.sh [platform] [--method=eas|local]
#
# Examples:
#   ./scripts/build-client.sh android              # EAS Build (cloud)
#   ./scripts/build-client.sh ios --method=local   # Local build
#   ./scripts/build-client.sh web                  # Web export
#   ./scripts/build-client.sh all                  # All platforms via EAS
# ============================================================================

set -e  # Exit on error

PLATFORM=${1:-"all"}
METHOD="eas"  # Default to EAS Build (recommended)

# Parse options
for arg in "$@"; do
  case $arg in
    --method=*)
      METHOD="${arg#*=}"
      shift
      ;;
  esac
done

echo "🚀 Building Rento Client..."
echo "📱 Platform: $PLATFORM"
echo "🔧 Build Method: $METHOD"
echo ""

# Type check client code
echo "🔍 Type checking client code..."
npx tsc --project client/tsconfig.json --noEmit

# Run linter
echo "🧹 Running linter..."
npm run lint

# Build based on platform and method
if [ "$METHOD" = "eas" ]; then
  # ============================================================================
  # EAS BUILD (Cloud Build - Recommended)
  # ============================================================================
  # Builds in Expo's cloud infrastructure
  # - No need for Xcode or Android Studio locally
  # - Consistent build environment
  # - Automatic signing and provisioning
  # - Outputs ready-to-submit binaries
  #
  # Prerequisites:
  #   1. Install EAS CLI: npm install -g eas-cli
  #   2. Login: eas login
  #   3. Configure: eas build:configure
  # ============================================================================

  echo "☁️  Using EAS Build (cloud build service)"
  echo ""

  case $PLATFORM in
    android)
      echo "🤖 Building Android app with EAS..."
      eas build --platform android --profile production
      ;;
    ios)
      echo "🍎 Building iOS app with EAS..."
      eas build --platform ios --profile production
      ;;
    web)
      echo "🌐 Building web app..."
      npx expo export:web
      ;;
    all)
      echo "📦 Building all platforms with EAS..."
      eas build --platform all --profile production
      ;;
    *)
      echo "❌ Unknown platform: $PLATFORM"
      echo "Valid options: android, ios, web, all"
      exit 1
      ;;
  esac

elif [ "$METHOD" = "local" ]; then
  # ============================================================================
  # LOCAL BUILD
  # ============================================================================
  # Builds on your local machine
  # - Requires Xcode (for iOS) or Android Studio (for Android)
  # - Faster iteration for development
  # - Uses your local signing certificates
  #
  # Prerequisites:
  #   iOS:     Xcode 14+, CocoaPods
  #   Android: Android Studio, JDK 17+
  # ============================================================================

  echo "💻 Using local build"
  echo ""

  case $PLATFORM in
    android)
      echo "🤖 Building Android app locally..."
      echo "⚠️  This requires Android Studio and configured signing keys"

      # Generate release APK/AAB
      npx expo run:android --variant release

      echo ""
      echo "📦 Android build outputs:"
      echo "   APK:  android/app/build/outputs/apk/release/app-release.apk"
      echo "   AAB:  android/app/build/outputs/bundle/release/app-release.aab"
      ;;
    ios)
      echo "🍎 Building iOS app locally..."
      echo "⚠️  This requires Xcode and configured signing certificates"

      # Generate release build
      npx expo run:ios --configuration Release

      echo ""
      echo "📦 iOS build output:"
      echo "   Archive: ios/build/Build/Products/Release-iphoneos/"
      echo "   Next: Archive in Xcode for App Store submission"
      ;;
    web)
      echo "🌐 Building web app..."
      npx expo export:web
      ;;
    all)
      echo "❌ Local build of all platforms not supported"
      echo "    Build platforms individually or use EAS Build"
      exit 1
      ;;
    *)
      echo "❌ Unknown platform: $PLATFORM"
      echo "Valid options: android, ios, web, all"
      exit 1
      ;;
  esac

else
  echo "❌ Unknown build method: $METHOD"
  echo "Valid methods: eas, local"
  exit 1
fi

echo ""
echo "✅ Client build complete!"
echo ""

# Platform-specific next steps
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo "📱 Android Next Steps:"
  if [ "$METHOD" = "eas" ]; then
    echo "   1. Download .aab from EAS Build dashboard"
    echo "   2. Upload to Google Play Console"
    echo "   3. Submit for review"
  else
    echo "   1. Upload android/app/build/outputs/bundle/release/app-release.aab"
    echo "   2. to Google Play Console"
    echo "   3. Submit for review"
  fi
  echo ""
fi

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo "🍎 iOS Next Steps:"
  if [ "$METHOD" = "eas" ]; then
    echo "   1. Download .ipa from EAS Build dashboard"
    echo "   2. Upload to App Store Connect (via Transporter or Xcode)"
    echo "   3. Submit for review"
  else
    echo "   1. Open ios/Rento.xcworkspace in Xcode"
    echo "   2. Product > Archive"
    echo "   3. Distribute to App Store"
  fi
  echo ""
fi

if [ "$PLATFORM" = "web" ] || [ "$PLATFORM" = "all" ]; then
  echo "🌐 Web Next Steps:"
  echo "   1. Deploy dist/ folder to hosting service:"
  echo "      - Vercel: vercel --prod"
  echo "      - Netlify: netlify deploy --prod --dir=dist"
  echo "      - AWS S3: aws s3 sync dist/ s3://your-bucket/"
  echo ""
fi
