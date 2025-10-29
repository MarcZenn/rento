# RENTO MONOREPO

...under construction...

## Structure



## Rento Build Guide

This project uses **custom native code** - which means:
- ❌ Expo Go is NOT supported
- ✅ Development builds required for testing
- ✅ EAS Build or local builds for production

## Quick Reference

| Task | Command | When |
|------|---------|------|
| **Development** | `npm start` | Daily development |
| **Dev Build (iOS)** | `npx expo run:ios` | After native code changes |
| **Dev Build (Android)** | `npx expo run:android` | After native code changes |
| **Production (Cloud)** | `./scripts/build-client.sh ios` | App Store release |
| **Production (Local)** | `./scripts/build-client.sh ios --method=local` | Local testing |

---

## Development Workflow

### First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Prebuild native code:**
   ```bash
   # iOS
   npm run prebuild:ios
   npx pod-install

   # Android
   npm run prebuild:android
   ```

3. **Run development build:**
   ```bash
   # iOS (requires Xcode)
   npm run ios

   # Android (requires Android Studio)
   npm run android
   ```

### Daily Development

After the first build, you can use:

```bash
npm start
# Then press 'i' for iOS or 'a' for Android
```

**When to rebuild:**
- ✅ JS/TS code changes → Hot reload (no rebuild needed)
- ⚠️  Native dependency added → Rebuild required
- ⚠️  `app.json` config changed → Rebuild required
- ⚠️  iOS/Android native code changed → Rebuild required

---

## Production Builds

### Option 1: EAS Build (Recommended)

**Advantages:**
- No Xcode or Android Studio needed locally
- Consistent build environment
- Automatic signing & provisioning
- Built in the cloud

**Setup (one-time):**
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure project (if not already done)
eas build:configure
```

**Build for production:**
```bash
# iOS
./scripts/build-client.sh ios
# or: eas build --platform ios --profile production

# Android
./scripts/build-client.sh android
# or: eas build --platform android --profile production

# Both platforms
./scripts/build-client.sh all
# or: eas build --platform all --profile production
```

**Monitor builds:**
- Dashboard: https://expo.dev/accounts/[your-account]/projects/rento/builds
- CLI: `eas build:list`

**Download artifacts:**
- iOS: `.ipa` file ready for App Store Connect
- Android: `.aab` file ready for Google Play Console

---

### Option 2: Local Build

**Advantages:**
- Faster iteration
- Full control over build process
- No dependency on Expo's servers

**Requirements:**
- **iOS**: Xcode 14+, macOS, Apple Developer account
- **Android**: Android Studio, JDK 17+

**Build for production:**
```bash
# iOS
./scripts/build-client.sh ios --method=local
# or: npx expo run:ios --configuration Release

# Android
./scripts/build-client.sh android --method=local
# or: npx expo run:android --variant release
```

**iOS - App Store submission:**
1. Open `ios/Rento.xcworkspace` in Xcode
2. Select "Any iOS Device (arm64)" as target
3. Product → Archive
4. Wait for archive to complete
5. Click "Distribute App"
6. Choose "App Store Connect"
7. Follow wizard to upload

**Android - Play Store submission:**
1. Build generates: `android/app/build/outputs/bundle/release/app-release.aab`
2. Go to Google Play Console
3. Select your app → Production → Create new release
4. Upload `app-release.aab`
5. Fill in release notes and submit

---

## Build Profiles (eas.json)

We have three build profiles configured:

### `development`
```bash
eas build --profile development --platform ios
```
- Creates development client
- For internal testing
- Includes dev tools

### `preview`
```bash
eas build --profile preview --platform android
```
- Internal distribution
- Testing before production
- APK for Android (easy install)

### `production`
```bash
eas build --profile production --platform all
```
- App Store / Play Store release
- Optimized builds
- Production signing

---

## Custom Native Code

Because we use `react-native-unistyles`, you need to rebuild when:

**Updating unistyles:**
```bash
npm install react-native-unistyles@latest

# iOS
cd ios && pod install && cd ..
npx expo run:ios

# Android
npx expo run:android
```

**Other custom native modules:**
Same process - install, prebuild, run.

---

## Troubleshooting

### "Expo Go not supported"
✅ This is expected! Use development builds instead:
```bash
npx expo run:ios
# or
npx expo run:android
```

### Build fails with "native module not found"
Run prebuild:
```bash
npx expo prebuild --clean
npx expo run:ios  # or android
```

### iOS: "No profiles for 'com.rento.app' were found"
1. Open Xcode
2. Sign in with Apple ID (Xcode → Preferences → Accounts)
3. Select project → Signing & Capabilities
4. Enable "Automatically manage signing"
5. Select your Team

### Android: "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=/Users/[username]/Library/Android/sdk
```

### EAS Build: "Invalid credentials"
```bash
# Reconfigure credentials
eas credentials

# Or delete and regenerate
eas build:configure
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm install -g eas-cli
      - run: eas build --platform all --non-interactive --no-wait
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Cost Considerations

### EAS Build Pricing (as of 2025)
- **Free tier**: Limited builds per month
- **Production**: $29/month (priority builds)
- **Enterprise**: Custom pricing

### Local Builds
- **Free** (only compute time)
- Requires local hardware/software

---

## Summary

| Build Type | Command | Use Case |
|------------|---------|----------|
| **Development** | `npx expo run:ios` | Daily coding |
| **EAS Production** | `./scripts/build-client.sh ios` | App Store release |
| **Local Production** | `./scripts/build-client.sh ios --method=local` | Advanced users |

For most teams, **EAS Build** is the recommended approach for production releases.
