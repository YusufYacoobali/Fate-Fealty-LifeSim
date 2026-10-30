import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';

export const PRIVACY_POLICY_URL = 'https://doc-hosting.flycricket.io/fate-fealty-life-sim-privacy-policy/311360d4-bd3f-48be-8077-1df1964ed343/privacy';
export const TERMS_OF_USE_URL: string | null = Constants.expoConfig?.extra?.legal?.termsUrl
  || (Platform.OS === 'ios' ? 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' : null);

export async function openLegalLink(url: string): Promise<void> {
  try { await Linking.openURL(url); }
  catch { Alert.alert('Could not open link', 'Please check your connection and try again.'); }
}
