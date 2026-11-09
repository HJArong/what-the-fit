const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .mjs files (required by lucide-react-native)
config.resolver.sourceExts.push('mjs');

module.exports = config;
