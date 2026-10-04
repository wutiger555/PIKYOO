// The app lives next to the website and imports packages/core straight from the source (docs/APP.md §3).
// Its own node_modules keep React Native's exact React version apart from the website's.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../packages/core")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.disableHierarchicalLookup = true;
module.exports = config;
