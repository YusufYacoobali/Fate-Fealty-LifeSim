import { useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { GameState } from '@/types/game';
import { shouldPlayMoneySuccess } from '@/services/audioLogic';

const BACKGROUND_MUSIC = require('../../../assets/audio/bg.mp3');
const MONEY_SUCCESS_SOUND = require('../../../assets/audio/success.mp3');

/** Owns looping music and state-driven sound effects for the active game. */
export function useGameAudio(state: GameState, loaded: boolean): void {
  const musicPlayer = useAudioPlayer(BACKGROUND_MUSIC, { downloadFirst: true });
  const successPlayer = useAudioPlayer(MONEY_SUCCESS_SOUND, {
    downloadFirst: true,
    keepAudioSessionActive: true,
  });
  const musicStatus = useAudioPlayerStatus(musicPlayer);
  const successStatus = useAudioPlayerStatus(successPlayer);
  const previousGold = useRef(state.gold);
  const effectsReady = useRef(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch((error) => console.warn('[audio] mode setup failed', error));
  }, []);

  useEffect(() => {
    musicPlayer.loop = true;
    musicPlayer.volume = 0.3;
    if (!loaded || !state.settings.music) {
      musicPlayer.pause();
      return;
    }
    if (musicStatus.isLoaded && !musicStatus.playing) musicPlayer.play();
  }, [loaded, musicPlayer, musicStatus.isLoaded, musicStatus.playing, state.settings.music]);

  useEffect(() => {
    successPlayer.volume = 0.85;
  }, [successPlayer]);

  useEffect(() => {
    if (!loaded) {
      previousGold.current = state.gold;
      effectsReady.current = false;
      return;
    }
    if (!effectsReady.current) {
      previousGold.current = state.gold;
      effectsReady.current = true;
      return;
    }

    const shouldPlay = shouldPlayMoneySuccess(
      previousGold.current,
      state.gold,
      state.settings.soundEffects,
    );
    previousGold.current = state.gold;
    if (!shouldPlay || !successStatus.isLoaded) return;

    void successPlayer
      .seekTo(0)
      .then(() => successPlayer.play())
      .catch((error) => console.warn('[audio] success sound failed', error));
  }, [loaded, state.gold, state.settings.soundEffects, successPlayer, successStatus.isLoaded]);
}

/** Keeps frequent audio status updates inside a null child component. */
export function GameAudioController({ state, loaded }: { state: GameState; loaded: boolean }) {
  useGameAudio(state, loaded);
  return null;
}
