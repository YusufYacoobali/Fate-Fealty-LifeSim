const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
process.env.NODE_ENV ||= 'production';
require('@expo/env').load(root);
const base = require('../app.json').expo;
const packageJson = require('../package.json');
const errors = [];
let config;
try { config = require('../app.config')({ config: base }); }
catch (error) { errors.push(error.message); }
if (config) {
  if (!config.extra?.metaAds?.enabled) errors.push('Meta App ID and Client Token are missing.');
  const terms = config.extra?.legal?.termsUrl;
  if (!terms || !/^https:\/\//i.test(terms)) errors.push('Set TERMS_OF_USE_URL to the published HTTPS app terms page for Android.');
  const sdk = config.plugins.find((p) => Array.isArray(p) && p[0] === 'react-native-fbsdk-next')?.[1];
  if (!sdk || sdk.isAutoInitEnabled !== false || sdk.autoLogAppEventsEnabled !== false || sdk.advertiserIDCollectionEnabled !== false) {
    errors.push('Meta automatic initialization, event logging and advertising-ID collection must be disabled.');
  }
}
if (!packageJson.expo?.autolinking?.exclude?.includes('react-native-fbsdk-next')) {
  errors.push('Restore the FBSDK native autolinking exclusion; the local consent bridge owns initialization.');
}
for (const asset of [base.icon, base.ios.icon, base.android.icon, base.android.adaptiveIcon.foregroundImage]) {
  if (!fs.existsSync(path.join(root, asset))) errors.push(`Missing release asset: ${asset}`);
}
for (const error of errors) console.error(`BLOCKED: ${error}`);
console.log('Manual release gates: Meta/RevenueCat dashboard connection, privacy/store disclosures, and signed-device acceptance tests. See docs/meta-ads-release.md.');
if (errors.length) process.exitCode = 1;
else console.log('Local release configuration passed. This does not verify account setup, native signing, live tracking or store approval.');
