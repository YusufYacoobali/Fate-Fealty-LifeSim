import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { GameAudioController } from '@/state/hooks/useGameAudio';
import { GameState } from '@/types/game';
import { makeState } from './helpers';

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(),
  useAudioPlayer: jest.fn(),
  useAudioPlayerStatus: jest.fn(),
}));

const mockAudioMode = setAudioModeAsync as jest.MockedFunction<typeof setAudioModeAsync>;
const player = { seekTo: jest.fn(), play: jest.fn(), volume: 0 };
const remove = jest.fn();
const initialAppState = AppState.currentState;
let changeAppState: (state: AppStateStatus) => void;
let root: ReactTestRenderer | undefined;
let state: GameState;

async function render() {
  await act(async () => {
    const element = <GameAudioController state={state} loaded />;
    if (root) root.update(element);
    else root = create(element);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  root = undefined;
  state = makeState();
  state.settings.soundEffects = true;
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    changeAppState = handler;
    return { remove };
  });
  mockAudioMode.mockResolvedValue(undefined);
  (useAudioPlayer as jest.Mock).mockReturnValue(player);
  (useAudioPlayerStatus as jest.Mock).mockReturnValue({ isLoaded: true });
  player.seekTo.mockResolvedValue(undefined);
});

afterEach(() => {
  act(() => root?.unmount());
  AppState.currentState = initialAppState;
  jest.restoreAllMocks();
});

test('loads only the success cue and does not start audio on launch', async () => {
  await render();
  expect(useAudioPlayer).toHaveBeenCalledWith(require('../../assets/audio/success.mp3'), {
    downloadFirst: true,
    keepAudioSessionActive: true,
  });
  expect((useAudioPlayer as jest.Mock).mock.calls.every(([, options]) => options.keepAudioSessionActive === true)).toBe(true);
  expect(mockAudioMode).toHaveBeenCalledWith(expect.objectContaining({
    playsInSilentMode: false,
    shouldPlayInBackground: false,
  }));
  expect(player.play).not.toHaveBeenCalled();
});

test('plays an enabled success cue for a gold gain after audio is ready', async () => {
  await render();
  state = { ...state, gold: state.gold + 6 };
  await render();
  expect(player.seekTo).toHaveBeenCalledWith(0);
  expect(player.play).toHaveBeenCalledTimes(1);
});

test('suppresses background gains and resumes cues for new foreground gains', async () => {
  await render();
  await act(async () => { changeAppState('background'); });
  state = { ...state, gold: state.gold + 6 };
  await render();
  expect(player.play).not.toHaveBeenCalled();
  await act(async () => { changeAppState('active'); });
  expect(mockAudioMode).toHaveBeenCalledTimes(2);
  expect(player.play).not.toHaveBeenCalled();
  state = { ...state, gold: state.gold + 6 };
  await render();
  expect(player.play).toHaveBeenCalledTimes(1);
  act(() => root?.unmount());
  root = undefined;
  expect(remove).toHaveBeenCalledTimes(1);
});

test('waits for audio mode setup without replaying gains from before readiness', async () => {
  let ready!: () => void;
  mockAudioMode.mockImplementationOnce(() => new Promise<void>((resolve) => { ready = resolve; }));
  await render();
  state = { ...state, gold: state.gold + 6 };
  await render();
  expect(player.play).not.toHaveBeenCalled();
  await act(async () => { ready(); });
  expect(player.play).not.toHaveBeenCalled();
  state = { ...state, gold: state.gold + 6 };
  await render();
  expect(player.play).toHaveBeenCalledTimes(1);
});

test('respects the sound effects setting', async () => {
  await render();
  state = { ...state, gold: state.gold + 6, settings: { ...state.settings, soundEffects: false } };
  await render();
  expect(player.play).not.toHaveBeenCalled();
});
