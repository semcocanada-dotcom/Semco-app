const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for PowerSync: enable package exports resolution
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'default'];

module.exports = config;
