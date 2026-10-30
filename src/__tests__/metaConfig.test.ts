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
  expect(config.plugins).toContain('./plugins/withMetaConsent');
});

test('Android manifest removes only Meta startup and remains idempotent', () => {
  const { removeMetaStartupProvider } = require('../../plugins/withMetaConsent');
  const manifest = { manifest: { $: {}, application: [{ $: { 'android:name': '.MainApplication' }, provider: [
    { $: { 'android:name': 'com.facebook.internal.FacebookInitProvider', 'android:authorities': 'old' } },
    { $: { 'android:name': 'androidx.core.content.FileProvider', 'android:authorities': 'keep' } },
  ] }] } };
  removeMetaStartupProvider(manifest);
  const first = JSON.stringify(manifest);
  removeMetaStartupProvider(manifest);
  expect(JSON.stringify(manifest)).toBe(first);
  expect(manifest.manifest.application[0].provider).toEqual([
    { $: { 'android:name': 'androidx.core.content.FileProvider', 'android:authorities': 'keep' } },
    { $: { 'android:name': 'com.facebook.internal.FacebookInitProvider', 'tools:node': 'remove' } },
  ]);
});
