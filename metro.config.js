const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the 'public' directory to the assetExts
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp');

// Add the 'public' directory to the watchFolders
config.watchFolders = [...config.watchFolders, path.resolve(__dirname, './public')];

// This might be the key: tell Metro to look for modules/assets in the public directory
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, './node_modules'),
  path.resolve(__dirname, './public'), // Add public to module resolution paths
];

module.exports = config;
