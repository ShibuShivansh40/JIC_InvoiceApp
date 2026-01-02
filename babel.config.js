module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
      // ... any other plugins
      'react-native-worklets/plugin', // This MUST be the last entry
    ],
};
