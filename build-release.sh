#!/bin/bash

echo "🚀 Building optimized release builds..."
echo ""

# Navigate to android directory
cd android

echo "📦 Building optimized APK (for direct installation)..."
./gradlew assembleRelease

echo ""
echo "📦 Building Android App Bundle (AAB - for Play Store, smallest size)..."
./gradlew bundleRelease

echo ""
echo "✅ Build complete!"
echo ""
echo "📊 Build outputs:"
echo "  APK: android/app/build/outputs/apk/release/app-release.apk"
echo "  AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "💡 Tips:"
echo "  - APK is for direct installation/testing"
echo "  - AAB is for Google Play Store (recommended - smallest download size)"
echo "  - AAB automatically splits by architecture, density, and language"
echo ""

# Show file sizes
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
    echo "📏 APK Size: $APK_SIZE"
fi

if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    AAB_SIZE=$(du -h app/build/outputs/bundle/release/app-release.aab | cut -f1)
    echo "📏 AAB Size: $AAB_SIZE"
fi
