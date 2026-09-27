// Public mobile SDK configuration only. CAPI tokens belong in RevenueCat.
module.exports = ({ config }) => {
  const appID = (process.env.META_APP_ID || '').trim();
  const clientToken = (process.env.META_CLIENT_TOKEN || '').trim();
  const enabled = /^\d+$/.test(appID) && appID !== '0' && /^[a-f\d]{32}$/i.test(clientToken);
  if (process.env.EAS_BUILD_PROFILE === 'production' && !enabled) {
    throw new Error('Meta release setup incomplete: set META_APP_ID and META_CLIENT_TOKEN in the EAS production environment. See docs/meta-ads-release.md.');
  }
  if ((appID || clientToken) && !enabled) {
    throw new Error('Set both a valid numeric META_APP_ID and 32-character META_CLIENT_TOKEN.');
  }
  return {
    ...config,
    plugins: [
      ...(config.plugins || []).filter((p) => !['react-native-fbsdk-next', 'expo-tracking-transparency'].includes(Array.isArray(p) ? p[0] : p)),
      ['react-native-fbsdk-next', {
        // Inert development configuration; production rejects missing credentials.
        appID: enabled ? appID : '0',
        clientToken: enabled ? clientToken : '00000000000000000000000000000000',
        displayName: config.name,
        scheme: `fb${enabled ? appID : '0'}`,
        isAutoInitEnabled: false,
        autoLogAppEventsEnabled: false,
        advertiserIDCollectionEnabled: false,
        iosUserTrackingPermission: false,
      }],
      ['expo-tracking-transparency', {
        userTrackingPermission: 'Allow Fate & Fealty to share app activity and purchase information with Meta to measure which ads bring players to the game.',
      }],
      './plugins/withMetaConsent',
    ],
    extra: { ...config.extra, metaAds: { enabled }, legal: { termsUrl: process.env.TERMS_OF_USE_URL || null } },
  };
};
