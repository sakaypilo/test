const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support path alias "@" -> project root
config.resolver = config.resolver || {};
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  '@': path.resolve(__dirname),
};

// Alias react-native-maps to react-native-web-maps for web builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return context.resolveRequest(context, 'react-native-web-maps', platform);
  }
  // Fallback to the default resolver for other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;