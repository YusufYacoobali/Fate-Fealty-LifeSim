import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
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
  const previousRank = useRef(state.rankIdx);
  const previousPlayerId = useRef(state.playerCharacterId);
  const previousPendingId = useRef(state.pendingEvent?.eventId);
  const previousHistoryId = useRef(state.world.history.at(-1)?.id);
  const effectsReady = useRef(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [audioModeReady, setAudioModeReady] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') setAudioModeReady(false);
      setAppState(nextState);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (appState !== 'active') return undefined;

    let cancelled = false;
    void setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    })
      .then(() => {
        if (!cancelled) setAudioModeReady(true);
      })
      .catch((error) => {
        if (!cancelled) console.warn('[audio] mode setup failed', error);
      });

    return () => {
      cancelled = true;
    };
  }, [appState]);

  useEffect(() => {
    musicPlayer.loop = true;
    musicPlayer.volume = 0.3;
    const shouldPlayMusic = loaded
      && state.settings.music
      && appState === 'active'
      && audioModeReady;

    if (!shouldPlayMusic) {
      if (musicStatus.playing) {
        try {
          musicPlayer.pause();
        } catch (error) {
          console.warn('[audio] music pause failed', error);
        }
      }
      return;
    }
    if (musicStatus.isLoaded && !musicStatus.playing) {
      try {
        musicPlayer.play();
      } catch (error) {
        console.warn('[audio] music playback failed', error);
      }
    }
  }, [appState, audioModeReady, loaded, musicPlayer, musicStatus.isLoaded, musicStatus.playing, state.settings.music]);

  useEffect(() => {
    successPlayer.volume = 0.85;
  }, [successPlayer]);

  useEffect(() => {
    if (!loaded) {
      previousGold.current = state.gold;
      previousRank.current = state.rankIdx;
      previousPlayerId.current = state.playerCharacterId;
      previousPendingId.current = state.pendingEvent?.eventId;
      previousHistoryId.current = state.world.history.at(-1)?.id;
      effectsReady.current = false;
      return;
    }
    if (!effectsReady.current) {
      previousGold.current = state.gold;
      previousRank.current = state.rankIdx;
      previousPlayerId.current = state.playerCharacterId;
      previousPendingId.current = state.pendingEvent?.eventId;
      previousHistoryId.current = state.world.history.at(-1)?.id;
      effectsReady.current = true;
      return;
    }

    const shouldPlay = shouldPlayMoneySuccess(
      previousGold.current,
      state.gold,
      state.settings.soundEffects,
    );
    const pendingId = state.pendingEvent?.eventId;
    const story = state.pendingEvent?.storyInstanceId ? state.world.activeStories.find((item) => item.id === state.pendingEvent?.storyInstanceId) : undefined;
    const latestHistory = state.world.history.at(-1);
    const milestone = state.settings.soundEffects && (
      state.rankIdx > previousRank.current
      || state.playerCharacterId !== previousPlayerId.current
      || Boolean(pendingId && pendingId !== previousPendingId.current && (pendingId === 'system_legal_trial' || story?.scale === 'major'))
      || Boolean(latestHistory && latestHistory.id !== previousHistoryId.current && ['pregnancy', 'adoption', 'wardship'].includes(latestHistory.type))
    );
    previousGold.current = state.gold;
    previousRank.current = state.rankIdx;
    previousPlayerId.current = state.playerCharacterId;
    previousPendingId.current = pendingId;
    previousHistoryId.current = latestHistory?.id;
    if (
      (!shouldPlay && !milestone)
      || !successStatus.isLoaded
      || appState !== 'active'
      || !audioModeReady
    ) return;

    void successPlayer
      .seekTo(0)
      .then(() => successPlayer.play())
      .catch((error) => console.warn('[audio] success sound failed', error));
  }, [appState, audioModeReady, loaded, state.gold, state.rankIdx, state.playerCharacterId, state.pendingEvent?.eventId, state.pendingEvent?.storyInstanceId, state.world.activeStories, state.world.history, state.settings.soundEffects, successPlayer, successStatus.isLoaded]);
}

/** Keeps frequent audio status updates inside a null child component. */
export function GameAudioController({ state, loaded }: { state: GameState; loaded: boolean }) {
  useGameAudio(state, loaded);
  return null;
}
