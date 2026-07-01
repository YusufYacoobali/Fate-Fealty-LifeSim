import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { GameProvider } from '@/state/GameContext';
import { GameScreen } from '@/screens/GameScreen';
import { C } from '@/theme/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    VT323_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.charm} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <GameScreen />
      </GameProvider>
    </SafeAreaProvider>
  );
}
