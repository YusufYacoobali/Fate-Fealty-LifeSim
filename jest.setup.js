// Mock the native AsyncStorage module so modules that import it (appMeta,
// persistence) can be unit-tested in the Node/Jest environment.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
