# Quick Start Guide - Mobile App Development

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Sync Capacitor (copy web files to native projects):**
   ```bash
   npm run cap:sync
   ```

## 📱 Running on iOS

**Requirements:** macOS with Xcode installed

```bash
npm run cap:open:ios
```

Then in Xcode:
- Select a simulator or connected device
- Click the Play button (▶️) to run

## 🤖 Running on Android

**Requirements:** Android Studio installed

```bash
npm run cap:open:android
```

Then in Android Studio:
- Select an emulator or connected device
- Click the Run button (▶️) to run

## 🔄 After Making Changes

Whenever you update your web code (`public/` folder):

```bash
npm run cap:sync
```

Then rebuild in Xcode or Android Studio.

## 📦 Building for Production

### iOS
1. Open in Xcode: `npm run cap:open:ios`
2. Product → Archive
3. Distribute to App Store

### Android
```bash
cd android
./gradlew assembleRelease
```

APK will be in: `android/app/build/outputs/apk/release/`

## 📚 Full Documentation

See [MOBILE_BUILD.md](./MOBILE_BUILD.md) for detailed instructions.

## ⚠️ Important Notes

- **iOS development requires macOS** - You cannot build iOS apps on Windows
- **Android development works on Windows, macOS, and Linux**
- Make sure your API keys are configured in `server.js`
- For production, deploy your Express server and update API endpoints

## 🆘 Troubleshooting

**Web assets not updating?**
- Run `npm run cap:sync` after every change

**Build errors?**
- Make sure all prerequisites are installed
- Check the full guide in MOBILE_BUILD.md

**Plugins not working?**
- Ensure plugins are installed: `npm install @capacitor/[plugin-name]`
- Run `npm run cap:sync` to update native projects

