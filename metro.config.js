const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v10+ uses the "exports" field in package.json.
// Metro needs this flag to resolve those correctly.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
