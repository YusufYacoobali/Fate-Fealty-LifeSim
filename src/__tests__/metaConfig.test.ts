const buildConfig = require('../../app.config');
const base = require('../../app.json').expo;
const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; });
beforeEach(() => {
  delete process.env.META_APP_ID; delete process.env.META_CLIENT_TOKEN; delete process.env.EAS_BUILD_PROFILE;
});

test('missing credentials disable development tracking', () => {
  expect(buildConfig({ config: base }).extra.metaAds.enabled).toBe(false);
});
test('production cannot silently ship without Meta credentials', () => {
  process.env.EAS_BUILD_PROFILE = 'production';
  expect(() => buildConfig({ config: base })).toThrow('Meta release setup incomplete');
});
test('valid configuration keeps all native automatic collection off', () => {
  process.env.META_APP_ID = '123456789'; process.env.META_CLIENT_TOKEN = 'a'.repeat(32);
  const config = buildConfig({ config: base });
  expect(config.extra.metaAds.enabled).toBe(true);
  const plugin = config.plugins.find((p: unknown[]) => p[0] === 'react-native-fbsdk-next');
  expect(plugin[1]).toMatchObject({ isAutoInitEnabled: false, autoLogAppEventsEnabled: false, advertiserIDCollectionEnabled: false });
  expect(config.extra.metaAds.clientToken).toBeUndefined();
});
