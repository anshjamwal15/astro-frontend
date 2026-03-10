# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Expo modules - prevent obfuscation
-keep class expo.modules.** { *; }
-keep interface expo.modules.** { *; }
-keepclassmembers class * {
  @expo.modules.kotlin.** *;
}

# Expo Image Picker
-keep class expo.modules.imagepicker.** { *; }

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# Add any project specific keep options here:

# Optimization flags
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Remove console.log in JavaScript (handled by Hermes)
-assumenosideeffects class * {
    *** console.log(...);
    *** console.debug(...);
    *** console.info(...);
}

