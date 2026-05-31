// OTA 2026-05-31
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo'],
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
