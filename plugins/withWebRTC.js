const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withWebRTC = (config) => {
  // Add Android permissions
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure uses-permission array exists
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ];

    permissions.forEach((permission) => {
      if (!androidManifest['uses-permission'].find((p) => p.$['android:name'] === permission)) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Add camera and microphone features
    if (!androidManifest['uses-feature']) {
      androidManifest['uses-feature'] = [];
    }

    const features = [
      { name: 'android.hardware.camera', required: 'false' },
      { name: 'android.hardware.camera.autofocus', required: 'false' },
      { name: 'android.hardware.microphone', required: 'false' },
    ];

    features.forEach((feature) => {
      if (!androidManifest['uses-feature'].find((f) => f.$['android:name'] === feature.name)) {
        androidManifest['uses-feature'].push({
          $: { 'android:name': feature.name, 'android:required': feature.required },
        });
      }
    });

    return config;
  });

  // Add iOS permissions
  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      'This app needs access to your camera for video calls.';
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      'This app needs access to your microphone for voice and video calls.';

    return config;
  });

  return config;
};

module.exports = withWebRTC;
