module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Must be last for react-native-reanimated
      'react-native-reanimated/plugin',
    ],
  };
};
