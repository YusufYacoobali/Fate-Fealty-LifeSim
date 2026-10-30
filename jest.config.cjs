const path = require('node:path');

// Resolve Expo's modules-core dependency for jest-expo's native mocks even
// when npm nests it under Expo instead of hoisting it to the app's root.
const expoModulesCore = path.dirname(
  require.resolve('expo-modules-core/package.json', {
    paths: [path.dirname(require.resolve('expo/package.json'))],
  }),
).replace(/\\/g, '/');

module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-modules-core$': expoModulesCore,
    '^expo-modules-core/(.*)$': `${expoModulesCore}/$1`,
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/scripts/'],
  modulePathIgnorePatterns: ['<rootDir>/tmp/meta-native-audit/', '<rootDir>/.cache/'],
};
