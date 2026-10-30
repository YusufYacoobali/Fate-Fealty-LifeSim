import React from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { GameProvider } from '@/state/GameContext';
import { GameScreen } from '@/screens/GameScreen';
import { C } from '@/theme/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { metaAppBackgrounded, startMetaAds } from '@/services/metaAds';

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    VT323_400Regular,
  });

  React.useEffect(() => {
    if (!fontsLoaded) return;
    void startMetaAds();
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void startMetaAds();
      else if (state === 'background') metaAppBackgrounded();
    });
    return () => listener.remove();
  }, [fontsLoaded]);

  return (
    <>
      <StatusBar hidden />
      {!fontsLoaded ? (
        <View style={{ flex: 1, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.charm} size="large" />
        </View>
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider>
          <GameProvider>
            <GameScreen />
          </GameProvider>
        </SafeAreaProvider></GestureHandlerRootView>
      )}
    </>
  );
}
