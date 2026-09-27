const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

// AutoInitEnabled=false only prevents "full" initialization in Meta's Android
// SDK. Its ContentProvider still calls sdkInitialize at process startup.
// Remove that provider; our native consent bridge initializes the SDK instead.
function removeMetaStartupProvider(manifest) {
  manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.provider = (application.provider || []).filter(
    (provider) => provider.$?.['android:name'] !== 'com.facebook.internal.FacebookInitProvider',
  );
  application.provider.push({ $: {
    'android:name': 'com.facebook.internal.FacebookInitProvider',
    'tools:node': 'remove',
  } });
  return manifest;
}

module.exports = (config) => withAndroidManifest(config, (mod) => {
  mod.modResults = removeMetaStartupProvider(mod.modResults);
  return mod;
});
module.exports.removeMetaStartupProvider = removeMetaStartupProvider;
