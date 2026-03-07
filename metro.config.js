const { getDefaultConfig: getExpoDefaultConfig } = require('expo/metro-config');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Get Expo's default config
const expoConfig = getExpoDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// Custom configuration
const customConfig = {
  resolver: {
    platforms: ['ios', 'android', 'native', 'web'],
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

// Merge all configs: React Native default -> Expo -> Custom
module.exports = mergeConfig(
  mergeConfig(getDefaultConfig(__dirname), expoConfig),
  customConfig
);